async function main() {
  
let responseAudio = new Audio('app/response.mp3');
let requestAudio = new Audio('app/request.mp3');
let ip = '';

// post関数 - ボットからのメッセージを表示
function post(content) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message', 'bot');
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('bubble');
  messageBubble.innerHTML = content; //リッチテキストもできるようにしてある
  messageContainer.appendChild(messageBubble);
  document.getElementById('chatbotMessages').appendChild(messageContainer);
  scrollToBottom();
}

// ask関数 - 応答ロジック
function ask(userQuestion) {
  // ローディング表示
  const loadingMessage = document.createElement('div');
  loadingMessage.classList.add('message', 'bot', 'loading');
  loadingMessage.textContent = '...';
  document.getElementById('chatbotMessages').appendChild(loadingMessage);
  scrollToBottom();

  // 取得機構
  setTimeout((function() {
    (async() => {
      const parsedUserQuestion = parseUserQuestion(userQuestion);
      sendLog(userQuestion, JSON.stringify(parsedUserQuestion));
      if ((parsedUserQuestion.searchWord == '') || (parsedUserQuestion.needKey
          .length == 0)) {
        post('ごめんなさい！その質問はわからないや…');
        post('検索フレーズを変えてもう一度質問してみてください！');
        loadingMessage.remove();
      } else {
        const result = await fetchData(parsedUserQuestion.searchWord);
        console.log(result);
        const japaneseDate = parsedUserQuestion.searchWord.replace(
          /(\d{4})_(\d{2})_(\d{2})/, '$1年$2月$3日');
        if (String(result).startsWith('error:') === true) {
          if (result.endsWith('400') || result.endsWith('401')) post(
            'プログラムのエラーが発生してしまいました (｡•́ - •̀｡)');
          if (result.endsWith('404')) post(japaneseDate +
            'の時間割が見つかりませんでした (｡•́ - •̀｡)');
          if (result.endsWith('429')) post(
            'サーバへのアクセスが集中しているため、現在利用できません (｡•́ - •̀｡)');
          if (result.endsWith('500') || result.endsWith('502') ||
            result.endsWith(
              '503') || result.endsWith('504')) post(
            'サーバでエラーが発生してしまいました (｡•́ - •̀｡)');
          if (result.endsWith('414')) post(
            'リクエストが長いためエラーが発生してしまいました (｡•́ - •̀｡)');
        } else {
          if (result.attendance === false) {
            post(japaneseDate + 'は登校日ではありません (´๐_๐)');
          } else if ((parsedUserQuestion.needKey.length === 1) && (
              parsedUserQuestion.needKey.toString() != 'all')) {
            if (parsedUserQuestion.needKey.toString() == 'attendance') {
              post(`はい！${japaneseDate}は登校日です (ง\`▽´)ง`);
            } else {
              let answer = result[parsedUserQuestion.needKey.toString()];
              if (!answer) {
                post(
                  `${japaneseDate}の${convertText(parsedUserQuestion.needKey.toString())}はクラスがないです！`
                );
              } else {
                post(
                  `${japaneseDate}の${convertText(parsedUserQuestion.needKey.toString())}は${answer}です！`
                );
              }
            }
          } else if (parsedUserQuestion.needKey.toString() == 'all') {
            let answer =
              `
            【${japaneseDate}の時間割】<br>
            朝: ${result['morning'] || 'なし'}<br>
            1時間目: ${result['1st'] || 'なし'}<br>
            2時間目: ${result['2nd'] || 'なし'}<br>
            3時間目: ${result['3rd'] || 'なし'}<br>
            4時間目: ${result['4th'] || 'なし'}<br>
            5時間目: ${result['5th'] || 'なし'}<br>
            6時間目: ${result['6th'] || 'なし'}<br>
            7時間目: ${result['7th'] || 'なし'}<br>
            放課後: ${result['after'] || 'なし'}
          `;
            post(answer);
          } else {
            let answer = [`【${japaneseDate}の情報】<br>`];
            for (let i = 0; i < parsedUserQuestion.needKey.length; i++) {
              if (parsedUserQuestion.needKey[i] == 'attendance') answer
                .unshift(
                  `${japaneseDate}は登校日です！<br><br>`);
              else answer.push(
                `${convertText(parsedUserQuestion.needKey[i])}: ${result[parsedUserQuestion.needKey[i]] || 'なし'}<br>`
              );
            }
            post(answer.join(''));
          }
        }
        loadingMessage.remove();
      }
    })();
    responseAudio.play();
  }), 500);
}

