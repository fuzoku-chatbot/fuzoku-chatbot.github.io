let errorAudio = new Audio('/app/error.mp3');
let userData = {};
let ip = '';
fetch('https://ipinfo.io?callback')
    .then(res => res.json())
    .then(json => ip = json.ip)

async function authorize() {
  let authorizedList = [];
  await fetch('https://gu98aazh13.microcms.io/api/v1/authorized?limit=100&fields=email?filters=disabled[equals]false', {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': 'ppE8q49tSAAXCyCsLIPa8zBaaz0BtKu2BQfL',
      'Content-Type': 'application/json'
    }})
    .then(res => res.json())
    .then(json => authorizedList = json.contents.map(item => item.email))
    .catch(error => console.error('Error:', error.message));
  return authorizedList.includes(userData['email']);
}

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
    document.getElementById('scriptloader').classList.remove('loaded');
    let response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token['access_token']}`
      }
    });
    if (response.ok) {
      try {
        userData = await response.json();
        const authStatus = await authorize();
        fetch('https://script.google.com/macros/s/AKfycbyu44lG2Yl-TNCskt1brXgeBPt11D1uDST_iNFLOI0Uc67HVa8WBdxDIp6NW58KK2BrRA/exec'
          +'?ip='+ip+'&question='+encodeURIComponent('Server: login')+'&req='+encodeURIComponent('Authorization: '+authStatus)+'&userdata='+encodeURIComponent(JSON.stringify(userData)));
        if (authStatus === true) {
          const script = document.createElement('script');
          script.src = '/app/script.js?v3';
          script.defer = true;
          script.onload = () => {
            document.cookie = "auth_token=; max-age=0";
            document.getElementById('scriptloader').classList.add('loaded');
            initialize(encodeURIComponent(JSON.stringify(userData)));
          };
          script.onerror = () => {
            document.cookie = "auth_token=; max-age=0";
            window.location.href = '/error?status=500';
          };
          document.head.appendChild(script);
        } else {
          document.cookie = "auth_token=; max-age=0";
          document.getElementById('authbackground').classList.remove('authed');
          document.getElementById('scriptloader').classList.add('loaded');
          errorAudio.play();
          window.alert(`Error 403 : ${userData['email']} はアクセスが許可されていません`);          
        }
      } catch(e) {
        document.cookie = "auth_token=; max-age=0";
        window.location.href = '/error?status=500&msg='+encodeURIComponent(e.message);
      }
    } else {
      document.cookie = "auth_token=; max-age=0";
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
