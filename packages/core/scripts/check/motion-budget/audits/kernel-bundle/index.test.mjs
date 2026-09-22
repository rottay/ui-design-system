/**
 * DRILL for `kernel-bundle`.
 *
 * Two live arms over the built `dist/`, and a planted negative that proves the
 * VERDICT reddens -- not merely that the measurement differs. The planted arm is
 * the regression the externals-only predicate could not catch: adding
 * `MotionProvider` to the fixture bundles framer-motion/motion-dom modules while
 * its external set stays inside any react-shaped allowance.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { measureFixture, readBudget, verdictForBundle } from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../..');
const budget = readBudget();

/** A green measurement shaped like the instrument's real output. */
const green = {
  exports: budget.exports,
  entryEsm: budget.entryEsm,
  rawBytes: 9000,
  gzipBytes: 3400,
  externalImports: ['react'],
  retainedModuleIds: ['src/graphics/motion/react/runtime/layout/facade/index.ts'],
  retainedNodeModules: [],
  kernelModulesRetained: ['src/graphics/motion/react/runtime/layout/facade/index.ts'],
};

test('the budget pins the instrument, the entry, the export list AND the seed together', () => {
  assert.equal(budget.entryEsm, 'dist/index.js');
  assert.deepEqual(budget.instrument.external, ['react', '^react/']);
  assert.equal(budget.instrument.compression, 'zlib.gzipSync(code, { level: 9 })');
  assert.equal(budget.maxGzipBytes, 8192);
  assert.equal(budget.maxRetainedNodeModules, 0);
  assert.ok(budget.exports.length > 0);
  // The seed is meaningless without ITS OWN export list: three arms of the same
  // instrument differ by 731 B purely by naming different exports.
  assert.deepEqual(budget.seed.exports, ['useFlipLayout', 'usePresence', 'useReducedMotion']);
  assert.equal(budget.seed.gzipBytes, 2631);
  assert.equal(budget.seed.rawBytes, 6802);
  assert.ok(budget.rationale.includes('retainedNodeModules === 0'));
  // Declared and unseeded, with the reason: a delta needs a dist that carries the
  // kernel, which is the post-build window this lot does not own.
  assert.equal(budget.ratchet.deltaGzipBytes, null);
  assert.match(budget.ratchet.rationale, /post-build/u);
});

test('a green measurement passes every arm', () => {
  assert.deepEqual(verdictForBundle(green, budget).failures, []);
});

test('DRILL: one retained node_modules module is RED, even inside the byte cap', () => {
  const verdict = verdictForBundle({
    ...green,
    retainedNodeModules: ['node_modules/motion-dom/dist/es/animation/utils/resolve-transition.mjs'],
  }, budget);
  assert.equal(verdict.ok, false);
  assert.ok(verdict.failures.some((failure) => failure.arm === 'retainedNodeModules'));
});

test('DRILL: an external outside the allowance is RED, and react/* stays inside it', () => {
  assert.deepEqual(
    verdictForBundle({ ...green, externalImports: ['react', 'react/jsx-runtime'] }, budget).failures,
    [],
  );
  const foreign = verdictForBundle({ ...green, externalImports: ['react', 'motion/react'] }, budget);
  assert.ok(foreign.failures.some((failure) => failure.arm === 'externalImports'));
});

test('DRILL: the 8 KB cap and the seed delta are both RED when exceeded', () => {
  const fat = verdictForBundle({ ...green, gzipBytes: 8193 }, budget);
  assert.ok(fat.failures.some((failure) => failure.arm === 'gzipBytes'));
  assert.ok(fat.failures.some((failure) => failure.arm === 'delta') === false,
    'the delta cap is 8192 B over a 2631 B seed, so 8193 B trips the cap arm only');

  const overDelta = verdictForBundle({ ...green, gzipBytes: budget.seed.gzipBytes + budget.maxDeltaGzipBytes + 1 }, budget);
  assert.ok(overDelta.failures.some((failure) => failure.arm === 'delta'));
});

test('DRILL: a seeded decrease-only delta ceiling is RED when the delta grows past it', () => {
  const ratcheted = { ...budget, ratchet: { deltaGzipBytes: 700 } };
  const verdict = verdictForBundle({ ...green, gzipBytes: budget.seed.gzipBytes + 900 }, ratcheted);
  assert.ok(verdict.failures.some((failure) => failure.arm === 'ratchet.delta'));
  assert.deepEqual(
    verdictForBundle({ ...green, gzipBytes: budget.seed.gzipBytes + 600 }, ratcheted).failures,
    [],
  );
});

test('DRILL: a fixture that resolved none of the kernel is RED, not a perfect score', () => {
  const empty = verdictForBundle({
    ...green,
    gzipBytes: 40,
    rawBytes: 60,
    retainedModuleIds: [],
    kernelModulesRetained: [],
  }, budget);
  assert.equal(empty.ok, false);
  assert.ok(empty.failures.some((failure) => failure.arm === 'exportsResolved'));
});

test('LIVE: the seed fixture over dist retains zero supplier modules and only react externally', async () => {
  const measurement = await measureFixture({ exports: budget.seed.exports, entryEsm: budget.entryEsm });
  assert.deepEqual(measurement.retainedNodeModules, [],
    'the reduced-motion barrel edge must stay shaken; this is the arm that guards it');
  assert.deepEqual(measurement.externalImports, ['react']);
  assert.ok(measurement.gzipBytes > 0 && measurement.rawBytes > measurement.gzipBytes);
});

test('LIVE PLANTED NEGATIVE: MotionProvider retains the supplier, and the verdict reddens on it', async () => {
  const planted = await measureFixture({
    exports: [...budget.seed.exports, 'MotionProvider'],
    entryEsm: budget.entryEsm,
  });

  assert.ok(planted.retainedNodeModules.length > 0, 'the plant must actually retain the supplier');
  assert.ok(
    planted.retainedNodeModules.some((id) => /framer-motion|motion-dom/u.test(id)),
    `expected a framer-motion/motion-dom module; got ${JSON.stringify(planted.retainedNodeModules)}`,
  );

  // THE POINT: its external set is inside a react-shaped allowance, so an
  // externals-only predicate passes the exact regression it was written to catch.
  assert.deepEqual(planted.externalImports, ['react', 'react/jsx-runtime']);
  const externalsOnlyWouldPass = planted.externalImports.every(
    (specifier) => specifier === 'react' || specifier.startsWith('react/'),
  );
  assert.equal(externalsOnlyWouldPass, true);

  // And the verdict function -- the thing the gate runs -- goes red anyway.
  const verdict = verdictForBundle({ ...planted, kernelModulesRetained: green.kernelModulesRetained }, budget);
  assert.equal(verdict.ok, false);
  assert.ok(verdict.failures.some((failure) => failure.arm === 'retainedNodeModules'));
});

test('the reduced-motion barrel edge this gate guards is still the real shape', () => {
  const reducedMotion = readFileSync(
    join(PACKAGE_ROOT, 'src/graphics/motion/react/runtime/foundation/reduced-motion/index.ts'),
    'utf8',
  );
  assert.match(reducedMotion, /@\/infrastructure\/runtime\/motion/u);
  const facade = readFileSync(join(PACKAGE_ROOT, 'src/infrastructure/runtime/motion/facade/index.ts'), 'utf8');
  assert.match(facade, /MotionProvider/u);
});
