#!/usr/bin/env node
/**
 * Generate the `--ds-chart-paint-N` bridge from the chart grammar module.
 *
 * WHY THIS EXISTS
 * ---------------
 * The same fifty hexes live in `LIGHT_FALLBACKS` (the chain's terminal
 * literals), in the `--ds-chart-{scheme}-N` channel of the patterns
 * stylesheet, and in the five bridge blocks of the chart-foundation skin. The
 * bridge is what lets a family paint from a class instead of an inline style,
 * so it is kept -- but it is not hand-maintained. It is emitted here from the
 * one module that owns the precedence chain, which turns the renderer suite's
 * character-for-character parity lock from a lock into a tautology.
 *
 * WHERE THE TRUTH LIVES
 * ---------------------
 * `runtime/chart-engine/foundation/grammar/palette/index.ts`. Its
 * `LIGHT_FALLBACKS` table and its `createSeriesPaint` shape are read through
 * the TypeScript AST rather than imported, so this runs on a clean checkout
 * with no build -- the same door `chart-palette-table-parity` uses.
 *
 * WHAT IS REWRITTEN
 * -----------------
 * Only the values of `--ds-chart-paint-N` declarations inside a rule whose
 * selector carries `[data-chart-color-scheme='<scheme>']`. The walk is
 * PostCSS, so selectors, comments, ordering and whitespace round-trip
 * byte-identically; nothing else in the stylesheet is touched.
 *
 * It fails closed: an unknown scheme, a missing slot, a duplicated slot or a
 * grammar table that is not 5 x 10 is refused rather than emitted.
 *
 * Usage:
 *   node scripts/generate/chart-paint-bridge/index.mjs           # report
 *   node scripts/generate/chart-paint-bridge/index.mjs --check   # exit 1 on drift
 *   node scripts/generate/chart-paint-bridge/index.mjs --write   # regenerate
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(here);

export const GRAMMAR_SOURCE = join(
  root,
  'src/components/patterns/visualization/charts/runtime/chart-engine/foundation/grammar/palette/index.ts',
);
export const SKIN_STYLESHEET = join(
  root,
  'src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css',
);

export const SCHEMES = Object.freeze(['accessible', 'default', 'monochrome', 'pastel', 'vibrant']);
export const SLOTS = 10;

const PAINT_DECL = /^--ds-chart-paint-(\d+)$/u;
const SCOPE_SELECTOR = /\[data-chart-color-scheme=['"]([a-z-]+)['"]\]/u;

function refuse(message) {
  throw new Error(`chart-paint-bridge: ${message}`);
}

/**
 * The one formula. It must stay character-identical to `createSeriesPaint` in
 * the grammar module; the renderer suite asserts exactly that.
 */
export function bridgeValue(scheme, slot, fallback) {
  return `var(--ds-chart-category-${slot}, var(--ds-chart-series-${slot}, var(--ds-chart-${scheme}-${slot}, ${fallback})))`;
}

/** Peel `Object.freeze(...)` wrappers and read scheme -> string[] pairs verbatim. */
function collectObjectLiteral(node) {
  let current = node;
  while (ts.isCallExpression(current) && current.arguments.length > 0) {
    current = current.arguments[0];
  }
  if (!ts.isObjectLiteralExpression(current)) return [];
  const entries = [];
  for (const property of current.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)
      ? property.name.text
      : null;
    if (!name) continue;
    let value = property.initializer;
    while (ts.isCallExpression(value) && value.arguments.length > 0) value = value.arguments[0];
    if (!ts.isArrayLiteralExpression(value)) continue;
    entries.push({
      name,
      values: value.elements
        .filter((element) => ts.isStringLiteralLike(element))
        .map((element) => element.text),
    });
  }
  return entries;
}

