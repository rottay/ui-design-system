#!/usr/bin/env node
/**
 * theme-keypath-coverage — every keypath of the Theme is a DECISION, a DERIVED
 * value or a declared INTERNAL, and the three sets are disjoint and total.
 *
 * WHY IT EXISTS. F-06 measured that the tenant document reaches 28 % of the
 * Theme keypaths, that 519 base keypaths have no door at all, and that none of
 * the remainder is declared Internal with an owner. "Customizable" was an
 * undeclared fraction. This gate turns the fraction into a partition: what a
 * tenant decides, what the compiler derives, and what the DS keeps -- with
 * nothing outside the three.
 *
 * IT CANNOT PASS YET, AND IT SAYS SO. The derived set is empty until the
 * derivation lane lands its per-family derivators; until then part of the
 * universe is `uncovered` and this gate is RED. It is registered in the
 * gate manifest as a non-blocking entry with a written reason and an owner --
 * the sanctioned mechanism -- so the blocking matrix stays honest instead of
 * being greened by a vacuous PASS. It never fails open: `uncovered.length > 0`
 * is a failure, always, and the drill beside it proves that.
 *
 * THE UNIVERSE IS MEASURED, NOT DECLARED, AND IT MOVED WITH ITS SUBJECT
 * (D6-2c-ii, 2026-09-15). It used to be the authored keypaths of three shipped
 * `.ts` themes, read with the TypeScript AST. Those themes are retired: a
 * first-party vertical is now the neutral foundation with its preset document
 * admitted through the same door a tenant takes. So the universe is the
 * COMPOSED baselines themselves -- `baselineFor(vertical, vertical)` read flat,
 * the same arm `purity` uses -- which is the same question asked of the theme
 * that actually ships. Measuring the preset DOCUMENTS instead would have been
 * vacuous: a document authors catalog decisions by construction, so every
 * keypath would land in `decision` and the gate would pass without owning
 * anything.
 *
 * WHAT THE MOVE COST, STATED SO IT IS NOT LOST. Against the authored corpus the
 * gate measured 2501 uncovered of 2531. Those keypaths are not owned now; they
 * are GONE, because nothing authors them any more. The capability they carried
 * is the derivation lane's obligation (WO-DER-06/07), not this gate's counter.
 *
 * Reading dist makes it a POST-BUILD gate with a freshness proof, like `purity`
 * and `slot-inventory`: there is one composition door and it is the compiled
 * one, never a second reader of the preset JSON.
 *
 * Run: node scripts/check/theme/keypath-coverage/index.mjs [--check|--json]
 */

import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import { readThemeCatalog } from '../../../libraries/theme-catalog/index.mjs';
import { assertDistFresh } from '../../../package/artifacts/freshness/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/** The published door the composed baseline is read through, and its intake. */
export const BASELINE_MODULE = 'dist/index.js';
export const INTAKE_MODULE =
  'dist/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake/index.js';
// The roster rides its own deep module: the public root no longer re-exports
// FIRST_PARTY_VERTICALS (D6-2c-ii removed the `export *` facade), and a gate
// reads what ships, never a convenience barrel.
export const ROSTER_MODULE = 'dist/foundation/presets/verticals/roster/index.js';

/**
 * Keypath prefixes the DS owns and no tenant may reach, each with its owner.
 *
 * A prefix without a written owner is not an entry: "internal" with nobody
 * accountable is the undeclared remainder this gate exists to abolish.
 */
export const INTERNAL_PREFIXES = Object.freeze([
  { prefix: 'id', owner: 'roster row identity; stamped by resolveTheme, never authored' },
  { prefix: 'name', owner: 'roster row identity; stamped by resolveTheme, never authored' },
  { prefix: 'capabilities', owner: 'the vertical capability catalogue, not a visual value' },
  { prefix: 'appearance', owner: 'roster row identity; the compile door stamps defaultMode from the roster, never a document' },
]);

/**
 * Keypath prefixes a derivator produces. EMPTY until the derivation lane lands:
 * an entry here is a claim that a family deriver writes that subtree, and there
 * is no such deriver yet.
 */
export const DERIVED_PREFIXES = Object.freeze([]);

/** Expands the catalog's `{a,b}` and trailing `*` keypath grammar. */
export function expandKeypath(keypath) {
  if (!keypath) return [];
  const match = /^(.*?)\{([^}]*)\}(.*)$/u.exec(keypath);
  if (match) {
    return match[2]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .flatMap((part) => expandKeypath(`${match[1]}${part}${match[3]}`));
  }
  return [keypath.endsWith('.*') ? keypath.slice(0, -2) : keypath];
}

/** Every keypath a catalog row makes authorable on the static transport. */
export function decisionPrefixes(rows = readThemeCatalog()) {
  return rows.flatMap((row) => expandKeypath(row.keypath?.brandTheme ?? null));
}

/**
 * Every leaf keypath of one flat theme view.
 *
 * An EMPTY object is a leaf: `recipes: {}` is a family the theme declares and
 * leaves unset, and dropping it would shrink the universe by exactly the
 * keypaths nobody has claimed -- the opposite of what this gate measures. A
 * leaf is where the walk stops, not where a value happens to be a scalar.
 */
