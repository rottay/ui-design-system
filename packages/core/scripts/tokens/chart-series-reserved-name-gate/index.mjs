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
 * ADJUDICATION MODEL (syntactic, not textual)
 * -------------------------------------------
 * The gate never decides from raw text. It parses each candidate file and
 * reports only nodes that are DEFINITION positions for the reserved name:
 *
 *   - CSS  (postcss AST): a declaration whose `prop` IS the reserved name.
 *           `var(--ds-chart-series-3, …)` appearing in a declaration VALUE is a
 *           consumption; comments and strings are not declarations at all.
 *   - TS/TSX (TypeScript AST):
 *           * `PropertyAssignment` / `PropertyDeclaration` whose name is a
 *             reserved string literal or a reserved computed key,
 *           * an assignment whose left-hand side is an element access with a
 *             reserved argument (`vars[`--ds-chart-series-${n}`] = color`),
 *           * `…​.setProperty(<reserved>, …)`.
 *           A bare string literal (metadata, an enum of derived channel names,
 *           a documentation table), a read, a comparison, a JSDoc block or a
 *           `var(` template are NOT definitions and stay green.
 *
 * `source.includes(RESERVED_NAME)` is used ONLY as a lossless prefilter: every
 * classifier below requires literal text (or a template head) that starts with
 * the reserved prefix, so a file without that substring cannot hold a finding.
 * The prefilter never adjudicates.
 *
 * Excluded from the scan (not authored runtime):
 *   - test files and tests/ folders (fixtures may stub tenant scopes)
 *   - generated tenant artifacts (they ARE compiler output)
 * Allowlisted definers (the sanctioned emission path only):
 *   - infrastructure/compilers/kernel/runtime/appearance (the emitter)
 *   - foundation/kernel/color/oklch/chart-series (derives the emitted values)
 *
 * Usage:
 *   node scripts/tokens/chart-series-reserved-name-gate/index.mjs           # report
 *   node scripts/tokens/chart-series-reserved-name-gate/index.mjs --check   # exit 1 on violation
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import ts from 'typescript';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(here);
const srcDir = join(root, 'src');

export const RESERVED_NAME = '--ds-chart-series-';

/** The reserved channel has exactly ten slots. */
const FIRST_SLOT = 1;
const LAST_SLOT = 10;

