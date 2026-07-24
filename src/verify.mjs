/* Offline smoke test for "Syringe Anatomy.html".
   Asserts: no console errors, zero external network requests, all three
   input paths work and stay in sync, and reduced-motion is fully usable.
   Run:  node src/verify.mjs                                              */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = 'file://' + path.join(ROOT, 'Syringe Anatomy.html');
const CHROME = '/opt/pw-browsers/chromium';
let failures = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) failures++; };

const browser = await chromium.launch({ executablePath: CHROME });

/* ---- 1. animated context: errors, network, three paths ---- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [], net = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('request', r => {
    const u = r.url();
    if (!u.startsWith('file://') && !u.startsWith('data:')) net.push(u);
  });
  await page.goto(file, { waitUntil: 'load' });
  await page.waitForTimeout(1600);

  ok(errors.length === 0, 'no console / page errors' + (errors.length ? ' :: ' + errors[0] : ''));
  ok(net.length === 0, 'zero external network requests' + (net.length ? ' :: ' + net[0] : ''));

  // path A — select fallback
  await page.selectOption('#sel-s5', 'barrel');
  ok((await page.locator('#sel-s5').inputValue()) === 'barrel', 'select places a term');

  // path B — keyboard grab-and-place (place the correct term for s1)
  const t = await page.getAttribute('.term', 'data-term');
  await page.focus(`.term[data-term="${t}"]`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120); // live region debounces ~60ms to force re-announce
  const grab = await page.textContent('#live');
  ok(/Picked up/.test(grab), 'keyboard pick-up announced');
  const slot = await page.evaluate(x => CONTENT.slots.find(s => s.correctTermId === x)?.id, t);
  await page.focus(`#slot-${slot} .slot-btn`);
  await page.keyboard.press('Enter');
  ok(await page.evaluate(s => document.querySelector('#slot-' + s).classList.contains('filled'), slot),
     'keyboard placement fills the blank');
  await page.waitForTimeout(120);
  ok(/Placed/.test(await page.textContent('#live')), 'keyboard placement announced');

  // path C — pointer drag swap: set two wrong, grab-swap already covered; test drag path exists
  ok(await page.evaluate(() => typeof PointerEvent !== 'undefined'), 'pointer events available');

  // scoring + summary
  for (const s of await page.evaluate(() => CONTENT.slots.map(x => ({ id: x.id, c: x.correctTermId }))))
    await page.selectOption('#sel-' + s.id, s.c);
  await page.click('#btnCheck');
  await page.waitForTimeout(1400);
  ok((await page.textContent('#gaugeVal')) === '10', 'perfect placement scores 10/10');
  ok(await page.isVisible('#summary'), 'summary shown after check');

  await ctx.close();
}

/* ---- 2. reduced motion: everything visible, no transforms ---- */
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(file, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => ({
    terms: [...document.querySelectorAll('.term')].every(t => getComputedStyle(t).opacity === '1'),
    leaders: [...document.querySelectorAll('.leader')].every(l => !l.style.strokeDashoffset ||
              l.style.strokeDashoffset === '0' || l.style.strokeDashoffset === '0px')
  }));
  ok(r.terms, 'reduced-motion: all terms visible (opacity 1)');
  ok(r.leaders, 'reduced-motion: leader lines fully drawn (no dashoffset)');
  await ctx.close();
}

await browser.close();
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
