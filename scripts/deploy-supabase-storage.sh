#!/bin/bash
set -euo pipefail

PROJECT_REF="ezovbitgnocuyqlewuxg"
BUCKET="drill-web"
OUT_DIR="/workspace/out"
BASE_URL="https://${PROJECT_REF}.supabase.co"

echo "Fetching service role key..."
SERVICE_KEY=$(curl -s -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys" | \
  python3 -c "import sys,json; print(next(k['api_key'] for k in json.load(sys.stdin) if k['name']=='service_role'))")

echo "Creating bucket..."
curl -s -X POST "${BASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"${BUCKET}\",\"name\":\"${BUCKET}\",\"public\":true}" || true

count=0
total=$(find "$OUT_DIR" -type f | wc -l)
echo "Uploading ${total} files..."

while IFS= read -r file; do
  rel="${file#$OUT_DIR/}"
  ctype=$(file -b --mime-type "$file")
  curl -s -X POST "${BASE_URL}/storage/v1/object/${BUCKET}/${rel}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Content-Type: ${ctype}" \
    -H "x-upsert: true" \
    --data-binary "@${file}" > /dev/null
  count=$((count + 1))
  if (( count % 20 == 0 || count == total )); then
    echo "  ${count}/${total}"
  fi
done < <(find "$OUT_DIR" -type f)

LOGIN_URL="${BASE_URL}/storage/v1/object/public/${BUCKET}/login/index.html"
echo ""
echo "Deployed!"
echo "Login URL: ${LOGIN_URL}"
