#!/usr/bin/env node
/**
 * engine-freeze-gate — Classic/Rustic are FROZEN (engine policy 2026-07-25,
 * Codex): implementation and visual-excellence effort is exclusively Modern.
 * Classic/Rustic are read-only except a minimal compile fix, and their
 * failures are reported, never blocking.
 *
 * This gate rejects NEW changes under `engines/classic/` and
 * `engines/rustic/` beyond the grandfathered baseline (the allowlist of
 * paths already dirty when the policy was sealed, mostly pre-existing WIP).
 * It is PATH-scoped: a path becomes suspect when it appears in
 * `git status --porcelain` and is not in the baseline. Baseline paths that
 * come back clean are fine (decrease-only by construction).
 *
 * Escape hatch (the "explicit allowlist" the policy names): when a change
 * genuinely must touch a frozen engine — a shared-contract compile fix —
 * regenerate the baseline with `--write` in the SAME change and document the
 * reason in that change's notes. Never use --write to smuggle engine work.
 *
 * Usage:
 *   node scripts/engine-freeze-gate.mjs            # print the report
 *   node scripts/engine-freeze-gate.mjs --check    # exit 1 on any violation
 *   node scripts/engine-freeze-gate.mjs --write    # regenerate the baseline
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const BASELINE_PATH = join(scriptDir, 'engine-freeze-gate.baseline.json');

const FROZEN = /(^|\/)engines\/(classic|rustic)\//;
const MODE = process.argv.includes('--write')
  ? 'write'
  : process.argv.includes('--check')
    ? 'check'
    : 'report';

function porcelainFrozen() {
  const out = execFileSync('git', ['-C', repoRoot, 'status', '--porcelain'], {
    encoding: 'utf8',
  });
  const rows = [];
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    const status = line.slice(0, 2);
    const path = line.slice(3).replace(/^"|"$/g, '');
    if (FROZEN.test(path)) rows.push({ status: status.trim(), path });
  }
  return rows;
}

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) return { paths: [] };
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
}

function writeBaseline(rows) {
  const paths = rows
    .filter((r) => r.status !== 'D')
    .map((r) => r.path)
    .sort();
  const payload = {
    _comment:
      'Grandfathered allowlist for the Classic/Rustic engine freeze (policy 2026-07-25). ' +
      'Regenerate ONLY with engine-freeze-gate.mjs --write inside the change that proves a ' +
      'frozen-engine edit is a minimal compile fix, and document the reason there. Never widen ' +
      'to smuggle Classic/Rustic work.',
    policy:
      'Classic/Rustic are read-only; implementation effort is exclusively Modern. ' +
      'Any frozen path not listed here that shows up dirty in git status fails the gate.',
    paths,
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

const rows = porcelainFrozen();
const baseline = readBaseline();
const allowed = new Set(baseline.paths ?? []);

if (MODE === 'write') {
  const payload = writeBaseline(rows);
  console.log(
    `engine-freeze-gate: baseline written (${payload.paths.length} grandfathered paths)`,
  );
  process.exit(0);
}

const violations = rows.filter((r) => !allowed.has(r.path));
const deleted = rows.filter((r) => r.status === 'D' && allowed.has(r.path));

console.log(
  `engine-freeze-gate — frozen dirs: engines/classic, engines/rustic | ` +
    `dirty frozen paths: ${rows.length} | grandfathered: ${allowed.size} | ` +
    `violations: ${violations.length} | deleted-baseline: ${deleted.length}`,
);

for (const v of violations) {
  console.log(
    `  NEW frozen-engine change [${v.status}] ${v.path}\n` +
      '    Classic/Rustic are read-only. If this is a minimal compile fix, ' +
      'regenerate the allowlist with engine-freeze-gate.mjs --write in the same ' +
      'change and document the reason.',
  );
}
for (const d of deleted) {
  console.log(
    `  DELETED frozen-engine file ${d.path}\n` +
      '    Deleting a frozen-engine file is also a change; regenerate the ' +
      'allowlist with --write only if the deletion is intentional and documented.',
  );
}

if (MODE === 'check' && (violations.length > 0 || deleted.length > 0)) {
  console.error('engine-freeze-gate: FAIL');
  process.exit(1);
}

console.log('engine-freeze-gate: OK');
