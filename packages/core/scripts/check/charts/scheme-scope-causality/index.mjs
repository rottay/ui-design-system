#!/usr/bin/env node
/**
 * chart-scheme-scope-causality — the requested scheme IS the stamped scope.
 *
 * ============ STILL RED, BUT NO LONGER FOR THE REASON IT LANDED ============
 * It landed NON-BLOCKING and absent from the CI gate manifest with 11 of 55
 * scopes agreeing, deferred "until lot 1". Lot 1 -- the owner's Q1 de-alias --
 * has landed, and the deferral is discharged: `default` now resolves its own
 * governed table, so BOTH paint classes measure zero. `paint-from-another-
 * table` went 9 -> 0 because the alias is gone; `paint-outside-the-chain` went
 * 6 -> 0 because the probe learned the second governed route -- the class-
 * painted families reach the chain through the scope-keyed
 * `--ds-chart-paint-N` skin bridge, which the inline-only reader could not see
 * and reported as ungoverned. That was an instrument blindness, never a tree
 * defect, and the bridge keeps its own failure modes.
 *
 * What remains is ONE class and a different defect: 20 of 55 rows are
 * `scope-ignores-request`. Five families -- funnel-chart, gantt-chart,
 * network-graph, sankey and scatter -- never carry `colorScheme` to the root,
 * so they stamp `default` for all five requests and four of every five
 * requests paint the wrong table. That is prop plumbing in those five
 * families, not palette governance, and it is not this lot's write set. The
 * instrument therefore stays NON-BLOCKING with a named owner rather than a
 * deferral; the lot that plumbs those five flips it to blocking and green.
 * ===========================================================================
 *
 * The law, in one line: for every categorical family and every scheme,
 * `root[data-chart-color-scheme]` equals `resolveChartPaint(...).scheme`, and
 * the first governed paint expression the marks carry is that scheme's slot 1.
 *
 * TWO HALVES, DELIBERATELY SEPARATED. The probe under `probe/` renders and
 * writes a census; it asserts nothing about agreement. This file adjudicates
 * the census. If the probe asserted, a red run would be ambiguous between "the
 * tree diverges" and "the probe broke"; split, a red probe means only the
 * second, and the first is this file's verdict.
 *
 * Usage:
 *   node scripts/check/charts/scheme-scope-causality/index.mjs              # measure + report
 *   node scripts/check/charts/scheme-scope-causality/index.mjs --check      # exit 1 on divergence
 *   node scripts/check/charts/scheme-scope-causality/index.mjs --census=P   # adjudicate a census
 *   node scripts/check/charts/scheme-scope-causality/index.mjs --json
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = findPackageRoot(here);

export const PROBE_CONFIG = 'scripts/check/charts/scheme-scope-causality/probe/index.mjs';

export const DIVERGENCES = Object.freeze({
  UNRENDERED: 'unrendered',
  SCOPE: 'scope-ignores-request',
  PAINT_UNGOVERNED: 'paint-outside-the-chain',
  PAINT_WRONG_TABLE: 'paint-from-another-table',
});

/**
 * Classify one census row. A row can carry at most one divergence: the scope
 * is checked first because a scope that ignored the request explains the paint.
 */
export function classify(row) {
  if (!row.rendered) return DIVERGENCES.UNRENDERED;
  if (row.stampedScheme !== row.expectedScheme) return DIVERGENCES.SCOPE;
  if (row.governedPaint === null) return DIVERGENCES.PAINT_UNGOVERNED;
  if (row.governedPaint !== row.expectedPaint) return DIVERGENCES.PAINT_WRONG_TABLE;
  return null;
}

export function adjudicate(census) {
  const rows = census.rows ?? [];
  const divergences = [];
  const byKind = {};
  for (const row of rows) {
    const kind = classify(row);
    if (!kind) continue;
    byKind[kind] = (byKind[kind] ?? 0) + 1;
    divergences.push({ kind, ...row });
  }
  return {
    total: rows.length,
    agreeing: rows.length - divergences.length,
    byKind,
    divergences,
  };
}

/** Run the probe and read back the census it writes. */
export function measure({ cwd = root } = {}) {
  const censusPath = join(mkdtempSync(join(tmpdir(), 'chart-causality-')), 'census.json');
  const result = spawnSync(
    'npx',
    ['vitest', 'run', '--config', PROBE_CONFIG],
    {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, CHART_CAUSALITY_CENSUS: censusPath },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `chart-scheme-scope-causality: the probe itself failed (exit ${result.status}).\n`
        + `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
    );
  }
  return JSON.parse(readFileSync(censusPath, 'utf8'));
}

function readCensusArgument() {
  const argument = process.argv.find((value) => value.startsWith('--census='));
  return argument ? argument.slice('--census='.length) : null;
}

function main() {
  const check = process.argv.includes('--check');
  const asJson = process.argv.includes('--json');
  const censusArgument = readCensusArgument();

  const census = censusArgument
    ? JSON.parse(readFileSync(censusArgument, 'utf8'))
    : measure();
  const report = adjudicate(census);

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    if (check && report.divergences.length > 0) process.exit(1);
    return;
  }

  console.log('chart-scheme-scope-causality  [NON-BLOCKING: 5 families do not plumb colorScheme]');
  console.log(`  rows measured: ${report.total}`);
  console.log(`  agreeing:      ${report.agreeing}`);
  for (const [kind, count] of Object.entries(report.byKind)) {
    console.log(`  ${kind}: ${count}`);
  }
  for (const divergence of report.divergences) {
    console.log(
      `  ${divergence.kind.toUpperCase()} ${divergence.family} @ ${divergence.requested}`
        + `  stamped=${divergence.stampedScheme ?? 'none'}`
        + `  via=${divergence.paintRoute ?? 'none'}`
        + `  paint=${divergence.governedPaint ?? divergence.anyPaint ?? 'none'}`,
    );
  }

  if (report.divergences.length > 0) {
    console.log('\n  The family must resolve once and publish; the renderer must stamp');
    console.log('  decision.rootAttributes rather than re-resolving from tokens.');
    if (check) process.exit(1);
    return;
  }
  console.log('  PASS (every scope is the scheme its family resolved)');
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
