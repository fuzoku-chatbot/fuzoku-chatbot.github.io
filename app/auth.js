let url = new URL(window.location.href);
let authCode = url.searchParams.get('authed');

function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

(async () => {
  const token = JSON.parse(decodeURIComponent(getCookieValue('authToken')));
  if (authed === 'true' && token['access_token']) {
    try {
      const response = await fetch('/app/script.js');
      const scriptContent = await response.text();
      const runScript = new Function(scriptContent);
      runScript();
      document.cookie = "authToken=; max-age=0";
    } catch () {
      window.location.href = '/error?status=500';
    }
  } else {
    const authElement = document.getElementsByClassName('auth')[0];
    if (authElement) {
      authElement.classList.remove('authed');
    }
    url.searchParams.remove('authed');
    document.cookie = "authToken=; max-age=0";
  }
})();
