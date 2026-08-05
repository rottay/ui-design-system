/**
 * CTRL-04 preservation probe.
 *
 * THE ONLY THING THAT MAKES THE ENGINE-TIER DELETION SAFE.
 *
 * The plan is: pin the engine-tier button shadow values into the out-of-round
 * verticals, then delete the engine declarations so the role floor becomes
 * reachable. That is preservation-safe only if `platform` and `evnto` resolve
 * BYTE-IDENTICAL values before and after. This probe is what turns that from an
 * assertion into a measurement.
 *
 * WHY A RESOLUTION PROBE RATHER THAN A BROWSER PROBE. `platform` and `evnto` are
 * not mounted in the reference lab, so there is no page to read computed style
 * from. What actually decides their paint is the var() chain: the vertical
 * artifact if it authors the channel, otherwise the engine default. This probe
 * resolves that chain from the shipped sources, per variant, per state, per
 * colour mode — the same decision the browser would make, on the same inputs.
 *
 * It deliberately does NOT resolve the terminal token values (--ds-shadow-*).
 * Those are dark-aware and the pins are by REFERENCE, so the reference string
 * surviving unchanged is exactly the property that keeps both colour modes
 * correct. Comparing resolved hex would test the wrong thing and would go red on
 * a legitimate dark-mode difference.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..', '..', '..', '..', '..');

/** Verticals whose paint MUST NOT move. BitHire and TMM are in-round and may move. */
/**
 * NOTE THE INVERTED MAPPING, which cost one failed run: the THEME SOURCE for
 * rottay lives at brand-themes/platform/, while its ARTIFACT is emitted to
 * artifacts/rottay/. Neither name is wrong; they are two different keys for the
 * same vertical, and code that touches both halves has to carry both.
 */
export const PRESERVED_ARTIFACTS = ['rottay', 'evnto'];
export const PRESERVED_THEME_SOURCES = ['platform', 'evnto'];
export const PRESERVED_VERTICALS = PRESERVED_ARTIFACTS;
export const IN_ROUND_VERTICALS = ['bithire'];

const STATES = ['rest', 'hover', 'active', 'selected'];

/** The variant vocabulary under test. Fixed, so the probe survives the deletion. */
const VARIANT_KEYS = { primary:1, secondary:1, default:1, ghost:1, text:1, dashed:1, link:1, success:1, warning:1, error:1, info:1, ai:1 };

/** Pull every --ds-button-{variant}-shadow{,-state} declaration out of a stylesheet. */
function declarations(css) {
  const out = {};
  const pattern = /--ds-button-([a-z]+)-shadow(-hover|-active|-selected)?\s*:\s*([^;]+);/g;
  let hit;
  while ((hit = pattern.exec(css)) !== null) {
    const variant = hit[1];
    const state = hit[2] ? hit[2].slice(1) : 'rest';
    (out[variant] ??= {})[state] = hit[3].trim();
  }
  return out;
}

/**
 * A vertical artifact carries a light block and a dark block. Split on the dark
 * selector so a channel authored only in dark mode is not credited to light.
 */
