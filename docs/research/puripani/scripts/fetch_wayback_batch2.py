#!/usr/bin/env python3
"""Fetch missing jugem entries via Wayback with specific snapshot timestamps."""
import json
import re
import time
import urllib.request
from html import unescape

SNAPSHOTS = [
    "20090503072533",
    "20090504194334",
    "20090501022718",
    "20081219230603",
    "20090503000000",
]

cat = json.load(open("/opt/cursor/artifacts/puripani/analysis/catalog.json"))
full_raw = json.load(open("/opt/cursor/artifacts/puripani/analysis/entries_full.json"))
full_eids = set(full_raw.keys()) if isinstance(full_raw, dict) else {str(e["eid"]) for e in full_raw}
missing = [cat[k] for k in sorted(cat, key=lambda x: int(x)) if k not in full_eids]

out_path = "/opt/cursor/artifacts/puripani/analysis/wayback_batch2.json"
try:
    existing = json.load(open(out_path))
except FileNotFoundError:
    existing = []
done = {str(e["eid"]) for e in existing if "error" not in e and e.get("body")}
out = existing[:]
headers = {"User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)"}

batch = [m for m in missing if str(m["eid"]) not in done][:25]
for m in batch:
    eid = str(m["eid"])
    body = ""
    comments = []
    used_snap = None
    last_err = None
    for snap in SNAPSHOTS:
        url = f"https://web.archive.org/web/{snap}/http://puripani.jugem.jp/?eid={eid}"
        try:
            req = urllib.request.Request(url, headers=headers)
            html = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
            if "Got an HTTP" in html or len(html) < 500:
                continue
            for pat in [
                r'<div class="jgm_entrybody[^"]*">(.*?)</div>',
                r'class="entry_body">(.*?)</div>',
                r'<div class="entry">(.*?)</div>',
            ]:
                mm = re.search(pat, html, re.S | re.I)
                if mm:
                    body = re.sub(r"<[^>]+>", " ", mm.group(1))
                    body = unescape(re.sub(r"\s+", " ", body)).strip()
                    if len(body) > 50:
                        break
            for c in re.findall(r'class="comment">(.*?)</div>', html, re.S)[:15]:
                t = unescape(re.sub(r"<[^>]+>", " ", c))
                t = re.sub(r"\s+", " ", t).strip()
                if t and len(t) > 3:
                    comments.append(t[:600])
            if body:
                used_snap = snap
                break
        except Exception as e:
            last_err = str(e)
        time.sleep(1.5)

    if body:
        out.append({
            "eid": int(eid),
            "title": m["title"],
            "date": m.get("date"),
            "snapshot": used_snap,
            "body": body,
            "comments": comments,
        })
        print(f"OK eid={eid} snap={used_snap} body={len(body)} comments={len(comments)}")
    else:
        out.append({"eid": int(eid), "title": m["title"], "error": last_err or "no body"})
        print(f"ERR eid={eid} {last_err}")
    json.dump(out, open(out_path, "w"), ensure_ascii=False, indent=2)
    time.sleep(2)

print(f"saved {len(out)} entries, ok={sum(1 for e in out if e.get('body'))}")
