document.addEventListener('DOMContentLoaded', async () => {
  let url = new URL(window.location.href);
  let authed = url.searchParams.get('authed');

  function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  let token = JSON.parse(decodeURIComponent(getCookieValue('auth_token')));
  if(!token) token = {access_token:'undefined'};
  
  if ((authed == 'true') && (token['access_token'] != 'undefined')) {
    let userData = '';
    let response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token['access_token']}`
      }
    });
    if (response.ok) {
      userData = await response.json()
      try {
        const script = document.createElement('script');
        script.src = '/app/script.js';
        await new Promise((resolve, reject) => {
          script.onload = () => {
            document.cookie = "auth_token=" + encodeURIComponent(JSON.stringify(token)) + "; max-age=86400";
            resolve();
          };
          script.onerror = () => {
            document.cookie = "auth_token=; max-age=0";
            window.location.href = '/error?status=500';
            reject(new Error('Script load error'));
          };
          document.head.appendChild(script);
        });
      } catch(e) {
        window.location.href = '/error?status=500&msg='+encodedURIComponent(e.message);
      }
    } else {
      window.location.href = '/error?status=403';
    }
  } else {
    const authBackground = document.getElementById('authbackground');
    if (authBackground) {
      authBackground.classList.remove('authed');
    } else {
      console.error("Element with ID 'authbackground' not found.");
    }
    document.cookie = "auth_token=; max-age=0";
  }
});
