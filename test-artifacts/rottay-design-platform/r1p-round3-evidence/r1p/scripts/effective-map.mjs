/**
 * Effective root custom-property map of a generated artifact, per state.
 *
 * Same winner rules as the Round 3 classification (reuses its selector-lib):
 * root-matching, non-at-rule-gated declarations, highest specificity, ties by
 * source order. Used as the before/after pixel-preservation comparator.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const AUDIT = '/private/tmp/rottay-design-platform-independent-audit-round-3';
const require_ = createRequire(`${CORE}/package.json`);
const postcss = require_('postcss');
const sel = createRequire(`${AUDIT}/scripts/classify/selector-lib.js`)('./selector-lib.js');

export function effectiveMap(css, state, file = 'artifact.css') {
  const root = postcss.parse(css, { from: file });
  const winners = new Map();
  let order = 0;
  root.walkRules((rule) => {
    if (rule.parent?.type === 'atrule') return; // conditional context, not base cascade
    const arms = sel.splitArms(rule.selector).filter(
      (arm) => sel.armMatchesState(arm, state) && !sel.armIsDescendant(arm)
    );
    if (arms.length === 0) return;
    let spec = [0, 0, 0];
    for (const arm of arms) {
      const s = sel.specificity(arm);
      if (sel.cmpSpec(s, spec) > 0) spec = s;
    }
    for (const decl of rule.nodes ?? []) {
      if (decl.type !== 'decl') continue;
      order += 1;
      const prev = winners.get(decl.prop);
      if (!prev || sel.cmpSpec(spec, prev.spec) >= 0) {
        winners.set(decl.prop, { value: decl.value, spec, order, selector: rule.selector });
      }
    }
  });
  return winners;
}

if (process.argv[2]) {
  const out = {};
  for (const slug of ['bithire', 'evnto', 'rottay']) {
    const css = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/index.css`, 'utf-8');
    out[slug] = {};
    for (const state of ['default', 'light', 'dark']) {
      out[slug][state] = Object.fromEntries(
        [...effectiveMap(css, state, slug)].map(([k, v]) => [k, v.value])
      );
    }
    console.log(`${slug}: ${Object.keys(out[slug].default).length} default / ${Object.keys(out[slug].light).length} light / ${Object.keys(out[slug].dark).length} dark`);
  }
  writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
}
