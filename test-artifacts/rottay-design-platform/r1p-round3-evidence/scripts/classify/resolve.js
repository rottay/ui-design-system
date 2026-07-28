'use strict';
/* Builds the effective root custom-property map per state from the SHIPPED artifact
   (<vertical>/index.css = compiled block + appended extension), so var() references
   can be resolved one level within the same two sources. */
const fs = require('fs');
const postcss = require('/Users/daniel/Developer/Rottay/ui-design-system/packages/core/node_modules/postcss');
const SNAP = '/private/tmp/rottay-design-platform-independent-audit-round-3/snapshots/';
const { splitArms, armMatchesState, armIsDescendant, specificity, cmpSpec } = require('./selector-lib.js');

function buildEffectiveMap(vertical, state) {
  const css = fs.readFileSync(SNAP + vertical + '/index.css', 'utf8');
  const root = postcss.parse(css);
  const best = new Map(); // name -> {spec, order, value, line}
  let order = 0;
  root.walkDecls(decl => {
    order++;
    if (!decl.prop.startsWith('--')) return;
    const rule = decl.parent;
    if (!rule || rule.type !== 'rule') return;
    // at-rule gated declarations are excluded from the unconditional root map
    let p = rule.parent, gated = false;
    while (p && p.type !== 'root') { if (p.type === 'atrule') { gated = true; break; } p = p.parent; }
    if (gated) return;
    const arms = splitArms(rule.selector).filter(a => armMatchesState(a, state) && !armIsDescendant(a));
    if (!arms.length) return;
    const spec = specificity(arms.join(','));
    const prev = best.get(decl.prop);
    if (!prev || cmpSpec(spec, prev.spec) > 0 || (cmpSpec(spec, prev.spec) === 0 && order > prev.order)) {
      best.set(decl.prop, { spec, order, value: String(decl.value).replace(/\s+/g, ' ').trim(), line: decl.source && decl.source.start ? decl.source.start.line : null });
    }
  });
  return best;
}

/** Resolve one level: `var(--x)` / `var(--x, fb)` -> effective value of --x, else null. */
function resolveOneLevel(value, map) {
  const v = String(value).trim();
  const m = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(v);
  if (!m) return { resolved: null, via: null };
  const name = m[1];
  if (map.has(name)) return { resolved: map.get(name).value, via: name + ' @ index.css:' + map.get(name).line };
  if (m[2] != null) {
    const fb = m[2].trim();
    const inner = resolveOneLevel(fb, map);
    if (inner.resolved != null) return { resolved: inner.resolved, via: name + ' (absent) -> fallback ' + inner.via };
    if (!/^var\(/.test(fb)) return { resolved: fb, via: name + ' (absent) -> literal fallback' };
  }
  return { resolved: null, via: name + ' (unresolvable in these two sources)' };
}
module.exports = { buildEffectiveMap, resolveOneLevel };
