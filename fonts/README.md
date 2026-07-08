# Fonts

Drop the supplied Royce font files here (woff2 preferred):

- `Royce-Black.woff2`   → display weight 900 (`--font-display`, `.royce-black`)
- `Royce-Medium.woff2`  → display weight 500 (`--font-display`, `.royce-medium`)

`@font-face` rules are declared in `../css/style.css`. Until the files are
present the display stack falls back to Instrument Sans (semibold), so the
layout stays intact — it just won't show Royce's weight contrast yet.

Operational text uses **Space Mono** and body uses **PP Neue Montreal**
(falling back to **Instrument Sans**), both loaded/available already.
