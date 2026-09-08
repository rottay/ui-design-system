#!/usr/bin/env node
/**
 * states-emphasis-probe — what a browser actually resolves when the emphasis
 * decision moves, measured per family, per vertical.
 *
 * F-10's closure asks for a probe, not an argument: `states.emphasis` must
 * move `--ds-material-control-background-hover` in at least ten families. A
 * grep cannot answer that. Two real compiles of the same vertical, one per
 * posture, go through the PRODUCTIVE door (`documentThemeIntent` ->
 * `compileThemeIntent`, the same admission every tenant passes), are injected
 * into a real engine on top of the committed vertical bundle, and each
 * family's own state channel is read back off computed style with `color-mix()`
 * and every `var()` already resolved.
 *
 * NO SERVER, NO DEV BUILD. The page is `about:blank` plus the committed bundle
 * plus the arm under test, borrowing the resolution-probe's browser discipline:
 * one browser, pages in sequence, nothing to attach to yesterday's process.
 *
 * WHY THE FLOOR IS "IN AT LEAST ONE VERTICAL". The decision reaches a family
 * through the material roots, and a material root a vertical HAND-AUTHORED
 * outranks the derivation -- correctly, that is what `verticalOverride` means.
 * bithire authored 65 of the 71 roots and rottay authors most of its component
 * chrome, so today the reach is bounded by that authorship, not by the
 * mechanism. Those numbers are reported per vertical rather than hidden, and
 * they are the measurement WO-DER-06 will move when the presets become
 * decisions.
 *
 * CONTROLS, IN EVERY VERTICAL. The positive control is the decision's OWN
 * channel (`--ds-state-hover-shift`, painted as a width so the browser has to
 * resolve it): if it does not move, the run measured nothing. The negative
 * control (`--ds-color-primary`) must not move, or the arms differ by more
 * than the emphasis.
 *
 * WHAT "PER FAMILY" MEANS HERE. One REPRESENTATIVE background channel per
 * family -- the first governed background row of the material-arm census --
 * painted on a SYNTHETIC probe element (the construction below builds one
 * `<div data-probe>` per family under `#ds-probe-host` and reads its computed
 * style back). The compiles are real, the injection is the productive door,
 * and the paint is real; what this probe does NOT measure is real-family
 * consumer causality -- no actual `<button>` or `<input>` is rendered, so a
 * family whose own markup overrides the channel would still count as moved.
 * Consumer-side causality is the material-arm gate's measurement; the two are
 * a pair and neither claims the other's evidence. (Disclosed per the K3 audit
 * HOLD of WO-DER-02, 2026-09-08, WIP-01 adjudication.)
 *
 * Usage:
 *   node scripts/check/tokens/states/emphasis-probe/index.mjs [--json]
 *
 * Exit codes: 0 = floor met and both controls behaved everywhere · 1 = not.
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import { measure } from '../material-arm/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/** F-10's own threshold. */
export const FAMILY_FLOOR = 10;

/** The two ends of the domain; the middle posture is the unauthored default. */
const ARMS = Object.freeze(['subtle', 'strong']);

export const VERTICALS = Object.freeze(['rottay', 'bithire', 'evnto']);

/** The channel F-10 names by hand, reported alongside the family census. */
const NAMED_CHANNEL = '--ds-material-control-background-hover';

const RESOLUTION_ROOTS = [
  `${CORE_ROOT}/package.json`,
  `${CORE_ROOT}/../../package.json`,
  `${CORE_ROOT}/../showroom/package.json`,
];

function resolveChromium() {
  const attempts = [];
  for (const root of RESOLUTION_ROOTS) {
    for (const specifier of ['playwright', '@playwright/test']) {
      try {
        const require = createRequire(root);
        const module = require(specifier);
        if (module?.chromium) {
          return { chromium: module.chromium, provenance: `${specifier} from ${root}` };
        }
      } catch (error) { attempts.push(`${specifier} @ ${root}: ${error.message}`); }
    }
  }
  throw new Error(`states-emphasis-probe: no Playwright chromium.\n  ${attempts.join('\n  ')}`);
}

async function loadCompiler() {
  const dist = join(CORE_ROOT, 'dist');
  if (!existsSync(dist)) {
    throw new Error('states-emphasis-probe: dist/ is missing; run `pnpm -C packages/core build` first');
  }
  const load = (path) => import(pathToFileURL(join(dist, path)).href);
  const [server, emission] = await Promise.all([
    load('server.js'),
    load('infrastructure/compilers/runtime/theme/runtime/emission/index.js'),
  ]);
  return { server, emission };
}

/**
 * One representative background channel per family, taken from the gate's own
 * census so the probe and the gate cannot disagree about what is governed.
 */
export function probeTargets() {
  const report = measure();
  const byFamily = new Map();
  for (const row of report.governedRows) {
    if (row.facet !== 'background') continue;
    if (!byFamily.has(row.family)) byFamily.set(row.family, row.name);
  }
  return [...byFamily.entries()].sort(([a], [b]) => a.localeCompare(b));
}

