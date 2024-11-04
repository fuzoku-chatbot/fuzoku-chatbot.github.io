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
  let userData = '';
  let response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token['access_token']}`  // Bearerトークンを追加
    }
  });

  if (!response.ok) {
    // エラーレスポンスの詳細を取得
    let errorText = await response.text();
    window.alert(`HTTP error! status: ${response.status} - ${errorText}`);
    return; // エラー時には処理を終了
  }

  userData = await response.json();
  window.alert(JSON.stringify(userData));

} catch (e) {
  console.error('Error details:', e);
  window.alert(`Error: ${e.message}`);
}
    
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
    } catch(e) {
      document.cookie = "auth_token=; max-age=0";
      window.location.href = '/error?status=500&msg='+encodeURIComponent(e.message);
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
