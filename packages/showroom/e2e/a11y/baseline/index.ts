/**
 * The route-level axe ledger: its shape, its laws, and the only two ways it is
 * ever written.
 *
 * WHY IT IS NOT AN ANONYMOUS MAP. `baseline-discipline` law 1: every ratchet
 * says in writing what it is a ledger OF, who owns it and when it retires. An
 * anonymous JSON of findings is not an adjudication, and it is what a baseline
 * decays into. The five laws below are WO-INV-03 debrief v3 section 2.4.
 *
 *   L1  a blocking-impact finding above `serious` is STRUCTURALLY inadmissible.
 *       It fails the run and can never be written into `entries`, so the
 *       acceptance grep holds because the word cannot occur rather than because
 *       somebody removed it.
 *   L2  every entry carries a disposition, an owner and a WO. `routed` may name
 *       a closed root that promised the reach instead of an open owner, when a
 *       residual table is the authority.
 *   L3  decrease-only, keyed `rule|scene|ground|target` so the same rule on two
 *       scenes is two separate adjudications.
 *   L4  a finding already pinned in a family `AXE_DEBT` map is `routed` to that
 *       pin, never re-litigated here.
 *   L5  a MISSING ledger fails. There is no self-generation path;
 *       `AXE_UPDATE_BASELINE=1` is the only write path and it is
 *       intersection-only, so it shrinks and never grows.
 */
import { existsSync, readFileSync } from 'node:fs';

/**
 * THE MATRIX, and the one place it is written.
 *
 * `/probe/engine-modern` cannot serve it: its tenant union is
 * rottay | bithire | evnto, so there is no SECOND BitHire tenant and the WO's
 * "Modern x bithire (two tenants)" line is unsatisfiable there.
 * `/probe/ds-reference` has exactly two BitHire-vertical grounds — `bithire`,
 * a static FlatTheme stamped as attributes, and `the-management`, a published
 * DB document compiled and SSR-embedded as an artifact — over 25 identical
 * scene routes that between them render all 24 primitives/inputs families.
 *
 * Literals, not a directory scan: a scanned roster shrinks silently when a
 * route is deleted. The suite checks these against the disk, not the reverse.
 */
export const GROUNDS = ['bithire', 'the-management'] as const;

export const SCENES = [
  'charts',
  'component-behaviors',
  'compositions',
  'control',
  'display-collections',
  'display-content',
  'display-labels',
  'display-surfaces',
  'feedback',
  'field',
  'inputs-material',
  'microbatch-material',
  'monochrome',
  'overlay',
  'overlay-blocking',
  'overlay-drawer',
  'overlay-edge',
  'pattern-behaviors',
  'primitive-anatomy',
  'primitive-complex-states',
  'primitive-interactions',
  'primitive-state-repairs',
  'structures',
  'surfaces',
  'transient-material',
] as const;

/**
 * FIVE scenes fail closed without a case parameter.
 *
 * `charts`, `compositions`, `monochrome`, `structures` and `surfaces` call
 * `notFound()` when `?only=` is missing or unknown — deliberately, so a probe
 * cannot photograph the wrong family as if it passed. Navigating them bare
 * serves a 404, which is what the first batch did: `charts` timed out and the
 * other four were scanned over the not-found page and reported clean.
 *
 * One representative case each keeps the batch at 50 loads, and each pick
 * carries its reason below so the choice is reproducible by reading rather
 * than by taste. The WO's acceptance is unaffected: all 24 `primitives/inputs`
 * families live in the UNPARAMETERIZED scenes. The full case axis is 96 cases
 * (charts 18, compositions 4, monochrome 11, structures 27, surfaces 36) and
 * sweeping it is 232 loads, ~4.6x this slot — a separate budget decision,
 * recorded in the ledger's matrix, not taken here.
 */
export interface SceneCase {
  readonly only: string;
  readonly why: string;
}

