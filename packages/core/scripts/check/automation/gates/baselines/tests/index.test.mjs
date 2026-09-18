/**
 * The drill for baseline discipline.
 *
 * This gate exists because a green ratchet says nothing about its size, and
 * because two of the audit's findings are moves that already landed quietly:
 * a ceiling widened by name and sixteen APCA pairings shipped under their own
 * floor. So the mutants below are the next instance of each: a ledger that
 * widens without declaring it, a new pairing slipped onto the contrast list, a
 * new anonymous ledger, and a debt walk that stopped walking.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  ANONYMOUS_LEDGERS,
  EXTRA_LEDGERS,
  PINNED_APCA_PAIRS,
  WIDENINGS,
  apcaKeys,
  debtOf,
  describeDebt,
  evaluate,
  measure,
} from '../index.mjs';
import { CI_GATES } from '../../manifest/index.mjs';
import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

function sandbox(files) {
  const dir = mkdtempSync(join(tmpdir(), 'evi02-baselines-'));
  sandboxes.push(dir);
  // Every sandbox carries a well-formed APCA ledger unless the case replaces
  // it: a missing one is its own finding, and a case about widenings should
  // not also be reporting that.
  const planted = {
    [EXTRA_LEDGERS[0].path]: {
      purpose: 'the fixture stand-in for the APCA contrast ledger'.padEnd(45, '.'),
      knownFailures: PINNED_APCA_PAIRS.map((key) => ({ key })),
    },
    ...files,
  };
  for (const [relative, content] of Object.entries(planted)) {
    const target = join(dir, relative);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  }
  return dir;
}

const LEDGER = 'scripts/check/fixture/baseline/index.json';
const gate = (over = {}) => ({ id: 'fixture-gate', ratchet: LEDGER, ...over });
const cleanApca = { apca: { actual: [...PINNED_APCA_PAIRS], pinned: [...PINNED_APCA_PAIRS] } };

describe('baseline discipline — the measurement', () => {
  it('the real tree passes its own law', () => {
    const rows = measure({ gates: CI_GATES });
    const failures = evaluate(rows, { apca: { actual: apcaKeys(), pinned: [...PINNED_APCA_PAIRS] } });
    assert.deepEqual(failures, [], failures.join('\n'));
  });

  it('every ratcheted gate in the roster is in the walk', () => {
    const rows = measure({ gates: CI_GATES });
    for (const entry of CI_GATES.filter((item) => item.ratchet)) {
      assert.ok(rows.some((row) => row.id === entry.id), `${entry.id} is ratcheted and unwalked`);
    }
    assert.ok(rows.some((row) => row.kind === 'build-ledger'), 'the APCA ledger is not a roster ratchet');
  });

  it('the debt walk counts numeric leaves and list lengths, and skips prose', () => {
    const dir = sandbox({ [LEDGER]: { purpose: 'x'.repeat(40), a: 3, b: 0, findings: ['one', 'two'] } });
    const debt = debtOf(join(dir, LEDGER));
    assert.equal(debt.counters, 3);
    assert.equal(debt.frozen, 5);
    assert.equal(debt.atZero, 1);
    assert.match(describeDebt(LEDGER, dir), /debtRatio 66\.7%/u);
  });

  it('the pinned APCA set is exactly what the ledger ships today', () => {
    assert.deepEqual([...apcaKeys()].sort(), [...PINNED_APCA_PAIRS].sort());
  });
});

describe('baseline discipline drills — the next quiet move is refused', () => {
  it('MUTANT: a ledger that widens without being declared', () => {
    const dir = sandbox({
      [LEDGER]: { purpose: 'a'.repeat(40), lastMoveKind: 'ampliacion autorizada (--widen): +3', count: 1 },
    });
    const failures = evaluate(measure({ root: dir, gates: [gate()] }), cleanApca);
    assert.ok(failures.some((line) => line.includes('records a WIDENING and is not declared')), failures.join(' | '));
  });

  it('a DECREASE that merely says the word is NOT accused (the dead-writers case)', () => {
    const dir = sandbox({
      [LEDGER]: {
        purpose: 'b'.repeat(40),
        lastMove: 'Es una BAJADA del ancla, 275 -> 273, y no amplia nada.',
        lastMoveKind: 'decrece-solo: -2 nombre(s)',
        count: 1,
      },
    });
    const failures = evaluate(measure({ root: dir, gates: [gate()] }), cleanApca);
    assert.deepEqual(failures, [], `the classifier must read lastMoveKind, not the prose: ${failures.join(' | ')}`);
  });

  it('MUTANT: a declared widening whose ledger no longer widens must be removed', () => {
    const dir = sandbox({ [LEDGER]: { purpose: 'c'.repeat(40), lastMoveKind: 'decrece-solo', count: 1 } });
    const failures = evaluate(
      measure({ root: dir, gates: [gate({ id: WIDENINGS[0].id })] }),
      cleanApca,
    );
    assert.ok(failures.some((line) => line.includes('remove the entry')), failures.join(' | '));
  });

  it('MUTANT: a NEW anonymous ledger is refused, an already-listed one is not', () => {
    const dir = sandbox({ [LEDGER]: { count: 1 } });
    const anonymous = evaluate(measure({ root: dir, gates: [gate()] }), cleanApca);
    assert.ok(anonymous.some((line) => line.includes('states no purpose')), anonymous.join(' | '));

    const listed = evaluate(measure({ root: dir, gates: [gate({ id: ANONYMOUS_LEDGERS[0] })] }), cleanApca);
    assert.ok(!listed.some((line) => line.includes('states no purpose')), 'a listed ledger is debt, not a new defect');
  });

  it('MUTANT: a listed ledger that STARTED naming its subject must leave the list', () => {
    const dir = sandbox({ [LEDGER]: { purpose: 'd'.repeat(40), count: 1 } });
    const failures = evaluate(measure({ root: dir, gates: [gate({ id: ANONYMOUS_LEDGERS[0] })] }), cleanApca);
    assert.ok(failures.some((line) => line.includes('keeps shrinking')), failures.join(' | '));
  });

  it('MUTANT: a seventeenth APCA pairing is a new shipped accessibility defect', () => {
    const dir = sandbox({ [LEDGER]: { purpose: 'e'.repeat(40), count: 1 } });
    const failures = evaluate(measure({ root: dir, gates: [gate()] }), {
      apca: { actual: [...PINNED_APCA_PAIRS, 'bithire|dark|--ds-color-primary-900'], pinned: [...PINNED_APCA_PAIRS] },
    });
    assert.ok(failures.some((line) => line.includes('is a NEW pairing')), failures.join(' | '));
  });

  it('MUTANT: an APCA pairing that got FIXED must be unpinned in the same commit', () => {
    const dir = sandbox({ [LEDGER]: { purpose: 'f'.repeat(40), count: 1 } });
    // PINNED_APCA_PAIRS drained to empty on 2026-09-15, so there is no real
    // pair to slice off: synthesize the pinned-set state the mutant describes
    // (a pair on the pin that the ledger no longer ships) instead of slicing
    // an empty list, which would make actual === pinned and assert nothing.
    const pinned = ['rottay|base|--ds-color-fixed-900'];
    const failures = evaluate(measure({ root: dir, gates: [gate()] }), {
      apca: { actual: [], pinned },
    });
    assert.ok(failures.some((line) => line.includes('is pinned and no longer on the ledger')), failures.join(' | '));
  });

  it('MUTANT: a missing ledger is named, never counted as zero debt', () => {
    const dir = sandbox({ 'package.json': '{"name":"fixture"}' });
    const failures = evaluate(measure({ root: dir, gates: [gate()] }), cleanApca);
    assert.ok(
      failures.some((line) => line.startsWith('fixture-gate:') && line.includes('baseline missing')),
      failures.join(' | '),
    );
  });

  it('MUTANT: an empty inventory is a broken walk, not a clean tree', () => {
    assert.ok(evaluate([], cleanApca).some((line) => line.includes('the inventory walk is broken')));
  });
});
