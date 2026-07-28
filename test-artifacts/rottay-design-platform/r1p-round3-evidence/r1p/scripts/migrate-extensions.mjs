/**
 * AD-1 + AD-2 + AD-3 extension migration.
 *
 *  1. delete every base-state root re-declaration of a compiler-emitted channel
 *     that the plan resolved (duplicate, compiled-wins, or adopted into TS)
 *  2. delete the bithire CLEAR MODE GUARD region (AD-3)
 *  3. put a declared exception header on every surviving top-level region
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const ROOT = '/private/tmp/rottay-design-platform-independent-audit-round-3';
const require_ = createRequire(`${CORE}/package.json`);
const postcss = require_('postcss');
const sel = createRequire(`${ROOT}/scripts/classify/selector-lib.js`)('./selector-lib.js');

const plan = JSON.parse(readFileSync(`${ROOT}/r1p/migration-plan.json`, 'utf-8'));

/** Non-default mode per vertical: the only mode a mode-block may author. */
const NON_DEFAULT_MODE = { bithire: 'dark', evnto: 'dark', rottay: 'light' };

const RETIRE = {
  bithire:
    'BrandTheme can express these channels at their own granularity (a ground field that does not re-derive the tint system, and a card-border-strong field)',
  evnto: 'BrandTheme gains fields for the evnto-only marquee channels declared here',
  rottay:
    'BrandTheme gains per-step ramp overrides (or the OKLCH-derived steps are accepted as a sighted visual change) and per-channel card/input/shadow fields',
};

const PURPOSE = {
  'mode-block': (slug) => `${NON_DEFAULT_MODE[slug]}-mode palette; the compiler owns the ${slug === 'rottay' ? 'dark' : 'light'} default`,
  'capability-gap': () => 'flat channels the BrandTheme contract cannot express at this granularity',
  'component-local': () => 'descendant-scoped component skin; never competes at the tenant root',
  structural: () => 'non-custom-property rules (keyframes, pseudo-elements, focus and layout)',
  media: () => 'viewport- and capability-gated rules the compiler cannot express',
  'reduced-motion': () => 'accessibility motion zeroing under prefers-reduced-motion',
};

const OWNER = {
  'mode-block': 'claude',
  'capability-gap': 'claude',
  'reduced-motion': 'claude',
  'component-local': 'kimi',
  structural: 'kimi',
  media: 'kimi',
};

const REACHABILITY = {
  'mode-block': (slug) => `mode:${NON_DEFAULT_MODE[slug]}`,
  'capability-gap': () => 'shipped',
  'component-local': () => 'subtree',
  structural: () => 'subtree',
  media: () => 'media',
  'reduced-motion': () => 'media',
};

function ruleIsRootScope(rule) {
  return sel.splitArms(rule.selector).some((arm) => !sel.armIsDescendant(arm));
}

function ruleMatchesState(rule, state) {
  return sel.splitArms(rule.selector).some((arm) => sel.armMatchesState(arm, state) && !sel.armIsDescendant(arm));
}

function classifyNode(node, slug) {
  if (node.type === 'atrule') {
    if (node.name === 'keyframes') return 'structural';
    if (/prefers-reduced-motion/.test(node.params)) return 'reduced-motion';
    return 'media';
  }
  if (node.type !== 'rule') return null;
  const custom = (node.nodes ?? []).some((d) => d.type === 'decl' && d.prop.startsWith('--'));
  if (!ruleIsRootScope(node)) return 'component-local';
  if (!custom) return 'structural';
  if (ruleMatchesState(node, NON_DEFAULT_MODE[slug]) && !ruleMatchesState(node, 'default')) return 'mode-block';
  return 'capability-gap';
}

const summary = {};

for (const slug of ['bithire', 'evnto', 'rottay']) {
  const file = `${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`;
  const root = postcss.parse(readFileSync(file, 'utf-8'), { from: file });
  const deleteNames = new Set(plan[slug].deleteNames);

  // 1 · AD-3: drop the bithire CLEAR MODE GUARD region.
  let guardRemoved = 0;
  root.each((node) => {
    if (node.type !== 'comment' || !/CLEAR MODE GUARD/.test(node.text)) return;
    let cursor = node.next();
    node.remove();
    guardRemoved += 1;
    while (cursor && cursor.type === 'rule' && ruleMatchesState(cursor, 'dark') && !ruleMatchesState(cursor, 'default')) {
      const next = cursor.next();
      guardRemoved += (cursor.nodes ?? []).filter((d) => d.type === 'decl').length;
      cursor.remove();
      cursor = next;
    }
  });

  // 2 · AD-1: delete resolved re-declarations from base-state root rules.
  let declsRemoved = 0;
  root.walkRules((rule) => {
    if (rule.parent?.type === 'atrule') return;
    if (!ruleIsRootScope(rule) || !ruleMatchesState(rule, 'default')) return;
    for (const decl of [...(rule.nodes ?? [])]) {
      if (decl.type !== 'decl' || !deleteNames.has(decl.prop)) continue;
      decl.remove();
      declsRemoved += 1;
    }
    if ((rule.nodes ?? []).filter((n) => n.type === 'decl').length === 0) rule.remove();
  });

  // 3 · AD-2: one declared header per contiguous same-kind region.
  const regions = [];
  root.each((node) => {
    const kind = classifyNode(node, slug);
    if (!kind) return;
    const last = regions.at(-1);
    if (last && last.kind === kind && last.end.next() === node) last.end = node;
    else regions.push({ kind, start: node, end: node });
  });

  for (const region of regions) {
    const { kind } = region;
    const parts = [
      `@ds-exception kind=${kind}`,
      `owner=${OWNER[kind]}`,
      `purpose="${PURPOSE[kind](slug)}"`,
      `reachability=${REACHABILITY[kind](slug)}`,
    ];
    if (kind === 'capability-gap') parts.push(`retire="${RETIRE[slug]}"`);
    const header = postcss.comment({ text: `${parts[0]}\n   ${parts.slice(1).join('\n   ')}` });
    header.raws.before = region.start.raws.before?.includes('\n\n') ? '\n\n' : '\n';
    header.raws.left = ' ';
    header.raws.right = ' ';
    region.start.before(header);
    region.start.raws.before = '\n';
  }

  writeFileSync(file, root.toString());
  summary[slug] = { guardRemoved, declsRemoved, regions: regions.length, kinds: regions.reduce((a, r) => ({ ...a, [r.kind]: (a[r.kind] ?? 0) + 1 }), {}) };
  console.log(`${slug}: -${declsRemoved} decls, guard nodes removed ${guardRemoved}, ${regions.length} declared regions`, summary[slug].kinds);
}

writeFileSync(`${ROOT}/r1p/extension-migration-summary.json`, JSON.stringify(summary, null, 2));
