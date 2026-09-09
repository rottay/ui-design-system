#!/usr/bin/env node
/**
 * shape-radius-probe — what a browser actually resolves when the geometry dial
 * moves, measured per family, per vertical.
 *
 * F-07's closure asks for a probe, not an argument: `--ds-radius-md` computed
 * with `radiusScale` 0.8 must differ from 1.2 in at least twenty families. A
 * grep cannot answer that, and the defect it exists to catch was invisible to
 * one: `calc(9px / 1.25 * var(--ds-radius-scale, 1))` CONTAINS the dial and
 * paints the same pixel at every dial position, which is why the textual
 * `dial-authority` gate certified a control that moved nothing.
 *
 * Two real compiles of the same vertical, one per dial position, go through
 * the PRODUCTIVE door (`documentThemeIntent` -> `compileThemeIntent`, the same
 * admission every tenant passes), are injected into a real engine on top of
 * the committed vertical bundle, and each family's own radius channel is read
 * back off computed style with every `calc()` and `var()` already resolved.
 *
 * NO SERVER, NO DEV BUILD. The page is `about:blank` plus the committed bundle
 * plus the arm under test, borrowing the states-emphasis-probe's browser
 * discipline: one browser, pages in sequence, nothing to attach to yesterday's
 * process.
 *
 * WHAT "PER FAMILY" MEANS HERE. One Modern skin folder is one family, and its
 * representative is the FIRST corner it paints that the ramp's own law can
 * scale -- censused from source by rule rather than from a list -- replayed as
 * `border-top-left-radius` on a synthetic probe element so the browser has to
 * resolve the whole chain. The compiles are real, the injection is the
 * productive door, and the paint is real; what this probe does NOT measure is
 * real-family consumer causality -- no actual `<button>` is rendered, so a
 * family whose own markup restates its corner would still count as moved.
 *
 * Usage:
 *   node scripts/check/tokens/shape/radius-probe/index.mjs [--json]
 *
 * Exit codes: 0 = floor met and both controls behaved everywhere · 1 = not.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/** F-07's own threshold. */
export const FAMILY_FLOOR = 20;

/** The two ends of the bounded domain; 1 is the unauthored middle. */
const ARMS = Object.freeze([0.8, 1.2]);

export const VERTICALS = Object.freeze(['rottay', 'bithire', 'evnto']);

/** The channel F-07 names by hand, reported alongside the family census. */
const NAMED_CHANNEL = '--ds-radius-md';

/**
 * The family population: the Modern skins, one folder per family.
 *
 * Modern is the only productive engine, and a skin folder IS a family by the
 * same folder-slug rule the family inventory resolves with. The frozen engines
 * are out of scope by owner decision, and the generated artifacts are outputs,
 * not authors.
 */
const SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';

/** What a family paints its corner with. Longhands count; the shorthand leads. */
const PAINTED_RADIUS = /^\s*border-radius\s*:\s*([^;]+);/u;

/**
 * A corner the dial cannot move whatever it does, by the ramp's OWN law.
 *
 * `themes/default.css` scales `sm|md|lg|xl` and deliberately leaves
 * `none`/`xs`/`2xl`/`3xl`/`full` literal, because a pill and a square corner
 * are not points on a scale. `50%` and `inherit` are the same statement in
 * another spelling. Counting them would put rows in the denominator that can
 * never pass and call the result a reach.
 */
const UNSCALED_CORNER =
  /^(?:0|0px|0rem|none|inherit|initial|unset|revert|50%|9999px|var\(\s*--ds-radius-(?:full|none)\b)/iu;

/**
 * One representative painted radius per family, censused from source.
 *
 * The VALUE is the target, not a channel name: what the probe has to resolve is
 * the expression the family actually paints, whether that is a ramp step, a
 * family channel or a literal. A family whose only corner is unscaled by the
 * ramp's own law is excluded rather than counted as an unreachable row.
 */
export function probeTargets({ root = CORE_ROOT } = {}) {
  const targets = [];
  let families;
  try {
    families = readdirSync(join(root, SKIN_ROOT), { withFileTypes: true });
  } catch {
    throw new Error(`shape-radius-probe: no Modern skin root at ${SKIN_ROOT}`);
  }
  for (const entry of families.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const file = join(root, SKIN_ROOT, entry.name, 'index.css');
    if (!existsSync(file)) continue;
    const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//gu, '');
    for (const line of source.split('\n')) {
      const match = PAINTED_RADIUS.exec(line);
      if (!match) continue;
      const value = match[1].trim().replace(/\s+/gu, ' ');
      if (UNSCALED_CORNER.test(value)) continue;
      targets.push([entry.name, value]);
      break;
    }
  }
  return targets;
}

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
        if (module?.chromium) return { chromium: module.chromium, provenance: `${specifier} from ${root}` };
      } catch (error) { attempts.push(`${specifier} @ ${root}: ${error.message}`); }
    }
  }
  throw new Error(`shape-radius-probe: no Playwright chromium.\n  ${attempts.join('\n  ')}`);
}

