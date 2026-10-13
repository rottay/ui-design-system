import assert from 'node:assert/strict';
import test from 'node:test';

import {
  adoptNewZeroPathCounters,
  parseGitRenameStatus,
  parseSplitArguments,
  relocatePathKeyedCounters,
  splitPathKeyedCounters,
} from './index.mjs';

test('parses only renames that stay within the governed UI root', () => {
  const output = [
    'R100\tpackages/core/src/components/surfaces/pages/index.ts\tpackages/core/src/components/surfaces/presentation/pages/index.ts',
    'M\tpackages/core/src/components/primitives/index.ts',
    'R100\tREADME.md\tdocs/README.md',
  ].join('\n');
  assert.deepEqual(parseGitRenameStatus(output, {
    repositoryRoot: '/repo',
    oldRoot: 'packages/core/src/components',
  }), [{
    from: 'surfaces/pages/index.ts',
    to: 'surfaces/presentation/pages/index.ts',
  }]);
});

test('projects a physical root migration into old and new relative identities', () => {
  const output = 'R100\tpackages/core/src/ui/primitives/Button/index.tsx\tpackages/core/src/components/primitives/inputs/Button/index.tsx\n';
  assert.deepEqual(parseGitRenameStatus(output, {
    repositoryRoot: '/repo',
    oldRoot: 'packages/core/src/ui',
    newRoot: 'packages/core/src/components',
  }), [{
    from: 'primitives/Button/index.tsx',
    to: 'primitives/inputs/Button/index.tsx',
  }]);
});

test('relocates path-keyed counters without changing ceilings or entry order', () => {
  const source = {
    'motion.rawDurationLiterals': 0,
    'fleet.inlinePaint.surfaces/pages/index.ts': 3,
    'runtimeSvgPaint.surfaces/pages/index.ts': 0,
  };
  const result = relocatePathKeyedCounters(source, [{
    from: 'surfaces/pages/index.ts',
    to: 'surfaces/presentation/pages/index.ts',
  }]);
  assert.deepEqual(result.baseline, {
    'motion.rawDurationLiterals': 0,
    'fleet.inlinePaint.surfaces/presentation/pages/index.ts': 3,
    'runtimeSvgPaint.surfaces/presentation/pages/index.ts': 0,
  });
  assert.equal(result.relocated.length, 2);
});

test('refuses a relocation that would overwrite another governed counter', () => {
  assert.throws(() => relocatePathKeyedCounters({
    'fleet.inlinePaint/a': 0,
    'fleet.inlinePaint/a-moved': 0,
  }, [{ from: 'a', to: 'a-moved' }], {
    prefixes: ['fleet.inlinePaint/'],
  }), /collision/u);
});

test('adopts only new zero-locked path counters and reports positive counters', () => {
  const result = adoptNewZeroPathCounters({}, {
    'fleet.inlinePaint.new-zero.ts': 0,
    'runtimeSvgPaint.new-positive.tsx': 1,
    'motion.rawDurationLiterals': 0,
  });
  assert.deepEqual(result.baseline, { 'fleet.inlinePaint.new-zero.ts': 0 });
  assert.deepEqual(result.adopted, ['fleet.inlinePaint.new-zero.ts']);
  assert.deepEqual(result.refused, [{ key: 'runtimeSvgPaint.new-positive.tsx', value: 1 }]);
});

const SPLIT_BASELINE = Object.freeze({
  'motion.rawDurationLiterals': 0,
  'fleet.inlinePaint.charts/geometry/index.ts': 3,
  'runtimeSvgPaint.charts/geometry/index.ts': 0,
  'fleet.inlinePaint.charts/other/index.ts': 1,
});
const SPLIT_PARTS = Object.freeze({
  from: 'charts/geometry/index.ts',
  to: ['charts/geometry/bar/index.ts', 'charts/geometry/pie/index.ts'],
});
const SPLIT_MEASURED = Object.freeze({
  'fleet.inlinePaint.charts/geometry/index.ts': 0,
  'runtimeSvgPaint.charts/geometry/index.ts': 0,
  'fleet.inlinePaint.charts/geometry/bar/index.ts': 2,
  'runtimeSvgPaint.charts/geometry/bar/index.ts': 0,
  'fleet.inlinePaint.charts/geometry/pie/index.ts': 1,
  'runtimeSvgPaint.charts/geometry/pie/index.ts': 0,
});

test('parses split arguments and refuses a malformed one', () => {
  assert.deepEqual(parseSplitArguments([]), []);
  assert.deepEqual(parseSplitArguments(['a/index.ts=a/b/index.ts, a/c/index.ts']), [{
    from: 'a/index.ts',
    to: ['a/b/index.ts', 'a/c/index.ts'],
  }]);
  for (const value of ['a/index.ts', '=a/b/index.ts', 'a/index.ts=', 'a/index.ts=a/b/index.ts,']) {
    assert.throws(() => parseSplitArguments([value]), /--split expects/u);
  }
});

