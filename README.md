# 中田友貴 研究者サイト (GitHub Pages / Jekyll)

立命館大学 総合心理学部・中田友貴の個人研究者サイト。日英併記。

- 公開URL（予定）: https://YukiInoueNakata.github.io
- 構成: Jekyll（GitHub Pages 標準ビルド。プラグインは whitelist 内のみ）
- 言語: 日本語（`/`）＋ 英語（`/en/`）。レイアウト/インクルードは共通化

---

## 1. ディレクトリ構成

```
_config.yml            サイト設定（URL・外部リンク・フォーム/CSV URL）
_data/
  i18n.yml             UI 文言の日英対訳
  profile.yml          プロフィール（氏名・肩書・専門・略歴）★要編集
  programs.yml         作成プログラム一覧 ★要編集
  publications.yml     主要業績（researchmap からのエクスポート反映先）★要編集
_includes/             head / header(ナビ・言語切替) / footer
_layouts/              default / page
assets/css/style.css   デザイン
assets/js/             main.js(ナビ) / bibliography.js(研究事例CSV読込)
index.html             日本語トップ        en/index.html        英語トップ
research.html          研究紹介            en/research.html
publications.html      業績                en/publications.html
programs.html          プログラム一覧      en/programs.html
bibliography.html      研究事例(フォーム連動) en/bibliography.html
```

「ホームページの内容を変えたい」ときの基本は **`_data/` の YAML を編集** するだけです。
HTML を直接触らなくても、氏名・専門・略歴・業績・プログラムは差し替えられます。

---

## 2. GitHub Pages への公開手順

1. GitHub で **`YukiInoueNakata.github.io`** という名前のリポジトリを新規作成（Public）
2. このフォルダの中身をそのリポジトリに push
   ```bash
   cd "D:/OneDrive/01Webpage"
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YukiInoueNakata/YukiInoueNakata.github.io.git
   git push -u origin main
   ```
3. GitHub のリポジトリ → **Settings → Pages** → Source を「Deploy from a branch」、Branch を `main` / `/ (root)` に設定
4. 数分後に https://YukiInoueNakata.github.io で公開される

> 注: 個人サイト（username.github.io）なので `_config.yml` の `baseurl` は空のままで OK。

---

## 3. 研究事例リスト（KH Coder 方式）の設定

利用者がフォームから書誌情報を投稿 → スプレッドシートに蓄積 → サイトが自動表示する仕組み。

### 手順
1. **Google フォーム**を作成。質問項目（推奨）:
   - ソフト名（`programs.yml` の `id` と一致させる。例: `sample-tool`）
   - 出版年 / 著者 / タイトル / 掲載誌・出版社 / URL
2. フォームの回答先 **Google スプレッドシート**を開く
3. 列名（1行目）を次に揃える（順不同可・小文字推奨）:
   ```
   timestamp | software | year | authors | title | venue | url | approved
   ```
   - `approved` 列を手動で追加し、**掲載してよい行だけ `TRUE`** にする（スパム対策）
4. スプレッドシート → **ファイル → 共有 → ウェブに公開 → 形式「CSV」** で公開し、URL を取得
5. `_config.yml` に設定:
   ```yaml
   bibliography_form_url: "https://forms.gle/xxxx"     # 投稿ボタン用
   bibliography_csv_url:  "https://docs.google.com/.../pub?output=csv"  # 表示用
   ```
6. push すると `/bibliography/` に一覧が表示され、ソフト・年・著者で絞り込み可能

> プログラム一覧の各カードの「研究事例を見る」は `/bibliography/?software=<id>` に飛び、
> そのソフトだけで初期絞り込みされます。

---

## 4. 業績（researchmap 連動・方式B）

現状は **researchmap から定期エクスポートして `_data/publications.yml` を更新**する運用です。

1. `_config.yml` の `links.researchmap` に researchmap の URL を設定
   → サイト各所に「業績一覧 (researchmap)」リンクが出ます
2. 代表的な業績を `_data/publications.yml` に記入（新しい順）
3. （将来）GitHub Actions で researchmap API から自動生成する「方式A」は、
   API 仕様を検証のうえ追加予定

---

## 5. プログラムの詳細ページを後で追加する

`_data/programs.yml` の該当プログラムを `detail: true` にし、
`_programs/<id>.md`（例 `_programs/sample-tool.md`）を作成すると
`/programs/<id>/` に詳細ページが生成されます（テンプレは `docs/program-detail-template.md` 参照）。

---

## 6. ローカルプレビュー（任意）

Ruby + Bundler がある場合のみ:
```bash
bundle install
bundle exec jekyll serve
# http://localhost:4000 で確認
```
無くても GitHub に push すれば GitHub 側でビルドされます。

---

## 7. 公開前 TODO チェックリスト

- [ ] `_data/profile.yml` … 氏名・肩書・専門・略歴・自己紹介を記入
- [ ] `assets/img/profile.jpg` … 顔写真を配置（任意）
- [ ] `_config.yml` の `links.*` … researchmap / Scholar / ORCID など URL 設定
- [ ] `_data/programs.yml` … 実際のプログラムに差し替え
- [ ] `_data/publications.yml` … 主要業績を記入
- [ ] Google フォーム + スプレッドシート作成 → `bibliography_form_url` / `bibliography_csv_url` 設定
- [ ] GitHub に `YukiInoueNakata.github.io` リポジトリ作成 → push → Pages 有効化
