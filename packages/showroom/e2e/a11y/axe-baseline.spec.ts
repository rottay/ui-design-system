import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ADMISSIBLE_IMPACT,
  GROUNDS,
  INADMISSIBLE_IMPACT,
  intersect,
  ledgerKey,
  ledgerProblems,
  readLedger,
  SCENES,
  type Ledger,
} from './baseline';

// ---------------------------------------------------------------------------
// The browserless half of the route-level axe contract (WO-INV-03, Q10 + L5).
//
// The batch itself is a booked serial slot and is gated off; these laws are
// not, and run on every CI pass. Q10's ruling was BOTH: keep "blocking impact"
// in the prose so the acceptance grep still holds, AND assert over parsed JSON
// that no entry carries the impact L1 forbids — drilled by planting one, or the
// assertion is a comment.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const ledgerPath = join(here, 'axe-baseline.json');
const appRoot = resolve(here, '../../src/app/probe/ds-reference');

test.describe('route-level axe ledger — laws', () => {
  test('the matrix is 25 scenes x 2 grounds and every route exists', () => {
    // A roster derived by scanning shrinks silently when a route is deleted;
    // these are literals, and the disk is checked against them.
    expect(SCENES).toHaveLength(25);
    expect(new Set(SCENES).size).toBe(25);
    expect(GROUNDS).toEqual(['bithire', 'the-management']);
    for (const ground of GROUNDS) {
      for (const scene of SCENES) {
        expect(
          existsSync(join(appRoot, ground, scene, 'page.tsx')),
          `/probe/ds-reference/${ground}/${scene} has no page.tsx`,
        ).toBe(true);
      }
    }
  });

  test('the ledger is well formed and carries no inadmissible entry', () => {
    const ledger = readLedger(ledgerPath);
    expect(ledgerProblems(ledger)).toEqual([]);
    expect(ledger.matrix.scenes).toEqual([...SCENES]);
    expect(ledger.matrix.grounds).toEqual([...GROUNDS]);
  });

  test('Q10: the acceptance grep AND the parsed assertion both hold', () => {
    const raw = readFileSync(ledgerPath, 'utf8');
    // The acceptance command is `grep -c <impact> axe-baseline.json` = 0. It is
    // text-fragile by construction, which is why the assertion below exists.
    expect(raw.split(INADMISSIBLE_IMPACT).length - 1).toBe(0);
    for (const entry of Object.values(readLedger(ledgerPath).entries)) {
      expect(entry.impact).toBe(ADMISSIBLE_IMPACT);
    }
  });

  test('Q10 DRILL: planting an inadmissible entry is refused by the parsed assertion', () => {
    const ledger = readLedger(ledgerPath) as Ledger;
    const planted: Ledger = {
      ...ledger,
      entries: {
        ...ledger.entries,
        [ledgerKey('label', 'field', 'bithire', '.planted')]: {
          rule: 'label',
          impact: INADMISSIBLE_IMPACT,
          help: 'Form elements must have labels',
          scene: 'field',
          ground: 'bithire',
          target: '.planted',
          disposition: 'routed',
          owner: 'a fixture entry that exists only to be refused',
          wo: 'WO-INV-03',
        },
      },
    };
    const problems = ledgerProblems(planted);
    expect(problems.some((problem) => problem.startsWith('L1:'))).toBe(true);
    // ...and a grep over the same object's serialization sees it too, so the
    // two halves of Q10 agree about the same plant.
    expect(JSON.stringify(planted)).toContain(INADMISSIBLE_IMPACT);
  });

  test('L2 DRILL: an entry with no disposition, owner or WO is refused', () => {
    const ledger = readLedger(ledgerPath) as Ledger;
    const planted: Ledger = {
      ...ledger,
      entries: {
        [ledgerKey('color-contrast', 'field', 'bithire', '.x')]: {
          rule: 'color-contrast',
          impact: ADMISSIBLE_IMPACT,
          help: 'contrast',
          scene: 'field',
          ground: 'bithire',
          target: '.x',
        } as never,
      },
    };
    const problems = ledgerProblems(planted);
    expect(problems.filter((problem) => problem.startsWith('L2:'))).toHaveLength(3);
  });

  test('L3 DRILL: a key that disagrees with its own fields is refused', () => {
    const ledger = readLedger(ledgerPath) as Ledger;
    const planted: Ledger = {
      ...ledger,
      entries: {
        'color-contrast|field|bithire|.x': {
          rule: 'color-contrast',
          impact: ADMISSIBLE_IMPACT,
          help: 'contrast',
          scene: 'control',
          ground: 'bithire',
          target: '.x',
          disposition: 'routed',
          owner: 'the control-scene owner, named for this fixture',
          wo: 'WO-INV-03',
        },
      },
    };
    expect(ledgerProblems(planted).some((problem) => problem.startsWith('L3:'))).toBe(true);
  });

  test('L5 DRILL: a missing ledger throws and names the regeneration path', () => {
    expect(() => readLedger(join(here, 'axe-baseline.does-not-exist.json'))).toThrow(
      /not self-generating/,
    );
  });

  test('L5(ii) DRILL: the update path is intersection-only and can never add', () => {
    const recorded = { a: 1, b: 2 };
    const measuredNow = { b: 20, c: 30 };
    // `b` survives, `a` is dropped as repaired, `c` is refused as novel.
    expect(intersect(recorded, measuredNow)).toEqual({ b: 20 });
  });

  test('the deferred and retired pins are kept as evidence, not deleted', () => {
    const ledger = readLedger(ledgerPath);
    // Q4(b): the three rottay serious entries move to `deferred` with D-24
    // named, because their subject left the matrix. They are evidence.
    const deferred = Object.values(ledger.deferred) as { deferredUnder?: string }[];
    expect(deferred).toHaveLength(3);
    for (const entry of deferred) expect(entry.deferredUnder).toBe('D-24');
    // The two stale pins retired by WO-INV-04 are recorded with the
    // re-measurement they await; this batch does not inherit them.
    const retired = Object.values(ledger.retired) as { awaits?: string }[];
    expect(retired).toHaveLength(2);
    for (const entry of retired) expect(entry.awaits).toMatch(/DT serial browser slot/);
  });
});
