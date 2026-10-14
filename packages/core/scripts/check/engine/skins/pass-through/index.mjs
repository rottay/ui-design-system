#!/usr/bin/env node
/**
 * engine/skins/pass-through -- the P-88 fleet ratchet (WO-ARC-12).
 *
 * THE LAW (P-88, src/foundation/contracts/kernel/common/index.ts, owner ruling 2026-10-06): a
 * component with a skin of its own keeps its canonical data-part/data-state on its root and
 * trigger; a caller value can neither replace them nor be forwarded to an element the component
 * paints. Composition goes through the documented className/slot hooks.
 *
 * WHAT THIS GATE HOLDS. The measurement is NOT here: it is the census in
 * scripts/libraries/engine/skins/pass-through (ONE MEASUREMENT, shared with the engine-token-audit
 * rows and family-cut G1). This gate compares that measurement with its own ledger,
 * baseline/index.json, and refuses six moves:
 *
 *   1. a counter that GROWS (passThroughViolations, callerPartDependents, callerStateDependents);
 *   2. a violating SITE the closed roster does not name, or a site whose breach classes grow.
 *      The roster is LINE-FREE (file#owner#tag#part#ordinal), so editing a line above a site
 *      never churns it;
 *   3. a TRIPWIRE row (an excluded unpainted wrapper) that becomes painted and re-enters, and a
 *      NEW unpainted row (a site cannot leave the count by shedding its paint);
 *   4. a caller-part or caller-state DEPENDENT the per-family held sets do not name. These are the
 *      per-family preconditions: a family's engine lot is eligible only when its set is empty;
 *   5. a C4 ENGINE-SCOPE selector that resolves to no scope (fail-closed, no door), or a CROSS
 *      selector outside the closed CROSS roster;
 *   6. a family whose ledger `carrier` claim is missing, not a boolean, or different from the
 *      canonical LAYOUT_CARRIERS (the library's single authority). The claim is cross-checked,
 *      never trusted: eligibility() reads LAYOUT_CARRIERS itself, so no ledger edit can schedule a
 *      layout carrier for stripping past the owner's carrier ruling (§6);
 *   7. a STRUCTURAL FORWARD (census v7.1.9; owner CARRIERS answer 2, option 3; P-88 kernel/common:166)
 *      the ledger does not hold. The class is published, never excluded: the library's closed
 *      roster is its only authority and the ledger's `structuralForwards` is cross-checked against
 *      it both ways. A ratified site that loses its shape (gains a stamp, a replace or an own
 *      anatomy rule) fails AND is a counted site again; a ledger row the library does not ratify
 *      fails; `structuralForwards` grows like any counter.
 *
 * DECREASE-ONLY. A count that SHRINKS is also red until the ledger is lowered through the
 * door, `--update-baseline`. A reclassification has its own door, `--reclassify-structural`: it
 * moves ratified keys from the counted roster to `structuralForwards` and nothing else, and only
 * when the conservation line holds (passThroughViolations + structuralForwards unchanged);
 * `--update-baseline` refuses it. The door writes the gate's own measurement and refuses outright if
 * anything grew. A pin is never hand-computed and never raised. The door keeps the ledger's prose
 * (including the c4 prose), records the HEAD the tree was measured on (`git rev-parse HEAD`; it
 * refuses rather than record none), and keeps the file's own character-escaping style so a
 * lower is byte-minimal.
 *
 * Usage:
 *   node scripts/check/engine/skins/pass-through/index.mjs [--check]   exit 1 on any finding
 *   node scripts/check/engine/skins/pass-through/index.mjs --report    the measurement vs the ledger (JSON)
 *   node scripts/check/engine/skins/pass-through/index.mjs --update-baseline   lower the ledger (tighten only)
 *   node scripts/check/engine/skins/pass-through/index.mjs --reclassify-structural   move ratified structural forwards (conservation only)
 *   node scripts/check/engine/skins/pass-through/index.mjs --emit      print the candidate ledger (review aid; writes nothing)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';
import {
  LAYOUT_CARRIERS,
  dependentKeys,
  excludedKeys,
  measurePassThrough,
  siteKeys,
  structuralForwardKeys,
} from '../../../../libraries/engine/skins/pass-through/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BASELINE_PATH = join(HERE, 'baseline/index.json');
const COUNTERS = ['passThroughViolations', 'callerPartDependents', 'callerStateDependents', 'structuralForwards'];
const UNPAINTED = /unpainted/;
const CARRIERS = new Set(LAYOUT_CARRIERS);

/** The ledger-shaped view of one measurement: what the gate compares and what the door writes. */
export function projectMeasurement({ census }) {
  const roster = siteKeys(census.sites).map(({ key, row }) => ({ key, engine: row.engine, family: row.family, breach: [...row.breachClasses].sort() }));
  const tripwires = excludedKeys(census.excluded.filter((e) => UNPAINTED.test(e.excludedBecause))).map(({ key }) => key);
  const families = {};
  const ensure = (fam) => (families[fam] ??= { carrier: CARRIERS.has(fam), part: [], state: [] });
  for (const { key, row } of dependentKeys(census.dependents.callers)) ensure(row.childFamily).part.push(key);
  for (const { key, row } of dependentKeys(census.stateDependents.callers)) ensure(row.childFamily).state.push(key);
  // Every family that still has a violating site gets a row, dependents or not, so an engine
  // lot's eligibility is one lookup instead of a manual census read.
  for (const s of census.sites) ensure(s.family);
  const sorted = Object.fromEntries(Object.keys(families).sort().map((fam) => [fam, {
    carrier: families[fam].carrier, part: [...families[fam].part].sort(), state: [...families[fam].state].sort(),
  }]));
  const c4 = census.v4.c4Assertion;
  return {
    counters: {
      passThroughViolations: census.totals.sites,
      callerPartDependents: census.totals.callerPartDependents,
      callerStateDependents: census.totals.callerStateDependents,
      structuralForwards: census.totals.structuralForwards,
    },
    roster,
    structuralForwards: structuralForwardKeys(census.structuralForwards.rows).map(({ key, row }) => ({ key, engine: row.engine, family: row.family, breach: [...row.breachClasses].sort() })),
    structuralRoster: census.structuralForwards.roster.map((r) => r.key),
    structuralMismatch: census.structuralForwards.rosterMismatch,
    tripwires,
    families: sorted,
    c4: { unresolved: c4.unresolved.length, crossRoster: [...c4.crossRoster] },
  };
}

