import assert from 'node:assert/strict';
import { copyFileSync, cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { auditEffectProvenance } from './effect-registry-audit.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalRoot = resolve(repoRoot, 'packages/core/provenance/effects');
const canonicalRegistry = resolve(
  repoRoot,
  'packages/core/src/infrastructure/runtime/effects/runtime/registry/index.ts',
);
const ciPath = resolve(repoRoot, '.github/workflows/ci.yml');
const coreManifestPath = resolve(repoRoot, 'packages/core/package.json');

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

test('canonical effect research provenance is exact and copy-free', () => {
  assert.deepEqual(auditEffectProvenance(), {
    schemaVersion: 1,
    sources: 4,
    archivedLicenses: 4,
    sourceCopied: 0,
    registrySources: 4,
    certifiedDefinitions: 0,
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

test('effect provenance remains a first-class local and CI release gate', () => {
  const coreManifest = JSON.parse(readFileSync(coreManifestPath, 'utf8'));
  const workflow = readFileSync(ciPath, 'utf8');

  assert.match(coreManifest.scripts.pretest, /effects:provenance/);
  assert.match(coreManifest.scripts.lint, /effects:provenance/);
  assert.match(coreManifest.scripts['test:scripts'], /effect-registry-audit\.test\.mjs/);
  assert.ok(workflow.includes('scripts/effect-registry-audit(\\.test)?\\.mjs$'));
  assert.match(workflow, /^\s+pnpm effects:provenance$/m);
  assert.match(workflow, /^\s+pnpm effects:provenance:test$/m);
});
