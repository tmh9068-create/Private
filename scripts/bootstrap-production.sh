#!/usr/bin/env bash
set -euo pipefail

echo "==> AI-Driven School Student Portal — Production Bootstrap"
echo ""

missing=()
for key in AUTH_SECRET DATABASE_URL AUTH_RESEND_KEY AUTH_RESEND_FROM; do
  if [ -z "${!key:-}" ]; then
    missing+=("$key")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "❌ 必須の環境変数が未設定です:"
  printf '   - %s\n' "${missing[@]}"
  echo ""
  echo "Vercel ダッシュボードまたは .env に設定してから再実行してください。"
  echo "詳細: DEPLOY.md"
  exit 1
fi

echo "==> Prisma client"
npx prisma generate

echo "==> Database migrations"
npx prisma migrate deploy

echo "==> Seed allowed emails"
npm run db:seed

echo ""
echo "✅ Production bootstrap complete"
echo "   AUTH_URL: ${AUTH_URL:-（VERCEL_URL から自動検出）}"
echo "   Health:   /api/health"
