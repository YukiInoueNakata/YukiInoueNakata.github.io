/* ============================================================
   研究事例リスト — Google スプレッドシート(CSV) を読み込み表示
   KH Coder 方式: フォーム投稿 → スプレッドシート → ここで表示
   ------------------------------------------------------------
   スプレッドシートの列（1行目ヘッダ）は日本語/英語どちらでも可。
   別名で自動マッピングする（下の ALIASES 参照）:
     software : ソフトウェア / ソフト / ソフト名
     year     : 出版年 / 発行年 / 年
     authors  : 著者 / 著者名
     title    : タイトル / 題目 / 論文名
     venue    : 掲載誌・出版社 / 掲載誌 / 誌名 / 出版社
     url      : URL / リンク
     approved : 掲載可 / 承認 / approved   ← TRUE の行のみ表示
   - software の値は programs.yml の表示名（例 "TEMer Plus"）に揃える。
     プログラム一覧カードからの ?software=<id> は表示名へ自動変換して絞り込む。
   ============================================================ */
(function () {
  var root = document.getElementById('bib-app');
  if (!root) return;

  var CSV_URL = root.dataset.csv || '';
  var T = JSON.parse(root.dataset.i18n || '{}');
  // [{id, name}] … programs.yml 由来（id と表示名の対応）
  var PROGRAMS = JSON.parse(root.dataset.programs || '[]');

  var idToName = {}, nameToId = {};
  PROGRAMS.forEach(function (p) { idToName[p.id] = p.name; nameToId[p.name] = p.id; });

  var elList = document.getElementById('bib-list');
  var elSoft = document.getElementById('bib-filter-software');
  var elYear = document.getElementById('bib-filter-year');
  var elAuthor = document.getElementById('bib-filter-author');

  // ヘッダは部分一致でマッピング（日英併記「ソフトウェア / Software」等にも対応）。
  // すべて小文字化済みのヘッダに対して照合する。
  var ALIASES = {
    software: ['software', 'ソフトウェア', 'ソフト'],
    year: ['year', '出版年', '発行年', '年度'],
    authors: ['author', '著者'],
    title: ['title', 'タイトル', '題目', '論文名', '書名'],
    venue: ['venue', 'journal', '掲載誌', '誌名', '出版社'],
    url: ['url', 'リンク'],
    approved: ['approved', '掲載可', '承認', '公開'],
    timestamp: ['timestamp', 'タイムスタンプ']
  };

  var rows = [];

  if (!CSV_URL) {
    elList.innerHTML = '<p class="bib-status">' +
      (T.no_csv || '（_config.yml の bibliography_csv_url にスプレッドシートの公開CSV URL を設定してください）') +
      '</p>';
    return;
  }

  elList.innerHTML = '<p class="bib-status">' + (T.loading || 'Loading…') + '</p>';

  fetch(CSV_URL)
    .then(function (r) { return r.text(); })
    .then(function (text) {
      rows = parseCSV(text)
        .map(normalize)
        .filter(function (r) { return isApproved(r.approved); });
      buildFilters();
      render();
    })
    .catch(function () {
      elList.innerHTML = '<p class="bib-status">' +
        (T.load_error || 'データを読み込めませんでした。CSVの公開設定をご確認ください。') + '</p>';
    });

  function isApproved(v) {
    var a = (v == null ? '' : String(v)).trim().toLowerCase();
    return a === 'true' || a === '1' || a === 'yes' || a === 'はい' || a === '○' || a === '掲載';
  }

  function buildFilters() {
    var softs = unique(rows.map(function (r) { return r.software; })).filter(Boolean);
    var years = unique(rows.map(function (r) { return r.year; })).filter(Boolean).sort().reverse();
    softs.forEach(function (s) { elSoft.appendChild(opt(s, s)); });
    years.forEach(function (y) { elYear.appendChild(opt(y, y)); });
    [elSoft, elYear].forEach(function (el) { el.addEventListener('change', render); });
    elAuthor.addEventListener('input', render);

    // ?software=xxx で初期絞り込み（id でも表示名でも可）
    var p = new URLSearchParams(location.search).get('software');
    if (p) {
      var name = idToName[p] || p;
      elSoft.value = name;
    }
  }

  function render() {
    var fs = elSoft.value, fy = elYear.value, fa = elAuthor.value.trim().toLowerCase();
    var items = rows.filter(function (r) {
      if (fs && r.software !== fs) return false;
      if (fy && r.year !== fy) return false;
      if (fa && (r.authors || '').toLowerCase().indexOf(fa) === -1) return false;
      return true;
    });

    if (!items.length) {
      elList.innerHTML = '<p class="bib-status">' + (T.no_results || 'No matching examples.') + '</p>';
      return;
    }

    var byYear = {};
    items.forEach(function (r) { (byYear[r.year || '—'] = byYear[r.year || '—'] || []).push(r); });
    var years = Object.keys(byYear).sort().reverse();

    var html = '';
    years.forEach(function (y) {
      html += '<div class="bib-year-group"><h3>' + esc(y) + '</h3>';
      byYear[y].forEach(function (r) { html += '<div class="bib-item">' + formatItem(r) + '</div>'; });
      html += '</div>';
    });
    elList.innerHTML = html;
  }

  function formatItem(r) {
    var s = '';
    if (r.authors) s += esc(r.authors) + ' ';
    if (r.year) s += '(' + esc(r.year) + '). ';
    var title = esc(r.title || '');
    if (r.url) title = '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + title + '</a>';
    s += title;
    if (r.venue) s += ' <span class="bib-venue">' + esc(r.venue) + '</span>';
    if (r.software) s += '<span class="bib-soft">' + esc(r.software) + '</span>';
    return s;
  }

  /* ---- helpers ---- */
  function normalize(rawObj) {
    var out = {};
    Object.keys(ALIASES).forEach(function (key) {
      var aliases = ALIASES[key];
      for (var h in rawObj) {
        var hit = aliases.some(function (a) { return h.indexOf(a) !== -1; });
        if (hit) { out[key] = rawObj[h]; break; }
      }
    });
    return out;
  }
  function opt(v, label) { var o = document.createElement('option'); o.value = v; o.textContent = label; return o; }
  function unique(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ヘッダ付き CSV を {header: value} 配列に。引用符内のカンマ/改行に対応。
  function parseCSV(text) {
    var rowsArr = [], row = [], field = '', inQ = false;
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { inQ = false; } }
        else { field += c; }
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rowsArr.push(row); row = []; field = ''; }
        else field += c;
      }
    }
    if (field !== '' || row.length) { row.push(field); rowsArr.push(row); }
    if (!rowsArr.length) return [];
    var headers = rowsArr.shift().map(function (h) { return h.trim().toLowerCase(); });
    return rowsArr.filter(function (r) { return r.some(function (v) { return v.trim() !== ''; }); })
      .map(function (r) {
        var o = {};
        headers.forEach(function (h, idx) { o[h] = (r[idx] || '').trim(); });
        return o;
      });
  }
})();
