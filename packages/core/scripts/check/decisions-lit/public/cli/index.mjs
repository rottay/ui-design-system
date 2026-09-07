#!/usr/bin/env node
/**
 * @fileoverview `decisions-lit` — how many of the 29 decisions move paint today.
 *
 *   run [--out <path>] [--vertical <k>]...   measure and write the artifact
 *   report [--in <path>]                     re-print the headline of an artifact
 *   check [--in <path>]                      refuse a published artifact that no
 *                                            longer describes this tree
 *
 * WHAT THE HEADLINE MEANS, EXACTLY. `decisions lit = n/22 (+m/10 new)`:
 *   n   decisions of TODAY's 22-control catalog whose recorded class is `full`
 *       -- the audit's measured classification, carried in the catalog with its
 *       provenance and NOT derived here (deriving it needs the per-decision
 *       minimum families that WO-CAT-02 fixes in the typed catalog).
 *   m   of the ten decisions the kit marks `(new)`, how many this run MEASURED
 *       moving something. That half is fully derived and fully covered: a new
 *       decision maps to no keypath, so its two arms compile to identical
 *       bytes, and the byte comparison is over the WHOLE artifact rather than
 *       over the fixture sample.
 *
 * THREE WAYS THIS RUN FAILS CLOSED:
 *   1. the catalog census no longer states 29 / 19 / 10 / 10;
 *   2. the positive control (`palette.seeds`) moves no family in some vertical,
 *      which means the instrument is not measuring and every `inert` verdict in
 *      the same run is void;
 *   3. a decision the catalog records as `new` is measured moving something --
 *      that is the indicator RISING, and it must be re-recorded deliberately
 *      rather than absorbed silently.
 *
 * @module Tooling/DecisionsLit/Public/Cli
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DECISIONS,
  NEW_DECISION_DENOMINATOR,
  NEW_DECISION_IDS,
  POSITIVE_CONTROL_ID,
  TODAY_CONTROL_DENOMINATOR,
  assertCatalogCensus,
} from '../../foundation/catalog/index.mjs';
import { VERTICAL_KEYS } from '../../../tokens/cascade/probe/foundation/scope/index.mjs';
import {
  assertDoorBuildIsFresh,
  compileDecisionArms,
  repoRelative,
} from '../../runtime/compile/index.mjs';
import {
  RERUN_COMMAND,
  freshnessFailures,
  readArtifact,
  sourceFingerprints,
} from '../../runtime/freshness/index.mjs';
import { measure } from '../../runtime/measure/index.mjs';

/**
 * Where a run publishes, resolved from THIS module and not from `cwd`.
 *
 * The roadmap STATUS generator reads the same constant through this module, so
 * the indicator and the probe can never disagree about which file is the
 * measurement.
 */
export const DEFAULT_ARTIFACT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../evidence/index.json',
);

/**
 * The component/layout families the matched fixtures stand for.
 *
 * The synthetic channel readout is excluded by name: it reads custom properties
 * directly and is an instrument, not a family.
 */
export function measuredFamilies(roster) {
  const ids = Object.values(roster).flatMap((note) => note.matched);
  return [
    ...new Set(
      ids.filter((id) => id !== 'token-readout').map((id) => id.split('-')[0]),
    ),
  ].sort();
}

/**
 * The recorded half, in the exact shape the acceptance gate reads.
 *
 * `lit` is the audit's recorded effect class, not this run's measurement; the
 * two are published side by side by {@link headlineLines} so the recorded
 * figure can never be read as the probe's own answer.
 */
export function headline(summary) {
  return `decisions lit = ${summary.lit}/${TODAY_CONTROL_DENOMINATOR} (+${summary.newLit}/${NEW_DECISION_DENOMINATOR} new)`;
}

/** The measured half, derived from this run's rows alone. */
export function measuredHeadline(summary, sampleSize) {
  return (
    `measured on the ${sampleSize}-family sample: ` +
    `${summary.measuredLit}/${TODAY_CONTROL_DENOMINATOR} move at least one sampled family`
  );
}

/** Both halves plus the discrepancies, as the lines a reader sees. */
export function headlineLines(summary, sampleSize) {
  const lines = [
    `${headline(summary)} — recorded`,
    `  ${measuredHeadline(summary, sampleSize)}`,
  ];
  if (summary.discrepancies.length === 0) {
    lines.push('  recorded and measured agree on every row');
    return lines;
  }
  for (const kind of ['recorded-full-moved-nothing', 'recorded-none-moved']) {
    const rows = summary.discrepancies.filter((row) => row.kind === kind);
    if (rows.length === 0) continue;
    lines.push(
      `  ${rows.length} ${kind}: ` +
        rows.map((row) => `${row.id} (${row.detail})`).join(', '),
    );
  }
  return lines;
}

