#!/usr/bin/env python3
"""Generate copy-paste metadata for manually uploaded @hamatam2006 videos."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).parent
MANIFEST = ROOT / "hamatam-original-manifest.json"
OUT_JSON = ROOT / "hamatam-video-metadata.json"
OUT_MD = ROOT / "HAMATAM_METADATA_EDIT.md"

DEFAULT_TAGS = [
    "HAMATAM",
    "はまたむ",
    "田村洸樹",
    "ギター",
    "DEPAPEPE",
    "アコギ",
    "ストリートライブ",
    "アーカイブ",
]

UNLISTED_IDS = {
    "9T147VMIkNE",
    "QKtnRiYUDP8",
    "uSNdxLm7Wlk",
    "6sJAap_yMmk",
    "scpBTdGPzdg",
}


def description_for(item: dict) -> str:
    return (
        "田村 洸樹（HAMATAM）のギター演奏アーカイブです。\n"
        "旧 @hamatam チャンネル終了に伴い、バックアップから再公開しています。\n\n"
        f"元動画: {item['url']}\n"
        f"元動画ID: {item['id']}\n"
    )


def channel_profile() -> dict:
    return {
        "name": "Hamatam",
        "handle": "@hamatam2006",
        "url": "https://www.youtube.com/@hamatam2006",
        "description": (
            "田村 洸樹（HAMATAM / はまたむ）のギター演奏アーカイブチャンネルです。\n\n"
            "DEPAPEPE のカバー、ストリートライブ、ライブハウス出演などの録画を再公開しています。\n"
            "旧チャンネル @hamatam の動画をバックアップから復元したものです。\n\n"
            "▶ 演奏者: 田村 洸樹（HAMATAM）\n"
            "▶ ジャンル: アコースティックギター / DEPAPEPE\n"
            "▶ お問い合わせ: hamatam2006@gmail.com"
        ),
        "playlists": [
            {
                "title": "名古屋栄タイトロープ",
                "video_ids": ["zr8XpK2p130", "GyuI6oz1O4c", "z2y5EPnPajY", "w3mK90_URFU"],
            },
            {
                "title": "DEPAPEPE カバー",
                "video_ids": [
                    "zr8XpK2p130",
                    "GyuI6oz1O4c",
                    "z2y5EPnPajY",
                    "w3mK90_URFU",
                    "bdl3GdpZjxI",
                    "wDayyaeRS8I",
                    "NZU7RU46IrA",
                    "FIn5EJZsXNY",
                    "vB6SPMGpmqs",
                    "AsfMJBrDu9s",
                    "uYfok57zdiI",
                    "HwCQgP4zslE",
                    "ktMx5Cvs01M",
                ],
            },
            {
                "title": "ライブ・イベント",
                "video_ids": [
                    "T39NAxlcEkk",
                    "3J9bpBLI5EM",
                    "Id0SNj6qDE8",
                    "cBilw2zSU5w",
                    "G5GpI8dh0oQ",
                    "bdl3GdpZjxI",
                ],
            },
            {
                "title": "ライオンズクラブ / スピーチ（限定公開推奨）",
                "video_ids": [
                    "9T147VMIkNE",
                    "QKtnRiYUDP8",
                    "uSNdxLm7Wlk",
                    "6sJAap_yMmk",
                    "scpBTdGPzdg",
                ],
            },
        ],
    }


def build_entries(manifest: list[dict]) -> list[dict]:
    entries = []
    for index, item in enumerate(manifest, start=1):
        privacy = "unlisted" if item["id"] in UNLISTED_IDS else "public"
        entries.append(
            {
                "no": index,
                "original_id": item["id"],
                "original_url": item["url"],
                "source_file": item.get("file", ""),
                "title": item["title"],
                "description": description_for(item),
                "tags": DEFAULT_TAGS,
                "category": "音楽",
                "category_id": "10",
                "privacy": privacy,
                "made_for_kids": False,
            }
        )
    return entries


def render_markdown(channel: dict, entries: list[dict]) -> str:
    lines = [
        "# HAMATAM 動画メタデータ編集ガイド",
        "",
        "手動アップロード後、YouTube Studio で各動画の情報を以下に合わせて編集してください。",
        "",
        "チャンネル: https://www.youtube.com/@hamatam2006",
        "",
        "## チャンネル設定（1回だけ）",
        "",
        "YouTube Studio → **カスタマイズ** → **基本情報**",
        "",
        "### チャンネル説明（コピペ）",
        "",
        "```",
        channel["description"],
        "```",
        "",
        "### おすすめプレイリスト（任意）",
        "",
    ]
    for playlist in channel["playlists"]:
        lines.append(f"- **{playlist['title']}** ({len(playlist['video_ids'])}本)")

    lines.extend(
        [
            "",
            "## 各動画の編集手順",
            "",
            "1. YouTube Studio → **コンテンツ**",
            "2. 動画を選択 → **詳細**",
            "3. 下表の **タイトル・説明・タグ** をコピペ",
            "4. **カテゴリ**: 音楽",
            "5. **子供向け**: いいえ",
            "6. **公開設定**: 表の推奨値",
            "",
            "> 手動アップロード時にタイトルが「2026年9月6日」など日付だけになっている場合、",
            "> Drive のファイル名または下表の **元ファイル名** と照合してください。",
            "",
            "---",
            "",
        ]
    )

    for entry in entries:
        lines.extend(
            [
                f"## {entry['no']}. {entry['title']}",
                "",
                f"- **元ファイル名**: `{entry['source_file']}`",
                f"- **元URL**: {entry['original_url']}",
                f"- **推奨公開設定**: {entry['privacy']}",
                "",
                "### タイトル",
                "",
                "```",
                entry["title"],
                "```",
                "",
                "### 説明",
                "",
                "```",
                entry["description"].rstrip(),
                "```",
                "",
                "### タグ（カンマ区切りで入力）",
                "",
                "```",
                ", ".join(entry["tags"]),
                "```",
                "",
                "---",
                "",
            ]
        )

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=MANIFEST)
    parser.add_argument("--out-json", type=Path, default=OUT_JSON)
    parser.add_argument("--out-md", type=Path, default=OUT_MD)
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    channel = channel_profile()
    entries = build_entries(manifest)

    payload = {"channel": channel, "videos": entries}
    args.out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.out_md.write_text(render_markdown(channel, entries), encoding="utf-8")
    print(f"Wrote {args.out_json}")
    print(f"Wrote {args.out_md} ({len(entries)} videos)")


if __name__ == "__main__":
    main()
