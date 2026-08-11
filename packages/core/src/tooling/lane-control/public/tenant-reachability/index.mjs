#!/usr/bin/env node
/**
 * @fileoverview THE CONVERSE RATCHET.
 *
 * Every `--ds-*` that a vertical artifact declares as a RESOLVED LITERAL, above
 * a read-count floor, must be reachable from the tenant document — a typed
 * appearance field, a chrome family, or an override token — or be an ACCEPTED
 * CONSTANT with a written reason.
 *
 * WHY NEITHER EXISTING GATE CAN SEE THIS.
 *   `tenant-channel-consumer-gate` enumerates DECLARED channels and hunts for
 *   readers. That is the dead-dial direction. `--ds-color-border` has hundreds
 *   of readers and is not a declared channel, so it can never appear in that
 *   gate's output — blind by construction, not by oversight.
 *   `theme-channel-parity-gate` asks whether a name is OWNED by some typed
 *   field. Static BrandTheme ownership satisfies it without any tenant being
 *   able to write the name.
 * This gate asks the third question: **can the tenant reach this?** A name that
 * fails it is paint frozen into the shipped bundle that no customer can change.
 *
 * DIRECTION OF ERROR. Under-counting reach INFLATES the defect; under-counting
 * reads DEFLATES it. So the reach side fails loudly when it cannot enumerate an
 * emitter (`E0`), and the read side is a declared floor that only ever excludes
 * names. Neither silently invents a finding.
 *
 * THE RATCHET.
 *   · decrease-only — the seed may shrink, never grow
 *   · a NEW literal-declared unreachable name fails IMMEDIATELY, even while the
 *     seed is large. That is what makes this useful on day one rather than
 *     after the drain finishes.
 *   · acceptance requires a written reason per name; silence is not acceptance
 *
 * NOT FROM `dist`. Two existing gates import build output, which is exactly how
 * a stranded compiler correction shipped unnoticed: the artifact builder reads
 * `dist`, so an artifact check that also reads `dist` compares a stale build
 * against a stale artifact and agrees with itself. Everything here is committed
 * source.
 *
 * USAGE
 *   node .../public/tenant-reachability/index.mjs [--json] [--min-reads N]
 *   node .../public/tenant-reachability/index.mjs --write-baseline
 *   node .../public/tenant-reachability/index.mjs --explain --ds-some-name
 *
 * EXIT 0 clean · 1 violations · 2 could not run.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { repoRoot } from '../../foundation/git/index.mjs';
import { conclude, createFindings, EXIT, parseArgs } from '../../foundation/report/index.mjs';
import { literalNames, loadArtifacts, VERTICALS } from '../../runtime/artifact-literals/index.mjs';
import { readCounts, SCOPE_STATEMENT } from '../../runtime/ds-reads/index.mjs';
import { REACH_SOURCES, tenantReach } from '../../runtime/tenant-reach/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BASELINE_PATH = resolve(HERE, 'baseline.json');
export const ACCEPTED_PATH = resolve(HERE, 'accepted-constants.json');
const MIN_REASON = 25;

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** The measurement. No baseline, no acceptance — just what is true today. */
export function measure({ root, minReads = 1 }) {
  const { perVertical, union } = loadArtifacts({ root });
  const reachModel = tenantReach({ root });
  const { counts, filesScanned } = readCounts({ root });

  const literals = literalNames(union);
  const unreachable = [];
  for (const entry of literals) {
    if (reachModel.reach.has(entry.name)) continue;
    const reads = counts.get(entry.name) ?? 0;
    if (reads < minReads) continue;
    unreachable.push({
      name: entry.name,
      reads,
      literalIn: entry.literalIn,
      formulaIn: entry.formulaIn,
      sample: entry.samples[0] ?? null,
    });
  }
  unreachable.sort((a, b) => b.reads - a.reads || a.name.localeCompare(b.name));

  const perVerticalUnreachable = {};
  for (const vertical of VERTICALS) {
    const names = perVertical.get(vertical);
    perVerticalUnreachable[vertical] = [...names.values()].filter(
      (entry) => !entry.formula && !reachModel.reach.has(entry.name) && (counts.get(entry.name) ?? 0) >= minReads,
    ).length;
  }

  return {
    reachModel,
    counts,
    filesScanned,
    literalCount: literals.length,
    declaredCount: union.size,
    unreachable,
    perVerticalUnreachable,
    totalReads: unreachable.reduce((sum, entry) => sum + entry.reads, 0),
    minReads,
  };
}

