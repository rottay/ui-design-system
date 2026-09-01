#!/usr/bin/env node
/**
 * reads-adjudication-gate — every unadjudicated read has exactly one owner row.
 *
 * FASE K law (independent code audit update 2026-08-02): a --ds-* read the hook contract fences
 * as "unadjudicated" may not ship without an ownership classification. This
 * gate pins the projection `governance/tokens/decisions/reads/index.json` to the CURRENT
 * hooks-manifest by digest and enforces:
 *   - set-equality: rows == manifest.unadjudicatedReads (no missing, no extra);
 *   - closed vocabulary (7 classes) — a future class cannot be silently added;
 *   - no duplicate names; every row carries evidence.
 * The ledger RECORDS ownership; it never licenses an execution by itself.
 *
 * --check          exit 1 on any violation
 * --drill=<case>   self-inject one violation each: missing | invalid-class | stale-digest
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const LEDGER_PATH = join(ROOT, 'governance/tokens/decisions/reads/index.json');
const MANIFEST_PATH = join(ROOT, 'contracts/css/hooks/index.json');

const CLASSES = new Set([
  'MODERN_PRIVATE', 'FOUNDATION_SHARED', 'TENANT_FACING_CANDIDATE',
  'APP_HOOK_CANDIDATE', 'FROZEN_ENGINE_SCOPED', 'PHANTOM_OR_TYPO', 'ALIAS_READ',
]);

const args = process.argv.slice(2);
const drillArg = args.find((a) => a.startsWith('--drill'));
const drill = drillArg?.includes('=') ? drillArg.split('=')[1] : undefined;

export function checkLedger({ ledger, manifestRaw, drillCase }) {
  const failures = [];
  const manifest = JSON.parse(manifestRaw.toString());
  const expected = new Set(manifest.unadjudicatedReads);
  if (drillCase === 'missing') expected.add('--ds-drill-ghost-read');

  const digest = createHash('sha256').update(manifestRaw).digest('hex');
  const storedDigest = drillCase === 'stale-digest' ? 'deadbeef' : ledger.basedOnManifestDigest;
  if (storedDigest !== digest) {
    failures.push('ledger is STALE relative to contracts/css/hooks/index.json — regenerate the merge (basedOnManifestDigest mismatch)');
  }

  const seen = new Set();
  const rows = [...ledger.rows];
  if (drillCase === 'invalid-class') rows.push({ name: '--ds-drill-bad', class: 'PROMOTE_EVERYTHING', evidence: 'drill' });
  for (const row of rows) {
    if (seen.has(row.name)) failures.push(`duplicate row: ${row.name}`);
    seen.add(row.name);
    if (!CLASSES.has(row.class)) failures.push(`class outside the closed vocabulary: ${row.name} = ${row.class}`);
    if (!row.evidence) failures.push(`row without evidence: ${row.name}`);
    if (!drillCase && !expected.has(row.name)) failures.push(`row for a name the manifest does not fence: ${row.name}`);
  }
  for (const name of expected) {
    if (!seen.has(name)) failures.push(`unadjudicated read WITHOUT owner row: ${name}`);
  }
  const actualByClass = {};
  for (const row of ledger.rows) actualByClass[row.class] = (actualByClass[row.class] ?? 0) + 1;
  if (ledger.counts?.total !== ledger.rows.length) {
    failures.push(`counts.total is stale: ${ledger.counts?.total} != ${ledger.rows.length}`);
  }
  if (JSON.stringify(ledger.counts?.byClass ?? {}) !== JSON.stringify(actualByClass)) {
    failures.push('counts.byClass is stale relative to rows');
  }
  return failures;
}

function main() {
  if (!existsSync(LEDGER_PATH)) {
    console.error('reads-adjudication FAIL — ledger missing (governance/tokens/decisions/reads/index.json)');
    process.exit(1);
  }
  const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));
  const manifestRaw = readFileSync(MANIFEST_PATH);
  const failures = checkLedger({ ledger, manifestRaw, drillCase: drill });
  if (drill) {
    if (failures.length === 0) {
      console.error(`reads-adjudication DRILL FAIL — case "${drill}" produced zero violations (vacuous gate)`);
      process.exit(1);
    }
    console.log(`reads-adjudication drill "${drill}" OK — ${failures.length} violation(s) detected as designed`);
    return;
  }
  if (failures.length > 0) {
    for (const f of failures.slice(0, 20)) console.error(`reads-adjudication FAIL — ${f}`);
    console.error(`reads-adjudication: ${failures.length} violation(s)`);
    process.exit(1);
  }
  const byClass = Object.entries(ledger.counts?.byClass ?? {}).map(([k, v]) => `${k}=${v}`).join(' ');
  console.log(`reads-adjudication OK — ${ledger.rows.length} reads owned, 0 without owner (${byClass})`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
