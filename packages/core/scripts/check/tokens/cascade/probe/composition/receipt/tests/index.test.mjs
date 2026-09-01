/**
 * @fileoverview Negative drills for the source-bound receipt emitter.
 *
 * Run: node --test scripts/check/tokens/cascade/probe/composition/receipt/tests/index.test.mjs
 *
 * NOTHING IS WRITTEN INTO THE EVIDENCE ROOT. Each drill builds a temp directory
 * and points the programme contracts' `evidence.root` at a folder inside it. A
 * symlink puts the real `packages/` tree under that temp root, so the source
 * digest is computed over the REAL repository bytes rather than over a set of
 * files that happen to be missing — a digest of absences would agree with
 * itself and prove nothing.
 *
 * The validator under test is the programme's own
 * (`scripts/check/evidence/framework/receipts/index.mjs`). This file adds no second
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
  INSTRUMENT_ROOT,
  instrumentVersion,
  ownedSourceFiles,
  RECEIPT_SCHEMA_VERSION,
  REPOSITORY_ROOT,
  loadProgramContracts,
  verifyReceipt,
  writeEvidence,
} from '../index.mjs';
// The programme validator owns the derivation; this file adds no second one.
import { sightedApprovers } from '../../../../../../evidence/framework/receipts/index.mjs';

const EVIDENCE_ROOT = 'tmp-probe-evidence';
const ARTIFACT_BYTES = `${JSON.stringify({ instrument: 'resolution-probe', rows: [] }, null, 2)}\n`;

const RECEIPT_FIELDS = Object.freeze({
  roundId: 'R0',
  familyId: 'primitive/layout/flex',
  scenarioId: 'spacing.rhythm/airy/static-and-db',
  evidenceKind: 'computed-causal-run',
  commandOrTool: 'node scripts/check/tokens/cascade/probe/public/cli/index.mjs causal',
  exitCode: 0,
  measuredSourceFiles: [
    'packages/core/src/foundation/tokens/css/foundation/themes/default/index.css',
    'packages/core/governance/manifest/controls/spacing/rhythm/index.json',
  ],
  negativeDrill: {
    violation: 'a moved negative control, a non-restoring variable, a zero-match selector',
    failsClosed: true,
    proof: 'node --test scripts/check/tokens/cascade/probe/foundation/*/tests/index.test.mjs',
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
    owned.includes('packages/core/scripts/check/tokens/cascade/probe/foundation/causality/index.mjs'),
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
      sourceFiles: receipt.sourceFiles.filter((file) => !file.startsWith(`${INSTRUMENT_ROOT}/`)),
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

/* ===================================================================== *
 * The sighted-approver fence, DERIVED FROM THE LIVE SEAT.
 *
 * WHAT WAS WRONG BEFORE, because the green below is only worth reading if the
 * reader knows what it replaced. `receipts.mjs` held
 * `SIGHTED_APPROVER = 'independent code audit (DT)'` and the single drill here passed `'independent code audit'`.
 * Two defects at once:
 *
 *   1. The drill compared unequal strings, so it asserted a refusal that could
 *      not happen -- a fence that fenced nothing, red since the succession.
 *   2. Far worse, the constant itself was stale. The owner's order of
 *      2026-08-23 moved the DT seat to design authority and left independent code audit a read-only
 *      consultant, so the LIVE approver could produce the evidence it approves
 *      and the validator said nothing. A literal cannot go stale loudly.
 *
 * So fixing this by writing a different name would have rebuilt the same
 * defect one succession later. The forbidden set is now READ from the two live
 * authorities on every call, and these drills exercise the derivation itself --
 * including that it FOLLOWS a changed contract, without which "derived" is
 * decoration.
 *
 * `sightedApprovers` is imported from the programme validator rather than from
 * the instrument barrel, for the reason stated in this file's header: one
 * validator, one authority.
 * ===================================================================== */

/** A receipt that is valid in every respect except the producer under test. */
function receiptProducedBy(producer, { root, contracts }) {
  return writeEvidence({
    root,
    artifactPath: `${EVIDENCE_ROOT}/causal.json`,
    artifactBytes: ARTIFACT_BYTES,
    receiptPath: `${EVIDENCE_ROOT}/receipts/causal.receipt.json`,
    receiptFields: { ...RECEIPT_FIELDS, producer },
    contracts,
  }).validation;
}

const namesTheApprover = (message) => /sighted approver/.test(message);

test('the forbidden set is DERIVED from the two live authorities, not written here', () => {
  const real = loadProgramContracts();
  const derived = sightedApprovers(real);
  // Read from the same contracts the fence reads, so this cannot pass by
  // agreeing with a name someone typed into either side.
  assert.deepEqual(
    derived,
    [
      ...new Set([
        real.orchestration.doubleAccept.coordinator,
        real.rubric.eligibility.finalSightedAuthority,
      ]),
    ],
    'the set must be exactly the seat named by agent-orchestration and the rubric',
  );
  assert.ok(derived.length >= 1);
});

