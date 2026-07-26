#!/usr/bin/env node
// Modern-bundle third-party framework gate (artifact-side).
//
// WHY THIS EXISTS
// ---------------
// `daisy.classConsumers` counts DaisyUI classes in the RENDER. It reached zero
// while `@plugin "daisyui";` was still active in the Modern entrypoint, so the
// shipped bundles kept carrying 88 `@layer daisyui.*` blocks and ~110 KB of
// framework CSS that nothing on the page could ever match. A render-side
// counter cannot see that: it reads `.tsx`, and the defect was in `.css`.
//
// This gate reads the COMPILED ARTIFACT. It is the only check positioned to
// answer the question a consumer actually cares about -- "what bytes did we
// ship?" -- and it fails the moment a visual framework plugin is reintroduced
// into the Modern pipeline, whether or not any component consumes it.
//
// WHAT IT PROVES
// --------------
// Three independent nets over every shipped bundle:
//
//   1. LAYERS. `@layer daisyui...` must not appear, and every top-level cascade
//      layer must be one the DS owns (`rottay-*`) or one Tailwind itself emits
//      (`theme`, `base`, `components`, `utilities`, `properties`). A plugin
//      cannot emit component CSS without emitting its layer, so this net alone
//      closes the `@plugin` path -- and its allowlist shape means a DIFFERENT
//      framework (bootstrap, bulma, ...) fails for the same reason.
//
//   2. PRIVATE VARIABLES. DaisyUI's own custom-property vocabulary must not be
//      declared. This catches CSS vendored or hand-copied out of the package,
//      which would carry no `daisyui` layer.
//
//   3. THEME LITERALS. The framework theme variables the DS projects
//      (`--color-*`, `--radius-*`, `--size-*`, `--border`, `--depth`, `--noise`)
//      may only ever be declared as `var(--ds-*)` -- the projection in
//      `runtime/engines/modern/framework-token-projection.css` writes exactly
//      that. DaisyUI's plugin ships the same names with LITERAL values
//      (`--color-primary: oklch(45% 0.24 277.023)`) from its own default theme,
//      which is a second, competing authority over first-party tokens. A
//      literal in the artifact means something other than the projection is
//      writing the framework vocabulary.
//
// DELIBERATELY SELF-CONTAINED
// ---------------------------
// This gate does NOT import `daisyui`. Its job is to certify shipped bytes, and
// it must keep working after the npm dependency is eventually dropped -- which
// is precisely when a silent reintroduction would be hardest to notice. The
// vocabulary below was DERIVED from daisyui@5.5.19 (the version pinned by
// `daisy-painted-classes.mjs` and `daisy-projection-contract.test.mjs`) by
// harvesting every custom property declared under the package's `components/`,
// `utilities/` and `base/` trees, then subtracting names that Tailwind or
// first-party DS CSS also declares.
//
// Usage:
//   node scripts/modern-bundle-framework-gate.mjs --check          (default)
//   node scripts/modern-bundle-framework-gate.mjs --check \
//     --package-root <dir> --bundle <file>   (fixture mode, self-test only)

import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRootDefault = resolve(scriptDir, '..');

/** The daisyui release the vocabulary below was derived from. */
export const DERIVED_FROM_DAISY_VERSION = '5.5.19';

/**
 * Committed mirrors. These are in git, so their absence is a real failure.
 * `--check` fails closed when one is missing.
 */
const REQUIRED_BUNDLES = [
  'styles/modern.css',
  'styles/platform.css',
  'styles/rottay.css',
  'styles/bithire.css',
  'styles/evnto.css',
  'styles/index.css',
];

/**
 * Publish targets. `dist/` is gitignored and rebuilt out of band, so the gate
 * checks each file when it exists rather than demanding a build; the committed
 * mirrors above are written from the same in-memory bundle and are always
 * verifiable. `dist-freshness-gate.mjs` owns the "is dist current" question.
 */
const OPTIONAL_BUNDLES = [
  'dist/modern-engine.css',
  'dist/platform.css',
  'dist/bithire.css',
  'dist/evnto.css',
  'dist/styles.css',
];

/** Cascade layers the DS and Tailwind legitimately emit. */
const FIRST_PARTY_LAYER_PREFIX = 'rottay-';
const TAILWIND_LAYERS = new Set(['theme', 'base', 'components', 'utilities', 'properties']);