const diff = (pinned, measured) => ({
  added: measured.filter((x) => !pinned.includes(x)),
  removed: pinned.filter((x) => !measured.includes(x)),
});

/**
 * Compare a projected measurement with the ledger. Pure: every finding is
 * `{ kind, direction: 'grew' | 'shrank' | 'fail', detail }`.
 */
export function evaluatePassThrough(view, ledger) {
  const findings = [];
  const push = (kind, direction, detail, extra = {}) => findings.push({ kind, direction, detail, ...extra });
  for (const name of COUNTERS) {
    // a ledger that predates the structural class holds none (census v7.1.9)
    const pinned = name === 'structuralForwards' ? ledger.counters[name] ?? 0 : ledger.counters[name];
    const now = view.counters[name];
    if (now > pinned) push('counter', 'grew', `${name} ${pinned} -> ${now}`);
    if (now < pinned) push('counter', 'shrank', `${name} ${pinned} -> ${now}: lower it with --update-baseline`);
  }
  const pinnedSites = new Map(ledger.roster.map((r) => [r.key, r]));
  const nowSites = new Map(view.roster.map((r) => [r.key, r]));
  for (const [key, row] of nowSites) {
    const was = pinnedSites.get(key);
    if (!was) { push('site', 'grew', `NEW violating site ${key} [${row.breach.join(', ')}]`); continue; }
    const d = diff(was.breach, row.breach);
    if (d.added.length) push('site-breach', 'grew', `${key} gained ${d.added.join(', ')}`);
    if (d.removed.length) push('site-breach', 'shrank', `${key} no longer ${d.removed.join(', ')}: lower it with --update-baseline`);
  }
  const nowStructural = new Set(view.structuralForwards.map((r) => r.key));
  for (const key of pinnedSites.keys()) {
    if (nowSites.has(key)) continue;
    if (nowStructural.has(key)) push('site', 'shrank', `site ${key} left the roster for the structural-forward class: move it with --reclassify-structural`, { key });
    else push('site', 'shrank', `site ${key} left the roster: lower it with --update-baseline`, { key });
  }
  const trip = diff(ledger.tripwires.map((t) => t.key), view.tripwires);
  for (const key of trip.removed) {
    push('tripwire', nowSites.has(key) ? 'grew' : 'shrank', nowSites.has(key)
      ? `TRIPWIRE ${key} is painted again and re-entered the counted roster`
      : `tripwire ${key} no longer exists as an unpainted wrapper: lower it with --update-baseline`);
  }
  for (const key of trip.added) push('tripwire', 'grew', `NEW unpainted wrapper ${key}: a site may not leave the count by shedding its paint`);
  const famNames = new Set([...Object.keys(ledger.families), ...Object.keys(view.families)]);
  for (const fam of [...famNames].sort()) {
    // The carrier claim is checked against the canonical authority, never believed: a ledger that
    // calls a layout carrier a plain family (or the reverse) is red, whatever else it says.
    const canonical = CARRIERS.has(fam);
    const entry = ledger.families[fam];
    if (!entry || !Object.hasOwn(entry, 'carrier')) push('carrier', 'fail', `${fam}: the ledger has no carrier classification (canonical LAYOUT_CARRIERS: ${canonical})`, { family: fam });
    else if (typeof entry.carrier !== 'boolean') push('carrier', 'fail', `${fam}: carrier must be a boolean, the ledger has ${JSON.stringify(entry.carrier)} (canonical LAYOUT_CARRIERS: ${canonical})`);
    else if (entry.carrier !== canonical) push('carrier', 'fail', `${fam}: the ledger says carrier=${entry.carrier}, canonical LAYOUT_CARRIERS says ${canonical}`);
    const pinned = ledger.families[fam] ?? { part: [], state: [] };
    const now = view.families[fam] ?? { part: [], state: [] };
    for (const arm of ['part', 'state']) {
      const d = diff((pinned[arm] ?? []).map((h) => (typeof h === 'string' ? h : h.key)), now[arm] ?? []);
      for (const key of d.added) push(`${arm}-dependent`, 'grew', `${fam}: NEW caller-${arm} dependent ${key}`);
      for (const key of d.removed) push(`${arm}-dependent`, 'shrank', `${fam}: caller-${arm} dependent ${key} left: lower it with --update-baseline`);
    }
  }
  structuralFindings(view, ledger, pinnedSites, push);
  if (view.c4.unresolved > 0) push('c4', 'fail', `${view.c4.unresolved} part-selecting engine-skin selector(s) resolve to no engine scope (C4 ENGINE SCOPE, fail-closed)`);
  const cross = diff(ledger.c4.crossRoster, view.c4.crossRoster);
  for (const s of cross.added) push('c4-cross', 'grew', `NEW CROSS-scope selector ${s}`);
  for (const s of cross.removed) push('c4-cross', 'shrank', `CROSS-scope selector ${s} left: lower it with --update-baseline`);
  return findings;
}

