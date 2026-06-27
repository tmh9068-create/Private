#!/usr/bin/env bash
set -euo pipefail

# YouTubeチャンネルの全動画・配信アーカイブをダウンロードするスクリプト
#
# 使い方:
#   1. tmh068@gmail.com で YouTube にログインしたブラウザから cookies.txt をエクスポート
#      https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies
#   2. ./scripts/download-youtube-channel.sh /path/to/cookies.txt [CHANNEL_URL]
#
# 例:
#   ./scripts/download-youtube-channel.sh ~/cookies.txt
#   ./scripts/download-youtube-channel.sh ~/cookies.txt https://www.youtube.com/@youtubetmh6174

COOKIES_FILE="${1:-}"
CHANNEL_URL="${2:-https://www.youtube.com/@youtubetmh6174}"
OUT_DIR="${OUT_DIR:-/opt/cursor/artifacts/youtube-downloads/tmh068}"
ARCHIVE_FILE="${OUT_DIR}/download-archive.txt"
LOG_FILE="${OUT_DIR}/download.log"

if [[ -z "${COOKIES_FILE}" || ! -f "${COOKIES_FILE}" ]]; then
  echo "エラー: cookies.txt のパスを指定してください。" >&2
  echo "例: $0 ~/cookies.txt" >&2
  exit 1
fi

if ! command -v yt-dlp >/dev/null 2>&1; then
  if [[ -x "${HOME}/.local/bin/yt-dlp" ]]; then
    export PATH="${HOME}/.local/bin:${PATH}"
  else
    echo "エラー: yt-dlp が見つかりません。pip install yt-dlp を実行してください。" >&2
    exit 1
  fi
fi

if [[ -x "${HOME}/.deno/bin/deno" ]]; then
  export PATH="${HOME}/.deno/bin:${PATH}"
fi

mkdir -p "${OUT_DIR}"

echo "=== YouTube ダウンロード開始: $(date) ===" | tee "${LOG_FILE}"
echo "チャンネル: ${CHANNEL_URL}" | tee -a "${LOG_FILE}"
echo "保存先: ${OUT_DIR}" | tee -a "${LOG_FILE}"

yt-dlp \
  --cookies "${COOKIES_FILE}" \
  --download-archive "${ARCHIVE_FILE}" \
  --write-info-json \
  --write-thumbnail \
  --convert-thumbnails jpg \
  --ignore-errors \
  --no-overwrites \
  --retries 10 \
  --fragment-retries 10 \
  --sleep-interval 2 \
  --max-sleep-interval 5 \
  -f "bv*[height<=1080]+ba/b[height<=1080]/b" \
  -o "%(upload_date)s - %(title)s [%(id)s].%(ext)s" \
  "${CHANNEL_URL}/videos" \
  "${CHANNEL_URL}/streams" \
  2>&1 | tee -a "${LOG_FILE}"

echo "=== ダウンロード完了: $(date) ===" | tee -a "${LOG_FILE}"
echo "保存先: ${OUT_DIR}"
