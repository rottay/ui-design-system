import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  auditCra15RuntimeHardening,
  auditRetiredBundleSubjects,
  auditRetiredSubjectExports,
  resolveCra15GateDisposition,
  resolveSupersededReceipt,
} from "./index.mjs";
import { repoRoot as findRepoRoot } from "../../../../libraries/repo-root/index.mjs";

const REPOSITORY_ROOT = findRepoRoot(import.meta.dirname);

function override(relativePath, mutate) {
  const source = readFileSync(resolve(REPOSITORY_ROOT, relativePath), "utf8");
  return new Map([[relativePath, mutate(source)]]);
}

const REPORT_PATH = "test-artifacts/craft/cra-15/playwright-report.json";
const REPORT_SOURCE = '{"suites":[],"stats":{"expected":5}}\n';
const SEALED_RECEIPT_PATH = "test-artifacts/craft/cra-15/browser-evidence.json";

function liveBrowserEvidence(structural) {
  return {
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
      path: REPORT_PATH,
      sha256: createHash("sha256").update(REPORT_SOURCE).digest("hex"),
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
}

function withBundle(evidence, bundle) {
  return { ...evidence, assertions: { ...evidence.assertions, bundle } };
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
        item !== "WO-RET-01 is todo, not done" &&
        !/browser-receipt-superseded-by-canonical-path-refactor/u.test(item)
    ).length,
    0,
    first.pending.join("\n")
  );
  assert.match(first.pending.join("\n"), /Phase 2C remains locked/u);
  // WO-RET-01 joined CRA-15's dependsOn in 1c56b0399 (the adopted 2026-09-05
  // programme); until it is done it is a named pending item, never a pass.
  assert.ok(first.pending.includes("WO-RET-01 is todo, not done"), first.pending.join("\n"));
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
    "packages/core/src/infrastructure/runtime/effects/catalog/registry/index.ts";
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
  const browserEvidence = liveBrowserEvidence(structural);
  const sourceOverrides = new Map([[REPORT_PATH, REPORT_SOURCE]]);
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
    "WO-RET-01 is todo, not done",
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

test("the retired ./spatial/spec subject is never measured live and never passes by absence", () => {
  const structural = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
  });
  const sourceOverrides = new Map([[REPORT_PATH, REPORT_SOURCE]]);
  const live = liveBrowserEvidence(structural);
  const run = (evidence) =>
    auditCra15RuntimeHardening({
      repositoryRoot: REPOSITORY_ROOT,
      sourceOverrides,
      browserEvidenceOverride: evidence,
    });

  // The artifact names the retired subject; no active budget carries it.
  assert.equal("spatialSpecBundleGzipBytes" in structural.artifact.allocationBudgets, false);
  assert.equal(structural.artifact.allocationBudgets.spatialHostBundleGzipBytes, 7_800);
  assert.equal(structural.artifact.allocationBudgets.particleBundleGzipBytes, 16_384);
  assert.deepEqual(
    structural.artifact.retiredSubjects.map(({ subject, liveHost, retiredBy, disposition }) => ({
      subject,
      liveHost,
      retiredBy,
      disposition,
    })),
    [
      {
        subject: "./spatial/spec",
        liveHost: "./spatial",
        retiredBy: "d2edce40d22b1715523e46f127da77371318a65f",
        disposition: "retired-not-measured",
      },
    ]
  );

  // A current-shape live capture has no retired measurement and is reported as such.
  const current = run(live);
  assert.doesNotMatch(current.errors.join("\n"), /spatial\/spec|Spatial host bundle|Particle bundle/u);
  assert.deepEqual(
    current.artifact.checks.realBrowserPerformanceAndBundle.summary.retiredBundleSubjects,
    [{ subject: "./spatial/spec", disposition: "retired-not-measured", recordedGzipBytes: null }]
  );

  // Re-measuring the retired subject live -- with its historical 1_097 bytes, with null, or
  // with the live host's own number -- is refused, never admitted under an old ceiling.
  for (const value of [1_097, null, 7_064, 0]) {
    const result = run(
      withBundle(live, { ...live.assertions.bundle, spatialSpecGzipBytes: value })
    );
    assert.equal(result.ok, false, `spatialSpecGzipBytes=${value} must fail`);
    assert.match(
      result.errors.join("\n"),
      /\.\/spatial\/spec was retired by d2edce40d \(RET-01-E\)/u
    );
  }

  // The live host and Particle budgets stay active: a missing or over-ceiling
  // measurement fails; the retired subject's absence is not a pass for either.
  const { spatialHostGzipBytes: _host, ...noHost } = live.assertions.bundle;
  const { particleGzipBytes: _particle, ...noParticle } = live.assertions.bundle;
  for (const [label, bundle, pattern] of [
    ["host missing", noHost, /Spatial host bundle exceeds its gzip ceiling/u],
    ["host null", { ...live.assertions.bundle, spatialHostGzipBytes: null }, /Spatial host bundle/u],
    ["host over", { ...live.assertions.bundle, spatialHostGzipBytes: 7_801 }, /Spatial host bundle/u],
    ["particle missing", noParticle, /Particle bundle exceeds its gzip ceiling/u],
    ["particle over", { ...live.assertions.bundle, particleGzipBytes: 16_385 }, /Particle bundle/u],
    ["dirty build", { ...live.assertions.bundle, cleanBuild: false }, /same clean producer build/u],
  ]) {
    const result = run(withBundle(live, bundle));
    assert.equal(result.ok, false, `${label} must fail`);
    assert.match(result.errors.join("\n"), pattern, label);
  }
  const noBundle = run(withBundle(live, undefined));
  assert.equal(noBundle.ok, false);
  assert.match(noBundle.errors.join("\n"), /same clean producer build/u);
  assert.deepEqual(
    noBundle.artifact.checks.realBrowserPerformanceAndBundle.summary.retiredBundleSubjects,
    []
  );
});

