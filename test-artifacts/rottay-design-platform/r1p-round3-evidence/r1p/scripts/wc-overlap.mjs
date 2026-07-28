// Compare each extension region's rules against the app's own CSS corpus.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import postcss from '/Users/daniel/Developer/Rottay/ui-design-system/node_modules/.pnpm/postcss@8.5.10/node_modules/postcss/lib/postcss.js';

const APP = '/Users/daniel/Developer/Rottay/app-bithire/src';
const inv = JSON.parse(readFileSync('/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/closure/wc-inv-bithire.json', 'utf8'));

function cssFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) cssFiles(p, out);
    else if (e.name.endsWith('.css')) out.push(p);
  }
  return out;
}
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const appRules = new Map(); // normalized selector -> [{file, decls:Set}]
const files = cssFiles(APP);
for (const f of files) {
  let root;
  try { root = postcss.parse(readFileSync(f, 'utf8'), { from: f }); } catch { continue; }
  root.walkRules((r) => {
    const k = norm(r.selector);
    const decls = (r.nodes ?? []).filter((n) => n.type === 'decl').map((d) => `${d.prop}:${norm(d.value)}${d.important ? '!' : ''}`);
    if (!appRules.has(k)) appRules.set(k, []);
    appRules.get(k).push({ file: f.replace(APP, 'src'), decls: new Set(decls), at: r.parent?.type === 'atrule' ? `@${r.parent.name} ${r.parent.params}` : '' });
  });
}
console.log(`app css corpus: ${files.length} files, ${appRules.size} distinct selectors`);

for (const region of inv.regions) {
  if (region.kind === 'capability-gap') continue;
  let exact = 0, selOnly = 0, none = 0;
  const misses = [];
  for (const ru of region.rules) {
    const k = norm(ru.selector);
    const hits = appRules.get(k);
    if (!hits) { none += 1; misses.push(ru.selector.slice(0, 90)); continue; }
    selOnly += 1;
  }
  console.log(`[${region.idx}] ${region.key} rules=${region.ruleCount}  app-selector-match=${selOnly}  no-match=${none}`);
}
