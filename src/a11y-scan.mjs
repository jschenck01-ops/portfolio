/* Automated WCAG 2.1 A/AA pass via axe-core + Playwright.
   Scans the built activity in three states (start, mid-placement, checked)
   plus a reduced-motion load, and reports runtime network + violations.
   Run:  node src/a11y-scan.mjs                                            */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const AXE = require.resolve('axe-core');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = 'file://' + path.join(ROOT, 'Syringe Anatomy.html');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page, label) {
  await page.addScriptTag({ path: AXE });
  const r = await page.evaluate(async (tags) =>
    await axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS);
  const by = { critical: [], serious: [], moderate: [], minor: [] };
  r.violations.forEach(v => (by[v.impact] || by.minor).push(
    `${v.id} — ${v.help} [${v.nodes.length}]: ${v.nodes[0]?.target?.join(' ')}`));
  console.log(`\n===== ${label} =====`);
  for (const k of ['critical', 'serious', 'moderate', 'minor'])
    console.log(`[${k}] ${by[k].length}` + (by[k].length ? '\n  ' + by[k].join('\n  ') : ''));
  return r.violations.length;
}

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let total = 0;

// --- animated context, three states ---
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const reqs = [];
  page.on('request', r => { const u = r.url(); if (!u.startsWith('file:') && !u.startsWith('data:')) reqs.push(u); });
  await page.goto(url); await page.waitForTimeout(2600); // let the intro fully settle (opacity fades affect axe contrast)
  console.log('External requests at runtime:', reqs.length ? reqs : 'none');
  total += await scan(page, 'START (empty)');

  // mid: place a few correct via selects
  for (const [s, t] of [['s1','tip'],['s5','barrel'],['s7','flange']]) await page.selectOption(`#sel-${s}`, t);
  total += await scan(page, 'MID (some placed)');

  // checked: fill all correct, check
  const all = await page.evaluate(() => CONTENT.slots.map(x => [x.id, x.correctTermId]));
  for (const [s, t] of all) await page.selectOption(`#sel-${s}`, t);
  await page.click('#btnCheck'); await page.waitForTimeout(1400);
  total += await scan(page, 'CHECKED (summary shown)');
  await ctx.close();
}

// --- reduced motion load ---
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url); await page.waitForTimeout(500);
  total += await scan(page, 'REDUCED-MOTION (start)');
  await ctx.close();
}

// --- 320px reflow ---
{
  const ctx = await b.newContext({ viewport: { width: 320, height: 640 } });
  const page = await ctx.newPage();
  await page.goto(url); await page.waitForTimeout(600);
  const hscroll = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  console.log(`\n===== REFLOW 320px =====\nhorizontal scroll on <html>: ${hscroll}`);
  total += await scan(page, 'REFLOW 320px');
  await ctx.close();
}

await b.close();
console.log(`\nTOTAL violations across states: ${total}`);
process.exit(0);
