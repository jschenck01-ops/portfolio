# Build: Professional Workplace Scenarios

The deliverable `professional-workplace-scenarios.html` (repo root) is a single,
self-contained, offline learning object. It is generated from these sources so
the vendored assets stay reproducible.

## Sources
- `template.html` - all HTML/CSS/JS, with injection tokens `<!--FONTS-->` and `<!--GSAP-->`.
- `build.mjs` - vendors fonts + GSAP into the single output file.

## Rebuild
```bash
npm i gsap@^3.13 @fontsource/fraunces @fontsource/inter @fontsource/ibm-plex-mono
node build.mjs   # writes ../../professional-workplace-scenarios.html
```

## What the build inlines
- Fonts: Fraunces 600, Inter 400/600, IBM Plex Mono 500 as base64 `@font-face`
  (self-hosted via @fontsource, no Google Fonts / network requests).
- GSAP 3.13+ core + DrawSVGPlugin + SplitText, pasted inline (no CDN).
- A computed double-helix SVG (the cover signature) drawn with DrawSVG.

The output makes zero runtime network requests and uses no browser storage.
