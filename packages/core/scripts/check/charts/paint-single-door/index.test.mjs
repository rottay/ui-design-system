/**
 * Drill for chart-paint-single-door.
 *
 * The gate adjudicates syntactically: a finding is a node in a real parse
 * tree, never a textual occurrence. These tests pin both halves -- the green
 * half (prose, documentation tables, `.length` reads, governed stamps) and the
 * red half (assembled expressions, palette moduli, hand-stamped indices) --
 * then plant P1 and P6 from the acceptance table into the real corpus shape
 * and prove each reddens.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PAINT_EXPRESSION_PREFIXES,
  RULES,
  buildsPaintExpression,
  censusOf,
  findViolations,
  isPaletteBinding,
  readBaseline,
  reconcile,
  rulesFor,
  runGate,
} from './index.mjs';

const CHART_FILE = 'components/patterns/visualization/charts/families/bar-chart/index.tsx';
const RESOLVER =
  'components/patterns/visualization/charts/runtime/theming/composition/foundation/paint/index.ts';
const GRAMMAR =
  'components/patterns/visualization/charts/runtime/chart-engine/foundation/grammar/palette/index.ts';

/* ------------------------------------------------------------------ */
/* Scope                                                               */
/* ------------------------------------------------------------------ */

test('the resolver and the grammar are the only owners exempt from A and B', () => {
  assert.deepEqual(rulesFor(RESOLVER), ['C']);
  assert.deepEqual(rulesFor(GRAMMAR), ['C']);
  assert.deepEqual(rulesFor(CHART_FILE), ['A', 'B', 'C']);
  // Rule B is chart-tree only; `colors` is an ordinary word elsewhere.
  assert.deepEqual(rulesFor('components/primitives/inputs/select/index.tsx'), ['A', 'C']);
});

/* ------------------------------------------------------------------ */
/* GREEN                                                               */
/* ------------------------------------------------------------------ */

test('prose and documentation naming the channel never flag', () => {
  const source = [
    '/** The chain is var(--ds-chart-category-1, var(--ds-chart-series-1, …)). */',
    '// A skin reads var(--ds-chart-paint-1) from the bridge.',
    'const DOC = "see the --ds-chart-category-N tier";',
  ].join('\n');
  assert.deepEqual(findViolations(source, '.ts'), []);
});

test('a length read without a modulus never flags', () => {
  const source = 'const count = palette.length; const wide = colors.length > 0;';
  assert.deepEqual(findViolations(source, '.ts'), []);
});

test('a modulus on a binding that is not a palette never flags', () => {
  const source = 'const even = index % 2; const wrapped = tick % ticks.length;';
  assert.deepEqual(findViolations(source, '.ts'), []);
});

test('the governed stamp never flags, including its conditional form', () => {
  const direct = '<rect data-series-index={paint.slotIndexFor(i)} />';
  assert.deepEqual(findViolations(direct, '.tsx'), []);
  const conditional =
    '<rect data-series-index={cat ? cat.slotIndexFor(i) : undefined} />';
  assert.deepEqual(findViolations(conditional, '.tsx'), []);
});

test('the cadence attribute is not the slot attribute and is never adjudicated', () => {
  const source = '<rect data-series-cadence={cat.cadenceIndexFor(i) ?? undefined} />';
  assert.deepEqual(findViolations(source, '.tsx'), []);
});

/* ------------------------------------------------------------------ */
/* RED                                                                 */
/* ------------------------------------------------------------------ */

test('P1: a restored palette modulus reddens rule B', () => {
  const source = 'const color = palette[i % palette.length];';
  const violations = findViolations(source, '.ts');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].rule, RULES.B);
});

test('rule B catches every naming the tree actually used', () => {
  for (const expression of [
    'const a = palette[i % palette.length];',
    'const b = colors[i % colors.length];',
    'const c = seriesColors[index % seriesColors.length];',
    'const d = index % chartPalette.length;',
    'const e = DEFAULT_COLORS.at(index % DEFAULT_COLORS.length);',
  ]) {
    const violations = findViolations(expression, '.ts');
    assert.equal(violations.length >= 1, true, expression);
    assert.equal(violations[0].rule, RULES.B, expression);
  }
});

test('P6: a hand-stamped series index reddens rule C', () => {
  const source = '<span data-series-index={i % 5} />';
  const violations = findViolations(source, '.tsx');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].rule, RULES.C);
});