test('distributes one ceiling over its measured parts and changes nothing else', () => {
  const result = splitPathKeyedCounters(SPLIT_BASELINE, SPLIT_MEASURED, [SPLIT_PARTS]);
  assert.deepEqual(Object.entries(result.baseline), [
    ['motion.rawDurationLiterals', 0],
    ['fleet.inlinePaint.charts/geometry/index.ts', 0],
    ['fleet.inlinePaint.charts/geometry/bar/index.ts', 2],
    ['fleet.inlinePaint.charts/geometry/pie/index.ts', 1],
    ['runtimeSvgPaint.charts/geometry/index.ts', 0],
    ['runtimeSvgPaint.charts/geometry/bar/index.ts', 0],
    ['runtimeSvgPaint.charts/geometry/pie/index.ts', 0],
    ['fleet.inlinePaint.charts/other/index.ts', 1],
  ]);
  assert.deepEqual(result.distributed.map((entry) => [entry.from, entry.ceiling, entry.retained]), [
    ['fleet.inlinePaint.charts/geometry/index.ts', 3, true],
    ['runtimeSvgPaint.charts/geometry/index.ts', 0, true],
  ]);
  const sum = (record) => Object.values(record).reduce((total, value) => total + value, 0);
  assert.equal(sum(result.baseline), sum(SPLIT_BASELINE));
});

test('removes the old key when the split leaves no file behind', () => {
  const measured = { ...SPLIT_MEASURED };
  delete measured['fleet.inlinePaint.charts/geometry/index.ts'];
  delete measured['runtimeSvgPaint.charts/geometry/index.ts'];
  const result = splitPathKeyedCounters(SPLIT_BASELINE, measured, [SPLIT_PARTS]);
  assert.equal(Object.hasOwn(result.baseline, 'fleet.inlinePaint.charts/geometry/index.ts'), false);
  assert.equal(result.baseline['fleet.inlinePaint.charts/geometry/bar/index.ts'], 2);
  assert.equal(result.baseline['fleet.inlinePaint.charts/geometry/pie/index.ts'], 1);
});

test('refuses a split whose measured parts do not sum to the old ceiling', () => {
  for (const pie of [0, 2]) {
    assert.throws(() => splitPathKeyedCounters(SPLIT_BASELINE, {
      ...SPLIT_MEASURED,
      'fleet.inlinePaint.charts/geometry/pie/index.ts': pie,
    }, [SPLIT_PARTS]), /not sum-preserving: fleet\.inlinePaint\.charts\/geometry\/index\.ts=3; measured parts sum to/u);
  }
  // A positive part under a zero ceiling is a new counter, not a split.
  assert.throws(() => splitPathKeyedCounters(SPLIT_BASELINE, {
    ...SPLIT_MEASURED,
    'runtimeSvgPaint.charts/geometry/pie/index.ts': 1,
  }, [SPLIT_PARTS]), /not sum-preserving: runtimeSvgPaint\./u);
});

test('refuses a split part that carries no measured count', () => {
  const measured = { ...SPLIT_MEASURED };
  delete measured['fleet.inlinePaint.charts/geometry/pie/index.ts'];
  assert.throws(
    () => splitPathKeyedCounters(SPLIT_BASELINE, measured, [SPLIT_PARTS]),
    /no measured count: fleet\.inlinePaint\.charts\/geometry\/pie\/index\.ts/u,
  );
  assert.throws(() => splitPathKeyedCounters(SPLIT_BASELINE, {
    ...SPLIT_MEASURED,
    'fleet.inlinePaint.charts/geometry/pie/index.ts': '1',
  }, [SPLIT_PARTS]), /no measured count/u);
});

test('refuses a split that would hide a residue, a collision or a missing ceiling', () => {
  assert.throws(() => splitPathKeyedCounters(SPLIT_BASELINE, {
    ...SPLIT_MEASURED,
    'fleet.inlinePaint.charts/geometry/index.ts': 1,
    'fleet.inlinePaint.charts/geometry/pie/index.ts': 0,
  }, [SPLIT_PARTS]), /source still measures 1/u);
  assert.throws(() => splitPathKeyedCounters({
    ...SPLIT_BASELINE,
    'fleet.inlinePaint.charts/geometry/bar/index.ts': 2,
  }, SPLIT_MEASURED, [SPLIT_PARTS]), /collision/u);
  assert.throws(() => splitPathKeyedCounters(SPLIT_BASELINE, SPLIT_MEASURED, [{
    from: 'charts/absent/index.ts',
    to: SPLIT_PARTS.to,
  }]), /no ceiling to distribute/u);
  assert.throws(() => splitPathKeyedCounters(SPLIT_BASELINE, SPLIT_MEASURED, [SPLIT_PARTS, SPLIT_PARTS]), /twice/u);
  assert.throws(() => splitPathKeyedCounters(SPLIT_BASELINE, SPLIT_MEASURED, [{
    from: SPLIT_PARTS.from,
    to: [...SPLIT_PARTS.to, SPLIT_PARTS.to[0]],
  }]), /twice/u);
  assert.throws(() => splitPathKeyedCounters(SPLIT_BASELINE, SPLIT_MEASURED, [{
    from: SPLIT_PARTS.from,
    to: [SPLIT_PARTS.from],
  }]), /split source/u);
});

test('a split leaves the positive refusal of an unnamed new counter standing', () => {
  const measured = { ...SPLIT_MEASURED, 'fleet.inlinePaint.charts/geometry/gauge/index.ts': 1 };
  const split = splitPathKeyedCounters(SPLIT_BASELINE, measured, [SPLIT_PARTS]);
  const adoption = adoptNewZeroPathCounters(split.baseline, measured);
  assert.deepEqual(adoption.adopted, []);
  assert.deepEqual(adoption.refused, [{ key: 'fleet.inlinePaint.charts/geometry/gauge/index.ts', value: 1 }]);
});

test('an empty split list is inert', () => {
  const result = splitPathKeyedCounters(SPLIT_BASELINE, {}, []);
  assert.equal(JSON.stringify(result.baseline), JSON.stringify(SPLIT_BASELINE));
  assert.deepEqual(result.distributed, []);
});
