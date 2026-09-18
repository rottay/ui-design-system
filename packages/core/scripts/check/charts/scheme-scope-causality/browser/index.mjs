#!/usr/bin/env node
/**
 * chart-scheme-scope-causality/browser — the COMPUTED fill, in real Chromium.
 *
 * ================== THIS LEG IS RED AT ITS OWN BASE ==================
 * It lands measuring honestly and NON-BLOCKING, for the same reason its
 * happy-dom sibling does: part of the divergence it reports is the defect the
 * family-cut lots exist to fix. Registering it as blocking before those lots
 * teaches a reader to ignore a red gate.
 * =====================================================================
 *
 * WHAT IT ADDS TO THE SIBLING PROBE. happy-dom applies no stylesheet, so the
 * sibling can only read paint a mark CARRIES as an attribute. `pie-chart`
 * carries none -- its slot arrives through
 * `[data-series-index] { --ds-chart-mark-color: var(--ds-chart-paint-N) }` --
 * and therefore measures as `paint=none` there whether the chain is intact or
 * broken. The debrief owes this leg for exactly that blind spot (§6.4).
 *
 * WHAT IS REAL AND WHAT IS BUILT.
 *   - The COMPONENT CODE is bundled from `src/` at HEAD with esbuild, the
 *     technique every other browser leg in this package uses, so the JS under
 *     measurement is the working tree and cannot be a stale artifact.
 *   - The STYLESHEET is the published `dist/styles.css` -- the bytes a
 *     consumer actually receives, with the real `@layer` order -- and the run
 *     REFUSES unless every source file the chart paint chain depends on is
 *     present in it verbatim. A stale artifact fails the leg by name; it never
 *     degrades into a quieter pass.
 *
 * THE GROUND IS PART OF THE READING. The scene mounts a tenant with no brand
 * payload, so the page resolves the DS's own neutral base ramp -- where, for
 * example, `--ds-color-primary-700` is `#000000`. A fill reported as black is
 * therefore a faithful measurement of that ground, not a broken capture; every
 * census records the `data-tenant` / `data-vertical` / `data-theme` the run
 * actually had, so a reader can see which ground produced a colour.
 *
 * NO SILENT SKIP. A missing Chromium or esbuild binary throws. "Not run" must
 * never read as "passed".
 *
 * TWO HALVES, as next door. The scene measures and writes a census; this file
 * adjudicates it. A red scene means the scene broke; a red verdict means the
 * tree diverged.
 *
 * Usage:
 *   node scripts/check/charts/scheme-scope-causality/browser/index.mjs
 *   node .../browser/index.mjs --check              # exit 1 on divergence
 *   node .../browser/index.mjs --json
 *   node .../browser/index.mjs --out=capture.json      # save the raw capture
 *   node .../browser/index.mjs --census=capture.json   # adjudicate it again
 *   node .../browser/index.mjs --negative-control   # prove the fill has teeth
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findChromium } from '../../../modern-rescue/cascade/probe/browser-analysis/index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(here);

const SCENE = join(here, 'scene/index.tsx');
const ESBUILD = join(root, 'node_modules/.bin/esbuild');
const STYLESHEET = 'dist/styles.css';

export const MODES = Object.freeze(['light', 'dark']);

/**
 * The source files whose text must be present in the published stylesheet for
 * the capture to be measuring HEAD. Each owns one tier of the chain: the
 * mode-aware scheme tables, the `--ds-chart-paint-N` bridge plus the mark fill
 * rules, the two family skins, and the `--ds-color-*` roots an ungoverned mark
 * falls back to.
 */
export const CHAIN_SOURCES = Object.freeze([
  'src/foundation/tokens/css/foundation/themes/default/index.css',
  'src/foundation/tokens/css/presentation/components/patterns/index.css',
  'src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css',
  'src/foundation/tokens/css/presentation/components/skin/chart-bar/index.css',
  'src/foundation/tokens/css/presentation/components/skin/chart-pie/index.css',
]);

