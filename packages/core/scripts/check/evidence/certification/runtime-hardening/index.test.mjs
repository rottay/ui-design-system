import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  auditCra15RuntimeHardening,
  resolveCra15GateDisposition,
  resolveSupersededReceipt,
} from "./index.mjs";
import { repoRoot as findRepoRoot } from "../../../../libraries/repo-root/index.mjs";

const REPOSITORY_ROOT = findRepoRoot(import.meta.dirname);

function override(relativePath, mutate) {
  const source = readFileSync(resolve(REPOSITORY_ROOT, relativePath), "utf8");
  return new Map([[relativePath, mutate(source)]]);
}

test("canonical CRA15 source produces deterministic structural evidence without a false completion claim", () => {
  const first = auditCra15RuntimeHardening({ repositoryRoot: REPOSITORY_ROOT });
  const second = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
  });

  assert.equal(first.ok, true, first.errors.join("\n"));
  assert.deepEqual(second.artifact, first.artifact);
  assert.equal(first.artifact.structurallyPassed, true);
  assert.equal(first.artifact.completionEligible, false);
  assert.equal(first.artifact.checks.roadmapAuthority.status, "pending");
  // Real browser evidence is recorded, and it is HISTORICAL: the sealed receipt
  // measured a source coordinate that no commit reproduces any more, so it is
  // superseded rather than current. That is a pending item with a named owner,
  // not a pass and not a silent skip -- and the artifact must still never claim
  // completion on its own.
  assert.equal(
    first.artifact.checks.realBrowserPerformanceAndBundle.status,
    "pending"
  );
  assert.equal(
    first.pending.filter(
      (item) =>
        !/Phase 2C remains locked/u.test(item) &&
        !/browser-receipt-superseded-by-canonical-path-refactor/u.test(item)
    ).length,
    0,
    first.pending.join("\n")
  );
  assert.match(first.pending.join("\n"), /Phase 2C remains locked/u);
  assert.match(
    first.pending.join("\n"),
    /sealed browser receipt is superseded/u
  );

  // NEGATIVE CONTROL: without the written record the stale coordinate is an
  // error, exactly as before. The record is what holds it open, and nothing
  // else does.
  const unrecorded = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    supersessionObligationsOverride: { obligations: [] },
  });
  assert.equal(unrecorded.ok, false);
  assert.match(
    unrecorded.errors.join("\n"),
    /browser evidence source fingerprint is stale/u
  );
  assert.equal(first.artifact.governance.sharedContinuousRuntimeBudget, 1);
  assert.equal(first.artifact.governance.certifiedEffects, 1);
  assert.equal(
    first.artifact.allocationBudgets.particleBundleGzipBytes,
    16_384
  );
  assert.deepEqual(
    resolveCra15GateDisposition({
      mode: "structural",
      errors: first.errors,
      pending: first.pending,
    }),
    {
      passed: true,
      structurallyPassed: true,
      completionEligible: false,
    }
  );
  assert.equal(
    resolveCra15GateDisposition({
      mode: "final",
      errors: first.errors,
      pending: first.pending,
    }).passed,
    false
  );
});

