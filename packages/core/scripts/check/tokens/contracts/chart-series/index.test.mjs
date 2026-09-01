/**
 * Self-test for chart-series-reserved-name-gate.mjs (W5 palette seam).
 *
 * The gate adjudicates syntactically: a finding is a DEFINITION position in a
 * real parse tree (postcss for CSS, the TypeScript AST for TS/TSX), never a
 * textual occurrence. These tests pin both halves of that contract — the green
 * half (metadata strings, reads, comments, `var(` chains) and the red half
 * (declarations, property keys, computed keys, `setProperty`, element-access
 * assignment targets) — and then integration-check the real tree.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  DEFINER_ALLOWLIST,
  RESERVED_NAME,
  findViolations,
  isStaticReservedName,
  runGate,
} from './index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'index.mjs');

/* ------------------------------------------------------------------ */
/* Name classification                                                 */
/* ------------------------------------------------------------------ */

test('only canonical slots 1..10 are reserved names', () => {
  for (let slot = 1; slot <= 10; slot += 1) {
    assert.equal(isStaticReservedName(`${RESERVED_NAME}${slot}`), true, `slot ${slot}`);
  }
  for (const suffix of ['', '0', '11', '01', '1.0', '+1', '1e1', ' 1', '1 ', 'x', '*', '1a']) {
    assert.equal(
      isStaticReservedName(`${RESERVED_NAME}${suffix}`),
      false,
      `suffix ${JSON.stringify(suffix)} must not classify`,
    );
  }
  assert.equal(isStaticReservedName('--ds-chart-paint-1'), false);
  assert.equal(isStaticReservedName(undefined), false);
});

/* ------------------------------------------------------------------ */
/* GREEN: consumption, metadata, prose                                 */
/* ------------------------------------------------------------------ */

test('consumption through var() chains never flags', () => {
  const css = [
    '.ds-chart-renderer {',
    "  --ds-chart-paint-1: var(--ds-chart-category-1, var(--ds-chart-series-1, var(--ds-chart-default-1, #0f766e)));",
    '  fill: var(--ds-chart-series-2, var(--ds-color-primary));',
    '}',
  ].join('\n');
  assert.deepEqual(findViolations(css, '.css'), []);

  const ts = "const paint = `var(--ds-chart-series-${slot}, ${fallback})`;";
  assert.deepEqual(findViolations(ts, '.ts'), []);

  const nested =
    'const chain = `var(--ds-chart-category-${slot}, var(--ds-chart-series-${slot}, ${fallback}))`;';
  assert.deepEqual(findViolations(nested, '.ts'), []);
});

test('a metadata registry listing derived channel names never flags', () => {
  const source = [
    'export const CAPABILITIES = [',
    '  {',
    "    id: 'palette.seeds',",
    '    derivedChannels: [',
    "      '--ds-color-primary',",
    "      '--ds-chart-series-1',",
    "      '--ds-color-text-on-primary',",
    '    ],',
    '  },',
    '];',
  ].join('\n');
  assert.deepEqual(findViolations(source, '.ts'), []);
});

test('plain string values, reads and comparisons never flag', () => {
  const source = [
    "const documented = '--ds-chart-series-3';",
    "const read = computedStyle.getPropertyValue('--ds-chart-series-3');",
    "if (name === '--ds-chart-series-3') { report(name); }",
    "const inValue = { color: 'var(--ds-chart-series-4, #123456)' };",
    "emit(['--ds-chart-series-5']);",
  ].join('\n');
  assert.deepEqual(findViolations(source, '.ts'), []);
});

test('comment and JSDoc prose about the reserved channel never flags', () => {
  const source = [
    '/**',
    ' * Derive the ten `--ds-chart-series-*` slot colors for a tenant.',
    ' * Never define --ds-chart-series-1 outside the compiler.',
    ' */',
    '// also not here: --ds-chart-series-2: red;',
    "const consumption = 'var(--ds-chart-series-2, #123456)';",
  ].join('\n');
  assert.deepEqual(findViolations(source, '.ts'), []);

  const css = [
    '/*',
    ' * --ds-chart-series-1..10 are deliberately NOT registered here.',
    ' * --ds-chart-series-N is emitted by the tenant appearance compiler.',
    ' */',
    '.scope { color: var(--ds-chart-series-1, red); }',
  ].join('\n');
  assert.deepEqual(findViolations(css, '.css'), []);
});

/* ------------------------------------------------------------------ */
/* RED: definition positions                                           */
/* ------------------------------------------------------------------ */

test('a CSS declaration of the reserved channel flags with position', () => {
  const css = [
    '.scope {',
    '  --ds-chart-series-3: var(--ds-chart-category-3, #b24d3a);',
    '}',
  ].join('\n');
  const violations = findViolations(css, '.css');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 2);
  assert.equal(violations[0].column, 3);
  assert.match(violations[0].excerpt, /--ds-chart-series-3:/);
});