test('rule C reddens a raw index and an absent expression too', () => {
  assert.equal(findViolations('<g data-series-index={seriesIndex} />', '.tsx')[0].rule, RULES.C);
  assert.equal(findViolations('<g data-series-index="3" />', '.tsx')[0].rule, RULES.C);
});

test('rule A reddens an assembled paint expression, literal or template', () => {
  const literal = "const p = 'var(--ds-chart-paint-1, var(--ds-color-primary))';";
  assert.equal(findViolations(literal, '.ts')[0].rule, RULES.A);
  const template = 'const p = `var(--ds-chart-paint-${slot}, ${fallback})`;';
  assert.equal(findViolations(template, '.ts')[0].rule, RULES.A);
  const category = 'const p = `var(--ds-chart-category-${slot}, ${chain})`;';
  assert.equal(findViolations(category, '.ts')[0].rule, RULES.A);
});

test('rule A is not evaded by laundering the prefix through an interpolation', () => {
  const split = 'const p = `var(--ds-chart-${empty}paint-1, red)`;';
  const violations = findViolations(split, '.ts');
  assert.equal(violations.length, 1, 'the concatenated chunks spell the prefix');
  assert.equal(violations[0].rule, RULES.A);
  // And the predicate itself, isolated from the walk.
  assert.equal(typeof buildsPaintExpression, 'function');
});

test('the palette-binding predicate admits the real names and refuses ordinary ones', () => {
  for (const name of ['palette', 'colors', 'seriesColors', 'chartPalette', 'DEFAULT_COLORS']) {
    assert.equal(isPaletteBinding(name), true, name);
  }
  for (const name of ['ticks', 'index', 'colorScheme', 'color', 'series']) {
    assert.equal(isPaletteBinding(name), false, name);
  }
});

/* ------------------------------------------------------------------ */
/* The ratchet, both directions                                        */
/* ------------------------------------------------------------------ */

test('a count that grew is a regression; a count that shrank is a stale pin', () => {
  const findings = [
    { rule: RULES.B, file: CHART_FILE, line: 1, column: 1, excerpt: '' },
    { rule: RULES.B, file: CHART_FILE, line: 2, column: 1, excerpt: '' },
  ];
  const grew = reconcile(findings, { [`${RULES.B}:${CHART_FILE}`]: { count: 1 } });
  assert.equal(grew.regressions.length, 1);
  assert.equal(grew.stale.length, 0);

  const shrank = reconcile(findings, { [`${RULES.B}:${CHART_FILE}`]: { count: 3 } });
  assert.equal(shrank.regressions.length, 0);
  assert.equal(shrank.stale.length, 1);

  const exact = reconcile(findings, { [`${RULES.B}:${CHART_FILE}`]: { count: 2 } });
  assert.deepEqual([exact.regressions.length, exact.stale.length], [0, 0]);
});

test('an unbaselined owner is a regression even with an otherwise clean tree', () => {
  const report = reconcile(
    [{ rule: RULES.A, file: 'components/primitives/display/card/index.tsx', line: 1, column: 1, excerpt: '' }],
    {},
  );
  assert.equal(report.regressions.length, 1);
});

/* ------------------------------------------------------------------ */
/* Integration                                                         */
/* ------------------------------------------------------------------ */

test('the real tree is clean against its own baseline', () => {
  const { findings, scanned } = runGate();
  assert.equal(scanned > 1500, true, `scanned only ${scanned} files`);
  const { regressions, stale } = reconcile(findings, readBaseline());
  assert.deepEqual(regressions, []);
  assert.deepEqual(stale, []);
});

test('the baseline is exactly the measured preimage, per rule', () => {
  const { findings } = runGate();
  const census = censusOf(findings);
  const baseline = readBaseline();
  assert.deepEqual(Object.keys(census).sort(), Object.keys(baseline).sort());
  for (const [key, count] of Object.entries(census)) {
    assert.equal(baseline[key].count, count, key);
    assert.equal(typeof baseline[key].reason, 'string', `${key} has no reason`);
  }
});

test('every baselined owner lives in the chart tree', () => {
  for (const key of Object.keys(readBaseline())) {
    const file = key.slice(key.indexOf(':') + 1);
    assert.equal(
      file.startsWith('components/patterns/visualization/charts/'),
      true,
      `${file} is baselined debt outside the chart tree`,
    );
  }
});

test('both governed prefixes are declared', () => {
  assert.deepEqual([...PAINT_EXPRESSION_PREFIXES], [
    'var(--ds-chart-category-',
    'var(--ds-chart-paint-',
  ]);
});
