#!/usr/bin/env node
/**
 * chart-series-reserved-name-gate — W5 palette-seam law (design section 1.8).
 *
 * `--ds-chart-series-1..10` is the generated tenant palette channel: the
 * tenant appearance compiler is its ONLY definer. Any other definition inside
 * the design-system runtime (a CSS declaration, an inline style key, an
 * emitted variable map) sits closer to the marks than the tenant scope and
 * silently shadows the generated palette — the CHT-03 hazard this wave
 * removed. Runtime code may only CONSUME the channel through `var(...)`
 * fallback chains.
 *
 * The gate scans authored runtime sources under src/ and fails on any
 * occurrence of the reserved name that is not a `var(` consumption:
 *   - CSS:    `--ds-chart-series-3: <value>` declarations
 *   - TS/TSX: `'--ds-chart-series-3': value` style keys, template-built
 *             assignments such as `vars[`--ds-chart-series-${n}`] = color`
 *
 * Excluded from the scan (not authored runtime):
 *   - test files and tests/ folders (fixtures may stub tenant scopes)
 *   - generated tenant artifacts (they ARE compiler output)
 * Allowlisted definers (the sanctioned emission path only):
 *   - infrastructure/compilers/kernel/runtime/appearance (the emitter)
 *   - foundation/kernel/color/oklch/chart-series (derives the emitted values)
 *
 * Usage:
 *   node scripts/chart-series-reserved-name-gate.mjs           # report
 *   node scripts/chart-series-reserved-name-gate.mjs --check   # exit 1 on violation
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const srcDir = join(root, 'src');

export const RESERVED_NAME = '--ds-chart-series-';

/** Sanctioned definers of the reserved channel, relative to src/. */
export const DEFINER_ALLOWLIST = [
  // The tenant appearance compiler: THE emission point for generated palettes.
  'infrastructure/compilers/kernel/runtime/appearance/index.ts',
  // Derives the ten emitted slot colors for the compiler; names the channel
  // in its documentation and derivation API.
  'foundation/kernel/color/oklch/chart-series/index.ts',
];

/** Generated outputs living under src/ that the compiler owns. */
const GENERATED_PREFIXES = [
  'foundation/tokens/css/facade/artifacts/',
];

const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.css']);

function isTestPath(relPath) {
  return (
    relPath.split(sep).includes('tests') ||
    /\.test\.[cm]?[jt]sx?$/.test(relPath) ||
    /\.spec\.[cm]?[jt]sx?$/.test(relPath)
  );
}

function isExcluded(relPath) {
  const posix = relPath.split(sep).join('/');
  if (isTestPath(relPath)) return true;
  return GENERATED_PREFIXES.some((prefix) => posix.startsWith(prefix));
}

function isAllowlisted(relPath) {
  const posix = relPath.split(sep).join('/');
  return DEFINER_ALLOWLIST.includes(posix);
}

/** Strip block comments and line comments so prose mentions never flag. */
export function stripComments(source, extension) {
  let out = source.replace(/\/\*[\s\S]*?\*\//g, (match) =>
    match.replace(/[^\n]/g, ' '),
  );
  if (extension !== '.css') {
    // Line comments: good enough for this codebase's authored sources; a `//`
    // inside a string literal (a URL) cannot contain the reserved name in a
    // definition position anyway — a false NEGATIVE there is impossible
    // because URLs are not custom-property definitions.
    out = out.replace(/(^|[^:])\/\/[^\n]*/gm, (match, lead) =>
      `${lead}${' '.repeat(match.length - lead.length)}`,
    );
  }
  return out;
}

/**
 * Find reserved-name occurrences that are not `var(` consumptions.
 * Returns [{ line, column, excerpt }].
 */
export function findViolations(source, extension) {
  const stripped = stripComments(source, extension);
  const violations = [];
  const pattern = /--ds-chart-series-(?:\d+|\$\{)/g;
  for (const match of stripped.matchAll(pattern)) {
    const index = match.index ?? 0;
    const before = stripped.slice(Math.max(0, index - 4), index);
    if (before === 'var(') continue;
    const lineStart = stripped.lastIndexOf('\n', index - 1) + 1;
    const lineEnd = stripped.indexOf('\n', index);
    const line = stripped.slice(0, index).split('\n').length;
    violations.push({
      line,
      column: index - lineStart + 1,
      excerpt: stripped.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim(),
    });
  }
  return violations;
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      yield* walk(full);
    } else if (stats.isFile()) {
      yield full;
    }
  }
}

export function runGate() {
  const findings = [];
  let scanned = 0;
  let allowlistedHits = 0;

  for (const file of walk(srcDir)) {
    const extension = file.slice(file.lastIndexOf('.'));
    if (!SCANNED_EXTENSIONS.has(extension)) continue;
    const relPath = relative(srcDir, file);
    if (isExcluded(relPath)) continue;
    scanned += 1;
    const source = readFileSync(file, 'utf8');
    if (!source.includes(RESERVED_NAME)) continue;
    const violations = findViolations(source, extension);
    if (violations.length === 0) continue;
    if (isAllowlisted(relPath)) {
      allowlistedHits += violations.length;
      continue;
    }
    for (const violation of violations) {
      findings.push({ file: relPath.split(sep).join('/'), ...violation });
    }
  }

  return { findings, scanned, allowlistedHits };
}

function main() {
  const check = process.argv.includes('--check');
  const { findings, scanned, allowlistedHits } = runGate();

  console.log('chart-series-reserved-name-gate');
  console.log(`  files scanned: ${scanned}`);
  console.log(`  allowlisted definer occurrences: ${allowlistedHits}`);
  console.log(`  violations: ${findings.length}`);

  for (const finding of findings) {
    console.log(
      `  VIOLATION ${finding.file}:${finding.line}:${finding.column}  ${finding.excerpt}`,
    );
  }

  if (findings.length > 0) {
    console.log(
      '\n  The DS runtime must never DEFINE --ds-chart-series-N; consume it',
    );
    console.log(
      '  through the resolveChartSeriesPaint() chain or the --ds-chart-paint-N bridge.',
    );
    if (check) process.exit(1);
  }
}

const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
