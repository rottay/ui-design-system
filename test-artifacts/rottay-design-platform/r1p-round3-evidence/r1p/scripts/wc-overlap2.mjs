import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import postcss from '/Users/daniel/Developer/Rottay/ui-design-system/node_modules/.pnpm/postcss@8.5.10/node_modules/postcss/lib/postcss.js';

const APP = '/Users/daniel/Developer/Rottay/app-bithire/src';
const inv = JSON.parse(readFileSync('/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/closure/wc-inv-bithire.json', 'utf8'));
function cssFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) cssFiles(p, out); else if (e.name.endsWith('.css')) out.push(p);
  }
  return out;
}
const norm = (s) => s.replace(/\s+/g, ' ').trim();
// strip the leading scope so we compare the BODY of the selector
const strip = (s) => norm(s)
  .replace(/html\[data-tenant="bithire"\]\s*/g, '')
  .replace(/:root\[data-ds-root\]\s*/g, '')
  .replace(/html\[data-tenant\]\s*/g, '')
  .replace(/\s*,\s*/g, ',');

const appBySel = new Map();
for (const f of cssFiles(APP)) {
  let root; try { root = postcss.parse(readFileSync(f, 'utf8'), { from: f }); } catch { continue; }
  root.walkRules((r) => {
    const k = strip(r.selector);
    const decls = new Map();
    for (const d of r.nodes ?? []) if (d.type === 'decl') decls.set(d.prop, `${norm(d.value)}${d.important ? '!' : ''}`);
    const at = r.parent?.type === 'atrule' ? `@${r.parent.name} ${norm(r.parent.params)}` : '';
    if (!appBySel.has(k)) appBySel.set(k, []);
    appBySel.get(k).push({ file: f.replace(APP + '/', ''), decls, at, sel: norm(r.selector) });
  });
}
const out = [];
for (const region of inv.regions) {
  if (region.kind === 'capability-gap') continue;
  let matched = 0, shadowedDecls = 0, totalDecls = 0;
  const files = new Set();
  for (const ru of region.rules) {
    const k = strip(ru.selector);
    const at = ru.atStack.map((a) => norm(a)).join(' ');
    const hits = (appBySel.get(k) ?? []).filter((h) => h.at === at || (!h.at && !at));
    totalDecls += ru.declCount;
    if (hits.length) { matched += 1; for (const h of hits) files.add(h.file); }
  }
  out.push({ idx: region.idx, key: region.key, rules: region.ruleCount, matched, files: [...files].slice(0, 4) });
  console.log(`[${region.idx}] ${region.key} rules=${region.ruleCount} appTwin=${matched} files=${[...files].slice(0,3).join(', ')}`);
}