/**
 * The structural-forward cross-checks (census v7.1.9). The library's closed roster is the only
 * authority; the ledger holds the keys it has moved and is checked against both the roster and
 * the measurement, so neither side can add or drop a ratified key alone.
 */
function structuralFindings(view, ledger, pinnedSites, push) {
  const ledgerRows = ledger.structuralForwards ?? [];
  const ledgerKeys = new Set(ledgerRows.map((r) => r.key));
  const measuredKeys = new Set(view.structuralForwards.map((r) => r.key));
  const libraryRoster = new Set(view.structuralRoster);
  const counted = new Set(view.roster.map((r) => r.key));
  for (const m of view.structuralMismatch) {
    if (m.id) push('structural', 'fail', `ratified ${m.key} lost its structural shape (${m.reason}): it is a counted site again`, { key: m.key });
    else if (ledgerKeys.has(m.key)) push('structural', 'shrank', `ratified ${m.key} no longer exists: lower it with --update-baseline, then delete its library roster row`, { key: m.key });
    else push('structural', 'fail', `the library roster row ${m.key} names no measured forwarding element: delete it`, { key: m.key });
  }
  for (const key of measuredKeys) {
    if (!libraryRoster.has(key)) { push('structural', 'fail', `structural forward ${key} is not a row of the library roster (the only authority)`, { key }); continue; }
    if (ledgerKeys.has(key)) continue;
    if (pinnedSites.has(key)) push('structural', 'grew', `ratified structural forward ${key} is still a counted site in the ledger: move it with --reclassify-structural`, { key });
    else push('structural', 'fail', `ratified structural forward ${key} is held nowhere in the ledger (neither roster nor structuralForwards)`, { key });
  }
  for (const key of ledgerKeys) {
    if (measuredKeys.has(key) || libraryRoster.has(key)) continue;
    if (counted.has(key)) push('structural', 'fail', `the ledger holds ${key} as a structural forward; the library roster does not ratify it`, { key });
    else push('structural', 'shrank', `structural forward ${key} no longer exists: lower it with --update-baseline`, { key });
  }
  const pinnedCount = ledger.counters.structuralForwards ?? 0;
  if (pinnedCount !== ledgerRows.length) push('structural', 'fail', `the ledger counter structuralForwards ${pinnedCount} disagrees with its ${ledgerRows.length} structuralForwards row(s)`);
}