export function viewKeypaths(value, prefix = '', out = []) {
  if (value === undefined) return out;
  if (value === null || typeof value !== 'object') {
    if (prefix) out.push(prefix);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => viewKeypaths(item, `${prefix}[${index}]`, out));
    return out;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) {
    if (prefix) out.push(prefix);
    return out;
  }
  for (const key of keys) viewKeypaths(value[key], prefix ? `${prefix}.${key}` : key, out);
  return out;
}

/** The union of the first-party baselines' keypaths, sorted and deduplicated. */
export function themeKeypathUniverse(views) {
  if (!Array.isArray(views) || views.length === 0) return [];
  return [...new Set(views.flatMap((view) => viewKeypaths(view)))].sort();
}

/**
 * The composed first-party baselines, read from `dist/` under a freshness
 * proof -- the same arm `purity` loads, for the same reason: there is one
 * composition door, and reading the preset JSON here would be a second one.
 */
const importByUrl = (specifier) => import(specifier);

export async function loadFirstPartyViews({
  coreRoot = CORE_ROOT,
  importModule = importByUrl,
} = {}) {
  const freshness = assertDistFresh({
    packageRoot: coreRoot,
    stampPath: join(coreRoot, 'dist/build-stamp.json'),
  });
  if (!freshness?.ok) {
    throw new Error(
      'theme-keypath-coverage: dist/ is stale or its freshness is unproven:\n  '
        + `${(freshness?.failures ?? ['the freshness proof returned nothing']).join('\n  ')}`,
    );
  }
  const { baselineFor } = await importModule(pathToFileURL(join(coreRoot, BASELINE_MODULE)).href);
  const { readGovernedTheme } = await importModule(
    pathToFileURL(join(coreRoot, INTAKE_MODULE)).href,
  );
  const { FIRST_PARTY_VERTICALS } = await importModule(
    pathToFileURL(join(coreRoot, ROSTER_MODULE)).href,
  );
  const verticals = Object.keys(FIRST_PARTY_VERTICALS ?? {});
  if (verticals.length === 0) {
    throw new Error('theme-keypath-coverage: the roster declares no first-party vertical');
  }
  return Object.fromEntries(
    verticals.map((vertical) => [vertical, readGovernedTheme(baselineFor(vertical, vertical))]),
  );
}


const under = (keypath, prefixes) =>
  prefixes.some((prefix) => keypath === prefix || keypath.startsWith(`${prefix}.`));

/**
 * The partition. A keypath is classified by exactly one set; membership in two
 * is reported as an overlap and is a failure in its own right, because a
 * keypath with two owners has none.
 */
export function partition({
  universe = [],
  decision = decisionPrefixes(),
  derived = DERIVED_PREFIXES.map((entry) => entry.prefix),
  internal = INTERNAL_PREFIXES.map((entry) => entry.prefix),
} = {}) {
  const sets = { decision: [], derived: [], internal: [] };
  const uncovered = [];
  const overlaps = [];
  for (const keypath of universe) {
    const hits = [];
    if (under(keypath, decision)) hits.push('decision');
    if (under(keypath, derived)) hits.push('derived');
    if (under(keypath, internal)) hits.push('internal');
    if (hits.length > 1) {
      overlaps.push(`${keypath}: claimed by ${hits.join(' and ')}`);
      continue;
    }
    if (hits.length === 0) {
      uncovered.push(keypath);
      continue;
    }
    sets[hits[0]].push(keypath);
  }
  return { universe, sets, uncovered, overlaps };
}

export function collectFindings(input = {}) {
  const result = partition(input);
  const findings = [];
  if (result.universe.length === 0) {
    findings.push('theme-keypath-coverage: the keypath universe is EMPTY — the reader stopped reading');
  }
  for (const overlap of result.overlaps) {
    findings.push(`theme-keypath-coverage: ${overlap}; the three sets must be disjoint`);
  }
  if (result.uncovered.length > 0) {
    findings.push(
      `theme-keypath-coverage: ${result.uncovered.length} of ${result.universe.length} Theme keypaths are `
        + 'in no set; every one must be a decision, a derived value or a declared internal '
        + `(first: ${result.uncovered.slice(0, 5).join(', ')})`,
    );
  }
  return { findings, result };
}

/** The live measurement: load the composed baselines, then partition them. */
export async function measure({ coreRoot = CORE_ROOT, importModule } = {}) {
  const views = await loadFirstPartyViews({ coreRoot, importModule });
  return collectFindings({ universe: themeKeypathUniverse(Object.values(views)) });
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

/* `main()` rather than a top-level await: this module is imported by readers
 * that do not support top-level await, and a CLI guard must never decide that. */
async function main() {
  const { findings, result } = await measure();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ findings, counts: {
      universe: result.universe.length,
      decision: result.sets.decision.length,
      derived: result.sets.derived.length,
      internal: result.sets.internal.length,
      uncovered: result.uncovered.length,
    } }, null, 2));
  } else {
    console.log(
      `theme-keypath-coverage: ${result.universe.length} keypaths — `
        + `${result.sets.decision.length} decision, ${result.sets.derived.length} derived, `
        + `${result.sets.internal.length} internal, ${result.uncovered.length} uncovered`,
    );
    for (const finding of findings) console.error(finding);
  }
  process.exit(findings.length > 0 ? 1 : 0);
}

if (invokedDirectly) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`theme-keypath-coverage: ${message}`);
    process.exit(1);
  });
}
