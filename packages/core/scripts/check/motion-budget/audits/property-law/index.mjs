#!/usr/bin/env node

/**
 * property-law (Arm B) — the CSS half of "transform / opacity / clip-path only".
 *
 * WHY A SECOND ARM. ESLint parses JS/TS ASTs; a `.css` file is not lintable by
 * it. `@rottay/no-layout-property-animation` (Arm A) therefore cannot see a
 * single one of the real CSS sites, and the existing
 * `motion.compositorOnlyViolations` ratchet is scoped to modern-engine TSX and
 * stays green no matter how much CSS debt accrues. Without this arm the law's
 * acceptance clause is satisfiable by a rule that reads none of its own corpus.
 *
 * WHY THE DEFINITION IS FROZEN IN THE BASELINE, AND THE GRAMMAR FIRST. Measured
 * on this corpus, with this counting unit: the continuation-aware declaration
 * grammar reads 68 sites where a single-line-anchored one reads 11, so the GRAMMAR
 * term is worth 57; widening the engine audit's 14-token kebab list to the logical
 * / grid / flex properties this tree animates is worth 38 (30 -> 68). Both terms
 * are load-bearing here, and the grammar is the larger, so the grammar is frozen
 * before the count and the token list is frozen in the same file. A count seeded
 * against either definition left open could be moved by most of its population
 * with a one-line change and no CSS touched anywhere. `baseline/index.json` therefore
 * carries the grammar, the token list, the alias map and both term weights beside
 * the sites; this module refuses a baseline that declares a different grammar or
 * token list; and the roster carries a corpus floor, because a scanner that stops
 * walking reports zero findings and looks like a drained tree.
 *
 * Decrease-only: a finding not in the baseline fails, and a baseline entry with
 * no live finding fails as stale. `--seed` writes the roster ONCE, on an empty
 * baseline, and refuses afterwards: absorbing a deviation is an adjudication.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../..');
const BASELINE_PATH = join(HERE, 'baseline/index.json');

/**
 * THE FROZEN GRAMMAR, version 1. Continuation-aware: a declaration runs from the
 * property name to the terminating `;` or `}`, across newlines, which is the term
 * that moves this population by 16 against a single-line-anchored scan.
 */
export const GRAMMAR = Object.freeze({
  version: 1,
  stripComments: true,
  declaration: 'from a `transition` or `transition-property` property name to the next `;` or `}`, newlines included',
  declarationPattern: String.raw`(?:^|[\s;{])(transition(?:-property)?)\s*:([^;}]*)`,
  segments: 'the value is split on commas at depth 0 (a comma inside var()/cubic-bezier() does not split)',
  reported: 'the FIRST token of a segment when it is a layout property or `all`; plus any segment reading a pre-composed --ds-transition-* alias whose expansion declares a layout property',
});

/** MIRROR of `src/entrypoints/eslint/rules/no-layout-property-animation`. */
export const LAYOUT_PROPERTY_TOKENS = Object.freeze([
  'top', 'right', 'bottom', 'left',
  'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
  'inset-inline', 'inset-inline-start', 'inset-inline-end',
  'width', 'height',
  'min-width', 'max-width', 'min-height', 'max-height',
  'inline-size', 'block-size',
  'min-inline-size', 'max-inline-size', 'min-block-size', 'max-block-size',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-block-start', 'margin-block-end',
  'margin-inline', 'margin-inline-start', 'margin-inline-end',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-block-start', 'padding-block-end',
  'padding-inline', 'padding-inline-start', 'padding-inline-end',
  'gap', 'row-gap', 'column-gap',
  'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
  'flex', 'flex-basis', 'order',
  'columns', 'column-width',
  'border-width', 'border-top-width', 'border-right-width',
  'border-bottom-width', 'border-left-width',
  'font-size', 'line-height',
]);

export const LAYOUT_ALIASES = Object.freeze([
  '--ds-transition-rearrange',
  '--ds-transition-resize',
  '--ds-transition-all',
]);

const SCAN_ROOTS = Object.freeze(['src/foundation/tokens/css']);
/** Frozen engines are not linted by either arm; artifacts are generated snapshots. */
const EXCLUDED = Object.freeze([
  'engines/classic/',
  'engines/rustic/',
  'facade/artifacts/',
]);

function cssFiles(root) {
  const absolute = join(PACKAGE_ROOT, root);
  const found = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.css')) found.push(path);
    }
  };
  if (statSync(absolute).isDirectory()) walk(absolute);
  return found.filter((path) => {
    const relativePath = relative(PACKAGE_ROOT, path).replaceAll('\\', '/');
    return !EXCLUDED.some((fragment) => relativePath.includes(fragment));
  });
}

