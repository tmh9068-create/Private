#!/usr/bin/env python3
"""Upload Hamatam backup videos to a new YouTube channel via Data API v3."""

from __future__ import annotations

import argparse
import json
import mimetypes
import sys
import time
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
DEFAULT_MANIFEST = Path(__file__).with_name("hamatam-upload-manifest.json")
DEFAULT_ARCHIVE = Path(__file__).with_name("hamatam-upload-archive.txt")
DEFAULT_SECRETS = Path.home() / ".config" / "youtube-upload" / "client_secrets.json"
DEFAULT_TOKEN = Path.home() / ".config" / "youtube-upload" / "token.json"
DEFAULT_DESCRIPTION = (
    "田村 洸樹（HAMATAM / @hamatam）のアーカイブ再公開動画です。\n"
    "元チャンネル終了に伴い、バックアップから復元しています。\n"
    "Original video ID: {video_id}\n"
    "Original URL: {original_url}\n"
)
DEFAULT_TAGS = ["HAMATAM", "はまたむ", "田村洸樹", "ギター", "ストリートライブ", "アーカイブ"]


def load_manifest(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Manifest must be a JSON array")
    return data


def load_archive(path: Path) -> set[str]:
    if not path.exists():
        return set()
    return {line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()}


def append_archive(path: Path, video_id: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(f"{video_id}\n")


def run_oauth_flow(client_secrets: Path, manual: bool = False) -> Credentials:
    flow = InstalledAppFlow.from_client_secrets_file(str(client_secrets), SCOPES)
    if manual:
        flow.redirect_uri = "http://localhost"
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        print("\n=== OAuth 認証 ===")
        print("1. 次の URL をブラウザで開く（hamatam2006@gmail.com でログイン）:")
        print(auth_url)
        print("\n2. 許可後、ブラウザのアドレスバーに表示される URL をすべてコピー")
        print("   （localhost に接続できない画面でも URL 自体は表示されます）")
        redirect_response = input("\n3. コピーした URL を貼り付けて Enter: ").strip()
        if not redirect_response:
            raise SystemExit("認証 URL が入力されませんでした。")
        flow.fetch_token(authorization_response=redirect_response)
        return flow.credentials

    return flow.run_local_server(port=8080, open_browser=False)


def get_credentials(client_secrets: Path, token_file: Path, manual: bool = False) -> Credentials:
    creds: Credentials | None = None
    if token_file.exists():
        creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    elif not creds or not creds.valid:
        if not client_secrets.exists():
            raise SystemExit(
                "OAuth client secrets not found.\n"
                f"Expected: {client_secrets}\n"
                "See scripts/HAMATAM_AUTO_UPLOAD_SETUP.md for setup steps."
            )
        creds = run_oauth_flow(client_secrets, manual=manual)

    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(creds.to_json(), encoding="utf-8")
    return creds


def upload_video(
    youtube,
    file_path: Path,
    title: str,
    description: str,
    privacy: str,
    tags: list[str],
    category_id: str,
    made_for_kids: bool,
) -> str:
    body = {
        "snippet": {
            "title": title[:100],
            "description": description[:5000],
            "tags": tags,
            "categoryId": category_id,
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": made_for_kids,
        },
    }

    mime_type = mimetypes.guess_type(str(file_path))[0] or "video/*"
    media = MediaFileUpload(str(file_path), mimetype=mime_type, chunksize=8 * 1024 * 1024, resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            print(f"  uploading... {pct}%", flush=True)

    return response["id"]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--archive", type=Path, default=DEFAULT_ARCHIVE)
    parser.add_argument("--client-secrets", type=Path, default=DEFAULT_SECRETS)
    parser.add_argument("--token-file", type=Path, default=DEFAULT_TOKEN)
    parser.add_argument("--privacy", choices=["public", "unlisted", "private"], default="public")
    parser.add_argument("--category-id", default="10", help="10 = Music")
    parser.add_argument("--made-for-kids", action="store_true")
    parser.add_argument("--max-uploads", type=int, default=6, help="Daily quota safe limit")
    parser.add_argument("--sleep-sec", type=int, default=30)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--auth-only", action="store_true")
    parser.add_argument(
        "--manual-auth",
        action="store_true",
        help="スマホ等: 認証URLを開き、リダイレクトURLを手入力",
    )
    args = parser.parse_args()

    creds = get_credentials(args.client_secrets, args.token_file, manual=args.manual_auth)
    if args.auth_only:
        print(f"Authenticated. Token saved to {args.token_file}")
        return 0

    if not args.manifest.exists():
        raise SystemExit(
            f"Manifest not found: {args.manifest}\n"
            "Run: python3 scripts/prepare-hamatam-manifest.py /path/to/backup"
        )

    manifest = load_manifest(args.manifest)
    uploaded = load_archive(args.archive)
    youtube = build("youtube", "v3", credentials=creds)

    success = 0
    skipped = 0
    failed = 0
    attempted = 0

    print(f"=== Hamatam upload start (privacy={args.privacy}) ===")
    for item in manifest:
        if attempted >= args.max_uploads:
            print(f"Reached --max-uploads={args.max_uploads}. Stop for today.")
            break

        source_id = item["id"]
        if source_id in uploaded:
            print(f"SKIP (archive): {source_id}")
            skipped += 1
            continue

        file_path = item.get("file")
        if not file_path:
            print(f"MISSING FILE: {source_id}")
            failed += 1
            continue

        path = Path(file_path)
        if not path.is_file():
            print(f"MISSING FILE: {source_id} -> {path}")
            failed += 1
            continue

        title = item.get("title") or f"HAMATAM archive [{source_id}]"
        description = DEFAULT_DESCRIPTION.format(
            video_id=source_id,
            original_url=item.get("original_url", f"https://www.youtube.com/watch?v={source_id}"),
        )

        print(f"UPLOAD: {source_id} | {title}")
        if args.dry_run:
            success += 1
            attempted += 1
            continue

        try:
            new_id = upload_video(
                youtube=youtube,
                file_path=path,
                title=title,
                description=description,
                privacy=args.privacy,
                tags=DEFAULT_TAGS,
                category_id=args.category_id,
                made_for_kids=args.made_for_kids,
            )
            append_archive(args.archive, source_id)
            uploaded.add(source_id)
            print(f"OK: https://www.youtube.com/watch?v={new_id}")
            success += 1
            attempted += 1
            time.sleep(args.sleep_sec)
        except HttpError as err:
            print(f"FAIL: {source_id} -> {err}", file=sys.stderr)
            failed += 1
            if err.resp.status == 403 and "quota" in str(err).lower():
                print("YouTube API quota exceeded. Retry tomorrow.", file=sys.stderr)
                break

    print(f"=== Done: success={success} skipped={skipped} failed={failed} ===")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
