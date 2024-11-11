function post(iconURI, msg, mode = 0) {
    const recordList = document.getElementById("record-list");

    // 新しいレコード要素を作成
    const record = document.createElement("div");
    record.className = "record";
    record.classList.add(`mode-${mode}`);

    // アイコン画像を設定
    const recordIcon = document.createElement("img");
    recordIcon.className = "record-icon";
    recordIcon.src = iconURI;
    recordIcon.alt = "Icon";

    // メッセージを設定
    const recordMessage = document.createElement("div");
    recordMessage.className = "record-message";
    recordMessage.textContent = msg;

    // 日時を取得し、表示形式にフォーマット
    const now = new Date();
    const timestampText = now.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    // タイムスタンプの要素を作成
    const recordTimestamp = document.createElement("div");
    recordTimestamp.className = "record-timestamp";
    recordTimestamp.textContent = timestampText;

    // レコード要素にアイコン、メッセージ、タイムスタンプを追加
    record.appendChild(recordIcon);
    record.appendChild(recordMessage);
    record.appendChild(recordTimestamp);

    // リストに新しいレコードを追加
    recordList.appendChild(record);
}


// WS接続（Achexへ接続）
const ws = new WebSocket("wss://cloud.achex.ca/chatbotlog");
ws.onopen = e => {
	ws.send(JSON.stringify({"auth": "user", "password": "password"}));
}
// メッセージ受信
ws.onmessage = e => {
  var obj = JSON.parse(e.data);
  if(obj.auth == 'OK'){
    console.log('接続に成功しました');
  }
  console.log(obj.msg);
  if(obj['msg'].match(/Server: /) && obj['msg'].match(/authorized/)) post(obj.icon, obj.msg, 1);
  else if(obj['msg'].match(/Server: /) && obj['msg'].match(/unauthorized/)) post(obj.icon, obj.msg, 2);
  else post(obj.icon, obj.msg);
}