/** Read `LIGHT_FALLBACKS` through the AST, preserving each literal verbatim. */
export function readGrammarTable(source) {
  const sourceFile = ts.createSourceFile(
    'palette.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const table = {};
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === 'LIGHT_FALLBACKS'
      && node.initializer
    ) {
      for (const property of collectObjectLiteral(node.initializer)) {
        table[property.name] = property.values;
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return table;
}

function assertTable(table, { schemes = SCHEMES, slots = SLOTS } = {}) {
  const names = Object.keys(table).sort();
  const expected = [...schemes].sort();
  if (names.length !== expected.length || names.some((name, i) => name !== expected[i])) {
    refuse(`the grammar module declares [${names.join(', ')}]; expected [${expected.join(', ')}]`);
  }
  for (const scheme of expected) {
    if (table[scheme].length !== slots) {
      refuse(`${scheme} declares ${table[scheme].length} literals; expected ${slots}`);
    }
  }
}

/**
 * Rewrite every bridge declaration from the table. Returns the new stylesheet
 * text and one entry per value that moved.
 */
export function rewrite(css, table, { schemes = SCHEMES, slots = SLOTS } = {}) {
  assertTable(table, { schemes, slots });

  const seen = new Map();
  const changes = [];
  const rootNode = postcss.parse(css, { from: undefined });

  rootNode.walkRules((rule) => {
    const scope = SCOPE_SELECTOR.exec(rule.selector);
    if (!scope) return;
    const scheme = scope[1];
    let touched = false;

    rule.walkDecls((decl) => {
      const match = PAINT_DECL.exec(decl.prop);
      if (!match) return;
      if (!schemes.includes(scheme)) {
        refuse(`${decl.prop} is scoped to unknown scheme "${scheme}"`);
      }
      const slot = Number(match[1]);
      if (!Number.isInteger(slot) || slot < 1 || slot > slots) {
        refuse(`${decl.prop} is outside the 1..${slots} slot range`);
      }
      const key = `${scheme}-${slot}`;
      if (seen.has(key)) refuse(`--ds-chart-paint-${slot} is declared twice for "${scheme}"`);
      seen.set(key, true);
      touched = true;

      const want = bridgeValue(scheme, slot, table[scheme][slot - 1]);
      if (decl.value !== want) {
        changes.push({ scheme, slot, from: decl.value, to: want });
        decl.value = want;
      }
    });

    if (touched) {
      for (let slot = 1; slot <= slots; slot += 1) {
        if (!seen.has(`${scheme}-${slot}`)) {
          refuse(`the "${scheme}" bridge block does not declare --ds-chart-paint-${slot}`);
        }
      }
    }
  });

  for (const scheme of schemes) {
    for (let slot = 1; slot <= slots; slot += 1) {
      if (!seen.has(`${scheme}-${slot}`)) {
        refuse(`no bridge block registers --ds-chart-paint-${slot} for "${scheme}"`);
      }
    }
  }

  return { css: rootNode.toString(), changes, declarations: seen.size };
}

export function run({ grammarSource = GRAMMAR_SOURCE, stylesheet = SKIN_STYLESHEET } = {}) {
  const table = readGrammarTable(readFileSync(grammarSource, 'utf8'));
  const before = readFileSync(stylesheet, 'utf8');
  return { ...rewrite(before, table), before, stylesheet };
}

function main() {
  const check = process.argv.includes('--check');
  const write = process.argv.includes('--write');
  const { css, changes, declarations, before, stylesheet } = run();

  console.log('chart-paint-bridge');
  console.log(`  declarations generated: ${declarations} / ${SCHEMES.length * SLOTS}`);
  console.log(`  values that moved:      ${changes.length}`);
  for (const change of changes) {
    console.log(`  ${change.scheme}-${change.slot}\n    was  ${change.from}\n    now  ${change.to}`);
  }

  if (changes.length === 0) {
    console.log('  PASS (the bridge is the grammar module, emitted)');
    return;
  }
  if (write) {
    writeFileSync(stylesheet, css, 'utf8');
    console.log(`  WROTE ${stylesheet} (${before.length} -> ${css.length} bytes)`);
    return;
  }
  console.log('\n  The bridge has drifted from LIGHT_FALLBACKS. Regenerate with --write;');
  console.log('  a value that moves is a change to the palette, not to the bridge.');
  if (check) process.exit(1);
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