test('fence drill (a): the coordinator named by agent-orchestration is REFUSED', () => {
  withTempRoot(({ root, contracts }) => {
    const seat = contracts.orchestration.doubleAccept.coordinator;
    const result = receiptProducedBy(seat, { root, contracts });
    assert.equal(result.valid, false);
    assert.ok(result.failures.some(namesTheApprover), JSON.stringify(result.failures));

    // Whitespace and case are not a way past it. A fence a producer can walk
    // around by shouting is not a fence.
    for (const disguise of [`  ${seat} `, seat.toUpperCase(), seat.toLowerCase()]) {
      const disguised = receiptProducedBy(disguise, { root, contracts });
      assert.ok(
        disguised.failures.some(namesTheApprover),
        `"${disguise}" walked past the fence`,
      );
    }
  });
});

test('fence drill (b): the final sighted authority named by the rubric is REFUSED', () => {
  withTempRoot(({ root, contracts }) => {
    const authority = contracts.rubric.eligibility.finalSightedAuthority;
    const result = receiptProducedBy(authority, { root, contracts });
    assert.equal(result.valid, false);
    assert.ok(result.failures.some(namesTheApprover), JSON.stringify(result.failures));
  });
});

test('fence drills (c)(d)(e): a RETIRED seat, and the auditor, pass the fence', () => {
  withTempRoot(({ root, contracts }) => {
    const seated = sightedApprovers(contracts);
    // (c) and (d): the names the constant used to hold. independent code audit left the DT seat
    //     on 2026-08-23 and holds no audit seat, so it approves nothing and this
    //     fence has nothing to say about it -- the AGED_EXPECTATION, stated as
    //     the expectation rather than left as a red.
    // (e) `independent audit 5` is the closure auditor, which is NOT the sighted approver
    //     under the derivation. Whether the auditor may produce the evidence it
    //     audits is a DIFFERENT class of segregation; it is recorded, not built
    //     here, and inventing it inside this fence would hide it behind a green.
    for (const producer of ['independent code audit', 'independent code audit (DT)', 'independent audit 5']) {
      assert.ok(
        !seated.includes(producer),
        `premise of this drill: "${producer}" does not hold the seat today. If the seat moved ` +
          'onto it, this drill is the AGED_EXPECTATION and the expectation is what changes.',
      );
      const result = receiptProducedBy(producer, { root, contracts });
      assert.equal(result.valid, true, JSON.stringify(result.failures));
      assert.equal(result.failures.some(namesTheApprover), false);
    }
  });
});

test('fence drill (f): the fence FOLLOWS the contract, so the derivation is not decoration', () => {
  withTempRoot(({ root, contracts }) => {
    // A seat nobody holds, installed in memory. The previously-forbidden name
    // must now pass and the new one must now be refused -- BOTH halves, because
    // only the first half is also true of a fence that merely reads the
    // contract once and then ignores it.
    const wasSeated = contracts.orchestration.doubleAccept.coordinator;
    const moved = {
      ...contracts,
      orchestration: {
        ...contracts.orchestration,
        doubleAccept: { ...contracts.orchestration.doubleAccept, coordinator: 'Successor Seat' },
      },
      rubric: {
        ...contracts.rubric,
        eligibility: { ...contracts.rubric.eligibility, finalSightedAuthority: 'Successor Seat' },
      },
    };
    assert.deepEqual(sightedApprovers(moved), ['Successor Seat']);

    const successor = receiptProducedBy('Successor Seat', { root, contracts: moved });
    assert.equal(successor.valid, false);
    assert.ok(successor.failures.some(namesTheApprover));

    const predecessor = receiptProducedBy(wasSeated, { root, contracts: moved });
    assert.equal(predecessor.valid, true, JSON.stringify(predecessor.failures));
    assert.equal(predecessor.failures.some(namesTheApprover), false);
  });
});

test('fence drill (g): an authority it cannot READ makes the validator fail CLOSED', () => {
  withTempRoot(({ root, contracts }) => {
    // Only the authority is broken; everything else the validator needs is
    // intact, so the receipt is otherwise perfect and the ONLY thing that can
    // sink it is the unprovable segregation.
    for (const broken of [
      {
        ...contracts,
        orchestration: { ...contracts.orchestration, doubleAccept: {} },
      },
      {
        ...contracts,
        rubric: { ...contracts.rubric, eligibility: {} },
      },
      { ...contracts, orchestration: {}, rubric: {} },
    ]) {
      assert.throws(() => sightedApprovers(broken), /cannot be derived from the live authorities/);
      const result = receiptProducedBy('claude-modern-rescue-lane-b', { root, contracts: broken });
      assert.equal(result.valid, false, 'an unprovable segregation must not validate');
      assert.ok(
        result.failures.some((message) => /segregation cannot be checked/.test(message)),
        JSON.stringify(result.failures),
      );
    }
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
