#!/bin/bash
# GitHub Pages 用デプロイスクリプト
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Building for GitHub Pages..."
DEPLOY_TARGET=github npm run build:pages

echo "==> Adding .nojekyll..."
touch out/.nojekyll

echo "==> Pushing to gh-pages branch..."
DEPLOY_DIR="/tmp/ghpages-deploy-$$"
cp -r out "$DEPLOY_DIR"
cd "$DEPLOY_DIR"
git init -q
git checkout -b gh-pages
git add -A
git commit -m "Deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)" -q
git remote add origin "$(cd /workspace && git remote get-url origin)"
git push -f origin gh-pages

echo ""
echo "✅ gh-pages ブランチへのデプロイ完了"
echo ""
echo "GitHub Pages を有効化してください（初回のみ）:"
echo "  https://github.com/tmh9068-create/Private/settings/pages"
echo "  Branch: gh-pages / / (root)"
echo ""
echo "公開URL: https://tmh9068-create.github.io/Private/"
