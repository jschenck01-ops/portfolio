# Accessibility Conformance Report
### Voluntary Product Accessibility Template® (VPAT®) — Version 2.5 (Int'l Edition)

**Product / activity name:** Syringe Anatomy — Interactive Drag-and-Drop Labeling Activity
**Product version:** 1.0 (self-contained HTML learning object)
**Report date:** 2026-07-24
**Product description:** A single, self-contained, offline HTML learning object for a
biotechnology certificate course. The learner matches ten part names to positions on a
syringe diagram using any of three interchangeable input methods: pointer drag, keyboard
grab-and-place, or a per-blank native select. Intended to be delivered as digital course
material and optionally wrapped for SCORM.

**Vendor / author:** _[vendor to complete]_
**Contact information:** _[vendor to complete]_
**Notes:** This report evaluates the learning object itself. Any SCORM/LMS wrapper is a
separate layer and is out of scope for this report.

**Evaluation methods used:**
- Automated testing with **axe-core 4.12** (rulesets: `wcag2a`, `wcag2aa`, `wcag21a`,
  `wcag21aa`) run across five states: empty, mid-placement, checked/summary,
  reduced-motion, and 320-pixel reflow. Result: **0 violations** in every state.
- **Programmatic keyboard testing** (Playwright): pick-up, arrow/Tab navigation, place,
  swap, cancel (Escape), and completion of all ten items using the keyboard only.
- **Manual code review** of semantics, ARIA, focus management, and the live region.
- **Contrast** ratios computed for every text/background pair (sRGB, WCAG formula).
- **Reflow / resize**: 320 px width and 200% zoom (no horizontal scrolling); WCAG 1.4.12
  text-spacing overrides applied (no clipping); smallest interactive target = 26 px.
- **Runtime network**: confirmed zero external requests (fully offline, no browser storage).

> **Scope and honesty note.** This is a developer **self-assessment / draft** conformance
> report based on automated tooling, scripted keyboard testing, and code review. It has
> **not** yet been verified with live assistive technology (NVDA, JAWS, VoiceOver) or in
> testing sessions with people who use assistive technology. Those steps are recommended
> before publishing this as a final, warranted conformance claim. Automated tools detect
> roughly a third of WCAG issues; the remainder here is supported by code review and
> scripted checks, which are strong but not a substitute for live AT verification.

---

## Applicable Standards / Guidelines

| Standard / Guideline | Included in report |
|---|---|
| Web Content Accessibility Guidelines (WCAG) 2.1 | Level A (Yes), Level AA (Yes), Level AAA (No) |
| Revised Section 508 standards (2018) | Yes |
| EN 301 549 | Not separately evaluated (WCAG 2.1 results are transferable) |

**Terms used** (per VPAT 2.5):
- **Supports** — the functionality meets the criterion without known defects.
- **Partially Supports** — some functionality does not meet the criterion.
- **Does Not Support** — the majority of the functionality does not meet the criterion.
- **Not Applicable** — the criterion is not relevant to this product.

---

## WCAG 2.1 Report

### Table 1: Success Criteria, Level A