test("the superseded receipt keeps its historical 1097-byte spec measurement as receipt-only evidence", () => {
  const structural = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
  });
  const bytes = readFileSync(resolve(REPOSITORY_ROOT, SEALED_RECEIPT_PATH));
  const receipt = JSON.parse(bytes.toString("utf8"));
  assert.equal(receipt.assertions.bundle.spatialSpecGzipBytes, 1_097);
  const exactRecord = {
    obligations: [
      {
        id: "fixture/sealed-receipt-held-open",
        receiptSha256: createHash("sha256").update(bytes).digest("hex"),
        recordedFingerprint: receipt.sourceFingerprint,
        liveFingerprint: structural.artifact.sourceFingerprint,
        ownerLot: "C1",
        resolution: "RECAPTURE_INTO_A_LIVE_OWNER",
        rosterDriftSinceReceipt: {
          pathMovedContentIdentical: [],
          pathMovedAndContentChanged: [],
          contentChangedInPlace: [],
          unchanged: 14,
          rosterSize: 14,
        },
      },
    ],
  };
  const held = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    supersessionObligationsOverride: exactRecord,
  });
  assert.doesNotMatch(held.errors.join("\n"), /spatial\/spec|source fingerprint is stale/u);
  assert.match(held.pending.join("\n"), /fixture\/sealed-receipt-held-open/u);
  assert.equal(held.artifact.checks.realBrowserPerformanceAndBundle.status === "pass", false);
  assert.deepEqual(
    held.artifact.checks.realBrowserPerformanceAndBundle.summary.retiredBundleSubjects,
    [{ subject: "./spatial/spec", disposition: "historical-receipt-only", recordedGzipBytes: 1_097 }]
  );

  // Without the exact record the receipt is not historical evidence, so its spec
  // number is a live measurement of a retired subject and is refused.
  const unrecorded = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    supersessionObligationsOverride: { obligations: [] },
  });
  assert.match(unrecorded.errors.join("\n"), /source fingerprint is stale/u);
  assert.match(unrecorded.errors.join("\n"), /\.\/spatial\/spec was retired/u);
});

test("the retired-subject helpers fail closed in both directions", () => {
  assert.deepEqual(
    auditRetiredBundleSubjects({ bundle: { spatialSpecGzipBytes: 1_097 }, historical: true }),
    {
      errors: [],
      subjects: [
        { subject: "./spatial/spec", disposition: "historical-receipt-only", recordedGzipBytes: 1_097 },
      ],
    }
  );
  for (const bundle of [{}, { spatialSpecGzipBytes: null }, { spatialSpecGzipBytes: 1_301 }, { spatialSpecGzipBytes: 0 }]) {
    const result = auditRetiredBundleSubjects({ bundle, historical: true });
    assert.match(result.errors.join("\n"), /historical \.\/spatial\/spec measurement is missing/u);
    assert.deepEqual(result.subjects, []);
  }
  assert.deepEqual(auditRetiredBundleSubjects({ bundle: {}, historical: false }), {
    errors: [],
    subjects: [{ subject: "./spatial/spec", disposition: "retired-not-measured", recordedGzipBytes: null }],
  });
  const undef = auditRetiredBundleSubjects({
    bundle: { spatialSpecGzipBytes: undefined },
    historical: false,
  });
  assert.match(undef.errors.join("\n"), /must not measure it/u);
  assert.deepEqual(undef.subjects, []);

  const exportsPath = resolve(REPOSITORY_ROOT, "packages/core/package.json");
  const exportsMap = JSON.parse(readFileSync(exportsPath, "utf8")).exports;
  assert.deepEqual(auditRetiredSubjectExports(exportsMap), []);
  assert.match(
    auditRetiredSubjectExports({ ...exportsMap, "./spatial/spec": {} }).join("\n"),
    /\.\/spatial\/spec is published again/u
  );
  const { "./spatial": _host, ...withoutHost } = exportsMap;
  assert.match(
    auditRetiredSubjectExports(withoutHost).join("\n"),
    /\.\/spatial is no longer published/u
  );
  assert.deepEqual(auditRetiredSubjectExports(undefined), ["package exports are unreadable"]);
});

