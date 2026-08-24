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

import {
  deliverInlineOnFreshDocument,
  FRESH_DELIVERY_MARKER,
  readUntilStable,
} from '../index.mjs';

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

// ---------------------------------------------------------------------------
// H3C — the DB arm's write is DELIVERED to a document that has computed nothing
//
// What a browser then does with that document is measured, not drilled:
// test-artifacts/quality-evidence/wo-cra-23/H3/residual-isolation.MEASURED-NOT-RECEIPTED.json
// compares the three deliveries on one scene and one bundle, and the six
// typography.scale scenarios show the divergence gone. A drill that launched
// Chromium to re-ask that would be testing Chromium.
//
// What IS a rule, and therefore belongs here: the delivery only fires for the
// document that asked for it, it writes exactly the planned ops and nothing
// else, and when the document element does not exist yet the write is deferred
// rather than dropped. These run the SAME function the page runs -- a second
// copy of it in a test could pass while the shipped one drifted.
// ---------------------------------------------------------------------------

/** The smallest document the delivery can tell apart from a real one. */
function fakeDocument({ withElement = true } = {}) {
  const declarations = [];
  const listeners = [];
  const style = {
    setProperty: (name, value, priority) => declarations.push({ name, value, priority }),
    removeProperty: (name) => declarations.push({ name, removed: true }),
  };
  return {
    documentElement: withElement ? { style } : null,
    addEventListener: (type, handler, options) => listeners.push({ type, handler, options }),
    declarations: () => declarations,
    listeners: () => listeners,
    // Lets a test hand the element over the way a parser does, then fire.
    attach: (target) => {
      target.documentElement = { style };
    },
  };
}

/** Installs fake browser globals for one call and always puts them back. */
async function inDocument({ search, document: fake }, run) {
  const priorLocation = globalThis.location;
  const priorDocument = globalThis.document;
  globalThis.location = { search };
  globalThis.document = fake;
  try {
    return await run();
  } finally {
    globalThis.location = priorLocation;
    globalThis.document = priorDocument;
  }
}

test('H3C drill 4: the delivery fires ONLY for the document that carries the marker', async () => {
  // The removal phase is a navigation without the marker. If this ever fired
  // unconditionally, removal would silently re-apply the mutation and the
  // restore comparison -- the harness's own honesty check -- would compare the
  // mutated page against itself and always pass.
  const fake = fakeDocument();
  await inDocument({ search: '?phase=removal', document: fake }, () =>
    deliverInlineOnFreshDocument({
      marker: FRESH_DELIVERY_MARKER,
      ops: [{ op: 'set', name: '--ds-type-scale', value: '0.94', priority: '' }],
    }),
  );
  assert.deepEqual(fake.declarations(), [], 'a document without the marker is left untouched');
  assert.deepEqual(fake.listeners(), [], 'and nothing is queued for later either');
});

test('H3C drill 5: the marked document gets exactly the planned write, priority included', async () => {
  const fake = fakeDocument();
  await inDocument({ search: `?phase=mutation&${FRESH_DELIVERY_MARKER}`, document: fake }, () =>
    deliverInlineOnFreshDocument({
      marker: FRESH_DELIVERY_MARKER,
      ops: [
        { op: 'set', name: '--ds-type-scale', value: '0.94', priority: '' },
        { op: 'set', name: '--ds-rhythm-scale', value: '0.85', priority: 'important' },
        { op: 'remove', name: '--ds-stale', value: undefined, priority: '' },
        // The memo's attribute op belongs to the live-mutation restore, which a
        // fresh document does not need and must not act on: there is no `style`
        // attribute to take away from a document that never had one.
        { op: 'remove-attribute', name: 'style' },
      ],
    }),
  );
  assert.deepEqual(fake.declarations(), [
    { name: '--ds-type-scale', value: '0.94', priority: '' },
    { name: '--ds-rhythm-scale', value: '0.85', priority: 'important' },
    { name: '--ds-stale', removed: true },
  ]);
});

test('H3C drill 6: with no document element yet the write is DEFERRED, never dropped', async () => {
  // This is the ordering the whole packet rests on. An init script runs when
  // the document is created, which is before the parser has made
  // documentElement; dropping the write there would put it back after the page
  // had already computed -- the live mutation, reintroduced by accident.
  const fake = fakeDocument({ withElement: false });
  await inDocument({ search: `?phase=mutation&${FRESH_DELIVERY_MARKER}`, document: fake }, () => {
    deliverInlineOnFreshDocument({
      marker: FRESH_DELIVERY_MARKER,
      ops: [{ op: 'set', name: '--ds-type-scale', value: '1.06', priority: '' }],
    });
    assert.deepEqual(fake.declarations(), [], 'nothing can be written yet');
    assert.equal(fake.listeners().length, 1);
    const [queued] = fake.listeners();
    assert.equal(queued.type, 'DOMContentLoaded');
    assert.deepEqual(
      queued.options,
      { once: true },
      'a write that could run twice is a write nobody can reason about',
    );

    // The parser hands over the element, then the event fires -- still before
    // anything has been read out of the document.
    fake.attach(fake);
    queued.handler();
  });
  assert.deepEqual(fake.declarations(), [
    { name: '--ds-type-scale', value: '1.06', priority: '' },
  ]);
});