| Criterion | Conformance Level | Remarks and Explanations |
|---|---|---|
| **1.1.1** Non-text Content | Supports | The syringe SVG is decorative (`aria-hidden="true"`, `focusable="false"`); its meaning is carried by each blank's text label and spoken position phrase, so the task is fully understandable without the image. Result icons (✓/✕) are paired with the words "Correct"/"Incorrect". The score gauge is decorative and duplicated as text ("N / 10") and in a sentence. |
| **1.2.1–1.2.3** (Audio/Video alternatives) | Not Applicable | No pre-recorded or live audio or video content. |
| **1.3.1** Info and Relationships | Supports | Semantic landmarks (`header`, `main`, `footer`), a single `h1` with ordered headings, native form controls with programmatic labels, lists marked up as lists. Each blank's accessible name states its number, position, and current contents. |
| **1.3.2** Meaningful Sequence | Supports | DOM order matches the intended reading/interaction order. On narrow viewports the blanks reflow to a stacked list in needle-to-plunger order; nothing depends on visual position alone. |
| **1.3.3** Sensory Characteristics | Supports | Instructions do not rely on shape, size, or visual location; each blank names its position in words (e.g. "at the finger grips at the top of the barrel"). |
| **1.4.1** Use of Color | Supports | Correct/incorrect status is conveyed by an icon **and** a word **and** color — never color alone. |
| **1.4.2** Audio Control | Not Applicable | No auto-playing audio. |
| **2.1.1** Keyboard | Supports | Every control is reachable and operable by keyboard. Terms are picked up with Enter/Space, focus moves to a blank (Tab or arrow keys), Enter places, Escape cancels. A per-blank native `select` provides an additional keyboard path. Verified completing all ten items keyboard-only. |
| **2.1.2** No Keyboard Trap | Supports | Focus can always move away; there are no modals or focus traps. Escape releases a picked-up term. |
| **2.1.4** Character Key Shortcuts | Supports | No single-character key shortcuts are implemented; only standard keys (Enter, Space, Escape, arrows) on focused controls. |
| **2.2.1** Timing Adjustable | Not Applicable | No time limits. |
| **2.2.2** Pause, Stop, Hide | Supports | The only motion is a brief (< 2 s) load animation that stops on its own and conveys no essential information. It is fully suppressed under `prefers-reduced-motion`. No auto-updating or continuously moving content. |
| **2.3.1** Three Flashes or Below | Supports | No flashing content. |
| **2.4.1** Bypass Blocks | Supports | A "Skip to the labeling activity" link is the first focusable element. |
| **2.4.2** Page Titled | Supports | Descriptive `<title>`: "Syringe Anatomy — Interactive Labeling Activity". |
| **2.4.3** Focus Order | Supports | Logical focus order. After a placement, focus returns to the affected blank; after Check, focus moves to the results heading; after Try again / Reset, focus moves to the first available term. |
| **2.4.4** Link Purpose (In Context) | Supports | The only link is the skip link, whose purpose is clear from its text. |
| **2.5.1** Pointer Gestures | Supports | No multipoint or path-based gestures. The drag interaction is a simple single-pointer drag and additionally has keyboard and select equivalents. |
| **2.5.2** Pointer Cancellation | Supports | Placement occurs on the up-event over a target; a drag can be aborted by releasing away from any blank, and the down-event alone triggers no action. |
| **2.5.3** Label in Name | Supports | Visible labels on terms and buttons match their accessible names; the select's visible option text is included in its accessible value. |
| **2.5.4** Motion Actuation | Not Applicable | No functionality is operated by device motion. |
| **3.1.1** Language of Page | Supports | `<html lang="en">`. |
| **3.2.1** On Focus | Supports | Receiving focus never triggers a change of context. |
| **3.2.2** On Input | Supports | Changing a blank's select places the chosen term — the expected, labeled function of that control — without a change of context or focus. |
| **3.3.1** Error Identification | Supports | On check, each incorrect blank is identified by icon, word, and color, and the result is announced via the live region. |
| **3.3.2** Labels or Instructions | Supports | Instructions are present and programmatically associated; every control is labeled. |
| **4.1.1** Parsing | Supports | Valid HTML with unique IDs (no duplicate-id findings). |
| **4.1.2** Name, Role, Value | Supports | Native `button`, `select`, and list elements expose correct roles, names, and values; custom drag states are reflected in each control's accessible name and announced. |

### Table 2: Success Criteria, Level AA

| Criterion | Conformance Level | Remarks and Explanations |
|---|---|---|
| **1.2.4–1.2.5** (Captions/Audio description) | Not Applicable | No audio or video content. |
| **1.3.4** Orientation | Supports | Usable in both portrait and landscape; layout is not locked to an orientation and reflows responsively. |
| **1.3.5** Identify Input Purpose | Not Applicable | No inputs collect information about the user. |
| **1.4.3** Contrast (Minimum) | Supports | All text/background pairs were computed and clear 4.5:1 (large text 3:1). Examples: body text 15–16:1, eyebrow/labels 5.6–8:1, state text 5.4–7.7:1, primary button (white on `#08776E`) **5.42:1**. |
| **1.4.4** Resize Text | Supports | At 200% zoom no content or functionality is lost and there is no horizontal scrolling (verified). |
| **1.4.5** Images of Text | Supports | No images of text; all text is real text and fonts are self-hosted. |
| **1.4.10** Reflow | Supports | Usable at 320 px width with no horizontal scrolling. Below 760 px the blanks reflow from a diagram overlay to a stacked list of cards (position text + term + select); the diagram becomes a decorative illustration. |
| **1.4.11** Non-text Contrast | Supports | The focus indicator is 5:1 against adjacent colors; all meaningful **states** (focused, picked-up/valid-target highlight, correct, incorrect) present indicators at ≥ 3:1. The resting default border of a term chip is intentionally subtle, but the component remains identifiable by its text, marker, and elevation, and every state cue meets 3:1. |
| **1.4.12** Text Spacing | Supports | With the WCAG-mandated text-spacing overrides applied (line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em, paragraph spacing 2em) there is no clipping, overlap, or loss of content. |
| **1.4.13** Content on Hover or Focus | Supports | The picked-up hint bar is persistent and dismissible (Escape), does not obscure the trigger, and does not appear on hover. No hover-only tooltips. |
| **2.4.5** Multiple Ways | Not Applicable | Single-page, self-contained activity — not a set of web pages. |
| **2.4.6** Headings and Labels | Supports | Headings and labels are descriptive of topic and purpose. |
| **2.4.7** Focus Visible | Supports | A high-contrast focus ring (`#B8420F`, 3 px, offset) is visible on every control and is a distinct color from the teal accent. |
| **3.1.2** Language of Parts | Not Applicable | All content is in a single language (English). |
| **3.2.3** Consistent Navigation | Not Applicable | Single page; no repeated navigation across pages. |
| **3.2.4** Consistent Identification | Supports | Icons, labels, and controls are identified consistently throughout. |
| **3.3.3** Error Suggestion | Supports | "Try again" clears only the incorrect blanks so they can be re-attempted; "Show answers" reveals the correct term for each blank; feedback tells the learner what to do next. |
| **3.3.4** Error Prevention (Legal, Financial, Data) | Not Applicable | No legal, financial, or data-submission transactions. |
| **4.1.3** Status Messages | Supports | A single `aria-live="polite"` region announces pick-up, placement, removal, swap, and check results without moving focus, and fires regardless of motion settings. |

