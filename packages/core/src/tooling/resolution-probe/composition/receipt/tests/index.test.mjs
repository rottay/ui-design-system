/**
 * @fileoverview Negative drills for the source-bound receipt emitter.
 *
 * Run: node --test src/tooling/resolution-probe/composition/receipt/tests/index.test.mjs
 *
 * NOTHING IS WRITTEN INTO THE EVIDENCE ROOT. Each drill builds a temp directory
 * and points the programme contracts' `evidence.root` at a folder inside it. A
 * symlink puts the real `packages/` tree under that temp root, so the source
 * digest is computed over the REAL repository bytes rather than over a set of
 * files that happen to be missing — a digest of absences would agree with
 * itself and prove nothing.
 *
 * The validator under test is the programme's own
 * (`scripts/quality-evidence/v2/receipts.mjs`). This file adds no second
 * validator: two authorities that agree teach nothing, and two that disagree
 * need a third.
 *
 * @module Tooling/ResolutionProbe/Composition/Receipt/Tests
 */

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

import {
  artifactStillMatches,
  buildReceipt,
  instrumentVersion,
  ownedSourceFiles,
  RECEIPT_SCHEMA_VERSION,
  REPOSITORY_ROOT,
  loadProgramContracts,
  verifyReceipt,
  writeEvidence,
} from '../index.mjs';

const EVIDENCE_ROOT = 'tmp-probe-evidence';
const ARTIFACT_BYTES = `${JSON.stringify({ instrument: 'resolution-probe', rows: [] }, null, 2)}\n`;

const RECEIPT_FIELDS = Object.freeze({
  roundId: 'R0',
  familyId: 'primitive/layout/flex',
  scenarioId: 'spacing.rhythm/airy/static-and-db',
  evidenceKind: 'computed-causal-run',
  commandOrTool: 'node src/tooling/resolution-probe/public/cli/index.mjs causal',
  exitCode: 0,
  measuredSourceFiles: [
    'packages/core/src/foundation/tokens/css/foundation/themes/default.css',
    'packages/core/manifest/controls/spacing.rhythm.json',
  ],
  negativeDrill: {
    violation: 'a moved negative control, a non-restoring variable, a zero-match selector',
    failsClosed: true,
    proof: 'node --test src/tooling/resolution-probe/foundation/*/tests/index.test.mjs',
  },
  producer: 'claude-modern-rescue-lane-b',
});

/** A temp root whose `packages/` is the real one, so digests hash real bytes. */
function withTempRoot(body) {
  const root = mkdtempSync(join(tmpdir(), 'resolution-probe-receipt-'));
  const link = join(root, 'packages');
  symlinkSync(resolve(REPOSITORY_ROOT, 'packages'), link, 'dir');
  const real = loadProgramContracts();
  const contracts = { ...real, evidence: { ...real.evidence, root: EVIDENCE_ROOT } };
  try {
    return body({ root, contracts });
  } finally {
    try {
      unlinkSync(link);
    } catch {
      // The symlink is the only thing pointing outside the temp tree; if it is
      // already gone, the recursive remove below is safe.
    }
    rmSync(root, { recursive: true, force: true });
  }
}

test('a receipt carries exactly the fields the evidence contract requires', () => {
  const real = loadProgramContracts();
  const receipt = buildReceipt({
    ...RECEIPT_FIELDS,
    artifactPath: `${EVIDENCE_ROOT}/causal.json`,
    artifactBytes: ARTIFACT_BYTES,
  });
  for (const field of real.evidence.receiptRequiredFields) {
    assert.ok(Object.hasOwn(receipt, field), `receipt is missing required field ${field}`);
  }
  assert.equal(receipt.schemaVersion, RECEIPT_SCHEMA_VERSION);
  assert.match(receipt.toolVersion, /^resolution-probe@[0-9a-f]{12}$/);
});

test('the receipt binds the INSTRUMENT, so changing the harness invalidates it', () => {
  const owned = ownedSourceFiles();
  assert.ok(owned.length > 0);
  assert.ok(
    owned.includes('packages/core/src/tooling/resolution-probe/foundation/causality/index.mjs'),
    'a receipt bound only to the measured CSS is satisfied by a broken harness measuring a ' +
      'healthy tree',
  );
  assert.equal(
    owned.some((file) => file.includes('/tests/')),
    false,
    'a test edit cannot alter a number, so it must not churn the digest',
  );
  const { toolVersion, digest } = instrumentVersion();
  assert.equal(toolVersion, `resolution-probe@${digest.slice(0, 12)}`);
});

test('positive control: a written artifact and its receipt validate by CONTENT', () => {
  withTempRoot(({ root, contracts }) => {
    const written = writeEvidence({
      root,
      artifactPath: `${EVIDENCE_ROOT}/causal.json`,
      artifactBytes: ARTIFACT_BYTES,
      receiptPath: `${EVIDENCE_ROOT}/receipts/causal.receipt.json`,
      receiptFields: RECEIPT_FIELDS,
      contracts,
    });
    assert.deepEqual(written.validation.failures, []);
    assert.equal(written.validation.valid, true);
    assert.equal(readFileSync(written.artifactAbsolute, 'utf-8'), ARTIFACT_BYTES);
    assert.equal(artifactStillMatches(written.receipt, { root }).matches, true);
  });
});

