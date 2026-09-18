/**
 * Drill for chart-palette-table-parity.
 *
 * The gate reads two authorities from source -- the grammar module's
 * `LIGHT_FALLBACKS` through the TypeScript AST, the stylesheet's channel
 * declarations through PostCSS -- and compares them value by value. The plants
 * below are P2 from the acceptance table and its dark-scope siblings: change
 * one hex, drop one slot, copy the dark scope, and each must redden.
 *
 * The green half matters as much: a hex named in a comment is not a
 * declaration, and a declaration outside the five governed schemes is not this
 * gate's business.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SCHEMES,
  SLOTS,
  compare,
  readGrammarTable,
  readStylesheetTable,
  runGate,
} from './index.mjs';

const GRAMMAR = `
const LIGHT_FALLBACKS = Object.freeze({
  accessible: Object.freeze(['#aa0001', '#aa0002']),
  default: Object.freeze(['#dd0001', '#dd0002']),
});
`;

const STYLESHEET = `
:root {
  --ds-chart-accessible-1: #aa0001;
  --ds-chart-accessible-2: #aa0002;
  --ds-chart-default-1: #dd0001;
  --ds-chart-default-2: #dd0002;
}
[data-theme='dark'] {
  --ds-chart-accessible-1: #110001;
  --ds-chart-accessible-2: #110002;
  --ds-chart-default-1: #220001;
  --ds-chart-default-2: #220002;
}
`;

const FIXTURE = Object.freeze({ schemes: ['accessible', 'default'], slots: 2 });

/** Parse both fixture authorities and compare them at the fixture cardinality. */
function compareFixture(grammarSource, cssSource) {
  return compare(readGrammarTable(grammarSource), readStylesheetTable(cssSource), FIXTURE);
}

/* ------------------------------------------------------------------ */
/* Readers                                                             */
/* ------------------------------------------------------------------ */

test('the grammar reader peels Object.freeze and lowercases', () => {
  const table = readGrammarTable(GRAMMAR.replace('#aa0001', '#AA0001'));
  assert.deepEqual(table.accessible, ['#aa0001', '#aa0002']);
  assert.deepEqual(table.default, ['#dd0001', '#dd0002']);
});

test('the stylesheet reader separates the dark scope from the light one', () => {
  const { light, dark } = readStylesheetTable(STYLESHEET);
  assert.equal(light.accessible[1], '#aa0001');
  assert.equal(dark.accessible[1], '#110001');
  assert.equal(light.default[2], '#dd0002');
  assert.equal(dark.default[2], '#220002');
});

test('a hex named in a comment is not a declaration', () => {
  const css = ':root { /* --ds-chart-default-1: #000000; */ color: red; }';
  const { light } = readStylesheetTable(css);
  assert.deepEqual(light, {});
});

test('a channel outside the five governed schemes is ignored', () => {
  const { light } = readStylesheetTable(':root { --ds-chart-rainbow-1: #ff0000; }');
  assert.deepEqual(light, {});
});

test('a media-query dark scope is read as dark, not as a second light scope', () => {
  const css = '@media (prefers-color-scheme: dark) { :root { --ds-chart-default-1: #123456; } }';
  const { light, dark } = readStylesheetTable(css);
  assert.deepEqual(light, {});
  assert.equal(dark.default[1], '#123456');
});

/* ------------------------------------------------------------------ */
/* RED                                                                 */
/* ------------------------------------------------------------------ */

test('P2: one changed hex in the light block reddens light-parity', () => {
  const { findings } = compareFixture(GRAMMAR, STYLESHEET.replace('#aa0002', '#aa9999'));
  const parity = findings.filter((finding) => finding.arm === 'light-parity');
  assert.equal(parity.length, 1, JSON.stringify(findings));
  assert.match(parity[0].detail, /is #aa9999; the grammar module promises #aa0002/u);
});

test('a dropped dark slot reddens dark-coverage', () => {
  const { findings } = compareFixture(
    GRAMMAR,
    STYLESHEET.replace('  --ds-chart-default-2: #220002;\n', ''),
  );
  const coverage = findings.filter((finding) => finding.arm === 'dark-coverage');
  assert.equal(coverage.length, 1, JSON.stringify(findings));
  assert.match(coverage[0].detail, /has no dark counterpart/u);
});

test('a dark scope copied from light reddens dark-distinctness', () => {
  const copied = STYLESHEET.replace('#110001', '#aa0001').replace('#110002', '#aa0002');
  const { findings, identicalSchemes } = compareFixture(GRAMMAR, copied);
  assert.deepEqual(identicalSchemes, ['accessible']);
  assert.equal(findings.some((finding) => finding.arm === 'dark-distinctness'), true);
});

test('a slot the stylesheet never registers reddens light-parity', () => {
  const { findings } = compareFixture(
    GRAMMAR,
    STYLESHEET.replace('  --ds-chart-accessible-2: #aa0002;\n', ''),
  );
  assert.equal(
    findings.some((finding) => /is not registered in the light scope/u.test(finding.detail)),
    true,
    JSON.stringify(findings),
  );
});

test('an unchanged fixture is clean, so the plants above are the only difference', () => {
  const { findings } = compareFixture(GRAMMAR, STYLESHEET);
  assert.deepEqual(findings, []);
});

/* ------------------------------------------------------------------ */
/* Integration                                                         */
/* ------------------------------------------------------------------ */

test('the real tree compares all one hundred values and agrees', () => {
  const { findings, comparedLight, comparedDark } = runGate();
  assert.equal(comparedLight, SCHEMES.length * SLOTS);
  assert.equal(comparedDark, SCHEMES.length * SLOTS);
  assert.deepEqual(findings, []);
});

test('the gate refuses a grammar module that lost a scheme', () => {
  const { findings } = compare(
    { accessible: Array.from({ length: SLOTS }, () => '#000000') },
    { light: {}, dark: {} },
  );
  const missing = findings.filter((finding) => /declares 0 slots/u.test(finding.detail));
  assert.equal(missing.length, SCHEMES.length - 1);
});
