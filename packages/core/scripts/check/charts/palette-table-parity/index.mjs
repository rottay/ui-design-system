#!/usr/bin/env node
/**
 * chart-palette-table-parity — the fifty hexes exist four times; bind the two
 * copies nothing binds.
 *
 * The same 5 x 10 table lives in `LIGHT_FALLBACKS` (the chain's terminal
 * literals), in the `--ds-chart-paint-N` bridge tails of the chart-foundation
 * skin, and as `--ds-chart-{scheme}-N` in the patterns stylesheet -- twice
 * there, once light and once dark.
 *
 * The renderer suite already locks the TS module to the bridge, character for
 * character. Nothing locked the stylesheet: its hundred registered values
 * could drift from the module's promised tail and every test in the tree would
 * stay green, because no fixture reads the real declarations -- the fixtures
 * INJECT stub values to prove the chain reads the channel above the literal.
 *
 * Three arms:
 *   light-parity       every `--ds-chart-{scheme}-N` in the light scope equals
 *                      the TS module's fallback for that scheme and slot.
 *   dark-coverage      every light name has a dark counterpart. A dark scope
 *                      that forgets a slot leaves a light hex painting in dark.
 *   dark-distinctness  a dark value that EQUALS its light value is reported.
 *                      It is not a failure by itself -- a mode-stable hex is a
 *                      legitimate decision -- so this arm is informational and
 *                      only fails when every value in a scheme is identical,
 *                      which means the dark scope was copied, not authored.
 *
 * The parse is a real PostCSS walk, not a regular expression over text: a
 * declaration is a declaration, a comment is not.
 *
 * Usage:
 *   node scripts/check/charts/palette-table-parity/index.mjs           # report
 *   node scripts/check/charts/palette-table-parity/index.mjs --check   # exit 1
 *   node scripts/check/charts/palette-table-parity/index.mjs --json
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(here);

export const GRAMMAR_SOURCE = join(
  root,
  'src/components/patterns/visualization/charts/runtime/chart-engine/foundation/grammar/palette/index.ts',
);
export const PATTERNS_STYLESHEET = join(
  root,
  'src/foundation/tokens/css/presentation/components/patterns/index.css',
);

export const SCHEMES = Object.freeze(['accessible', 'default', 'monochrome', 'pastel', 'vibrant']);
export const SLOTS = 10;

const CHANNEL = /^--ds-chart-(accessible|default|monochrome|pastel|vibrant)-(\d+)$/u;

/**
 * Read `LIGHT_FALLBACKS` out of the grammar module through the TypeScript AST.
 * The module is the authority; parsing it rather than importing it keeps this
 * gate runnable on a clean checkout with no build.
 */
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

/** Peel `Object.freeze(...)` wrappers and read scheme -> string[] pairs. */
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
        .map((element) => element.text.toLowerCase()),
    });
  }
  return entries;
}

/**
 * Walk the stylesheet and collect every `--ds-chart-{scheme}-N` declaration,
 * split by whether a dark selector governs it.
 */
export function readStylesheetTable(css) {
  const light = {};
  const dark = {};
  const rootNode = postcss.parse(css, { from: undefined });
  rootNode.walkDecls((decl) => {
    const match = CHANNEL.exec(decl.prop);
    if (!match) return;
    const [, scheme, slot] = match;
    const index = Number(slot);
    if (!Number.isInteger(index) || index < 1 || index > SLOTS) return;
    const bucket = isDarkScoped(decl) ? dark : light;
    (bucket[scheme] ??= {})[index] = decl.value.trim().toLowerCase();
  });
  return { light, dark };
}

/** A declaration is dark-scoped when any ancestor selector or at-rule says so. */
function isDarkScoped(decl) {
  for (let node = decl.parent; node; node = node.parent) {
    if (node.type === 'rule' && /dark/u.test(node.selector)) return true;
    if (node.type === 'atrule' && /dark/u.test(node.params ?? '')) return true;
  }
  return false;
}

/**
 * Compare the two authorities. `schemes` and `slots` default to the production
 * cardinality; the drill narrows them so a planted divergence stays readable
 * without weakening what the real run enforces.
 */
export function compare(grammar, stylesheet, { schemes = SCHEMES, slots: slotCount = SLOTS } = {}) {
  const findings = [];
  const identicalSchemes = [];
  let comparedLight = 0;
  let comparedDark = 0;

  for (const scheme of schemes) {
    const expected = grammar[scheme];
    if (!expected || expected.length !== slotCount) {
      findings.push({
        arm: 'light-parity',
        scheme,
        detail: `the grammar module declares ${expected ? expected.length : 0} slots, expected ${slotCount}`,
      });
      continue;
    }
    const light = stylesheet.light[scheme] ?? {};
    const dark = stylesheet.dark[scheme] ?? {};
    let identical = 0;
    for (let slot = 1; slot <= slotCount; slot += 1) {
      const want = expected[slot - 1];
      const got = light[slot];
      if (got === undefined) {
        findings.push({
          arm: 'light-parity',
          scheme,
          slot,
          detail: `--ds-chart-${scheme}-${slot} is not registered in the light scope`,
        });
        continue;
      }
      comparedLight += 1;
      if (got !== want) {
        findings.push({
          arm: 'light-parity',
          scheme,
          slot,
          detail: `--ds-chart-${scheme}-${slot} is ${got}; the grammar module promises ${want}`,
        });
      }
      const darkValue = dark[slot];
      if (darkValue === undefined) {
        findings.push({
          arm: 'dark-coverage',
          scheme,
          slot,
          detail: `--ds-chart-${scheme}-${slot} has no dark counterpart; the light hex paints in dark`,
        });
        continue;
      }
      comparedDark += 1;
      if (darkValue === got) identical += 1;
    }
    if (identical === slotCount) {
      identicalSchemes.push(scheme);
      findings.push({
        arm: 'dark-distinctness',
        scheme,
        detail: 'every dark value equals its light value; the dark scope was copied, not authored',
      });
    }
  }

  return { findings, comparedLight, comparedDark, identicalSchemes };
}

export function runGate({
  grammarSource = GRAMMAR_SOURCE,
  stylesheet = PATTERNS_STYLESHEET,
} = {}) {
  const grammar = readGrammarTable(readFileSync(grammarSource, 'utf8'));
  const table = readStylesheetTable(readFileSync(stylesheet, 'utf8'));
  return { ...compare(grammar, table), grammar, table };
}

function main() {
  const check = process.argv.includes('--check');
  const asJson = process.argv.includes('--json');
  const { findings, comparedLight, comparedDark } = runGate();

  if (asJson) {
    console.log(JSON.stringify({ comparedLight, comparedDark, findings }, null, 2));
    if (check && findings.length > 0) process.exit(1);
    return;
  }

  console.log('chart-palette-table-parity');
  console.log(`  light values compared: ${comparedLight} / ${SCHEMES.length * SLOTS}`);
  console.log(`  dark values compared:  ${comparedDark} / ${SCHEMES.length * SLOTS}`);
  console.log(`  findings: ${findings.length}`);
  for (const finding of findings) {
    console.log(`  ${finding.arm.toUpperCase()} ${finding.scheme}: ${finding.detail}`);
  }

  if (findings.length > 0) {
    console.log('\n  The stylesheet channel and the grammar module are one table written twice.');
    console.log('  Regenerate the stylesheet from LIGHT_FALLBACKS rather than editing a hex.');
    if (check) process.exit(1);
    return;
  }
  console.log('  PASS (all four copies agree)');
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
