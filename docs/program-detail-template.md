# プログラム詳細ページのテンプレート

各プログラムに HAD のような詳細ページを作りたくなったら、
`_data/programs.yml` の該当エントリを `detail: true` にし、
以下を `_programs/<id>.md`（例: `_programs/sample-tool.md`）として保存してください。

`/programs/<id>/` で公開されます（`_config.yml` の collections 設定済み）。

---

```markdown
---
layout: page
lang: ja
title: "サンプルツール"
subtitle: "ソフトの一言説明"
---

## 概要
（このソフトが何をするものか）

## 主な機能
- 機能1
- 機能2

## ダウンロード / 動作環境
- 最新版: [ダウンロード](#)
- 動作環境: R 4.x / Windows・macOS など

## 使い方
1. 手順1
2. 手順2

## 引用方法
（論文等で使う際の引用例）

## このソフトを使った研究事例
[研究事例を見る](/bibliography/?software=sample-tool)
```

英語版を作る場合は `_programs/<id>-en.md` を作り、
`permalink: /en/programs/<id>/`、`lang: en` を front matter に指定してください。
（言語切替を効かせたい場合は両ファイルに同じ `ref:` を付与）
```
