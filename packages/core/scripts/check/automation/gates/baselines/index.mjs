#!/usr/bin/env node
/**
 * baseline-discipline — what every ratchet in this repository is standing on,
 * published, and the two moves it may never make silently.
 *
 * WHY IT EXISTS. F-86: "ratchets that freeze instead of falling; nobody knows
 * how much debt a green is protecting". F-75: two ledgers record a
 * `lastMoveKind: ampliacion (--widen)` and a build-time contrast ledger ships
 * sixteen APCA pairs under their own floor. Each individual gate was green
 * throughout, because a decrease-only promise is a claim about the DIRECTION of
 * a number and says nothing at all about its SIZE.
 *
 * THE THREE LAWS, and they are deliberately about the ledgers rather than about
 * the findings inside them:
 *
 *   1. EVERY ratchet named by the gate inventory exists, parses, and says in
 *      writing what it is a ledger OF. An anonymous JSON of numbers is not an
 *      adjudication, and it is what a baseline decays into.
 *   2. A WIDENING is declared or it is refused. A ledger whose recorded last
 *      move widened it must be named in `WIDENINGS` with an owner and a reason.
 *      This does not un-widen the one that already happened -- rewriting that
 *      record would be falsifying it -- it makes the NEXT one impossible to
 *      land quietly.
 *   3. The APCA contrast ledger is a CLOSED, NAMED set. Every entry ships a
 *      pairing under the governed body floor, so a new one is a new shipped
 *      accessibility defect and is refused by name.
 *
 * WHAT THIS GATE IS NOT. It does not re-run any ratchet and does not second-
 * guess a single finding. Each gate owns its own verdict; this one owns the
 * discipline OF the ledgers, and the debt ratio the runner publishes beside
 * every gate comes from the walk below so there is one measurement, not two.
 *
 * Usage:
 *   node scripts/check/automation/gates/baselines/index.mjs           exit 1 on a violation
 *   node scripts/check/automation/gates/baselines/index.mjs --report  every ledger and its ratio
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);

/** Ledgers that govern a published output without being a roster ratchet. */
export const EXTRA_LEDGERS = Object.freeze([
  {
    id: 'apca-contrast',
    path: 'scripts/build/verticals/bundle-build/contrast-baseline/index.json',
    reason: 'the build refuses a ramp/ground pairing under the APCA body floor unless it is on this list',
  },
]);

/**
 * A recorded move that made a ledger BIGGER.
 *
 * Read from the CLASSIFICATION field (`lastMoveKind`) and never from the prose
 * beside it. Measured, not assumed: `dead-writers-baseline` explains a DECREASE
 * with the sentence "no amplia nada", and a scan over the prose read that as a
 * widening. A gate that accuses the ledger which says it did not widen is worse
 * than no gate.
 */
const WIDENING = /amplia|ampliaci|widen|subid/iu;
const MOVE_KIND_FIELD = 'lastMoveKind';

/** The fields a ledger may state its purpose in. Any one of them is enough. */
const PURPOSE_FIELDS = Object.freeze(['purpose', 'reason', 'law', 'note', 'notes', 'description', 'policy', 'direction']);

/**
 * The widenings this repository has ALREADY landed, each with its owner.
 *
 * This list is an accusation, not a permission. Every entry is debt the audit
 * named (F-75) and the work order that owns its removal; a ledger that widens
 * without appearing here is refused, and an entry whose ledger no longer
 * records a widening is refused too, so the list can only shrink.
 */
export const WIDENINGS = Object.freeze([
  {
    id: 'public-entrypoint-boundary',
    owner: 'WO-CAT-03 (public surface)',
    reason:
      'F-75: `maxSourceBytes` was raised once by name for the conn2 lot (+226 measured bytes on ./runtime/tenant-theme). '
      + 'The record is kept verbatim rather than rewritten; what is closed here is the next silent one.',
  },
  {
    id: 'normalization-contract',
    owner: 'WO-DER-06 (derivation carril), WO-FAM-10 (the wave that landed the re-attribution)',
    reason:
      '2026-09-18 (DT re-pin sweep after the FAM-10 wave, bfcac0099): shadowingLiteralPins rose 4 -> 7 '
      + 'through the governed --write-baseline --reattribution door, authorized by name in the sweep commit: '
      + '--ds-motion-intensity now roots at motion.intensity with a derivation law '
      + '(foundation/animations/transitions + the compiled copies in runtime/engines/modern/compiled), so the '
      + 'pins that name it are coverage gained, not regression. The record is kept verbatim rather than '
      + 'rewritten; decrease-only from here.',
  },
]);

/**
 * The APCA pairings that already ship under the body floor (F-75).
 *
 * They are listed by KEY so a new one cannot hide among them. Emptying the
 * ledger means repainting the ramps, which is sighted palette work and belongs
 * to the mode-palette lane the ledger's own `retire` field names; what this
 * gate holds today is that the set does not GROW.
 */
