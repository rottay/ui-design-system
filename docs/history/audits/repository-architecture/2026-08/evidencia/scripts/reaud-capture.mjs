// Fable sighted capture: same scene, four tenants, two widths. Read-only against the showroom dev server.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad/reaud-shots";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:7001";
const modPath = process.argv[2];
const require = createRequire(modPath + "/package.json");
const { chromium } = require(modPath);

const FIXTURES = [
  ["bithire", "?fixture=bithire"],
  ["themanagement-db", "?fixture=themanagementmiami&tenantSource=canonical-db"],
  ["rottay", "?fixture=rottay"],
  ["evnto", "?fixture=evnto"],
];
const SCENES = ["dashboard", "forms", "shell"];
const WIDTHS = [1280, 390];

const PROBE = `(() => {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const names = new Set();
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    const walk = (rs) => { for (const r of rs) {
      if (r.cssRules && r.cssRules.length && !r.selectorText) { walk(r.cssRules); continue; }
      if (r.selectorText && /(^|,)\\s*(:root|html)(\\s|,|$|\\[)/.test(r.selectorText) && r.style) {
        for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; if (p.startsWith('--ds-')) names.add(p); }
      } } };
    walk(rules);
  }
  const vars = {};
  for (const n of names) vars[n] = cs.getPropertyValue(n).trim();
  const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const s = getComputedStyle(el);
    return { sel, bg: s.backgroundColor, color: s.color, radius: s.borderRadius, shadow: s.boxShadow, border: s.border, font: s.fontFamily.slice(0,60), size: s.fontSize, pad: s.padding, h: el.getBoundingClientRect().height }; };
  const samples = [
    pick('[data-part="card"], .ds-card, [class*="card"]'),
    pick('button'),
    pick('input'),
    pick('h1, h2, [data-part="title"]'),
    pick('table, [role="table"]'),
    pick('nav, [data-part="sidebar"], aside'),
  ].filter(Boolean);
  const attrs = {}; for (const a of root.attributes) attrs[a.name] = a.value.slice(0,80);
  const body = document.body;
  const overflowX = body.scrollWidth > window.innerWidth;
  return { rootAttrs: attrs, varCount: Object.keys(vars).length, vars, samples, scrollWidth: body.scrollWidth, innerWidth: window.innerWidth, overflowX,
    sheets: document.styleSheets.length, styleTags: document.querySelectorAll('style').length };
})()`;

const browser = await chromium.launch();
const results = {};
for (const scene of SCENES) {
  for (const w of WIDTHS) {
    for (const [name, q] of FIXTURES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const url = `${BASE}/probe/whitelabel-torture/scenes/${scene}${q}&w=${w === 390 ? 360 : 1280}`;
      const t0 = Date.now();
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
        await page.waitForTimeout(800);
        const probe = await page.evaluate(PROBE);
        probe.loadMs = Date.now() - t0; probe.url = url;
        const file = `${OUT}/${scene}-${w}-${name}.png`;
        await page.screenshot({ path: file, fullPage: w === 1280 ? false : true });
        results[`${scene}/${w}/${name}`] = probe;
        console.log("OK", scene, w, name, probe.loadMs + "ms", "vars=" + probe.varCount, "overflowX=" + probe.overflowX, "scrollW=" + probe.scrollWidth);
      } catch (e) {
        results[`${scene}/${w}/${name}`] = { error: String(e).slice(0, 300), url };
        console.log("ERR", scene, w, name, String(e).slice(0, 200));
      }
      await ctx.close();
    }
  }
}
await browser.close();
writeFileSync(`${OUT}/probe.json`, JSON.stringify(results, null, 1));

// Diff of root vars between bithire and themanagement-db per scene/width
for (const scene of SCENES) for (const w of WIDTHS) {
  const a = results[`${scene}/${w}/bithire`]?.vars, b = results[`${scene}/${w}/themanagement-db`]?.vars;
  if (!a || !b) continue;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let same = 0, diff = 0, only = 0; const diffs = [];
  for (const k of keys) { if (!(k in a) || !(k in b)) { only++; continue; } if (a[k] === b[k]) same++; else { diff++; diffs.push(k); } }
  console.log(`DIFF ${scene}@${w} bithire vs themanagement-db: total=${keys.size} same=${same} diff=${diff} onlyOne=${only}`);
  if (scene === "dashboard" && w === 1280) writeFileSync(`${OUT}/diff-vars.txt`, diffs.sort().join("\n"));
}
