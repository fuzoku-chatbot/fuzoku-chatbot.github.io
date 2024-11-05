let userData = {};
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

  document.getEelementById('scriptload-background').classList.remove('loaded');
  if ((authed == 'true') && (token['access_token'] != 'undefined')) {
    let response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token['access_token']}`
      }
    });
    if (response.ok) {
      userData = await response.json();
      try {
        const script = document.createElement('script');
        script.src = '/app/script.js';
        script.defer = true;
        script.onload = () => {
          document.cookie = "auth_token=; max-age=0";
          initialize(encodeURIComponent(JSON.stringify(userData)));
          document.getEelementById('scriptload-background').classList.remove('loaded');
        };
        script.onerror = () => {
          document.cookie = "auth_token=; max-age=0";
          window.location.href = '/error?status=500';
        };
        document.head.appendChild(script);
      } catch(e) {
        window.location.href = '/error?status=500&msg='+encodeURIComponent(e.message);
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
