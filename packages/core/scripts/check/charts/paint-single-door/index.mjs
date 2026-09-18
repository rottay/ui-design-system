#!/usr/bin/env node
/**
 * chart-paint-single-door — one owner decides a chart's paint.
 *
 * A chart's colour comes from one place: the paint resolver, which consumes
 * the canonical `category > series > scheme-channel > literal` chain. Three
 * habits break that, and each is a rule here:
 *
 *   A  paint-expression-outside-resolver
 *      A `var(--ds-chart-category-…)` or `var(--ds-chart-paint-…)` expression
 *      BUILT in TypeScript anywhere but the resolver and the grammar it wraps.
 *      A second place that assembles the chain is a second chain.
 *   B  hand-written-paint-modulus
 *      A `%` applied to a palette- or colors-named binding. Seven differently
 *      named helpers used to compute the same slot index; `slotIndexFor` is
 *      the one place it is computed now.
 *   C  hand-stamped-series-index
 *      A `data-series-index={…}` whose expression does not call
 *      `slotIndexFor`, or which computes its own modulus. The attribute is
 *      the PAINT SLOT and nothing else; a family's dash/tint/parity cadence
 *      rides `data-series-cadence`, which is why unifying the modulus does not
 *      break the skins that key 1..4.
 *
 * ADJUDICATION MODEL (syntactic, not textual)
 * -------------------------------------------
 * Every finding is a node in a real TypeScript parse tree. `source.includes`
 * is used ONLY as a lossless prefilter -- each classifier below requires a
 * literal/template/identifier the prefilter's substring is a prerequisite for,
 * so a file without the substring cannot hold that rule's finding. Comments,
 * prose, documentation tables and `.length` reads are not findings.
 *
 * SCOPE. Rules A and C are repository-wide: the expression and the attribute
 * are chart-specific names wherever they appear. Rule B is scoped to the chart
 * tree, because `palette` and `colors` are ordinary words elsewhere and a
 * repo-wide identifier predicate would adjudicate code this law does not own.
 *
 * BASELINE. The pre-migration tree holds all three habits by construction --
 * they are the preimage the family lots drain, not new findings. The baseline
 * records them per rule and file WITH A COUNT, so a new occurrence in an
 * already-debted file still reddens, and a drained file must be re-pinned. It
 * is decrease-only: a count that no longer matches, in either direction, is a
 * failure.
 *
 * Usage:
 *   node scripts/check/charts/paint-single-door/index.mjs           # report
 *   node scripts/check/charts/paint-single-door/index.mjs --check   # exit 1
 *   node scripts/check/charts/paint-single-door/index.mjs --json
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(here);
const srcDir = join(root, 'src');
const baselinePath = join(here, 'baseline/index.json');

export const CHART_TREE = 'components/patterns/visualization/charts';

/** The two expression prefixes only the resolver may assemble. */
export const PAINT_EXPRESSION_PREFIXES = Object.freeze([
  'var(--ds-chart-category-',
  'var(--ds-chart-paint-',
]);

/** The owners allowed to assemble a paint expression. */
export const PAINT_OWNER_ALLOWLIST = Object.freeze([
  `${CHART_TREE}/runtime/theming/composition/foundation/paint/`,
  `${CHART_TREE}/runtime/chart-engine/foundation/grammar/palette/`,
]);

/** The one function that may decide a paint slot. */
export const SLOT_FUNCTION = 'slotIndexFor';

export const SERIES_INDEX_ATTRIBUTE = 'data-series-index';

export const RULES = Object.freeze({
  A: 'paint-expression-outside-resolver',
  B: 'hand-written-paint-modulus',
  C: 'hand-stamped-series-index',
});

const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx']);

/** `palette`, `colors`, `seriesColors`, `chartPalette`, `PASTEL_COLORS`, … */
const PALETTE_BINDING = /^(?:[a-z][a-zA-Z0-9]*)?(?:[Pp]alette|[Cc]olors)$|_(?:PALETTE|COLORS)$|^(?:PALETTE|COLORS)$/u;

function isTestPath(relPath) {
  return (
    relPath.split(sep).includes('tests')
    || relPath.split(sep).includes('__tests__')
    || /\.test\.[cm]?[jt]sx?$/u.test(relPath)
    || /\.stories\.[jt]sx?$/u.test(relPath)
  );
}

export function isPaletteBinding(name) {
  return typeof name === 'string' && PALETTE_BINDING.test(name);
}

function isPaintOwner(posixPath) {
  return PAINT_OWNER_ALLOWLIST.some((prefix) => posixPath.startsWith(prefix));
}