export const DIVERGENCES = Object.freeze({
  UNRENDERED: 'unrendered',
  SCOPE: 'scope-ignores-request',
  FILL_UNRESOLVED: 'fill-unresolved',
  FILL_WRONG_TABLE: 'fill-not-the-scheme',
  INDISCRIMINATE: 'negative-control-vacuous',
});

/**
 * Classify one census row. A row carries at most one divergence, in cause
 * order: a scope that ignored the request explains the fill, and the negative
 * control is only interesting for a row that otherwise passed.
 */
export function classify(row) {
  if (!row.rendered) return DIVERGENCES.UNRENDERED;
  if (row.stampedScheme !== row.expectedScheme) return DIVERGENCES.SCOPE;
  if (row.computedFill === null || row.expectedFill === null) {
    return DIVERGENCES.FILL_UNRESOLVED;
  }
  if (row.computedFill !== row.expectedFill) return DIVERGENCES.FILL_WRONG_TABLE;
  if (row.wrongFill === null || row.wrongFill === row.expectedFill) {
    return DIVERGENCES.INDISCRIMINATE;
  }
  return null;
}

export function adjudicate(censuses) {
  const list = Array.isArray(censuses) ? censuses : [censuses];
  const rows = list.flatMap((census) =>
    (census.rows ?? []).map((row) => ({ ...row, mode: row.mode ?? census.mode })),
  );
  const divergences = [];
  const byKind = {};
  for (const row of rows) {
    const kind = classify(row);
    if (!kind) continue;
    byKind[kind] = (byKind[kind] ?? 0) + 1;
    divergences.push({ kind, ...row });
  }
  return {
    total: rows.length,
    agreeing: rows.length - divergences.length,
    byKind,
    divergences,
    modeSensitivity: modeSensitivity(list),
  };
}

/**
 * Light and dark must resolve different tables, or the leg captured one mode
 * twice and every "dark" row is a duplicate of its light neighbour. Measured
 * from the witnesses the scene reads at the document root, not assumed.
 */
export function modeSensitivity(censuses) {
  const byMode = new Map(censuses.map((census) => [census.mode, census.modeWitness ?? {}]));
  const light = byMode.get('light');
  const dark = byMode.get('dark');
  if (!light || !dark) {
    return { measured: false, reason: 'both modes were not captured', inert: [] };
  }
  const inert = Object.keys(light).filter((scheme) => light[scheme] === dark[scheme]);
  return { measured: true, reason: null, inert };
}

/**
 * The negative control, applied to the census the tree actually produced: each
 * row's expectation is moved to a DIFFERENT scheme's slot 1, resolved in the
 * same page, under the same root, in the same mode. Only the expectation
 * moves -- the stamped scope is left alone -- so a row that flips can only
 * have flipped on the fill comparison. Every row that agreed must now report
 * `fill-not-the-scheme`; one that survives proves the fill assertion is inert.
 */
export function negativeControl(censuses) {
  const list = Array.isArray(censuses) ? censuses : [censuses];
  const keyOf = (row, census) =>
    `${row.family}::${row.requested}::${row.mode ?? census.mode}`;

  const agreeingBefore = new Set();
  for (const census of list) {
    for (const row of census.rows ?? []) {
      if (classify({ ...row, mode: row.mode ?? census.mode }) === null) {
        agreeingBefore.add(keyOf(row, census));
      }
    }
  }

  const survived = [];
  for (const census of list) {
    for (const row of census.rows ?? []) {
      const key = keyOf(row, census);
      if (!agreeingBefore.has(key)) continue;
      const rotated = { ...row, mode: row.mode ?? census.mode, expectedFill: row.wrongFill };
      if (classify(rotated) === null) survived.push(key);
    }
  }

  return {
    agreeingBefore: agreeingBefore.size,
    flipped: agreeingBefore.size - survived.length,
    survived,
  };
}

