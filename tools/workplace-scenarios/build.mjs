import { readFileSync, writeFileSync } from "fs";

const NM = "./node_modules";
const OUT = "/home/user/portfolio/professional-workplace-scenarios.html";

/* ---------- 1. Fonts: embed woff2 as base64 @font-face ---------- */
const fonts = [
  { fam: "Fraunces",      wght: 600, file: `${NM}/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2` },
  { fam: "Inter",         wght: 400, file: `${NM}/@fontsource/inter/files/inter-latin-400-normal.woff2` },
  { fam: "Inter",         wght: 600, file: `${NM}/@fontsource/inter/files/inter-latin-600-normal.woff2` },
  { fam: "IBM Plex Mono", wght: 500, file: `${NM}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2` },
];

const faceCss = fonts.map(f => {
  const b64 = readFileSync(f.file).toString("base64");
  return `@font-face{font-family:'${f.fam}';font-style:normal;font-weight:${f.wght};font-display:swap;`
       + `src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
}).join("\n");

const fontsBlock = `<style id="vendored-fonts">\n${faceCss}\n</style>`;

/* ---------- 2. GSAP: inline core + DrawSVG + SplitText ---------- */
const gsapFiles = [
  `${NM}/gsap/dist/gsap.min.js`,
  `${NM}/gsap/dist/DrawSVGPlugin.min.js`,
  `${NM}/gsap/dist/SplitText.min.js`,
];
const gsapBlock = gsapFiles
  .map(p => `<script>${readFileSync(p, "utf8")}</script>`)
  .join("\n");

/* ---------- 3. Helix signature: compute two sine strands + rungs ---------- */
const W = 560, MID = 60, AMP = 30, PERIODS = 3.4, STEPS = 240;
function strand(phaseShift) {
  let d = "";
  for (let i = 0; i <= STEPS; i++) {
    const x = (i / STEPS) * W;
    const y = MID + AMP * Math.sin((x / W) * PERIODS * 2 * Math.PI + phaseShift);
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
  }
  return d.trim();
}
const s1 = strand(0), s2 = strand(Math.PI);
const RUNGS = 15;
let rungs = "";
for (let i = 1; i < RUNGS; i++) {
  const x = (i / RUNGS) * W;
  const y1 = MID + AMP * Math.sin((x / W) * PERIODS * 2 * Math.PI);
  const y2 = MID + AMP * Math.sin((x / W) * PERIODS * 2 * Math.PI + Math.PI);
  rungs += `<line x1="${x.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x.toFixed(2)}" y2="${y2.toFixed(2)}" stroke-width="1.1" stroke-opacity="0.5"/>`;
}
const helixInner =
  `<path d="${s1}" stroke-width="1.7"/>` +
  `<path d="${s2}" stroke-width="1.7"/>` +
  rungs;
// Escape for a JS single-quoted string literal.
const helixJs = helixInner.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const helixBlock = `<script>window.__HELIX__='${helixJs}';</script>`;

/* ---------- 4. Assemble ---------- */
let html = readFileSync("./template.html", "utf8");
html = html.replace("<!--FONTS-->", fontsBlock);
html = html.replace("<!--GSAP-->", gsapBlock + "\n" + helixBlock);

writeFileSync(OUT, html);

/* ---------- Report ---------- */
const kb = n => (n / 1024).toFixed(0) + " KB";
console.log("Wrote", OUT);
console.log("  total size:", kb(Buffer.byteLength(html)));
console.log("  fonts:", fonts.length, "faces");
console.log("  gsap scripts:", gsapFiles.length);
if (html.includes("<!--FONTS-->") || html.includes("<!--GSAP-->")) {
  console.error("  !! a token was not replaced");
  process.exit(1);
}
