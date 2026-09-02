/**
 * WO-CRA-23 — blast radius of repairing the tenant-free light ground.
 *
 * THE DEFECT, measured: `foundation/themes/default.css` declares a DARK ground on
 * bare `:root` (`--ds-color-bg-primary: #0A0A0C`, `-bg-input: #0F0F12`,
 * `-text-primary: #ECECEC` …). A `.dark` / `[data-theme='dark']` block layers a
 * DIFFERENT dark over it (`#0b1220`, slate-blue). There is no light block at all —
 * the tenant-free bundle contains zero `[data-theme='light']` selectors. So an
 * untenanted LIGHT document paints the bare-`:root` dark.
 *
 * THE QUESTION THIS ANSWERS. Repairing that ground is only safe if no tenanted
 * vertical silently inherits it. For every candidate channel, per vertical, in
 * LIGHT: does the vertical resolve to the same value the tenant-less document
 * resolves to? If yes, the vertical is inheriting the dark base in light and a
 * repair moves that vertical's paint too.
 *
 * Same discipline as the other runs in this lane: one process, one read of the
 * tree, one browser; every cell composed from the same base string so a
 * difference between cells is the tenant artifact and can be nothing else.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const P = (p) => resolve(CORE, 'src/tooling/resolution-probe', p);

const { resolveBundle, sha256 } = await import(P('runtime/bundle/index.mjs'));
const { launchBrowser } = await import(P('runtime/browser/index.mjs'));
const { rootAttributes, rootAttributesToHtml, rootClassNames, VERTICALS } = await import(
  P('foundation/scope/index.mjs')
);

const ORIGIN = 'http://resolution-probe.invalid';
const PAGE_URL = `${ORIGIN}/probe.html`;
const CSS_URL = `${ORIGIN}/bundle.css`;
/** Base-declared both — `--ds-radius-scale` is artifact-only and is empty here by design. */
const CANARIES = ['--ds-radius-md', '--ds-font-size-sm'];

const args = process.argv.slice(2);
const outPath = args[args.indexOf('--out') + 1];
const names = readFileSync(args[args.indexOf('--names') + 1], 'utf-8')
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const bundles = {};
const shas = {};
for (const vertical of ['platform', 'bithire', 'evnto']) {
  const bundle = await resolveBundle({ vertical, mode: 'fresh' });
  bundles[vertical] = bundle.css;
  shas[vertical] = sha256(bundle.css);
}

/**
 * The tenant-less arm is spliced out of the PLATFORM bundle. Any of the three
 * would do — they share base + engine — and this is asserted rather than assumed:
 * the tenant-less text derived from each of the three must be identical.
 */
const artifacts = {
  platform: readFileSync(resolve(CORE, 'src/foundation/tokens/css/facade/artifacts/rottay/index.css'), 'utf-8'),
  bithire: readFileSync(resolve(CORE, 'src/foundation/tokens/css/facade/artifacts/bithire/index.css'), 'utf-8'),
  evnto: readFileSync(resolve(CORE, 'src/foundation/tokens/css/facade/artifacts/evnto/index.css'), 'utf-8'),
};
const stripped = {};
for (const [vertical, artifact] of Object.entries(artifacts)) {
  const n = bundles[vertical].split(artifact).length - 1;
  if (n !== 1) throw new Error(`blast-radius: ${vertical} artifact appears ${n}x in its bundle; refusing.`);
  stripped[vertical] = bundles[vertical].replace(artifact, '/* tenant artifact withheld */');
}
/**
 * The three stripped bundles are NOT byte-identical, and the first version of
 * this check refused the run because of it. Measured, the difference is exactly
 * two things and neither can reach a colour:
 *
 *   - three comment lines carrying the vertical's own name;
 *   - under bithire only, three ADDITIVE declarations from its font packs —
 *     `--ds-font-pack-humanist-text`, `-grotesk-display`, `-plex-mono`.
 *     Nothing is missing under any vertical.
 *
 * So the assertion is kept and made specific rather than weakened: the
 * custom-property declaration streams must be identical once `--ds-font-pack-*`
 * is removed. A base that diverged in any other declaration would still refuse.
 */
const declarationStream = (css) =>
  (css.match(/^\s*--ds-[a-z0-9-]+\s*:[^;]*;/gm) ?? [])
    .map((d) => d.trim())
    .filter((d) => !d.startsWith('--ds-font-pack-'));

const streams = Object.fromEntries(
  Object.entries(stripped).map(([v, css]) => [v, JSON.stringify(declarationStream(css))]),
);
for (const vertical of ['bithire', 'evnto']) {
  if (streams[vertical] !== streams.platform) {
    throw new Error(
      `blast-radius: ${vertical}'s tenant-free base declares a different custom-property stream ` +
        'than platform\'s, beyond the known font-pack additions. A single "tenant-less" baseline ' +
        'is not well defined; refusing to publish.',
    );
  }
}
const tenantless = stripped.platform;

const { browser, close, provenance: browserProvenance } = await launchBrowser();
const cells = {};
try {
  for (const theme of ['light', 'dark']) {
    cells[`tenantless/${theme}`] = await readRoot(tenantless, 'platform', theme, names);
    for (const vertical of ['platform', 'bithire', 'evnto']) {
      cells[`${vertical}/${theme}`] = await readRoot(bundles[vertical], vertical, theme, names);
    }
  }
} finally {
  await close();
}

writeFileSync(
  outPath,
  `${JSON.stringify(
    {
      instrument: 'wo-cra-23-blast-radius',
      question:
        'Which verticals silently inherit the tenant-free dark ground in LIGHT, and would ' +
        'therefore have their paint moved by repairing it?',
      provenance: {
        browser: browserProvenance,
        bundleMode: 'fresh',
        shas: { ...shas, tenantless: sha256(tenantless) },
        tenantFreeBaseSharedByAllThree: "declaration streams identical once --ds-font-pack-* is removed; bithire adds 3 font-pack names and nothing is missing anywhere",
      },
      names,
      cells,
    },
    sortedReplacer,
    2,
  )}\n`,
);
console.log(
  `blast-radius | names=${names.length} | cells=${Object.keys(cells).length}\n` +
    Object.entries({ ...shas, tenantless: sha256(tenantless) })
      .map(([k, v]) => `  ${k.padEnd(11)}= ${v.slice(0, 12)}`)
      .join('\n') +
    `\n  tenant-free base identical across all three verticals: yes\n  out: ${outPath}`,
);

async function readRoot(css, vertical, theme, propertyNames) {
  const attributes = rootAttributes({ vertical, theme, engine: 'modern', arm: 'both' });
  const classNames = rootClassNames({ theme }).join(' ');
  const html = [
    '<!doctype html>',
    `<html ${rootAttributesToHtml(attributes)} class="${classNames}">`,
    '<head><meta charset="utf-8"><title>blast-radius</title>',
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
      throw new Error(`blast-radius: bundle did not apply for ${vertical}/${theme}; refusing to publish.`);
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