function unwrap(node) {
  let current = node;
  while (current) {
    if (
      ts.isParenthesizedExpression(current)
      || ts.isAsExpression(current)
      || ts.isNonNullExpression(current)
      || ts.isTypeAssertionExpression(current)
      || ts.isSatisfiesExpression(current)
    ) {
      current = current.expression;
      continue;
    }
    return current;
  }
  return current;
}

/** The identifier a member/element access chain is rooted at. */
function rootIdentifierName(node) {
  let current = unwrap(node);
  while (current) {
    if (ts.isIdentifier(current)) return current.text;
    if (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) {
      current = unwrap(current.expression);
      continue;
    }
    if (ts.isCallExpression(current)) {
      current = unwrap(current.expression);
      continue;
    }
    return null;
  }
  return null;
}

/** Every literal chunk a string or template contributes, in source order. */
function literalChunks(node) {
  if (ts.isStringLiteralLike(node)) return [node.text];
  if (ts.isTemplateExpression(node)) {
    return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)];
  }
  return [];
}

/**
 * True when a literal or template ASSEMBLES a governed paint expression.
 *
 * A template's chunks are tested individually AND concatenated, so
 * `` `var(--ds-chart-paint-${n}, ...)` `` is caught by its head and
 * `` `var(--ds-chart-${''}paint-1)` `` cannot launder the prefix through an
 * interpolation. Concatenating is not a false-positive risk: literal chunks
 * that spell the prefix between them are spelling the prefix.
 */
export function buildsPaintExpression(node) {
  const chunks = literalChunks(node);
  if (chunks.length === 0) return false;
  const joined = chunks.join('');
  return PAINT_EXPRESSION_PREFIXES.some(
    (prefix) => chunks.some((chunk) => chunk.includes(prefix)) || joined.includes(prefix),
  );
}

/** True when `node` is a `%` whose operands name a palette-ish binding. */
export function isPaletteModulus(node) {
  if (!ts.isBinaryExpression(node)) return false;
  if (node.operatorToken.kind !== ts.SyntaxKind.PercentToken) return false;
  return [node.left, node.right].some((operand) =>
    isPaletteBinding(rootIdentifierName(operand)),
  );
}

