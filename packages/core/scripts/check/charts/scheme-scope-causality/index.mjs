#!/usr/bin/env node
/**
 * chart-scheme-scope-causality — the requested scheme IS the stamped scope.
 *
 * ============ GREEN AND BLOCKING SINCE THE FAM-09 PLUMBING LOT =============
 * It landed NON-BLOCKING with 11 of 55 scopes agreeing, deferred "until
 * lot 1". Lot 1 -- the owner's Q1 de-alias -- discharged the deferral:
 * `default` resolves its own governed table, so BOTH paint classes measure
 * zero (`paint-from-another-table` 9 -> 0 with the alias gone;
 * `paint-outside-the-chain` 6 -> 0 when the probe learned the scope-keyed
 * `--ds-chart-paint-N` skin bridge -- an instrument blindness, never a tree
 * defect). `6feb6a315` plumbed funnel-chart and gantt-chart, and the FAM-09
 * plumbing lot gave network-graph, sankey and scatter the same governed
 * `colorScheme` input: the roster of `scope-ignores-request` families is
 * EMPTY by measurement, 55 of 55 rows agree, and the gate entered the CI
 * gate manifest as blocking. The pinned set below is now a REGRESSION ALARM:
 * a family that stops carrying `colorScheme` to its root joins the set and
 * names itself, and the 55/55 totals are the non-vacuity floor -- a probe
 * that stops rendering fails the floor, never reads as a repair.
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

/**
 * The families carrying `scope-ignores-request`, sorted. This is the open
 * defect's own roster, read from the census rather than written in prose, so
 * the banner cannot outlive the tree it describes.
 */
export function unplumbedFamilies(report) {
  const families = new Set(
    report.divergences
      .filter((divergence) => divergence.kind === DIVERGENCES.SCOPE)
      .map((divergence) => divergence.family),
  );
  return Object.freeze([...families].sort());
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

  const unplumbed = unplumbedFamilies(report);
  console.log(
    'chart-scheme-scope-causality  '
      + (unplumbed.length > 0
        ? `[NON-BLOCKING: ${unplumbed.length} families do not plumb colorScheme: ${unplumbed.join(', ')}]`
        : '[no family ignores its requested scheme]'),
  );
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
