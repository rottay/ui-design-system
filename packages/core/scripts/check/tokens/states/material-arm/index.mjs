#!/usr/bin/env node
/**
 * state-material-arm — a component state channel must resolve through the
 * material vocabulary, not through a colour someone picked per component.
 *
 * F-10 measured what the alternative costs: 488 hand-authored state channels,
 * material coverage of 0 %, 3 % and 92 % across the three artifacts, and a
 * product where changing the hover meant editing ~370 channels per component.
 * The material roots are the state authority (`derivation/materials`), the
 * deltas behind them are the `states.emphasis` decision
 * (`derivation/states`), and this gate is what keeps a new component channel
 * from re-opening the same hole.
 *
 * THE POPULATION IS DEFINED BY RULE, NOT BY A LIST. A row is in scope when it
 * is a ROOT-SCOPE declaration of a component state channel whose facet/state
 * pair exists in the material vocabulary. Four exclusions, each because a
 * material root cannot express the value, never because a particular file was
 * inconvenient:
 *
 *   tone-scoped        the channel names a tone, or its value reaches a tone
 *                      ramp. A tone state is derived from the ramp, and
 *                      painting a neutral surface over it would be wrong.
 *   structural         `transparent`, `none`, `currentColor`, `inherit`,
 *                      `initial`, `unset`: an absence of paint has no material.
 *   family-governed    the family's ground is owned by another catalog control
 *                      (`--ds-sidebar-*` <- `navigation.sidebar-tone`).
 *   governed-alias     the value is a `var()` to a sibling channel of the same
 *                      component that is itself governed; the arm is one
 *                      indirection away, not missing.
 *
 * Scoped (non-root) declarations are a local restatement, not the root
 * authority this gate is about, and are reported separately.
 *
 * DECREASE-ONLY, WITH A FLOOR. `baseline/index.json` pins today's ungoverned
 * count and the governed ratio may never fall below `ratioFloor`. The floor
 * is a PROVISIONAL, self-pinned value: F-10's own closure criterion is
 * `skins.stateGoverned >= 80 %`, measured on the Modern-skin population,
 * which is not this gate's population, so 0.85 here is this lane's choice
 * pending an owner decision -- not F-10's threshold. (Re-labelled per the K3
 * audit HOLD of WO-DER-02, 2026-09-08, WIP-02 adjudication.) Both clauses
 * bite; the drill proves it.
 *
 * Usage:
 *   node scripts/check/tokens/states/material-arm/index.mjs [--quiet] [--json]
 *
 * Exit codes: 0 = at or below baseline and at or above the floor · 1 = worse.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/** The authored stylesheet roots. Generated artifacts are outputs, not authors. */
export const AUTHORED_ROOTS = Object.freeze([
  'src/foundation/tokens/css',
  'src/components',
]);

/**
 * Generated trees and the two frozen engines. Classic and Rustic are read-only
 * by owner decision (2026-09-05); their paint is not debt this lane lowers.
 */
const EXCLUDED = /(?:^|\/)(?:facade\/artifacts|generated|dist|node_modules|__snapshots__|tests|fixtures|stories)(?:\/|$)|\/engines\/(?:classic|rustic)\//u;

/** The four interaction states the material vocabulary names. */
export const STATES = Object.freeze(['hover', 'active', 'selected', 'disabled']);

/** Root families. A `--ds-color-bg-hover` is a palette head, not a component. */
const ROOT_FAMILIES = new Set([
  'color', 'surface', 'material', 'state', 'shadow', 'elevation', 'focus',
  'overlay', 'tint', 'gradient', 'glass', 'radius', 'spacing', 'motion',
  'wash', 'scrim', 'ring', 'border', 'text', 'font', 'type', 'density',
  'rhythm', 'z',
]);

/** Which facet/state pairs the 71 material roots actually carry. */
export const MATERIAL_VOCABULARY = Object.freeze({
  background: Object.freeze(['hover', 'active', 'selected', 'disabled']),
  border: Object.freeze(['hover', 'active', 'selected', 'disabled']),
  shadow: Object.freeze(['hover', 'active', 'selected']),
  foreground: Object.freeze(['disabled']),
});

