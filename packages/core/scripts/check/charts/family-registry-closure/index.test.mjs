/**
 * Drill for chart-family-registry-closure.
 *
 * P4 from the acceptance table is a nineteenth `families/` folder with no
 * registry row; it is planted here against a synthetic tree so the drill needs
 * no mutation of the real one. The reverse plant -- a removed row -- and the
 * arm dispositions are pinned beside it, because a gate whose OWED arm could
 * silently become blocking, or whose SKIPPED arm could look like a pass, is
 * not measuring what its output claims.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  DISPOSITIONS,
  PATHS,
  readExportedNames,
  readFamiliesBarrel,
  readRegistry,
  readShowroomSlugs,
  runGate,
  verdict,
} from './index.mjs';

/* ------------------------------------------------------------------ */
/* Readers                                                             */
/* ------------------------------------------------------------------ */

test('the registry reader peels Object.freeze and reads id plus namespace', () => {
  const rows = readRegistry(`
    export const CHART_FAMILY_REGISTRY = Object.freeze({
      'bar-chart': row('bar-chart', 'ds-chart-bar', 'categorical', 2, true, 'engine', 'scaffold'),
      gauge: row('gauge', 'ds-chart-gauge', 'semantic', null, false, 'engine', 'scaffold'),
    });
  `);
  assert.deepEqual(Object.keys(rows).sort(), ['bar-chart', 'gauge']);
  assert.equal(rows['bar-chart'].namespace, 'ds-chart-bar');
});

test('the barrel reader binds a folder to its component symbol and skips types', () => {
  const byId = readFamiliesBarrel(`
    export { AreaChart } from './area-chart';
    export type { AreaChartProps } from './area-chart';
    export { BarChart } from './bar-chart';
  `);
  assert.deepEqual(byId['area-chart'], ['AreaChart']);
  assert.deepEqual(byId['bar-chart'], ['BarChart']);
});

test('the exported-name reader ignores type-only exports', () => {
  const names = readExportedNames(
    "export { A, B } from './x'; export type { C } from './x';",
    'x.ts',
  );
  assert.deepEqual([...names].sort(), ['A', 'B']);
});

test('the showroom reader takes chart entries and not the family groups', () => {
  const slugs = readShowroomSlugs(`
    const basic = [{ slug: 'bar-chart', name: 'BarChart', family: 'basic', description: 'd' }];
    export const chartFamilies = [{ slug: 'basic', label: 'Basic' }];
  `);
  assert.deepEqual([...slugs], ['bar-chart']);
});

/* ------------------------------------------------------------------ */
/* Plants, against a synthetic tree                                    */
/* ------------------------------------------------------------------ */

/**
 * A two-family tree with every input the gate reads. Small enough that a plant
 * is legible and complete enough that every enforced arm actually runs.
 */
function buildTree({ extraFolder = null, dropRow = null } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'chart-closure-'));
  const write = (relative, contents) => {
    const target = join(dir, relative);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, contents);
    return target;
  };

  const families = ['bar-chart', 'gauge'].filter((id) => id !== dropRow);
  const rows = families
    .map((id) => {
      const namespace = id === 'bar-chart' ? 'ds-chart-bar' : 'ds-chart-gauge';
      return `  '${id}': row('${id}', '${namespace}', 'categorical', null, true, 'engine', 'scaffold'),`;
    })
    .join('\n');

  const registry = write(
    'registry.ts',
    `export const CHART_FAMILY_REGISTRY = Object.freeze({\n${rows}\n});\n`,
  );

  for (const id of ['bar-chart', 'gauge', ...(extraFolder ? [extraFolder] : [])]) {
    write(`families/${id}/index.tsx`, '// family\n');
  }
  const familiesBarrel = write(
    'families/index.ts',
    "export { BarChart } from './bar-chart';\nexport { GaugeChart } from './gauge';\n",
  );
  const chartsBarrel = write(
    'charts.ts',
    "export { BarChart, GaugeChart } from './families';\n",
  );
  const publicFacade = write(
    'facade.ts',
    "export { BarChart, GaugeChart } from '../families';\n",
  );
  write('skin/chart-bar/index.css', '.ds-chart-bar { color: red; }\n');
  write('skin/chart-gauge/index.css', '.ds-chart-gauge { color: red; }\n');
  const showroomRegistry = write(
    'showroom.ts',
    "const basic = [{ slug: 'bar-chart', name: 'BarChart', family: 'basic', description: 'd' },"
      + " { slug: 'gauge', name: 'GaugeChart', family: 'statistical', description: 'd' }];\n",
  );
  const familyCutBaseline = write(
    'family-cut.json',
    JSON.stringify({ families: { button: {}, 'bar-chart': {} } }),
  );

  return {
    registry,
    familiesDir: join(dir, 'families'),
    familiesBarrel,
    chartsBarrel,
    publicFacade,
    skinDir: join(dir, 'skin'),
    showroomRegistry,
    familyCutBaseline,
  };
}

