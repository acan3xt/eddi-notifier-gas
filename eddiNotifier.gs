// eddi-notifier v0.2.1


 // エッヂ
 // "true" or "false"
const ENABLE_EDDIBB = true;

 // エッヂのスレ取得方法
 // "metadent" → subject-metadent.txt（記者ID付き）
 // "normal"   → subject.txt
const EDDIBB_SUBJECT_MODE = "normal";

 // 5ch
 // "true" or "false"
const ENABLE_5CH_POVERTY = false;      // 嫌儲
const ENABLE_5CH_NEWS4VIP = false;    // VIP
const ENABLE_5CH_LIVEJUPITER = false;  // なんJ
const ENABLE_5CH_LIVEGALILEO = false;  // なんG

 // リンク表示
 // "original" → 元の掲示板リンク
 // "kyodemo"  → Kyodemoリンク
 // "both"     → 元の掲示板＋Kyodemo
const LINK_MODE = "both";

// Discord通知に掲示板名の表示
// true  → 表示する
// false → 表示しない
const SHOW_BOARD_NAME = true;


 // Discord Webhook URLを設定
const DISCORD_WEBHOOK =
  "https://discordapp.com/api/webhooks/0000000000000000000/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
 // 通知キーワード
 // "単語" → 単語を含むスレッドを通知
 // ["単語A", "単語B"] → AとBの両方を含むスレッドを通知（AND）
const KEYWORDS = [
  "通知キーワード00",
  "通知キーワード01",
  "通知キーワード02",
  "通知キーワード03",
  "通知キーワード04",
  ["サンプルa", "サンプルb"],
  ["サンプルc", "サンプルd"],
  ["サンプルe","サンプルf"]
];
 // 除外ワード
const EXCLUDE_KEYWORDS = [
  "除外ワード00",
  "除外ワード01",
  "除外ワード02",
  "除外ワード03"
];


 // ==============================
 // ここから下は変更しないでください
 // ==============================


function checkThreads() {

  const props = PropertiesService.getScriptProperties();

  let seen =
    JSON.parse(props.getProperty("seen") || "[]");

  let seenSet = new Set(seen);

  const sources = [];

 if (ENABLE_EDDIBB) {
  sources.push({
    name: "エッヂ",
    url: EDDIBB_SUBJECT_MODE === "metadent"
    ? "https://bbs.eddibb.cc/liveedge/subject-metadent.txt"
    : "https://bbs.eddibb.cc/liveedge/subject.txt",
    type: "eddibb",
    board: "liveedge",
    host: "bbs.eddibb.cc"
  });
 }

 // 5ch 嫌儲
 if (ENABLE_5CH_POVERTY) {
  sources.push({
    name: "5ch 嫌儲",
    url: "https://greta.5ch.io/poverty/subject.txt",
    type: "5ch",
    board: "poverty",
    host: "greta.5ch.io"
  });
 }

 // 5ch VIP
 if (ENABLE_5CH_NEWS4VIP) {
  sources.push({
    name: "5ch VIP",
    url: "https://mi.5ch.io/news4vip/subject.txt",
    type: "5ch",
    board: "news4vip",
    host: "mi.5ch.io"
   });
 }

 // 5ch なんJ
 if (ENABLE_5CH_LIVEJUPITER) {
  sources.push({
    name: "5ch なんJ",
    url: "https://eagle.5ch.io/livejupiter/subject.txt",
    type: "5ch",
    board: "livejupiter",
    host: "eagle.5ch.io"
   });
 }

 // 5ch なんG
 if (ENABLE_5CH_LIVEGALILEO) {
  sources.push({
    name: "5ch なんG",
    url: "https://nova.5ch.io/livegalileo/subject.txt",
    type: "5ch",
    board: "livegalileo",
    host: "nova.5ch.io"
  });
}


const messages = [];

for (const source of sources) {

  const text =
    UrlFetchApp.fetch(source.url)
      .getContentText("Shift_JIS");

  const lines = text.split("\n");

  for (const line of lines) {


    if (!line.includes(".dat<>")) continue;

    const dat = line.split(".dat<>")[0];
    let title = line.split(".dat<>")[1].split(" (")[0];
    
    title = decodeHtml(title);
    
    // 除外キーワード
    if (EXCLUDE_KEYWORDS.some(k =>
    title.toLowerCase().includes(k.toLowerCase())
    )) {
      continue;
      }

    const seenKey =
  `${source.type}:${source.board}:${dat}`;

    // すでに処理済みならスキップ
    if (seenSet.has(seenKey))
      continue;

    // キーワード判定
    if (
      KEYWORDS.length &&
      !KEYWORDS.some(group => {

        if (Array.isArray(group)) {
          return group.every(k =>
            title.toLowerCase().includes(k.toLowerCase())
          );
        }

        return title.toLowerCase().includes(group.toLowerCase());

      })
    ) {
      continue;
    }

    // 通知対象になったスレだけ記録
    seenSet.add(seenKey);

    messages.push({
      content:
        `${SHOW_BOARD_NAME ? `【${source.name}】\n` : ""}` +
        `${title}\n` +
        `${buildLinks(source, dat)}`
    });
    
  }

}

  // 古い順に送信
  messages.reverse().forEach(msg => {
    UrlFetchApp.fetch(DISCORD_WEBHOOK, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(msg)
    });
  });

const seenArray = [...seenSet].slice(-1000); 
  
  props.setProperty(
    "seen",
    JSON.stringify(seenArray)
  );

  Logger.log(messages.length + " new thread(s)");
}


function decodeHtml(text) {
  return text
    // 数値文字参照（10進）
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))

    // 数値文字参照（16進）
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCodePoint(parseInt(h, 16))
    )

    // よく使われるHTMLエンティティ
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}


function buildLinks(source, dat) {

  const urls = [];

  // 元の掲示板リンク
  if (LINK_MODE === "original" || LINK_MODE === "both") {

    if (source.type === "eddibb") {

      urls.push(
        `https://${source.host}/test/read.cgi/${source.board}/${dat}/`
      );

    } else if (source.type === "5ch") {

      urls.push(
        `https://${source.host}/test/read.cgi/${source.board}/${dat}/`
      );

    }

  }


  // Kyodemoリンク
  if (LINK_MODE === "kyodemo" || LINK_MODE === "both") {

    if (source.type === "eddibb") {

      urls.push(
        `https://www.kyodemo.net/sdemo/r/e_e_liveedge/${dat}/`
      );

    } else if (source.type === "5ch") {

      urls.push(
        `https://www.kyodemo.net/sdemo/r/${source.board}/${dat}/`
      );

    }

  }
  
    return urls.join("\n");
}
