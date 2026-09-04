#!/usr/bin/env bash
set -euo pipefail

# Google Drive 上の HAMATAM バックアップフォルダをダウンロード
#
# フォルダ:
#   https://drive.google.com/drive/folders/19kIWb4iUpfliCXhIhKCY0BH5awskWXaD
#
# 事前に Drive 側で「リンクを知っている全員」に閲覧権限を付与してください。
#
# 使い方:
#   ./scripts/download-hamatam-gdrive.sh
#   OUT_DIR=~/Videos/hamatam ./scripts/download-hamatam-gdrive.sh

FOLDER_ID="${GDRIVE_FOLDER_ID:-19kIWb4iUpfliCXhIhKCY0BH5awskWXaD}"
FOLDER_URL="${GDRIVE_FOLDER_URL:-https://drive.google.com/drive/folders/${FOLDER_ID}}"
OUT_DIR="${OUT_DIR:-/opt/cursor/artifacts/youtube-downloads/hamatam}"

ensure_gdown() {
  if command -v gdown >/dev/null 2>&1; then
    return
  fi
  if [[ -x "${HOME}/.local/bin/gdown" ]]; then
    export PATH="${HOME}/.local/bin:${PATH}"
    return
  fi
  echo "Installing gdown..."
  python3 -m pip install --user gdown
  export PATH="${HOME}/.local/bin:${PATH}"
}

ensure_gdown
mkdir -p "${OUT_DIR}"

echo "=== Google Drive download start: $(date) ==="
echo "Folder: ${FOLDER_URL}"
echo "Output: ${OUT_DIR}"

if ! gdown --folder "${FOLDER_URL}" -O "${OUT_DIR}"; then
  cat >&2 <<EOF

エラー: Google Drive フォルダを取得できませんでした (401/403)。

対処:
  1. Drive でフォルダを開く
  2. 右上「共有」→「リンクを知っている全員」に変更（閲覧者）
  3. 再度このスクリプトを実行

フォルダ URL:
  ${FOLDER_URL}
EOF
  exit 1
fi

echo ""
echo "=== Download complete ==="
find "${OUT_DIR}" -type f \( -iname '*.mp4' -o -iname '*.mkv' -o -iname '*.webm' \) | wc -l | xargs -I{} echo "Video files: {}"
du -sh "${OUT_DIR}" | awk '{print "Total size:", $1}'