test('a CSS declaration nested inside an at-rule flags', () => {
  const css = [
    '@media (prefers-color-scheme: dark) {',
    '  .scope {',
    '    --ds-chart-series-10: #101010;',
    '  }',
    '}',
  ].join('\n');
  const violations = findViolations(css, '.css');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 3);
});

test('a TS object property key of the reserved channel flags', () => {
  const source = [
    'const style = {',
    "  '--ds-chart-series-1': color,",
    '};',
  ].join('\n');
  const violations = findViolations(source, '.tsx');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 2);
  assert.equal(violations[0].column, 3);
  assert.match(violations[0].excerpt, /--ds-chart-series-1/);
});

test('a computed property key of the reserved channel flags', () => {
  const staticKey = [
    'const style = {',
    "  ['--ds-chart-series-2']: color,",
    '};',
  ].join('\n');
  const staticViolations = findViolations(staticKey, '.ts');
  assert.equal(staticViolations.length, 1);
  assert.equal(staticViolations[0].line, 2);

  const dynamicKey = [
    'const style = {',
    '  [`--ds-chart-series-${slot}`]: color,',
    '};',
  ].join('\n');
  const dynamicViolations = findViolations(dynamicKey, '.ts');
  assert.equal(dynamicViolations.length, 1);
  assert.equal(dynamicViolations[0].line, 2);
});

test('a class property declaration of the reserved channel flags', () => {
  const source = [
    'class Vars {',
    "  '--ds-chart-series-4' = '#000000';",
    '}',
  ].join('\n');
  const violations = findViolations(source, '.ts');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 2);
});

test('a setProperty call defining the reserved channel flags', () => {
  const source = [
    'function paint(node: HTMLElement, color: string) {',
    "  node.style.setProperty('--ds-chart-series-5', color);",
    '}',
  ].join('\n');
  const violations = findViolations(source, '.ts');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 2);
  assert.match(violations[0].excerpt, /setProperty/);

  const dynamic = 'node.style.setProperty(`--ds-chart-series-${slot}`, color);';
  assert.equal(findViolations(dynamic, '.ts').length, 1);
});

test('a template-built element-access assignment flags (the emitter shape)', () => {
  const source = [
    'palette.forEach((color, index) => {',
    '  vars[`--ds-chart-series-${index + 1}`] = color;',
    '});',
  ].join('\n');
  const violations = findViolations(source, '.ts');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 2);
  assert.match(violations[0].excerpt, /vars\[/);

  const staticTarget = "vars['--ds-chart-series-6'] = color;";
  assert.equal(findViolations(staticTarget, '.ts').length, 1);
});

test('each definition is reported exactly once', () => {
  const source = [
    'const style = {',
    "  '--ds-chart-series-1': a,",
    "  '--ds-chart-series-2': b,",
    '};',
  ].join('\n');
  const violations = findViolations(source, '.ts');
  assert.equal(violations.length, 2);
  assert.deepEqual(
    violations.map((violation) => violation.line),
    [2, 3],
  );
});

/* ------------------------------------------------------------------ */
/* Integration against the real tree                                   */
/* ------------------------------------------------------------------ */

test('the real tree has zero violations and exactly two allowlisted definer hits', () => {
  const { findings, scanned, allowlistedHits } = runGate();
  assert.deepEqual(findings, []);
  assert.ok(scanned > 100, `expected a real scan, saw ${scanned} files`);
  // Two template assignments are sanctioned today: the brand-theme compiler
  // (the canonical `compileTheme` lowering, which took the palette authority
  // in dcc65ca34) and the appearance compiler (the compatibility projection).
  // Both emit at the tenant root scope, so neither is the CHT-03 hazard, which
  // is a definition BELOW that scope.
  //
  // The number is pinned at 2 on purpose and is NOT an endorsement of the
  // duplication: collapsing the two derivations to one definer is an open
  // unification, and when it lands this assertion must go to 1 rather than
  // drift silently. Zero would mean both emitters moved and the allowlist is
  // stale; three would mean a definer slipped into an allowlisted path. The
  // oklch derivation file names the channel only in prose, so it is not a hit
  // under syntactic adjudication — it stays allowlisted so a future emission
  // there is a reviewed change, not a silent one.
  assert.equal(
    allowlistedHits,
    2,
    `expected exactly the two compiler emissions, saw ${allowlistedHits}`,
  );
});

test('the definer allowlist cannot grow without touching this test', () => {
  assert.deepEqual(DEFINER_ALLOWLIST, [
    'infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
    'infrastructure/compilers/kernel/runtime/appearance/index.ts',
    'foundation/kernel/color/oklch/chart-series/index.ts',
  ]);
});

test('--check exits 0 on the current tree', () => {
  const result = spawnSync(process.execPath, [gate, '--check'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /violations: 0/);
  assert.match(result.stdout, /allowlisted definer occurrences: 2/);
});
