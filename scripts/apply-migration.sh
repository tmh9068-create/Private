#!/bin/bash
# Supabaseにマイグレーションを適用
set -euo pipefail

PROJECT_REF="ezovbitgnocuyqlewuxg"
SQL_FILE="$(dirname "$0")/../supabase/migrate.sql"

echo "Applying migration to ${PROJECT_REF}..."

python3 << PY
import os, json, urllib.request

token = os.environ["SUPABASE_ACCESS_TOKEN"]
project = "${PROJECT_REF}"
sql = open("${SQL_FILE}").read()

# ステートメント単位で実行（トリガー等を個別に）
statements = []
buf = []
for line in sql.split("\n"):
    stripped = line.strip()
    if stripped.startswith("--") or not stripped:
        continue
    buf.append(line)
    if stripped.endswith(";"):
        statements.append("\n".join(buf))
        buf = []

for i, stmt in enumerate(statements, 1):
    data = json.dumps({"query": stmt}).encode()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{project}/database/query",
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; majiai-drill/1.0)",
        },
        method="POST",
    )
    try:
        resp = urllib.request.urlopen(req)
        print(f"  [{i}/{len(statements)}] OK")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "already exists" in body or "duplicate" in body.lower():
            print(f"  [{i}/{len(statements)}] SKIP (exists)")
        else:
            print(f"  [{i}/{len(statements)}] ERR: {body[:200]}")
            raise

print("Migration complete.")
PY
