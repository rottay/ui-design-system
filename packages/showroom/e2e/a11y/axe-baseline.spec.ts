import { test, expect } from '@playwright/test';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CHART_CASES } from '../../src/app/probe/ds-reference/sections/charts/cases';
import { COMPOSITION_CASES } from '../../src/app/probe/ds-reference/sections/compositions/cases';
import { MONOCHROME_CASES } from '../../src/app/probe/ds-reference/sections/monochrome/cases';
import { STRUCTURE_CASES } from '../../src/app/probe/ds-reference/sections/structures/cases';
import { SURFACE_CASES } from '../../src/app/probe/ds-reference/sections/surfaces/cases';
import {
  ADMISSIBLE_IMPACT,
  caseAxis,
  CASE_LIST_FILES,
  cellKey,
  declaredCells,
  GROUNDS,
  INADMISSIBLE_IMPACT,
  intersect,
  ledgerKey,
  ledgerProblems,
  measuredCases,
  MIN_PAINTED_NODES,
  PAINTED_FLOORS,
  parseCaseList,
  publication,
  quotedAxisFigures,
  readLedger,
  SCENE_CASES,
  scenePath,
  SCENES,
  type Finding,
  type Ledger,
  type LedgerEntry,
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

  test('a per-scene painted floor is an exact measured exception, never a loosening', () => {
    expect(MIN_PAINTED_NODES).toBe(5);
    for (const [scene, { nodes, why }] of Object.entries(PAINTED_FLOORS)) {
      expect(SCENES, scene).toContain(scene);
      // Parameterized scenes pick a representative case instead of a lower floor.
      expect(SCENE_CASES[scene], scene).toBeUndefined();
      expect(Number.isInteger(nodes) && nodes >= 1 && nodes < MIN_PAINTED_NODES, scene).toBe(true);
      expect(why.trim().length, scene).toBeGreaterThan(0);
    }
  });

  test('every scene that fails closed on a missing case is given one', () => {
    // The first batch navigated all 25 scenes bare. Five of them call
    // `notFound()` without `?only=`, so four were axe-scanned over a 404.
    for (const ground of GROUNDS) {
      // BOTH grounds: they are byte-identical today, but a fail-closed edit to
      // one ground's page alone would otherwise escape.
      const failsClosed = SCENES.filter((scene) =>
        readFileSync(join(appRoot, ground, scene, 'page.tsx'), 'utf8').includes('notFound()'),
      );
      expect(failsClosed.slice().sort(), ground).toEqual(Object.keys(SCENE_CASES).sort());
    }
    for (const [scene, { only }] of Object.entries(SCENE_CASES)) {
      // The case must really be in that scene's list, or the route 404s again.
      const cases = readFileSync(join(here, `../../src/app/probe/ds-reference/sections/${scene}/cases.ts`), 'utf8');
      expect(cases, `${scene}/${only}`).toContain(`'${only}'`);
      for (const ground of GROUNDS) {
        expect(scenePath(ground, scene)).toBe(`/probe/ds-reference/${ground}/${scene}?only=${only}`);
      }
    }
    // ...and an unparameterized scene keeps a bare path.
    expect(scenePath('bithire', 'field')).toBe('/probe/ds-reference/bithire/field');
  });

  test('the ledger copy of the case axis equals SCENE_CASES', () => {
    // `matrix.cases.measured` is a read-only duplicate for whoever reads the
    // JSON. Without this it is free to drift from the map the batch navigates.
    expect(readLedger(ledgerPath).matrix.cases.measured).toEqual(measuredCases());
  });

  test('the case-axis figures in the ledger and the docblock match the real lists', () => {
    // The 93/226 miscount shipped in BOTH prose sites and in my report before
    // anything recomputed it. This is that recomputation.
    const parsed = Object.fromEntries(
      Object.entries(CASE_LIST_FILES).map(([scene, file]) => [
        scene,
        parseCaseList(readFileSync(join(appRoot, file), 'utf8')),
      ]),
    );
    // The parser must agree with the modules the app itself imports, or it is
    // measuring its own idea of the lists rather than the lists.
    const imported: Record<string, readonly string[]> = {
      charts: CHART_CASES,
      compositions: COMPOSITION_CASES,
      monochrome: MONOCHROME_CASES,
      structures: STRUCTURE_CASES,
      surfaces: SURFACE_CASES,
    };
    for (const scene of Object.keys(CASE_LIST_FILES)) {
      expect(parsed[scene], scene).toEqual([...imported[scene]!]);
    }

    const axis = caseAxis(parsed);
    expect(axis.counts).toEqual({
      charts: 18,
      compositions: 4,
      monochrome: 11,
      structures: 27,
      surfaces: 36,
    });
    expect(axis.total).toBe(96);
    expect(axis.loads).toBe(232);

    // Both prose sites are held to the computed figures, so neither can rot.
    const note = readLedger(ledgerPath).matrix.cases.note;
    expect(quotedAxisFigures(note)).toEqual({ cases: axis.total, loads: axis.loads });
    // The batch's own 50 loads is a different figure and must not be read as
    // the sweep's — that ambiguity is why the extractor is anchored.
    expect(note).toContain('50 loads');
    const docblock = readFileSync(join(here, 'baseline/index.ts'), 'utf8');
    const claim = docblock.slice(docblock.indexOf('The full case axis is'));
    expect(quotedAxisFigures(claim)).toEqual({ cases: axis.total, loads: axis.loads });
    for (const [scene, count] of Object.entries(axis.counts)) {
      expect(claim, `${scene} count in the docblock`).toContain(`${scene} ${count}`);
    }
  });

  test('DRILL: deleting one case from a cases.ts reds the axis law', () => {
    const real = parseCaseList(readFileSync(join(appRoot, CASE_LIST_FILES.charts!), 'utf8'));
    // A real edit to a real file, in a temp copy — not a sliced array.
    const source = readFileSync(join(appRoot, CASE_LIST_FILES.charts!), 'utf8');
    const mutated = source.replace(/\n\s*'waterfall'/, '');
    expect(mutated, 'the plant did not change the file').not.toBe(source);
    const copy = join(mkdtempSync(join(tmpdir(), 'axe-axis-')), 'cases.ts');
    writeFileSync(copy, mutated);

    const planted = parseCaseList(readFileSync(copy, 'utf8'));
    expect(planted).toHaveLength(real.length - 1);
    const axis = caseAxis({
      charts: planted,
      compositions: COMPOSITION_CASES,
      monochrome: MONOCHROME_CASES,
      structures: STRUCTURE_CASES,
      surfaces: SURFACE_CASES,
    });
    expect(axis.total).toBe(95);
    expect(axis.loads).toBe(230);
    // ...which is exactly what the law above compares against the prose.
    const note = readLedger(ledgerPath).matrix.cases.note;
    expect(quotedAxisFigures(note)).not.toEqual({ cases: axis.total, loads: axis.loads });
  });

  test('DRILL: the parser refuses a case list whose shape changed', () => {
    // A parser that silently returns [] would report a clean axis of zero.
    expect(() => parseCaseList('export const NONE = 1;')).toThrow(/measuring nothing/);
    // ...and it does not depend on a trailing comma, which is the bug that
    // dropped each list's last entry.
    expect(parseCaseList("export const X = [\n  'a',\n  'b'\n];")).toEqual(['a', 'b']);
    expect(parseCaseList("export const X = ['a', 'b',];")).toEqual(['a', 'b']);
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

  test.describe('coverage — only the complete matrix publishes', () => {
    const debt = (scene: string): LedgerEntry => ({
      rule: 'color-contrast',
      impact: ADMISSIBLE_IMPACT,
      help: 'Elements must meet minimum color contrast ratio thresholds',
      scene,
      ground: 'bithire',
      target: `.${scene}-planted`,
      disposition: 'routed',
      owner: `the ${scene} scene owner, named for this fixture`,
      wo: 'WO-INV-03',
    });
    const keyOf = (entry: LedgerEntry) => ledgerKey(entry.rule, entry.scene, entry.ground, entry.target);
    const finding = ({ disposition: _d, owner: _o, wo: _w, ...rest }: LedgerEntry): Finding => rest;
    const A = debt('field');
    const B = debt('control');
    const withDebt = (): Ledger => ({
      ...readLedger(ledgerPath),
      entries: { [keyOf(A)]: A, [keyOf(B)]: B },
    });
    const cellsOf = (scene: string) => GROUNDS.map((ground) => cellKey(scene, ground));
    type PlanInput = Parameters<typeof publication>[0];
    const plan = (input: Omit<PlanInput, 'ledger' | 'generatedAt' | 'blocking'> & Partial<PlanInput>) =>
      publication({ ledger: withDebt(), generatedAt: 'fixture', blocking: [], ...input });

    test("DRILL (a): the audit's reproduction — measuring only A refuses the update and keeps B", () => {
      const ledger = withDebt();
      const result = plan({
        ledger,
        measured: { [keyOf(A)]: finding(A) },
        coverage: { completed: cellsOf('field'), failed: {} },
        update: true,
      });
      expect(result.refusal).toMatch(/AXE_UPDATE_BASELINE=1 refused/);
      expect(result.refusal).toContain(`  ${cellKey('control', 'bithire')}\n`);
      expect(result.ledger, 'a partial run produced a ledger to write').toBeNull();
      expect(result.report, 'a partial run produced the canonical report').toBeNull();
      expect(Object.keys(ledger.entries)).toEqual([keyOf(A), keyOf(B)]);
      // The audit's second leg: an empty measurement erased both.
      const empty = plan({ ledger, measured: {}, coverage: { completed: [], failed: {} }, update: true });
      expect(empty.ledger).toBeNull();
      expect(empty.verdict.missing).toHaveLength(declaredCells().length);
    });

    test('DRILL (b): a failed or timed-out cell refuses, names the cell, and preserves its debt', () => {
      const all = declaredCells();
      const lost = cellKey('control', 'bithire');
      const result = plan({
        measured: { [keyOf(A)]: finding(A) },
        coverage: { completed: all.filter((cell) => cell !== lost), failed: { [lost]: 'timedOut' } },
        update: true,
      });
      expect(result.verdict.failed).toEqual([`${lost} (timedOut)`]);
      expect(result.verdict.missing).toEqual([]);
      expect(result.refusal).toContain(`${lost} (timedOut)`);
      expect(result.ledger).toBeNull();
      // A cell listed as BOTH completed and failed (a retry) is still a failure.
      const retried = plan({
        measured: { [keyOf(A)]: finding(A) },
        coverage: { completed: all, failed: { [lost]: 'failed' } },
        update: true,
      });
      expect(retried.verdict.complete).toBe(false);
      expect(retried.ledger).toBeNull();
    });

    test('DRILL (c): a focal selection or a restarted worker never reaches the update path', () => {
      // `-g field` measures two cells; a worker restarted after a failure sees only the tail.
      for (const completed of [cellsOf('field'), declaredCells().slice(10)]) {
        const result = plan({ measured: {}, coverage: { completed, failed: {} }, update: true });
        expect(result.ledger).toBeNull();
        expect(result.report).toBeNull();
        expect(result.refusal).toMatch(/refused/);
        // Without the flag it is a labeled diagnostic, still never the report.
        const diagnostic = plan({ measured: {}, coverage: { completed, failed: {} }, update: false });
        expect(diagnostic.refusal).toBeNull();
        expect(diagnostic.report).toBeNull();
        expect(diagnostic.diagnostic).toMatch(/^PARTIAL axe run — diagnostic only, NOT the complete matrix/);
        expect(diagnostic.diagnostic).toContain(`${completed.length} of ${declaredCells().length} cells measured`);
      }
      // A cell outside the matrix is not coverage either.
      const stray = plan({
        measured: {},
        coverage: { completed: [...declaredCells(), cellKey('field', 'evnto')], failed: {} },
        update: true,
      });
      expect(stray.verdict.unexpected).toEqual([cellKey('field', 'evnto')]);
      expect(stray.ledger).toBeNull();
    });

    test('DRILL (d): the complete matrix updates, intersection-only', () => {
      const novel = { ...finding(A), target: '.novel' };
      const result = plan({
        measured: { [keyOf(A)]: finding(A), [ledgerKey(novel.rule, novel.scene, novel.ground, novel.target)]: novel },
        coverage: { completed: declaredCells(), failed: {} },
        update: true,
      });
      expect(result.verdict).toMatchObject({ complete: true, measured: 50, declared: 50 });
      expect(result.failures).toEqual([]);
      expect(result.refusal).toBeNull();
      expect(result.diagnostic).toBeNull();
      // B was measured clean across the whole matrix, so it drops as repaired; the novel key is refused.
      expect(result.ledger!.entries).toEqual({ [keyOf(A)]: A });
      expect(result.report).toMatchObject({ coverage: { status: 'complete', cells: 50 }, findingCount: 2 });
    });

    test('DRILL: a blocking finding fails the run and withholds the complete report', () => {
      const blocking = ['  label @ .planted  [bithire/field]  (Form elements must have labels)'];
      for (const update of [false, true]) {
        const result = plan({
          measured: { [keyOf(A)]: finding(A) },
          blocking,
          coverage: { completed: declaredCells(), failed: {} },
          update,
        });
        expect(result.verdict.complete).toBe(true);
        expect(result.failures.some((failure) => failure.includes('(L1)') && failure.includes('.planted'))).toBe(true);
        expect(result.report, 'a failing run produced a complete-labeled report').toBeNull();
        expect(result.ledger).toBeNull();
      }
      // A novel key fails the same way, and it is named.
      const novel = { ...finding(A), target: '.novel' };
      const withNovel = plan({
        measured: { [ledgerKey(novel.rule, novel.scene, novel.ground, novel.target)]: novel },
        coverage: { completed: declaredCells(), failed: {} },
        update: false,
      });
      expect(withNovel.failures.join('\n')).toContain('.novel');
      expect(withNovel.report).toBeNull();
    });

    test('the batch publishes only through publication(), and only after every check', () => {
      const spec = readFileSync(join(here, 'axe.spec.ts'), 'utf8');
      expect(spec).not.toMatch(/\bintersect\b/);
      expect(spec).toContain('publication({');
      expect(spec.match(/writeJson\(/g)).toHaveLength(3);
      const hook = spec.slice(spec.indexOf('test.afterAll('));
      const gate = hook.indexOf('expect(plan.failures');
      expect(gate, 'the afterAll no longer asserts plan.failures').toBeGreaterThan(-1);
      for (const write of ['writeJson(reportPath, plan.report)', 'writeJson(ledgerPath, plan.ledger)']) {
        expect(hook.indexOf(write), write).toBeGreaterThan(gate);
      }
    });
  });

  test('the deferred and retired pins are kept as evidence, not deleted', () => {
    const ledger = readLedger(ledgerPath);
    // Q4(b): the three rottay serious entries move to `deferred` with D-24
    // named, because their subject left the matrix. They are evidence.
    const deferred = Object.values(ledger.deferred) as { deferredUnder?: string }[];
    expect(deferred).toHaveLength(3);
    for (const entry of deferred) expect(entry.deferredUnder).toBe('D-24');
    // The two stale pins retired by WO-INV-04 were re-measured clean on the
    // cells they came from; a row still awaiting that slot is out of date.
    const retired = Object.values(ledger.retired) as {
      awaits?: string;
      status?: string;
      remeasured?: { on?: string; cells?: string[] };
    }[];
    expect(retired).toHaveLength(2);
    const origin = ['field', 'control'].flatMap((scene) => GROUNDS.map((ground) => cellKey(scene, ground)));
    for (const entry of retired) {
      expect(entry.awaits).toBeUndefined();
      expect(entry.status).toBe('confirmed');
      expect(entry.remeasured?.on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.remeasured?.cells).toEqual(origin);
      for (const cell of origin) expect(declaredCells()).toContain(cell);
    }
  });
});