test("a supersession record authorises exactly one coordinate, in both directions", () => {
  const receiptSha256 = "a".repeat(64);
  const recorded = "b".repeat(64);
  const live = "c".repeat(64);
  const drift = {
    rosterSize: 3,
    pathMovedContentIdentical: ["x -> y"],
    pathMovedAndContentChanged: [],
    contentChangedInPlace: ["z"],
    unchanged: 1,
  };
  const entry = {
    id: "fixture/superseded",
    receiptSha256,
    recordedFingerprint: recorded,
    liveFingerprint: live,
    ownerLot: "C1",
    resolution: "RECAPTURE_INTO_A_LIVE_OWNER",
    rosterDriftSinceReceipt: drift,
  };
  const run = (obligations, overrides = {}) =>
    resolveSupersededReceipt({
      obligations,
      receiptSha256,
      recorded,
      live,
      rosterSize: 3,
      ...overrides,
    });

  // The exact triple is the only thing that holds the receipt open.
  const covered = run({ obligations: [entry] });
  assert.deepEqual(covered.errors, []);
  assert.equal(covered.pending.length, 1);
  assert.match(covered.pending[0], /fixture\/superseded/u);

  // Each pin, moved on its own, takes the authorisation away.
  for (const [label, mutated] of [
    ["receipt bytes", { ...entry, receiptSha256: "d".repeat(64) }],
    ["recorded coordinate", { ...entry, recordedFingerprint: "e".repeat(64) }],
    ["live coordinate", { ...entry, liveFingerprint: "f".repeat(64) }],
  ]) {
    const result = run({ obligations: [mutated] });
    assert.match(
      result.errors.join("\n"),
      /browser evidence source fingerprint is stale/u,
      `${label} must stop authorising`
    );
    assert.deepEqual(result.pending, []);
  }

  // A record that no longer applies is a stale note, and a stale note
  // authorises nothing -- exactness in the other direction.
  const applied = resolveSupersededReceipt({
    obligations: { obligations: [entry] },
    receiptSha256,
    recorded: live,
    live,
    rosterSize: 3,
  });
  assert.match(applied.errors.join("\n"), /stale and authorises nothing/u);

  // With no record at all and a covering receipt, there is nothing to say.
  assert.deepEqual(
    resolveSupersededReceipt({
      obligations: { obligations: [] },
      receiptSha256,
      recorded: live,
      live,
      rosterSize: 3,
    }),
    { errors: [], pending: [] }
  );

  // Two records for the same coordinate is ambiguity, not redundancy.
  const twice = run({ obligations: [entry, { ...entry, id: "fixture/twin" }] });
  assert.match(twice.errors.join("\n"), /exactly one may/u);

  // The drift enumeration must close against the real roster size, so the
  // record cannot describe a tree it did not measure.
  const short = run({
    obligations: [
      { ...entry, rosterDriftSinceReceipt: { ...drift, unchanged: 0 } },
    ],
  });
  assert.match(short.errors.join("\n"), /must close exactly/u);
});

test("the sealed CRA-15 receipt is pinned by its own bytes, and is not rewritten", () => {
  const receipt = resolve(
    REPOSITORY_ROOT,
    "test-artifacts/craft/cra-15/browser-evidence.json"
  );
  const record = JSON.parse(
    readFileSync(
      resolve(import.meta.dirname, "obligations/index.json"),
      "utf8"
    )
  ).obligations.find(
    (entry) =>
      entry.id === "cra-15/browser-receipt-superseded-by-canonical-path-refactor"
  );
  const bytes = readFileSync(receipt);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    record.receiptSha256,
    "the sealed receipt moved; it is historical evidence and must not be rewritten"
  );
  assert.equal(
    JSON.parse(bytes.toString("utf8")).sourceFingerprint,
    record.recordedFingerprint
  );
});

test("shared budget widening fails closed", () => {
  const path =
    "packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/foundation/contracts/index.ts";
  const result = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    sourceOverrides: override(path, (source) =>
      source.replace("maxActiveTotal: 1", "maxActiveTotal: 2")
    ),
  });

  assert.equal(result.ok, false);
  assert.match(
    result.errors.join("\n"),
    /one shared continuous graphics budget/u
  );
});

test("Particle certification, save-data and context-loss evidence cannot disappear silently", () => {
  const registryPath =
    "packages/core/src/infrastructure/runtime/effects/runtime/registry/index.ts";
  const registry = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    sourceOverrides: override(registryPath, (source) =>
      source.replace("admission: 'certified'", "admission: 'quarantined'")
    ),
  });
  assert.equal(registry.ok, false);
  assert.match(registry.errors.join("\n"), /sole measured certification/u);

  const browserPath =
    "packages/showroom/e2e/responsive/spatial-runtime.spec.ts";
  const browser = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    sourceOverrides: override(browserPath, (source) =>
      source
        .replaceAll("saveData", "dataSaverRemoved")
        .replaceAll("webglcontextlost", "contextEventRemoved")
    ),
  });
  assert.equal(browser.ok, false);
  assert.match(
    browser.errors.join("\n"),
    /Spatial real-browser lifecycle matrix/u
  );
});

