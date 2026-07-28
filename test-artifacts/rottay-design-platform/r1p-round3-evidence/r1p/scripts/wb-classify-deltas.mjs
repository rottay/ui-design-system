/**
 * Classify every acid-test delta.
 *
 * Claim under test: each changed channel was an ALIAS the hand-written mode
 * block forgot, so the non-default state was still showing the DEFAULT mode's
 * value; routing it through the typed field moves it to its own mode's value.
 * Evidence = before equals the base block's value for that channel.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { effectiveMap } from './effective-map.mjs';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const R1P = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p';
const require_ = createRequire(`${CORE}/package.json`);
const postcss = require_('postcss');

const norm = (v) => (v == null ? null : v.replace(/\s+/g, ' ').trim().toLowerCase());

/** The base (default-mode) compiled block of an artifact. */
function baseBlock(css) {
  const root = postcss.parse(css, { from: 'a.css' });
  const map = new Map();
  let armed = false;
  root.each((node) => {
    if (node.type === 'comment' && /Compiled from BrandTheme via/.test(node.text)) { armed = true; return; }
    if (armed && node.type === 'rule') {
      for (const d of node.nodes ?? []) if (d.type === 'decl') map.set(d.prop, d.value);
      armed = false;
    }
  });
  return map;
}

const delta = JSON.parse(readFileSync(`${R1P}/closure/wb-acid-delta.json`, 'utf-8'));
const summary = { aliasFollowsField: [], fontRestoration: [], unexplained: [] };

for (const [slug, states] of Object.entries(delta)) {
  const beforeCss = readFileSync(`${R1P}/closure/wb-snapshot/${slug}.index.css`, 'utf-8');
  const base = baseBlock(beforeCss);
  for (const [state, d] of Object.entries(states)) {
    for (const c of d.changed) {
      const row = { slug, state, channel: c.k, before: c.before, after: c.after, baseWas: base.get(c.k) };
      if (/^--ds-font-family-/.test(c.k)) summary.fontRestoration.push(row);
      else if (norm(base.get(c.k)) === norm(c.before)) summary.aliasFollowsField.push(row);
      else summary.unexplained.push(row);
    }
  }
}

console.log(`alias-follows-field : ${summary.aliasFollowsField.length}`);
for (const r of summary.aliasFollowsField) {
  console.log(`   ${r.slug} ${r.state} ${r.channel}`);
  console.log(`      was ${r.before}  (== the base/default-mode value)`);
  console.log(`      now ${r.after}`);
}
console.log(`\nfont-restoration    : ${summary.fontRestoration.length}`);
for (const r of summary.fontRestoration) console.log(`   ${r.slug} ${r.state} ${r.channel}`);
console.log(`\nUNEXPLAINED         : ${summary.unexplained.length}`);
for (const r of summary.unexplained) console.log(`   ${r.slug} ${r.state} ${r.channel}: ${r.before} -> ${r.after} (base was ${r.baseWas})`);
