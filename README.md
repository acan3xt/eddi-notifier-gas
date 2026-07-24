# エッヂャーアラート (eddi-notifier)

目次： [特徴](#特徴) | [必要なもの](#必要なもの) | [導入方法](#導入方法) | [Discord Webhook URLの取得](#1-discord-webhook-urlの取得) | [Google Apps Scriptの作成](#2-google-apps-script-の作成) | [Webhook URLの設定](#3-webhook-urlの設定) | [監視する掲示板の設定](#4-監視する掲示板の設定) | [初回実行時の注意](#5-初回実行時の注意) | [自動実行用のトリガー設定](#6-自動実行用のトリガー設定) | [キーワードの設定](#7-キーワードの設定) | [Discord表示設定](#8-discord表示設定) | [License](#license)

エッヂ掲示板と一部の5ch掲示板（なんG、なんJ、ニュー速VIP、嫌儲）のスレッド一覧を定期的に取得し、
指定したキーワードを含む新規スレッドが立った際にDiscordへ自動通知するGoogle Apps Script（GAS）です。

<img width="548" height="344" alt="image" src="https://github.com/user-attachments/assets/a9bb64ba-65a6-4d06-93a2-e72b9a9017d6" />


---

## 特徴

- 無料で利用可能
- 自由にカスタマイズ可能
- サーバー不要（Google Apps Scriptのみで動作）
- エッヂや一部5ch板のスレッド一覧を定期取得
- 指定したキーワードによる通知フィルタリング
- 複数キーワードによるAND条件の通知に対応
- 除外ワード対応
- 重複通知を防止する既読管理機能
- Discord Webhook通知
- オリジナルURLとkyodemoの通知リンク切替
- エッヂのスレッド一覧取得方法を選択可能

## 対応掲示板

現在、以下の掲示板に対応しています。

- エッヂ
- 5ch なんG
- 5ch なんJ
- 5ch ニュー速VIP
- 5ch 嫌儲

## 必要なもの

- Googleアカウント
- 自身の管理下にあるDiscordのサーバーorチャンネル


---

# 導入方法

## 1. Discord Webhook URLの取得

Discordサーバーの対象チャンネルでWebhookを作成します。

1. チャンネルを右クリック →「チャンネルの編集」
2. 「連携サービス」→「ウェブフック」
3. 「ウェブフックを作成」
4. 「ウェブフックURLをコピー」

Webhook URLは絶対に他人に公開しないでください

---

## 2. Google Apps Script の作成

[Google Apps Script](https://script.google.com/home) https://script.google.com/home にアクセス。

- 新しいプロジェクトを作成
- 初期生成される `myFunction()` などの関数はすべて削除
- `Code.gs` にスクリプト eddiNotifier.gs (https://github.com/acan3xt/eddi-notifier/blob/main/eddiNotifier.gs) を貼り付け

---

## 3. Webhook URLの設定

先ほど取得したWebhook URLに書き換えます。

```js
 // Discord Webhook URLを設定
const DISCORD_WEBHOOK =
  "https://discordapp.com/api/webhooks/0000000000000000000/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
```

---

## 4. 監視する掲示板の設定

監視したい掲示板を`true`、監視しない掲示板を`false`に設定します。

デフォルトではエッヂ掲示板のみ有効です。

エッヂとなんGを監視対象にする場合

```js
 // エッヂ
 // "true" or "false"
const ENABLE_EDDIBB = true;

 // 5ch
 // "true" or "false"
const ENABLE_5CH_POVERTY = false;      // 嫌儲
const ENABLE_5CH_NEWS4VIP = false;    // VIP
const ENABLE_5CH_LIVEJUPITER = false;  // なんJ
const ENABLE_5CH_LIVEGALILEO = true;  // なんG
```

---

## 5. 初回実行時の注意

Discord APIと各掲示板のsubject.txtに対して外部通信を行うため初回のスクリプト起動時とトリガーの設定時に権限承認が必要です。

表示された画面で以下を選択してください：
- 「詳細」
- 「安全ではないページに移動」
- 「許可」

---
## 6. 自動実行用のトリガー設定

1.  左メニューから「トリガー」を選択
2. 「トリガーを追加」
3.  実行する関数に checkThreads を選択
4.  時間ベースのトリガーのタイプを選択「分ベースのタイマー」
5.  時間の間隔を選択（時間）
6. 「5分おき」（任意の時間を選択)*
7.  保存
8.  権限の承認をする


> **注意:** 監視対象の板やキーワード、Discordに通知するスレが多い場合、その分スクリプトの実行時間が長くなり、GASの利用制限（クォータ）に達する可能性があります。必要に応じて監視する必要のない板を`false`にしたり、実行間隔を長めに設定してください。
>
> クォータの上限に達した場合、その期間はスクリプトの実行が停止・失敗しますが、クォータを超過したことで自動的に料金が発生することはありません。
>
> クォータの目安（一般的なGoogleアカウント）:
> - トリガーの合計実行時間: 90分/日
> - URL Fetchの呼び出し: 20,000回/日
>
> 例えば、1回の実行に平均3秒かかる場合、1分おきに24時間実行すると合計約72分/日となります。
> 平均4秒の場合は約96分/日となり、90分/日の上限を超える可能性があります。
> そのため、監視対象が多い場合や実行時間が長い場合は、実行間隔を長め（5～分）に設定することをおすすめします。
> 
> 過去の実行時間はページ左側の「実行数」から確認できます。
>
> ※クォータや制限はGoogleによって変更される場合があります。最新の情報は[Google Apps Scriptのクォータと制限](https://developers.google.com/apps-script/guides/services/quotas)を確認してください。
---

## 7. キーワードの設定

- `""`で囲まれた単語を書き換えることで、通知キーワードを設定することができます。

- キーワードは`,`で区切ることで、自由に追加・削除できます。

- 大文字・小文字は区別されません。
- また、除外ワードは通知キーワードよりも優先されます。

> **注意:** `KEYWORDS` を空の配列 `[]` にするか、空のキーワード `""` を設定すると、キーワードによる絞り込みを行わず、すべての新規スレッドが通知対象になります。

```js
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
```

---

## 8. Discord表示設定

スレッドのリンク表示方法を切り替えられます。

```js
 // リンク表示
 // "original" → 元の掲示板リンク
 // "kyodemo"  → Kyodemoリンク
 // "both"     → 元の掲示板＋Kyodemo
const LINK_MODE = "both";
```
Discordの通知にオリジナルのリンクのみを表示させたい場合はconst LINK_MODE = "both"; から"original"に書き換えてください。

デフォルトでは、元の掲示板リンクとKyodemoリンクの両方が表示されます。

#### 板名表示
Discordの通知メッセージの先頭に掲示板名【エッヂ】、【5ch 嫌儲】など）を表示するか設定できます。

デフォルトでは掲示板名の表示が有効になっています。

```js
// Discord通知に掲示板名の表示
// true  → 表示する
// false → 表示しない
const SHOW_BOARD_NAME = true;
```

---

## トラブルシューティング

#### Discordに通知されない

以下を確認してください。

- Discord Webhook URLが正しく設定されているか
- `"KEYWORDS"` に設定したキーワードがスレッドタイトルに含まれているか
- `"KEYWORDS"` に`"EXCLUDE_KEYWORDS"` に設定した除外ワードが含まれていないか
- 設定したキーワードに余分なスペースが含まれていないか {例: `"KEYWORDS "` `["サンプルe "," サンプルf"]`
- 監視対象の掲示板が`true`になっているか
- トリガーが正常に設定されているか
- Google Apps Scriptの「実行数」でエラーが発生していないか
- Firefox等のブラウザで作成できない場合は、Chromeをお試しください。

#### 同じスレッドが通知されない

一度通知されたスレッドは既読情報に記録されるため、同じスレッドが再度通知されることはありません。

---

## Contact
zuzutotoあoutlook.jp

---

## License

This project is licensed under the BSD Zero Clause License (0BSD).
