#!/usr/bin/env node
// typecheck:tests error-count ratchet (GAT-03).
//
// Test files are excluded from every production tsconfig, so they were never
// type-checked: a spec can import a symbol that does not exist and stay green.
// tsconfig.tests.json now type-checks them, but the standing debt is large
// (hundreds of pre-existing errors that predate this wave and live in files this
// change does not own). A hard `tsc` gate would block the wave on unrelated
// debt, so this ratchet enforces a DECREASE-ONLY ceiling instead: the count may
// never rise above the baseline. It bites immediately (any NEW test type error
// fails CI) without demanding the whole backlog be fixed first.
//
// Same shape as engine-token-audit: --check fails when the count exceeds the
// baseline; at-or-below passes. --write re-baselines to the current count after
// a reviewed change (e.g. once a wave's test edits settle, or after fixing a
// batch of errors to tighten the ceiling).
//
// Usage (run from the package dir; each package points at its own baseline):
//   node scripts/typecheck-tests-ratchet.mjs --project tsconfig.tests.json --baseline tsconfig.tests.baseline.json
//   node scripts/typecheck-tests-ratchet.mjs --project tsconfig.tests.json --baseline tsconfig.tests.baseline.json --write

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const cwd = resolve(arg('cwd', process.cwd()));
const project = resolve(cwd, arg('project', 'tsconfig.tests.json'));
const baselinePath = resolve(cwd, arg('baseline', 'tsconfig.tests.baseline.json'));
const write = process.argv.includes('--write');
const label = arg('label', project);

if (!existsSync(project)) {
  console.error(`typecheck-tests: project not found: ${project}`);
  process.exit(1);
}

const require = createRequire(resolve(cwd, 'package.json'));
let tscBin;
try {
  tscBin = require.resolve('typescript/bin/tsc');
  // The gate number is only meaningful WITH its compiler: `npx tsc` can
  // resolve a different TypeScript than the workspace pin (6.x vs 5.9.x
  // measured 440 vs 403 on the same tree), and a number quoted without its
  // compiler once cost this program a phantom "regression".
  const tsVersion = require(require.resolve('typescript/package.json')).version;
  console.log(`typecheck-tests: ${label}: compiler typescript@${tsVersion} (${tscBin})`);
} catch {
  console.error('typecheck-tests: cannot resolve the typescript compiler from', cwd);
  process.exit(1);
}

const run = spawnSync(process.execPath, [tscBin, '--noEmit', '-p', project], {
  cwd,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const output = `${run.stdout || ''}${run.stderr || ''}`;
// One `: error TSxxxx` per diagnostic; multi-line elaborations do not repeat it.
const count = (output.match(/: error TS\d+/g) || []).length;

if (run.status !== 0 && count === 0) {
  // tsc failed for a reason other than type errors (bad config, OOM, ...).
  console.error(`typecheck-tests: ${label}: tsc exited ${run.status} with no parseable diagnostics`);
  console.error(output.slice(0, 4000));
  process.exit(1);
}

const topClasses = Object.entries(
  (output.match(/error TS\d+/g) || []).reduce((acc, code) => {
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {}),
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([code, n]) => `${code}=${n}`)
  .join(' ');

if (write) {
  writeFileSync(
    baselinePath,
    `${JSON.stringify(
      {
        note: 'Decrease-only ceiling for typecheck:tests error count. Regenerate with --write only after reviewing the change. Never raise this to green a new test type error; fix the error instead.',
        errors: count,
        topErrorClasses: topClasses,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`typecheck-tests: ${label}: baseline written at ${count} (${topClasses})`);
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error(`typecheck-tests: ${label}: no baseline at ${baselinePath}. Seed it with --write after review.`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const ceiling = Number(baseline.errors);
if (!Number.isFinite(ceiling)) {
  console.error(`typecheck-tests: ${label}: baseline has no numeric "errors" field`);
  process.exit(1);
}

if (count > ceiling) {
  console.error(`typecheck-tests: ${label}: REGRESSED — ${count} errors > baseline ${ceiling}. New test type errors were introduced (${topClasses}). Fix them; do not raise the baseline.`);
  process.exit(1);
}

if (count < ceiling) {
  console.log(`typecheck-tests: ${label}: OK — ${count} errors (baseline ${ceiling}). Improvement — tighten with --write.`);
} else {
  console.log(`typecheck-tests: ${label}: OK — ${count} errors at baseline ${ceiling} (${topClasses}).`);
}
process.exit(0);
