import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  certifyCustomizationManifest,
  validateCustomizationManifest,
} from './generator.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = join(HERE, '../../../../../../..');
const INDEX = JSON.parse(readFileSync(join(HERE, 'index.json'), 'utf8'));

test('the segmented manifest is structurally complete without treating UNKNOWN as progress', () => {
  assert.deepEqual(validateCustomizationManifest(), []);
  assert.equal(INDEX.denominators.canonicalFamilies, 252);
  assert.equal(INDEX.denominators.activeStandardControls, 13);
  assert.equal(INDEX.denominators.activeProCapabilities, 7);
  assert.equal(INDEX.denominators.controlFamilyCells, 5040);
  assert.equal(INDEX.rollups.controlFamilyDispositions.UNKNOWN, 5040);
  assert.equal(INDEX.rollups.familyReviews.accepted, 0);
  assert.equal(INDEX.rollups.skeletonsCountAsProgress, false);
});

test('frontier, internal and proposed controls never create R0-R6 family cells', () => {
  assert.deepEqual(
    INDEX.excludedRegistryRows.map((entry) => entry.controlId).sort(),
    ['palette.dark-mode', 'palette.status-seeds'],
  );
  const dataTable = JSON.parse(
    readFileSync(join(HERE, 'families/pattern/data/pattern-data-table.json'), 'utf8'),
  );
  assert.equal(dataTable.themeControls.length, 20);
  assert.equal(dataTable.themeControls.some((cell) => cell.controlId === 'surface.edge'), false);
  assert.equal(dataTable.themeControls.some((cell) => cell.controlId === 'motion.character'), false);
});

test('controls and recipe groups do not duplicate reverse family edges', () => {
  for (const entry of [...INDEX.controls, ...INDEX.groups]) {
    const value = JSON.parse(readFileSync(join(HERE, '..', entry.path), 'utf8'));
    assert.equal(Object.hasOwn(value, 'families'), false);
    assert.equal(Object.hasOwn(value, 'familyIds'), false);
  }
});

test('family identity does not promote category-wide export candidates into family API truth', () => {
  const table = JSON.parse(
    readFileSync(join(HERE, 'families/pattern/data/pattern-data-table.json'), 'utf8'),
  );
  assert.deepEqual(table.identity.publicComponents, ['PatternDataTable']);
  assert.equal(Object.hasOwn(table.identity, 'publicExports'), false);
  assert.equal(
    table.identity.publicApiCompleteness,
    'COMPONENT_SYMBOLS_ONLY_REQUIRES_FAMILY_EXPORT_CENSUS',
  );
});

test('certification fails closed while cells or family reviews remain unknown', () => {
  const errors = certifyCustomizationManifest();
  assert.ok(errors.some((error) => error.includes('UNKNOWN=0')));
  assert.ok(errors.some((error) => error.includes('252 unreviewed')));
});

test('bootstrap refuses to overwrite the existing manifest', () => {
  const result = spawnSync(
    process.execPath,
    ['packages/core/scripts/quality-evidence/programs/modern-rescue/manifest/generator.mjs', '--bootstrap'],
    { cwd: REPOSITORY_ROOT, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /bootstrap requires an absent manifest/);
});
