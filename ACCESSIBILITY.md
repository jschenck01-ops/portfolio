# Accessibility — Syringe Anatomy labeling activity

This activity is built to **WCAG 2.1 Level AA** and is intended to count as
accessible digital course material under **ADA Title II**. It is fully
operable with a mouse, a keyboard alone, touch, and a screen reader. Nothing
about the task requires seeing the picture.

> **The key idea.** Native HTML5 drag-and-drop is mouse-only and fails WCAG.
> A blind learner cannot "drag a word onto a picture." So the accessible
> model is reframed as an equivalent task: **match each labeled position to a
> term.** Every blank states its position in words (e.g. *"Blank 5, on the
> main clear cylinder, currently empty"*), so the diagram is never the only
> way to understand or complete the activity.

## The drag-and-drop has three synchronized input paths

All three write to one shared state model (which term is in which slot), so
they stay in sync and any of them can complete the activity.

1. **Pointer drag** (mouse, touch, pen). Drag a term from the bank onto a
   blank. Dropping a term onto a filled blank **swaps** the two. A short tap
   with no drag acts as a grab (tap term, then tap a blank) so touch users
   get a grab-and-place path too.
2. **Keyboard grab-and-place** — a first-class path, not a fallback.
   - Focus a term and press **Enter** or **Space** to pick it up. Announced:
     *"Picked up Barrel. Choose a blank to place it, or press Escape to
     cancel."*
   - Move focus with **Tab** or the **arrow keys**, then press **Enter** on a
     blank to place. Announced: *"Placed Barrel on the main clear cylinder."*
   - **Escape** cancels a pickup. A placed term can be focused and picked up
     again to move it.
3. **Per-slot native select.** Every blank also exposes a real, labeled
   `<select>` listing the available terms plus its current contents. AT users
   who prefer a form control have one, and it drives the same state.

## How the requirements are met

| Requirement | Implementation |
|---|---|
| Keyboard operable, no traps | Every term, blank, select, and button is a native focusable control. Enter/Space/Escape/Arrow keys drive grab-and-place; Tab order is logical. |
| Visible focus | High-contrast focus ring (`#B8420F`, 3 px, 2 px offset) on **every** interactive element via `:focus-visible`. |
| Status not by color alone | After checking, each blank shows an **icon** (✓ / ✕) **and a word** ("Correct" / "Incorrect") **and** color — three redundant cues. |
| Live announcements | A single `aria-live="polite"` region announces every pick-up, placement, removal, swap, and check result. |
| Focus management | After a placement, focus returns to that blank; after Try again / Reset, focus returns to the first available term. The summary receives focus so a screen reader reads the result. |
| Meaningful names | Each blank's accessible name states its number, spoken position, and current contents, e.g. *"Blank 7, at the finger grips at the top of the barrel, contains Syringe Flange."* |
| Diagram is decorative | The SVG syringe is `aria-hidden="true"` / `focusable="false"`. Meaning is carried entirely by the blanks' position text and labels, so the task is understandable without the picture. |
| Contrast ≥ 4.5:1 | Ink `#0B1A26` and Lab Navy `#0F2537` on Paper/Panel; teal, correct, wrong, and focus tokens chosen to clear 4.5:1 for text and 3:1 for UI/graphics. |
| Reduced motion | All motion is wrapped in `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`. Initial hidden states are set **only** inside that block, so with reduced motion — or with no JavaScript at all — every term, blank, and control is visible and fully usable with zero animation. Motion never gates a control or an announcement. |
| Landmarks & headings | `<header>`, `<main>`, `<footer>`; a single `<h1>`; logical heading order; a descriptive `<title>`. |
| Skip link | A "Skip to the labeling activity" link is the first focusable element. |
| No injected HTML | All content-derived text is written with `textContent` / DOM nodes — never `innerHTML` — so data cannot inject markup. |
| No storage | No `localStorage`, `sessionStorage`, or cookies. State lives in memory and resets on reload. |
| Offline / self-contained | One HTML file. GSAP and all three fonts are vendored and inlined; the diagram is inline SVG. **Zero network requests at runtime.** |

## Screen-reader test notes

Verified reading order and announcements:

- Header (eyebrow → h1 → subtitle → instructions) reads first.
- Term bank items read as *"{Term}, term. Press Enter to pick up."*
- Blanks read their position and contents; the numbered SVG is skipped as
  decorative.
- Picking up, placing, removing, swapping, and checking all produce a polite
  announcement. The result announces *"You matched N of 10 correctly."*

## Known, intentional design choices

- The **per-slot select** is visible (not hidden) so it also helps low-vision
  and switch users, not only screen-reader users.
- **Empty blanks are graded as incorrect** on check, so the score always
  reflects a full attempt out of 10.
- Correct answers are revealed on the **second** check or via **Show
  answers**, so mastery is reachable without giving them away immediately.