function containsCallTo(node, name) {
  let found = false;
  const visit = (current) => {
    if (found) return;
    if (ts.isCallExpression(current)) {
      const callee = unwrap(current.expression);
      if (callee && ts.isPropertyAccessExpression(callee) && callee.name.text === name) {
        found = true;
        return;
      }
      if (callee && ts.isIdentifier(callee) && callee.text === name) {
        found = true;
        return;
      }
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return found;
}

function containsModulus(node) {
  let found = false;
  const visit = (current) => {
    if (found) return;
    if (
      ts.isBinaryExpression(current)
      && current.operatorToken.kind === ts.SyntaxKind.PercentToken
    ) {
      found = true;
      return;
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  return found;
}

/**
 * True when a `data-series-index` expression is NOT the governed slot. The
 * expression may be conditional (`cat ? cat.slotIndexFor(i) : undefined`), but
 * it must reach `slotIndexFor` and must compute no modulus of its own.
 */
export function isUngovernedSeriesIndex(expression) {
  if (!expression) return true;
  if (containsModulus(expression)) return true;
  return !containsCallTo(expression, SLOT_FUNCTION);
}

function scriptKindFor(extension) {
  return extension === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

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

/**
 * Find every single-door violation in one file.
 * `rules` selects which of A/B/C apply to this path.
 */
export function findViolations(source, extension, rules = ['A', 'B', 'C']) {
  const active = new Set(rules);
  const sourceFile = ts.createSourceFile(
    `chart-paint-single-door${extension}`,
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    scriptKindFor(extension),
  );

  const hits = [];
  const report = (rule, node) => {
    hits.push({ rule: RULES[rule], offset: node.getStart(sourceFile) });
  };

  const visit = (node) => {
    if (
      active.has('A')
      && (ts.isStringLiteralLike(node) || ts.isTemplateExpression(node))
      && buildsPaintExpression(node)
    ) {
      report('A', node);
    }
    if (active.has('B') && isPaletteModulus(node)) {
      report('B', node);
    }
    if (
      active.has('C')
      && ts.isJsxAttribute(node)
      && ts.isIdentifier(node.name)
      && node.name.text === SERIES_INDEX_ATTRIBUTE
    ) {
      const initializer = node.initializer;
      const expression =
        initializer && ts.isJsxExpression(initializer) ? initializer.expression : undefined;
      if (isUngovernedSeriesIndex(expression)) report('C', node);
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
  return hits
    .slice()
    .sort((left, right) => left.offset - right.offset)
    .map(({ rule, offset }) => ({ rule, ...findingAtOffset(source, offset) }));
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) yield* walk(full);
    else if (stats.isFile()) yield full;
  }
}

/** Which rules a path is subject to. Rule B is chart-tree only, by design. */
export function rulesFor(posixPath) {
  const rules = [];
  if (!isPaintOwner(posixPath)) rules.push('A');
  if (posixPath.startsWith(`${CHART_TREE}/`) && !isPaintOwner(posixPath)) rules.push('B');
  rules.push('C');
  return rules;
}

export function runGate({ sourceRoot = srcDir } = {}) {
  const findings = [];
  let scanned = 0;

  for (const file of walk(sourceRoot)) {
    const extension = file.slice(file.lastIndexOf('.'));
    if (!SCANNED_EXTENSIONS.has(extension)) continue;
    const relPath = relative(sourceRoot, file);
    if (isTestPath(relPath)) continue;
    const posix = relPath.split(sep).join('/');
    scanned += 1;
    const source = readFileSync(file, 'utf8');
    // Lossless prefilter: every classifier needs one of these substrings.
    const mayHold =
      PAINT_EXPRESSION_PREFIXES.some((prefix) => source.includes(prefix))
      || source.includes('%')
      || source.includes(SERIES_INDEX_ATTRIBUTE);
    if (!mayHold) continue;
    const rules = rulesFor(posix);
    if (rules.length === 0) continue;
    let violations;
    try {
      violations = findViolations(source, extension, rules);
    } catch (error) {
      throw new Error(
        `chart-paint-single-door: failed to parse ${posix}: ${error.message}`,
        { cause: error },
      );
    }
    for (const violation of violations) findings.push({ file: posix, ...violation });
  }

  return { findings, scanned };
}

export function readBaseline(path = baselinePath) {
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  return parsed.findings ?? {};
}

export function censusOf(findings) {
  const census = {};
  for (const finding of findings) {
    const key = `${finding.rule}:${finding.file}`;
    census[key] = (census[key] ?? 0) + 1;
  }
  return census;
}

/**
 * Compare the live census with the baseline. Both directions are failures:
 * a count that grew is new debt, a count that shrank is an un-repinned drain.
 */
export function reconcile(findings, baseline) {
  const census = censusOf(findings);
  const regressions = [];
  const stale = [];
  for (const [key, count] of Object.entries(census)) {
    const pinned = baseline[key]?.count ?? 0;
    if (count > pinned) regressions.push({ key, pinned, measured: count });
  }
  for (const [key, entry] of Object.entries(baseline)) {
    const measured = census[key] ?? 0;
    if (measured < (entry.count ?? 0)) stale.push({ key, pinned: entry.count ?? 0, measured });
  }
  return { census, regressions, stale };
}

function main() {
  const check = process.argv.includes('--check');
  const asJson = process.argv.includes('--json');
  const { findings, scanned } = runGate();
  const baseline = readBaseline();
  const { census, regressions, stale } = reconcile(findings, baseline);

  if (asJson) {
    console.log(JSON.stringify({ scanned, findings, census, regressions, stale }, null, 2));
    if (check && (regressions.length > 0 || stale.length > 0)) process.exit(1);
    return;
  }

  console.log('chart-paint-single-door');
  console.log(`  files scanned: ${scanned}`);
  for (const rule of Object.values(RULES)) {
    const total = findings.filter((finding) => finding.rule === rule).length;
    console.log(`  ${rule}: ${total}`);
  }
  console.log(`  baselined owners: ${Object.keys(baseline).length}`);

  for (const regression of regressions) {
    const detail = findings.find(
      (finding) => `${finding.rule}:${finding.file}` === regression.key,
    );
    console.log(
      `  REGRESSION ${regression.key} pinned ${regression.pinned}, measured ${regression.measured}`
        + (detail ? `  (e.g. :${detail.line}  ${detail.excerpt})` : ''),
    );
  }
  for (const entry of stale) {
    console.log(
      `  STALE BASELINE ${entry.key} pinned ${entry.pinned}, measured ${entry.measured}`
        + ' -- drained; re-pin it in the same commit',
    );
  }

  if (regressions.length > 0 || stale.length > 0) {
    console.log('\n  Paint is decided once, by resolveChartPaint. Read the decision');
    console.log('  through useChartPaintDecision(); never rebuild the chain by hand.');
    if (check) process.exit(1);
    return;
  }
  console.log('  PASS (no new paint authority)');
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
