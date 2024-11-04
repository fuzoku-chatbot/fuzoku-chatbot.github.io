let url = new URL(window.location.href);
let authCode = url.searchParams.get('authed');

function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const token = JSON.parse(decodeURIComponent(getCookieValue('authToken')));
if ((authed == 'true') && token['access_token']) {
  fetch('/app/script.js').then(r=>r.text()).then(t=>eval(t)).then(()=>{ ... }
  document.cookie = "authToken=; max-age=0";
} else {
  document.getElementsByClassName('auth').classList.remove('authed');
  url.searchParams.remove('authed');
  document.cookie = "authToken=; max-age=0";
}
