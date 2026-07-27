import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);

const ROLE_SUBPATH = '@rottay/design-system/icons/roles/action-add';
const PRESET_SUBPATH = '@rottay/design-system/icons/presets/bithire';
const FULL_SUBPATH = '@rottay/design-system/icons/full';
const BRAND_SUBPATH = '@rottay/design-system/marks/brand';
const CLOUD_SUBPATH = '@rottay/design-system/marks/cloud';

test('generated role wildcard resolves to one exact public component in ESM and CJS', async () => {
  const esm = await import(ROLE_SUBPATH);
  const cjs = require(ROLE_SUBPATH);
  assert.deepEqual(Object.keys(esm).sort(), ['ActionAddIcon']);
  assert.deepEqual(Object.keys(cjs).sort(), ['ActionAddIcon']);
});

test('BitHire preset is bounded to its exact 104-role application inventory', async () => {
  const esm = await import(PRESET_SUBPATH);
  const cjs = require(PRESET_SUBPATH);
  assert.equal(esm.BITHIRE_PRESET_ICON_NAMES.length, 104);
  assert.equal(cjs.BITHIRE_PRESET_ICON_NAMES.length, 104);
  assert.deepEqual(esm.BITHIRE_PRESET_ICON_NAMES, cjs.BITHIRE_PRESET_ICON_NAMES);
  assert.equal(new Set(esm.BITHIRE_PRESET_ICON_NAMES).size, 104);
  assert.equal(typeof esm.BitHireIconPreset, 'object');
  assert.equal(typeof cjs.BitHireIconPreset, 'object');
});

test('explicit full compatibility keeps the complete role inventory in ESM and CJS', async () => {
  const esm = await import(FULL_SUBPATH);
  const cjs = require(FULL_SUBPATH);
  assert.equal(esm.ICON_NAMES.length, 282);
  assert.equal(cjs.ICON_NAMES.length, 282);
  assert.deepEqual(esm.ICON_NAMES, cjs.ICON_NAMES);
  assert.equal(typeof esm.Icon, 'object');
  assert.equal(typeof cjs.Icon, 'object');
});

test('brand and cloud public entrypoints remain asset-class isolated', async () => {
  const brandEsm = await import(BRAND_SUBPATH);
  const brandCjs = require(BRAND_SUBPATH);
  const cloudEsm = await import(CLOUD_SUBPATH);
  const cloudCjs = require(CLOUD_SUBPATH);

  assert.equal(typeof brandEsm.BrandMark, 'object');
  assert.equal(typeof brandCjs.BrandMark, 'object');
  assert.ok(!Object.hasOwn(brandEsm, 'CloudServiceMark'));
  assert.ok(!Object.hasOwn(brandCjs, 'CloudServiceMark'));

  assert.equal(typeof cloudEsm.CloudServiceMark, 'object');
  assert.equal(typeof cloudCjs.CloudServiceMark, 'object');
  assert.ok(!Object.hasOwn(cloudEsm, 'BrandMark'));
  assert.ok(!Object.hasOwn(cloudCjs, 'BrandMark'));
});
