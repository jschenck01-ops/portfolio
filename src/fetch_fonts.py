#!/usr/bin/env python3
"""Build-time only: download the Latin woff2 subsets for the three
self-hosted families and write them base64-encoded to src/fonts_b64.json.

This is the ONLY step that touches the network, and it runs at build time
only — the produced HTML makes zero network requests. Re-run to refresh:

    python3 src/fetch_fonts.py

Families:  Fraunces 600 (display) · Source Sans 3 400/600/700 (body) ·
           IBM Plex Mono 500 (eyebrow / numerals / caption)
"""
import re, urllib.request, base64, json, ssl, pathlib

SRC = pathlib.Path(__file__).resolve().parent
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
# CA bundle path in this environment; falls back to system CAs elsewhere.
_ca = "/root/.ccr/ca-bundle.crt"
ctx = ssl.create_default_context(cafile=_ca) if pathlib.Path(_ca).exists() \
      else ssl.create_default_context()

CSS = {
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&display=swap": None,
    "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap": None,
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&display=swap": None,
}

def get(url):
    return urllib.request.urlopen(
        urllib.request.Request(url, headers={"User-Agent": UA}), context=ctx, timeout=30
    ).read()

result = {}
for css_url in CSS:
    css = get(css_url).decode()
    for block in re.findall(r"@font-face\s*\{(.*?)\}", css, re.S):
        if "U+0000-00FF" not in block:       # keep the Latin subset only
            continue
        fam  = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        wght = re.search(r"font-weight:\s*(\d+)", block).group(1)
        url  = re.search(r"url\((https://[^)]+\.woff2)\)", block).group(1)
        data = get(url)
        result[f"{fam}|{wght}"] = base64.b64encode(data).decode()
        print(f"{fam} {wght}: {len(data)} bytes")

(SRC / "fonts_b64.json").write_text(json.dumps(result))
print("Wrote src/fonts_b64.json — total b64 chars:",
      sum(len(v) for v in result.values()))
