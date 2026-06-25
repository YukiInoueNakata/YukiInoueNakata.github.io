# ローカルプレビュー起動スクリプト
# 使い方: PowerShell でこのフォルダに移動し  ./serve.ps1  を実行
# ブラウザで http://127.0.0.1:4000/ を開く（停止は Ctrl+C）

$ErrorActionPreference = "Stop"

# Ruby が PATH に無ければ RubyInstaller の既定パスを追加
if (-not (Get-Command ruby -ErrorAction SilentlyContinue)) {
  $rb = Get-ChildItem "C:\" -Directory -Filter "Ruby33*" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($rb) { $env:Path = "$($rb.FullName)\bin;" + $env:Path }
}

Set-Location -Path $PSScriptRoot
bundle exec jekyll serve --host 127.0.0.1 --port 4000 --force-polling --livereload