async function measureVertical({ vertical, targets, server, emission, context }) {
  const bundle = join(CORE_ROOT, `artifacts/generated/css/verticals/${vertical}/index.css`);
  if (!existsSync(bundle)) throw new Error(`states-emphasis-probe: missing bundle ${bundle}`);
  const baseCss = readFileSync(bundle, 'utf8');

  const readings = {};
  for (const emphasis of ARMS) {
    const intent = server.documentThemeIntent({
      vertical,
      slug: `${vertical}-emphasis-${emphasis}`,
      document: { version: 2, plan: 'standard', decisions: { 'states.emphasis': emphasis } },
    });
    const { compiled } = server.compileThemeIntent(intent);
    const armCss = emission.emitThemeCss(compiled, emission.firstPartyScope(vertical));

    const page = await context.newPage();
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addStyleTag({ content: baseCss });
    await page.addStyleTag({ content: armCss });
    await page.addStyleTag({
      content: [
        '#ds-probe-host { width: 1000px; }',
        '#ds-probe-host > * { display: block; }',
        ...targets.map(([family, channel]) => `[data-probe='${family}'] { background-color: var(${channel}); }`),
        `[data-probe='__named'] { background-color: var(${NAMED_CHANNEL}); }`,
        "[data-probe='__positive'] { width: var(--ds-state-hover-shift); }",
        "[data-probe='__negative'] { background-color: var(--ds-color-primary); }",
      ].join('\n'),
    });
    readings[emphasis] = await page.evaluate(({ probes, slug }) => {
      document.documentElement.setAttribute('data-tenant', slug);
      const host = document.createElement('div');
      host.id = 'ds-probe-host';
      document.body.append(host);
      const values = {};
      for (const probe of probes) {
        const node = document.createElement('div');
        node.setAttribute('data-probe', probe);
        host.append(node);
        const style = getComputedStyle(node);
        values[probe] = probe === '__positive' ? style.width : style.backgroundColor;
      }
      return values;
    }, { probes: [...targets.map(([family]) => family), '__named', '__positive', '__negative'], slug: vertical });
    await page.close();
  }

  const moved = targets
    .map(([family]) => family)
    .filter((family) => readings.subtle[family] !== readings.strong[family]);
  return {
    vertical,
    families: targets.length,
    moved: moved.length,
    movedFamilies: moved,
    namedChannelMoved: readings.subtle.__named !== readings.strong.__named,
    positiveControlMoved: readings.subtle.__positive !== readings.strong.__positive,
    negativeControlHeld: readings.subtle.__negative === readings.strong.__negative,
  };
}

/**
 * The verdict, separated from the browser so it can be driven red without one.
 *
 * Every clause is here: a dead positive control, a moving negative control and
 * a reach below the floor. The drill plants each one.
 */
export function evaluateReport(report) {
  const failures = [];
  for (const scope of report.scopes) {
    if (!scope.positiveControlMoved) {
      failures.push(`${scope.vertical}: the positive control did not move, so this arm measured nothing`);
    }
    if (!scope.negativeControlHeld) {
      failures.push(`${scope.vertical}: the negative control moved, so the arms differ by more than the emphasis`);
    }
  }
  if (report.best < report.floor) {
    failures.push(`states.emphasis moved at most ${report.best} families in any vertical; the floor is ${report.floor}`);
  }
  return failures;
}

export async function runProbe({ verticals = VERTICALS, json = false } = {}) {
  const { server, emission } = await loadCompiler();
  const targets = probeTargets();
  const { chromium, provenance } = resolveChromium();
  const browser = await chromium.launch();
  const scopes = [];
  try {
    const context = await browser.newContext();
    for (const vertical of verticals) {
      scopes.push(await measureVertical({ vertical, targets, server, emission, context }));
    }
  } finally {
    await browser.close();
  }

  const best = Math.max(...scopes.map((scope) => scope.moved));
  const report = { browser: provenance, floor: FAMILY_FLOOR, families: targets.length, best, scopes };
  const failures = evaluateReport(report);
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    for (const scope of scopes) {
      console.log(
        `states-emphasis-probe [${scope.vertical}]: ${scope.moved}/${scope.families} families moved; `
        + `${NAMED_CHANNEL} ${scope.namedChannelMoved ? 'moved' : 'held (vertical authors it)'}; `
        + `positive ${scope.positiveControlMoved ? 'moved' : 'DID NOT MOVE'}; `
        + `negative ${scope.negativeControlHeld ? 'held' : 'MOVED'}`,
      );
    }
    console.log(`states-emphasis-probe: best ${best}/${targets.length} families (floor ${FAMILY_FLOOR})`);
  }
  for (const failure of failures) console.error(`  FAIL ${failure}`);
  return { report, failures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { failures } = await runProbe({ json: process.argv.includes('--json') });
  process.exit(failures.length > 0 ? 1 : 0);
}
