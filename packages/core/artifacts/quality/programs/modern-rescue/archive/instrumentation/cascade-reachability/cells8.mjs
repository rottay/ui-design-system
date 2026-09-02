/**
 * WO-CRA-23 merge lane — 8 cells, full declared corpus, artifacts rendered from SOURCE.
 *
 * The committed bithire artifact is deliberately stale (its regeneration is the
 * wave build's), so a run against committed artifacts would read bithire's
 * PRE-fix values and misattribute rows to it. Every artifact is therefore
 * rendered in memory from its authored `.ts` + extension, as the harness README
 * requires, and the tenant-less arm is spliced from the same base string.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Outputs land beside this file, so the harness is runnable from anywhere. */
const SP = dirname(fileURLToPath(import.meta.url));


const CORE = resolve(SP, '../../../..');
const P = (p) => resolve(CORE, 'src/tooling/resolution-probe', p);

const { resolveBundle, sha256 } = await import(P('runtime/bundle/index.mjs'));
const { launchBrowser } = await import(P('runtime/browser/index.mjs'));
const { rootAttributes, rootAttributesToHtml, rootClassNames } = await import(P('foundation/scope/index.mjs'));
const { renderArtifact, committedArtifact, SLUG } = await import(`${SP}/render-artifact.mjs`);

const ORIGIN = 'http://resolution-probe.invalid';
const PAGE_URL = `${ORIGIN}/probe.html`;
const CSS_URL = `${ORIGIN}/bundle.css`;
const CANARIES = ['--ds-radius-md', '--ds-font-size-sm'];   // base-declared; trap 2
const VERTICALS = ['platform', 'bithire', 'evnto'];

// Trap 5: pin what the tree looked like at measurement time.
const WATCH = [
  'src/foundation/tokens/css/foundation/themes/default.css',
  'src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts',
  'src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts',
  'src/foundation/tokens/ts/presentation/brand-themes/platform/index.ts',
  'src/foundation/tokens/css/facade/artifacts/bithire/_source/extension.css',
];
const watched = Object.fromEntries(
  WATCH.map((p) => [p, createHash('sha256').update(readFileSync(resolve(CORE, p))).digest('hex').slice(0, 16)]),
);

const bundles = {};
let tenantless = null;
const rendered = {};
for (const vertical of VERTICALS) {
  const slug = SLUG[vertical];
  const base = await resolveBundle({ vertical, mode: 'fresh' });
  const committed = committedArtifact(slug);
  if (base.css.split(committed).length - 1 !== 1) throw new Error(`cells8: ${slug} artifact not unique.`);
  const { css } = await renderArtifact(slug);
  rendered[slug] = { staleInTree: css !== committed };
  bundles[vertical] = base.css.replace(committed, css);
  if (vertical === 'platform') tenantless = base.css.replace(committed, '/* tenant artifact withheld */');
}

const names = [
  ...new Set([...Object.values(bundles), tenantless].flatMap((t) => t.match(/--ds-[a-z0-9-]+(?=\s*:)/g) ?? [])),
].sort();

const { browser, close, provenance } = await launchBrowser();
const cells = {};
try {
  for (const theme of ['light', 'dark']) {
    cells[`tenantless/${theme}`] = await readRoot(tenantless, 'platform', theme, names);
    for (const vertical of VERTICALS) cells[`${vertical}/${theme}`] = await readRoot(bundles[vertical], vertical, theme, names);
  }
} finally {
  await close();
}

const after = Object.fromEntries(
  WATCH.map((p) => [p, createHash('sha256').update(readFileSync(resolve(CORE, p))).digest('hex').slice(0, 16)]),
);
const moved = WATCH.filter((p) => watched[p] !== after[p]);

writeFileSync(
  `${SP}/cells8.json`,
  `${JSON.stringify(
    {
      instrument: 'wo-cra-23-merge-8cell',
      provenance: {
        browser: provenance,
        bundleMode: 'fresh',
        artifactsRenderedFromSource: true,
        artifactStaleInTree: rendered,
        watchedFilesBefore: watched,
        watchedFilesAfter: after,
        watchedFilesMovedDuringRun: moved,
        shas: Object.fromEntries([...VERTICALS.map((v) => [v, sha256(bundles[v])]), ['tenantless', sha256(tenantless)]]),
      },
      corpus: names.length,
      cells,
    },
    null,
    1,
  )}\n`,
);
console.log(`corpus=${names.length} cells=${Object.keys(cells).length}`);
console.log(`artifact stale in tree: ${JSON.stringify(rendered)}`);
console.log(`watched files moved during the run: ${moved.length ? moved.join(', ') : 'none'}`);
if (moved.length) process.exitCode = 2;

async function readRoot(css, vertical, theme, propertyNames) {
  const attributes = rootAttributes({ vertical, theme, engine: 'modern', arm: 'both' });
  const classNames = rootClassNames({ theme }).join(' ');
  const html = [
    '<!doctype html>',
    `<html ${rootAttributesToHtml(attributes)} class="${classNames}">`,
    '<head><meta charset="utf-8"><title>cells8</title>',
    `<link rel="stylesheet" href="${CSS_URL}"></head>`,
    `<body class="${classNames}"></body></html>`,
  ].join('\n');
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1,
    colorScheme: theme === 'dark' ? 'dark' : 'light', reducedMotion: 'reduce',
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
      const c = getComputedStyle(document.documentElement);
      return { sheets: document.styleSheets.length, values: props.map((p) => c.getPropertyValue(p).trim()) };
    }, CANARIES);
    if (canary.sheets === 0 || canary.values.some((x) => x === '')) throw new Error(`cells8: bundle did not apply for ${vertical}/${theme}`);
    return page.evaluate((props) => {
      void document.documentElement.offsetHeight;
      const c = getComputedStyle(document.documentElement);
      const out = {};
      for (const p of props) out[p] = c.getPropertyValue(p).trim();
      return out;
    }, propertyNames);
  } finally { await page.close(); await context.close(); }
}
