/**
 * NEGATIVE DRILLS for the application customization contract gate.
 *
 * A gate that has never been seen to fail is a decoration. C3 required "negative
 * drills for unknown hooks and root-equivalent selectors" precisely because the
 * gate it criticized went green by construction. Each drill below builds a
 * hermetic fixture, asserts the expected verdict, AND asserts that the other
 * checks stayed quiet — a drill that goes red for the wrong reason proves
 * nothing about the check it claims to exercise.
 *
 * The last group drills the ANCHOR: if the derivation source moves or empties,
 * the manifest must fail loudly rather than degrade into a short allowlist.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import postcssModule from 'postcss';

import {
  checkManifestFreshness,
  CLASSIFICATIONS,
  compareUnadjudicatedReadBaseline,
  compareToBaseline,
  CORE_ROOT,
  DEFAULT_APP_ROOT,
  DEFAULT_MANIFEST_PATH,
  emptyBaseline,
  formatReport,
  runGate,
  serializeBaseline,
} from './app-ds-hook-contract-gate.mjs';
import {
  ANCHORS,
  componentSourceReads,
  deriveHookManifest,
  deriveInterpolatedEmissions,
  isRootEquivalentSelector,
  PROMOTIONS,
  resolveNestedSelectors,
  serializeHookManifest,
  splitSelectorList,
} from './lib/ds-hook-manifest.mjs';

const postcss = postcssModule.default ?? postcssModule;

const CHROME_ANCHOR = ANCHORS.tenantChannel.path;
const BRAND_THEME_EMITTER_ANCHOR = ANCHORS.brandThemeEmitter.path;
const APPEARANCE_EMITTER_ANCHOR = ANCHORS.appearanceEmitter.path;
const THEME_CONTRACTS_ANCHOR = ANCHORS.themeContracts.path;
const STYLE_ANCHOR = ANCHORS.styleRoots.path;
const COMPONENT_ANCHOR = ANCHORS.componentReads.path;

function tempDirectory(prefix) {
  const directory = mkdtempSync(join(tmpdir(), `${prefix}-`));
  test.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function write(root, relativePath, contents) {
  const full = join(root, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, 'utf8');
  return full;
}

/**
 * A synthetic manifest. The gate drills must exercise CLASSIFICATION, not the
 * derivation — injecting the manifest keeps them independent of the real DS
 * tree so a DS refactor cannot silently turn a drill green.
 */
function manifestFixture() {
  return {
    hookSet: new Set(['--ds-tabs-list-bg', '--ds-panel-inline-gap']),
    unadjudicatedReadSet: new Set(['--ds-unowned-legacy']),
    componentTokenSet: new Set(['--ds-internal-component-channel']),
    tenantChannel: new Set(['--ds-signal-card-soft']),
    foundationTokens: new Set(['--ds-card-bg', '--ds-color-primary']),
    yields: {},
  };
}

/** Run the gate over a single stylesheet against an empty baseline. */
function gateOn(css, { baseline = emptyBaseline(), manifest = manifestFixture() } = {}) {
  const root = tempDirectory('ds-hook-gate');
  write(root, 'src/feature.css', css);
  return runGate({ appRoot: root, manifest, baseline, postcss });
}

/** Assert exactly one classification fired, so a drill cannot pass by accident. */
function assertOnly(result, kind, count) {
  assert.equal(result.byKind[kind], count, `expected ${count} ${kind}`);
  for (const other of Object.values(CLASSIFICATIONS)) {
    if (other === kind) continue;
    assert.equal(result.byKind[other], 0, `${other} should not have fired`);
  }
}

// ---------------------------------------------------------------------------
// RED: unknown hook
// ---------------------------------------------------------------------------

test('RED: a scoped write to a property that is not a public hook fails', () => {
  const result = gateOn(`.rt-feature-card { --ds-mystery-accent: #123456; }`);
  assertOnly(result, CLASSIFICATIONS.unknownHook, 1);
  assert.equal(result.ok, false);
  assert.equal(result.growth.length, 1);
  assert.equal(result.growth[0].property, '--ds-mystery-accent');
  assert.equal(result.byReason.undeclared, 1);
});

test('RED: an unadjudicated DS read is debt, not an implicit application hook', () => {
  const result = gateOn(
    `.rt-feature-card { --ds-unowned-legacy: var(--ds-color-text-primary); }`,
  );
  assertOnly(result, CLASSIFICATIONS.unknownHook, 1);
  assert.equal(result.ok, false);
  assert.equal(result.byReason['unadjudicated-read'], 1);
});

test('RED: a DS-owned component token is not an application hook', () => {
  const result = gateOn(
    `.rt-feature-card { --ds-internal-component-channel: var(--rt-feature-ink); }`,
  );
  assertOnly(result, CLASSIFICATIONS.unknownHook, 1);
  assert.equal(result.ok, false);
  assert.equal(result.byReason['component-token'], 1);
});

test('RED: a DS foundation token is not assignable even under a feature scope', () => {
  const result = gateOn(`.rt-panel { --ds-card-bg: #fff; }`);
  assertOnly(result, CLASSIFICATIONS.unknownHook, 1);
  assert.equal(result.byReason['foundation-token'], 1);
  assert.equal(result.ok, false);
});

