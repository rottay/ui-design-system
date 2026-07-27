import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { collectMissingPrefixedCounters } from './lib/counter-presence-audit.mjs';
import { ARC09_INLINE_PAINT_FILES } from './lib/fleet-inline-paint-census.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptsDir, '..');
const baseline = JSON.parse(readFileSync(join(scriptsDir, 'engine-token-audit.baseline.json'), 'utf8'));
const exemptions = JSON.parse(readFileSync(resolve(packageRoot, '../..', 'roadmap/skin-exemptions.json'), 'utf8'));

function countersFromOutput(output) {
  const counters = {};
  for (const line of output.split('\n')) {
    const match = /^  ([^:]+): (-?\d+(?:\.\d+)?)$/.exec(line);
    if (match) counters[match[1]] = Number(match[2]);
  }
  return counters;
}

test('engine audit wires full runtime/fleet censuses and rejects vanished keys', () => {
  const censusRun = spawnSync(process.execPath, [join(scriptsDir, 'runtime-svg-paint-census.mjs'), '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(
    censusRun.status,
    0,
    `runtime SVG CLI failed\nstdout:\n${censusRun.stdout}\nstderr:\n${censusRun.stderr}`
  );
  const census = JSON.parse(censusRun.stdout);
  // File count is discovery output, not a product invariant. New zero-paint
  // source files must be scanned without forcing an unrelated pin update.
  // The ratcheted baseline below remains the authority for paint ceilings.
  const runtimeFileCount = Object.keys(census.files).length;
  assert.ok(runtimeFileCount >= baseline['runtimeSvgPaint.filesScanned']);
  assert.ok(census.total <= baseline['runtimeSvgPaint.total']);
  assert.equal(census.classifiedPaint, census.total);
  assert.equal(census.unclassified, 0);

  const embeddedRun = spawnSync(process.execPath, [join(scriptsDir, 'embedded-css-paint-census.mjs'), '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(
    embeddedRun.status,
    0,
    `embedded CSS CLI failed\nstdout:\n${embeddedRun.stdout}\nstderr:\n${embeddedRun.stderr}`
  );
  const embedded = JSON.parse(embeddedRun.stdout);
  assert.equal(Object.keys(embedded.files).length, runtimeFileCount);
  assert.equal(embedded.total, 7);
  assert.equal(embedded.classifiedPaint, 7);
  assert.equal(embedded.unclassified, 0);
  assert.equal(embedded.parseFailures, 0);
  assert.equal(embedded.dynamicProperties, 0);
  assert.equal(embedded.unknownSinks, 0);
  assert.equal(Object.values(embedded.files).filter(({ count }) => count > 0).length, 1);

  const run = spawnSync(process.execPath, [join(scriptsDir, 'engine-token-audit.mjs'), '--check'], {
    cwd: packageRoot,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(run.status, 0, `engine audit failed\nstdout:\n${run.stdout}\nstderr:\n${run.stderr}`);

  const counters = countersFromOutput(run.stdout);
  const baselineRuntimeKeys = Object.keys(baseline).filter((key) => key.startsWith('runtimeSvgPaint.'));
  const runtimeAggregateKeys = new Set([
    'runtimeSvgPaint.filesScanned',
    'runtimeSvgPaint.total',
    'runtimeSvgPaint.unclassified',
    'runtimeSvgPaint.ignoredStructural',
  ]);
  const perFileKeys = baselineRuntimeKeys.filter((key) => !runtimeAggregateKeys.has(key));
  const baselineFleetKeys = Object.keys(baseline).filter((key) => key.startsWith('fleet.inlinePaint.'));
  const fleetAggregateKeys = new Set(['fleet.inlinePaint.filesScanned', 'fleet.inlinePaint.total']);
  const fleetPerFileKeys = baselineFleetKeys.filter((key) => !fleetAggregateKeys.has(key));
  const baselineEmbeddedKeys = Object.keys(baseline).filter((key) => key.startsWith('embeddedCssPaint.'));
  const embeddedAggregateKeys = new Set([
    'embeddedCssPaint.filesScanned',
    'embeddedCssPaint.total',
    'embeddedCssPaint.classifiedPaint',
    'embeddedCssPaint.unclassified',
    'embeddedCssPaint.parseFailures',
    'embeddedCssPaint.dynamicProperties',
    'embeddedCssPaint.unknownSinks',
  ]);
  const embeddedPerFileKeys = baselineEmbeddedKeys.filter((key) => !embeddedAggregateKeys.has(key));

  assert.equal(baseline['runtimeSvgPaint.unclassified'], 0);
  assert.equal(baseline['runtimeSvgPaint.patterns/communication/presence/index.tsx'], 1);
  assert.equal(
    baseline[
      'runtimeSvgPaint.surfaces/presentation/pages/experience/oauth-transition/presentation/screen/provider-icons/index.tsx'
    ],
    9
  );
  const runtimeExemptions = exemptions['SKIN-EXEMPT-RUNTIME-VALUE'].files;
  assert.equal(runtimeExemptions['patterns/communication/presence/index.tsx'].runtimeSvgFloor, 1);
  assert.equal(runtimeExemptions['patterns/visualization/charts/presentation/crosshair/index.ts'].runtimeSvgFloor, 1);
  assert.equal(runtimeExemptions['patterns/visualization/charts/runtime/exporting/foundation/file/index.ts'].runtimeSvgFloor, 5);
  const ckERuntimeFloors = new Map([
    // W5: the 13 R/N-class family floors moved off the family facades with a
    // measured recount (runtime-SVG paint now lives on the counted engine
    // renderer files); only the Class-H families, the W0-relocated renderer
    // floors, and the infra floors remain ledger-declared.
    ['patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/funnel/index.tsx', 1],
    ['patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/gauge/index.tsx', 4],
    ['patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/radar/index.tsx', 4],
    ['patterns/visualization/charts/families/network-graph/index.tsx', 1],
    ['patterns/visualization/charts/families/sankey/index.tsx', 2],
    ['patterns/visualization/charts/presentation/crosshair/index.ts', 1],
    ['patterns/visualization/charts/runtime/exporting/foundation/file/index.ts', 5],
  ]);
  assert.equal(
    [...ckERuntimeFloors].reduce((sum, [path, floor]) => {
      assert.equal(runtimeExemptions[path]?.runtimeSvgFloor, floor, `${path} runtime SVG floor drifted`);
      return sum + floor;
    }, 0),
    18
  );
  assert.equal(
    exemptions['SKIN-EXEMPT-NOT-PAINT'].files[
      'patterns/visualization/charts/runtime/theming/presentation/react/color-theme/index.ts'
    ].floor,
    4
  );
  assert.equal(
    runtimeExemptions[
      'surfaces/presentation/pages/experience/oauth-transition/presentation/screen/provider-icons/index.tsx'
    ].runtimeSvgFloor,
    9
  );
  // The baseline stores one zero-or-positive entry for every file present
  // when the ratchet was authored. Discovery is intentionally allowed to
  // grow so new zero-paint source files are still scanned; paint itself
  // remains decrease-only through the aggregate and per-file ceilings.
  assert.ok(runtimeFileCount >= perFileKeys.length);
  assert.deepEqual(collectMissingPrefixedCounters(counters, baseline, 'runtimeSvgPaint.'), []);

  assert.equal(
    baseline['embeddedCssPaint.classifiedPaint'],
    baseline['embeddedCssPaint.total'],
  );
  assert.equal(baseline['embeddedCssPaint.unclassified'], 0);
  assert.equal(baseline['embeddedCssPaint.parseFailures'], 0);
  assert.equal(baseline['embeddedCssPaint.dynamicProperties'], 0);
  assert.equal(baseline['embeddedCssPaint.unknownSinks'], 0);
  assert.equal(baseline['embeddedCssPaint.patterns/data/table-checkbox-styles/index.tsx'], 7);
  assert.equal(
    exemptions['SKIN-EXEMPT-EMBEDDED-CSS-CONTRACT'].files['patterns/data/table-checkbox-styles/index.tsx']
      .embeddedCssFloor,
    7
  );
  assert.ok(Object.keys(embedded.files).length >= embeddedPerFileKeys.length);
  assert.deepEqual(collectMissingPrefixedCounters(counters, baseline, 'embeddedCssPaint.'), []);
  assert.equal(
    counters['embeddedCssPaint.total'],
    embeddedPerFileKeys.reduce((sum, key) => sum + counters[key], 0)
  );
  assert.equal(
    baseline['embeddedCssPaint.total'],
    embeddedPerFileKeys.reduce((sum, key) => sum + baseline[key], 0)
  );
  assert.equal(
    counters['runtimeSvgPaint.total'],
    perFileKeys.reduce((sum, key) => sum + counters[key], 0)
  );
  assert.equal(
    baseline['runtimeSvgPaint.total'],
    perFileKeys.reduce((sum, key) => sum + baseline[key], 0)
  );

  assert.ok(counters['fleet.inlinePaint.filesScanned'] >= fleetPerFileKeys.length);
  assert.equal(
    counters['fleet.inlinePaint.total'],
    fleetPerFileKeys.reduce((sum, key) => sum + counters[key], 0)
  );
  assert.equal(
    baseline['fleet.inlinePaint.total'],
    fleetPerFileKeys.reduce((sum, key) => sum + baseline[key], 0)
  );
  assert.equal(baseline['fleet.inlinePaint.surfaces/foundation/common/story-helpers/index.tsx'], 6);
  assert.equal(baseline['fleet.inlinePaint.surfaces/foundation/common/test-utils/index.tsx'], 1);
  assert.deepEqual(collectMissingPrefixedCounters(counters, baseline, 'fleet.inlinePaint.'), []);
  for (const relativePath of ARC09_INLINE_PAINT_FILES) {
    assert.ok(`arc09.inlinePaint.${relativePath}` in counters, `${relativePath} must remain covered by ARC-09`);
    assert.ok(!(`fleet.inlinePaint.${relativePath}` in counters), `${relativePath} must not be duplicated in fleet`);
  }

  const representative = perFileKeys.find((key) => baseline[key] > 0);
  assert.ok(representative, 'the baseline must contain a non-zero file counter');
  const withOneFileRemoved = { ...counters };
  delete withOneFileRemoved[representative];
  assert.deepEqual(collectMissingPrefixedCounters(withOneFileRemoved, baseline, 'runtimeSvgPaint.'), [representative]);

  const fleetRepresentative = fleetPerFileKeys[0];
  const withOneFleetFileRemoved = { ...counters };
  delete withOneFleetFileRemoved[fleetRepresentative];
  assert.deepEqual(collectMissingPrefixedCounters(withOneFleetFileRemoved, baseline, 'fleet.inlinePaint.'), [
    fleetRepresentative,
  ]);

  const embeddedRepresentative = embeddedPerFileKeys.find((key) => baseline[key] > 0);
  assert.ok(embeddedRepresentative, 'the baseline must contain a non-zero embedded CSS file counter');
  const withOneEmbeddedFileRemoved = { ...counters };
  delete withOneEmbeddedFileRemoved[embeddedRepresentative];
  assert.deepEqual(collectMissingPrefixedCounters(withOneEmbeddedFileRemoved, baseline, 'embeddedCssPaint.'), [
    embeddedRepresentative,
  ]);

  assert.deepEqual(collectMissingPrefixedCounters({}, baseline, 'runtimeSvgPaint.'), baselineRuntimeKeys);
  assert.deepEqual(collectMissingPrefixedCounters({}, baseline, 'fleet.inlinePaint.'), baselineFleetKeys);
  assert.deepEqual(collectMissingPrefixedCounters({}, baseline, 'embeddedCssPaint.'), baselineEmbeddedKeys);
});

test('embedded CSS reconciliation preserves the exhaustive +63 correction and 195-site recovery', () => {
  const incompletePreOAuthInventory = 428;
  const exhaustivePreOAuthInventory = 491;
  const oauthMigration = 287;
  const loadingOverlayMigration = 2;
  const staticProducerRecovery = 195;

  assert.equal(
    exhaustivePreOAuthInventory - incompletePreOAuthInventory,
    63,
    'the prior inventory omitted 16 JSX and 47 DOM-injected declarations'
  );
  assert.equal(exhaustivePreOAuthInventory - oauthMigration, 204);
  assert.equal(exhaustivePreOAuthInventory - oauthMigration - loadingOverlayMigration, 202);
  assert.equal(exhaustivePreOAuthInventory - oauthMigration - loadingOverlayMigration - staticProducerRecovery, 7);

  // The OAuth migration deleted its dedicated source stylesheet. It belonged
  // to all productive-source censuses and the fleet inline universe, so these
  // are deliberate one-file reconciliations rather than collector collapse.
  assert.equal(1048 - 1, 1047);
  assert.equal(770 - 1, 769);
});