test("the gate itself refuses a republished ./spatial/spec and a lost ./spatial host", () => {
  const packageJsonPath = "packages/core/package.json";
  const manifest = JSON.parse(
    readFileSync(resolve(REPOSITORY_ROOT, packageJsonPath), "utf8")
  );
  const baseline = auditCra15RuntimeHardening({ repositoryRoot: REPOSITORY_ROOT });
  const exportPatterns = /\.\/spatial\/spec is published again|\.\/spatial is no longer published/u;
  assert.doesNotMatch(baseline.errors.join("\n"), exportPatterns);
  const runWithExports = (exports) =>
    auditCra15RuntimeHardening({
      repositoryRoot: REPOSITORY_ROOT,
      sourceOverrides: new Map([
        [packageJsonPath, `${JSON.stringify({ ...manifest, exports }, null, 2)}\n`],
      ]),
    });

  const { "./spatial": host, ...withoutHost } = manifest.exports;
  const republished = runWithExports({ ...manifest.exports, "./spatial/spec": host });
  assert.equal(republished.ok, false);
  assert.match(republished.errors.join("\n"), /\.\/spatial\/spec is published again/u);
  assert.doesNotMatch(republished.errors.join("\n"), /\.\/spatial is no longer published/u);
  assert.equal(republished.artifact.package, baseline.artifact.package);
  assert.equal(republished.artifact.sourceFingerprint, baseline.artifact.sourceFingerprint);

  const hostLost = runWithExports(withoutHost);
  assert.equal(hostLost.ok, false);
  assert.match(hostLost.errors.join("\n"), /\.\/spatial is no longer published/u);
  assert.doesNotMatch(hostLost.errors.join("\n"), /\.\/spatial\/spec is published again/u);

  const both = runWithExports({ ...withoutHost, "./spatial/spec": host });
  assert.match(both.errors.join("\n"), /\.\/spatial\/spec is published again/u);
  assert.match(both.errors.join("\n"), /\.\/spatial is no longer published/u);
});

test("a fresh on-disk receipt with no open record is live, so its 1097-byte spec measurement is refused", () => {
  const structural = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
  });
  const live = structural.artifact.sourceFingerprint;
  const sourceOverrides = new Map([[REPORT_PATH, REPORT_SOURCE]]);
  const noRecord = { obligations: [] };
  const fresh = liveBrowserEvidence(structural);
  const freshWithSpec = withBundle(fresh, {
    ...fresh.assertions.bundle,
    spatialSpecGzipBytes: 1_097,
  });
  const onDisk = (receipt) => `${JSON.stringify(receipt, null, 2)}\n`;

  // The supersession verdict for this coordinate is exactly {errors:[], pending:[]}.
  assert.deepEqual(
    resolveSupersededReceipt({
      obligations: noRecord,
      receiptSha256: createHash("sha256").update(onDisk(freshWithSpec)).digest("hex"),
      recorded: live,
      live,
      rosterSize: 14,
    }),
    { errors: [], pending: [] }
  );

  const run = (receipt) =>
    auditCra15RuntimeHardening({
      repositoryRoot: REPOSITORY_ROOT,
      sourceOverrides,
      supersessionObligationsOverride: noRecord,
      sealedReceiptSourceOverride: onDisk(receipt),
    });

  const refused = run(freshWithSpec);
  const refusedErrors = refused.errors.join("\n");
  assert.doesNotMatch(refusedErrors, /source fingerprint is stale|supersession record/u);
  assert.doesNotMatch(refused.pending.join("\n"), /sealed browser receipt is superseded/u);
  assert.equal(refused.ok, false);
  assert.match(
    refusedErrors,
    /\.\/spatial\/spec was retired by d2edce40d \(RET-01-E\); a live capture must not measure it \(spatialSpecGzipBytes present\)/u
  );
  assert.doesNotMatch(refusedErrors, /historical \.\/spatial\/spec measurement/u);
  assert.deepEqual(
    refused.artifact.checks.realBrowserPerformanceAndBundle.summary.retiredBundleSubjects,
    []
  );

  const admitted = run(fresh);
  assert.doesNotMatch(
    admitted.errors.join("\n"),
    /spatial\/spec|source fingerprint is stale|supersession record|Spatial host bundle|Particle bundle/u
  );
  assert.deepEqual(
    admitted.artifact.checks.realBrowserPerformanceAndBundle.summary.retiredBundleSubjects,
    [{ subject: "./spatial/spec", disposition: "retired-not-measured", recordedGzipBytes: null }]
  );

  assert.throws(
    () =>
      auditCra15RuntimeHardening({
        repositoryRoot: REPOSITORY_ROOT,
        browserEvidenceOverride: fresh,
        sealedReceiptSourceOverride: onDisk(fresh),
      }),
    /either a caller fixture or the on-disk receipt source, not both/u
  );
});
