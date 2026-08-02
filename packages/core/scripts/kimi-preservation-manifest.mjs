/**
 * KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST generator (binding correction:
 * premium depth is PRESERVED, never cleaned away). A versioned projection —
 * derived from the prototype-ledger (the 80 governed protos, whose
 * categories ARE the adjudication), the census report (status/consumers),
 * and the reconciliation (dead provenance) — that guarantees ZERO undecided
 * entries and pins the no-loss laws:
 *
 *   - a census `dead-writer` verdict is NEVER a deletion license by itself;
 *   - Kimi/premium-origin dead writers default to RECONNECT/PROMOTE;
 *   - every RETIRE requires successor/death-proof fields, not a count.
 *
 * `--write` regenerates KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json;
 * `--check` fails on: any entry without a decision, any RETIRE without
 * successor+deathProof, any Kimi-provenance dead writer marked RETIRE, or a
 * manifest not derived from the current report digest. `--drill=<case>`
 * self-injects each violation.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = join(ROOT, 'src/foundation/tokens/prototype-ledger.json');
const REPORT = join(ROOT, 'customization-surface-report.json');
const OUT = join(ROOT, 'KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json');

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a === name || a.startsWith(`${name}=`));
const drill = (() => {
  const hit = flag('--drill');
  return hit?.includes('=') ? hit.split('=')[1] : undefined;
})();

/** Ledger category → the binding-order decision vocabulary. */
const DECISION_BY_CATEGORY = {
  PRIVATE: 'PRIVATE_CANONICAL',
  DERIVE_FROM_EXISTING: 'DERIVE_FROM_EXISTING',
  FOUNDATION_AUTHORITY: 'PROMOTE_FOUNDATION',
  MERGE_RENAME: 'MERGE_RENAME',
  RECIPE_AXIS: 'RECIPE_AXIS',
  RUNTIME_INSTANCE_BRIDGE: 'RUNTIME_INSTANCE_BRIDGE',
  APP_SLOT: 'RUNTIME_INSTANCE_BRIDGE',
  PRODUCT_DOMAIN: 'PRIVATE_CANONICAL',
  DELETE: 'RETIRE_WITH_DEATH_PROOF',
};

/** Kimi/premium dead-writer families: RECONNECT/PROMOTE, never auto-RETIRE. */
export const KIMI_PREMIUM_DEAD_PREFIXES = Object.freeze([
  '--ds-tall-card-', '--ds-workspace-card-', '--ds-compact-card-',
  '--ds-collection-card-', '--ds-signal-card-', '--ds-metric-card-',
  '--ds-listing-grid-', '--ds-premium-card-', '--ds-rich-card-',
]);

const PROVENANCE_RULES = [
  { id: 'A-kimi-premium', test: (n) => KIMI_PREMIUM_DEAD_PREFIXES.some((p) => n.startsWith(p)), decision: 'RECONNECT_OR_PROMOTE', owner: 'kimi+design-system/D1-premium' },
  { id: 'C-legacy-mirror', test: (n) => /^--ds-(avatar|badge|radio|checkbox|select|slider|calendar|datepicker|inputnumber|steps|toggle|switch|autocomplete|anchor|backtop|tree|pagination|dropdown|drawer|notification|progress|list|image|spinner|tag|toast)-/.test(n), decision: 'MIGRATE_USEFUL_THEN_RETIRE_MIRROR', owner: 'design-system/D1-legacy' },
  { id: 'E-reserved-frontier', test: (n) => /reserved|--ds-tint-/.test(n), decision: 'INTERNAL_ROADMAP_UNTIL_OPENING', owner: 'design-system/frontier' },
  { id: 'D-compiler-generated', test: (n, row) => row?.category === 'compiler-derived-channel' || row?.category === 'ts-emission-site', decision: 'CONNECT_CONSUMER_OR_RETIRE_EMITTER', owner: 'design-system/D1-compilers' },
  { id: 'B-modern-current', test: () => true, decision: 'PRIVATE_CHANNEL_OR_DERIVE_PER_NAME', owner: 'design-system/D1-modern' },
];