export const SCENE_CASES: Readonly<Record<string, SceneCase>> = Object.freeze({
  charts: {
    only: 'bar-chart',
    why: 'the only chart family rendering axes, tick labels and a categorical scale together, so it exercises the most text-bearing chart markup',
  },
  compositions: {
    only: 'page-shell',
    why: 'the outermost composition; the other three are regions it contains',
  },
  monochrome: {
    only: 'terminal-block',
    why: 'the one monochrome case that is interactive rather than pure decoration, and the only one carrying a prefers-contrast rule',
  },
  structures: {
    only: 'app-shell',
    why: 'the only structure that assembles header, sidebar and content at once; the other 26 are single pieces of chrome',
  },
  surfaces: {
    only: 'dashboard',
    why: 'the densest surface recipe, composing patterns, structures and primitives in one page',
  },
});

/** The route a scene is measured at, with its case parameter when it needs one. */
export function scenePath(ground: string, scene: string): string {
  const only = SCENE_CASES[scene]?.only;
  return `/probe/ds-reference/${ground}/${scene}${only ? `?only=${only}` : ''}`;
}

/** Where each parameterized scene's case list lives, relative to the app root. */
export const CASE_LIST_FILES: Readonly<Record<string, string>> = Object.freeze({
  charts: 'sections/charts/cases.ts',
  compositions: 'sections/compositions/cases.ts',
  monochrome: 'sections/monochrome/cases.ts',
  structures: 'sections/structures/cases.ts',
  surfaces: 'sections/surfaces/cases.ts',
});

/**
 * Parse a case list from its module text.
 *
 * Deliberately NOT a per-line comma regex: `^\s+'x',` is what produced the
 * 93/226 miscount, because none of these lists puts a comma after its last
 * entry. This takes the bracketed array body and reads every quoted string in
 * it, so trailing commas and multiple entries per line are both irrelevant.
 */