_WCAG 2.1 Level AAA criteria were not evaluated and are not included in this report._

---

## Revised Section 508 Report

### Chapter 3: Functional Performance Criteria (FPC)

| Criteria | Conformance Level | Remarks and Explanations |
|---|---|---|
| **302.1** Without Vision | Supports | Full keyboard operation, programmatic names/roles/values, live-region announcements, and text alternatives for all meaning; the task is completable and understandable without sight of the diagram. (Live screen-reader verification recommended — see scope note.) |
| **302.2** With Limited Vision | Supports | Text contrast ≥ 4.5:1; resizes to 200% and reflows at 320 px without loss; a visible high-contrast focus indicator. |
| **302.3** Without Perception of Color | Supports | Status uses icon + word in addition to color. |
| **302.4** Without Hearing | Not Applicable | No audio output. |
| **302.5** With Limited Hearing | Not Applicable | No audio output. |
| **302.6** Without Speech | Not Applicable | No speech input is required. |
| **302.7** With Limited Manipulation | Supports | Operable by keyboard alone; no path-based or multipoint gestures; the drag interaction has keyboard and select alternatives; interactive targets are ≥ 26 px (primary controls 44–48 px). |
| **302.8** With Limited Reach and Strength | Supports | No actions require simultaneous inputs, timing, or physical effort; standard keyboard and single-pointer input. |
| **302.9** With Limited Language, Cognitive, and Learning Abilities | Supports | Plain, active instructions; each blank names its position in words; specific feedback; a Try-again path that keeps correct answers; no time pressure. |

### Chapter 4: Hardware — **Not Applicable** (software-only learning object).

### Chapter 5: Software

| Criteria | Conformance Level | Remarks and Explanations |
|---|---|---|
| **501.1** Scope | — | The activity is web content; conformance is addressed by the WCAG 2.1 report above. |
| **502 / 503** Interoperability with AT; Applications | Supports | Built from native platform controls (`button`, `select`, lists) plus standard ARIA (`aria-live`, accessible names, roles). No custom controls override platform accessibility services. Focus, names, roles, values, and state changes are exposed to the accessibility tree. |
| **504** Authoring Tool | Not Applicable | Not an authoring tool. |

### Chapter 6: Support Documentation and Services

| Criteria | Conformance Level | Remarks and Explanations |
|---|---|---|
| **602.2** Accessibility and Compatibility Features | Supports | `ACCESSIBILITY.md` documents the accessibility features, including the keyboard grab-and-place path and the per-blank select fallback. |
| **602.3** Electronic Support Documentation | Supports | Documentation is provided as accessible Markdown/plain text (`README.md`, `ACCESSIBILITY.md`, this report). |
| **603** Support Services | Not Applicable | No separate support-services channel is in scope for this sample. |

---

## Summary

Against **WCAG 2.1 Level A and AA**, every applicable success criterion is rated
**Supports**; the remainder are **Not Applicable** (they concern audio/video, timing,
multi-page navigation, or data transactions the activity does not contain). No criterion
is rated Partially Supports or Does Not Support at the time of this assessment. Automated
testing returns zero violations across five states, the activity makes zero external
network requests, and it uses no browser storage.

Two issues identified during evaluation — a primary-button contrast shortfall and a
narrow-viewport reflow defect — were corrected and re-verified before this report.

**Recommended next step for a warranted claim:** a manual audit with live assistive
technology (NVDA + Firefox, JAWS + Chrome, VoiceOver + Safari) and, where possible, a
session with assistive-technology users, to confirm the announcement flow and reading
order in practice.

---

_VPAT® and the Voluntary Product Accessibility Template® are registered trademarks of the
Information Technology Industry Council (ITI). This document follows the VPAT 2.5 layout;
complete the vendor/contact fields and have the conformance claims reviewed and, ideally,
verified with live assistive technology before distribution as a formal conformance claim._