function splitModes(css) {
  const darkAt = css.search(/\[data-theme=["']dark["']\]|\.dark\b/);
  return darkAt < 0
    ? { light: css, dark: '' }
    : { light: css.slice(0, darkAt), dark: css.slice(darkAt) };
}

function engineDefaults() {
  return declarations(
    readFileSync(path.join(CORE, 'src/foundation/tokens/css/presentation/components/button.css'), 'utf8'),
  );
}

function verticalDeclarations(vertical) {
  const css = readFileSync(
    path.join(CORE, `src/foundation/tokens/css/facade/artifacts/${vertical}/index.css`),
    'utf8',
  );
  const { light, dark } = splitModes(css);
  return { light: declarations(light), dark: declarations(dark) };
}

/**
 * The effective value for one variant/state/mode: the vertical's own
 * declaration if present, otherwise the engine default, otherwise the role
 * floor. `resolvesFrom` is the load-bearing field — a value that stops resolving
 * from the engine default is exactly what the deletion must not cause.
 */
function effective(variant, state, mode, engine, vertical) {
  const own = vertical[mode]?.[variant]?.[state] ?? (mode === 'dark' ? vertical.light?.[variant]?.[state] : undefined);
  if (own !== undefined) return { value: own, resolvesFrom: 'vertical artifact' };
  const eng = engine[variant]?.[state];
  if (eng !== undefined) return { value: eng, resolvesFrom: 'engine default' };
  return { value: null, resolvesFrom: 'role floor' };
}

export function snapshot() {
  const engine = engineDefaults();
  // FIXED variant list, NOT derived from the engine. Deriving it from the engine
  // was a real defect in this probe: the deletion under test EMPTIES the engine,
  // so the after-snapshot had almost no cells and every before-cell read as
  // absent -> a false REGRESSION. It failed closed, which is the safe direction,
  // but it was still wrong and would have blocked a correct change.
  const variants = Object.keys(VARIANT_KEYS);
  const verticals = {};

  for (const vertical of [...PRESERVED_VERTICALS, ...IN_ROUND_VERTICALS]) {
    const declared = verticalDeclarations(vertical);
    const rows = {};
    for (const variant of variants) {
      for (const state of STATES) {
        for (const mode of ['light', 'dark']) {
          const e = effective(variant, state, mode, engine, declared);
          if (e.value === null) continue;
          rows[`${variant}.${state}.${mode}`] = e;
        }
      }
    }
    verticals[vertical] = rows;
  }

  return {
    schemaVersion: 1,
    probeId: 'wo-cra-23-R1-C1-button-shadow-preservation',
    law: 'platform and evnto must resolve byte-identical values before and after the engine-tier deletion. bithire may move: its deltas are in-round and go to sighted review as declared deltas.',
    comparisonRule: 'Reference strings are compared verbatim. Terminal token values are NOT resolved, because the pins are by reference and those tokens are dark-aware — comparing resolved colour would fail on a legitimate dark-mode difference and would be testing the wrong property.',
    variantsCovered: variants,
    statesCovered: STATES,
    modesCovered: ['light', 'dark'],
    cellsPerVertical: Object.keys(verticals[PRESERVED_VERTICALS[0]] ?? {}).length,
    verticals,
  };
}

/** Compare a fresh snapshot against a recorded one. Empty regressions = preserved. */
export function compare(before, after) {
  const regressions = [];
  const intendedMoves = [];
  for (const vertical of Object.keys(before.verticals)) {
    const b = before.verticals[vertical];
    const a = after.verticals[vertical] ?? {};
    for (const cell of new Set([...Object.keys(b), ...Object.keys(a)])) {
      const bv = b[cell]?.value ?? '(absent)';
      const av = a[cell]?.value ?? '(absent)';
      if (bv === av) continue;
      const entry = { vertical, cell, before: bv, after: av, resolvedFromBefore: b[cell]?.resolvesFrom, resolvedFromAfter: a[cell]?.resolvesFrom };
      if (PRESERVED_VERTICALS.includes(vertical)) regressions.push(entry);
      else intendedMoves.push(entry);
    }
  }
  return {
    preserved: regressions.length === 0,
    regressions,
    intendedMoves,
    verdict: regressions.length === 0
      ? 'PRESERVED — every out-of-round vertical resolves identically.'
      : `REGRESSION — ${regressions.length} out-of-round cells moved. The deletion is NOT safe as sequenced.`,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const mode = process.argv[2] ?? 'before';
  const out = path.join(HERE, '..', 'receipts', `cohort-1-button-shadow-probe-${mode}.json`);
  const snap = snapshot();
  writeFileSync(out, `${JSON.stringify(snap, null, 2)}\n`);
  process.stdout.write(`${mode} snapshot: ${snap.cellsPerVertical} cells per vertical across ${snap.variantsCovered.length} variants x ${STATES.length} states x 2 modes\n`);

  if (mode === 'after') {
    const before = JSON.parse(readFileSync(path.join(HERE, '..', 'receipts', 'cohort-1-button-shadow-probe-before.json'), 'utf8'));
    const result = compare(before, snap);
    writeFileSync(path.join(HERE, '..', 'receipts', 'cohort-1-button-shadow-preservation-verdict.json'), `${JSON.stringify(result, null, 2)}\n`);
    process.stdout.write(`${result.verdict}\n`);
    for (const r of result.regressions.slice(0, 8)) process.stdout.write(`  REGRESSION ${r.vertical} ${r.cell}: ${r.before} -> ${r.after}\n`);
    process.stdout.write(`intended in-round moves: ${result.intendedMoves.length}\n`);
  }
}