/** Sanctioned definers of the reserved channel, relative to src/. */
export const DEFINER_ALLOWLIST = [
  // The brand-theme compiler: the canonical `compileTheme` lowering both the
  // static BrandTheme and the DB TenantThemeDocument transports resolve into.
  // The palette authority moved here in dcc65ca34 (2026-08-18) and this list
  // was not updated in the same commit, so the gate flagged the canonical
  // definer while sanctioning the compatibility one.
  'infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
  // The tenant appearance compiler. Still a sanctioned definer, but now as the
  // compatibility projection: `appearanceToVariables()` is documented (same
  // file, above `compileAppearanceVariables`) as the raw projection kept for
  // low-level compiler tests and compatibility consumers.
  //
  // BOTH emit at the tenant root scope, so neither shadows the other the way
  // CHT-03 describes -- the hazard this gate exists for is a definition BELOW
  // the tenant scope (component skin CSS, an inline style key), and that is
  // still zero. The residual duplication is that two call sites now derive the
  // same ten slots with different ground resolution; collapsing them to one
  // definer is an open unification, not something this allowlist decides.
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

/* ------------------------------------------------------------------ */
/* Name classification                                                 */
/* ------------------------------------------------------------------ */

/**
 * True when `text` is a complete, canonical reserved slot name:
 * the reserved prefix followed by a canonical decimal integer in 1..10.
 *
 * Canonical means `String(slot) === suffix`, which rejects `01`, `1.0`,
 * `+1`, `1e1`, ` 1` and the empty suffix without pattern matching.
 */
export function isStaticReservedName(text) {
  if (typeof text !== 'string') return false;
  if (!text.startsWith(RESERVED_NAME)) return false;
  const suffix = text.slice(RESERVED_NAME.length);
  const slot = Number(suffix);
  if (!Number.isInteger(slot)) return false;
  if (slot < FIRST_SLOT || slot > LAST_SLOT) return false;
  return String(slot) === suffix;
}

/** Peel parentheses/assertions so `(x as string)` classifies like `x`. */
function unwrapExpression(node) {
  let current = node;
  while (current) {
    if (
      ts.isParenthesizedExpression(current) ||
      ts.isAsExpression(current) ||
      ts.isNonNullExpression(current) ||
      ts.isTypeAssertionExpression(current) ||
      ts.isSatisfiesExpression(current)
    ) {
      current = current.expression;
      continue;
    }
    return current;
  }
  return current;
}

/**
 * True when the expression names the reserved channel as a KEY:
 *   - a static string / no-substitution template whose text is a reserved slot
 *   - a template whose HEAD is exactly the reserved prefix, i.e. the slot is
 *     interpolated (`` `--ds-chart-series-${n}` ``)
 *
 * A template such as `` `var(--ds-chart-series-${n}, …)` `` has head text
 * `var(--ds-chart-series-` and is therefore a consumption, not a key.
 */
export function isReservedKeyExpression(node) {
  const expression = unwrapExpression(node);
  if (!expression) return false;
  if (ts.isStringLiteralLike(expression)) {
    return isStaticReservedName(expression.text);
  }
  if (ts.isTemplateExpression(expression)) {
    return expression.head.text === RESERVED_NAME;
  }
  return false;
}

/** True when a property NAME node names the reserved channel. */
function isReservedPropertyName(name) {
  if (!name) return false;
  if (ts.isComputedPropertyName(name)) {
    return isReservedKeyExpression(name.expression);
  }
  if (ts.isStringLiteralLike(name)) {
    return isStaticReservedName(name.text);
  }
  return false;
}

/** True for `<anything>.setProperty(...)`. */
function isSetPropertyCall(node) {
  const callee = unwrapExpression(node.expression);
  if (!callee) return false;
  if (ts.isPropertyAccessExpression(callee)) {
    return callee.name.text === 'setProperty';
  }
  if (ts.isElementAccessExpression(callee)) {
    const argument = unwrapExpression(callee.argumentExpression);
    return Boolean(
      argument && ts.isStringLiteralLike(argument) && argument.text === 'setProperty',
    );
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Positions                                                           */
/* ------------------------------------------------------------------ */

/**
 * Build a finding from a character offset in `source`.
 * `line` and `column` are 1-based; `excerpt` is the trimmed source line.
 */
export function findingAtOffset(source, offset) {
  const safeOffset = Math.max(0, Math.min(offset, source.length));
  const lineStart = safeOffset === 0 ? 0 : source.lastIndexOf('\n', safeOffset - 1) + 1;
  const lineEnd = source.indexOf('\n', safeOffset);
  let line = 1;
  for (let index = 0; index < lineStart; index += 1) {
    if (source[index] === '\n') line += 1;
  }
  return {
    line,
    column: safeOffset - lineStart + 1,
    excerpt: source.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim(),
  };
}

/* ------------------------------------------------------------------ */
/* Per-language scanners                                               */
/* ------------------------------------------------------------------ */

function findCssViolations(source) {
  const offsets = [];
  const rootNode = postcss.parse(source, { from: undefined });
  rootNode.walkDecls((decl) => {
    if (!isStaticReservedName(decl.prop)) return;
    const start = decl.source?.start;
    if (!start) return;
    offsets.push(start.offset);
  });
  return offsets;
}

function scriptKindFor(extension) {
  return extension === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

function findTypeScriptViolations(source, extension) {
  const sourceFile = ts.createSourceFile(
    `chart-series-gate${extension}`,
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    scriptKindFor(extension),
  );

  const offsets = new Set();
  const report = (node) => {
    offsets.add(node.getStart(sourceFile));
  };

  const visit = (node) => {
    if (ts.isPropertyAssignment(node) || ts.isPropertyDeclaration(node)) {
      if (isReservedPropertyName(node.name)) report(node.name);
    } else if (ts.isBinaryExpression(node) && ts.isAssignmentExpression(node)) {
      const left = unwrapExpression(node.left);
      if (left && ts.isElementAccessExpression(left)) {
        if (isReservedKeyExpression(left.argumentExpression)) {
          report(left.argumentExpression);
        }
      }
    } else if (ts.isCallExpression(node) && isSetPropertyCall(node)) {
      const first = node.arguments[0];
      if (first && isReservedKeyExpression(first)) report(first);
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
  return [...offsets];
}

/**
 * Find DEFINITIONS of the reserved name in `source`.
 * Returns [{ line, column, excerpt }] sorted by position.
 */
export function findViolations(source, extension) {
  const offsets =
    extension === '.css'
      ? findCssViolations(source)
      : findTypeScriptViolations(source, extension);
  return offsets
    .slice()
    .sort((a, b) => a - b)
    .map((offset) => findingAtOffset(source, offset));
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
    // Lossless prefilter only: every classifier requires the literal prefix.
    if (!source.includes(RESERVED_NAME)) continue;
    let violations;
    try {
      violations = findViolations(source, extension);
    } catch (error) {
      throw new Error(
        `chart-series-reserved-name-gate: failed to parse ${relPath.split(sep).join('/')}: ${error.message}`,
        { cause: error },
      );
    }
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