/**
 * Per-family eligibility, as the step-2 engine lots read it (design §4, now machine-readable).
 * The carrier fact comes from LAYOUT_CARRIERS, never from the ledger's (cross-checked) claim.
 */
export function eligibility(ledger) {
  return Object.fromEntries(Object.entries(ledger.families).map(([fam, f]) => {
    const carrier = CARRIERS.has(fam);
    return [fam, {
      partStripEligible: !carrier && f.part.length === 0,
      stateStripEligible: !carrier && f.state.length === 0,
      heldPart: f.part.map((h) => (typeof h === 'string' ? h : h.key)),
      heldState: f.state.map((h) => (typeof h === 'string' ? h : h.key)),
      ...(carrier ? { waitsOn: 'owner carrier ruling (§6): layout carriers are not scheduled by this gate' } : {}),
    }];
  }));
}

/**
 * The door. Writes the measurement as the new ledger, keeping the prose and every surviving
 * held entry's routing note, and refuses if anything grew or failed.
 */
export function tightenLedger(ledger, view, { head = null, date = null } = {}) {
  const refusals = evaluatePassThrough(view, ledger).filter((f) => f.direction !== 'shrank');
  if (refusals.length) return { ok: false, refusals };
  const routed = (pinnedArm, nowArm) => nowArm.map((key) => {
    const was = (pinnedArm ?? []).find((h) => (typeof h === 'string' ? h : h.key) === key);
    return was && typeof was === 'object' ? was : key;
  });
  const families = {};
  for (const [fam, f] of Object.entries(view.families)) {
    const pinned = ledger.families[fam] ?? {};
    families[fam] = { carrier: f.carrier, part: routed(pinned.part, f.part), state: routed(pinned.state, f.state) };
  }
  const tripReason = new Map(ledger.tripwires.map((t) => [t.key, t]));
  const next = {
    ...ledger,
    lastMoveKind: 'decrease',
    lastMove: { head, date, note: 'lowered to the gate\'s own measurement through --update-baseline' },
    counters: { ...view.counters },
    roster: view.roster,
    ...(ledger.structuralForwards ? { structuralForwards: view.structuralForwards } : {}),
    tripwires: view.tripwires.map((key) => tripReason.get(key) ?? { key }),
    families,
    c4: { ...ledger.c4, unresolved: view.c4.unresolved, crossRoster: view.c4.crossRoster },
  };
  return { ok: true, ledger: next };
}

const STRUCTURAL_RULE = 'structural-forward (census v7.1.9; owner 2026-10-14 CARRIERS answer 2, option 3; P-88 kernel/common:166, "only a structural component with no part of its own may forward a caller data-part/data-state"): a classic/rustic layout-carrier engine site that stamps no part or state of its own, never replaces a part, lands on the DOM, and is selected by anatomy through its own class by no loaded skin (s1-s5), AND that the library\'s closed STRUCTURAL_FORWARDS roster ratifies with an authority and an evidence string. Published, never excluded: its key moves from `roster` to `structuralForwards`, passThroughViolations + structuralForwards is conserved, and its callers stay in the per-family held sets (a carrier still waits on the owner ruling). The only door that moves a key is --reclassify-structural; --update-baseline refuses a reclassification.';
const STRUCTURAL_CENSUS = 'v7.1.9, 2026-10-14 (arc12/census-v719): the structural-forward class, the class-keyed own-anatomy index and the path-anchored layout carriers (see scripts/libraries/engine/skins/pass-through/index.mjs). v7.1.8 at arc12/census-v718 and earlier as before.';

