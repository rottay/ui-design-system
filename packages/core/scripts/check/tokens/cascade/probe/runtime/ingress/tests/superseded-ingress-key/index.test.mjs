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

import { readManifestRecords } from '../../../../../../../../libraries/manifest/index.mjs';
import { CORE_ROOT } from '../../../../foundation/paths/index.mjs';
import { buildIngressInput, INGRESS_ARMS } from '../../index.mjs';

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
      'window is closed, so delete supersededIngressKey, its `??` arms and the normalization ' +
      'fallback, then this test with them.',
  );
});