/** The published stylesheet must still contain the sources it was built from. */
export function assertStylesheetFreshness({ cwd = root } = {}) {
  const artifactPath = join(cwd, STYLESHEET);
  if (!existsSync(artifactPath)) {
    throw new Error(
      `${STYLESHEET} is missing: this leg measures the published stylesheet. `
        + 'Run `pnpm --filter @rottay/design-system build` first.',
    );
  }
  const artifact = readFileSync(artifactPath, 'utf8');
  const stale = CHAIN_SOURCES.filter(
    (source) => !artifact.includes(readFileSync(join(cwd, source), 'utf8').trim()),
  );
  if (stale.length > 0) {
    throw new Error(
      `${STYLESHEET} is stale against HEAD; it does not contain:\n  ${stale.join('\n  ')}\n`
        + 'Rebuild before capturing: a stale artifact measures a tree that is not this one.',
    );
  }
  return { artifactPath, verified: CHAIN_SOURCES.length };
}

function buildPage({ cwd = root } = {}) {
  const { artifactPath } = assertStylesheetFreshness({ cwd });
  if (!existsSync(ESBUILD)) {
    throw new Error(`the esbuild binary is missing at ${ESBUILD}; the scene cannot be bundled`);
  }
  const workspace = mkdtempSync(join(tmpdir(), 'chart-causality-browser-'));
  const bundle = join(workspace, 'scene.js');
  execFileSync(
    ESBUILD,
    [
      SCENE,
      '--bundle',
      '--format=iife',
      '--jsx=automatic',
      '--loader:.css=text',
      `--alias:@=${join(cwd, 'src')}`,
      `--alias:@ui=${join(cwd, 'src/components')}`,
      '--define:process.env.NODE_ENV="production"',
      `--outfile=${bundle}`,
    ],
    { stdio: 'pipe' },
  );
  copyFileSync(artifactPath, join(workspace, 'styles.css'));
  const page = join(workspace, 'index.html');
  writeFileSync(
    page,
    [
      '<!doctype html><html><head><meta charset="utf-8">',
      '<link rel="stylesheet" href="./styles.css">',
      '<style>body { margin: 0; }</style>',
      '</head><body><div id="root"></div>',
      '<script src="./scene.js"></script>',
      '</body></html>',
    ].join('\n'),
    'utf8',
  );
  return page;
}

function capture(binary, page, mode) {
  const dom = execFileSync(
    binary,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--virtual-time-budget=20000',
      '--dump-dom',
      `file://${page}${mode === 'dark' ? '#dark' : ''}`,
    ],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  );
  const match = /data-probe-result="([^"]*)"/.exec(dom);
  if (!match) {
    throw new Error(`the scene never reported a census in ${mode} mode; the page did not render`);
  }
  const decoded = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return JSON.parse(decoded);
}

/** Drive Chromium once per mode and return both censuses. */
export function measure({ cwd = root, out = null } = {}) {
  const binary = findChromium();
  if (!binary) {
    throw new Error(
      'no Chromium binary found: this leg measures real computed paint and cannot be '
        + 'satisfied by a DOM runner. Install one or point CASCADE_PROBE_CHROMIUM at it.',
    );
  }
  const page = buildPage({ cwd });
  const censuses = MODES.map((mode) => capture(binary, page, mode));
  if (out) writeFileSync(out, `${JSON.stringify(censuses, null, 2)}\n`, 'utf8');
  return censuses;
}

function readFlagArguments(flag) {
  const prefix = `--${flag}=`;
  return process.argv
    .filter((value) => value.startsWith(prefix))
    .map((value) => value.slice(prefix.length));
}

/**
 * A census carries the mode it was captured in and the ground it ran on. The
 * adjudicated REPORT this CLI prints does not, and replaying one would silently
 * lose the mode-sensitivity leg, so it is refused by name rather than read as a
 * census with an unknown ground.
 */