function armOf(arms, name) {
  const arm = arms.find((candidate) => candidate.name === name);
  assert.ok(arm, `no arm named ${name}`);
  return arm;
}

test('the synthetic tree is clean, so every plant below is the only difference', () => {
  const { arms } = runGate(buildTree());
  const dirty = arms.filter(
    (arm) => arm.disposition === DISPOSITIONS.ENFORCED && arm.findings.length > 0,
  );
  assert.deepEqual(dirty.map((arm) => [arm.name, arm.findings]), []);
  assert.equal(verdict(arms).ok, true);
});

test('P4: a nineteenth folder with no registry row reddens families-folder', () => {
  const { arms } = runGate(buildTree({ extraFolder: 'sunburst' }));
  const arm = armOf(arms, 'families-folder');
  assert.deepEqual(arm.findings, ['folder "sunburst" has no registry row']);
  assert.equal(verdict(arms).ok, false);
});

test('a removed row reddens the folder, barrel, facade and showroom arms together', () => {
  const { arms } = runGate(buildTree({ dropRow: 'gauge' }));
  assert.equal(armOf(arms, 'families-folder').findings.length, 1);
  assert.equal(armOf(arms, 'families-barrel').findings.length, 1);
  assert.equal(armOf(arms, 'public-facade').findings.length, 1);
  assert.equal(armOf(arms, 'showroom-registry').findings.length, 1);
  assert.equal(verdict(arms).ok, false);
});

test('a missing showroom package is SKIPPED loudly, never a silent pass', () => {
  const paths = buildTree();
  const { arms } = runGate({ ...paths, showroomRegistry: join(paths.skinDir, 'absent.ts') });
  const arm = armOf(arms, 'showroom-registry');
  assert.equal(arm.disposition, DISPOSITIONS.SKIPPED);
  assert.match(arm.detail, /not in this checkout/u);
  assert.equal(typeof arm.reason, 'string');
  // A skipped arm never blocks, and never claims to have measured anything.
  assert.equal(verdict(arms).ok, true);
});

test('the OWED roster arm reports its divergence without blocking', () => {
  const { arms } = runGate(buildTree());
  const arm = armOf(arms, 'family-cut-roster');
  assert.equal(arm.disposition, DISPOSITIONS.OWED);
  assert.deepEqual(arm.findings, ['row "gauge" is absent from the family-cut roster']);
  assert.match(arm.reason, /WO-FAM-14/u);
  assert.equal(verdict(arms).ok, true);
});

/* ------------------------------------------------------------------ */
/* Integration                                                         */
/* ------------------------------------------------------------------ */

test('the real tree closes on every enforced arm', () => {
  const { rows, symbols, arms } = runGate(PATHS);
  assert.equal(Object.keys(rows).length, 18);
  assert.equal(symbols.length, 18);
  const { blocking, ok } = verdict(arms);
  assert.deepEqual(blocking.map((arm) => [arm.name, arm.findings]), []);
  assert.equal(ok, true);
});

test('the real tree measures the roster gap the WO owes, all eighteen rows', () => {
  const { arms } = runGate(PATHS);
  const arm = armOf(arms, 'family-cut-roster');
  assert.equal(arm.disposition, DISPOSITIONS.OWED);
  assert.equal(arm.findings.length, 18, 'a chart row entered the roster without re-pinning this');
});

test('every enforced arm is actually measured on the real tree', () => {
  const { arms } = runGate(PATHS);
  const enforced = arms.filter((arm) => arm.disposition === DISPOSITIONS.ENFORCED);
  assert.deepEqual(
    enforced.map((arm) => arm.name),
    [
      'families-folder',
      'families-barrel',
      'charts-barrel',
      'public-facade',
      'skin-namespace',
      'showroom-registry',
    ],
  );
});