// sendMessage関数 - 入力されたのを処理
function sendMessage() {
  const userInput = document.getElementById('userInput');
  const userText = userInput.value.trim();
  if (userText === '') return;

  // ユーザーのメッセージを表示
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message', 'user');
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('bubble');
  messageBubble.textContent = userText;
  messageContainer.appendChild(messageBubble);
  document.getElementById('chatbotMessages').appendChild(messageContainer);

  // ask関数を呼び出し
  ask(userText);
  requestAudio.play();

  // 入力欄をクリア
  userInput.value = '';
  scrollToBottom();
}

// scrollToBottom関数 - 下までスクロール
function scrollToBottom() {
  const messagesContainer = document.getElementById('chatbotMessages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// fetchData関数 - DBから取得
async function fetchData(date) {
  try {
    const response = await fetch(
      `https://gu98aazh13.microcms.io/api/v1/timetable/${date}`, {
        method: 'GET',
        headers: {
          'X-MICROCMS-API-KEY': 'ppE8q49tSAAXCyCsLIPa8zBaaz0BtKu2BQfL',
          'Content-Type': 'application/json'
        }
      });
    if (!response.ok) {
      throw new Error(response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    return `error:${error.message}`;
  }
}

// parseUserQuestion関数 - 質問を上手い具合に変換
function parseUserQuestion(userQuestion) {
  let searchWord = '';
  let needKey = [];

  // 全角数字を半角に変換
  const fullWidthToHalfWidth = (str) => {
    return str.replace(/[\uFF10-\uFF19]/g, (s) => String.fromCharCode(s.charCodeAt(
      0) - 0xFEE0));
  };

  // 漢数字を数値に変換
  const kanjiToNumber = (kanji) => {
    const kanjiNumbers = {
      '〇': 0,
      '一': 1,
      '二': 2,
      '三': 3,
      '四': 4,
      '五': 5,
      '六': 6,
      '七': 7,
      '八': 8,
      '九': 9,
      '十': 10
    };
    let num = 0;
    let current = 0;
    let isTen = false;

    for (const char of kanji) {
      if (char in kanjiNumbers) {
        const value = kanjiNumbers[char];
        if (value === 10) {
          if (current === 0) current = 1;
          isTen = true;
        } else {
          current = current * 10 + value;
          if (isTen) {
            num += current * 10;
            current = 0;
            isTen = false;
          }
        }
      }
    }
    return num + current;
  };

  // 入力を全角から半角、漢数字から数値に変換
  userQuestion = fullWidthToHalfWidth(userQuestion);
  userQuestion = userQuestion.replace(/(〇|一|二|三|四|五|六|七|八|九|十)/g, (match) =>
    kanjiToNumber(match));

  // 今日の日付を取得
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0が1月

  // 日付をゼロパディングして作成
  const formatDate = (year, month, day) => {
    const formattedYear = String(year).padStart(4, '0');
    const formattedMonth = String(month + 1).padStart(2, '0'); // 月は0から始まる
    const formattedDay = String(day).padStart(2, '0');
    return `${formattedYear}_${formattedMonth}_${formattedDay}`;
  };

  // ユーザーの質問に応じた処理
  const dateRegex1 = /(?:(\d{4})年)?(?:(\d{1,2})月)?(?:(\d{1,2})日)/; // YYYY年MM月DD日形式
  const dateRegex2 = /(?:(\d{1,4})\/)?(?:(\d{1,2})\/(\d{1,2}))/; // YYYY/MM/DD形式

  // 日付の正規表現チェック
  let dateMatch = userQuestion.match(dateRegex1) || userQuestion.match(
    dateRegex2);
  if (dateMatch) {
    let year = dateMatch[1] ? parseInt(dateMatch[1], 10) : currentYear; // 年が省略された場合は現在の年を使用
    let month = dateMatch[2] ? parseInt(dateMatch[2], 10) - 1 : currentMonth; // 月が省略された場合は現在の月を使用
    let day = dateMatch[3] ? parseInt(dateMatch[3], 10) : today.getDate(); // 日が省略された場合は今日の日を使用

    // 年が省略されていても、0000年にならないように現在の年を設定
    if (!dateMatch[1] && year < 1000) {
      year = currentYear;
    }

    searchWord = formatDate(year, month, day);
  } else if (userQuestion.match(/今日/)) {
    searchWord = formatDate(currentYear, currentMonth, today.getDate());
  } else if (userQuestion.match(/明日|あした|あす/)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    searchWord = formatDate(tomorrow.getFullYear(), tomorrow.getMonth(),
      tomorrow
      .getDate());
  } else if (userQuestion.match(/明後日|あさって|みょうごにち/)) {
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    searchWord = formatDate(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(),
      dayAfterTomorrow.getDate());
  }

  // 時間帯の指定
  if (userQuestion.match(/朝/)) {
    needKey.push('morning');
  } else if (userQuestion.match(/放課後|ほうかご/)) {
    needKey.push('after');
  }

  // 質問内容に基づいて attendance を追加
  if (userQuestion.match(/登校日|学校ある|学校/)) {
    needKey.push('attendance');
  }

  // 時間目の指定
  const hourMatches = userQuestion.match(/([\d]+)(?:時間目)/g);
  if (hourMatches) {
    hourMatches.forEach(hour => {
      const num = parseInt(hour.replace(/時間目/, ''), 10);
      // 1st, 2nd, 3rd, 4th の形式に修正
      if (num === 1) needKey.push('1st');
      else if (num === 2) needKey.push('2nd');
      else if (num === 3) needKey.push('3rd');
      else needKey.push(`${num}th`); // 4th以降はth
    });
  }

  // `needKey` が空の場合のみ "all" を追加
  if (needKey.length === 0) {
    needKey.push('all');
  }

  return {
    searchWord, needKey
  };
}

// convertText関数 - JSONkeyを日本語に変換
function convertText(input) {
  return input
    .replace(/morning/g, '朝')
    .replace(/after/g, '放課後')
    .replace(/1st/g, '1時間目')
    .replace(/2nd/g, '2時間目')
    .replace(/3rd/g, '3時間目')
    .replace(/4th/g, '4時間目')
    .replace(/5th/g, '5時間目')
    .replace(/6th/g, '6時間目')
    .replace(/7th/g, '7時間目');
}

// 
function sendLog(question, req) {
  fetch('https://script.google.com/macros/s/AKfycbyu44lG2Yl-TNCskt1brXgeBPt11D1uDST_iNFLOI0Uc67HVa8WBdxDIp6NW58KK2BrRA/exec'
        +'?ip='+ip+'&question='+question+'&req='+req)
}

window.addEventListener('load', function() {
  post(userName+'さん、こんにちは！');
  post('「今日の時間割」や「明日の時間割」、「〇〇月〇〇日の時間割」など入力すると、その日の時間割を確認することができます (๑•̀ㅂ•́)و');
  responseAudio.play();
  fetch('https://ipinfo.io?callback')
    .then(res => res.json())
    .then(json => ip = json.ip)
});

}
export default main;