/** Blanks comments in place, so every byte offset still maps to its own line. */
function blankComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
}

/** Splits a value on depth-0 commas, so `var(--a, b)` stays one segment. */
export function splitSegments(value) {
  const segments = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      segments.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  segments.push(current);
  return segments;
}

function firstToken(segment) {
  return segment.trim().split(/[\s(]/)[0] ?? '';
}

/** Every site in one declaration value, by the frozen grammar. */
export function sitesInValue(value) {
  const found = [];
  for (const segment of splitSegments(value)) {
    const alias = LAYOUT_ALIASES.find((candidate) => segment.includes(candidate));
    if (alias !== undefined) {
      found.push({ kind: 'layoutAlias', property: alias });
      continue;
    }
    const token = firstToken(segment);
    if (token === 'all') found.push({ kind: 'transitionAll', property: 'all' });
    else if (LAYOUT_PROPERTY_TOKENS.includes(token)) found.push({ kind: 'layoutProperty', property: token });
  }
  return found;
}

export function scan() {
  const declarationRe = new RegExp(GRAMMAR.declarationPattern, 'g');
  const sites = [];
  let files = 0;
  for (const root of SCAN_ROOTS) {
    for (const path of cssFiles(root)) {
      files += 1;
      const relativePath = relative(PACKAGE_ROOT, path).replaceAll('\\', '/');
      const css = GRAMMAR.stripComments ? blankComments(readFileSync(path, 'utf8')) : readFileSync(path, 'utf8');
      declarationRe.lastIndex = 0;
      for (const match of css.matchAll(declarationRe)) {
        const line = css.slice(0, match.index ?? 0).split('\n').length;
        for (const site of sitesInValue(match[2] ?? '')) {
          sites.push({ file: relativePath, line, ...site });
        }
      }
    }
  }
  sites.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line
    || left.property.localeCompare(right.property));
  return { files, sites };
}

const key = (site) => `${site.file}:${site.line}:${site.kind}:${site.property}`;

export function audit(baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))) {
  const { files, sites } = scan();
  const problems = [];

  if (baseline.grammar?.version !== GRAMMAR.version
    || baseline.grammar?.declarationPattern !== GRAMMAR.declarationPattern) {
    problems.push('the baseline does not declare the grammar this scan is running; freeze the grammar before the count');
  }
  if (JSON.stringify(baseline.layoutPropertyTokens) !== JSON.stringify([...LAYOUT_PROPERTY_TOKENS])) {
    problems.push('the baseline token list differs from the scanner token list');
  }
  if (files < (baseline.corpus?.floorFiles ?? 0)) {
    problems.push(
      `the scan reached ${files} stylesheets, below the corpus floor ${baseline.corpus.floorFiles}: `
      + 'a scanner that stopped walking reports zero findings and looks like a drained tree',
    );
  }

  const baselined = new Set((baseline.sites ?? []).map(key));
  const live = new Set(sites.map(key));
  for (const site of sites) {
    if (!baselined.has(key(site))) {
      problems.push(`NEW ${site.kind} site: ${site.file}:${site.line} (${site.property})`);
    }
  }
  for (const site of baseline.sites ?? []) {
    if (!live.has(key(site))) {
      problems.push(`STALE baseline entry (drained or moved -- update the roster): ${key(site)}`);
    }
  }
  return { files, sites, problems };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--seed')) {
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
    if ((baseline.sites ?? []).length > 0) {
      console.error('property-law: the roster is already seeded; absorbing a deviation is an adjudication, not a regeneration.');
      process.exit(1);
    }
    const { files, sites } = scan();
    const byKind = {};
    for (const site of sites) byKind[site.kind] = (byKind[site.kind] ?? 0) + 1;
    const seeded = {
      ...baseline,
      grammar: GRAMMAR,
      layoutPropertyTokens: [...LAYOUT_PROPERTY_TOKENS],
      layoutAliases: [...LAYOUT_ALIASES],
      scanRoots: [...SCAN_ROOTS],
      excluded: [...EXCLUDED],
      corpus: { files, floorFiles: files },
      counts: { total: sites.length, byKind },
      sites,
    };
    writeFileSync(BASELINE_PATH, `${JSON.stringify(seeded, null, 2)}\n`, 'utf8');
    console.log(`property-law: seeded ${sites.length} site(s) across ${files} stylesheet(s).`);
    return;
  }

  const { files, sites, problems } = audit();
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ files, sites, problems }, null, 2));
  }
  console.log(`property-law | stylesheets=${files} | sites=${sites.length} | problems=${problems.length}`);
  if (problems.length > 0) {
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log('property-law: passed (no new layout-property animation in the token tree).');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
