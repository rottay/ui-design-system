/**
 * Four-cell proof for the tenant-free light-ground repair.
 *
 * Reads the 8 pre-composed bundles (before/after × platform,bithire,evnto,tenantless)
 * so BOTH arms come from one disk state each and the tree is never swapped
 * mid-run. Measures the FULL `--ds-*` corpus — every name declared anywhere in
 * any of the 8 bundles — at :root, in both themes.
 *
 * PASS: all three verticals byte-identical between arms, in both themes.
 *       Only the tenant-less cell moves.
 * Any vertical movement is the pin list, not a result.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const S = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/9de519b9-cdd9-4637-b562-0d6a74d41c3a/scratchpad/CRA23R';
const P = (p) => resolve(CORE, 'src/tooling/resolution-probe', p);

const { launchBrowser } = await import(P('runtime/browser/index.mjs'));
const { rootAttributes, rootAttributesToHtml, rootClassNames } = await import(P('foundation/scope/index.mjs'));

const ORIGIN = 'http://resolution-probe.invalid';
const PAGE_URL = `${ORIGIN}/probe.html`;
const CSS_URL = `${ORIGIN}/bundle.css`;
const CANARIES = ['--ds-radius-md', '--ds-font-size-sm'];
const CELLS = ['platform', 'bithire', 'evnto', 'tenantless'];

const css = {};
for (const arm of ['before', 'after']) {
  for (const cell of CELLS) css[`${arm}/${cell}`] = readFileSync(`${S}/bundle-${arm}-${cell}.css`, 'utf-8');
}

/** Every `--ds-*` name declared anywhere in any bundle — the full corpus, not a sample. */
const names = [
  ...new Set(Object.values(css).flatMap((text) => (text.match(/--ds-[a-z0-9-]+(?=\s*:)/g) ?? []))),
].sort();

const { browser, close, provenance } = await launchBrowser();
const readings = {};
try {
  for (const key of Object.keys(css)) {
    const vertical = key.endsWith('tenantless') ? 'platform' : key.split('/')[1];
    for (const theme of ['light', 'dark']) {
      readings[`${key}/${theme}`] = await readRoot(css[key], vertical, theme, names);
    }
  }
} finally {
  await close();
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const report = { instrument: 'wo-cra-23-light-ground-proof', browser: provenance, corpus: names.length, moved: {} };
let verticalMoves = 0;
for (const cell of CELLS) {
  for (const theme of ['light', 'dark']) {
    const b = readings[`before/${cell}/${theme}`];
    const a = readings[`after/${cell}/${theme}`];
    const moved = names.filter((n) => norm(b[n] ?? '') !== norm(a[n] ?? ''));
    report.moved[`${cell}/${theme}`] = moved.map((n) => ({ name: n, from: norm(b[n] ?? ''), to: norm(a[n] ?? '') }));
    if (cell !== 'tenantless') verticalMoves += moved.length;
    console.log(`${cell}/${theme}: ${moved.length} moved of ${names.length}`);
  }
}
report.verdict = verticalMoves === 0 ? 'PASS' : `FAIL — ${verticalMoves} vertical rows moved; this is the pin list`;
console.log(`\ncorpus: ${names.length} names\nverdict: ${report.verdict}`);
writeFileSync(`${S}/proof.json`, `${JSON.stringify(report, null, 1)}\n`);

async function readRoot(text, vertical, theme, propertyNames) {
  const attributes = rootAttributes({ vertical, theme, engine: 'modern', arm: 'both' });
  const classNames = rootClassNames({ theme }).join(' ');
  const html = [
    '<!doctype html>',
    `<html ${rootAttributesToHtml(attributes)} class="${classNames}">`,
    '<head><meta charset="utf-8"><title>proof</title>',
    `<link rel="stylesheet" href="${CSS_URL}"></head>`,
    `<body class="${classNames}"></body></html>`,
  ].join('\n');
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: theme === 'dark' ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    await page.route(`${ORIGIN}/**`, (route) => {
      const url = route.request().url();
      if (url === PAGE_URL) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
      if (url === CSS_URL) return route.fulfill({ contentType: 'text/css; charset=utf-8', body: text });
      return route.abort();
    });
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const canary = await page.evaluate((props) => {
      const computed = getComputedStyle(document.documentElement);
      return { sheets: document.styleSheets.length, values: props.map((p) => computed.getPropertyValue(p).trim()) };
    }, CANARIES);
    if (canary.sheets === 0 || canary.values.some((x) => x === '')) {
      throw new Error(`proof: bundle did not apply for ${vertical}/${theme}; refusing to publish.`);
    }
    return page.evaluate((props) => {
      void document.documentElement.offsetHeight;
      const computed = getComputedStyle(document.documentElement);
      const out = {};
      for (const p of props) out[p] = computed.getPropertyValue(p).trim();
      return out;
    }, propertyNames);
  } finally {
    await page.close();
    await context.close();
  }
}
