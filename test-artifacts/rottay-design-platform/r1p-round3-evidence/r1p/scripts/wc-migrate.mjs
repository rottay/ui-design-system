import { readFileSync, writeFileSync } from 'node:fs';

const EXT = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/foundation/tokens/css/facade/artifacts/bithire/_source/extension.css';
const APPDIR = '/Users/daniel/Developer/Rottay/app-bithire/src/styles';
const lines = readFileSync(EXT, 'utf8').split('\n');
const slice = (a, b) => lines.slice(a - 1, b); // 1-indexed inclusive

/** Drop `/* @ds-exception ... *\/` blocks: they are DS-extension governance, not app CSS. */
function stripHeaders(arr) {
  const out = [];
  let skipping = false;
  for (const l of arr) {
    if (!skipping && /^\s*\/\*\s*@ds-exception/.test(l)) { skipping = true; if (l.includes('*/')) skipping = false; continue; }
    if (skipping) { if (l.includes('*/')) skipping = false; continue; }
    out.push(l);
  }
  // collapse runs of 3+ blank lines left behind by the removals
  const tidy = [];
  for (const l of out) {
    if (l.trim() === '' && tidy.length >= 2 && tidy.at(-1).trim() === '' && tidy.at(-2).trim() === '') continue;
    tidy.push(l);
  }
  while (tidy.length && tidy[0].trim() === '') tidy.shift();
  while (tidy.length && tidy.at(-1).trim() === '') tidy.pop();
  return tidy;
}

const banner = (title, regions, body) => [
  '/**',
  ` * ${title}`,
  ' *',
  ' * Drained out of the BitHire static vertical extension',
  ' * (@rottay/design-system artifacts/bithire/_source/extension.css) by the R1-P',
  ' * closure wave: a vertical extension may carry root-level semantic capability',
  ' * gaps and governed reduced-motion emission, not product composition.',
  ' *',
  ` * Source regions: ${regions}.`,
  ' * Selectors are byte-identical to the extension, `html[data-tenant="bithire"]`',
  ' * scope included, and globals.css imports this file immediately after the DS',
  ' * bundle — the same document position the extension section held — so every',
  ' * cascade winner is unchanged.',
  ' */',
  '',
  ...body,
  '',
].join('\n');

// ── app file 1: collection + preview chrome (regions 4,5,6,7,9,10,11) ──
const app1 = banner(
  'BitHire collection and preview chrome',
  'structural#1 (keyframes), component-local#1/#2/#3, media#1/#2, reduced-motion#1',
  [...stripHeaders(slice(560, 1764)), '', ...stripHeaders(slice(1783, 2742))],
);

// ── app file 2: detail editor chrome (regions 22..28) ──
const app2 = banner(
  'BitHire detail inline-editor chrome',
  'component-local#11/#12/#13/#14/#15, structural#2 (keyframes), media#3',
  stripHeaders(slice(3577, 5730)),
);

// ── app file 3: tenant component defaults (regions 15-live, 17, 21-live) ──
const app3 = banner(
  'BitHire tenant-level component defaults',
  'component-local#7 (live arm), component-local#8, component-local#10 (live rule)',
  [
    '/* Counting badges render tabular figures (design-language §8.6). The Modern',
    '   Badge engine renders `rottay-badge rottay-badge--modern`; the two antd arms',
    '   this rule also carried (.ant-badge-count, .ant-scroll-number) were retired',
    '   with the rest of the frozen classic-engine vocabulary — BitHire pins',
    '   engine:"modern", so no `.ant-*` element exists in its document. */',
    'html[data-tenant="bithire"] .rottay-badge {',
    '  font-variant-numeric: tabular-nums;',
    '}',
    '',
    '/* DS data-table cells align digit-for-digit by default; the property only',
    '   affects digits, so covering the whole table is safe for text columns. */',
    ...stripHeaders(slice(2866, 2868)),
    '',
    '/* Surface families read the control ink. */',
    ...stripHeaders(slice(3560, 3576)),
  ],
);

writeFileSync(`${APPDIR}/collection-preview-chrome.css`, app1);
writeFileSync(`${APPDIR}/detail-editor-chrome.css`, app2);
writeFileSync(`${APPDIR}/tenant-component-defaults.css`, app3);

// ── the trimmed extension ──
const kept = [
  ...slice(1, 559),
  ...slice(1765, 1782),
  ...slice(2846, 2861),
  ...slice(2896, 2905),   // reduced-motion header + media open + the root motion rule
  ...slice(2910, 2910),   // the media block's closing brace
  ...slice(2911, 3434),
];
writeFileSync(EXT, `${kept.join('\n').replace(/\n{3,}/g, '\n\n')}\n`);

console.log(`app1 ${app1.split('\n').length} lines | app2 ${app2.split('\n').length} | app3 ${app3.split('\n').length} | extension ${kept.length} -> written`);
