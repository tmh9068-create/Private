#!/usr/bin/env python3
"""Scan a local backup directory and build an upload manifest for @hamatam videos."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

VIDEO_EXTS = {".mp4", ".mkv", ".webm", ".mov", ".m4v"}
ID_IN_NAME = re.compile(r"\[([A-Za-z0-9_-]{11})\]")
NAMED_FILE = re.compile(
    r"^(?P<date>\d{8}) - (?P<title>.+?) \[(?P<id>[A-Za-z0-9_-]{11})\]\.(?P<ext>[^.]+)$"
)
PLAIN_FILE = re.compile(r"^(?P<id>[A-Za-z0-9_-]{11})\.(?P<ext>[^.]+)$")


def load_url_ids(url_file: Path) -> list[str]:
    ids: list[str] = []
    for line in url_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.search(r"v=([^&]+)", line)
        if match:
            ids.append(match.group(1))
    return ids


def read_info_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def find_video_for_id(backup_dir: Path, video_id: str) -> Path | None:
    candidates: list[Path] = []
    for path in backup_dir.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in VIDEO_EXTS:
            continue
        if video_id in path.name:
            candidates.append(path)
    if not candidates:
        return None
    candidates.sort(key=lambda p: (len(p.name), str(p)))
    return candidates[0]


def title_from_video(path: Path, video_id: str) -> tuple[str | None, str | None]:
    named = NAMED_FILE.match(path.name)
    if named:
        return named.group("title"), named.group("date")

    info = read_info_json(path.with_suffix(".info.json"))
    if not info:
        info = read_info_json(path.parent / f"{path.stem}.info.json")
    if info.get("title"):
        return str(info["title"]), info.get("upload_date")

    plain = PLAIN_FILE.match(path.name)
    if plain and plain.group("id") == video_id:
        return None, None

    match = ID_IN_NAME.search(path.name)
    if match and match.group(1) == video_id:
        stem = path.stem.replace(f"[{video_id}]", "").strip(" -")
        if stem and stem != video_id:
            return stem, None

    return None, None


def build_manifest(backup_dir: Path, url_file: Path) -> list[dict]:
    entries: list[dict] = []
    for video_id in load_url_ids(url_file):
        video_path = find_video_for_id(backup_dir, video_id)
        title, upload_date = (None, None)
        if video_path:
            title, upload_date = title_from_video(video_path, video_id)

        entries.append(
            {
                "id": video_id,
                "title": title or f"HAMATAM archive [{video_id}]",
                "upload_date": upload_date,
                "file": str(video_path) if video_path else None,
                "original_url": f"https://www.youtube.com/watch?v={video_id}",
            }
        )
    return entries


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "backup_dir",
        type=Path,
        help="Directory containing downloaded Hamatam videos",
    )
    parser.add_argument(
        "--url-file",
        type=Path,
        default=Path(__file__).with_name("hamatam-video-urls-plain.txt"),
        help="Plain URL list (one video per line)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).with_name("hamatam-upload-manifest.json"),
        help="Output manifest JSON path",
    )
    args = parser.parse_args()

    if not args.backup_dir.is_dir():
        raise SystemExit(f"Backup directory not found: {args.backup_dir}")

    manifest = build_manifest(args.backup_dir, args.url_file)
    found = sum(1 for item in manifest if item.get("file"))
    args.out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {args.out} ({found}/{len(manifest)} videos found)")


if __name__ == "__main__":
    main()
