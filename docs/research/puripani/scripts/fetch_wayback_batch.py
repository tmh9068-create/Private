#!/usr/bin/env python3
import json, re, time, urllib.request
from html import unescape

cat = json.load(open("/opt/cursor/artifacts/puripani/analysis/catalog.json"))
full_raw = json.load(open("/opt/cursor/artifacts/puripani/analysis/entries_full.json"))
if isinstance(full_raw, list):
    full_eids = {str(e["eid"]) for e in full_raw}
elif isinstance(full_raw, dict):
    full_eids = set(full_raw.keys())
else:
    full_eids = set()
missing = [cat[k] for k in sorted(cat, key=lambda x: int(x)) if k not in full_eids]
out_path = "/opt/cursor/artifacts/puripani/analysis/wayback_batch1.json"
try:
    existing = json.load(open(out_path))
except FileNotFoundError:
    existing = []
done = {e["eid"] for e in existing if "error" not in e}
out = existing[:]
headers = {"User-Agent": "Mozilla/5.0 (research)"}
batch = [m for m in missing if m["eid"] not in done][:30]
for m in batch:
    eid = m["eid"]
    url = f"https://web.archive.org/web/2009/http://puripani.jugem.jp/?eid={eid}"
    try:
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req, timeout=45).read().decode("utf-8", "replace")
        body = ""
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
        comments = []
        for c in re.findall(r'class="comment">(.*?)</div>', html, re.S)[:10]:
            t = unescape(re.sub(r"<[^>]+>", " ", c))
            t = re.sub(r"\s+", " ", t).strip()
            if t:
                comments.append(t[:500])
        out.append({
            "eid": eid,
            "title": m["title"],
            "date": m.get("date"),
            "body": body,
            "comments": comments,
        })
        print(f"OK eid={eid} body={len(body)} comments={len(comments)}")
    except Exception as e:
        out.append({"eid": eid, "title": m["title"], "error": str(e)})
        print(f"ERR eid={eid} {e}")
    json.dump(out, open(out_path, "w"), ensure_ascii=False, indent=2)
    time.sleep(3)
print("saved", len(out))
