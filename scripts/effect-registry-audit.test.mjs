import assert from 'node:assert/strict';
import { copyFileSync, cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { auditEffectProvenance } from './effect-registry-audit.mjs';
import { CI_GATES } from '../packages/core/scripts/ci-gates.manifest.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalRoot = resolve(repoRoot, 'packages/core/provenance/effects');
const canonicalRegistry = resolve(
  repoRoot,
  'packages/core/src/infrastructure/runtime/effects/runtime/registry/index.ts',
);
const ciPath = resolve(repoRoot, '.github/workflows/ci.yml');
const coreManifestPath = resolve(repoRoot, 'packages/core/package.json');

function assertBlockingGate(gates, id, expectedRun) {
  const gate = gates.find((candidate) => candidate.id === id);
  assert.ok(gate, `${id} must remain in the canonical CI gate manifest`);
  assert.equal(gate.blocking, true, `${id} must remain blocking`);
  assert.deepEqual(gate.run, expectedRun, `${id} must retain its executable command`);
}

function withFixture(run) {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-effects-provenance-'));
  cpSync(canonicalRoot, fixtureRoot, { recursive: true });
  try {
    return run(fixtureRoot);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function mutateLedger(root, mutate) {
  const path = resolve(root, 'sources.json');
  const ledger = JSON.parse(readFileSync(path, 'utf8'));
  mutate(ledger);
  writeFileSync(path, `${JSON.stringify(ledger, null, 2)}\n`);
}

function withRegistryFixture(run) {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-effect-registry-'));
  const registryPath = resolve(fixtureRoot, 'registry.ts');
  copyFileSync(canonicalRegistry, registryPath);
  try {
    return run(registryPath);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

test('canonical effect provenance authorizes only the pinned first-party ParticleField source', () => {
  assert.deepEqual(auditEffectProvenance(), {
    schemaVersion: 1,
    sources: 5,
    archivedLicenses: 5,
    sourceCopied: 0,
    registrySources: 4,
    certifiedDefinitions: 1,
  });
});

test('provenance fails closed when source copying is claimed', () => {
  withFixture((root) => {
    mutateLedger(root, (ledger) => {
      ledger.sources.magicui.sourceCopied = true;
    });
    assert.throws(
      () => auditEffectProvenance(root),
      /magicui\.sourceCopied must remain false/,
    );
  });
});

test('provenance fails closed on revision or license-byte drift', () => {
  withFixture((root) => {
    mutateLedger(root, (ledger) => {
      ledger.sources['cult-ui'].revision = '0'.repeat(40);
    });
    assert.throws(
      () => auditEffectProvenance(root),
      /cult-ui\.revision drifted/,
    );
  });

  withFixture((root) => {
    const license = resolve(root, 'licenses/magicui-LICENSE.md');
    writeFileSync(license, `${readFileSync(license, 'utf8')}tampered\n`);
    assert.throws(
      () => auditEffectProvenance(root),
      /magicui license hash drifted/,
    );
  });
});

test('provenance rejects ungoverned archived licenses', () => {
  withFixture((root) => {
    writeFileSync(resolve(root, 'licenses/unknown-LICENSE.md'), 'unknown\n');
    assert.throws(
      () => auditEffectProvenance(root),
      /unreferenced archived licenses/,
    );
  });
});

test('registry research records cannot drift from the byte-verified ledger', () => {
  withRegistryFixture((registryPath) => {
    const source = readFileSync(registryPath, 'utf8').replace(
      'f4c33af6739191537738662d223b68d77bc226f4b57ea883e16481d8cc5c73c9',
      '0'.repeat(64),
    );
    writeFileSync(registryPath, source);
    assert.throws(
      () => auditEffectProvenance(canonicalRoot, registryPath),
      /registry react-bits\.licenseSha256 drifted/,
    );
  });
});

test('a future certified definition requires an audited authorized-source ledger', () => {
  withRegistryFixture((registryPath) => {
    const source = readFileSync(registryPath, 'utf8').replace(
      "admission: 'candidate'",
      "admission: 'certified'",
    );
    writeFileSync(registryPath, source);
    assert.throws(
      () => auditEffectProvenance(canonicalRoot, registryPath),
      /certified definitions require an audited authorized-source ledger: aurora/,
    );
  });
});

test('the ParticleField certification cannot drift from its exact source, budget or DS control', () => {
  withRegistryFixture((registryPath) => {
    const source = readFileSync(registryPath, 'utf8').replace(
      '8015fabaf5fccca7c38c663971b9da2cce8843ab',
      '0'.repeat(40),
    );
    writeFileSync(registryPath, source);
    assert.throws(
      () => auditEffectProvenance(canonicalRoot, registryPath),
      /particle-field\.provenance\.revision drifted/,
    );
  });

  withRegistryFixture((registryPath) => {
    const source = readFileSync(registryPath, 'utf8').replace(
      'bundleBudgetGzipBytes: 16_384',
      'bundleBudgetGzipBytes: 16_385',
    );
    writeFileSync(registryPath, source);
    assert.throws(
      () => auditEffectProvenance(canonicalRoot, registryPath),
      /particle-field\.budget\.bundleBudgetGzipBytes drifted/,
    );
  });

  withRegistryFixture((registryPath) => {
    const source = readFileSync(registryPath, 'utf8').replace(
      "runtimeControl: 'provider-and-instance',",
      "runtimeControl: 'provider-and-instance',\n    killSwitch: 'app-platform:legacy',",
    );
    writeFileSync(registryPath, source);
    assert.throws(
      () => auditEffectProvenance(canonicalRoot, registryPath),
      /must not restore an app-specific killSwitch/,
    );
  });
});

test('the first-party archived license is byte-exact', () => {
  withFixture((root) => {
    const license = resolve(root, 'licenses/rottay-ui-design-system-LICENSE');
    writeFileSync(license, `${readFileSync(license, 'utf8')}tampered\n`);
    assert.throws(
      () => auditEffectProvenance(root),
      /rottay-ui-design-system license hash drifted/,
    );
  });
});

test('effect provenance remains a first-class local and CI release gate', () => {
  const coreManifest = JSON.parse(readFileSync(coreManifestPath, 'utf8'));
  const workflow = readFileSync(ciPath, 'utf8');

  assert.equal(coreManifest.scripts.pretest, 'pnpm run gates:ci');
  assert.equal(coreManifest.scripts['gates:ci'], 'node scripts/run-ci-gates.mjs');
  assertBlockingGate(
    CI_GATES,
    'effects:provenance',
    ['pnpm', 'run', 'effects:provenance'],
  );
  assert.match(coreManifest.scripts.lint, /effects:provenance/);
  assert.match(coreManifest.scripts['test:scripts'], /effect-registry-audit\.test\.mjs/);
  assert.ok(workflow.includes('scripts/effect-registry-audit(\\.test)?\\.mjs$'));
  assert.match(workflow, /^\s+pnpm effects:provenance$/m);
  assert.match(workflow, /^\s+pnpm effects:provenance:test$/m);

  assert.throws(
    () => assertBlockingGate(
      CI_GATES.filter((gate) => gate.id !== 'effects:provenance'),
      'effects:provenance',
      ['pnpm', 'run', 'effects:provenance'],
    ),
    /must remain in the canonical CI gate manifest/,
  );
});
