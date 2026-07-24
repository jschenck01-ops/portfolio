#!/usr/bin/env python3
"""Assemble the self-contained Syringe Anatomy activity.

Inlines GSAP core, base64 fonts, the SVG diagram, and the engine into one
offline HTML file. Run from anywhere:

    python3 src/build.py

Requires ../node_modules/gsap (run `npm i gsap` at the repo root first).
Fonts are read from the committed src/fonts_b64.json so the build needs no
network. To refresh the fonts, re-run src/fetch_fonts.py.
"""
import json, pathlib, re, sys

SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parent

template = (SRC / "template.html").read_text()
gsap     = (ROOT / "node_modules/gsap/dist/gsap.min.js").read_text()
diagram  = (SRC / "diagram.svg").read_text().strip()
engine   = (SRC / "engine.js").read_text()
fonts    = json.loads((SRC / "fonts_b64.json").read_text())

# --- guard: injected JS blobs must not break out of their <script> ---
for name, blob in [("gsap", gsap), ("engine", engine)]:
    if "</script>" in blob.lower():
        sys.exit(f"ERROR: {name} contains </script>")

out = template
out = out.replace("/*__GSAP_MIN__*/", gsap)
out = out.replace("`__DIAGRAM_SVG__`", "`" + diagram + "`")
out = out.replace("/* __ENGINE__ */", engine)

font_map = {
    "__F_FRAUNCES_600__": "Fraunces|600",
    "__F_SANS_400__":     "Source Sans 3|400",
    "__F_SANS_600__":     "Source Sans 3|600",
    "__F_SANS_700__":     "Source Sans 3|700",
    "__F_MONO_500__":     "IBM Plex Mono|500",
}
for token, key in font_map.items():
    if key not in fonts:
        sys.exit(f"ERROR: missing font {key}")
    out = out.replace(token, fonts[key])

remaining = re.findall(r"__(?:GSAP_MIN|DIAGRAM_SVG|ENGINE|F_[A-Z0-9_]+)__", out)
if remaining:
    sys.exit(f"ERROR: tokens remain: {set(remaining)}")

target = ROOT / "Syringe Anatomy.html"
target.write_text(out)
print(f"Wrote {target.name} ({len(out.encode()) / 1024:.0f} KB)")