export function apcaKeys(root = DEFAULT_ROOT) {
  const ledger = EXTRA_LEDGERS.find((entry) => entry.id === 'apca-contrast');
  const path = join(root, ledger.path);
  if (!existsSync(path)) return null;
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  return (parsed.knownFailures ?? []).map((entry) => entry.key);
}

/**
 * The debt a ratcheted ledger is standing on.
 *
 * Baselines in this tree are not one shape: some are a flat counter map, some a
 * ledger of named finding lists, some a nested policy document. This walk
 * counts what every one of them agrees on -- a numeric leaf is a ceiling, a
 * list of findings is that many frozen findings -- and skips prose. It is a
 * SIZE report, never a verdict; the gate itself owns the verdict.
 *
 * It lives here, not in the runner, because the runner prints it beside every
 * gate and this file checks it: two walks over the same ledgers would be two
 * answers to one question.
 */
export function debtOf(path) {
  if (!existsSync(path)) return { error: `baseline missing: ${path}` };
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    return { error: `baseline unreadable: ${error instanceof Error ? error.message : String(error)}` };
  }
  const buckets = [];
  const walk = (node) => {
    if (Array.isArray(node)) {
      buckets.push(node.length);
      return;
    }
    if (node && typeof node === 'object') {
      for (const value of Object.values(node)) walk(value);
      return;
    }
    if (Number.isFinite(node)) buckets.push(node);
  };
  walk(baseline);
  if (buckets.length === 0) return { error: `baseline carries no counter: ${path}` };
  const frozen = buckets.reduce((total, value) => total + value, 0);
  const atZero = buckets.filter((value) => value === 0).length;
  return {
    counters: buckets.length,
    frozen,
    atZero,
    ratio: (buckets.length - atZero) / buckets.length,
    document: baseline,
  };
}

/** The one sentence the runner prints beside a ratcheted gate. */
export function describeDebt(relativePath, root = DEFAULT_ROOT) {
  if (!relativePath) return null;
  const debt = debtOf(join(root, relativePath));
  if (debt.error) return `debt: UNREADABLE (${debt.error})`;
  // Deliberately NOT called "findings": these ledgers pin counts, byte ceilings
  // and module ceilings side by side, so their sum has no single unit.
  // `debtRatio` is the figure that means the same thing everywhere -- how much
  // of a ledger is still standing on debt rather than on zero.
  return `debtRatio ${(debt.ratio * 100).toFixed(1)}% — ${debt.counters - debt.atZero} of `
    + `${debt.counters} pinned ceilings are above zero (ceiling sum ${debt.frozen}, mixed units)`;
}

function statedPurpose(document) {
  if (!document || typeof document !== 'object') return null;
  for (const field of PURPOSE_FIELDS) {
    const value = document[field];
    if (typeof value === 'string' && value.trim().length >= 20) return field;
  }
  return null;
}

function recordedMove(document) {
  if (!document || typeof document !== 'object') return null;
  const kind = document[MOVE_KIND_FIELD];
  if (typeof kind !== 'string' || !WIDENING.test(kind)) return null;
  return `${MOVE_KIND_FIELD}: ${kind.slice(0, 140)}`;
}

export function measure({ root = DEFAULT_ROOT, gates } = {}) {
  const ledgers = [
    ...gates.filter((gate) => gate.ratchet).map((gate) => ({ id: gate.id, path: gate.ratchet, kind: 'ratchet' })),
    ...EXTRA_LEDGERS.map((entry) => ({ id: entry.id, path: entry.path, kind: 'build-ledger' })),
  ];
  return ledgers.map((ledger) => {
    const debt = debtOf(join(root, ledger.path));
    return {
      ...ledger,
      error: debt.error ?? null,
      counters: debt.counters ?? 0,
      atZero: debt.atZero ?? 0,
      frozen: debt.frozen ?? 0,
      ratio: debt.ratio ?? null,
      purposeField: statedPurpose(debt.document),
      widening: recordedMove(debt.document),
    };
  });
}

