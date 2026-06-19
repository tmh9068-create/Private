#!/usr/bin/env bash
set -euo pipefail

echo "==> AI-Driven School Student Portal — Local Setup"
echo ""

if ! command -v docker &>/dev/null; then
  echo "Docker が見つかりません。"
  echo "Neon 等の PostgreSQL URL を .env の DATABASE_URL に設定してください。"
  echo "https://neon.tech"
else
  echo "==> Starting PostgreSQL (docker compose)"
  docker compose up -d
  echo "    Waiting for database..."
  sleep 3
fi

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
  echo "    AUTH_SECRET を生成中..."
  SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  if grep -q '^AUTH_SECRET=change-me' .env; then
    sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .env
  fi
fi

echo "==> Installing dependencies"
npm install

echo "==> Running migrations"
npx prisma migrate deploy

echo "==> Seeding database"
npm run db:seed

echo ""
echo "✅ Setup complete! Run: npm run dev"
echo "   Login: http://localhost:3000/login"
echo "   Dev user: dev-fri@example.com (開発用ログインボタン)"