/** Folds the measured rows into the published summary. */
export function summarize(rows) {
  const byId = new Map();
  for (const row of rows) {
    const entry = byId.get(row.id) ?? { id: row.id, verticals: [] };
    entry.verticals.push(row);
    byId.set(row.id, entry);
  }
  const decisions = DECISIONS.map((decision) => {
    const measured = byId.get(decision.id)?.verticals ?? [];
    const usable = measured.filter((row) => !row.excluded);
    return {
      id: decision.id,
      tier: decision.tier,
      recordedClass: decision.recordedClass,
      artifactBytesDiffer: usable.some((row) => row.artifactBytesDiffer),
      movedFamilies: [...new Set(usable.flatMap((row) => row.movedFamilies))].sort(),
      movedChannelCount: Math.max(0, ...usable.map((row) => row.movedChannels.length)),
      excludedIn: measured.filter((row) => row.excluded).map((row) => ({
        vertical: row.vertical,
        reason: row.excluded,
      })),
    };
  });
  const newlyMoving = decisions.filter(
    (row) => NEW_DECISION_IDS.includes(row.id) && row.artifactBytesDiffer,
  );
  const kept = decisions.filter((row) => row.recordedClass !== 'new');
  return {
    lit: decisions.filter((row) => row.recordedClass === 'full').length,
    partial: decisions.filter((row) => row.recordedClass === 'partial').length,
    inert: decisions.filter((row) => row.recordedClass === 'none').length,
    // The WO's own counting rule, applied to this run's rows: a decision counts
    // when it moves at least one family in at least one vertical. Derived, and
    // over the sampled families only -- which is why it is published beside the
    // recorded figure rather than replacing it.
    measuredLit: kept.filter((row) => row.movedFamilies.length > 0).length,
    discrepancies: discrepanciesOf(kept),
    newLit: newlyMoving.length,
    newlyMovingIds: newlyMoving.map((row) => row.id),
    decisions,
  };
}

/**
 * Where the recorded class and this run's measurement disagree.
 *
 * Neither side is authoritative: the sample cannot see a family it does not
 * carry, and the recorded class cannot see a tree that has moved since it was
 * taken. Publishing the disagreement is what keeps a stale record from passing
 * as a measurement.
 */
export function discrepanciesOf(kept) {
  const rows = [];
  for (const row of kept) {
    if (row.recordedClass === 'full' && row.movedFamilies.length === 0) {
      rows.push({
        id: row.id,
        kind: 'recorded-full-moved-nothing',
        detail: `${row.movedChannelCount} channels moved, 0 sampled families`,
      });
    }
    if (row.recordedClass === 'none' && row.movedFamilies.length > 0) {
      rows.push({
        id: row.id,
        kind: 'recorded-none-moved',
        detail: row.movedFamilies.join(', '),
      });
    }
  }
  return rows;
}

/** Every reason this run must not be published as green. */
export function violations({ summary, rows, verticals }) {
  const problems = [];
  for (const vertical of verticals) {
    const control = rows.find(
      (row) => row.id === POSITIVE_CONTROL_ID && row.vertical === vertical,
    );
    if (!control) {
      problems.push(`positive control ${POSITIVE_CONTROL_ID} was not measured in ${vertical}`);
      continue;
    }
    if (control.excluded) {
      problems.push(
        `positive control ${POSITIVE_CONTROL_ID} was excluded in ${vertical}: ${control.excluded}`,
      );
      continue;
    }
    if ((control.movedFamilies ?? []).length === 0) {
      problems.push(
        `positive control ${POSITIVE_CONTROL_ID} moved no family in ${vertical}; this run measures nothing`,
      );
    }
  }
  if (summary.newlyMovingIds.length > 0) {
    problems.push(
      `recorded as new but MEASURED MOVING: ${summary.newlyMovingIds.join(', ')}. ` +
        'The indicator has risen; re-record the class in foundation/catalog deliberately.',
    );
  }
  return problems;
}

