import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  auditCra15RuntimeHardening,
  resolveCra15GateDisposition,
} from "./cra-15-runtime-hardening-gate.mjs";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../../..");

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
  assert.equal(
    first.artifact.checks.realBrowserPerformanceAndBundle.status,
    "pending"
  );
  assert.match(first.pending.join("\n"), /Phase 2C remains locked/u);
  assert.match(first.pending.join("\n"), /completion evidence is missing/u);
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