test('negative drill: TAMPERING with the artifact after the fact is caught by the sha', () => {
  withTempRoot(({ root, contracts }) => {
    const written = writeEvidence({
      root,
      artifactPath: `${EVIDENCE_ROOT}/causal.json`,
      artifactBytes: ARTIFACT_BYTES,
      receiptPath: `${EVIDENCE_ROOT}/receipts/causal.receipt.json`,
      receiptFields: RECEIPT_FIELDS,
      contracts,
    });
    writeFileSync(written.artifactAbsolute, `${ARTIFACT_BYTES}/* edited */`);
    assert.equal(artifactStillMatches(written.receipt, { root }).matches, false);
    const revalidated = verifyReceipt(written.receipt, { root, contracts });
    assert.equal(revalidated.valid, false);
    assert.ok(revalidated.failures.some((message) => /sha256 .* does not match/.test(message)));
  });
});

test('negative drill: a STALE source digest is named', () => {
  withTempRoot(({ root, contracts }) => {
    const written = writeEvidence({
      root,
      artifactPath: `${EVIDENCE_ROOT}/causal.json`,
      artifactBytes: ARTIFACT_BYTES,
      receiptPath: `${EVIDENCE_ROOT}/receipts/causal.receipt.json`,
      receiptFields: RECEIPT_FIELDS,
      contracts,
    });
    const stale = { ...written.receipt, sourceDigest: 'f'.repeat(64) };
    const result = verifyReceipt(stale, { root, contracts });
    assert.equal(result.valid, false);
    assert.ok(result.failures.some((message) => /source digest is stale/.test(message)));
  });
});

test('negative drill: a receipt that OMITS the instrument sources is refused', () => {
  withTempRoot(({ root, contracts }) => {
    const receipt = buildReceipt({
      ...RECEIPT_FIELDS,
      artifactPath: `${EVIDENCE_ROOT}/causal.json`,
      artifactBytes: ARTIFACT_BYTES,
    });
    const thinned = {
      ...receipt,
      sourceFiles: receipt.sourceFiles.filter((file) => !file.includes('/resolution-probe/')),
    };
    const result = verifyReceipt(thinned, { root, contracts });
    assert.equal(result.valid, false);
    assert.ok(
      result.failures.some((message) => /omits \d+ instrument source file/.test(message)),
      JSON.stringify(result.failures),
    );
  });
});

test('negative drill: an artifact OUTSIDE the allowed evidence root is refused', () => {
  withTempRoot(({ root, contracts }) => {
    const receipt = buildReceipt({
      ...RECEIPT_FIELDS,
      artifactPath: 'somewhere-else/causal.json',
      artifactBytes: ARTIFACT_BYTES,
    });
    const result = verifyReceipt(receipt, { root, contracts });
    assert.equal(result.valid, false);
    assert.ok(result.failures.some((message) => /outside the allowed evidence root/.test(message)));
  });
});

test('negative drill: the producer may not be the sighted approver', () => {
  withTempRoot(({ root, contracts }) => {
    const receipt = buildReceipt({
      ...RECEIPT_FIELDS,
      producer: 'Codex',
      artifactPath: `${EVIDENCE_ROOT}/causal.json`,
      artifactBytes: ARTIFACT_BYTES,
    });
    const result = verifyReceipt(receipt, { root, contracts });
    assert.ok(result.failures.some((message) => /must not be the sighted approver/.test(message)));
  });
});

test('negative drill: a receipt whose negativeDrill does not fail closed is refused', () => {
  withTempRoot(({ root, contracts }) => {
    const receipt = buildReceipt({
      ...RECEIPT_FIELDS,
      negativeDrill: { violation: 'something', failsClosed: false, proof: 'nowhere' },
      artifactPath: `${EVIDENCE_ROOT}/causal.json`,
      artifactBytes: ARTIFACT_BYTES,
    });
    const result = verifyReceipt(receipt, { root, contracts });
    assert.ok(result.failures.some((message) => /fails closed/.test(message)));
  });
});

test('negative drill: a FUTURE createdAt is refused', () => {
  withTempRoot(({ root, contracts }) => {
    const receipt = buildReceipt({
      ...RECEIPT_FIELDS,
      createdAt: new Date(Date.now() + 86_400_000).toISOString(),
      artifactPath: `${EVIDENCE_ROOT}/causal.json`,
      artifactBytes: ARTIFACT_BYTES,
    });
    const result = verifyReceipt(receipt, { root, contracts });
    assert.ok(result.failures.some((message) => /createdAt is in the future/.test(message)));
  });
});

test('negative drill: hashing a PATH instead of the payload is refused at build time', () => {
  assert.throws(
    () =>
      buildReceipt({
        ...RECEIPT_FIELDS,
        artifactPath: `${EVIDENCE_ROOT}/causal.json`,
        artifactBytes: undefined,
      }),
    /needs the exact artifact bytes/,
  );
});

test('negative drill: writeEvidence has NO default root, so it cannot drift into the evidence tree', () => {
  assert.throws(
    () =>
      writeEvidence({
        artifactPath: `${EVIDENCE_ROOT}/causal.json`,
        artifactBytes: ARTIFACT_BYTES,
        receiptPath: `${EVIDENCE_ROOT}/receipts/causal.receipt.json`,
        receiptFields: RECEIPT_FIELDS,
      }),
    /needs an explicit root/,
  );
});