export function evaluate({ measurement, baseline, accepted }) {
  const { add, findings } = createFindings();

  // E0 — the reach set must be complete before any number is reported.
  if (measurement.reachModel.unattributed.length > 0) {
    add({
      rule: 'E0-unattributed-emitter',
      message: `${measurement.reachModel.unattributed.length} interpolated emitter template(s) belong to no enumerator. The reach set is incomplete, so the defect count would be INFLATED. Refusing to report a number until this is empty.`,
      details: measurement.reachModel.unattributed
        .slice(0, 10)
        .map((entry) => `${entry.owner} → ${entry.template}${entry.reason ? `  (${entry.reason})` : ''}`),
    });
    return { findings, admissible: false };
  }

  const acceptedNames = new Map(Object.entries(accepted.names ?? {}));
  for (const [name, reason] of acceptedNames) {
    if (typeof reason !== 'string' || reason.trim().length < MIN_REASON) {
      add({
        rule: 'E3-acceptance-without-reason',
        message: `accepted constant "${name}" carries no written reason (needs ${MIN_REASON}+ characters). Silence is not acceptance.`,
      });
    }
  }

  const live = measurement.unreachable.filter((entry) => !acceptedNames.has(entry.name));
  const liveNames = new Set(live.map((entry) => entry.name));
  const seeded = new Set(baseline.names ?? []);

  // E1 — a NEW unreachable literal fails immediately, seed size notwithstanding.
  const added = live.filter((entry) => !seeded.has(entry.name));
  if (added.length > 0) {
    add({
      rule: 'E1-new-unreachable-literal',
      message: `${added.length} name(s) are newly declared as resolved literals with no tenant route. A new one fails immediately — the seed is a debt to drain, not a licence to add to it.`,
      details: added
        .slice(0, 15)
        .map((entry) => `${entry.name}  reads=${entry.reads}  literal in [${entry.literalIn.join(', ')}]  e.g. ${entry.sample ?? ''}`),
    });
  }

  // E2 — decrease-only.
  const drained = [...seeded].filter((name) => !liveNames.has(name));
  if (baseline.names && liveNames.size > seeded.size) {
    add({
      rule: 'E2-ratchet-increased',
      message: `the unreachable set grew from ${seeded.size} to ${liveNames.size}. This ratchet is decrease-only.`,
    });
  }

  return { findings, admissible: true, live, added, drained, seeded };
}

