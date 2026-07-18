import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  auditNoLucideBoundary,
  auditOpticalMatrix,
  resolveCra17GateDisposition,
} from './cra-17-integral-gate.mjs';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function withFixture(prefix, run) {
  const root = mkdtempSync(resolve(tmpdir(), prefix));
  try {
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeOpticalFixture(root, review = 'pending') {
  const artifactRoot = resolve(root, 'test-artifacts/craft/cra-17');
  const matrixRoot = resolve(artifactRoot, 'optical-matrix');
  mkdirSync(matrixRoot, { recursive: true });
  const bytes = Buffer.from('fixture-png');
  writeFileSync(resolve(matrixRoot, 'bithire-classic-light-mobile.png'), bytes);
  writeJson(resolve(artifactRoot, 'icon-supplier-decision.json'), {
    canonicalCorpus: { roleCount: 1 },
    requiredMatrix: {
      sizesPx: [12],
      engines: ['classic'],
      colorSchemes: ['light'],
      formFactors: ['mobile'],
      brandContexts: [{ id: 'bithire', label: 'BitHire' }],
      requiredRoleCells: 1,
    },
  });
  writeJson(resolve(matrixRoot, 'capture-manifest.json'), {
    roleCount: 1,
    sizesPx: [12],
    engines: ['classic'],
    schemes: ['light'],
    formFactor: 'mobile',
    tenantContexts: ['bithire'],
    requiredRoleCells: 1,
    recordedRoleCells: 1,
    screenshotCount: 1,
    sightedReview: review,
    captures: [{
      tenant: 'bithire',
      engine: 'classic',
      theme: 'light',
      bytes: bytes.length,
      file: 'bithire-classic-light-mobile.png',
      roleCells: 1,
      sha256: sha256(bytes),
    }],
  });
}

test('negative drill rejects Lucide in a productive manifest while allowing the prohibition rule', () => {
  withFixture('cra17-integral-lucide-', (root) => {
    const manifest = resolve(root, 'package.json');
    const rule = resolve(
      root,
      'packages/core/src/tooling/eslint/runtime/rules/no-direct-lucide/index.ts',
    );
    mkdirSync(resolve(rule, '..'), { recursive: true });
    writeFileSync(rule, "export const message = 'Do not import lucide-react';\n");
    writeJson(manifest, { dependencies: { react: '19.2.5' } });
    assert.deepEqual(auditNoLucideBoundary({ repoRoot: root, paths: [manifest, rule] }), []);

    writeJson(manifest, { dependencies: { 'lucide-react': '0.563.0' } });
    assert.deepEqual(auditNoLucideBoundary({ repoRoot: root, paths: [manifest, rule] }), [{
      path: 'package.json',
      occurrences: 1,
      lines: [3],
    }]);
  });
});

test('pending sighted review is structurally reportable but never completion-eligible', () => {
  withFixture('cra17-integral-optics-', (root) => {
    writeOpticalFixture(root);
    const optical = auditOpticalMatrix({ repoRoot: root });
    assert.deepEqual(optical.errors, []);
    assert.deepEqual(optical.pending, [
      'sightedReview is pending; CRA17 is not completion-eligible',
    ]);

    assert.deepEqual(resolveCra17GateDisposition({
      mode: 'structural',
      errors: optical.errors,
      pending: optical.pending,
    }), {
      passed: true,
      structurallyPassed: true,
      completionEligible: false,
    });
    assert.deepEqual(resolveCra17GateDisposition({
      mode: 'final',
      errors: optical.errors,
      pending: optical.pending,
    }), {
      passed: false,
      structurallyPassed: true,
      completionEligible: false,
    });
  });
});

test('optical manifest hash mutation fails closed', () => {
  withFixture('cra17-integral-optics-hash-', (root) => {
    writeOpticalFixture(root);
    writeFileSync(
      resolve(
        root,
        'test-artifacts/craft/cra-17/optical-matrix/bithire-classic-light-mobile.png',
      ),
      'tampered',
    );
    const optical = auditOpticalMatrix({ repoRoot: root });
    assert.match(optical.errors.join('\n'), /byte count drifted/u);
    assert.match(optical.errors.join('\n'), /SHA-256 drifted/u);
  });
});
