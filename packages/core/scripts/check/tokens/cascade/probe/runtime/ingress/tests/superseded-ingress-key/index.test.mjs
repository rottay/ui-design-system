/**
 * @fileoverview The static ingress door is declared once, on the arm, and the
 * committed capability registry carries it under that exact key.
 *
 * The WO-DER-08 superseded window (`staticBrandThemePath` / `brandThemePath`)
 * is CLOSED: its trigger fired once no committed manifest carried the old
 * spelling, and the arm, the readers, the normalization fallback and the
 * producer's warning went with it.
 *
 * Run: node --test scripts/check/tokens/cascade/probe/runtime/ingress/tests/superseded-ingress-key/index.test.mjs
 *
 * @module Tooling/ResolutionProbe/Runtime/Ingress/Tests/SupersededIngressKey
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { activePublicControls } from '../../../../../../../../generate/tokens/manifest/generation/index.mjs';
import { buildIngressInput, INGRESS_ARMS, registryIngressPath } from '../../index.mjs';

const STATIC_ARM = 'static-brand-theme';
const SPEC = INGRESS_ARMS[STATIC_ARM];

const outcome = (controlManifest, stopId) => {
  try {
    return { ok: true, input: buildIngressInput({ armId: STATIC_ARM, controlManifest, stopId }) };
  } catch (error) {
    return { ok: false, message: error.message };
  }
};

test('the static arm names one manifest key and one registry key', () => {
  assert.equal(SPEC.manifestIngressKey, 'staticThemePath');
  assert.equal(SPEC.registryKey, 'themePath');
  assert.equal(SPEC.supersededIngressKey, undefined);
  assert.equal(SPEC.supersededRegistryKey, undefined);
});

test('a capability row carrying the registry key declares that door', () => {
  const current = registryIngressPath({ id: 'synthetic', themePath: 'surfaces.radiusScale' });
  assert.equal(current.path, 'surfaces.radiusScale');
  assert.equal(current.key, SPEC.registryKey);
});

test('a capability row on the retired registry key declares NO door', () => {
  const retired = registryIngressPath({ id: 'synthetic', brandThemePath: 'surfaces.radiusScale' });
  assert.equal(retired.path, undefined);
  assert.equal(retired.key, SPEC.registryKey);
});

test('a capability row carrying neither registry key declares no door', () => {
  const neither = registryIngressPath({ id: 'synthetic', documentPath: 'appearance.general.rhythm' });
  assert.equal(neither.path, undefined);
  assert.equal(neither.key, SPEC.registryKey);
});

test('the committed capability registry declares its door under the CURRENT registry key', () => {
  const rows = activePublicControls();
  assert.ok(rows.length > 0, 'the registry produced no active public control');
  const missing = rows.filter((row) => registryIngressPath(row).path === undefined);
  assert.deepEqual(missing.map((row) => row.id), [], 'a capability row declares no static door');
});

test('a manifest with no static key is refused under the current key name', () => {
  const result = outcome({ controlId: 'synthetic', ingress: {} }, 'any');
  assert.equal(result.ok, false);
  assert.match(result.message, /declares no staticThemePath/);
});
