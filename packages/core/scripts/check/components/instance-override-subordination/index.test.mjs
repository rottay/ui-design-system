/**
 * instance-override-subordination-gate drills.
 *
 * Each clause is planted separately, against the REAL sources, so the drill
 * fails the day a clause stops being checked rather than the day someone
 * notices. The live sources are asserted clean in the same run.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ADMISSION_FUNCTION, SOURCES, analyseSubordination } from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = findPackageRoot(HERE);
const GATE = join(HERE, 'index.mjs');

const live = () => ({
  contract: readFileSync(join(PACKAGE_ROOT, SOURCES.contract), 'utf8'),
  catalog: readFileSync(join(PACKAGE_ROOT, SOURCES.catalog), 'utf8'),
  merge: readFileSync(join(PACKAGE_ROOT, SOURCES.merge), 'utf8'),
});

test('the live sources satisfy all three clauses', () => {
  assert.deepEqual(analyseSubordination(live()), []);
});

test('DRILL completeness: a new override field with no domain and no channel is refused', () => {
  const sources = live();
  sources.contract = sources.contract.replace(
    'export interface SurfaceVisualOverrides {',
    'export interface SurfaceVisualOverrides {\n  plantedDial?: string;',
  );
  const findings = analyseSubordination(sources);
  const clauses = findings.filter((finding) => finding.clause === 'completeness');
  // Both halves fire: no admitted domain AND no tenant channel. A field that
  // was catalogued but unmapped would still let an app outrank the tenant.
  assert.equal(clauses.length, 2);
  assert.ok(clauses.every((finding) => finding.detail.startsWith('plantedDial:')));
});

test('DRILL no-surplus: a catalogued field the contract never declares is refused', () => {
  const sources = live();
  const marker = 'export const SURFACE_VISUAL_OVERRIDE_CATALOG';
  const open = sources.catalog.indexOf('Object.freeze({', sources.catalog.indexOf(marker));
  const cut = open + 'Object.freeze({'.length;
  sources.catalog = `${sources.catalog.slice(0, cut)}\n  plantedDial: { kind: 'enum', values: Object.freeze(['a']) },${sources.catalog.slice(cut)}`;
  const findings = analyseSubordination(sources);
  assert.ok(findings.some((finding) => finding.clause === 'no-surplus' && finding.detail.startsWith('plantedDial:')));
});

test('DRILL one-door: a raw selection read inside the merge is refused', () => {
  const sources = live();
  sources.merge = sources.merge.replace(
    'const density = admitted.density ?? base.density;',
    'const density = overrides.density ?? base.density;',
  );
  const findings = analyseSubordination(sources);
  assert.ok(findings.some((finding) => finding.clause === 'one-door'));
});

test('DRILL one-door: removing the admission call entirely is refused', () => {
  const sources = live();
  sources.merge = sources.merge.split(ADMISSION_FUNCTION).join('applyOverridesDirectly');
  const findings = analyseSubordination(sources);
  assert.ok(findings.some((finding) => finding.clause === 'one-door' && finding.detail.includes('unadjudicated')));
});

test('the gate CLI is green on the live tree and its --drill mode passes', () => {
  const check = spawnSync(process.execPath, [GATE], { encoding: 'utf8', cwd: PACKAGE_ROOT });
  assert.equal(check.status, 0, `${check.stdout}${check.stderr}`);
  const drill = spawnSync(process.execPath, [GATE, '--drill'], { encoding: 'utf8', cwd: PACKAGE_ROOT });
  assert.equal(drill.status, 0, `${drill.stdout}${drill.stderr}`);
  assert.match(drill.stdout, /DRILL OK/);
});