test('RED: a tenant-channel property is not assignable — it would override the tenant brand', () => {
  const result = gateOn(`.rt-signal { --ds-signal-card-soft: #eee; }`);
  assertOnly(result, CLASSIFICATIONS.unknownHook, 1);
  assert.equal(result.byReason['tenant-channel'], 1);
  assert.equal(result.ok, false);
});

// ---------------------------------------------------------------------------
// RED: root-equivalent selectors (C3 point 4 — "other than bare :root")
// ---------------------------------------------------------------------------

test('RED: html[data-tenant] is root-equivalent even though it is not bare :root', () => {
  const result = gateOn(`html[data-tenant='bithire'] { --ds-card-bg: #101418; }`);
  assertOnly(result, CLASSIFICATIONS.rootEquivalent, 1);
  assert.equal(result.ok, false);
});

test('RED: a bare root-state attribute is root-equivalent', () => {
  const result = gateOn(`[data-vertical='bithire'] { --ds-tabs-list-bg: #222; }`);
  // The property IS a public hook; the SCOPE is what fails. Root authorship
  // outranks hook legality, otherwise a public hook would license root writes.
  assertOnly(result, CLASSIFICATIONS.rootEquivalent, 1);
  assert.equal(result.ok, false);
});

test('RED: a universal subject under tenant scope repaints globally', () => {
  const result = gateOn(`[data-tenant='bithire'] * { --ds-tabs-list-bg: #333; }`);
  assertOnly(result, CLASSIFICATIONS.rootEquivalent, 1);
  assert.equal(result.ok, false);
});

test('RED: nesting cannot hide a root write behind an & fragment', () => {
  const result = gateOn(`html { &[data-tenant='bithire'] { --ds-tabs-list-bg: #444; } }`);
  assertOnly(result, CLASSIFICATIONS.rootEquivalent, 1);
});

test('RED: :is(html, :root) is root-equivalent', () => {
  const result = gateOn(`:is(html, :root) { --ds-tabs-list-bg: #555; }`);
  assertOnly(result, CLASSIFICATIONS.rootEquivalent, 1);
});

test('RED: a stylesheet-level declaration outside any rule is treated as root', () => {
  const result = gateOn(`--ds-tabs-list-bg: #666;`);
  assertOnly(result, CLASSIFICATIONS.rootEquivalent, 1);
});

// ---------------------------------------------------------------------------
// GREEN: the supported path
// ---------------------------------------------------------------------------

test('GREEN: a public hook under a feature scope is the supported customization path', () => {
  const result = gateOn(`.rt-detail-tabs { --ds-tabs-list-bg: var(--rt-surface-2); }`);
  assertOnly(result, CLASSIFICATIONS.publicHook, 1);
  assert.equal(result.ok, true);
  assert.equal(result.growth.length, 0);
});

test('GREEN: a public hook under a descendant of tenant scope is feature-local', () => {
  const result = gateOn(
    `[data-tenant='bithire'] .rt-detail-tabs { --ds-tabs-list-bg: var(--ds-surface-panel-bg); }`,
  );
  assertOnly(result, CLASSIFICATIONS.publicHook, 1);
  assert.equal(result.ok, true);
});

test('GREEN: :root[data-ds-root] :where(.rt-x) declares onto the feature, not the root', () => {
  const result = gateOn(`:root[data-ds-root] :where(.rt-detail-actions) { --ds-panel-inline-gap: 8px; }`);
  assertOnly(result, CLASSIFICATIONS.publicHook, 1);
  assert.equal(result.ok, true);
});

test('GREEN: --rt-* is the app namespace and is legal anywhere, including the root', () => {
  const result = gateOn(`
    :root { --rt-surface-1: #0b0d10; }
    html[data-tenant='bithire'] { --rt-accent: #22d3ee; }
    .rt-card { --rt-pad: 12px; }
  `);
  assert.equal(result.declarations, 0, 'no --ds-* findings');
  assert.equal(result.appNamespaceDeclarations, 3);
  assert.equal(result.ok, true);
});

test('GREEN: a media query does not change the subject of the selector', () => {
  const result = gateOn(`@media (min-width: 40rem) { .rt-grid { --ds-panel-inline-gap: 4px; } }`);
  assertOnly(result, CLASSIFICATIONS.publicHook, 1);
  assert.equal(result.ok, true);
});

// ---------------------------------------------------------------------------
// Wording law + baseline mechanics
// ---------------------------------------------------------------------------

