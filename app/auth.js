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
    try {
      const script = document.createElement('script');
　　　　script.src = '/app/script.js';
　　　　script.async = true;
　　　　script.onload = () => {
        document.cookie = "auth_token="+encodeURIComponent(JSON.stringify(token))+"; max-age=86400";
　　　　};
      script.onerror = () => {
        document.cookie = "auth_token=; max-age=0";
        window.location.href = '/error?status=500'
      };
      document.head.appendChild(script);
    } catch {
      document.cookie = "auth_token=; max-age=0";
      window.location.href = '/error?status=500';
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
