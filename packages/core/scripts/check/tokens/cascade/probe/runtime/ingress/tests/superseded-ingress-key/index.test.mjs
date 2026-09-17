/**
 * @fileoverview The superseded static ingress key resolves exactly like the current one.
 *
 * Run: node --test scripts/check/tokens/cascade/probe/runtime/ingress/tests/superseded-ingress-key/index.test.mjs
 *
 * @module Tooling/ResolutionProbe/Runtime/Ingress/Tests/SupersededIngressKey
 */

import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';

import { activePublicControls } from '../../../../../../../../generate/tokens/manifest/generation/index.mjs';
import { readManifestRecords } from '../../../../../../../../libraries/manifest/index.mjs';
import { CORE_ROOT } from '../../../../foundation/paths/index.mjs';
import { buildIngressInput, INGRESS_ARMS, registryIngressPath } from '../../index.mjs';

const STATIC_ARM = 'static-brand-theme';
const SPEC = INGRESS_ARMS[STATIC_ARM];
const CONTROLS_DIR = resolve(CORE_ROOT, 'governance/manifest/controls');

const outcome = (controlManifest, stopId) => {
  try {
    return { ok: true, input: buildIngressInput({ armId: STATIC_ARM, controlManifest, stopId }) };
  } catch (error) {
    return { ok: false, message: error.message };
  }
};

const withOnlyKey = (manifest, key, path) => {
  const { [SPEC.manifestIngressKey]: _current, [SPEC.supersededIngressKey]: _old, ...rest } =
    manifest.ingress;
  return { ...manifest, ingress: { ...rest, [key]: path } };
};

test('the static arm names the current key and the superseded one', () => {
  assert.equal(SPEC.manifestIngressKey, 'staticThemePath');
  assert.equal(SPEC.supersededIngressKey, 'staticBrandThemePath');
});

test('the static arm also names both spellings of its REGISTRY key', () => {
  assert.equal(SPEC.registryKey, 'themePath');
  assert.equal(SPEC.supersededRegistryKey, 'brandThemePath');
});

test('a capability row on the superseded registry key resolves, and is flagged', () => {
  const current = registryIngressPath({ id: 'synthetic', themePath: 'surfaces.radiusScale' });
  const superseded = registryIngressPath({ id: 'synthetic', brandThemePath: 'surfaces.radiusScale' });
  assert.equal(superseded.path, current.path);
  assert.equal(current.superseded, false);
  assert.equal(current.key, SPEC.registryKey);
  // Accepted through the window, and never silently: the producer reports the flag.
  assert.equal(superseded.superseded, true);
  assert.equal(superseded.key, SPEC.supersededRegistryKey);
});

test('a capability row carrying the current key WINS over a stale superseded one', () => {
  const both = registryIngressPath({
    id: 'synthetic',
    themePath: 'surfaces.radiusScale',
    brandThemePath: 'surfaces.borderRadius',
  });
  assert.equal(both.path, 'surfaces.radiusScale');
  assert.equal(both.superseded, false);
});

test('a capability row carrying neither registry key declares no door', () => {
  const neither = registryIngressPath({ id: 'synthetic', documentPath: 'appearance.general.rhythm' });
  assert.equal(neither.path, undefined);
  assert.equal(neither.superseded, false);
  assert.equal(neither.key, SPEC.registryKey);
});

test('the committed capability registry declares its door under the CURRENT registry key', () => {
  const rows = activePublicControls();
  assert.ok(rows.length > 0, 'the registry produced no active public control');
  const missing = rows.filter((row) => registryIngressPath(row).path === undefined);
  assert.deepEqual(missing.map((row) => row.id), [], 'a capability row declares no static door');
  const stale = rows.filter((row) => registryIngressPath(row).superseded);
  assert.deepEqual(
    stale.map((row) => row.id),
    [],
    'a committed capability row still carries the superseded registry key; the rename is the ' +
      'whole point of the window, so the registry itself must never be the thing lagging',
  );
});

test('every committed static door lowers identically under the old and the new key', () => {
  let resolved = 0;
  for (const { document: manifest } of readManifestRecords(CONTROLS_DIR, 'controlId')) {
    const path =
      manifest?.ingress?.[SPEC.manifestIngressKey] ?? manifest?.ingress?.[SPEC.supersededIngressKey];
    if (typeof path !== 'string' || path.length === 0) continue;
    const oldShape = withOnlyKey(manifest, SPEC.supersededIngressKey, path);
    const newShape = withOnlyKey(manifest, SPEC.manifestIngressKey, path);
    for (const { id } of manifest.calibration?.normalizedStops ?? []) {
      const fromOld = outcome(oldShape, id);
      const fromNew = outcome(newShape, id);
      assert.deepEqual(fromOld, fromNew, `${manifest.controlId}/${id} diverges between the keys`);
      if (fromNew.ok) resolved += 1;
    }
  }
  assert.ok(resolved > 0, 'no committed stop resolved through the static door, so nothing was compared');
});

test('a manifest with neither key is refused under the current key name', () => {
  const result = outcome({ controlId: 'synthetic', ingress: {} }, 'any');
  assert.equal(result.ok, false);
  assert.match(result.message, /declares no staticThemePath/);
});

test('window trigger: the superseded key is still carried by a committed manifest', () => {
  const carriers = readManifestRecords(CONTROLS_DIR, 'controlId').filter(
    ({ document }) => typeof document?.ingress?.[SPEC.supersededIngressKey] === 'string',
  );
  assert.ok(
    carriers.length > 0,
    `no committed control manifest carries ${SPEC.supersededIngressKey} any more: the superseded ` +
      'window is closed. It is ONE window over both spellings of this door, so the same change ' +
      `deletes supersededIngressKey AND ${SPEC.supersededRegistryKey} from the arm, their reads in ` +
      '`readIngressKey`, the normalization fallback and the producer\'s window warning, then the ' +
      'registry-arm tests above and this test with them.',
  );
});
