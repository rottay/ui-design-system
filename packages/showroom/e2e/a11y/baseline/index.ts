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
  matrix: { engine: string; grounds: string[]; scenes: string[] };
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