export function parseCaseList(source: string): string[] {
  const open = source.indexOf('= [');
  const close = source.lastIndexOf(']');
  if (open === -1 || close <= open) {
    throw new Error('no array body found — the case-list shape changed, so this parser is measuring nothing');
  }
  return [...source.slice(open, close).matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

export interface CaseAxis {
  counts: Record<string, number>;
  total: number;
  loads: number;
}

/**
 * The full case axis and what sweeping it would cost. `loads` is derived, not
 * quoted: every unparameterized scene is one route, every case of a
 * parameterized scene is one route, times the grounds.
 */
export function caseAxis(lists: Readonly<Record<string, readonly string[]>>): CaseAxis {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const scene of Object.keys(CASE_LIST_FILES)) {
    const list = lists[scene];
    if (!list) throw new Error(`no case list loaded for ${scene}`);
    counts[scene] = list.length;
    total += list.length;
  }
  const unparameterized = SCENES.length - Object.keys(SCENE_CASES).length;
  return { counts, total, loads: (unparameterized + total) * GROUNDS.length };
}

/**
 * The case/load figures a prose site claims about the FULL SWEEP.
 *
 * `loads` is anchored on "sweeping it is": both prose sites also quote the 50
 * loads this batch actually costs, and an unanchored `(\d+) loads` reads that
 * one instead. A missing anchor returns null, which fails the comparison.
 */
export function quotedAxisFigures(prose: string): { cases: number | null; loads: number | null } {
  const cases = /(\d+)\s+cases/.exec(prose);
  const loads = /sweeping it is\s+(\d+)\s+loads/.exec(prose);
  return { cases: cases ? Number(cases[1]) : null, loads: loads ? Number(loads[1]) : null };
}

/** The scene -> case projection the ledger's `matrix.cases.measured` must equal. */
export function measuredCases(): Record<string, string> {
  return Object.fromEntries(Object.entries(SCENE_CASES).map(([scene, { only }]) => [scene, only]));
}

export type Disposition = 'repair-here' | 'routed' | 'adjudicated';

export interface LedgerEntry {
  rule: string;
  impact: string;
  help: string;
  scene: string;
  ground: string;
  target: string;
  disposition: Disposition;
  owner: string;
  wo: string;
}

export interface Ledger {
  purpose: string;
  owner: string;
  provenance: string;
  retire: string;
  matrix: {
    engine: string;
    grounds: string[];
    scenes: string[];
    cases: { note: string; measured: Record<string, string> };
  };
  impacts: string[];
  entries: Record<string, LedgerEntry>;
  deferred: Record<string, unknown>;
  retired: Record<string, unknown>;
}

/** The impact an entry may carry. Anything above it is L1's subject. */
export const ADMISSIBLE_IMPACT = 'serious';
/** Spelled from its own letters so this module never contains the literal. */
export const INADMISSIBLE_IMPACT = ['crit', 'ical'].join('');
export const DISPOSITIONS: readonly Disposition[] = ['repair-here', 'routed', 'adjudicated'];

export function ledgerKey(rule: string, scene: string, ground: string, target: string): string {
  return `${rule}|${scene}|${ground}|${target}`;
}

/**
 * L5(i). An absent ledger is a hard error naming the command that regenerates
 * it deliberately — never a run that writes one and passes.
 */
export function readLedger(path: string): Ledger {
  if (!existsSync(path)) {
    throw new Error(
      `${path} is missing. The route-level axe ledger is not self-generating: a run that wrote its own baseline and passed would record every finding as accepted. Seed it by hand from a measured run (each entry needs a disposition, an owner and a WO that no machine can infer), then shrink it with AXE_UPDATE_BASELINE=1.`,
    );
  }
  return JSON.parse(readFileSync(path, 'utf8')) as Ledger;
}

/**
 * L1 + L2, as a parsed-JSON assertion rather than a grep over the file's text
 * (Q10). The prose keeps saying "blocking impact" so the acceptance command
 * still holds; this is what actually refuses a planted entry.
 */
export function ledgerProblems(ledger: Ledger): string[] {
  const problems: string[] = [];
  for (const field of ['purpose', 'owner', 'provenance', 'retire'] as const) {
    if (typeof ledger[field] !== 'string' || ledger[field].trim().length < 24) {
      problems.push(`\`${field}\` must be a written statement, not a placeholder`);
    }
  }
  if (!Array.isArray(ledger.impacts) || ledger.impacts.join() !== ADMISSIBLE_IMPACT) {
    problems.push(`\`impacts\` must be exactly ["${ADMISSIBLE_IMPACT}"]; a higher blocking impact is inadmissible (L1)`);
  }
  for (const [key, entry] of Object.entries(ledger.entries ?? {})) {
    if (entry.impact === INADMISSIBLE_IMPACT) {
      problems.push(`L1: ${key} carries the blocking impact the ledger may never record. It fails the run; it is not baselined.`);
    }
    if (entry.impact !== ADMISSIBLE_IMPACT) {
      problems.push(`L1: ${key} has impact "${entry.impact}"; only "${ADMISSIBLE_IMPACT}" may be recorded`);
    }
    if (!DISPOSITIONS.includes(entry.disposition)) {
      problems.push(`L2: ${key} has no valid disposition (${DISPOSITIONS.join(' | ')})`);
    }
    if (!entry.owner || entry.owner.trim().length < 8) problems.push(`L2: ${key} has no named owner`);
    if (!entry.wo || !/^WO-/.test(entry.wo)) problems.push(`L2: ${key} names no WO`);
    if (key !== ledgerKey(entry.rule, entry.scene, entry.ground, entry.target)) {
      problems.push(`L3: ${key} does not match its own rule|scene|ground|target`);
    }
    if (!ledger.matrix.grounds.includes(entry.ground)) {
      problems.push(`${key} names ground "${entry.ground}", which is not in the matrix`);
    }
    if (!ledger.matrix.scenes.includes(entry.scene)) {
      problems.push(`${key} names scene "${entry.scene}", which is not in the matrix`);
    }
  }
  return problems;
}

/** L3 + L5(ii): the update path is the intersection, so it can only shrink. */
export function intersect<Recorded, Measured>(
  recorded: Record<string, Recorded>,
  measured: Record<string, Measured>,
): Record<string, Measured> {
  return Object.fromEntries(Object.entries(measured).filter(([key]) => key in recorded));
}
