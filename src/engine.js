/* ============================================================
   LABELING ENGINE
   Reads only from CONTENT. Renders the term bank and the slots,
   drives the three synchronized input paths (pointer drag,
   keyboard grab-and-place, per-slot native select), scoring,
   feedback, and the summary. No browser storage of any kind.
   ============================================================ */
(function () {
  "use strict";

  /* -------- element refs -------- */
  const $ = (id) => document.getElementById(id);
  const stage = $("stage");
  const bankEl = $("bank");
  const live = $("live");
  const grabHint = $("grabHint");
  const grabHintText = $("grabHintText");
  const scoreInline = $("scoreInline");
  const summary = $("summary");

  /* -------- fill static text (escaped: textContent only) -------- */
  $("eyebrow").textContent = CONTENT.eyebrow;
  $("title").textContent = CONTENT.title;
  document.title = CONTENT.title + " — Interactive Labeling Activity";
  $("subtitle").textContent = CONTENT.subtitle;
  $("instructions").innerHTML = ""; // build safely below
  {
    const ins = $("instructions");
    ins.append(document.createTextNode(CONTENT.instructions));
  }

  /* -------- inject diagram SVG (decorative / aria-hidden) -------- */
  stage.insertAdjacentHTML("afterbegin", CONTENT.diagramSVG);

  /* -------- lookup maps -------- */
  const termById = {};
  CONTENT.terms.forEach((t) => (termById[t.id] = t));
  const slotById = {};
  CONTENT.slots.forEach((s) => (slotById[s.id] = s));

  /* -------- shuffle term order once (in memory only) -------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const termOrder = shuffle(CONTENT.terms.map((t) => t.id));

  /* -------- state -------- */
  const state = {
    placed: {},        // slotId -> termId | null
    grabbed: null,     // termId held via keyboard/tap grab
    checked: false,
    checkCount: 0
  };
  CONTENT.slots.forEach((s) => (state.placed[s.id] = null));

  const slotOfTerm = (termId) =>
    CONTENT.slots.find((s) => state.placed[s.id] === termId)?.id ?? null;

  /* ============================================================
     LIVE-REGION ANNOUNCEMENTS
     ============================================================ */
  let liveTimer = null;
  function announce(msg) {
    clearTimeout(liveTimer);
    live.textContent = "";
    liveTimer = setTimeout(() => (live.textContent = msg), 60);
  }

  /* ============================================================
     BUILD SLOT CHIPS (once) — updated in place by render()
     ============================================================ */
  const slotRefs = {}; // slotId -> {root, btn, fill, sel, mark, word}
  CONTENT.slots.forEach((s, i) => {
    const n = i + 1;
    const root = document.createElement("div");
    root.className = "slot";
    root.id = "slot-" + s.id;
    root.style.left = (s.x / 1000) * 100 + "%";
    root.style.top = (s.y / 620) * 100 + "%";

    const mark = document.createElement("span");
    mark.className = "mark";
    mark.setAttribute("aria-hidden", "true");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn";

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(n);
    const fill = document.createElement("span");
    fill.className = "fill";
    btn.append(num, fill);

    // spoken position phrase — hidden in the overlay layout, shown when the
    // blanks reflow to a stacked list on narrow viewports / high zoom
    const pos = document.createElement("div");
    pos.className = "slot-pos";
    pos.textContent = s.positionText;

    const word = document.createElement("div");
    word.className = "status-word";
    word.setAttribute("aria-hidden", "true");

    const selWrap = document.createElement("div");
    selWrap.className = "slot-select-wrap";
    const label = document.createElement("label");
    label.setAttribute("for", "sel-" + s.id);
    label.textContent = "Blank " + n + ", " + s.positionText + ": choose a term";
    const sel = document.createElement("select");
    sel.className = "slot-select";
    sel.id = "sel-" + s.id;
    selWrap.append(label, sel);

    root.append(mark, pos, btn, word, selWrap);
    stage.appendChild(root);
    slotRefs[s.id] = { root, btn, fill, sel, mark, word, n };

    /* --- slot interactions --- */
    // click = keyboard Enter/Space, mouse click, or touch tap
    btn.addEventListener("click", () => {
      if (btn._suppressClick) { btn._suppressClick = false; return; }
      if (state.grabbed) {
        placeGrabbed(s.id);
      } else if (state.placed[s.id]) {
        toggleGrab(state.placed[s.id]); // pick the placed term back up
      } else {
        announce("Blank " + n + " is empty. Pick up a term first, then choose this blank.");
      }
    });
    // pointer drag out of a filled slot
    btn.addEventListener("pointerdown", (e) => {
      const t = state.placed[s.id];
      if (!t) return;
      startPointerDrag(e, t, btn);
    });
    btn.addEventListener("keydown", (e) => arrowNav(e, slotButtons()));

    /* --- select fallback --- */
    sel.addEventListener("change", () => {
      const v = sel.value;
      if (v === "") doRemove(s.id, sel);
      else doPlace(v, s.id, sel);
    });
  });

  /* ============================================================
     RENDER — bank + slot contents + selects + controls
     ============================================================ */
  function slotButtons() {
    return CONTENT.slots.map((s) => slotRefs[s.id].btn);
  }
  function bankButtons() {
    return Array.from(bankEl.querySelectorAll(".term"));
  }

  function render() {
    /* term bank */
    bankEl.textContent = "";
    termOrder
      .filter((id) => slotOfTerm(id) === null)
      .forEach((id) => {
        const t = termById[id];
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        b.className = "term";
        b.dataset.term = id;
        b.setAttribute("aria-label", t.label + ", term. Press Enter to pick up.");
        const span = document.createElement("span");
        span.textContent = t.label;
        b.appendChild(span);
        if (state.grabbed === id) b.classList.add("grabbed");
        b.addEventListener("click", () => {
          if (b._suppressClick) { b._suppressClick = false; return; }
          toggleGrab(id);
        });
        b.addEventListener("pointerdown", (e) => startPointerDrag(e, id, b));
        b.addEventListener("keydown", (e) => arrowNav(e, bankButtons()));
        li.appendChild(b);
        bankEl.appendChild(li);
      });

    /* slots */
    CONTENT.slots.forEach((s) => {
      const ref = slotRefs[s.id];
      const t = state.placed[s.id] ? termById[state.placed[s.id]] : null;
      ref.fill.textContent = "";
      if (t) {
        ref.root.classList.add("filled");
        const span = document.createElement("span");
        span.className = "placed-term";
        span.textContent = t.label;
        ref.fill.appendChild(span);
      } else {
        ref.root.classList.remove("filled");
        const ph = document.createElement("span");
        ph.className = "placeholder";
        ph.textContent = "Blank";
        ref.fill.appendChild(ph);
      }
      // accessible name states position + contents
      ref.btn.setAttribute(
        "aria-label",
        "Blank " + ref.n + ", " + s.positionText + ", " +
          (t ? "contains " + t.label + ". Press Enter to pick it up." :
               "currently empty.")
      );
      // grabbed highlight on a filled slot
      ref.btn.classList.toggle("grabbed", !!t && state.grabbed === state.placed[s.id]);

      /* rebuild select options: remaining bank terms + current */
      const sel = ref.sel;
      sel.textContent = "";
      const optEmpty = document.createElement("option");
      optEmpty.value = "";
      optEmpty.textContent = t ? "— remove term —" : "— choose a term —";
      sel.appendChild(optEmpty);
      termOrder
        .filter((id) => slotOfTerm(id) === null || id === state.placed[s.id])
        .forEach((id) => {
          const o = document.createElement("option");
          o.value = id;
          o.textContent = termById[id].label;
          sel.appendChild(o);
        });
      sel.value = state.placed[s.id] || "";
    });

    /* controls */
    scoreInline.style.visibility = state.checked ? "visible" : "hidden";
    $("btnTry").disabled = !state.checked;
  }

  /* ============================================================
     PLACEMENT ACTIONS (shared by all three input paths)
     ============================================================ */
  function clearChecked() {
    if (!state.checked) return;
    state.checked = false;
    CONTENT.slots.forEach((s) => {
      slotRefs[s.id].root.classList.remove("correct", "incorrect");
      slotRefs[s.id].mark.textContent = "";
      slotRefs[s.id].word.textContent = "";
    });
    summary.classList.remove("show");
  }

  function doPlace(termId, slotId, focusEl) {
    const slot = slotById[slotId];
    const term = termById[termId];
    const from = slotOfTerm(termId);
    const occupant = state.placed[slotId] || null;

    state.placed[slotId] = termId;
    if (from !== null) state.placed[from] = occupant; // swap (occupant may be null)

    clearChecked();
    render();

    let msg = "Placed " + term.label + " " + slot.positionText + ".";
    if (occupant) {
      const oc = termById[occupant];
      msg += from !== null
        ? " " + oc.label + " moved " + slotById[from].positionText + "."
        : " " + oc.label + " returned to the term bank.";
    }
    announce(msg);

    // return focus sensibly
    const target = focusEl || slotRefs[slotId].btn;
    target.focus();
    pulsePlace(slotRefs[slotId].btn);
  }

  function doRemove(slotId, focusEl) {
    const t = state.placed[slotId];
    if (!t) return;
    state.placed[slotId] = null;
    clearChecked();
    render();
    announce("Removed " + termById[t].label + ", returned to the term bank.");
    (focusEl || slotRefs[slotId].btn).focus();
  }

  function returnToBank(termId) {
    const from = slotOfTerm(termId);
    if (from === null) return;
    doRemove(from);
  }

  /* ============================================================
     KEYBOARD / TAP GRAB-AND-PLACE
     ============================================================ */
  function currentGrabEl() {
    if (!state.grabbed) return null;
    const inSlot = slotOfTerm(state.grabbed);
    if (inSlot) return slotRefs[inSlot].btn;
    return bankEl.querySelector('.term[data-term="' + state.grabbed + '"]');
  }

  function setGrab(termId) {
    state.grabbed = termId;
    stage.classList.add("grabbing");
    const el = currentGrabEl();
    if (el) el.classList.add("grabbed");
    grabHint.classList.add("show");
    grabHintText.textContent = 'Holding "' + termById[termId].label + '" —';
    announce(
      "Picked up " + termById[termId].label +
      ". Choose a blank to place it, or press Escape to cancel."
    );
    // move focus to a target so Tab/arrow keys and Enter land on a blank
    const firstEmpty = CONTENT.slots.find((s) => !state.placed[s.id]);
    const dest = firstEmpty ? firstEmpty.id : CONTENT.slots[0].id;
    slotRefs[dest].btn.focus();
  }
  function clearGrabVisual() {
    stage.classList.remove("grabbing");
    grabHint.classList.remove("show");
    document.querySelectorAll(".grabbed").forEach((e) => e.classList.remove("grabbed"));
  }
  function cancelGrab(silent) {
    if (!state.grabbed) return;
    const label = termById[state.grabbed].label;
    state.grabbed = null;
    clearGrabVisual();
    if (!silent) announce(label + " put back. Nothing is held now.");
  }
  function toggleGrab(termId) {
    if (state.grabbed === termId) { cancelGrab(); return; }
    if (state.grabbed) { // switch what is held
      clearGrabVisual();
      state.grabbed = null;
    }
    setGrab(termId);
  }
  function placeGrabbed(slotId) {
    const termId = state.grabbed;
    state.grabbed = null;
    clearGrabVisual();
    doPlace(termId, slotId, slotRefs[slotId].btn);
  }

  /* arrow-key roving among a list of controls */
  function arrowNav(e, list) {
    const i = list.indexOf(document.activeElement);
    if (i < 0) return;
    let ni = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") ni = (i + 1) % list.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") ni = (i - 1 + list.length) % list.length;
    else return;
    e.preventDefault();
    list[ni].focus();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.grabbed) {
      e.preventDefault();
      cancelGrab();
    }
  });

  /* ============================================================
     POINTER DRAG (mouse / touch / pen) — custom, accessible-safe
     ============================================================ */
  let drag = null; // {termId, srcEl, ghost, startX, startY, moved}
  const DRAG_THRESHOLD = 6;

  function startPointerDrag(e, termId, srcEl) {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse") return;
    if (drag) return;
    drag = {
      termId, srcEl,
      startX: e.clientX, startY: e.clientY,
      ghost: null, moved: false, pointerId: e.pointerId
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    if (!drag.moved) {
      // begin a real drag
      drag.moved = true;
      cancelGrab(true); // pointer drag supersedes any keyboard grab
      stage.classList.add("grabbing");
      drag.srcEl.classList.add("dragging");
      const g = document.createElement("div");
      g.className = "term drag-ghost";
      const s = document.createElement("span");
      s.textContent = termById[drag.termId].label;
      g.appendChild(s);
      document.body.appendChild(g);
      drag.ghost = g;
    }
    drag.ghost.style.left = e.clientX + "px";
    drag.ghost.style.top = e.clientY + "px";
    highlightUnder(e.clientX, e.clientY);
  }

  function highlightUnder(x, y) {
    document.querySelectorAll(".slot.drop-hover").forEach((el) => el.classList.remove("drop-hover"));
    const slot = slotAt(x, y);
    if (slot) slot.classList.add("drop-hover");
  }
  function slotAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest(".slot") : null;
  }

  function onPointerUp(e) {
    if (!drag) return;
    const d = drag;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);

    if (d.moved) {
      d.srcEl._suppressClick = true; // don't let the trailing click toggle grab
      d.srcEl.classList.remove("dragging");
      if (d.ghost) d.ghost.remove();
      stage.classList.remove("grabbing");
      document.querySelectorAll(".slot.drop-hover").forEach((el) => el.classList.remove("drop-hover"));

      const slotEl = slotAt(e.clientX, e.clientY);
      if (slotEl) {
        const slotId = slotEl.id.replace("slot-", "");
        doPlace(d.termId, slotId);
      } else if (document.elementFromPoint(e.clientX, e.clientY)?.closest("#bank, .bank-panel")) {
        returnToBank(d.termId);
      }
      // else: dropped nowhere useful — leave where it was
    }
    drag = null;
  }

  /* ============================================================
     SCORING · FEEDBACK · SUMMARY
     ============================================================ */
  function computeScore() {
    let c = 0;
    CONTENT.slots.forEach((s) => {
      if (state.placed[s.id] === s.correctTermId) c++;
    });
    return c;
  }

  function markSlot(s, kind) {
    const ref = slotRefs[s.id];
    ref.root.classList.remove("correct", "incorrect");
    if (kind === "correct") {
      ref.root.classList.add("correct");
      ref.mark.textContent = "✓"; // check
      ref.word.textContent = "Correct";
    } else {
      ref.root.classList.add("incorrect");
      ref.mark.textContent = "✕"; // cross
      ref.word.textContent = "Incorrect";
    }
  }

  function checkAnswers(reveal) {
    const correct = computeScore();
    state.checked = true;
    state.checkCount++;

    CONTENT.slots.forEach((s) => {
      markSlot(s, state.placed[s.id] === s.correctTermId ? "correct" : "incorrect");
    });

    scoreInline.innerHTML = "";
    scoreInline.append(
      document.createTextNode("Score "),
      Object.assign(document.createElement("b"), { textContent: correct + " / 10" })
    );
    scoreInline.style.visibility = "visible";
    $("btnTry").disabled = correct === 10;

    render(); // refresh selects/labels; marks persist (separate classes)
    // re-apply marks (render leaves correct/incorrect classes intact)

    announce(
      "You matched " + correct + " of 10 correctly." +
      (correct === 10 ? " Every part is labeled correctly." :
        " Choose Try again to clear the incorrect blanks, or Show answers.")
    );

    showSummary(correct);

    // reveal correct answers on the second check, or when asked explicitly
    if (reveal || (state.checkCount >= 2 && correct < 10)) revealAnswers();

    // SCORM seam — single reporting point
    reportResult((correct / 10) * 100, correct >= 8, true);
  }

  function revealAnswers() {
    CONTENT.slots.forEach((s) => {
      state.placed[s.id] = s.correctTermId;
    });
    render();
    CONTENT.slots.forEach((s) => markSlot(s, "correct"));
    state.checked = true;
    $("btnTry").disabled = true;
    announce("Showing the correct term for every blank.");
  }

  function tryAgain() {
    let cleared = 0;
    CONTENT.slots.forEach((s) => {
      const ref = slotRefs[s.id];
      if (state.placed[s.id] !== s.correctTermId) {
        state.placed[s.id] = null;
        cleared++;
      }
      // clear marks (correct ones will simply stay placed, unmarked until next check)
      ref.root.classList.remove("correct", "incorrect");
      ref.mark.textContent = "";
      ref.word.textContent = "";
    });
    state.checked = false;
    summary.classList.remove("show");
    scoreInline.style.visibility = "hidden";
    render();
    announce("Cleared " + cleared + " incorrect " + (cleared === 1 ? "blank" : "blanks") +
      ". The correct ones are kept. Try the remaining terms again.");
    firstBankOrSlotFocus();
  }

  function resetAll() {
    CONTENT.slots.forEach((s) => {
      state.placed[s.id] = null;
      const ref = slotRefs[s.id];
      ref.root.classList.remove("correct", "incorrect");
      ref.mark.textContent = "";
      ref.word.textContent = "";
    });
    state.checked = false;
    state.checkCount = 0;
    cancelGrab(true);
    summary.classList.remove("show");
    scoreInline.style.visibility = "hidden";
    render();
    announce("Reset. All ten blanks are empty and every term is back in the bank.");
    firstBankOrSlotFocus();
  }

  function firstBankOrSlotFocus() {
    const b = bankEl.querySelector(".term");
    if (b) b.focus();
    else slotRefs[CONTENT.slots[0].id].btn.focus();
  }

  /* -------- summary -------- */
  function buildRecap() {
    const recap = $("recap");
    recap.textContent = "";
    CONTENT.slots.forEach((s, i) => {
      const li = document.createElement("li");
      const rn = document.createElement("span");
      rn.className = "rn";
      rn.textContent = (i + 1) + ".";
      const b = document.createElement("b");
      b.textContent = termById[s.correctTermId].label;
      li.append(rn, b, document.createTextNode(" — " + s.recap));
      recap.appendChild(li);
    });
  }

  const CIRC = 2 * Math.PI * 52; // gauge circumference
  function showSummary(correct) {
    const msg = $("summaryMsg");
    let line;
    if (correct === 10) line = "Perfect — you labeled every part of the syringe correctly. You've mastered this diagram.";
    else if (correct >= 8) line = "Strong work. You know most of the syringe — review the highlighted blanks and try again for a perfect run.";
    else if (correct >= 5) line = "Good start. Over half correct. Use Try again to clear the incorrect blanks and give them another go.";
    else line = "Keep going — labeling takes practice. Try again on the incorrect blanks, or Show answers to study the parts.";
    msg.textContent = "You matched " + correct + " of 10 parts. " + line;

    summary.classList.add("show");
    animateGauge(correct);
    summary.focus();
  }

  /* ============================================================
     MOTION (GSAP) — restrained, reduced-motion safe.
     All initial hidden states live INSIDE the no-preference block,
     so with reduced motion (or no JS) everything is visible & usable.
     ============================================================ */
  const gaugeArc = $("gaugeArc");
  const gaugeVal = $("gaugeVal");
  let allowMotion = false;

  function animateGauge(correct) {
    const offset = CIRC * (1 - correct / 10);
    if (allowMotion && window.gsap) {
      gsap.fromTo(gaugeArc, { strokeDashoffset: CIRC },
        { strokeDashoffset: offset, duration: 1.1, ease: "power2.out" });
      const o = { v: 0 };
      gsap.to(o, {
        v: correct, duration: 1.1, ease: "power2.out",
        onUpdate: () => (gaugeVal.textContent = Math.round(o.v))
      });
    } else {
      gaugeArc.style.strokeDashoffset = offset;
      gaugeVal.textContent = correct;
    }
  }

  function pulsePlace(el) {
    if (!allowMotion || !window.gsap) return;
    gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.32, ease: "back.out(2)", transformOrigin: "50% 50%" });
  }

  function setupMotion() {
    if (!window.gsap) return;
    if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
    if (window.SplitText) gsap.registerPlugin(SplitText);

    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      allowMotion = true;
      let titleSplit = null;

      // leader lines draw in (DrawSVG) — the diagram's signature moment
      const leaders = stage.querySelectorAll(".leader");
      const anchors = stage.querySelectorAll(".anchors circle");
      if (window.DrawSVGPlugin) gsap.set(leaders, { drawSVG: "0%" });
      gsap.set(anchors, { scale: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline();
      if (window.DrawSVGPlugin) {
        tl.to(leaders, { drawSVG: "100%", duration: 0.7, stagger: 0.05, ease: "power1.inOut" });
      }
      tl.to(anchors, { scale: 1, duration: 0.3, stagger: 0.04, ease: "back.out(2)" }, "-=0.5")
        .from(bankEl.querySelectorAll(".term"), {
          y: 12, opacity: 0, duration: 0.4, stagger: 0.04, ease: "power2.out"
        }, "-=0.3")
        .from(stage.querySelectorAll(".slot"), {
          opacity: 0, duration: 0.35, stagger: 0.03, ease: "power1.out"
        }, "-=0.4");

      // hero title: gentle character reveal once the display font is ready.
      // Gated on fonts.ready so line/char metrics are correct; SplitText 3.13
      // restores the accessible name automatically.
      if (window.SplitText && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (!allowMotion) return;
          titleSplit = SplitText.create("#title", { type: "chars" });
          gsap.from(titleSplit.chars, {
            yPercent: 45, opacity: 0, duration: 0.55, ease: "power3.out", stagger: 0.03
          });
        });
      }

      return () => {                       // reduced-motion cleanup
        allowMotion = false;
        if (titleSplit) titleSplit.revert();
      };
    });
  }

  /* ============================================================
     SCORM SEAM — every score/completion report routes here.
     Content data (CONTENT) stays separate from engine logic.
     ============================================================ */
  function reportResult(scorePercent, passed, isComplete) {
    /* ---- Wire your LMS adapter here. Examples (commented): ----

       // SCORM 1.2
       var api = findAPI(window);                      // locate window.API
       if (api) {
         api.LMSSetValue("cmi.core.score.raw", String(Math.round(scorePercent)));
         api.LMSSetValue("cmi.core.score.min", "0");
         api.LMSSetValue("cmi.core.score.max", "100");
         api.LMSSetValue("cmi.core.lesson_status",
           isComplete ? (passed ? "passed" : "failed") : "incomplete");
         api.LMSCommit("");
       }

       // SCORM 2004
       var api2 = findAPI2004(window);                 // locate window.API_1484_11
       if (api2) {
         api2.SetValue("cmi.score.scaled", (scorePercent / 100).toFixed(2));
         api2.SetValue("cmi.score.raw", String(Math.round(scorePercent)));
         api2.SetValue("cmi.success_status", passed ? "passed" : "failed");
         api2.SetValue("cmi.completion_status", isComplete ? "completed" : "incomplete");
         api2.Commit("");
       }
    ------------------------------------------------------------ */
    if (window.console && console.debug) {
      console.debug("[reportResult]", { scorePercent, passed, isComplete });
    }
  }

  /* ============================================================
     WIRE CONTROLS & BOOT
     ============================================================ */
  $("btnCheck").addEventListener("click", () => checkAnswers(false));
  $("btnTry").addEventListener("click", tryAgain);
  $("btnReset").addEventListener("click", resetAll);
  $("btnShow").addEventListener("click", () => checkAnswers(true));

  buildRecap();
  render();
  setupMotion();
})();