/**
 * DaisyUI's private custom-property vocabulary (derived; see header). Names
 * generic enough that a first-party author could reasonably pick them
 * (`--size`, `--duration`, `--ease`, `--shadow`, `--value`, ...) are excluded:
 * they would produce a false accusation, and the layer net already closes the
 * plugin path they would have arrived through.
 */
const DAISY_PRIVATE_VARIABLES = [
  '--alert-border-color', '--alert-color', '--anchor-h', '--anchor-v',
  '--badge-bg', '--badge-color', '--badge-fg',
  '--btn-bg', '--btn-border', '--btn-color', '--btn-fg', '--btn-noise', '--btn-p', '--btn-shadow',
  '--card-fs', '--card-p', '--cardtitle-fs',
  '--divider-color', '--divider-m',
  '--first-digits', '--first-item-position', '--flip-degree', '--fx-noise',
  '--indicator-b', '--indicator-e', '--indicator-s', '--indicator-t', '--indicator-x', '--indicator-y',
  '--input-color',
  '--join-ee', '--join-es', '--join-se', '--join-ss',
  '--list-grid-cols', '--mask-chat', '--mask-tooltip',
  '--menu-active-bg', '--menu-active-fg',
  '--modal-bl', '--modal-br', '--modal-tl', '--modal-tr',
  '--page-has-backdrop', '--page-has-scroll', '--page-overflow', '--page-scroll-bg',
  '--page-scroll-bg-on', '--page-scroll-gutter', '--page-scroll-transition',
  '--page-scroll-transition-on',
  '--radialprogress', '--radius-selector-max',
  '--range-bg', '--range-dir', '--range-fill', '--range-p', '--range-progress',
  '--range-thumb', '--range-thumb-size',
  '--show-hundreds', '--show-tens',
  '--step-bg', '--step-fg',
  '--tab-bg', '--tab-border', '--tab-border-color', '--tab-border-colors',
  '--tab-corner-height', '--tab-corner-position', '--tab-corner-width',
  '--tab-height', '--tab-inset', '--tab-order', '--tab-p', '--tab-paddings',
  '--tab-radius-ee', '--tab-radius-es', '--tab-radius-grad', '--tab-radius-limit',
  '--tab-radius-min', '--tab-radius-se', '--tab-radius-ss',
  '--tabcontent-margin', '--tabcontent-order', '--tabcontent-radius-ee',
  '--tabcontent-radius-es', '--tabcontent-radius-se', '--tabcontent-radius-ss',
  '--tabs-box-radius', '--tabs-direction', '--tabs-height',
  '--timeline-col-start', '--timeline-row-end', '--timeline-row-start',
  '--toast-x', '--toast-y', '--toggle-p',
  '--tt-bg', '--tt-off', '--tt-pos', '--tt-tail',
  '--value-hundreds', '--value-ones', '--value-tens', '--value-v',
];

/**
 * The framework theme vocabulary the DS projects from canonical `--ds-*`
 * tokens. Identical to `SUPPORTED_THEME_VARIABLES` in
 * `daisy-projection-contract.test.mjs`, which asserts the same rule over the
 * SOURCE; this gate asserts it over the shipped bytes.
 */
const PROJECTED_THEME_VARIABLES = [
  '--color-primary', '--color-primary-content',
  '--color-secondary', '--color-secondary-content',
  '--color-accent', '--color-accent-content',
  '--color-neutral', '--color-neutral-content',
  '--color-base-100', '--color-base-200', '--color-base-300', '--color-base-content',
  '--color-success', '--color-success-content',
  '--color-warning', '--color-warning-content',
  '--color-error', '--color-error-content',
  '--color-info', '--color-info-content',
  '--radius-selector', '--radius-field', '--radius-box',
  '--size-selector', '--size-field',
  '--border', '--depth', '--noise',
];