const TONE_SEGMENTS = new Set([
  'primary', 'secondary', 'success', 'warning', 'error', 'danger', 'info',
  'ai', 'link', 'accent', 'critical', 'brand',
]);

const TONE_VALUE =
  /var\(\s*--ds-color-(?:primary|secondary|accent|success|warning|error|info|link)(?=[-),])/u;

const STRUCTURAL = /^(?:transparent|none|inherit|currentColor|initial|unset|revert)$/iu;

/** Families whose ground another catalog control owns, with the control named. */
export const FAMILY_GOVERNED = Object.freeze({
  sidebar: 'navigation.sidebar-tone',
});

const ROOT_SELECTOR = /(?:^|,)\s*(?::root|html|\[data-ds-root\]|:where\(\s*:root)/u;

const MATERIAL_ARM = /var\(\s*--ds-material-/u;

/** The facet a channel name states, and the state it is in. */
export function classify(name) {
  if (!name.startsWith('--ds-')) return null;
  const parts = name.slice(5).split('-');
  if (ROOT_FAMILIES.has(parts[0])) return null;
  let index = -1;
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (STATES.includes(parts[i])) { index = i; break; }
  }
  if (index < 0) return null;
  const state = parts[index];
  const rest = parts.slice(0, index).concat(parts.slice(index + 1));
  const tail = rest[rest.length - 1];
  const tail2 = rest.slice(-2).join('-');
  let facet = null;
  if (tail2 === 'background-color' || tail === 'bg' || tail === 'background') facet = 'background';
  else if (tail2 === 'border-color' || tail === 'border') facet = 'border';
  else if (tail === 'color' || tail === 'fg' || tail === 'foreground') facet = 'foreground';
  else if (tail === 'shadow') facet = 'shadow';
  if (facet === null) return null;
  return { facet, state, family: rest[0], segments: rest };
}

/** Every custom-property declaration, with the selector stack that holds it. */
export function readDeclarations(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const stack = [];
  let buffer = '';
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (char === '(') {
      let depth = 0;
      const start = index;
      for (; index < source.length; index += 1) {
        if (source[index] === '(') depth += 1;
        else if (source[index] === ')') {
          depth -= 1;
          if (depth === 0) { index += 1; break; }
        }
      }
      buffer += source.slice(start, index);
      continue;
    }
    if (char === '{') { stack.push(buffer.trim().replace(/\s+/g, ' ')); buffer = ''; index += 1; continue; }
    if (char === '}') { stack.pop(); buffer = ''; index += 1; continue; }
    if (char === ';') {
      const match = /^\s*(--ds-[a-z0-9-]+)\s*:([\s\S]*)$/u.exec(buffer);
      if (match) {
        out.push({
          name: match[1],
          value: match[2].trim().replace(/\s+/g, ' '),
          selector: stack[stack.length - 1] ?? '',
        });
      }
      buffer = '';
      index += 1;
      continue;
    }
    buffer += char;
    index += 1;
  }
  return out;
}

function stylesheets(root) {
  const files = [];
  const walk = (dir) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const posix = full.split(sep).join('/');
      if (EXCLUDED.test(`${posix}/`)) continue;
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.css')) files.push(full);
    }
  };
  for (const authored of AUTHORED_ROOTS) walk(join(root, authored));
  return files.sort();
}

/**
 * Measure the corpus.
 *
 * Two passes: the first learns which channels ARE governed, so the second can
 * recognise a value that aliases a governed sibling of the same component
 * instead of counting the indirection as a missing arm.
 */
