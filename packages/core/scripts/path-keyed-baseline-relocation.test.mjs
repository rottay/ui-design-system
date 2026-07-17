import assert from 'node:assert/strict';
import test from 'node:test';

import {
  adoptNewZeroPathCounters,
  parseGitRenameStatus,
  relocatePathKeyedCounters,
} from './lib/path-keyed-baseline-relocation.mjs';

test('parses only renames that stay within the governed UI root', () => {
  const output = [
    'R100\tpackages/core/src/ui/surfaces/pages/index.ts\tpackages/core/src/ui/surfaces/presentation/pages/index.ts',
    'M\tpackages/core/src/ui/primitives/index.ts',
    'R100\tREADME.md\tdocs/README.md',
  ].join('\n');
  assert.deepEqual(parseGitRenameStatus(output, {
    repositoryRoot: '/repo',
    oldRoot: 'packages/core/src/ui',
  }), [{
    from: 'surfaces/pages/index.ts',
    to: 'surfaces/presentation/pages/index.ts',
  }]);
});

test('projects a physical root migration into old and new relative identities', () => {
  const output = 'R100\tpackages/core/src/components/primitives/Button/index.tsx\tpackages/core/src/ui/primitives/inputs/Button/index.tsx\n';
  assert.deepEqual(parseGitRenameStatus(output, {
    repositoryRoot: '/repo',
    oldRoot: 'packages/core/src/components',
    newRoot: 'packages/core/src/ui',
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
