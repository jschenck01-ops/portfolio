# Accessibility Conformance — Professional Workplace Scenarios

**Learning object:** `professional-workplace-scenarios.html`
**Type:** Self-contained, offline HTML5 scenario-based decision-making activity
**Date of statement:** 2026-07-24

## Conformance target

This learning object is built to conform to **WCAG 2.1 Level AA**.

It is intended for use as digital course material by a public entity (a college).
Under the ADA Title II final rule, a public entity's web content and digital
course materials must conform to WCAG 2.1 Level AA. The DOJ interim rule of
April 2026 moved the compliance deadlines to **April 26, 2027** (large entities)
and **April 26, 2028** (smaller entities), but the underlying obligation stands.
This document is the seed of a VPAT / Accessibility Conformance Report that a
procurement team can request.

## Features that meet the target

### Structure and semantics
- Semantic landmarks: a single `<header>` (the progress instrument bar) and a
  single `<main>` region.
- One `<h1>` per screen, with a logical heading order (`h1` cover title,
  `h2` scenario / summary headings, `h3` where nested).
- Meaningful, descriptive page `<title>`.
- Answer choices use native `<input type="radio">` grouped in a `<fieldset>`
  with a descriptive `<legend>` — a real radiogroup, not a custom widget.

### Keyboard operation (no mouse required)
- Every control is reachable and operable by keyboard: `Tab` / `Shift+Tab`
  between controls, arrow keys to move within the answer group, `Enter` / `Space`
  to select options and activate buttons.
- No keyboard traps; focus order follows reading order.
- A "Skip to activity" link is the first focusable element.
- All actionable controls are real `<button>` elements with descriptive labels.

### Screen-reader support and managed focus
- An `aria-live="polite"` region announces screen changes and per-scenario
  feedback (result, explanation, and the correct response when the learner is
  wrong). These announcements fire regardless of motion settings.
- On advancing to a new scenario, keyboard focus is moved to the new scenario's
  heading, so screen-reader users are not left behind.
- The progress instrument uses `role="progressbar"` with
  `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-valuetext`.
- The score gauge is exposed as `role="img"` with an `aria-label`
  ("Score: N out of 6"); the decorative visual duplicate is `aria-hidden`.
- Decorative SVGs (the cover helix, inline icons) are `aria-hidden="true"` and
  `focusable="false"`.

### Contrast and non-color status
- Text meets a contrast ratio of at least 4.5:1 against its background in both
  the light (paper) and dark (navy) grounds.
- Correct / incorrect status is never conveyed by color alone: each is paired
  with a text label ("Correct answer" / "Your choice", "Correct" / "Incorrect")
  and a non-color icon (check / cross).
- The focus indicator uses a dedicated high-contrast color kept distinct from
  the teal brand accent, so focus never hides inside a brand-colored control.

### Reduced motion
- All motion is wrapped in `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
  Initial hidden states are set in JavaScript inside that block only, so when
  motion is reduced — or if JavaScript / the animation library fails to load —
  every element is fully visible and usable with zero animation.
- CSS transitions are additionally disabled under
  `@media (prefers-reduced-motion: reduce)`.
- Motion is decorative: it never gates a control and never blocks announcements.

### No browser storage
- The activity uses no `localStorage`, `sessionStorage`, or cookies. All state
  is held in memory and resets on reload. (Persistence is the LMS's job via the
  SCORM reporting seam.)

### Self-contained and offline
- A single HTML file with all CSS, JavaScript, fonts, and the animation library
  inlined. Fonts are embedded as base64 `@font-face`; GSAP is vendored inline.
  There are **no runtime network requests** — verified with an empty network
  panel — so it runs from `file://` and inside an LMS frame without internet.

## How it was tested

- **Keyboard-only pass:** navigated the entire activity (cover → six scenarios →
  summary → restart) using only `Tab`, `Shift+Tab`, arrow keys, `Enter`, and
  `Space`. Confirmed visible focus on every control, correct focus movement to
  each new scenario heading, arrow-key selection within the radio group, and no
  traps.
- **Screen-reader review:** intended for VoiceOver (macOS/iOS) and NVDA
  (Windows). Verified programmatically that the live region announces scenario
  changes and feedback, that focus is managed on advance, and that the gauge and
  progress bar expose text alternatives.
- **Contrast check:** palette chosen so all text meets >= 4.5:1 on both grounds;
  status colors paired with icon + word.
- **Reduced-motion check:** ran with `prefers-reduced-motion: reduce` and
  confirmed all content renders fully visible with no transforms and the score
  gauge shows its final value without animation.
- **No-storage / offline check:** confirmed `localStorage` and `sessionStorage`
  remain empty, no cookies are set, and no external network requests are made at
  runtime.

## Known limitations

- Automated checks and a scripted browser review were used during development.
  A full manual audit with live assistive technology (VoiceOver and NVDA with
  real users) is recommended before issuing a formal VPAT.
- The SCORM reporting layer is a commented seam in this standalone build; the
  accessibility statements above apply to the learning activity itself.

## Feedback

Report accessibility issues to the course material vendor so they can be
addressed and reflected in the conformance report.
