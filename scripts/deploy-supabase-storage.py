#!/usr/bin/env python3
"""Upload static export to Supabase Storage for public hosting."""
import os
import json
import mimetypes
import urllib.request
import urllib.error
from pathlib import Path

PROJECT_REF = "ezovbitgnocuyqlewuxg"
BUCKET = "drill-web"
OUT_DIR = Path(__file__).resolve().parent.parent / "out"
BASE_URL = f"https://{PROJECT_REF}.supabase.co"


def get_service_key() -> str:
    token = os.environ["SUPABASE_ACCESS_TOKEN"]
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys",
        headers={"Authorization": f"Bearer {token}"},
    )
    keys = json.load(urllib.request.urlopen(req))
    return next(k["api_key"] for k in keys if k["name"] == "service_role")


def api_request(key: str, method: str, path: str, data: bytes | None = None, content_type: str = "application/json"):
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
    }
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(f"{BASE_URL}{path}", data=data, headers=headers, method=method)
    try:
        return urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if e.code not in (400, 409):
            raise
        return None


def ensure_bucket(key: str):
    payload = json.dumps({"id": BUCKET, "name": BUCKET, "public": True}).encode()
    api_request(key, "POST", "/storage/v1/bucket", payload)
    print(f"Bucket '{BUCKET}' ready")


def upload_file(key: str, local: Path, remote: str):
    content = local.read_bytes()
    ctype = mimetypes.guess_type(local.name)[0] or "application/octet-stream"
    path = f"/storage/v1/object/{BUCKET}/{remote}"
    api_request(key, "POST", path, content, ctype)
    # Upsert if exists
    headers_path = f"/storage/v1/object/{BUCKET}/{remote}"
    req = urllib.request.Request(
        f"{BASE_URL}{headers_path}",
        data=content,
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": ctype,
            "x-upsert": "true",
        },
        method="POST",
    )
    urllib.request.urlopen(req)


def main():
    service_key = get_service_key()
    ensure_bucket(service_key)

    files = [p for p in OUT_DIR.rglob("*") if p.is_file()]
    print(f"Uploading {len(files)} files...")

    for i, local in enumerate(files, 1):
        remote = str(local.relative_to(OUT_DIR)).replace("\\", "/")
        upload_file(service_key, local, remote)
        if i % 10 == 0 or i == len(files):
            print(f"  {i}/{len(files)}")

    login_url = f"{BASE_URL}/storage/v1/object/public/{BUCKET}/login/index.html"
    print(f"\nDeployed!")
    print(f"Login URL: {login_url}")


if __name__ == "__main__":
    main()
