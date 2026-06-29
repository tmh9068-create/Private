#!/usr/bin/env bash
set -uo pipefail

# クラウド完結 YouTube ダウンロード（OpenUtils 公開 API 利用）
# API: https://ytdl.openutils.net/api-docs
#
# 使い方:
#   ./scripts/download-openutils-cloud.sh
#   URL_FILE=scripts/hamatam-video-urls-plain.txt OUT_DIR=./downloads ./scripts/download-openutils-cloud.sh

OUT_DIR="${OUT_DIR:-/opt/cursor/artifacts/youtube-downloads/hamatam}"
URL_FILE="${URL_FILE:-$(cd "$(dirname "$0")/.." && pwd)/scripts/hamatam-video-urls-plain.txt}"
LOG="$OUT_DIR/openutils-download.log"
FMT="${FMT:-mp4-720}"
SLEEP_SEC="${SLEEP_SEC:-15}"
API_BASE="${API_BASE:-https://ytdl.openutils.net}"

mkdir -p "$OUT_DIR"
: > "$LOG"

success=0
fail=0
skip=0

echo "=== OpenUtils bulk download start: $(date) ===" | tee -a "$LOG"

while IFS= read -r url; do
  [[ -z "$url" ]] && continue
  id=$(echo "$url" | sed -n 's/.*v=\([^&]*\).*/\1/p')
  outfile="$OUT_DIR/${id}.mp4"

  if [[ -f "$outfile" ]] && file "$outfile" | grep -q "ISO Media"; then
    echo "SKIP (exists): $id" | tee -a "$LOG"
    skip=$((skip + 1))
    continue
  fi

  enc=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$url'))")
  echo "--- Downloading $id ---" | tee -a "$LOG"

  ok=0
  for attempt in 1 2 3 4 5; do
    http_code=$(curl -sL --max-time 600 \
      "${API_BASE}/api/stream/video?url=${enc}&fmt=${FMT}" \
      -o "$outfile" \
      -w "%{http_code}")

    if [[ "$http_code" == "200" ]] && file "$outfile" | grep -q "ISO Media"; then
      size=$(du -h "$outfile" | cut -f1)
      echo "OK: $id ($size) attempt=$attempt" | tee -a "$LOG"
      success=$((success + 1))
      ok=1
      break
    fi

    echo "RETRY $attempt: $id http=$http_code" | tee -a "$LOG"
    rm -f "$outfile"
    sleep $((attempt * 10))
  done

  if [[ "$ok" -eq 0 ]]; then
    echo "FAIL: $id" | tee -a "$LOG"
    fail=$((fail + 1))
  fi

  sleep "$SLEEP_SEC"
done < "$URL_FILE"

echo "=== Done $(date): success=$success skip=$skip fail=$fail ===" | tee -a "$LOG"