async function commandRun(options) {
  assertCatalogCensus();
  const build = assertDoorBuildIsFresh();
  const verticals = options.verticals.length > 0 ? options.verticals : [...VERTICAL_KEYS];
  const { rows, roster, browser } = await measure({
    verticals,
    decisions: DECISIONS,
    compileArms: ({ vertical, decision }) =>
      compileDecisionArms({ vertical, slug: vertical, decision }),
  });
  const summary = summarize(rows);
  const problems = violations({ summary, rows, verticals });
  const sample = measuredFamilies(roster);
  const artifact = {
    tool: 'decisions-lit',
    producedAt: new Date().toISOString(),
    headline: headline(summary),
    measuredHeadline: measuredHeadline(summary, sample.length),
    denominators: {
      todayControlCatalog: TODAY_CONTROL_DENOMINATOR,
      newDecisions: NEW_DECISION_DENOMINATOR,
      kitRows: DECISIONS.length,
      measuredFamilySample: sample,
      cascadeMatrixFamilies: 25,
    },
    provenance: {
      build,
      // What this run is a measurement OF. `check` recomputes both digests from
      // the tree and refuses the artifact when either has moved, so the STATUS
      // row cannot keep publishing a number whose subject is gone.
      sources: sourceFingerprints(),
      browser: { ...browser, resolved: repoRelative(browser.resolved), root: repoRelative(browser.root) },
      roster,
      recordedClassSource:
        'audit/50-matrices/cascade section 1 crossed with audit/70-plan/roadmap-draft/consumer-contract.md section 4',
      derivedHere: [
        'artifactBytesDiffer',
        'movedFamilies',
        'movedChannelCount',
        'newLit',
        'measuredLit',
        'discrepancies',
      ],
    },
    summary,
    rows,
    violations: problems,
  };
  const out = options.out ? resolve(process.cwd(), options.out) : DEFAULT_ARTIFACT;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(artifact, null, 2)}\n`);
  printReport(artifact, out);
  return problems.length === 0 ? 0 : 1;
}

function printReport(artifact, path) {
  const { summary, denominators } = artifact;
  for (const line of headlineLines(summary, denominators.measuredFamilySample.length)) {
    process.stdout.write(`${line}\n`);
  }
  process.stdout.write(
    `  recorded classes: ${summary.lit} full, ${summary.partial} partial, ${summary.inert} inert of the ` +
      `${TODAY_CONTROL_DENOMINATOR}-control catalog; ${NEW_DECISION_DENOMINATOR} decisions do not exist yet\n`,
  );
  process.stdout.write(
    `  whole artifact: ${summary.decisions.filter((row) => row.artifactBytesDiffer).length}/${
      summary.decisions.length
    } kit rows change the compiled artifact; family sample ${denominators.measuredFamilySample.join(
      ', ',
    )} of ${denominators.cascadeMatrixFamilies} cascade families\n`,
  );
  if (path) process.stdout.write(`  artifact: ${repoRelative(path)}\n`);
  for (const problem of artifact.violations) process.stderr.write(`REFUSED — ${problem}\n`);
}

/**
 * The published artifact still describes this tree, or it is refused by name.
 *
 * This is the CI-visible half of the probe: the run itself needs a browser and
 * a built door, which the gate job provides for neither, so what CI enforces is
 * that the committed measurement has not silently stopped being one.
 */
function commandCheck(options) {
  assertCatalogCensus();
  const path = options.in ? resolve(process.cwd(), options.in) : DEFAULT_ARTIFACT;
  const artifact = readArtifact(path);
  const fingerprints = sourceFingerprints();
  const failures = freshnessFailures({
    artifact,
    fingerprints,
    artifactPath: repoRelative(path),
  });
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`REFUSED — ${failure}\n`);
    return 1;
  }
  process.stdout.write(
    `decisions-lit freshness: ${repoRelative(path)} still describes this tree\n` +
      `  ${artifact.headline} — run of ${artifact.producedAt}\n` +
      `  door ${fingerprints.door.roots.join(', ')} — ${fingerprints.door.fileCount} files, ` +
      `digest ${fingerprints.door.digest.slice(0, 12)}\n` +
      `  instrument ${fingerprints.instrument.fileCount} files, ` +
      `digest ${fingerprints.instrument.digest.slice(0, 12)}\n` +
      `  a red here is answered by \`${RERUN_COMMAND}\`, never by editing the artifact\n`,
  );
  return 0;
}

function commandReport(options) {
  const path = options.in ? resolve(process.cwd(), options.in) : DEFAULT_ARTIFACT;
  const artifact = JSON.parse(readFileSync(path, 'utf-8'));
  printReport(artifact, path);
  return artifact.violations.length === 0 ? 0 : 1;
}

function parse(argv) {
  const options = { verticals: [], out: null, in: null };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--vertical') options.verticals.push(argv[(index += 1)]);
    else if (flag === '--out') options.out = argv[(index += 1)];
    else if (flag === '--in') options.in = argv[(index += 1)];
    else throw new Error(`decisions-lit: unknown flag ${flag}`);
  }
  return options;
}

export async function main(argv) {
  const [command, ...rest] = argv;
  const options = parse(rest);
  if (command === 'run') return commandRun(options);
  if (command === 'report') return commandReport(options);
  if (command === 'check') return commandCheck(options);
  process.stderr.write('usage: decisions-lit run|report|check [--vertical k] [--out p] [--in p]\n');
  return 2;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^.*?(?=scripts)/, ''))) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      process.stderr.write(`decisions-lit: ${error?.stack ?? error}\n`);
      process.exit(1);
    },
  );
}
