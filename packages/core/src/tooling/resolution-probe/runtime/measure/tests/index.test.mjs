/**
 * @fileoverview Drills for the reading-stability law (H-3a).
 *
 * Run: node --test src/tooling/resolution-probe/runtime/measure/tests/index.test.mjs
 *
 * No browser. What is under test is which ANSWERS the law refuses, and driving
 * Chromium to ask that would be testing Chromium instead of the rule.
 *
 * THE DEFECT THIS EXISTS FOR, measured before it was fixed: after an inline
 * write on the document element the DEPENDENT computed properties came back one
 * phase behind -- the mutation read returned the baseline values and the removal
 * read returned the mutation values -- while the custom property itself was
 * always current. A run built on that reports a live control as INERT, which is
 * the worst sentence this harness can pass. Evidence:
 * test-artifacts/quality-evidence/wo-cra-23/H3/isolation.MEASURED-NOT-RECEIPTED.json
 *
 * @module Tooling/ResolutionProbe/Runtime/Measure/Tests
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readUntilStable } from '../index.mjs';

/** A reader that yields the given answers in order, then repeats the last. */
function scriptedReader(answers) {
  let index = 0;
  const calls = [];
  const read = async () => {
    const value = answers[Math.min(index, answers.length - 1)];
    index += 1;
    calls.push(value);
    return value;
  };
  return { read, calls: () => calls };
}

test('H-3a drill 1: a settled page is accepted, and after the SECOND agreement', async () => {
  const reader = scriptedReader([{ a: 1 }]);
  let invalidations = 0;
  const value = await readUntilStable(reader.read, async () => {
    invalidations += 1;
  });
  assert.deepEqual(value, { a: 1 });
  // Three reads: the first has nothing to agree with, then two agreements.
  assert.equal(reader.calls().length, 3);
  // And the agreements were separated by provocation, not taken back to back:
  // agreeing because the page was polled too fast is exactly the failure this
  // law replaces.
  assert.equal(invalidations, 2);
});

test('H-3a drill 2: a page that never settles THROWS, and never returns its last answer', async () => {
  // The negative that matters. Before H-3a the harness returned whatever the
  // single read said; a document still recalculating would have had its stale
  // answer recorded as a measurement, and every dependent property with it.
  let n = 0;
  const read = async () => ({ n: (n += 1) });
  await assert.rejects(
    () => readUntilStable(read, async () => {}),
    /never produced two consecutive identical readings/,
    'an unstable document is a finding, not a measurement',
  );
});

test('H-3a drill 3: one agreement is NOT enough -- the plateau is why', async () => {
  // Measured: the page settles in STAGES. A chain whose second hop has not
  // recalculated yet reads identically twice on an intermediate plateau. With
  // `agreements: 1` this reader is accepted at the plateau value; the shipped
  // default of 2 is what makes the law demand more than a repeat.
  const plateau = [{ v: 'stale' }, { v: 'stale' }, { v: 'settled' }, { v: 'settled' }, { v: 'settled' }];
  const loose = await readUntilStable(scriptedReader(plateau).read, async () => {}, { agreements: 1 });
  assert.deepEqual(loose, { v: 'stale' }, 'one agreement accepts the plateau');

  const strict = await readUntilStable(scriptedReader(plateau).read, async () => {}, { agreements: 2 });
  assert.deepEqual(strict, { v: 'settled' }, 'two agreements walk past it');
});

test('H-3a drill 4: the attempt budget is a ceiling, not a target', async () => {
  // A page that settles immediately must not pay for the budget, and a budget
  // of one can never satisfy a law that needs two readings to compare.
  const reader = scriptedReader([{ ok: true }]);
  await readUntilStable(reader.read, async () => {}, { attempts: 8 });
  assert.equal(reader.calls().length, 3, 'a settled page costs three reads regardless of the budget');

  await assert.rejects(
    () => readUntilStable(scriptedReader([{ ok: true }]).read, async () => {}, { attempts: 1 }),
    /never produced two consecutive identical readings/,
  );
});
