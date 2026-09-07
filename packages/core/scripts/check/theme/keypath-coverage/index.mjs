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
 * derivation lane lands its per-family derivators; until then the vast majority
 * of the universe is `uncovered` and this gate is RED. It is registered in the
 * gate manifest as a non-blocking entry with a written reason and an owner --
 * the sanctioned mechanism -- so the blocking matrix stays honest instead of
 * being greened by a vacuous PASS. It never fails open: `uncovered.length > 0`
 * is a failure, always, and the drill beside it proves that.
 *
 * THE UNIVERSE IS MEASURED, NOT DECLARED. It is every authored keypath of the
 * three shipped first-party themes, read from source with the TypeScript AST.
 * A keypath a theme really authors is a keypath somebody has to own.
 *
 * Run: node scripts/check/theme/keypath-coverage/index.mjs [--check|--json]
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import { readThemeCatalog } from '../../../libraries/theme-catalog/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

export const THEME_SOURCES = Object.freeze([
  'src/foundation/tokens/ts/presentation/brand-themes/rottay/index.ts',
  'src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts',
  'src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts',
]);

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

function unwrapExpression(node) {
  let current = node;
  while (
    current
    && (ts.isAsExpression(current)
      || (ts.isSatisfiesExpression?.(current) ?? false)
      || ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

/**
 * A shipped theme is assembled from file-local consts (`palette: PALETTE`), so
 * a reader that stopped at the identifier would measure a universe of 13 and
 * call the tree covered. References are resolved through the file's own
 * top-level bindings; `seen` stops a cyclic one from looping.
 */
function literalKeypaths(node, source, prefix, out, bindings, seen = new Set()) {
  const current = unwrapExpression(node);
  if (!current) return;
  if (ts.isObjectLiteralExpression(current)) {
    for (const property of current.properties) {
      const next = prefix
        ? `${prefix}.${propertyKey(property, source)}`
        : propertyKey(property, source);
      if (ts.isPropertyAssignment(property)) {
        literalKeypaths(property.initializer, source, next, out, bindings, seen);
      } else if (ts.isShorthandPropertyAssignment(property)) {
        literalKeypaths(property.name, source, next, out, bindings, seen);
      } else if (ts.isSpreadAssignment(property)) {
        literalKeypaths(property.expression, source, prefix, out, bindings, seen);
      }
    }
    return;
  }
  if (ts.isIdentifier(current)) {
    const bound = bindings.get(current.text);
    if (bound && !seen.has(current.text)) {
      literalKeypaths(bound, source, prefix, out, bindings, new Set([...seen, current.text]));
      return;
    }
  }
  if (prefix) out.add(prefix);
}

function propertyKey(property, source) {
  if (ts.isSpreadAssignment(property)) return '';
  const name = property.name;
  if (!name) return '';
  if (ts.isComputedPropertyName(name)) return '*';
  return name.getText(source).replace(/['"]/g, '');
}

/** Every keypath the three shipped themes author, measured from source. */
export function themeKeypathUniverse(coreRoot = CORE_ROOT) {
  const out = new Set();
  for (const relative of THEME_SOURCES) {
    const pathname = join(coreRoot, relative);
    const source = ts.createSourceFile(
      pathname,
      readFileSync(pathname, 'utf8'),
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS,
    );
    const bindings = new Map();
    const collectBindings = (node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        bindings.set(node.name.text, node.initializer);
      }
      ts.forEachChild(node, collectBindings);
    };
    collectBindings(source);

    const visit = (node) => {
      if (
        ts.isVariableDeclaration(node)
        && ts.isIdentifier(node.name)
        && /BrandTheme$/u.test(node.name.text)
      ) {
        const expression = unwrapExpression(node.initializer);
        if (expression && ts.isObjectLiteralExpression(expression)) {
          literalKeypaths(expression, source, '', out, bindings);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return [...out].sort();
}

const under = (keypath, prefixes) =>
  prefixes.some((prefix) => keypath === prefix || keypath.startsWith(`${prefix}.`));

/**
 * The partition. A keypath is classified by exactly one set; membership in two
 * is reported as an overlap and is a failure in its own right, because a
 * keypath with two owners has none.
 */
export function partition({
  universe = themeKeypathUniverse(),
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

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (invokedDirectly) {
  const { findings, result } = collectFindings();
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
