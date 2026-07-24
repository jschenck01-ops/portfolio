# Syringe Anatomy — accessible drag-and-drop labeling activity

A single, self-contained, WCAG 2.1 AA labeling activity for a biotechnology
certificate course. The learner matches ten part names to positions on a
syringe diagram, using any of three synchronized input paths: **pointer
drag**, **keyboard grab-and-place**, or a **per-slot select**.

**Deliverable:** [`Syringe Anatomy.html`](./Syringe%20Anatomy.html) — one
file that runs by double-clicking (`file://`). No server, no internet, no
browser storage. Open it and go.

- Accessibility details: [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)
- Design system: precision-instrument / clinical-lab. Fraunces (display),
  Source Sans 3 (body), IBM Plex Mono (eyebrow, numerals, caption) — all
  self-hosted as inlined base64. Signal-teal primary with a sparing amber
  accent.
- Motion: GSAP 3.15 with DrawSVG and SplitText (all vendored and inlined —
  every GSAP plugin is free as of 3.13). The leader lines draw in on load
  (DrawSVG), the title character-reveals (SplitText), the term bank staggers
  up, and the summary gauge draws and counts up. All motion is reduced-motion
  safe: initial states are set only inside `gsap.matchMedia`, so with reduced
  motion — or no JS — everything is visible and usable with zero animation.

## It's a reusable engine, not a one-off

Content is fully separated from engine logic. To reskin the activity for a
new diagram (microscope, lab bench, PPE…), edit **only** the `CONTENT` object
near the top of the file (or `src/template.html`) and rebuild:

```js
const CONTENT = {
  title, eyebrow, subtitle, instructions,
  diagramSVG,                                   // inline SVG of the subject
  terms: [{ id, label }, …],                    // the word bank (shuffled at runtime)
  slots: [{ id, correctTermId, x, y, positionText, recap }, …]  // drop targets
};
```

`x`/`y` are the blank's centre in the SVG's `1000 × 620` viewBox;
`positionText` is the spoken position phrase used in the accessible name and
announcements. The engine reads only from `CONTENT` — it renders the bank and
slots, drives the three input paths, scoring, feedback, and the summary.

## SCORM

Every score/completion report routes through a single
`reportResult(scorePercent, passed, isComplete)` seam, with a commented
SCORM 1.2 / 2004 adapter stub ready to wire to an LMS. Content data stays
separate from engine logic.

## Building from source

The committed HTML is already built. To rebuild after editing sources:

```bash
npm i gsap            # vendors GSAP locally (once)
python3 src/build.py  # inlines GSAP + fonts + SVG + engine -> "Syringe Anatomy.html"
```

Sources live in `src/`:

| File | Purpose |
|---|---|
| `template.html` | HTML shell, CSS design system, and the `CONTENT` data |
| `engine.js` | The data-driven labeling engine (three input paths, scoring, summary, SCORM seam) |
| `diagram.svg` | The inline syringe diagram with leader lines |
| `fonts_b64.json` | Base64 Latin woff2 subsets (committed, so the build needs no network) |
| `fetch_fonts.py` | Build-time only: refreshes `fonts_b64.json` from Google Fonts |
| `build.py` | Inlines everything into the self-contained deliverable |

Fonts are fetched **once at build time** and inlined; the shipped HTML makes
no network requests.

## Test checklist

Confirmed on the built file:

- [x] **Opens from `file://`** with no console errors and **zero external
      network requests** at runtime (fonts, GSAP, and SVG all inlined).
- [x] **Keyboard-only completion** — grab a term (Enter/Space), move focus
      (Tab / arrow keys), place it (Enter) through all ten parts; Escape
      cancels; a placed term can be picked up and moved again.
- [x] **Pointer drag** — drag onto a blank; dropping onto a filled blank
      swaps; drop onto the bank returns a term.
- [x] **Per-slot select** — each blank's native `<select>` places/removes and
      stays in sync with the other two paths.
- [x] **Screen reader** — pick-up, placement, removal, swap, and check
      results are announced via the polite live region; each blank reads its
      position text and current contents; the decorative SVG is skipped.
- [x] **Status is not color-only** — icon (✓ / ✕) + word ("Correct" /
      "Incorrect") + color on every graded blank.
- [x] **Check / Try again / Reset / Show answers** — Try again clears only
      the incorrect blanks and keeps the correct ones; Reset clears all; the
      summary gauge draws and counts up.
- [x] **Reduced motion** — with `prefers-reduced-motion: reduce`, everything
      is visible and usable with **no transforms** (leader lines rendered,
      terms visible, gauge set directly).
- [x] **No storage** — no localStorage / sessionStorage / cookies; state
      resets on reload.
- [x] **Single self-contained offline file.**

### Automated smoke test

```bash
npm i -D playwright axe-core
node src/verify.mjs      # asserts: no errors, no network, all three paths, reduced-motion
node src/a11y-scan.mjs   # axe-core WCAG 2.1 A/AA scan across 5 states — 0 violations
```

Both the overlay (desktop) and the stacked-list reflow (≤ 760px / high zoom)
are exercised; the activity is usable at 320px with no horizontal scroll.
