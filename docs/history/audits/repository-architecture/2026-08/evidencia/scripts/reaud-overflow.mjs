import { createRequire } from "node:module";
const require = createRequire(process.argv[2] + "/package.json");
const { chromium } = require(process.argv[2]);
const browser = await chromium.launch();
for (const [scene, fx] of [["shell","bithire"],["shell","themanagementmiami&tenantSource=canonical-db"],["dashboard","bithire"],["dashboard","themanagementmiami&tenantSource=canonical-db"]]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:7001/probe/whitelabel-torture/scenes/${scene}?fixture=${fx}`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(500);
  const out = await page.evaluate(() => {
    const vw = window.innerWidth; const rows = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect(); if (r.right > vw + 1 && r.width > 0) {
        const kids = [...el.children].some(c => c.getBoundingClientRect().right > vw + 1);
        if (!kids) rows.push({ tag: el.tagName.toLowerCase(), part: el.getAttribute('data-part'), cls: (el.className && el.className.baseVal === undefined ? el.className : '').toString().slice(0,60), right: Math.round(r.right), w: Math.round(r.width), text: (el.textContent||'').trim().slice(0,40) });
      }
    }
    rows.sort((a,b)=>b.right-a.right);
    const seen = new Set(); const uniq = [];
    for (const r of rows) { const k = r.tag+'|'+r.part+'|'+r.cls; if (!seen.has(k)) { seen.add(k); uniq.push(r); } }
    return { scrollW: document.body.scrollWidth, vw, leaves: uniq.slice(0, 12) };
  });
  console.log(`\n== ${scene} / ${fx.split('&')[0]} scrollW=${out.scrollW} vw=${out.vw}`);
  for (const l of out.leaves) console.log(`  right=${l.right} w=${l.w} <${l.tag}> part=${l.part} cls=${l.cls} "${l.text}"`);
  await ctx.close();
}
await browser.close();