test('a green report says "no growth", never "legitimate"', () => {
  const result = gateOn(`.rt-detail-tabs { --ds-tabs-list-bg: var(--ds-surface-card-bg); }`);
  const report = formatReport(result);
  assert.match(report, /no growth \(\d+ grandfathered/);
  assert.doesNotMatch(report, /legitimate/i);
});

test('grandfathered findings pass; one more of the same finding fails', () => {
  const css = `.rt-a { --ds-card-bg: #111; }`;
  const seeded = gateOn(css);
  const baseline = JSON.parse(serializeBaseline(seeded.observed));

  const stillOk = gateOn(css, { baseline });
  assert.equal(stillOk.ok, true, 'the seeded finding is fenced, not failed');

  const grown = gateOn(`.rt-a { --ds-card-bg: #111; } .rt-b { --ds-card-bg: #222; }`, { baseline });
  assert.equal(grown.ok, false, 'a second instance is growth');
  assert.equal(grown.growth[0].allowed, 1);
  assert.equal(grown.growth[0].count, 2);
});

test('the baseline is keyed per file, so the same property in a new file is growth', () => {
  const baseline = {
    schemaVersion: 1,
    grandfathered: { 'other.css': { '--ds-card-bg': { [CLASSIFICATIONS.unknownHook]: 5 } } },
  };
  const result = gateOn(`.rt-a { --ds-card-bg: #111; }`, { baseline });
  assert.equal(result.ok, false, 'a grandfathered row in another file must not license this one');
});

test('a worse classification of the same property in the same file is growth', () => {
  const baseline = {
    schemaVersion: 1,
    grandfathered: { 'feature.css': { '--ds-card-bg': { [CLASSIFICATIONS.unknownHook]: 1 } } },
  };
  const result = gateOn(`html { --ds-card-bg: #111; }`, { baseline });
  assert.equal(result.ok, false, 'UNKNOWN_HOOK budget must not fund a ROOT_EQUIVALENT write');
});

test('a decrease passes and is reported, never failed', () => {
  const baseline = {
    schemaVersion: 1,
    grandfathered: { 'feature.css': { '--ds-card-bg': { [CLASSIFICATIONS.unknownHook]: 9 } } },
  };
  const result = gateOn(`.rt-a { --ds-card-bg: #111; }`, { baseline });
  assert.equal(result.ok, true);
  assert.equal(result.grandfatheredTotal, 9);
  assert.equal(result.observedTotal, 1);
});

test('compareToBaseline reports every growth row, not just the first', () => {
  const observed = {
    'a.css': { '--ds-x': { [CLASSIFICATIONS.unknownHook]: 2 } },
    'b.css': { '--ds-y': { [CLASSIFICATIONS.rootEquivalent]: 1 } },
  };
  const { growth } = compareToBaseline(observed, emptyBaseline());
  assert.equal(growth.length, 2);
});

test('a missing corpus is a hard failure, never an empty pass', () => {
  assert.throws(
    () => runGate({
      appRoot: join(tmpdir(), 'ds-hook-gate-absent-corpus'),
      manifest: manifestFixture(),
      baseline: emptyBaseline(),
      postcss,
    }),
    /corpus MISSING/,
  );
});

// ---------------------------------------------------------------------------
// Selector analysis units
// ---------------------------------------------------------------------------

test('selector lists split on top-level commas only', () => {
  assert.deepEqual(splitSelectorList(`:is(html, :root), [data-x="a,b"] .c`), [
    ':is(html, :root)',
    '[data-x="a,b"] .c',
  ]);
});

test('root-equivalence is decided by the subject compound', () => {
  for (const selector of [':root', 'html', 'body', '*', 'html[data-tenant="x"]', '[data-ds-root]', '.a [data-vertical]']) {
    assert.equal(isRootEquivalentSelector(selector), true, `${selector} should be root-equivalent`);
  }
  for (const selector of ['[data-tenant="x"] .card', 'html .rt-panel', '.rt-card', ':root [data-part="header"]']) {
    assert.equal(isRootEquivalentSelector(selector), false, `${selector} should be feature scope`);
  }
});

test('nested selectors resolve against every parent branch', () => {
  assert.deepEqual(resolveNestedSelectors(['html', ':root'], '&[data-theme="dark"]'), [
    'html[data-theme="dark"]',
    ':root[data-theme="dark"]',
  ]);
  assert.deepEqual(resolveNestedSelectors(['.a'], '.b'), ['.a .b']);
});

// ---------------------------------------------------------------------------
// ANCHOR DRILLS — derivation must fail loudly, never shrink silently
// ---------------------------------------------------------------------------

/**
 * A fixture DS tree big enough to clear every anchor minimum, so the drills can
 * distinguish "anchor healthy" from "anchor drifted" rather than always
 * throwing.
 */
function coreFixture() {
  const root = tempDirectory('ds-hook-anchor');

  const emissions = [];
  for (let index = 0; index < 260; index += 1) {
    emissions.push(`  if (a.v${index}) vars["--ds-chrome-${index}"] = a.v${index};`);
  }
  // The real emitter writes literal keys AND whole families built by
  // interpolation. A fixture with only literals would not stand in for it: the
  // interpolated-family floor would fire, and the anchor drills would be
  // measuring that floor instead of the ownership rule they exist to test.
  const families = [];
  for (let index = 0; index < 35; index += 1) {
    families.push(
      `function setFamily${index}Vars(vars, part, value) {\n` +
        `  if (value) vars[\`--ds-family${index}-\${part}-bg\`] = value;\n` +
        `}\n` +
        `setFamily${index}Vars(vars, "primary", a.p);\n` +
        `setFamily${index}Vars(vars, "secondary", a.s);`,
    );
  }
  write(
    root,
    CHROME_ANCHOR,
    `export function chromeVariables(a) {\n  const vars = {};\n${emissions.join('\n')}\n  return vars;\n}\n` +
      `${families.join('\n')}\n`,
  );
  write(
    root,
    `${THEME_CONTRACTS_ANCHOR}/index.ts`,
    `export interface BrandTheme { palette?: { primary?: string } }\n` +
      `export interface TenantAppearance { primaryColor?: string }\n`,
  );
  write(
    root,
    BRAND_THEME_EMITTER_ANCHOR,
    `export function compileBrandTheme(vars, theme) {\n` +
      `  vars["--ds-brand-generated"] = theme.palette?.primary;\n` +
      `}\n`,
  );
  write(
    root,
    APPEARANCE_EMITTER_ANCHOR,
    `export function compileAppearance(vars, appearance) {\n` +
      `  vars["--ds-db-generated"] = appearance.primaryColor;\n` +
      `}\n`,
  );

  for (let index = 0; index < 120; index += 1) {
    write(
      root,
      `${STYLE_ANCHOR}/sheet-${index}.css`,
      `:root { --ds-foundation-${index}: 1px; }\n` +
        `.ds-widget-${index} { gap: var(--ds-hook-${index}, var(--ds-foundation-${index})); }\n` +
        `.ds-widget-${index} { color: var(--ds-chrome-${index}, currentColor); }\n`,
    );
  }
  for (let index = 0; index < 120; index += 1) {
    write(
      root,
      `${COMPONENT_ANCHOR}/component-${index}/index.tsx`,
      `export const s${index} = { background: 'var(--ds-uihook-${index}, transparent)' };\n`,
    );
  }
  return root;
}

test('the manifest derives tenant, foundation, internal, explicit-hook and unadjudicated classes', () => {
  const root = coreFixture();
  const manifest = deriveHookManifest({ coreRoot: root, postcss, promotions: [] });

  assert.equal(manifest.tenantChannel.has('--ds-chrome-7'), true);
  assert.equal(manifest.tenantChannel.has('--ds-brand-generated'), true);
  assert.equal(manifest.tenantChannel.has('--ds-db-generated'), true);
  assert.equal(manifest.foundationTokens.has('--ds-foundation-7'), true);
  assert.equal(manifest.hookSet.has('--ds-hook-7'), false, 'an unowned read is not public API');
  assert.equal(manifest.hookSet.has('--ds-uihook-7'), false, 'component reads are not implicit API');
  assert.equal(
    manifest.unadjudicatedReadSet.has('--ds-hook-7'),
    true,
    'a CSS read with no owner is fenced for adjudication',
  );
  assert.equal(
    manifest.unadjudicatedReadSet.has('--ds-uihook-7'),
    true,
    'a component-source read with no owner is fenced for adjudication',
  );

  // Ownership outranks consumption: a property the DS reads AND owns is not a hook.
  assert.equal(manifest.hookSet.has('--ds-chrome-7'), false, 'tenant-owned must not be a hook');
  assert.equal(
    manifest.hookSet.has('--ds-brand-generated'),
    false,
    'static BrandTheme output must not be a hook',
  );
  assert.equal(
    manifest.hookSet.has('--ds-db-generated'),
    false,
    'DB appearance output must not be a hook',
  );
  assert.equal(manifest.hookSet.has('--ds-foundation-7'), false, 'root-declared must not be a hook');
});

test('scoped CSS and component-source suppliers stay internal unless explicitly promoted', () => {
  const root = coreFixture();
  write(
    root,
    `${STYLE_ANCHOR}/internal-slots.css`,
    `.ds-internal { --ds-internal-css-slot: 1px; gap: var(--ds-internal-css-slot); }\n` +
      `.ds-runtime-reader { inline-size: var(--ds-internal-ts-slot); }\n`,
  );
  write(
    root,
    `${COMPONENT_ANCHOR}/internal-slots/index.tsx`,
    `export const variables = { '--ds-internal-ts-slot': '20rem' };\n`,
  );
  const manifest = deriveHookManifest({ coreRoot: root, postcss, promotions: [] });

  assert.equal(manifest.componentTokenSet.has('--ds-internal-css-slot'), true);
  assert.equal(manifest.componentTokenSet.has('--ds-internal-ts-slot'), true);
  assert.equal(manifest.unadjudicatedReadSet.has('--ds-internal-css-slot'), false);
  assert.equal(manifest.unadjudicatedReadSet.has('--ds-internal-ts-slot'), false);
  assert.equal(manifest.hookSet.has('--ds-internal-css-slot'), false);
  assert.equal(manifest.hookSet.has('--ds-internal-ts-slot'), false);
});

test('CSS comments and quoted prose cannot fabricate public hooks', () => {
  const root = coreFixture();
  write(
    root,
    `${STYLE_ANCHOR}/comment-prose.css`,
    `/* var(--ds-comment-only) */\n.example::before { content: "var(--ds-quoted-only)"; }\n`,
  );
  const manifest = deriveHookManifest({ coreRoot: root, postcss, promotions: [] });
  assert.equal(manifest.hookSet.has('--ds-comment-only'), false);
  assert.equal(manifest.hookSet.has('--ds-quoted-only'), false);
  assert.equal(manifest.unadjudicatedReadSet.has('--ds-comment-only'), false);
  assert.equal(manifest.unadjudicatedReadSet.has('--ds-quoted-only'), false);
});

test('private --_ds-* implementation properties never enter the public or debt manifests', () => {
  const root = coreFixture();
  write(
    root,
    `${STYLE_ANCHOR}/private-implementation.css`,
    `.surface {\n` +
      `  color: var(--_ds-private-icon-ink, currentColor);\n` +
      `  background: var(--_ds-personality-resolved-card-bg, transparent);\n` +
      `}\n`,
  );
  write(
    root,
    `${COMPONENT_ANCHOR}/private-implementation/index.tsx`,
    `export const style = { width: 'var(--_ds-instance-sidebar-width, 18rem)' };\n`,
  );
  const manifest = deriveHookManifest({ coreRoot: root, postcss, promotions: [] });
  assert.equal(manifest.hookSet.has('--_ds-private-icon-ink'), false);
  assert.equal(manifest.unadjudicatedReadSet.has('--_ds-private-icon-ink'), false);
  assert.equal(manifest.hookSet.has('--_ds-instance-sidebar-width'), false);
  assert.equal(manifest.unadjudicatedReadSet.has('--_ds-instance-sidebar-width'), false);
  assert.equal(manifest.hookSet.has('--_ds-personality-resolved-card-bg'), false);
  assert.equal(
    manifest.unadjudicatedReadSet.has('--_ds-personality-resolved-card-bg'),
    false,
  );
});

test('ANCHOR DRIFT: a missing derivation source fails loudly and names the anchor', () => {
  const root = coreFixture();
  rmSync(join(root, CHROME_ANCHOR), { force: true });
  assert.throws(
    () => deriveHookManifest({ coreRoot: root, postcss, promotions: [] }),
    (error) =>
      /anchor MISSING/.test(error.message) &&
      /tenant-channel/.test(error.message) &&
      new RegExp(CHROME_ANCHOR.replace(/[/\\]/g, '.')).test(error.message),
  );
});

test('ANCHOR DRIFT: an emptied anchor fails rather than yielding a short allowlist', () => {
  const root = coreFixture();
  write(root, CHROME_ANCHOR, 'export function chromeVariables() { return {}; }\n');
  assert.throws(() => deriveHookManifest({ coreRoot: root, postcss, promotions: [] }), /ANCHOR DRIFT/);
});

test('ANCHOR DRIFT: a relocated style root fails loudly', () => {
  const root = coreFixture();
  rmSync(join(root, STYLE_ANCHOR), { recursive: true, force: true });
  assert.throws(() => deriveHookManifest({ coreRoot: root, postcss, promotions: [] }), /anchor MISSING/);
});

test('generated vertical artifacts cannot promote an app property into DS ownership', () => {
  const root = coreFixture();
  // The build product that concatenates the vertical's own extension.css. If it
  // counted, an app could legalize any name by rebuilding the artifact.
  write(
    root,
    `${STYLE_ANCHOR}/facade/artifacts/bithire/index.css`,
    `:root { --ds-app-invented-accent: #f0f; }\n.x { color: var(--ds-app-invented-accent); }\n`,
  );
  const manifest = deriveHookManifest({ coreRoot: root, postcss, promotions: [] });
  assert.equal(manifest.foundationTokens.has('--ds-app-invented-accent'), false);
  assert.equal(manifest.hookSet.has('--ds-app-invented-accent'), false);
  assert.equal(manifest.unadjudicatedReadSet.has('--ds-app-invented-accent'), false);
});

test('test and fixture directories cannot confer DS ownership either', () => {
  const root = coreFixture();
  write(root, `${STYLE_ANCHOR}/tests/scratch.css`, `:root { --ds-test-only: 1px; }\n`);
  const manifest = deriveHookManifest({ coreRoot: root, postcss, promotions: [] });
  assert.equal(manifest.foundationTokens.has('--ds-test-only'), false);
});

// ---------------------------------------------------------------------------
// The VALUE constraint on a public hook (audit 2026-07-26, Codex C3 point 3)
//
// Owning the scope question is not enough. A hook exists so an application can
// re-express the tenant's own tokens for one surface; assigning it a raw colour
// pins brand paint the tenant can never re-theme, and the customization path
// becomes the thing that defeats customization.
// ---------------------------------------------------------------------------

test('RED: a public hook assigned a raw colour literal is a contract violation', () => {
  const result = gateOn(`.rt-detail-tabs { --ds-tabs-list-bg: #0b0d10; }`);
  assertOnly(result, CLASSIFICATIONS.hookValueLiteral, 1);
  assert.equal(result.ok, false);
  assert.equal(result.byReason['hook-value-literal'], 1);
});

test('RED: rgb()/hsl()/oklch() are literals too, wherever they sit in the value', () => {
  for (const value of [
    'rgb(11 13 16)',
    'hsl(210 20% 8%)',
    'oklch(0.2 0.02 250)',
    'color-mix(in srgb, #ff0000 10%, var(--ds-surface-card-bg))',
  ]) {
    const result = gateOn(`.rt-detail-tabs { --ds-tabs-list-bg: ${value}; }`);
    assertOnly(result, CLASSIFICATIONS.hookValueLiteral, 1);
  }
});

test('GREEN: a tenant-derived chain on the same hook is the supported assignment', () => {
  const result = gateOn(
    `.rt-detail-tabs { --ds-tabs-list-bg: color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card-bg)); }`,
  );
  assertOnly(result, CLASSIFICATIONS.publicHook, 1);
  assert.equal(result.ok, true);
});

test('GREEN: geometry literals are structure, not brand, and stay legal', () => {
  const result = gateOn(`.rt-grid { --ds-panel-inline-gap: 12px; }`);
  assertOnly(result, CLASSIFICATIONS.publicHook, 1);
  assert.equal(result.ok, true);
});

test('the value constraint never rescues a property that is not a hook', () => {
  // A tenant-derived value on a DS-owned property is still a DS-owned property.
  const result = gateOn(`.rt-panel { --ds-card-bg: var(--ds-surface-card-bg); }`);
  assertOnly(result, CLASSIFICATIONS.unknownHook, 1);
});

// ---------------------------------------------------------------------------
// Interpolated emission families
//
// The chrome emitter builds whole variable families by interpolation. A literal
// key scan cannot see them, which under-reports the tenant channel — the
// dangerous direction, because a tenant-owned name then reads as an open hook.
// ---------------------------------------------------------------------------

test('interpolated `vars[`--ds-x-${p}-y`]` families expand into the tenant channel', () => {
  const source = `
    function setButtonVariantVars(vars, prefix, btn) {
      if (btn.bg) vars[\`--ds-button-\${prefix}-bg\`] = btn.bg;
      if (btn.border) vars[\`--ds-button-\${prefix}-border\`] = btn.border;
    }
    setButtonVariantVars(vars, "primary", c.buttonPrimary);
    setButtonVariantVars(vars, "secondary", c.buttonSecondary);
  `;
  const { names, families } = deriveInterpolatedEmissions(source);
  assert.equal(families.length, 2);
  for (const name of [
    '--ds-button-primary-bg',
    '--ds-button-secondary-bg',
    '--ds-button-primary-border',
    '--ds-button-secondary-border',
  ]) {
    assert.ok(names.has(name), `${name} should be recognised as tenant-emitted`);
  }
  assert.equal(names.size, 4, 'no name is invented beyond the observed arguments');
});

test('a literal-union parameter type enumerates its own values', () => {
  const source = `
    function setControlSizeVars(vars, family: "button" | "input", size: "sm" | "md", value) {
      const prefix = \`--ds-\${family}-\${size}\`;
      if (value.paddingX) vars[\`\${prefix}-padding-x\`] = value.paddingX;
    }
  `;
  const { names } = deriveInterpolatedEmissions(source);
  assert.deepEqual(
    [...names].sort(),
    [
      '--ds-button-md-padding-x',
      '--ds-button-sm-padding-x',
      '--ds-input-md-padding-x',
      '--ds-input-sm-padding-x',
    ],
    'a local const template resolves through the parameter unions',
  );
});

test('an unresolvable interpolation slot yields nothing rather than a partial name', () => {
  const source = `
    function setMysteryVars(vars, whatever) {
      vars[\`--ds-mystery-\${whatever}-bg\`] = "x";
    }
  `;
  const { names } = deriveInterpolatedEmissions(source);
  assert.equal(names.size, 0, 'a half-expanded name would be a lie about ownership');
});

test('ANCHOR DRIFT: the emitter losing its interpolated families is fatal', () => {
  const root = coreFixture();
  // Literal keys still present and above the plain minimum, but every template
  // family gone: the exact shape a refactor to a lookup table would produce.
  const literals = Array.from(
    { length: 260 },
    (_, index) => `  vars["--ds-literal-${index}"] = source.value;`,
  ).join('\n');
  write(root, CHROME_ANCHOR, `export function emit(vars, source) {\n${literals}\n}\n`);
  assert.throws(
    () => deriveHookManifest({ coreRoot: root, postcss, promotions: [] }),
    /ANCHOR DRIFT[\s\S]*interpolated emission families/,
  );
});

// ---------------------------------------------------------------------------
// Owner-reviewed promotions
// ---------------------------------------------------------------------------

test('every declared promotion names a property the real DS actually reads', () => {
  // deriveHookManifest throws when a promotion points at a name nothing reads,
  // so a clean derivation over the real tree IS the assertion.
  const manifest = deriveHookManifest({ coreRoot: CORE_ROOT, postcss });
  for (const family of PROMOTIONS) {
    for (const property of family.properties) {
      assert.ok(
        manifest.hookSet.has(property),
        `${property} (${family.id}) is declared public but did not survive derivation`,
      );
    }
  }
});

test('a promotion pointing at a name the DS never reads is fatal, not silently dropped', () => {
  const root = coreFixture();
  const stale = { ...PROMOTIONS[0], id: 'stale', properties: ['--ds-nothing-reads-this'] };
  assert.throws(
    () => deriveHookManifest({ coreRoot: root, postcss, promotions: [stale] }),
    /promotions name properties the DS does not read[\s\S]*--ds-nothing-reads-this/,
  );
});

test('RED drill: a new unadjudicated read grows the published decrease-only baseline', () => {
  const root = coreFixture();
  const before = deriveHookManifest({ coreRoot: root, postcss, promotions: [] });
  const published = JSON.parse(serializeHookManifest(before));

  write(
    root,
    `${STYLE_ANCHOR}/new-unowned-read.css`,
    `.new-component { color: var(--ds-new-unowned-read, currentColor); }\n`,
  );
  const after = deriveHookManifest({ coreRoot: root, postcss, promotions: [] });
  const comparison = compareUnadjudicatedReadBaseline(after, published);

  assert.deepEqual(comparison.additions, ['--ds-new-unowned-read']);
  assert.deepEqual(comparison.removals, []);
  assert.equal(after.hookSet.has('--ds-new-unowned-read'), false, 'growth must not become API');

  const publishedPath = join(root, 'hooks-manifest.json');
  writeFileSync(publishedPath, `${JSON.stringify(published, null, 2)}\n`, 'utf8');
  const freshness = checkManifestFreshness({
    manifest: after,
    manifestPath: publishedPath,
    packageJson: packageJsonFixture(),
  });
  assert.ok(
    freshness.problems.some((problem) => problem.code === 'UNADJUDICATED_GROWTH'),
    'the published-contract gate did not bite on a new unowned read',
  );
});

test('schema-3 migration reconstructs the legacy unadjudicated ceiling without widening it', () => {
  const manifest = {
    promotedSet: new Set(['--ds-explicit-slot']),
    unadjudicatedReadSet: new Set(['--ds-old-read']),
  };
  const comparison = compareUnadjudicatedReadBaseline(manifest, {
    schemaVersion: 3,
    publicHooks: ['--ds-explicit-slot', '--ds-old-read'],
  });

  assert.deepEqual(comparison.additions, []);
  assert.deepEqual(comparison.removals, []);
});

test('every declared slot carries all seven contract terms', () => {
  const required = [
    'owner',
    'slot',
    'valueType',
    'fallback',
    'sinceVersion',
    'whiteLabelCompat',
    'subtreeRepaint',
  ];
  const allowedCompat = ['not-tenant-emitted', 'propagates-channel', 'derives-from-palette'];
  for (const family of PROMOTIONS) {
    assert.ok(family.properties.length > 0, `${family.id} promotes nothing`);
    for (const field of required) {
      assert.equal(typeof family[field], 'string', `${family.id} is missing ${field}`);
      assert.ok(family[field].length > 0, `${family.id} has an empty ${field}`);
    }
    assert.ok(
      allowedCompat.includes(family.whiteLabelCompat),
      `${family.id} declares an unknown whiteLabelCompat "${family.whiteLabelCompat}"`,
    );
    assert.ok(family.rationale.length > 40, `${family.id} needs a real rationale`);
  }
});

// ---------------------------------------------------------------------------
// The PUBLISHED contract (Codex C6.6 — "exported, consumed")
// ---------------------------------------------------------------------------

function packageJsonFixture(overrides = {}) {
  return {
    exports: { '.': {}, './hooks-manifest': { default: './hooks-manifest.json' } },
    files: ['dist/**/*.js', 'hooks-manifest.json'],
    ...overrides,
  };
}

test('GREEN: the committed artifact matches a re-derivation and is exported', () => {
  const manifest = deriveHookManifest({ coreRoot: CORE_ROOT, postcss });
  const freshness = checkManifestFreshness({
    manifest,
    manifestPath: DEFAULT_MANIFEST_PATH,
    packageJson: JSON.parse(readFileSync(join(CORE_ROOT, 'package.json'), 'utf8')),
  });
  assert.deepEqual(freshness.problems, [], 'the published contract is stale or unexported');
  assert.equal(freshness.ok, true);
});

test('RED: manifest-stale — a committed artifact that drifts from source fails', () => {
  const root = tempDirectory('ds-hook-manifest');
  const manifest = deriveHookManifest({ coreRoot: CORE_ROOT, postcss });
  const stalePath = join(root, 'hooks-manifest.json');
  const stale = JSON.parse(serializeHookManifest(manifest));
  stale.publicHooks = stale.publicHooks.slice(0, 10);
  writeFileSync(stalePath, `${JSON.stringify(stale, null, 2)}\n`, 'utf8');

  const freshness = checkManifestFreshness({
    manifest,
    manifestPath: stalePath,
    packageJson: packageJsonFixture(),
  });
  assert.equal(freshness.ok, false);
  assert.deepEqual(
    freshness.problems.map((problem) => problem.code),
    ['MANIFEST_STALE'],
  );
});

test('RED: manifest-missing — nothing published at all fails', () => {
  const root = tempDirectory('ds-hook-manifest');
  const manifest = deriveHookManifest({ coreRoot: CORE_ROOT, postcss });
  const freshness = checkManifestFreshness({
    manifest,
    manifestPath: join(root, 'hooks-manifest.json'),
    packageJson: packageJsonFixture(),
  });
  assert.equal(freshness.ok, false);
  assert.ok(freshness.problems.some((problem) => problem.code === 'MANIFEST_MISSING'));
});

test('RED: export-missing — a published artifact with no package export fails', () => {
  const manifest = deriveHookManifest({ coreRoot: CORE_ROOT, postcss });
  const freshness = checkManifestFreshness({
    manifest,
    manifestPath: DEFAULT_MANIFEST_PATH,
    packageJson: packageJsonFixture({ exports: { '.': {} } }),
  });
  assert.equal(freshness.ok, false);
  assert.deepEqual(
    freshness.problems.map((problem) => problem.code),
    ['EXPORT_MISSING'],
  );
});

test('RED: export-unshipped — an export npm would not publish fails', () => {
  // The subtle one: `pnpm --filter` resolves it in-repo and everything looks
  // fine, while an installed consumer gets ERR_PACKAGE_PATH_NOT_EXPORTED.
  const manifest = deriveHookManifest({ coreRoot: CORE_ROOT, postcss });
  const freshness = checkManifestFreshness({
    manifest,
    manifestPath: DEFAULT_MANIFEST_PATH,
    packageJson: packageJsonFixture({ files: ['dist/**/*.js'] }),
  });
  assert.equal(freshness.ok, false);
  assert.deepEqual(
    freshness.problems.map((problem) => problem.code),
    ['EXPORT_UNSHIPPED'],
  );
});

test('an installed consumer resolves the contract through the package exports path', () => {
  // Resolution goes through `@rottay/design-system/hooks-manifest` from the app's
  // own directory — the same lookup a published install performs — not through a
  // relative path into src/ or scripts/. Anything less does not prove C3 point 5.
  const appRoot = DEFAULT_APP_ROOT;
  const require = createRequire(join(appRoot, 'noop.js'));
  const resolved = require.resolve('@rottay/design-system/hooks-manifest');
  assert.equal(resolved, DEFAULT_MANIFEST_PATH, 'resolved somewhere other than the published artifact');

  const contract = JSON.parse(readFileSync(resolved, 'utf8'));
  assert.equal(contract.schemaVersion, 4);
  assert.ok(contract.publicHooks.length > 0, 'the consumed contract exposes no reviewed slots');
  assert.equal(
    contract.publicHooks.length,
    Object.keys(contract.declaredSlots).length,
    'publicHooks must be exactly the explicitly declared slots',
  );
  assert.ok(contract.unadjudicatedReads.length > 0, 'legacy unowned reads lost their debt ledger');
  assert.ok(contract.componentTokens.length > 0, 'closed DS component channels are absent');
  assert.ok(contract.foundationTokens.length > 0);
  assert.ok(contract.tenantChannel.length > 0);
  assert.ok(Object.keys(contract.declaredSlots).length > 0);

  // The three sets must be disjoint, or "may I assign this?" has no answer.
  const hooks = new Set(contract.publicHooks);
  const unadjudicated = new Set(contract.unadjudicatedReads);
  const closed = [
    ...contract.foundationTokens,
    ...contract.tenantChannel,
    ...contract.componentTokens,
  ];
  const closedSet = new Set(closed);
  const declared = new Set(Object.keys(contract.declaredSlots));
  for (const property of closed) {
    if (declared.has(property)) continue; // promoted on purpose, and declared as such
    assert.ok(!hooks.has(property), `${property} is both open and closed in the contract`);
  }
  for (const property of declared) {
    assert.ok(hooks.has(property), `${property} is declared but not listed as assignable`);
  }
  for (const property of unadjudicated) {
    assert.ok(!hooks.has(property), `${property} is both unadjudicated debt and public API`);
    assert.ok(!closedSet.has(property), `${property} is both unadjudicated and DS-owned`);
  }
});

test('the published declaration pins the same schema version as the JSON artifact', () => {
  const contract = JSON.parse(readFileSync(DEFAULT_MANIFEST_PATH, 'utf8'));
  const declarationPath = join(dirname(DEFAULT_MANIFEST_PATH), 'hooks-manifest.d.ts');
  const declaration = readFileSync(declarationPath, 'utf8');
  const match = /readonly\s+schemaVersion:\s*(\d+)\s*;/u.exec(declaration);

  assert.ok(match, 'HookManifest declaration does not pin a numeric schemaVersion');
  assert.equal(
    Number(match[1]),
    contract.schemaVersion,
    'hooks-manifest.d.ts and hooks-manifest.json expose different schema versions',
  );
});

test('the published contract names the sources it was derived from', () => {
  const contract = JSON.parse(readFileSync(DEFAULT_MANIFEST_PATH, 'utf8'));
  assert.ok(contract.generatedFrom.length >= 3, 'anchors are not recorded');
  for (const anchor of contract.generatedFrom) {
    assert.equal(typeof anchor.path, 'string');
    assert.ok(anchor.describes.length > 0, `${anchor.id} has no description`);
  }
  assert.match(contract.generatedBy, /--manifest-write/);
});

test('component hook derivation reads runtime literals, not comments or interpolated name fragments', () => {
  const reads = componentSourceReads(`
    // var(--ds-comment-only)
    const prose = "var(--ds-exact-string)";
    const dynamicName = \`var(--ds-select-trigger-\${size}-height)\`;
    const dynamicFallback = \`var(--ds-exact-template, \${fallback})\`;
    const nestedExpression = \`color-mix(in srgb, \${"var(--ds-nested-expression)"} 20%, transparent)\`;
  `);

  assert.deepEqual([...reads].sort(), [
    '--ds-exact-string',
    '--ds-exact-template',
    '--ds-nested-expression',
  ]);
  assert.equal(reads.has('--ds-comment-only'), false);
  assert.equal(reads.has('--ds-select-trigger-'), false);
});
