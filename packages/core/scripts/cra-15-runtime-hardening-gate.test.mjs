import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { auditCra15RuntimeHardening } from './cra-15-runtime-hardening-gate.mjs';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '../../..');

function override(relativePath, mutate) {
  const source = readFileSync(resolve(REPOSITORY_ROOT, relativePath), 'utf8');
  return new Map([[relativePath, mutate(source)]]);
}

test('canonical CRA15 source produces one deterministic bounded certification', () => {
  const first = auditCra15RuntimeHardening({ repositoryRoot: REPOSITORY_ROOT });
  const second = auditCra15RuntimeHardening({ repositoryRoot: REPOSITORY_ROOT });

  assert.equal(first.ok, true, first.errors.join('\n'));
  assert.deepEqual(second.artifact, first.artifact);
  assert.equal(first.artifact.governance.sharedContinuousRuntimeBudget, 1);
  assert.equal(first.artifact.governance.certifiedEffects, 1);
  assert.equal(first.artifact.allocationBudgets.particleBundleGzipBytes, 16_384);
});

test('shared budget widening fails closed', () => {
  const path = 'packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/foundation/contracts/index.ts';
  const result = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    sourceOverrides: override(path, (source) => source.replace('maxActiveTotal: 1', 'maxActiveTotal: 2')),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /one shared continuous graphics budget/u);
});

test('Particle certification, save-data and context-loss evidence cannot disappear silently', () => {
  const registryPath = 'packages/core/src/infrastructure/runtime/effects/runtime/registry/index.ts';
  const registry = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    sourceOverrides: override(registryPath, (source) => source.replace(
      "admission: 'certified'",
      "admission: 'quarantined'",
    )),
  });
  assert.equal(registry.ok, false);
  assert.match(registry.errors.join('\n'), /sole measured certification/u);

  const browserPath = 'packages/showroom/e2e/responsive/spatial-runtime.spec.ts';
  const browser = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    sourceOverrides: override(browserPath, (source) => source
      .replaceAll('saveData', 'dataSaverRemoved')
      .replaceAll('webglcontextlost', 'contextEventRemoved')),
  });
  assert.equal(browser.ok, false);
  assert.match(browser.errors.join('\n'), /Spatial real-browser lifecycle matrix/u);
});
