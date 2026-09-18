/**
 * Drill for chart-paint-bridge.
 *
 * The generator emits fifty declarations from one table. The plants below are
 * the two ways that can go wrong: a hex that moves in the grammar module must
 * be carried into the bridge, and a bridge block that is malformed -- an
 * unknown scheme, a missing slot, a duplicated slot -- must be refused rather
 * than quietly half-emitted.
 *
 * The green half matters as much: an unchanged tree must report zero moved
 * values and round-trip byte-identically, which is what makes the renderer
 * suite's parity lock a tautology instead of a second authority.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  SCHEMES,
  SLOTS,
  SKIN_STYLESHEET,
  bridgeValue,
  readGrammarTable,
  rewrite,
  run,
} from './index.mjs';

const GRAMMAR = `
const LIGHT_FALLBACKS = Object.freeze({
  accessible: Object.freeze(['#aa0001', '#aa0002']),
  default: Object.freeze(['#dd0001', '#dd0002']),
});
`;

const FIXTURE = Object.freeze({ schemes: ['accessible', 'default'], slots: 2 });

function block(scheme, values) {
  const decls = values
    .map((value, index) => `  --ds-chart-paint-${index + 1}: ${bridgeValue(scheme, index + 1, value)};`)
    .join('\n');
  return `.ds-chart-frame[data-chart-color-scheme='${scheme}'] {\n${decls}\n}\n`;
}

const STYLESHEET =
  `/* a comment the walk must preserve */\n`
  + block('accessible', ['#aa0001', '#aa0002'])
  + block('default', ['#dd0001', '#dd0002']);

function rewriteFixture(grammarSource, cssSource) {
  return rewrite(cssSource, readGrammarTable(grammarSource), FIXTURE);
}

/* ------------------------------------------------------------------ */
/* Readers and formula                                                 */
/* ------------------------------------------------------------------ */

test('the grammar reader preserves each literal verbatim, case included', () => {
  const table = readGrammarTable(GRAMMAR.replace('#aa0001', '#AA0001'));
  assert.deepEqual(table.accessible, ['#AA0001', '#aa0002']);
});

test('the formula is the chain, highest precedence first', () => {
  assert.equal(
    bridgeValue('pastel', 7, '#123456'),
    'var(--ds-chart-category-7, var(--ds-chart-series-7, var(--ds-chart-pastel-7, #123456)))',
  );
});

/* ------------------------------------------------------------------ */
/* GREEN                                                               */
/* ------------------------------------------------------------------ */

test('an unchanged fixture moves nothing and round-trips byte-identically', () => {
  const { css, changes, declarations } = rewriteFixture(GRAMMAR, STYLESHEET);
  assert.deepEqual(changes, []);
  assert.equal(declarations, 4);
  assert.equal(css, STYLESHEET);
});

/* ------------------------------------------------------------------ */
/* RED                                                                 */
/* ------------------------------------------------------------------ */

test('a hex that moves in the grammar module is carried into the bridge', () => {
  const { css, changes } = rewriteFixture(GRAMMAR.replace('#aa0002', '#aa9999'), STYLESHEET);
  assert.equal(changes.length, 1, JSON.stringify(changes));
  assert.equal(changes[0].scheme, 'accessible');
  assert.equal(changes[0].slot, 2);
  assert.match(changes[0].to, /--ds-chart-accessible-2, #aa9999/u);
  assert.equal(css.includes('#aa9999'), true);
  assert.equal(css.includes('#aa0002'), false);
});

test('a bridge scoped to an unknown scheme is refused', () => {
  const rogue = STYLESHEET + block('rainbow', ['#ff0001', '#ff0002']);
  assert.throws(() => rewriteFixture(GRAMMAR, rogue), /unknown scheme "rainbow"/u);
});

test('a block that drops a slot is refused', () => {
  const short = STYLESHEET.replace(
    `  --ds-chart-paint-2: ${bridgeValue('default', 2, '#dd0002')};\n`,
    '',
  );
  assert.throws(() => rewriteFixture(GRAMMAR, short), /does not declare --ds-chart-paint-2/u);
});

test('a slot declared twice for one scheme is refused', () => {
  const doubled = STYLESHEET.replace(
    `  --ds-chart-paint-1: ${bridgeValue('accessible', 1, '#aa0001')};\n`,
    `  --ds-chart-paint-1: ${bridgeValue('accessible', 1, '#aa0001')};\n`.repeat(2),
  );
  assert.throws(() => rewriteFixture(GRAMMAR, doubled), /declared twice/u);
});

test('a grammar table that lost a scheme is refused before anything is emitted', () => {
  const lost = GRAMMAR.replace(/\n\s+default: Object\.freeze\(\[[^\]]*\]\),/u, '');
  assert.throws(() => rewriteFixture(lost, STYLESHEET), /expected \[accessible, default\]/u);
});

test('a grammar table with the wrong slot count is refused', () => {
  const short = GRAMMAR.replace("'#aa0001', '#aa0002'", "'#aa0001'");
  assert.throws(() => rewriteFixture(short, STYLESHEET), /declares 1 literals; expected 2/u);
});

/* ------------------------------------------------------------------ */
/* Integration                                                         */
/* ------------------------------------------------------------------ */

test('the real tree emits all fifty declarations and moves no value', () => {
  const { css, changes, declarations } = run();
  assert.equal(declarations, SCHEMES.length * SLOTS);
  assert.deepEqual(changes, []);
  assert.equal(css, readFileSync(SKIN_STYLESHEET, 'utf8'));
});