async function loadCompiler() {
  const dist = join(CORE_ROOT, 'dist');
  if (!existsSync(dist)) {
    throw new Error('shape-radius-probe: dist/ is missing; run `pnpm -C packages/core build` first');
  }
  const load = (path) => import(pathToFileURL(join(dist, path)).href);
  const [server, emission] = await Promise.all([
    load('server.js'),
    load('infrastructure/compilers/runtime/theme/runtime/emission/index.js'),
  ]);
  return { server, emission };
}

async function measureVertical({ vertical, targets, server, emission, context }) {
  const bundle = join(CORE_ROOT, `artifacts/generated/css/verticals/${vertical}/index.css`);
  if (!existsSync(bundle)) throw new Error(`shape-radius-probe: missing bundle ${bundle}`);
  const baseCss = readFileSync(bundle, 'utf8');

  const readings = {};
  for (const radiusScale of ARMS) {
    const intent = server.documentThemeIntent({
      vertical,
      slug: `${vertical}-radius-${radiusScale}`,
      document: { version: 2, plan: 'standard', decisions: { 'shape.radius-scale': radiusScale } },
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
        '#ds-probe-host > * { display: block; width: 200px; height: 200px; }',
        ...targets.map(([family, value]) => `[data-probe='${family}'] { border-top-left-radius: ${value}; }`),
        `[data-probe='__named'] { border-top-left-radius: var(${NAMED_CHANNEL}); }`,
        "[data-probe='__negative'] { border-top-left-radius: var(--ds-radius-none, 0px); }",
      ].join('\n'),
    });
    readings[radiusScale] = await page.evaluate(({ probes, slug }) => {
      document.documentElement.setAttribute('data-tenant', slug);
      const host = document.createElement('div');
      host.id = 'ds-probe-host';
      document.body.append(host);
      const values = {};
      for (const probe of probes) {
        const node = document.createElement('div');
        node.setAttribute('data-probe', probe);
        host.append(node);
        values[probe] = getComputedStyle(node).borderTopLeftRadius;
      }
      return values;
    }, { probes: [...targets.map(([family]) => family), '__named', '__negative'], slug: vertical });
    await page.close();
  }

  const [low, high] = ARMS;
  const moved = targets.map(([family]) => family).filter((family) => readings[low][family] !== readings[high][family]);
  return {
    vertical,
    families: targets.length,
    moved: moved.length,
    movedFamilies: moved,
    namedChannel: { low: readings[low].__named, high: readings[high].__named },
    namedChannelMoved: readings[low].__named !== readings[high].__named,
    negativeControlHeld: readings[low].__negative === readings[high].__negative,
  };
}

/**
 * The verdict, separated from the browser so it can be driven red without one.
 *
 * The positive control IS `--ds-radius-md`: F-07 names it, and a run where it
 * holds measured a dead dial rather than a live one.
 */
export function evaluateReport(report) {
  const failures = [];
  for (const scope of report.scopes) {
    if (!scope.namedChannelMoved) {
      failures.push(`${scope.vertical}: ${NAMED_CHANNEL} did not move (${scope.namedChannel.low} at both arms), so the dial is inert`);
    }
    if (!scope.negativeControlHeld) {
      failures.push(`${scope.vertical}: the negative control moved, so the arms differ by more than the dial`);
    }
  }
  if (report.best < report.floor) {
    failures.push(`shape.radius-scale moved at most ${report.best} families in any vertical; the floor is ${report.floor}`);
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
  const report = { browser: provenance, floor: FAMILY_FLOOR, families: targets.length, arms: ARMS, best, scopes };
  const failures = evaluateReport(report);
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    for (const scope of scopes) {
      console.log(
        `shape-radius-probe [${scope.vertical}]: ${scope.moved}/${scope.families} families moved; `
        + `${NAMED_CHANNEL} ${scope.namedChannel.low} -> ${scope.namedChannel.high}; `
        + `negative ${scope.negativeControlHeld ? 'held' : 'MOVED'}`,
      );
    }
    console.log(`shape-radius-probe: best ${best}/${targets.length} families (floor ${FAMILY_FLOOR})`);
  }
  for (const failure of failures) console.error(`  FAIL ${failure}`);
  return { report, failures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { failures } = await runProbe({ json: process.argv.includes('--json') });
  process.exit(failures.length > 0 ? 1 : 0);
}
