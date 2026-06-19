#!/bin/bash
set -euo pipefail

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

# GitHub Pages: /Private  basePath
# Supabase Storage: storage public path
# その他: ルート配置
if [ "${DEPLOY_TARGET:-github}" = "github" ]; then
  export GITHUB_PAGES=true
elif [ "${DEPLOY_TARGET}" = "supabase" ]; then
  export SUPABASE_STORAGE=true
fi

npm run build
echo "Static export complete: out/"
