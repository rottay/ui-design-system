/**
 * Self-test for chart-series-reserved-name-gate.mjs (W5 palette seam).
 *
 * Unit-drills the comment stripper and violation finder against in-memory
 * fixtures, then integration-checks the real tree: the authored runtime must
 * contain zero definitions of the reserved `--ds-chart-series-N` channel and
 * the sanctioned compiler emission must be visible to (and absorbed by) the
 * allowlist — proving the gate would bite if the emitter moved.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  DEFINER_ALLOWLIST,
  findViolations,
  runGate,
  stripComments,
} from './chart-series-reserved-name-gate.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'chart-series-reserved-name-gate.mjs');

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
});

test('a CSS declaration of the reserved channel flags with position', () => {
  const css = [
    '.scope {',
    '  --ds-chart-series-3: var(--ds-chart-category-3, #b24d3a);',
    '}',
  ].join('\n');
  const violations = findViolations(css, '.css');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 2);
  assert.match(violations[0].excerpt, /--ds-chart-series-3:/);
});

test('a TS style key or template assignment of the reserved channel flags', () => {
  const styleKey = "const style = { '--ds-chart-series-1': color };";
  assert.equal(findViolations(styleKey, '.tsx').length, 1);

  const template = 'vars[`--ds-chart-series-${index + 1}`] = color;';
  assert.equal(findViolations(template, '.ts').length, 1);
});

test('comment prose about the reserved channel never flags', () => {
  const commented = [
    '/* --ds-chart-series-1 is reserved for the compiler */',
    '// never define --ds-chart-series-2 locally',
    "const consumption = 'var(--ds-chart-series-2, #123456)';",
  ].join('\n');
  assert.deepEqual(findViolations(commented, '.ts'), []);
});

test('comment stripping preserves line positions', () => {
  const source = '/* one\ntwo */\n--ds-chart-series-4: red;';
  const stripped = stripComments(source, '.css');
  assert.equal(stripped.split('\n').length, source.split('\n').length);
  const violations = findViolations(source, '.css');
  assert.equal(violations.length, 1);
  assert.equal(violations[0].line, 3);
});

test('the real tree has zero violations and a live allowlisted emitter', () => {
  const { findings, scanned, allowlistedHits } = runGate();
  assert.deepEqual(findings, []);
  assert.ok(scanned > 100, `expected a real scan, saw ${scanned} files`);
  // The appearance compiler emission must still be caught by the scanner and
  // absorbed by the allowlist; zero hits would mean the emitter moved and the
  // allowlist entry is stale.
  assert.ok(
    allowlistedHits >= 1,
    `expected the sanctioned emitter to register, saw ${allowlistedHits}`,
  );
  assert.ok(DEFINER_ALLOWLIST.length >= 1);
});

test('--check exits 0 on the current tree', () => {
  const result = spawnSync(process.execPath, [gate, '--check'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /violations: 0/);
});