function readCensusFile(path) {
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  const list = Array.isArray(parsed) ? parsed : [parsed];
  for (const entry of list) {
    if (!entry || typeof entry.mode !== 'string' || !Array.isArray(entry.rows)) {
      throw new Error(
        `${path} is not a capture: --census= reads the file written by --out=, `
          + 'not the adjudicated report printed by --json.',
      );
    }
  }
  return list;
}

function printRows(report) {
  const header = 'family      scheme      mode   stamped     fill              from        verdict';
  console.log(`  ${header}`);
  console.log(`  ${'-'.repeat(header.length)}`);
  const byKey = new Map(
    report.divergences.map((divergence) => [
      `${divergence.family}::${divergence.requested}::${divergence.mode}`,
      divergence.kind,
    ]),
  );
  for (const row of report.rows) {
    const key = `${row.family}::${row.requested}::${row.mode}`;
    const kind = byKey.get(key) ?? 'PASS';
    console.log(
      `  ${row.family.padEnd(11)} ${row.requested.padEnd(11)} ${String(row.mode).padEnd(6)} `
        + `${String(row.stampedScheme).padEnd(11)} ${String(row.computedFill).padEnd(17)} `
        + `${String(row.fillTable).padEnd(11)} ${kind}`,
    );
  }
}

function main() {
  const check = process.argv.includes('--check');
  const asJson = process.argv.includes('--json');
  const wantsNegativeControl = process.argv.includes('--negative-control');
  const censusArguments = readFlagArguments('census');
  const [out = null] = readFlagArguments('out');

  const censuses = censusArguments.length > 0
    ? censusArguments.flatMap(readCensusFile)
    : measure({ out });

  const report = adjudicate(censuses);
  report.rows = censuses.flatMap((census) =>
    (census.rows ?? []).map((row) => ({ ...row, mode: row.mode ?? census.mode })),
  );

  if (asJson) {
    const payload = wantsNegativeControl
      ? { ...report, negativeControl: negativeControl(censuses) }
      : report;
    console.log(JSON.stringify(payload, null, 2));
    if (check && report.divergences.length > 0) process.exit(1);
    return;
  }

  console.log('chart-scheme-scope-causality/browser  [NON-BLOCKING]');
  for (const census of censuses) {
    console.log(
      `  ground ${census.mode}: data-theme=${census.root?.dataTheme} `
        + `tenant=${census.root?.dataTenant} vertical=${census.root?.dataVertical} `
        + `engine=${census.root?.dataEngine}`,
    );
  }
  console.log(`  rows measured: ${report.total}`);
  console.log(`  agreeing:      ${report.agreeing}`);
  for (const [kind, count] of Object.entries(report.byKind)) {
    console.log(`  ${kind}: ${count}`);
  }
  console.log('');
  printRows(report);

  const sensitivity = report.modeSensitivity;
  console.log('');
  if (!sensitivity.measured) {
    console.log(`  MODE SENSITIVITY NOT MEASURED: ${sensitivity.reason}`);
  } else if (sensitivity.inert.length > 0) {
    console.log(`  MODE-INERT SCHEMES (light === dark): ${sensitivity.inert.join(', ')}`);
  } else {
    console.log('  mode sensitivity: every scheme resolves a different table in dark');
  }

  if (wantsNegativeControl) {
    const control = negativeControl(censuses);
    console.log('');
    console.log('  negative control (expectation moved to another scheme, scope untouched)');
    console.log(`    agreeing before: ${control.agreeingBefore}`);
    console.log(`    flipped to red:  ${control.flipped}`);
    console.log(
      control.survived.length === 0
        ? '    every agreeing row reddened: the fill assertion has teeth'
        : `    SURVIVED (assertion inert): ${control.survived.join(', ')}`,
    );
  }

  if (report.divergences.length > 0 && check) process.exit(1);
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