export function evaluate(rows, { apca }) {
  const failures = [];
  if (rows.length === 0) failures.push('no ledger found at all — the inventory walk is broken');

  for (const row of rows) {
    if (row.error) {
      failures.push(`${row.id}: ${row.error}`);
      continue;
    }
    if (!row.purposeField && !ANONYMOUS_LEDGERS.includes(row.id)) {
      failures.push(
        `${row.id}: ${row.path} states no purpose — a ledger of numbers with no written subject is not an `
        + `adjudication (one of ${PURPOSE_FIELDS.join(', ')} must carry it)`,
      );
    }
    if (row.purposeField && ANONYMOUS_LEDGERS.includes(row.id)) {
      failures.push(
        `${row.id}: now states its purpose in \`${row.purposeField}\` and is still listed in ANONYMOUS_LEDGERS; `
        + 'remove it in this commit so the list keeps shrinking',
      );
    }
    const declared = WIDENINGS.find((entry) => entry.id === row.id);
    if (row.widening && !declared) {
      failures.push(
        `${row.id}: records a WIDENING and is not declared — ${row.widening}; a baseline may not be widened to `
        + 'reach green. Fix the finding, or have the owner declare it in WIDENINGS with a reason',
      );
    }
    if (!row.widening && declared) {
      failures.push(`${row.id}: declared in WIDENINGS but its ledger records no widening; remove the entry`);
    }
  }

  if (apca.actual === null) {
    failures.push('the APCA contrast ledger is missing — the build floor has no ledger to check against');
  } else {
    for (const key of apca.actual) {
      if (!apca.pinned.includes(key)) {
        failures.push(
          `apca-contrast: ${key} is a NEW pairing under the governed body floor. Every entry on this ledger is an `
          + 'accessibility defect that already ships; the set may shrink and may never grow',
        );
      }
    }
    for (const key of apca.pinned) {
      if (!apca.actual.includes(key)) {
        failures.push(`apca-contrast: ${key} is pinned and no longer on the ledger; remove it from PINNED_APCA_PAIRS`);
      }
    }
  }
  return failures;
}

/**
 * Ledgers that today carry no written subject, with the owner of the sentence
 * they are missing.
 *
 * Same shape as `WIDENINGS` and for the same reason: the list is an accusation
 * that may only shrink. A ledger that starts stating its purpose must leave
 * this list in the same commit, and a NEW anonymous ledger is refused outright
 * -- which is the only half of law 1 that can be enforced without editing
 * twelve files that belong to eleven other owners.
 */
export const ANONYMOUS_LEDGERS = Object.freeze([
  'structure-check',
  'containerquery',
  'engine-token-audit',
  'application-boundary-gate',
  'pattern-surface-ownership',
  'theme-channel-parity',
  'tenant-reachability',
  'i18n-key-parity',
  'tenant-channel-consumer',
  'tenant-channel-consumer-modern',
  'app-ds-boundary',
  'pack-inventory',
]);

/**
 * The sixteen pairings F-75 found already shipping, by key.
 *
 * Read from the ledger itself at pin time rather than retyped, because a second
 * hand-written copy of a list is the defect this programme has already paid for
 * five times. What is pinned is the SET, so the gate can tell a shrink from a
 * growth.
 */
export const PINNED_APCA_PAIRS = Object.freeze([
  // 2026-09-15 (D6-2c-i): the artifacts compile from the neutral foundation +
  // preset; build:vertical-artifacts measures 0 pairings below the body floor,
  // so the 16 former entries (rottay base success/warning/error/info -900;
  // bithire dark accent/success/warning/error/info -900; evnto dark
  // primary/secondary/accent/success/warning/error/info -900) left the ledger
  // under the decrease-only rule and leave this set with it. A ramp a preset
  // authors later is measured against its own ground and re-adjudicated.
]);

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { CI_GATES } = await import('../manifest/index.mjs');
  const rows = measure({ gates: CI_GATES });
  const actual = apcaKeys();
  const failures = evaluate(rows, { apca: { actual, pinned: [...PINNED_APCA_PAIRS] } });

  for (const id of ANONYMOUS_LEDGERS) {
    if (!rows.some((row) => row.id === id)) {
      failures.push(`${id}: listed as an anonymous ledger but no such ledger is in the inventory`);
    }
  }

  const counters = rows.reduce((total, row) => total + row.counters, 0);
  const aboveZero = rows.reduce((total, row) => total + (row.counters - row.atZero), 0);
  console.log(
    `baseline-discipline — ${rows.length} ledger(s); ${aboveZero} of ${counters} pinned ceilings above zero `
    + `(${((aboveZero / counters) * 100).toFixed(1)}%); ${WIDENINGS.length} declared widening(s); `
    + `${ANONYMOUS_LEDGERS.length} ledger(s) still without a written subject; `
    + `${actual?.length ?? 'no'} APCA pairing(s) shipping under the body floor`,
  );
  if (process.argv.includes('--report')) {
    for (const row of [...rows].sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))) {
      const ratio = row.ratio === null ? 'UNREADABLE' : `${(row.ratio * 100).toFixed(1)}%`;
      console.log(`  ${row.id.padEnd(38)} ${ratio.padStart(10)}  ${row.counters - row.atZero}/${row.counters}`);
    }
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error(`baseline-discipline FAIL — ${failure}`);
    process.exit(1);
  }
  console.log('baseline-discipline OK — every ledger names its subject, every widening is declared, APCA set exact.');
}
