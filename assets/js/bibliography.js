/* ============================================================
   研究事例リスト — Google スプレッドシート(CSV) を読み込み表示
   KH Coder 方式: フォーム投稿 → スプレッドシート → ここで表示
   ------------------------------------------------------------
   想定スプレッドシート列（1行目ヘッダ・順不同可）:
     timestamp | software | year | authors | title | venue | url | approved
   - software : programs.yml の id（例 sample-tool）と一致させる
   - approved : TRUE の行のみ表示（空欄/FALSE は非表示）
   ============================================================ */
(function () {
  var root = document.getElementById('bib-app');
  if (!root) return;

  var CSV_URL = root.dataset.csv || '';
  var T = JSON.parse(root.dataset.i18n || '{}');

  var elList = document.getElementById('bib-list');
  var elSoft = document.getElementById('bib-filter-software');
  var elYear = document.getElementById('bib-filter-year');
  var elAuthor = document.getElementById('bib-filter-author');

  var rows = [];

  if (!CSV_URL) {
    elList.innerHTML = '<p class="bib-status">' +
      (T.no_csv || '（スプレッドシートの CSV URL を _config.yml の bibliography_csv_url に設定してください）') +
      '</p>';
    return;
  }

  elList.innerHTML = '<p class="bib-status">' + (T.loading || 'Loading…') + '</p>';

  fetch(CSV_URL)
    .then(function (r) { return r.text(); })
    .then(function (text) {
      rows = parseCSV(text).filter(function (r) {
        var a = (r.approved || '').toString().trim().toLowerCase();
        return a === 'true' || a === '1' || a === 'yes' || a === 'はい' || a === '○';
      });
      buildFilters();
      render();
    })
    .catch(function () {
      elList.innerHTML = '<p class="bib-status">' +
        (T.load_error || 'データを読み込めませんでした。') + '</p>';
    });

  function buildFilters() {
    var softs = unique(rows.map(function (r) { return r.software; }));
    var years = unique(rows.map(function (r) { return r.year; })).sort().reverse();
    softs.forEach(function (s) { if (s) elSoft.appendChild(opt(s, s)); });
    years.forEach(function (y) { if (y) elYear.appendChild(opt(y, y)); });
    [elSoft, elYear].forEach(function (el) { el.addEventListener('change', render); });
    elAuthor.addEventListener('input', render);

    // URL パラメータ ?software=xxx で初期絞り込み（プログラムカードからの遷移用）
    var p = new URLSearchParams(location.search).get('software');
    if (p) { elSoft.value = p; }
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

    // 年で降順グループ化
    var byYear = {};
    items.forEach(function (r) { (byYear[r.year] = byYear[r.year] || []).push(r); });
    var years = Object.keys(byYear).sort().reverse();

    var html = '';
    years.forEach(function (y) {
      html += '<div class="bib-year-group"><h3>' + esc(y) + '</h3>';
      byYear[y].forEach(function (r) {
        html += '<div class="bib-item">' + formatItem(r) + '</div>';
      });
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
  function opt(v, label) { var o = document.createElement('option'); o.value = v; o.textContent = label; return o; }
  function unique(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ヘッダ付き CSV を {col: value} 配列に。引用符内のカンマ/改行に対応。
  function parseCSV(text) {
    var rows = [], row = [], field = '', inQ = false;
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { inQ = false; } }
        else { field += c; }
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else field += c;
      }
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    var headers = rows.shift().map(function (h) { return h.trim().toLowerCase(); });
    return rows.filter(function (r) { return r.some(function (v) { return v.trim() !== ''; }); })
      .map(function (r) {
        var o = {};
        headers.forEach(function (h, idx) { o[h] = (r[idx] || '').trim(); });
        return o;
      });
  }
})();
