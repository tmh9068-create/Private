#!/bin/bash
set -euo pipefail

# GitHub Pages 静的エクスポート用ビルド
# middleware は静的エクスポートと非互換のため一時的に無効化

MIDDLEWARE="src/middleware.ts"
BACKUP="src/middleware.ts.bak"

if [ -f "$MIDDLEWARE" ]; then
  mv "$MIDDLEWARE" "$BACKUP"
fi

cleanup() {
  if [ -f "$BACKUP" ]; then
    mv "$BACKUP" "$MIDDLEWARE"
  fi
}
trap cleanup EXIT

export STATIC_EXPORT=true
export GITHUB_PAGES=true

npm run build

echo "Static export complete: out/"
