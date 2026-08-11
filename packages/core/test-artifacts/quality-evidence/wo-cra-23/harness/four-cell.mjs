/**
 * WO-CRA-23 rottay lane — the FOUR-CELL SILENCE TEST.
 *
 * The census asks "is this name absent from the vertical's unconditional block".
 * That is not the question. The question is "does this vertical resolve to the
 * same value it would resolve to with no tenant artifact at all" — which is a
 * runtime question and is asked here at runtime.
 *
 * FOUR CELLS, one process, one browser, ONE read of the tree:
 *   tenantless/dark   base + modern engine, tenant artifact WITHHELD
 *   tenantless/light  ditto
 *   rottay/dark       committed artifact  (= current source minus this lane's
 *   rottay/light      edits: proven, see below)
 * plus the two AFTER cells so the same run also re-states the change.
 *
 * The tenant-less arm is the SAME bundle string with the tenant artifact spliced
 * out — nothing else differs, including the root attributes, so a difference
 * between the arms is the artifact and can be nothing else.
 *
 * WHY THE COMMITTED ARTIFACT IS A VALID "CURRENT SOURCE" BASELINE. The renderer
 * here is bundled from `src/`, not `dist/` (dist is behind: it emits
 * `--ds-tabs-item-radius: 6px` where the committed artifact carries the
 * radius-scale wrap). Rendering current source and diffing against the committed
 * artifact yields +95 declarations, -0 removed, 0 changed — every difference is
 * this lane's own addition. So committed == current-source-minus-this-lane.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const P = (p) => resolve(CORE, 'src/tooling/resolution-probe', p);

const { resolveBundle, sha256 } = await import(P('runtime/bundle/index.mjs'));
const { launchBrowser } = await import(P('runtime/browser/index.mjs'));
const { rootAttributes, rootAttributesToHtml, rootClassNames } = await import(P('foundation/scope/index.mjs'));
const { renderRottayArtifact } = await import('./render-rottay.mjs');

const ORIGIN = 'http://resolution-probe.invalid';
const PAGE_URL = `${ORIGIN}/probe.html`;
const CSS_URL = `${ORIGIN}/bundle.css`;
/**
 * NOT the probe's own canary pair. `--ds-radius-scale` is declared by the three
 * tenant artifacts and by NOTHING in the base layer, so it is legitimately empty
 * in a tenant-less document — the shipped `CANARY_PROPERTIES` can therefore only
 * guard a tenanted cell, and it correctly refused this one. Both names below are
 * declared in `foundation/themes/default.css` (:593, :754) and survive with the
 * artifact withheld, so an empty reading here still means "the sheet did not
 * apply" and nothing else.
 */
const CANARIES = ['--ds-radius-md', '--ds-font-size-sm'];

const args = process.argv.slice(2);
const outPath = args[args.indexOf('--out') + 1];
const names = readFileSync(args[args.indexOf('--names') + 1], 'utf-8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const committedArtifact = readFileSync(
  resolve(CORE, 'src/foundation/tokens/css/facade/artifacts/rottay/index.css'),
  'utf-8',
);
const { css: renderedArtifact, compiled } = await renderRottayArtifact();

const base = await resolveBundle({ vertical: 'platform', mode: 'fresh' });
const occurrences = base.css.split(committedArtifact).length - 1;
if (occurrences !== 1) {
  throw new Error(`four-cell: committed artifact appears ${occurrences}x in the bundle; refusing.`);
}

const bundles = {
  tenantless: base.css.replace(committedArtifact, '/* tenant artifact withheld */'),
  before: base.css,
  after: base.css.replace(committedArtifact, renderedArtifact),
};

const { browser, close, provenance: browserProvenance } = await launchBrowser();
const cells = {};
try {
  for (const arm of Object.keys(bundles)) {
    for (const theme of ['light', 'dark']) {
      cells[`${arm}/${theme}`] = await readRoot(bundles[arm], theme, names);
    }
  }
} finally {
  await close();
}

writeFileSync(
  outPath,
  `${JSON.stringify(
    {
      instrument: 'wo-cra-23-rottay-four-cell',
      question:
        'Does rottay resolve this channel to the value it would resolve to with NO tenant ' +
        'artifact at all? If yes the channel is silent, whatever the census says.',
      provenance: {
        browser: browserProvenance,
        bundleMode: 'fresh',
        compiledVarCountAfter: Object.keys(compiled.cssVariables).length,
        shas: Object.fromEntries(Object.entries(bundles).map(([k, v]) => [k, sha256(v)])),
      },
      names,
      cells,
    },
    sortedReplacer,
    2,
  )}\n`,
);
console.log(
  `four-cell | names=${names.length}\n` +
    Object.entries(bundles)
      .map(([k, v]) => `  ${k.padEnd(11)}= ${sha256(v).slice(0, 12)}`)
      .join('\n') +
    `\n  out: ${outPath}`,
);

async function readRoot(css, theme, propertyNames) {
  const attributes = rootAttributes({ vertical: 'platform', theme, engine: 'modern', arm: 'both' });
  const classNames = rootClassNames({ theme }).join(' ');
  const html = [
    '<!doctype html>',
    `<html ${rootAttributesToHtml(attributes)} class="${classNames}">`,
    '<head><meta charset="utf-8"><title>four-cell</title>',
    `<link rel="stylesheet" href="${CSS_URL}">`,
    '</head>',
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
      if (url === CSS_URL) return route.fulfill({ contentType: 'text/css; charset=utf-8', body: css });
      return route.abort();
    });
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const canary = await page.evaluate((props) => {
      const computed = getComputedStyle(document.documentElement);
      return {
        sheets: document.styleSheets.length,
        values: props.map((p) => computed.getPropertyValue(p).trim()),
      };
    }, CANARIES);
    if (canary.sheets === 0 || canary.values.some((v) => v === '')) {
      throw new Error('four-cell: bundle did not apply; refusing to publish.');
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

function sortedReplacer(_key, value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