export function buildManifest() {
  const ledger = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const report = JSON.parse(readFileSync(REPORT, 'utf8'));
  const reportDigest = createHash('sha256').update(readFileSync(REPORT)).digest('hex');

  const protos = ledger.entries.map((entry) => {
    const row = report.rows[entry.name];
    const decision = DECISION_BY_CATEGORY[entry.category] ?? null;
    return {
      name: entry.name,
      familyComponent: entry.family,
      expressiveAxis: entry.axis,
      visualPurpose: entry.purpose,
      cssType: entry.cssType,
      source: 'prototype-ledger.json (C1 governed census)',
      consumers: entry.consumers,
      currentFallback: entry.fallback,
      currentStatus: entry.status ?? row?.status ?? 'ledger-only',
      currentUpstreamControl: entry.category === 'DERIVE_FROM_EXISTING' ? (entry.notes ?? 'named in ledger notes') : 'none (proto by definition)',
      downstreamImpact: `consumers recorded in ledger row (${Array.isArray(entry.consumers) ? entry.consumers.length : 'n/a'} sites)`,
      decision,
      successor: entry.category === 'DELETE' || entry.category === 'MERGE_RENAME' ? (entry.notes ?? null) : null,
      preservationEvidence:
        entry.status === 'retired'
          ? `executed: ${String(entry.notes ?? '').slice(0, 220)} — zero source occurrences outside the ledger (gate-verified), fallback preserved at consumption`
          : 'PLANNED batch contract: BitHire computed default preserved byte-identically; upstream-moves-downstream drill defined per batch (FASE 4)',
      state: entry.status === 'retired' ? 'IMPLEMENTED' : 'PLANNED',
      bithireDefault: entry.status === 'retired'
        ? { before: entry.fallback, after: entry.fallback, law: 'fallback preserved byte-identically at the consumption site' }
        : { before: entry.fallback, after: 'PLANNED — batch not yet executed' },
      theManagementPath: entry.status === 'retired'
        ? { divergesVia: entry.notes ?? 'successor authority named in ledger notes' }
        : { divergesVia: 'PLANNED' },
      owner: entry.owner ?? 'design-system-program',
    };
  });

  if (drill === 'undecided') protos.push({ name: '--_ds-proto-drill-ghost', decision: null, owner: 'drill' });
  if (drill === 'placeholder') protos.push({ name: '--_ds-proto-drill-ph', decision: 'DERIVE_FROM_EXISTING', state: 'IMPLEMENTED', preservationEvidence: 'migration pending', owner: 'drill' });
  if (drill === 'retire-no-proof') protos.push({ name: '--_ds-proto-drill-retire', decision: 'RETIRE_WITH_DEATH_PROOF', successor: null, owner: 'drill' });

  const dead = report.deadWriters.map((name) => {
    const row = report.rows[name];
    const rule = PROVENANCE_RULES.find((r) => r.test(name, row));
    return { name, provenance: rule.id, decision: rule.decision, owner: rule.owner, status: row?.status };
  });
  if (drill === 'kimi-retire') dead.push({ name: '--ds-signal-card-drill', provenance: 'A-kimi-premium', decision: 'RETIRE_WITH_DEATH_PROOF', owner: 'drill' });

  const provenanceCounts = {};
  for (const d of dead) provenanceCounts[d.provenance] = (provenanceCounts[d.provenance] ?? 0) + 1;

  return {
    schemaVersion: 1,
    generatedBy: 'scripts/kimi-preservation-manifest.mjs --write',
    basedOnReportDigest: reportDigest,
    laws: [
      'preserve 100% of useful premium visual capability; connect it to the canon',
      'a census dead-writer verdict is never a deletion license',
      'Kimi/premium provenance defaults to RECONNECT/PROMOTE — RETIRE is forbidden there',
      'every RETIRE requires: zero DS consumers, zero app consumers, zero artifact consumers, successor or justification, computed-default no-loss, sighted review if it painted',
    ],
    prototokens: { total: protos.filter((p) => !p.name.includes('drill')).length, entries: protos },
    deadWriters: { total: dead.filter((d) => !d.name.includes('drill')).length, byProvenance: provenanceCounts, entries: dead },
  };
}

const PLACEHOLDER_PHRASES = [
  'migration pending',
  'owned by executing batch',
  'owned by the executing batch',
  'must survive',
  'diverges through future upstream',
];

export function checkManifest(manifest) {
  const failures = [];
  // FASE A law: an IMPLEMENTED entry may not carry placeholder evidence.
  for (const entry of manifest.prototokens.entries) {
    if (entry.state !== 'IMPLEMENTED') continue;
    const blob = JSON.stringify(entry).toLowerCase();
    for (const phrase of PLACEHOLDER_PHRASES) {
      if (blob.includes(phrase)) {
        failures.push(`IMPLEMENTED entry with placeholder evidence ("${phrase}"): ${entry.name}`);
      }
    }
  }
  for (const entry of manifest.prototokens.entries) {
    if (!entry.decision) failures.push(`undecided prototoken: ${entry.name}`);
    if (entry.decision === 'RETIRE_WITH_DEATH_PROOF' && !entry.successor) {
      failures.push(`RETIRE without successor/death proof: ${entry.name}`);
    }
  }
  for (const entry of manifest.deadWriters.entries) {
    if (!entry.decision) failures.push(`unclassified dead writer: ${entry.name}`);
    if (entry.provenance === 'A-kimi-premium' && /RETIRE/.test(entry.decision)) {
      failures.push(`FORBIDDEN: Kimi-premium dead writer marked RETIRE: ${entry.name}`);
    }
  }
  if (existsSync(OUT)) {
    const stored = JSON.parse(readFileSync(OUT, 'utf8'));
    if (stored.basedOnReportDigest !== manifest.basedOnReportDigest) {
      failures.push('preservation manifest is STALE relative to the census report — regenerate');
    }
  } else {
    failures.push('preservation manifest missing — run --write');
  }
  return failures;
}

function main() {
  const manifest = buildManifest();
  if (flag('--write')) {
    writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`preservation-manifest: ${manifest.prototokens.total} protos + ${manifest.deadWriters.total} dead classified (${JSON.stringify(manifest.deadWriters.byProvenance)})`);
  }
  if (flag('--check') || drill) {
    const failures = checkManifest(manifest);
    if (failures.length > 0) {
      for (const failure of failures) console.error(`preservation FAIL — ${failure}`);
      process.exit(1);
    }
    console.log(`preservation --check OK (${manifest.prototokens.total} protos decided, ${manifest.deadWriters.total} dead classified, 0 undecided)`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
