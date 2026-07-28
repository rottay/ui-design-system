/**
 * Per-declaration shadow proof: for each extension rule, does the app's own CSS
 * declare the same property at STRICTLY HIGHER specificity (or equal specificity
 * + later in the cascade) with an identical value?
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from '/Users/daniel/Developer/Rottay/ui-design-system/node_modules/.pnpm/postcss@8.5.10/node_modules/postcss/lib/postcss.js';

const APP = '/Users/daniel/Developer/Rottay/app-bithire/src';
const inv = JSON.parse(readFileSync('/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/closure/wc-inv-bithire.json', 'utf8'));
const EXT = readFileSync('/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/foundation/tokens/css/facade/artifacts/bithire/_source/extension.css', 'utf8');

function cssFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) cssFiles(p, out); else if (e.name.endsWith('.css')) out.push(p);
  }
  return out;
}
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const body = (s) => norm(s)
  .replace(/html\[data-tenant="bithire"\]\s*/g, '')
  .replace(/:root\[data-ds-root\]\s*/g, '')
  .replace(/\s*,\s*/g, ',');

const appBySel = new Map();
for (const f of cssFiles(APP)) {
  let root; try { root = postcss.parse(readFileSync(f, 'utf8'), { from: f }); } catch { continue; }
  root.walkRules((r) => {
    const k = body(r.selector);
    const decls = new Map();
    for (const d of r.nodes ?? []) if (d.type === 'decl') decls.set(d.prop, `${norm(d.value)}${d.important ? ' !important' : ''}`);
    const at = r.parent?.type === 'atrule' ? `@${r.parent.name} ${norm(r.parent.params)}` : '';
    const scope = /:root\[data-ds-root\]/.test(r.selector) ? 'ds-root' : /html\[data-tenant/.test(r.selector) ? 'tenant' : 'bare';
    if (!appBySel.has(k)) appBySel.set(k, []);
    appBySel.get(k).push({ file: f.replace(APP + '/', ''), decls, at, scope, line: r.source?.start?.line });
  });
}

// re-read the extension so we get real decl values
const extRoot = postcss.parse(EXT);
const extRules = new Map(); // line -> {selector, decls}
extRoot.walkRules((r) => {
  const decls = new Map();
  for (const d of r.nodes ?? []) if (d.type === 'decl') decls.set(d.prop, `${norm(d.value)}${d.important ? ' !important' : ''}`);
  extRules.set(r.source.start.line, { selector: norm(r.selector), decls });
});

const result = {};
for (const region of inv.regions) {
  if (region.kind === 'capability-gap') continue;
  const rows = [];
  for (const ru of region.rules) {
    const ext = extRules.get(ru.line);
    if (!ext) { rows.push({ line: ru.line, selector: ru.selector, status: 'NO-EXT-RULE' }); continue; }
    const k = body(ru.selector);
    const at = ru.atStack.map(norm).join(' ');
    const hits = (appBySel.get(k) ?? []).filter((h) => h.at === at || (!h.at && !at));
    const higher = hits.filter((h) => h.scope === 'ds-root');
    const covered = [], differs = [], missing = [];
    for (const [prop, val] of ext.decls) {
      let found = null;
      for (const h of higher) if (h.decls.has(prop)) found = { file: h.file, line: h.line, val: h.decls.get(prop) };
      if (!found) missing.push(prop);
      else if (found.val === val) covered.push(prop);
      else differs.push({ prop, ext: val, app: found.val, at: `${found.file}:${found.line}` });
    }
    rows.push({
      line: ru.line, selector: ru.selector.slice(0, 120), atStack: at,
      twins: higher.map((h) => `${h.file}:${h.line}`),
      declTotal: ext.decls.size, covered: covered.length, differs, missing,
      status: higher.length === 0 ? 'NO-TWIN' : (missing.length === 0 && differs.length === 0 ? 'FULLY-SHADOWED' : 'PARTIAL'),
    });
  }
  result[region.key] = { idx: region.idx, kind: region.kind, rules: rows };
  const s = rows.reduce((a, r) => { a[r.status] = (a[r.status] ?? 0) + 1; return a; }, {});
  const diffCount = rows.reduce((a, r) => a + (r.differs?.length ?? 0), 0);
  const missCount = rows.reduce((a, r) => a + (r.missing?.length ?? 0), 0);
  console.log(`[${region.idx}] ${region.key}  ${JSON.stringify(s)}  differing-decls=${diffCount} missing-decls=${missCount}`);
}
writeFileSync('/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/closure/wc-decl-proof.json', JSON.stringify(result, null, 2));
