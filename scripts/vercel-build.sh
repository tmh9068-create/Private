#!/usr/bin/env bash
set -euo pipefail

echo "==> Generating Prisma client"
npx prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  echo "==> Running database migrations"
  npx prisma migrate deploy
else
  echo "==> WARNING: DATABASE_URL is not set — skipping migrations"
fi

echo "==> Building Next.js app"
npx next build
