#!/bin/bash
# RPC・トリガーを一括適用（$$ ブロック対応）
set -euo pipefail

PROJECT_REF="ezovbitgnocuyqlewuxg"
SQL_FILE="$(dirname "$0")/../supabase/rpc.sql"

echo "Applying RPC to ${PROJECT_REF}..."

python3 << PY
import os, json, urllib.request, time

token = os.environ["SUPABASE_ACCESS_TOKEN"]
project = "${PROJECT_REF}"
sql = open("${SQL_FILE}").read()

data = json.dumps({"query": sql}).encode()
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

for attempt in range(5):
    try:
        urllib.request.urlopen(req, timeout=120)
        print("RPC migration complete.")
        break
    except Exception as e:
        if attempt < 4:
            time.sleep(2 ** attempt)
            continue
        raise
PY