test("browser, long-task, RAF, bundle and context claims fail closed at their recorded ceilings", () => {
  const structural = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
  });
  const reportPath = "test-artifacts/craft/cra-15/playwright-report.json";
  const reportSource = '{"suites":[],"stats":{"expected":5}}\n';
  const browserEvidence = {
    schemaVersion: 1,
    workOrder: "WO-CRA-15",
    package: structural.artifact.package,
    sourceFingerprint: structural.artifact.sourceFingerprint,
    runner: {
      productionBuild: true,
      browserName: "chromium",
      browserVersion: "fixture",
    },
    report: {
      path: reportPath,
      sha256: createHash("sha256").update(reportSource).digest("hex"),
      passed: 5,
      failed: 0,
    },
    assertions: {
      providerColorIsolation: true,
      distinctProviderColors: 2,
      maxConcurrentContinuousRuntimes: 1,
      maxSuspendedRafCallbacks: 0,
      maxLongTaskMs: 49,
      rapidMountUnmountCleanup: true,
      bundle: {
        cleanBuild: true,
        particleGzipBytes: 4_222,
        spatialHostGzipBytes: 7_064,
        spatialSpecGzipBytes: 1_097,
      },
      particle: {
        maxDpr: 2,
        maxCount: 1_200,
        maxPixels: 4_194_304,
        contextLossRecovered: true,
        cleanupPassed: true,
      },
      spatial: {
        maxDpr: 1.5,
        maxDimension: 2_560,
        maxPixels: 4_194_304,
        contextLossRecovered: true,
        cleanupPassed: true,
      },
      fallbackPolicies: {
        "reduced-motion": true,
        "coarse-pointer": true,
        "save-data": true,
        unsupported: true,
      },
    },
  };
  const sourceOverrides = new Map([[reportPath, reportSource]]);
  const valid = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    sourceOverrides,
    browserEvidenceOverride: browserEvidence,
  });
  assert.equal(valid.ok, true, valid.errors.join("\n"));
  assert.equal(
    valid.artifact.checks.realBrowserPerformanceAndBundle.status,
    "pass"
  );
  assert.deepEqual(valid.pending, [
    "Phase 2C remains locked without structured owner GO",
  ]);

  for (const [label, mutate, pattern] of [
    [
      "RAF",
      (evidence) => ({
        ...evidence,
        assertions: { ...evidence.assertions, maxSuspendedRafCallbacks: 1 },
      }),
      /zero RAF callbacks/u,
    ],
    [
      "long task",
      (evidence) => ({
        ...evidence,
        assertions: { ...evidence.assertions, maxLongTaskMs: 51 },
      }),
      /long-task ceiling/u,
    ],
    [
      "bundle",
      (evidence) => ({
        ...evidence,
        assertions: {
          ...evidence.assertions,
          bundle: {
            ...evidence.assertions.bundle,
            spatialHostGzipBytes: 7_801,
          },
        },
      }),
      /Spatial host bundle/u,
    ],
    [
      "context",
      (evidence) => ({
        ...evidence,
        assertions: {
          ...evidence.assertions,
          maxConcurrentContinuousRuntimes: 2,
        },
      }),
      /exactly one runtime\/context/u,
    ],
    [
      "stale source",
      (evidence) => ({ ...evidence, sourceFingerprint: "0".repeat(64) }),
      /source fingerprint is stale/u,
    ],
    [
      "report traversal",
      (evidence) => ({
        ...evidence,
        report: {
          ...evidence.report,
          path: "test-artifacts/craft/cra-15/../../forged.json",
        },
      }),
      /path must stay beneath/u,
    ],
    [
      "report hash",
      (evidence) => ({
        ...evidence,
        report: { ...evidence.report, sha256: "0".repeat(64) },
      }),
      /report SHA-256 drifted/u,
    ],
    [
      "accessible fallback",
      (evidence) => ({
        ...evidence,
        assertions: {
          ...evidence.assertions,
          fallbackPolicies: {
            ...evidence.assertions.fallbackPolicies,
            "save-data": false,
          },
        },
      }),
      /save-data fallback/u,
    ],
  ]) {
    const result = auditCra15RuntimeHardening({
      repositoryRoot: REPOSITORY_ROOT,
      sourceOverrides,
      browserEvidenceOverride: mutate(browserEvidence),
    });
    assert.equal(result.ok, false, `${label} widening must fail`);
    assert.match(result.errors.join("\n"), pattern);
  }
});
