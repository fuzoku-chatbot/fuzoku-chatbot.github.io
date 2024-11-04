let url = new URL(window.location.href);
let authCode = url.searchParams.get('code');
if (!authCode) 