function main(argv) {
  const { flags } = parseArgs(argv);
  let root;
  let measurement;
  try {
    root = repoRoot();
    measurement = measure({ root, minReads: Number(flags.get('min-reads') ?? 1) });
  } catch (error) {
    console.error(`✗ tenant-reachability could not run: ${error.message}`);
    return EXIT.USAGE;
  }

  // Machine modes. They exist so the drills can exercise this gate through its
  // real CLI instead of importing it: `quality/` sits below `public/` in the
  // layer order, and a drill that imported its target would be an upward
  // dependency the structure audit is right to refuse.
  if (typeof flags.get('evaluate-fixture') === 'string') {
    const fixture = JSON.parse(readFileSync(String(flags.get('evaluate-fixture')), 'utf8'));
    const outcome = evaluate({
      measurement: {
        reachModel: { unattributed: [], reach: new Map(), enumerators: [], perEnumerator: new Map(), ...fixture.reachModel },
        unreachable: fixture.unreachable ?? [],
        minReads: 1,
      },
      baseline: fixture.baseline ?? { names: [] },
      accepted: fixture.accepted ?? { names: {} },
    });
    console.log(
      JSON.stringify({ admissible: outcome.admissible, rules: outcome.findings.map((finding) => finding.rule), live: outcome.live?.length ?? null }),
    );
    return outcome.findings.length === 0 ? EXIT.OK : EXIT.VIOLATION;
  }

  if (flags.get('audit-json')) {
    const corpus = REACH_SOURCES.map((path) => readFileSync(`${root}/${path}`, 'utf8')).join('\n');
    const interpolationOnly = [...measurement.reachModel.reach.entries()]
      .filter(([, routes]) => [...routes].every((route) => route.startsWith('interpolated:')))
      .map(([name]) => name)
      .filter((name) => !corpus.includes(name));
    console.log(
      JSON.stringify({
        unreachable: measurement.unreachable.map((entry) => entry.name),
        interpolationOnly,
        perVertical: measurement.perVerticalUnreachable,
        totalReads: measurement.totalReads,
        unattributed: measurement.reachModel.unattributed.length,
      }),
    );
    return EXIT.OK;
  }

  const explain = [...flags.keys()].find((key) => key.startsWith('ds-'));
  if (flags.get('explain') && explain) {
    const name = `--${explain}`;
    const routes = measurement.reachModel.reach.get(name);
    console.log(`${name}\n  reads (DS-internal floor): ${measurement.counts.get(name) ?? 0}`);
    console.log(`  tenant routes: ${routes ? [...routes].join(', ') : 'NONE — unreachable'}`);
    return EXIT.OK;
  }

  const baseline = readJson(BASELINE_PATH, { names: null });
  const accepted = readJson(ACCEPTED_PATH, { names: {} });
  const result = evaluate({ measurement, baseline, accepted });

  if (flags.get('write-baseline')) {
    if (!result.admissible) {
      console.error('✗ refusing to seed a baseline while the reach set is incomplete');
      return EXIT.VIOLATION;
    }
    writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify(
        {
          _comment:
            'Seed for the converse ratchet: names declared as resolved literals in a vertical artifact, above the read floor, with no tenant route. Decrease-only. A name absent from this list fails immediately.',
          minReads: measurement.minReads,
          scope: SCOPE_STATEMENT,
          count: result.live.length,
          names: result.live.map((entry) => entry.name).sort(),
        },
        null,
        2,
      )}\n`,
    );
    console.log(`✓ baseline seeded with ${result.live.length} names at min-reads=${measurement.minReads}`);
    return EXIT.OK;
  }

  if (!flags.get('json')) {
    console.log(`corpus: ${measurement.filesScanned} files · ${SCOPE_STATEMENT}`);
    console.log(
      `artifacts: ${measurement.declaredCount} names declared across ${VERTICALS.join('/')} · ${measurement.literalCount} resolved-literal in at least one`,
    );
    console.log(
      `tenant reach: ${measurement.reachModel.reach.size} names · ${measurement.reachModel.overrideCount} override dials · ${measurement.reachModel.enumerators.length} interpolated emitters enumerated, 0 unattributed`,
    );
    for (const enumerator of measurement.reachModel.enumerators) {
      console.log(`  · ${enumerator.id.padEnd(34)} ${String(measurement.reachModel.perEnumerator.get(enumerator.id)?.size ?? 0).padStart(4)} names — ${enumerator.evidence.slice(0, 120)}`);
    }
    console.log(
      `UNREACHABLE LITERALS: ${measurement.unreachable.length} names / ${measurement.totalReads} DS-internal reads (floor) at min-reads=${measurement.minReads}`,
    );
    console.log(
      `  per vertical: ${Object.entries(measurement.perVerticalUnreachable).map(([vertical, count]) => `${vertical} ${count}`).join(' · ')}`,
    );
  }

  return conclude({
    name: 'tenant-reachability',
    findings: result.findings,
    json: flags.get('json'),
    summary: result.admissible
      ? `${result.live?.length ?? 0} live · ${result.drained?.length ?? 0} drained since the seed`
      : 'reach set incomplete',
  });
}

/**
 * Exact entrypoint identity.
 *
 * A suffix test (`argv[1].endsWith("x/index.mjs")`) matches ANY path ending
 * that way. The drill folder for this module ends the same way, so importing
 * this file from its own drill ran main() and exited the process before a
 * single drill executed. Compare the resolved URL instead.
 */
function isEntrypoint(moduleUrl) {
  return process.argv[1] !== undefined && moduleUrl === pathToFileURL(process.argv[1]).href;
}

if (isEntrypoint(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