const escape = (name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Strip comments so a prose mention of DaisyUI is never read as CSS. */
function withoutComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function lineOf(css, index) {
  return css.slice(0, index).split('\n').length;
}

/** Every finding in one bundle. Pure: takes the bytes, returns strings. */
export function auditBundle(label, rawCss) {
  const findings = [];
  const css = withoutComments(rawCss);

  for (const match of css.matchAll(/@layer\s+([A-Za-z0-9_][A-Za-z0-9_.-]*)/g)) {
    const [root] = match[1].split('.');
    if (root === 'daisyui') {
      findings.push(
        `${label}:${lineOf(css, match.index)}: DaisyUI cascade layer shipped (@layer ${match[1]}). ` +
          'The plugin is active in the Modern pipeline; remove `@plugin "daisyui";` from ' +
          'src/foundation/tokens/css/runtime/engines/modern/compiled.css',
      );
      continue;
    }
    if (root.startsWith(FIRST_PARTY_LAYER_PREFIX) || TAILWIND_LAYERS.has(root)) continue;
    findings.push(
      `${label}:${lineOf(css, match.index)}: unrecognised cascade layer "@layer ${match[1]}". ` +
        `Shipped layers must be first-party (${FIRST_PARTY_LAYER_PREFIX}*) or Tailwind's own ` +
        `(${[...TAILWIND_LAYERS].join(', ')}). A third-party visual framework is emitting CSS.`,
    );
  }

  for (const name of DAISY_PRIVATE_VARIABLES) {
    const pattern = new RegExp(`(?:^|[;{}\\s])(${escape(name)})\\s*:`, 'g');
    for (const match of css.matchAll(pattern)) {
      findings.push(
        `${label}:${lineOf(css, match.index)}: DaisyUI private variable declared (${name}). ` +
          `This vocabulary is generated by daisyui@${DERIVED_FROM_DAISY_VERSION}; the Modern engine ` +
          'must paint from canonical --ds-* tokens, recipes and skin files.',
      );
    }
  }

  for (const name of PROJECTED_THEME_VARIABLES) {
    const pattern = new RegExp(`(?:^|[;{}\\s])${escape(name)}\\s*:\\s*([^;}]+)`, 'g');
    for (const match of css.matchAll(pattern)) {
      const value = match[1].trim();
      if (/^var\(\s*--ds-/.test(value)) continue;
      findings.push(
        `${label}:${lineOf(css, match.index)}: framework theme variable ${name} declared with a ` +
          `non-projected value (${value.slice(0, 60)}). Only framework-token-projection.css may write ` +
          'these names, and only as var(--ds-*). A literal here is a second, competing theme authority.',
      );
    }
  }

  return findings;
}

/**
 * Assert every shipped bundle is free of third-party framework CSS. Pure:
 * returns `{ ok, failures }` and reads only the filesystem it is pointed at.
 */
export function assertModernBundlesFrameworkFree({ packageRoot, bundles } = {}) {
  const root = packageRoot ?? packageRootDefault;
  const rel = (p) => relative(root, p).split(sep).join('/');
  const failures = [];

  const targets = bundles
    ? bundles.map((b) => ({ path: resolve(root, b), required: true }))
    : [
        ...REQUIRED_BUNDLES.map((b) => ({ path: resolve(root, b), required: true })),
        ...OPTIONAL_BUNDLES.map((b) => ({ path: resolve(root, b), required: false })),
      ];

  let audited = 0;
  for (const { path, required } of targets) {
    if (!existsSync(path)) {
      if (required) failures.push(`${rel(path)}: shipped bundle missing; cannot certify what was published`);
      continue;
    }
    audited += 1;
    failures.push(...auditBundle(rel(path), readFileSync(path, 'utf8')));
  }

  if (audited === 0) failures.push('no bundle was audited; the gate proved nothing');

  return { ok: failures.length === 0, failures, audited };
}

const invokedDirectly = resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const argv = process.argv.slice(2);
  const options = {};
  const bundles = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--package-root') options.packageRoot = resolve(argv[i + 1]);
    if (argv[i] === '--bundle') bundles.push(argv[i + 1]);
  }
  if (bundles.length > 0) options.bundles = bundles;

  const { ok, failures, audited } = assertModernBundlesFrameworkFree(options);
  if (!ok) {
    console.error(`modern-bundle-framework-gate: FAIL (${failures.length})`);
    for (const failure of failures.slice(0, 40)) console.error(`  - ${failure}`);
    if (failures.length > 40) console.error(`  ... and ${failures.length - 40} more`);
    process.exit(1);
  }
  console.log(
    `modern-bundle-framework-gate: OK -- ${audited} shipped bundles carry no third-party framework CSS ` +
      '(0 daisyui layers, 0 daisy private variables, 0 non-projected theme literals)',
  );
}