export function measure({ root = CORE_ROOT } = {}) {
  const files = stylesheets(root);
  const governedNames = new Set();
  const parsed = [];
  for (const file of files) {
    const declarations = readDeclarations(readFileSync(file, 'utf8'));
    parsed.push({ file, declarations });
    for (const declaration of declarations) {
      if (MATERIAL_ARM.test(declaration.value)) governedNames.add(declaration.name);
    }
  }

  const rows = [];
  const scoped = [];
  const excluded = { tone: 0, structural: 0, familyGoverned: 0, outsideVocabulary: 0 };
  for (const { file, declarations } of parsed) {
    for (const declaration of declarations) {
      const shape = classify(declaration.name);
      if (shape === null) continue;
      if (!MATERIAL_VOCABULARY[shape.facet].includes(shape.state)) {
        excluded.outsideVocabulary += 1;
        continue;
      }
      if (Object.hasOwn(FAMILY_GOVERNED, shape.family)) { excluded.familyGoverned += 1; continue; }
      if (STRUCTURAL.test(declaration.value)) { excluded.structural += 1; continue; }
      if (shape.segments.some((segment) => TONE_SEGMENTS.has(segment))
        || TONE_VALUE.test(declaration.value)) {
        excluded.tone += 1;
        continue;
      }
      const row = {
        file: relative(root, file).split(sep).join('/'),
        name: declaration.name,
        facet: shape.facet,
        state: shape.state,
        family: shape.family,
        value: declaration.value,
      };
      if (!ROOT_SELECTOR.test(declaration.selector)) { scoped.push(row); continue; }
      const alias = /^var\(\s*(--ds-[a-z0-9-]+)/u.exec(declaration.value);
      row.governed = MATERIAL_ARM.test(declaration.value)
        || (alias !== null && governedNames.has(alias[1]));
      rows.push(row);
    }
  }

  const governed = rows.filter((row) => row.governed);
  const ungoverned = rows.filter((row) => !row.governed);
  const families = new Set(rows.map((row) => row.family));
  const governedFamilies = new Set(governed.map((row) => row.family));
  return {
    corpus: files.length,
    population: rows.length,
    governed: governed.length,
    ungoverned: ungoverned.length,
    ratio: rows.length === 0 ? 1 : governed.length / rows.length,
    families: families.size,
    governedFamilies: governedFamilies.size,
    excluded,
    scoped: scoped.length,
    rows: ungoverned,
    governedRows: governed,
  };
}

export const BASELINE_PATH = join(HERE, 'baseline/index.json');

/** A corpus that shrank to nothing is a gate that stopped looking. */
export const CORPUS_FLOOR = 300;

export function runGate({ root = CORE_ROOT, baseline, quiet = false, json = false } = {}) {
  const pinned = baseline ?? JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const report = measure({ root });
  const failures = [];
  if (report.corpus < (pinned.corpusFloor ?? CORPUS_FLOOR)) {
    failures.push(
      `corpus collapsed to ${report.corpus} stylesheets (floor ${pinned.corpusFloor ?? CORPUS_FLOOR}): the gate is looking where the CSS is not`,
    );
  }
  if (report.ungoverned > pinned.ungoverned) {
    failures.push(
      `${report.ungoverned} component state channels declare no material arm; the baseline is ${pinned.ungoverned} and this ratchet is decrease-only`,
    );
  }
  if (report.ratio < pinned.ratioFloor) {
    failures.push(
      `${(report.ratio * 100).toFixed(1)} % of the population resolves through the material vocabulary; the floor is ${(pinned.ratioFloor * 100).toFixed(1)} %`,
    );
  }
  if (json) console.log(JSON.stringify(report, null, 2));
  else if (!quiet || failures.length > 0) {
    console.log(
      `state-material-arm: ${report.governed}/${report.population} governed `
      + `(${(report.ratio * 100).toFixed(1)} %), ${report.ungoverned} ungoverned, `
      + `${report.governedFamilies}/${report.families} families, `
      + `${report.corpus} stylesheets, ${report.scoped} scoped restatements`,
    );
  }
  for (const failure of failures) console.error(`  FAIL ${failure}`);
  if (failures.length > 0 && !json) {
    for (const row of report.rows.slice(0, 40)) {
      console.error(`    ${row.file}: ${row.name}: ${row.value.slice(0, 70)}`);
    }
  }
  return { report, failures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { failures } = runGate({
    quiet: process.argv.includes('--quiet'),
    json: process.argv.includes('--json'),
  });
  process.exit(failures.length > 0 ? 1 : 0);
}
