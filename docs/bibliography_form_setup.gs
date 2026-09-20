/**
 * 研究事例フォームをツールごとに 1 本作るスクリプト（Google Apps Script）
 * ------------------------------------------------------------------
 * 使い方:
 *   1. https://script.google.com/ で新規プロジェクトを作り、この中身を貼り付ける
 *   2. TOOLS を必要に応じて編集する（name は _data/programs.yml の name.ja と揃える）
 *   3. 関数 createAllForms を実行する（初回だけ Google の認可が要る）
 *   4. 実行ログに出る form_url / sheet_url を控える
 *   5. 各スプレッドシートを「ファイル > 共有 > ウェブに公開 > 形式 CSV」で公開し、その URL を控える
 *   6. サイトの _data/programs.yml の該当ツールに form_url と csv_url を入れて push する
 *
 * 出来上がる列（assets/js/bibliography.js の ALIASES と対応）:
 *   タイムスタンプ / 種別 / 発表形式（学会発表の場合） / 査読の有無（論文の場合） /
 *   出版年 / 著者 / タイトル / 掲載誌・出版社 / URL・DOI / ひとこと / 掲載可
 *   ※「掲載可」はフォームの質問ではなく、回答シートに手で追加する承認列。
 *     TRUE（または ○ / はい / 1 / yes）の行だけがサイトに表示される。
 *     ソフトウェア名は列を作らない（ツールごとのフォームなので、サイト側がそのツール名を補う）。
 */

var TOOLS = [
  { id: 'temer-plus', name: 'TEMerPlus' },
  { id: 'affinity-mapping-studio', name: 'Affinity Mapping Studio' }
];

var TYPES = ['論文', '書籍・章', '学会発表', '学位論文', 'その他'];

// 学会発表を選んだ人だけが答える下位区分。空欄のままでも構わない設計にしてある
// （フォームの分岐は使わない。分岐はシートの列がずれやすく、後の編集も面倒になるため）
var PRESENTATION_FORMATS = ['口頭', 'ポスター', 'その他'];
var REFEREED = ['査読あり', '査読なし', 'わからない'];

function createAllForms() {
  TOOLS.forEach(function (tool) {
    var r = createFormForTool(tool);
    Logger.log('%s\n  form_url: %s\n  sheet_url: %s', tool.name, r.formUrl, r.sheetUrl);
  });
  Logger.log('次: 各シートを「ウェブに公開(CSV)」し、programs.yml の form_url / csv_url を埋める');
}

function createFormForTool(tool) {
  var form = FormApp.create(tool.name + ' — 研究事例の登録');
  form.setDescription(
    tool.name + ' を使って発表された研究をお寄せください。いただいた情報は、著者名・タイトル・掲載先・URL を' +
    '研究事例のページに掲載します（掲載前に確認します）。'
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);
  form.setProgressBar(false);
  form.setConfirmationMessage('ありがとうございます。内容を確認のうえ掲載します。');

  form.addMultipleChoiceItem()
    .setTitle('種別')
    .setChoiceValues(TYPES)
    .setRequired(true);

  // 下位区分は任意。該当しない種別の人は空欄のまま次へ進める
  form.addMultipleChoiceItem()
    .setTitle('発表形式（学会発表の場合）')
    .setChoiceValues(PRESENTATION_FORMATS)
    .showOtherOption(false)
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle('査読の有無（論文の場合）')
    .setChoiceValues(REFEREED)
    .setRequired(false);

  var year = form.addTextItem().setTitle('出版年').setHelpText('西暦4桁（例: 2026）').setRequired(true);
  year.setValidation(
    FormApp.createTextValidation().requireTextMatchesPattern('^(19|20)\\d{2}$')
      .setHelpText('西暦4桁で入力してください').build()
  );

  form.addTextItem().setTitle('著者')
    .setHelpText('連名は「，」または「,」で区切ってください（例: 中田友貴, サトウタツヤ）')
    .setRequired(true);

  form.addTextItem().setTitle('タイトル').setRequired(true);

  form.addTextItem().setTitle('掲載誌・出版社')
    .setHelpText('雑誌名・巻号頁、書籍なら出版社、学会発表なら大会名')
    .setRequired(false);

  form.addTextItem().setTitle('URL・DOI')
    .setHelpText('本文や抄録に辿り着ける URL、または DOI')
    .setRequired(false);

  form.addParagraphTextItem().setTitle('ひとこと（任意）')
    .setHelpText('使ってみてのご感想、改良のご要望など。掲載はしません。')
    .setRequired(false);

  var ss = SpreadsheetApp.create(tool.name + ' — 研究事例（回答）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // 承認列（掲載可）をシートに用意する。TRUE の行だけがサイトに出る。
  var sheet = SpreadsheetApp.openById(ss.getId()).getSheets()[0];
  var lastCol = sheet.getLastColumn();
  sheet.getRange(1, lastCol + 1).setValue('掲載可');
  sheet.getRange(1, lastCol + 1).setNote('TRUE / ○ / はい / 1 / yes のいずれかを入れた行だけがサイトに表示されます');

  return { formUrl: form.getPublishedUrl(), editUrl: form.getEditUrl(), sheetUrl: ss.getUrl() };
}
