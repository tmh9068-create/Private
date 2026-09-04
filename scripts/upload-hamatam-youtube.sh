#!/usr/bin/env bash
set -euo pipefail

# @hamatam バックアップ動画を新しい YouTube チャンネルへ一括アップロード
#
# 事前準備:
#   1. 新しい Google / YouTube アカウントを作成
#   2. Google Cloud で OAuth クライアント（デスクトップ）を作成
#   3. client_secrets.json を ~/.config/youtube-upload/ に配置
#   4. バックアップ動画を BACKUP_DIR に置く
#
# 使い方:
#   BACKUP_DIR=~/Downloads/hamatam ./scripts/upload-hamatam-youtube.sh auth
#   BACKUP_DIR=~/Downloads/hamatam ./scripts/upload-hamatam-youtube.sh dry-run
#   BACKUP_DIR=~/Downloads/hamatam ./scripts/upload-hamatam-youtube.sh upload
#
# 詳細: scripts/HAMATAM_YOUTUBE_REUPLOAD.md

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/opt/cursor/artifacts/youtube-downloads/hamatam}"
MANIFEST="${MANIFEST:-$ROOT_DIR/scripts/hamatam-upload-manifest.json}"
CLIENT_SECRETS="${CLIENT_SECRETS:-$HOME/.config/youtube-upload/client_secrets.json}"
TOKEN_FILE="${TOKEN_FILE:-$HOME/.config/youtube-upload/token.json}"
PRIVACY="${PRIVACY:-public}"
MAX_UPLOADS="${MAX_UPLOADS:-6}"

PYTHON="${PYTHON:-python3}"

ensure_python_deps() {
  if ! "$PYTHON" -c "import googleapiclient.discovery" 2>/dev/null; then
    echo "Installing Python dependencies..."
    "$PYTHON" -m pip install --user google-api-python-client google-auth-oauthlib
  fi
}

usage() {
  cat <<EOF
Usage: $0 <command>

Commands:
  auth       OAuth 認証のみ（ブラウザで許可）
  manifest   バックアップから manifest を生成
  dry-run    アップロード対象を表示（実際には送らない）
  upload     アップロード実行（1日 ${MAX_UPLOADS} 本まで）
  help       このヘルプ

Environment:
  BACKUP_DIR      バックアップ動画ディレクトリ (default: ${BACKUP_DIR})
  PRIVACY         public | unlisted | private (default: ${PRIVACY})
  MAX_UPLOADS     1回の実行上限 (default: ${MAX_UPLOADS})
  CLIENT_SECRETS  OAuth JSON パス
  TOKEN_FILE      保存トークンパス
EOF
}

cmd="${1:-help}"

case "$cmd" in
  auth)
    ensure_python_deps
    "$PYTHON" "$ROOT_DIR/scripts/upload_hamatam_youtube.py" \
      --client-secrets "$CLIENT_SECRETS" \
      --token-file "$TOKEN_FILE" \
      --auth-only
    ;;
  manifest)
    if [[ ! -d "$BACKUP_DIR" ]]; then
      echo "エラー: BACKUP_DIR が見つかりません: $BACKUP_DIR" >&2
      exit 1
    fi
    "$PYTHON" "$ROOT_DIR/scripts/prepare-hamatam-manifest.py" "$BACKUP_DIR" --out "$MANIFEST"
    ;;
  dry-run)
    ensure_python_deps
    "$0" manifest
    "$PYTHON" "$ROOT_DIR/scripts/upload_hamatam_youtube.py" \
      --manifest "$MANIFEST" \
      --client-secrets "$CLIENT_SECRETS" \
      --token-file "$TOKEN_FILE" \
      --privacy "$PRIVACY" \
      --max-uploads "$MAX_UPLOADS" \
      --dry-run
    ;;
  upload)
    ensure_python_deps
    if [[ ! -f "$CLIENT_SECRETS" ]]; then
      echo "エラー: OAuth クライアント JSON がありません: $CLIENT_SECRETS" >&2
      echo "scripts/HAMATAM_YOUTUBE_REUPLOAD.md を参照してください。" >&2
      exit 1
    fi
    "$0" manifest
    "$PYTHON" "$ROOT_DIR/scripts/upload_hamatam_youtube.py" \
      --manifest "$MANIFEST" \
      --client-secrets "$CLIENT_SECRETS" \
      --token-file "$TOKEN_FILE" \
      --privacy "$PRIVACY" \
      --max-uploads "$MAX_UPLOADS"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "不明なコマンド: $cmd" >&2
    usage
    exit 1
    ;;
esac