/**
 * The reclassification door. Moves the ratified structural forwards the ledger still counts as
 * sites into `structuralForwards` and admits nothing else: every finding must be one of the moved
 * keys leaving the roster, the two counters moving by exactly that number, or the owner-skin row of
 * a family the path-anchored carriers relabelled (a non-carrier family with empty held sets whose
 * every site the ledger already counted under a layout carrier). The conservation line must hold.
 */
export function reclassifyLedger(ledger, view, { head = null, date = null } = {}) {
  const ledgerRows = ledger.structuralForwards ?? [];
  const held = new Set(ledgerRows.map((r) => r.key));
  const moved = view.structuralForwards.filter((r) => !held.has(r.key)).map((r) => r.key);
  const refusals = [];
  if (!moved.length) refusals.push({ kind: 'reclassify', direction: 'fail', detail: 'no ratified structural forward is waiting to move' });
  const pinnedByKey = new Map(ledger.roster.map((r) => [r.key, r]));
  const relabelled = (fam) => !ledger.families[fam] && !CARRIERS.has(fam) && view.families[fam]?.part.length === 0 && view.families[fam]?.state.length === 0
    && view.roster.filter((r) => r.family === fam).every((r) => CARRIERS.has(pinnedByKey.get(r.key)?.family));
  const n = moved.length;
  const pv = ledger.counters.passThroughViolations;
  const sf = ledger.counters.structuralForwards ?? 0;
  for (const f of evaluatePassThrough(view, ledger)) {
    const ok = (f.kind === 'structural' && f.direction === 'grew' && moved.includes(f.key))
      || (f.kind === 'site' && f.direction === 'shrank' && moved.includes(f.key))
      || (f.kind === 'counter' && f.detail === `passThroughViolations ${pv} -> ${pv - n}: lower it with --update-baseline`)
      || (f.kind === 'counter' && f.detail === `structuralForwards ${sf} -> ${sf + n}`)
      || (f.kind === 'carrier' && f.family && relabelled(f.family));
    if (!ok) refusals.push(f);
  }
  const before = pv + sf;
  const after = view.counters.passThroughViolations + view.counters.structuralForwards;
  if (before !== after || view.counters.passThroughViolations !== pv - n || view.counters.structuralForwards !== sf + n) {
    refusals.push({ kind: 'conservation', direction: 'fail', detail: `forwardingMeasured ${before} -> ${after} (passThroughViolations ${pv} -> ${view.counters.passThroughViolations}, structuralForwards ${sf} -> ${view.counters.structuralForwards}, ${n} moved): a reclassification conserves the count` });
  }
  if (refusals.length) return { ok: false, refusals };
  const families = { ...ledger.families };
  for (const fam of Object.keys(view.families)) if (!families[fam]) families[fam] = { carrier: false, part: [], state: [] };
  const next = {};
  for (const [k, v] of Object.entries(ledger)) {
    if (k === 'structuralForwards') continue;
    next[k] = v;
    if (k === 'eligibilityRule' && !ledger.structuralForwardRule) next.structuralForwardRule = STRUCTURAL_RULE;
    if (k === 'roster') next.structuralForwards = view.structuralForwards;
  }
  Object.assign(next, {
    measuredFrom: { ...ledger.measuredFrom, census: STRUCTURAL_CENSUS },
    lastMoveKind: 'reclassification',
    counters: { ...view.counters },
    roster: view.roster,
    families: Object.fromEntries(Object.keys(families).sort().map((fam) => [fam, families[fam]])),
    lastMove: { head, date, note: `reclassification through --reclassify-structural (structural-forward; owner 2026-10-14 CARRIERS answer 2, option 3; P-88 kernel/common:166): ${n} ratified key(s) left the counted roster for structuralForwards; forwardingMeasured ${before} = passThroughViolations ${view.counters.passThroughViolations} + structuralForwards ${view.counters.structuralForwards}. Moved: ${moved.join('; ')}` },
  });
  return { ok: true, ledger: next, moved };
}

