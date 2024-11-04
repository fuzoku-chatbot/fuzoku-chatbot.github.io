document.addEventListener('DOMContentLoaded', async () => {
  let url = new URL(window.location.href);
  let authed = url.searchParams.get('authed');

  function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  let token = JSON.parse(decodeURIComponent(getCookieValue('authToken')));
  window.alert(getCookieValue('authToken'));
  if(!token) token = {access_token:'undefined'};
  
  if ((authed == 'true') && (token['access_token'] != 'undefined')) {
    try {
      const response = await fetch('/app/script.js');
      const scriptContent = await response.text();
      const runScript = new Function(scriptContent);
      runScript();
      document.cookie = "auth_token=; max-age=0";
    } catch {
      window.location.href = '/error?status=500';
    }
  } else {
    const authBackground = document.getElementById('authbackground');
    if (authBackground) {
      authBackground.classList.remove('authed');
    } else {
      console.error("Element with ID 'authbackground' not found.");
    }
    document.cookie = "authToken=; max-age=0";
  }
});
