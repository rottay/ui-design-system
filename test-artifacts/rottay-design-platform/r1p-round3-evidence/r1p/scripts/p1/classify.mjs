/**
 * P1 task 1: classify EVERY declaration remaining in the three static vertical
 * extensions.
 *
 * Capability is measured two ways, unioned, because either one alone lies:
 *   A. contract probe (p1-contract-map.json) — sentinel per BrandTheme leaf.
 *      Blind to a contract field NO donor theme sets.
 *   B. emitter inventory — Object.keys(chromeToVariables(populatedChrome)) and
 *      the brand/palette emitters run over a fully-populated theme. Sees every
 *      name an emitter CAN write regardless of what a donor happens to author.
 *
 * Reality is measured by the consumer census (p1-consumer-census.json): a
 * channel nothing reads is not a channel.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { loadSource, CORE_ROOT } from '../source-loader.mjs';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const ART = `${CORE_ROOT}/src/foundation/tokens/css/facade/artifacts`;
const requireFromCore = createRequire(`${CORE_ROOT}/package.json`);
const postcss = requireFromCore('postcss');

const contractMap = JSON.parse(readFileSync(`${OUT}/p1-contract-map.json`, 'utf-8'));
const census = JSON.parse(readFileSync(`${OUT}/p1-consumer-census.json`, 'utf-8'));

// ---------------------------------------------------------------- emitter inventory
const gate = await import(`${CORE_ROOT}/scripts/tenant-channel-consumer-gate.mjs`);
const mods = await loadSource({
  chrome: '/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts',
  brand: '/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
});
const emitted = new Set(gate.collectEmittedChannelNames(mods.chrome.chromeToVariables));
console.log(`emitter inventory: ${emitted.size} chrome channel names`);

// ---------------------------------------------------------------- component vocabulary
/**
 * Component families that are UI-component literals, i.e. `--ds-<x>-*` where
 * <x> names a concrete widget rather than a semantic theme role. Derived from
 * the rottay extension's own section headings (7..61 are titled
 * "COMPONENT TOKENS - <X>"), not hand-invented.
 */
const COMPONENT_FAMILIES = new Set([
  'button', 'input', 'card', 'modal', 'table', 'tabs', 'avatar', 'badge', 'tag',
  'alert', 'tooltip', 'checkbox', 'radio', 'switch', 'slider', 'select',
  'datepicker', 'inputnumber', 'textarea', 'timepicker', 'form', 'upload',
  'autocomplete', 'toggle', 'dropdown', 'popover', 'drawer', 'notification',
  'message', 'progress', 'skeleton', 'spinner', 'divider', 'pagination',
  'breadcrumb', 'menu', 'steps', 'collapse', 'calendar', 'tree', 'timeline',
  'empty', 'result', 'segmented', 'rate', 'statistic', 'image', 'list',
  'floatbutton', 'command', 'livefeed', 'stats', 'descriptions', 'backtop',
  'anchor', 'watermark', 'transfer', 'sidebar', 'layout', 'shell',
]);

/** Semantic theme vocabulary roots: surfaces, inks, borders, states, scales. */
const SEMANTIC_ROOTS = [
  'color', 'text', 'bg', 'surface', 'border', 'shadow', 'radius', 'font',
  'space', 'spacing', 'duration', 'ease', 'motion', 'gradient', 'glow',
  'overlay', 'icon', 'accent', 'highlight', 'live', 'scrollbar', 'selection',
  'code', 'link', 'focus', 'elevation', 'z',
];

function familyOf(prop) {
  const m = /^--ds-([a-z0-9]+)-/.exec(prop);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------- parse
const SLUGS = ['bithire', 'evnto', 'rottay'];
const ledger = { generatedAt: new Date().toISOString(), verticals: {} };

for (const slug of SLUGS) {
  const file = `${ART}/${slug}/_source/extension.css`;
  const css = readFileSync(file, 'utf-8');
  const root = postcss.parse(css, { from: file });
  const cmap = contractMap[slug].byVar;

  /** Region = the @ds-exception comment that most recently preceded the node. */
  const regions = [];
  root.walkComments((c) => {
    const t = c.text ?? '';
    if (!t.includes('@ds-exception')) return;
    const kind = /kind=([a-z-]+)/.exec(t)?.[1] ?? 'unknown';
    const purpose = /purpose="([^"]*)"/.exec(t)?.[1] ?? '';
    const retire = /retire="([^"]*)"/.exec(t)?.[1] ?? '';
    const owner = /owner=([^\s]+)/.exec(t)?.[1] ?? '';
    regions.push({ index: regions.length, line: c.source.start.line, kind, purpose, retire, owner, decls: 0 });
  });
  const regionAt = (line) => {
    let best = null;
    for (const r of regions) if (r.line <= line) best = r;
    return best;
  };

  const rows = [];
  root.walkDecls((decl) => {
    const line = decl.source.start.line;
    const region = regionAt(line);
    // at-rule context chain
    const atChain = [];
    for (let p = decl.parent; p; p = p.parent) if (p.type === 'atrule') atChain.push(`@${p.name} ${p.params}`);
    const selector = decl.parent?.type === 'rule' ? decl.parent.selector : '';
    const prop = decl.prop;
    const isCustom = prop.startsWith('--');
    const cands = cmap[prop] ?? [];
    const verbatimPaths = cands.filter((c) => c.kind === 'verbatim').map((c) => c.path);
    const derivedPaths = cands.filter((c) => c.kind === 'derived').map((c) => c.path);
    const c = census[prop] ?? { real: 0, byRoot: {}, files: [] };
    const fam = familyOf(prop);

    let cls;
    let note = '';
    if (atChain.length) {
      cls = 'legitimate-media-reduced-motion';
      note = atChain.join(' / ');
    } else if (!isCustom) {
      cls = 'non-custom-property';
      note = 'a real CSS property, not a channel';
    } else if (verbatimPaths.length) {
      cls = 'existing-BrandTheme-field';
      note = verbatimPaths.join(', ');
    } else if (emitted.has(prop)) {
      cls = 'existing-BrandTheme-field';
      note = `chrome emitter can write it (no donor theme sets the leaf, so the probe is blind)`;
    } else if (c.real === 0) {
      cls = 'obsolete';
      note = 'zero non-declarer non-test readers repo-wide';
    } else if (fam && COMPONENT_FAMILIES.has(fam)) {
      cls = 'component-literal';
      note = `family=${fam}; ${c.real} readers`;
    } else if (fam && SEMANTIC_ROOTS.includes(fam)) {
      cls = 'semantic-vocabulary';
      note = `root=${fam}; ${c.real} readers`;
    } else {
      cls = 'unclassified-semantic';
      note = `${c.real} readers`;
    }
    if (region) region.decls += 1;
    rows.push({
      line, prop, value: decl.value, selector, atChain, region: region?.index ?? null,
      regionKind: region?.kind ?? null, cls, note,
      readers: c.real, readerRoots: c.byRoot, readerFiles: c.files.slice(0, 4),
      verbatimPaths, derivedPaths, emitterOwned: emitted.has(prop),
    });
  });

  const tally = {};
  for (const r of rows) tally[r.cls] = (tally[r.cls] ?? 0) + 1;
  ledger.verticals[slug] = { file: file.replace(CORE_ROOT + '/', ''), totalDecls: rows.length, regions, tally, rows };
  console.log(`${slug}: ${rows.length} decls  ${JSON.stringify(tally)}`);
}

writeFileSync(`${OUT}/p1-ledger.json`, JSON.stringify(ledger, null, 1));
console.log(`wrote ${OUT}/p1-ledger.json`);