/**
 * Serialize a ledger the way its file already is, so a lower changes only what moved. When the
 * previous text spelled non-ASCII as `\uXXXX` escapes (and carried no raw non-ASCII), keep that.
 */
export function serializeLedger(ledger, previousText = '') {
  const text = `${JSON.stringify(ledger, null, 1)}\n`;
  const escaped = /\\u[0-9a-fA-F]{4}/.test(previousText) && !/[^\x00-\x7f]/.test(previousText);
  return escaped ? text.replace(/[\u0080-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`) : text;
}

/** The commit the tree was measured on (the lowering lot lands on top of it), or null. */
export function headCommit(cwd = HERE) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

export function readLedger(path = BASELINE_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const FLAGS = new Set(['--check', '--report', '--update-baseline', '--reclassify-structural', '--emit']);

function main() {
  const args = new Set(process.argv.slice(2));
  for (const a of args) if (!FLAGS.has(a)) { console.error(`engine/skins/pass-through: unknown flag ${a} (known: ${[...FLAGS].join(', ')})`); process.exit(2); }
  const repoRoot = findRepoRoot(HERE);
  const view = projectMeasurement(measurePassThrough({ repoRoot }));
  if (args.has('--emit')) { process.stdout.write(`${JSON.stringify(view, null, 1)}\n`); return; }
  const ledger = readLedger();
  if (args.has('--update-baseline')) {
    const head = headCommit();
    if (!head) {
      console.error('engine/skins/pass-through --update-baseline REFUSED: cannot resolve HEAD (git rev-parse HEAD); a lower records the commit it was measured on');
      process.exit(1);
    }
    const res = tightenLedger(ledger, view, { head, date: new Date().toISOString().slice(0, 10) });
    if (!res.ok) {
      console.error('engine/skins/pass-through --update-baseline REFUSED (the door only lowers):');
      for (const f of res.refusals) console.error(`  ${f.kind} ${f.direction}: ${f.detail}`);
      process.exit(1);
    }
    writeFileSync(BASELINE_PATH, serializeLedger(res.ledger, readFileSync(BASELINE_PATH, 'utf8')));
    console.log(`engine/skins/pass-through: ledger lowered (${COUNTERS.map((c) => `${c} ${res.ledger.counters[c]}`).join(', ')})`);
    return;
  }
  if (args.has('--reclassify-structural')) {
    const head = headCommit();
    if (!head) {
      console.error('engine/skins/pass-through --reclassify-structural REFUSED: cannot resolve HEAD (git rev-parse HEAD)');
      process.exit(1);
    }
    const res = reclassifyLedger(ledger, view, { head, date: new Date().toISOString().slice(0, 10) });
    if (!res.ok) {
      console.error('engine/skins/pass-through --reclassify-structural REFUSED (the door only moves ratified keys, conserving the count):');
      for (const f of res.refusals) console.error(`  ${f.kind} ${f.direction}: ${f.detail}`);
      process.exit(1);
    }
    writeFileSync(BASELINE_PATH, serializeLedger(res.ledger, readFileSync(BASELINE_PATH, 'utf8')));
    console.log(`engine/skins/pass-through: ${res.moved.length} key(s) reclassified (${COUNTERS.map((c) => `${c} ${res.ledger.counters[c]}`).join(', ')})`);
    return;
  }
  const findings = evaluatePassThrough(view, ledger);
  if (args.has('--report')) {
    process.stdout.write(`${JSON.stringify({ counters: view.counters, ledger: ledger.counters, findings, eligibility: eligibility(ledger) }, null, 1)}\n`);
    return;
  }
  if (findings.length) {
    console.error(`engine/skins/pass-through: ${findings.length} finding(s)`);
    for (const f of findings) console.error(`  [${f.kind}/${f.direction}] ${f.detail}`);
    process.exit(1);
  }
  const atZero = Object.entries(eligibility(ledger)).filter(([, e]) => e.partStripEligible && e.stateStripEligible).map(([f]) => f);
  console.log(`engine/skins/pass-through OK (${COUNTERS.map((c) => `${c} ${view.counters[c]}`).join(', ')}; roster ${view.roster.length} line-free sites; structural forwards ${view.structuralForwards.length}; tripwires ${view.tripwires.length}; families eligible for their engine lot: ${atZero.join(', ') || 'none'})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
