/**
 * The census, re-derived at RUNTIME.
 *
 * An earlier static census split 3,303 names into three buckets by asking
 * whether a name was absent from the vertical's unconditional block. That is
 * not the question that matters, and it was measured wrong twice: evnto's
 * partial bucket was 43% false-positive, rottay's 61%.
 *
 * The question that matters is a runtime one: does this vertical resolve to the
 * value it would resolve to with NO tenant artifact at all? A name is SILENT for
 * a vertical only when its resolved value equals the tenant-less value in BOTH
 * themes. From that, the three buckets fall out directly.
 *
 * Eight cells, one process, one read of the tree, full `--ds-*` corpus. The
 * tenant-less arm is each vertical's own bundle with its artifact spliced out,
 * so nothing but the artifact differs.
 *
 * This produces the corrected DENOMINATOR. It deliberately does NOT adjudicate
 * which silent channels deserve an opinion — that needs judgment and a fresh
 * lane, and conflating the two is how the original census went wrong.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const S = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/9de519b9-cdd9-4637-b562-0d6a74d41c3a/scratchpad/CRA23R';
const P = (p) => resolve(CORE, 'src/tooling/resolution-probe', p);

const { resolveBundle, sha256 } = await import(P('runtime/bundle/index.mjs'));
const { launchBrowser } = await import(P('runtime/browser/index.mjs'));
const { rootAttributes, rootAttributesToHtml, rootClassNames } = await import(P('foundation/scope/index.mjs'));
const { renderArtifact, committedArtifact, SLUG } = await import(`${S}/render-artifact.mjs`);

const ORIGIN = 'http://resolution-probe.invalid';
const PAGE_URL = `${ORIGIN}/probe.html`;
const CSS_URL = `${ORIGIN}/bundle.css`;
const CANARIES = ['--ds-radius-md', '--ds-font-size-sm'];
const VERTICALS = ['platform', 'bithire', 'evnto'];

const bundles = {};
let tenantless = null;
for (const vertical of VERTICALS) {
  const slug = SLUG[vertical];
  const base = await resolveBundle({ vertical, mode: 'fresh' });
  const committed = committedArtifact(slug);
  if (base.css.split(committed).length - 1 !== 1) throw new Error(`census: ${slug} artifact not unique.`);
  const { css: rendered } = await renderArtifact(slug);
  bundles[vertical] = base.css.replace(committed, rendered);
  if (vertical === 'platform') tenantless = base.css.replace(committed, '/* tenant artifact withheld */');
}

const names = [
  ...new Set(
    [...Object.values(bundles), tenantless].flatMap((t) => t.match(/--ds-[a-z0-9-]+(?=\s*:)/g) ?? []),
  ),
].sort();

const { browser, close, provenance } = await launchBrowser();
const cells = {};
try {
  for (const theme of ['light', 'dark']) {
    cells[`tenantless/${theme}`] = await readRoot(tenantless, 'platform', theme, names);
    for (const vertical of VERTICALS) {
      cells[`${vertical}/${theme}`] = await readRoot(bundles[vertical], vertical, theme, names);
    }
  }
} finally {
  await close();
}

const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim().replace(/#[0-9a-fA-F]{3,8}\b/g, (m) => m.toLowerCase());
const silent = (name, vertical) =>
  ['light', 'dark'].every((t) => norm(cells[`${vertical}/${t}`][name]) === norm(cells[`tenantless/${t}`][name]));

const rows = names.map((name) => {
  const speaks = VERTICALS.filter((v) => !silent(name, v));
  return { name, speaks, count: speaks.length };
});
const buckets = {
  tenantOverridden: rows.filter((r) => r.count === 3),
  partial: rows.filter((r) => r.count === 1 || r.count === 2),
  fullyTenantFree: rows.filter((r) => r.count === 0),
};
const missesBy = Object.fromEntries(
  VERTICALS.map((v) => [v, buckets.partial.filter((r) => !r.speaks.includes(v)).length]),
);

console.log(`corpus (runtime, full --ds-* set): ${names.length}\n`);
console.log(`  tenant-overridden — all three speak : ${buckets.tenantOverridden.length}`);
console.log(`  partial           — some speak      : ${buckets.partial.length}`);
console.log(`  fully tenant-free — none speak      : ${buckets.fullyTenantFree.length}`);
console.log(`\n  of the partial bucket, misses:`);
for (const [v, n] of Object.entries(missesBy)) console.log(`     ${v.padEnd(9)} ${n}`);
console.log(`\n  channels each vertical speaks on (contract density, measured):`);
for (const v of VERTICALS) console.log(`     ${v.padEnd(9)} ${rows.filter((r) => r.speaks.includes(v)).length}`);

writeFileSync(
  `${S}/census-runtime.json`,
  `${JSON.stringify(
    {
      instrument: 'wo-cra-23-runtime-census',
      question: 'Per vertical: does this channel resolve to its tenant-less value in BOTH themes? If so the vertical is silent on it.',
      caveat: 'This is the DENOMINATOR only. It does not adjudicate which silent channels deserve an opinion.',
      provenance: { browser: provenance, bundleMode: 'fresh', shas: Object.fromEntries([...VERTICALS.map((v) => [v, sha256(bundles[v])]), ['tenantless', sha256(tenantless)]]) },
      totals: {
        corpus: names.length,
        tenantOverridden: buckets.tenantOverridden.length,
        partial: buckets.partial.length,
        fullyTenantFree: buckets.fullyTenantFree.length,
        partialMissesBy: missesBy,
        speaksOn: Object.fromEntries(VERTICALS.map((v) => [v, rows.filter((r) => r.speaks.includes(v)).length])),
      },
      rows,
    },
    null,
    1,
  )}\n`,
);
console.log(`\n  out: ${S}/census-runtime.json`);

async function readRoot(css, vertical, theme, propertyNames) {
  const attributes = rootAttributes({ vertical, theme, engine: 'modern', arm: 'both' });
  const classNames = rootClassNames({ theme }).join(' ');
  const html = [
    '<!doctype html>',
    `<html ${rootAttributesToHtml(attributes)} class="${classNames}">`,
    '<head><meta charset="utf-8"><title>census</title>',
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
      if (url === CSS_URL) return route.fulfill({ contentType: 'text/css; charset=utf-8', body: css });
      return route.abort();
    });
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const canary = await page.evaluate((props) => {
      const computed = getComputedStyle(document.documentElement);
      return { sheets: document.styleSheets.length, values: props.map((p) => computed.getPropertyValue(p).trim()) };
    }, CANARIES);
    if (canary.sheets === 0 || canary.values.some((x) => x === '')) {
      throw new Error(`census: bundle did not apply for ${vertical}/${theme}; refusing to publish.`);
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
