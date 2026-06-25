source "https://rubygems.org"

# GitHub Pages がサーバ側でビルドに使う gem 一式。
# ローカルでプレビューしたい場合のみ `bundle install` が必要。
gem "github-pages", group: :jekyll_plugins
gem "jekyll-seo-tag"
gem "jekyll-sitemap"

# Windows / JRuby 向け
gem "tzinfo", ">= 1", "< 3"
gem "tzinfo-data"
# wdm はファイル監視(自動再ビルド)用だが Ruby 3.3 でビルド不可のため使わない。
# 監視は listen のポーリングで代替する（serve 時に --force-polling を付与）。
