#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { auditEffectProvenance } from "../../../../../../../scripts/check/effects/index.mjs";
import { checkCanvasSinkCensus } from "../canvas-sink-census/index.mjs";
import {
  packageRoot as findPackageRoot,
  repoRoot as findRepoRoot,
} from "../../../../libraries/repo-root/index.mjs";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PACKAGE_ROOT = findPackageRoot(SCRIPT_DIRECTORY);
const DEFAULT_REPOSITORY_ROOT = findRepoRoot(SCRIPT_DIRECTORY);
const DEFAULT_ARTIFACT_PATH = resolve(
  DEFAULT_REPOSITORY_ROOT,
  "test-artifacts/craft/cra-15/certification.json"
);
const LIVE_RECEIPT_PATH =
  "test-artifacts/craft/cra-15/live-browser-receipt.json";
const SEALED_RECEIPT_PATH = "test-artifacts/craft/cra-15/browser-evidence.json";
const SUPERSESSION_OBLIGATIONS_PATH = resolve(
  SCRIPT_DIRECTORY,
  "obligations/index.json"
);

const COMPLETION_BROWSER_LIMITS = Object.freeze({
  maxConcurrentContinuousRuntimes: 1,
  maxLongTaskMs: 50,
  maxParticleDpr: 2,
  maxParticleCount: 1_200,
  maxParticlePixels: 4_194_304,
  maxParticleBundleGzipBytes: 16_384,
  maxSpatialDpr: 1.5,
  maxSpatialDimension: 2_560,
  maxSpatialPixels: 4_194_304,
  maxSpatialHostBundleGzipBytes: 7_800,
  maxSuspendedRafCallbacks: 0,
});

// A retired subject is no longer published, so no live capture may measure it; only the
// sealed, superseded receipt keeps its historical number, bounded by the ceiling it was captured under.
const RETIRED_BUNDLE_SUBJECTS = Object.freeze([
  Object.freeze({
    subject: "./spatial/spec",
    evidenceField: "spatialSpecGzipBytes",
    liveHost: "./spatial",
    retiredBy: "d2edce40d22b1715523e46f127da77371318a65f",
    retirementLot: "RET-01-E",
    disposition: "retired-not-measured",
    historicalCeilingGzipBytes: 1_300,
  }),
]);

const REQUIRED_FALLBACK_POLICIES = Object.freeze([
  "reduced-motion",
  "coarse-pointer",
  "save-data",
  "unsupported",
]);

const REQUIRED_SOURCE_ASSERTIONS = Object.freeze([
  Object.freeze({
    path: "packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/foundation/contracts/index.ts",
    label: "one shared continuous graphics budget",
    patterns: [
      /maxActiveTotal:\s*1/u,
      /'decorative-2d':\s*1/u,
      /'immersive-spatial':\s*1/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/graphics/motion/react/presentation/effects/particles/runtime/canvas/governance/animation-lease/index.ts",
    label: "Particle adapter delegates to the shared governor",
    patterns: [
      /acquireContinuousGraphicsRuntimeLease/u,
      /runtimeClass:\s*'decorative-2d'/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/infrastructure/runtime/spatial/admission/browser/context-lease/index.ts",
    label: "Spatial adapter delegates to the shared governor",
    patterns: [
      /acquireContinuousGraphicsRuntimeLease/u,
      /runtimeClass:\s*'immersive-spatial'/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/infrastructure/runtime/effects/catalog/registry/index.ts",
    label: "ParticleField remains the sole measured certification",
    patterns: [
      /id:\s*'particle-field'[\s\S]*?admission:\s*'certified'/u,
      /bundleBudgetGzipBytes:\s*16_384/u,
      /maxContinuousLoops:\s*1/u,
      /runtimeControl:\s*'provider-and-instance'/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/infrastructure/runtime/effects/composition/react/provider/index.tsx",
    label: "DS-owned provider and instance runtime control",
    patterns: [
      /parent\.enabled\s*&&\s*locallyEnabled/u,
      /instanceEnabled\s*\?\?\s*true/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/components/primitives/display/qr-code/runtime/encoded-symbol/index.tsx",
    label: "standards QR encoder honors output type and correction level",
    patterns: [/<AntQRCode/u, /type=\{type\}/u, /errorLevel=\{errorLevel\}/u],
  }),
  Object.freeze({
    path: "packages/core/src/components/primitives/overlay/watermark/runtime/canvas-pattern/index.ts",
    label: "Watermark allocation and stale image lifecycle are bounded",
    patterns: [
      /maxDpr:\s*2/u,
      /maxPixels:\s*4_194_304/u,
      /pendingImage\.onload\s*=\s*null/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/components/patterns/visualization/charts/runtime/exporting/foundation/file/index.ts",
    label: "chart PNG allocation is bounded before Canvas creation",
    patterns: [
      /maxDimension:\s*8_192/u,
      /maxPixels:\s*16_777_216/u,
      /resolvePngRasterPlan/u,
    ],
  }),
  Object.freeze({
    path: "packages/showroom/e2e/responsive/particle-runtime.spec.ts",
    label: "Particle real-browser lifecycle matrix",
    patterns: [
      /contextlost/u,
      /reducedMotion/u,
      /hasTouch/u,
      /MAX_PARTICLES\s*=\s*1_200/u,
      /MAX_DPR\s*=\s*2/u,
      /MAX_PIXELS\s*=\s*4_194_304/u,
      /maxCallbackMs\)\.toBeLessThan\(50\)/u,
    ],
  }),
  Object.freeze({
    path: "packages/showroom/e2e/responsive/spatial-runtime.spec.ts",
    label: "Spatial real-browser lifecycle matrix",
    patterns: [
      /webglcontextlost/u,
      /saveData/u,
      /webgl2-unsupported/u,
      /MAX_DPR\s*=\s*1\.5/u,
      /MAX_PIXELS\s*=\s*4_194_304/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/graphics/motion/react/presentation/effects/particles/runtime/canvas/tests/ParticleField.test.tsx",
    label: "Particle unit lifecycle and isolation contracts",
    patterns: [
      /schedules zero RAF when %s/u,
      /cancels on context loss, restores deterministically, and cleans every source once/u,
      /without leaking color across roots/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/infrastructure/runtime/spatial/presentation/experience/tests/SpatialExperience.test.tsx",
    label: "Spatial unit lifecycle and accessibility contracts",
    patterns: [
      /revokes stale scene callbacks across offscreen and document-hidden lifecycles/u,
      /disconnects observers\/listeners and ignores a loader that settles after rapid unmount/u,
      /denies probing and loading for phone, coarse, constrained, hidden and offscreen hosts/u,
      /requires controls and an equivalent alternative for interactive scenes/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/infrastructure/runtime/foundation/motion/sensing/browser/environment/tests/motion-environment-store.test.ts",
    label:
      "Shared background, coarse-pointer and save-data lifecycle contracts",
    patterns: [
      /network\.emit\(\{ saveData: true \}\)/u,
      /setVisibility\('hidden'\)/u,
      /removeDocumentListener\.mock\.calls\.filter\(\(\[type\]\) => type === 'visibilitychange'\)/u,
    ],
  }),
  Object.freeze({
    path: "packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/runtime/admission/tests/particle-spatial-adapters.integration.test.ts",
    label: "Particle and Spatial share the same one-runtime admission budget",
    patterns: [
      /never grants the Particle RAF and Spatial context leases simultaneously/u,
      /getParticleAnimationLeaseCount\(\) \+ getSpatialContextLeaseCount\(\)/u,
    ],
  }),
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sourceReader(repositoryRoot, overrides) {
  return (relativePath) => {
    if (overrides?.has(relativePath)) return overrides.get(relativePath);
    return readFileSync(resolve(repositoryRoot, relativePath), "utf8");
  };
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function auditRoadmapAuthority(repositoryRoot) {
  const errors = [];
  const pending = [];
  let registry;
  try {
    registry = JSON.parse(
      readFileSync(resolve(repositoryRoot, "roadmap/registry.json"), "utf8")
    );
  } catch (error) {
    return {
      errors: [`roadmap registry is unreadable (${String(error)})`],
      pending,
      snapshot: null,
    };
  }

  const workOrders = Array.isArray(registry.workOrders)
    ? registry.workOrders
    : [];
  const workOrder = workOrders.find(({ id }) => id === "WO-CRA-15");
  const dependencies = [
    "WO-GAT-05",
    "WO-GAT-06",
    "WO-CRA-12",
    "WO-CRA-13",
    "WO-CRA-14",
    "WO-RET-01",
  ];
  if (!workOrder) {
    errors.push("roadmap registry lost WO-CRA-15");
  } else {
    if (workOrder.phase !== "6") errors.push("WO-CRA-15 phase must be 6");
    if (JSON.stringify(workOrder.dependsOn) !== JSON.stringify(dependencies)) {
      errors.push("WO-CRA-15 dependency authority drifted");
    }
  }

  const dependencyState = Object.fromEntries(
    dependencies.map((id) => {
      const dependency = workOrders.find((candidate) => candidate.id === id);
      if (!dependency) errors.push(`roadmap registry lost ${id}`);
      else if (dependency.status !== "done")
        pending.push(`${id} is ${dependency.status}, not done`);
      return [id, dependency?.status ?? "missing"];
    })
  );

  const phase =
    registry.traceability?.["ds-improvements"]?.phaseControls?.["6"];
  if (!isRecord(phase) || !isRecord(phase.ownerGo)) {
    errors.push("roadmap registry lost the structured Phase 6 control");
  } else if (phase.claimState !== "open" || phase.ownerGo.decision !== "go") {
    pending.push("Phase 6 remains locked without structured owner GO");
  }

  return {
    errors,
    pending,
    snapshot: Object.freeze({
      workOrderStatus: workOrder?.status ?? "missing",
      phase: workOrder?.phase ?? "missing",
      dependencyState: Object.freeze(dependencyState),
      claimState: phase?.claimState ?? "missing",
      ownerGo: phase?.ownerGo?.decision ?? "missing",
    }),
  };
}

function readSupersessionObligations(errors) {
  if (!existsSync(SUPERSESSION_OBLIGATIONS_PATH)) return { obligations: [] };
  try {
    return JSON.parse(readFileSync(SUPERSESSION_OBLIGATIONS_PATH, "utf8"));
  } catch (error) {
    errors.push(`supersession record is not valid JSON (${String(error)})`);
    return null;
  }
}

function receiptBytes(sourceOverride, path) {
  if (sourceOverride !== undefined)
    return sourceOverride === null ? null : Buffer.from(sourceOverride);
  return existsSync(path) ? readFileSync(path) : null;
}

/**
 * The sealed receipt proves what a real browser measured then and certifies nothing now. One
 * closed record pins its bytes and coordinate; no record may hold any receipt open.
 */
function auditSealedReceipt({ obligations, sealedBytes }) {
  const errors = [];
  const open = Array.isArray(obligations?.obligations)
    ? obligations.obligations
    : [];
  if (open.length > 0) {
    errors.push(
      "an open supersession record authorises nothing, so no receipt can be held open: " +
        open.map((entry) => entry?.id ?? "<unnamed>").join(", ")
    );
  }
  const records = (
    Array.isArray(obligations?.closed) ? obligations.closed : []
  ).filter((entry) => entry?.receiptPath === SEALED_RECEIPT_PATH);
  if (records.length !== 1) {
    errors.push(
      records.length === 0
        ? `no closed record accounts for the sealed receipt at ${SEALED_RECEIPT_PATH}`
        : `${records.length} closed records claim the sealed receipt; exactly one may`
    );
    return { errors, record: null };
  }

  const [record] = records;
  if (sealedBytes === null) {
    errors.push(
      "the sealed browser receipt is missing; it is historical evidence and must not be removed"
    );
    return { errors, record: null };
  }
  if (sha256(sealedBytes) !== record.receiptSha256) {
    errors.push(
      "the sealed browser receipt moved; it is historical evidence and must not be rewritten"
    );
    return { errors, record: null };
  }
  try {
    const sealed = JSON.parse(sealedBytes.toString("utf8"));
    if (sealed?.sourceFingerprint !== record.recordedFingerprint) {
      errors.push(
        "the sealed browser receipt no longer records its closed coordinate"
      );
    }
    errors.push(
      ...auditRetiredBundleSubjects({
        bundle: sealed?.assertions?.bundle,
        historical: true,
      }).errors
    );
  } catch (error) {
    errors.push(
      `the sealed browser receipt is not valid JSON (${String(error)})`
    );
  }
  return { errors, record };
}

function missingLiveReceipt(sealedRecord) {
  const owed =
    sealedRecord === null
      ? ""
      : `; the sealed browser receipt is superseded and certifies nothing live, and ` +
        `${sealedRecord.id} left ${sealedRecord.resolution} to ${sealedRecord.ownerLot}`;
  return (
    `completion evidence is missing: no live receipt at ${LIVE_RECEIPT_PATH}; extend/run the ` +
    "current production-build Particle and Spatial probes with recorded zero suspended RAF, " +
    `long-task, rapid-cleanup and clean-bundle results${owed}`
  );
}

export function auditRetiredSubjectExports(exports) {
  const errors = [];
  if (!isRecord(exports)) return ["package exports are unreadable"];
  for (const retired of RETIRED_BUNDLE_SUBJECTS) {
    if (Object.hasOwn(exports, retired.subject))
      errors.push(
        `${retired.subject} is published again; its retired disposition is false`
      );
    if (!Object.hasOwn(exports, retired.liveHost))
      errors.push(
        `${retired.liveHost} is no longer published; the live host it was retired beside is gone`
      );
  }
  return errors;
}

export function auditRetiredBundleSubjects({ bundle, historical }) {
  const errors = [];
  const subjects = [];
  for (const retired of RETIRED_BUNDLE_SUBJECTS) {
    const present =
      isRecord(bundle) && Object.hasOwn(bundle, retired.evidenceField);
    const value = present ? bundle[retired.evidenceField] : undefined;
    if (historical) {
      if (
        !Number.isInteger(value) ||
        value <= 0 ||
        value > retired.historicalCeilingGzipBytes
      ) {
        errors.push(
          `the superseded receipt's historical ${retired.subject} measurement is missing or outside the ceiling it was captured under`
        );
        continue;
      }
      subjects.push(
        Object.freeze({
          subject: retired.subject,
          disposition: "historical-receipt-only",
          recordedGzipBytes: value,
        })
      );
    } else if (present) {
      errors.push(
        `${retired.subject} was retired by ${retired.retiredBy.slice(0, 9)} (${
          retired.retirementLot
        }); ` +
          `a live capture must not measure it (${retired.evidenceField} present)`
      );
    } else {
      subjects.push(
        Object.freeze({
          subject: retired.subject,
          disposition: retired.disposition,
          recordedGzipBytes: null,
        })
      );
    }
  }
  return { errors, subjects: Object.freeze(subjects) };
}

function auditBrowserEvidence({
  evidence,
  missingEvidence,
  packageIdentity,
  readSource,
  sourceFingerprint,
}) {
  const errors = [];
  const pending = [];
  let retiredSubjects = Object.freeze([]);
  if (evidence === null) {
    pending.push(missingEvidence);
    return { errors, pending, summary: null };
  }
  if (!isRecord(evidence)) {
    return {
      errors: ["browser evidence must be a JSON object"],
      pending,
      summary: null,
    };
  }

  if (evidence.schemaVersion !== 1)
    errors.push("browser evidence schemaVersion must be 1");
  if (evidence.workOrder !== "WO-CRA-15")
    errors.push("browser evidence workOrder must be WO-CRA-15");
  if (evidence.package !== packageIdentity) {
    errors.push(`browser evidence package must be ${packageIdentity}`);
  }
  if (evidence.sourceFingerprint !== sourceFingerprint) {
    errors.push("browser evidence source fingerprint is stale");
  }

  const runner = evidence.runner;
  if (!isRecord(runner) || runner.productionBuild !== true) {
    errors.push("browser evidence must come from a production build");
  }
  if (!isRecord(runner) || runner.browserName !== "chromium") {
    errors.push("browser evidence must identify the governed Chromium runner");
  }
  if (
    !isRecord(runner) ||
    typeof runner.browserVersion !== "string" ||
    runner.browserVersion === ""
  ) {
    errors.push("browser evidence must record a browser version");
  }

  const report = evidence.report;
  if (!isRecord(report)) {
    errors.push("browser evidence must reference the raw Playwright report");
  } else {
    if (
      typeof report.path !== "string" ||
      report.path.includes("..") ||
      !/^test-artifacts\/craft\/cra-15\/[a-z0-9./_-]+\.json$/u.test(report.path)
    ) {
      errors.push(
        "browser report path must stay beneath test-artifacts/craft/cra-15"
      );
    } else {
      try {
        const rawReport = readSource(report.path);
        if (sha256(rawReport) !== report.sha256)
          errors.push("browser report SHA-256 drifted");
      } catch (error) {
        errors.push(`browser report is unreadable (${String(error)})`);
      }
    }
    if (!/^[a-f0-9]{64}$/u.test(report.sha256 ?? "")) {
      errors.push(
        "browser report SHA-256 must be a lowercase 64-character hex digest"
      );
    }
    if (
      !Number.isInteger(report.passed) ||
      report.passed < 5 ||
      report.failed !== 0
    ) {
      errors.push(
        "browser report must record at least five passing focal tests and zero failures"
      );
    }
  }

  const assertions = evidence.assertions;
  if (!isRecord(assertions)) {
    errors.push("browser evidence assertions are missing");
    return { errors, pending, summary: null };
  }
  if (
    assertions.providerColorIsolation !== true ||
    assertions.distinctProviderColors !== 2
  ) {
    errors.push("two provider roots must retain two distinct resolved colors");
  }
  if (
    assertions.maxConcurrentContinuousRuntimes !==
    COMPLETION_BROWSER_LIMITS.maxConcurrentContinuousRuntimes
  ) {
    errors.push(
      "browser evidence must exercise and retain exactly one runtime/context"
    );
  }
  if (
    assertions.maxSuspendedRafCallbacks !==
    COMPLETION_BROWSER_LIMITS.maxSuspendedRafCallbacks
  ) {
    errors.push(
      "hidden/offscreen/background work did not reach zero RAF callbacks"
    );
  }
  if (
    !isFiniteNumber(assertions.maxLongTaskMs) ||
    assertions.maxLongTaskMs < 0 ||
    assertions.maxLongTaskMs > COMPLETION_BROWSER_LIMITS.maxLongTaskMs
  ) {
    errors.push("browser evidence exceeds the recorded long-task ceiling");
  }
  if (assertions.rapidMountUnmountCleanup !== true) {
    errors.push("rapid mount/unmount cleanup is not certified");
  }

  const bundle = assertions.bundle;
  if (!isRecord(bundle) || bundle.cleanBuild !== true) {
    errors.push("bundle evidence must come from the same clean producer build");
  } else {
    if (
      !Number.isInteger(bundle.particleGzipBytes) ||
      bundle.particleGzipBytes <= 0 ||
      bundle.particleGzipBytes >
        COMPLETION_BROWSER_LIMITS.maxParticleBundleGzipBytes
    )
      errors.push("Particle bundle exceeds its gzip ceiling");
    if (
      !Number.isInteger(bundle.spatialHostGzipBytes) ||
      bundle.spatialHostGzipBytes <= 0 ||
      bundle.spatialHostGzipBytes >
        COMPLETION_BROWSER_LIMITS.maxSpatialHostBundleGzipBytes
    )
      errors.push("Spatial host bundle exceeds its gzip ceiling");
    const retired = auditRetiredBundleSubjects({ bundle, historical: false });
    errors.push(...retired.errors);
    retiredSubjects = retired.subjects;
  }

  const particle = assertions.particle;
  if (!isRecord(particle)) {
    errors.push("Particle browser assertions are missing");
  } else {
    if (
      !isFiniteNumber(particle.maxDpr) ||
      particle.maxDpr <= 0 ||
      particle.maxDpr > COMPLETION_BROWSER_LIMITS.maxParticleDpr
    ) {
      errors.push("Particle DPR exceeds its browser ceiling");
    }
    if (
      !Number.isInteger(particle.maxCount) ||
      particle.maxCount <= 0 ||
      particle.maxCount > COMPLETION_BROWSER_LIMITS.maxParticleCount
    ) {
      errors.push("Particle count exceeds its browser ceiling");
    }
    if (
      !Number.isInteger(particle.maxPixels) ||
      particle.maxPixels <= 0 ||
      particle.maxPixels > COMPLETION_BROWSER_LIMITS.maxParticlePixels
    ) {
      errors.push("Particle backing pixels exceed their browser ceiling");
    }
    if (
      particle.contextLossRecovered !== true ||
      particle.cleanupPassed !== true
    ) {
      errors.push("Particle context-loss recovery and cleanup must both pass");
    }
  }

  const spatial = assertions.spatial;
  if (!isRecord(spatial)) {
    errors.push("Spatial browser assertions are missing");
  } else {
    if (
      !isFiniteNumber(spatial.maxDpr) ||
      spatial.maxDpr <= 0 ||
      spatial.maxDpr > COMPLETION_BROWSER_LIMITS.maxSpatialDpr
    ) {
      errors.push("Spatial DPR exceeds its browser ceiling");
    }
    if (
      !Number.isInteger(spatial.maxDimension) ||
      spatial.maxDimension <= 0 ||
      spatial.maxDimension > COMPLETION_BROWSER_LIMITS.maxSpatialDimension
    ) {
      errors.push("Spatial backing dimension exceeds its browser ceiling");
    }
    if (
      !Number.isInteger(spatial.maxPixels) ||
      spatial.maxPixels <= 0 ||
      spatial.maxPixels > COMPLETION_BROWSER_LIMITS.maxSpatialPixels
    ) {
      errors.push("Spatial backing pixels exceed their browser ceiling");
    }
    if (
      spatial.contextLossRecovered !== true ||
      spatial.cleanupPassed !== true
    ) {
      errors.push("Spatial context-loss recovery and cleanup must both pass");
    }
  }

  const fallbacks = assertions.fallbackPolicies;
  for (const policy of REQUIRED_FALLBACK_POLICIES) {
    if (!isRecord(fallbacks) || fallbacks[policy] !== true) {
      errors.push(`meaningful accessible ${policy} fallback is not certified`);
    }
  }

  return {
    errors,
    pending,
    summary: Object.freeze({
      reportSha256: report?.sha256 ?? null,
      passedTests: report?.passed ?? 0,
      browser: runner?.browserVersion ?? null,
      maxLongTaskMs: assertions.maxLongTaskMs ?? null,
      maxSuspendedRafCallbacks: assertions.maxSuspendedRafCallbacks ?? null,
      retiredBundleSubjects: retiredSubjects,
    }),
  };
}

export function resolveCra15GateDisposition({ mode, errors, pending }) {
  const structurallyPassed = errors.length === 0;
  const completionEligible = structurallyPassed && pending.length === 0;
  return Object.freeze({
    passed: mode === "structural" ? structurallyPassed : completionEligible,
    structurallyPassed,
    completionEligible,
  });
}

export function auditCra15RuntimeHardening({
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  packageRoot = resolve(repositoryRoot, "packages/core"),
  sourceOverrides,
  browserEvidenceOverride,
  liveReceiptSourceOverride,
  supersessionObligationsOverride,
  sealedReceiptSourceOverride,
} = {}) {
  const errors = [];
  const pending = [];
  const readSource = sourceReader(repositoryRoot, sourceOverrides);
  const fingerprintParts = [];

  for (const assertion of REQUIRED_SOURCE_ASSERTIONS) {
    let source;
    try {
      source = readSource(assertion.path);
    } catch (error) {
      errors.push(
        `${assertion.label}: missing ${assertion.path} (${String(error)})`
      );
      continue;
    }
    fingerprintParts.push(`${assertion.path}\0${source}`);
    for (const pattern of assertion.patterns) {
      if (!pattern.test(source)) {
        errors.push(
          `${assertion.label}: ${assertion.path} lost ${String(pattern)}`
        );
      }
    }
  }
  const sourceErrorCount = errors.length;

  let canvasCensus = null;
  try {
    canvasCensus = checkCanvasSinkCensus(packageRoot);
    if (!canvasCensus.ok) {
      errors.push(
        `Canvas sink census drifted: unknown=${canvasCensus.unknown.length}, ` +
          `missing=${canvasCensus.missing.length}, changed=${canvasCensus.changed.length}`
      );
    }
  } catch (error) {
    errors.push(`Canvas sink census threw: ${String(error)}`);
  }

  let effectProvenance = null;
  try {
    effectProvenance = auditEffectProvenance(
      resolve(packageRoot, "governance/effects"),
      resolve(
        packageRoot,
        "src/infrastructure/runtime/effects/catalog/registry/index.ts"
      )
    );
  } catch (error) {
    errors.push(`Effect provenance failed: ${String(error)}`);
  }

  const packageJson = JSON.parse(
    readSource(relative(repositoryRoot, resolve(packageRoot, "package.json")))
  );
  const packageIdentity = `${packageJson.name}@${packageJson.version}`;
  errors.push(...auditRetiredSubjectExports(packageJson.exports));
  const sourceFingerprint = sha256(fingerprintParts.sort().join("\0\0"));
  const roadmap = auditRoadmapAuthority(repositoryRoot);
  errors.push(...roadmap.errors);
  pending.push(...roadmap.pending);

  if (
    browserEvidenceOverride !== undefined &&
    liveReceiptSourceOverride !== undefined
  )
    throw new TypeError(
      "supply either a caller fixture or the on-disk receipt source, not both"
    );
  let browserEvidence = browserEvidenceOverride ?? null;
  const liveReceiptBytes =
    browserEvidenceOverride === undefined
      ? receiptBytes(
          liveReceiptSourceOverride,
          resolve(repositoryRoot, LIVE_RECEIPT_PATH)
        )
      : null;
  if (liveReceiptBytes !== null) {
    try {
      browserEvidence = JSON.parse(liveReceiptBytes.toString("utf8"));
    } catch (error) {
      errors.push(`browser evidence is not valid JSON (${String(error)})`);
    }
  }
  const sealed = auditSealedReceipt({
    obligations:
      supersessionObligationsOverride ?? readSupersessionObligations(errors),
    sealedBytes: receiptBytes(
      sealedReceiptSourceOverride,
      resolve(repositoryRoot, SEALED_RECEIPT_PATH)
    ),
  });
  const browser = auditBrowserEvidence({
    evidence: browserEvidence,
    missingEvidence: missingLiveReceipt(sealed.record),
    packageIdentity,
    readSource,
    sourceFingerprint,
  });
  const browserErrors = [...sealed.errors, ...browser.errors];
  errors.push(...browserErrors);
  pending.push(...browser.pending);
  if (
    roadmap.snapshot?.workOrderStatus === "done" &&
    (errors.length > 0 || pending.length > 0)
  ) {
    errors.push(
      "WO-CRA-15 is marked done before this final gate is completion-eligible"
    );
  }

  const disposition = resolveCra15GateDisposition({
    mode: "final",
    errors,
    pending,
  });
  const artifact = Object.freeze({
    schemaVersion: 3,
    workOrder: "WO-CRA-15",
    sourceId: "DS-IMP-106",
    scope: "ParticleField plus governed Canvas and WebGL lifecycle hardening",
    package: packageIdentity,
    sourceFingerprint,
    structurallyPassed: disposition.structurallyPassed,
    completionEligible: disposition.completionEligible,
    checks: Object.freeze({
      roadmapAuthority: Object.freeze({
        status:
          roadmap.errors.length > 0
            ? "fail"
            : roadmap.pending.length > 0
            ? "pending"
            : "pass",
        snapshot: roadmap.snapshot,
      }),
      sourceContracts: Object.freeze({
        status: sourceErrorCount > 0 ? "fail" : "pass",
        assertions: REQUIRED_SOURCE_ASSERTIONS.length,
      }),
      canvasCensus: Object.freeze({
        status: canvasCensus?.ok === true ? "pass" : "fail",
        governedSinks: canvasCensus?.actual.length ?? 0,
      }),
      effectProvenance: Object.freeze({
        status: effectProvenance === null ? "fail" : "pass",
        certifiedEffects: effectProvenance?.certifiedDefinitions ?? 0,
      }),
      realBrowserPerformanceAndBundle: Object.freeze({
        status:
          browserErrors.length > 0
            ? "fail"
            : browser.pending.length > 0
            ? "pending"
            : "pass",
        summary: browser.summary,
      }),
    }),
    pending: Object.freeze([...pending]),
    governance: Object.freeze({
      sharedContinuousRuntimeBudget: 1,
      decorative2dBudget: 1,
      immersiveSpatialBudget: 1,
      runtimeControl: "provider-and-instance",
      certifiedEffects: effectProvenance?.certifiedDefinitions ?? 0,
      governedCanvasSinks: canvasCensus?.actual.length ?? 0,
    }),
    allocationBudgets: Object.freeze({
      particle: Object.freeze({
        maxDpr: 2,
        maxParticles: 1_200,
        maxPixels: 4_194_304,
      }),
      spatial: Object.freeze({
        maxDpr: 1.5,
        maxDimension: 2_560,
        maxPixels: 4_194_304,
      }),
      watermark: Object.freeze({
        maxDpr: 2,
        maxDimension: 2_048,
        maxPixels: 4_194_304,
      }),
      chartPng: Object.freeze({
        maxScale: 4,
        maxDimension: 8_192,
        maxPixels: 16_777_216,
      }),
      particleBundleGzipBytes: 16_384,
      spatialHostBundleGzipBytes: 7_800,
      longTaskMs: 50,
      suspendedRafCallbacks: 0,
    }),
    retiredSubjects: Object.freeze(
      RETIRED_BUNDLE_SUBJECTS.map((retired) =>
        Object.freeze({
          subject: retired.subject,
          evidenceField: retired.evidenceField,
          liveHost: retired.liveHost,
          retiredBy: retired.retiredBy,
          retirementLot: retired.retirementLot,
          disposition: retired.disposition,
          historicalCeilingGzipBytes: retired.historicalCeilingGzipBytes,
        })
      )
    ),
    requiredBrowserEvidence: Object.freeze([
      "particle: provider color isolation, sole lease, bounded DPR/count/pixels, viewport/background zero RAF, context recovery and meaningful fallback",
      "spatial: sole context, viewport/background zero RAF, bounded backing store, context retry and meaningful reduced/coarse/save-data/unsupported fallback",
      "combined: rapid mount/unmount cleanup, <=50 ms long tasks and clean-build gzip budgets",
    ]),
    intentionallyDeferred: Object.freeze([
      "WebGPU admission",
      "Three/R3F scene supplier adoption",
      "Evento adoption",
      "general app-platform adoption",
    ]),
  });

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    pending: Object.freeze(pending),
    disposition,
    artifact,
    liveReceiptPath: LIVE_RECEIPT_PATH,
  });
}

export function checkCra15CertificationArtifact(
  result,
  artifactPath = DEFAULT_ARTIFACT_PATH
) {
  if (!result.ok) return result.errors;
  if (!existsSync(artifactPath))
    return [`missing certification artifact ${artifactPath}`];
  const expected = stableJson(result.artifact);
  const actual = readFileSync(artifactPath, "utf8");
  return actual === expected
    ? []
    : [
        `certification artifact drifted: ${relative(
          DEFAULT_REPOSITORY_ROOT,
          artifactPath
        )}`,
      ];
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = auditCra15RuntimeHardening();
  const shouldWrite = process.argv.includes("--write");
  const shouldCheck = process.argv.includes("--check");
  const explicitStructural = process.argv.includes("--structural");
  const explicitFinal = process.argv.includes("--final");
  // Artifact generation stays available while evidence is pending. A plain
  // --check (the prepack path) is final and therefore cannot publish a false
  // certification; callers must opt into structural-only diagnostics.
  const mode =
    explicitFinal || (shouldCheck && !shouldWrite && !explicitStructural)
      ? "final"
      : "structural";
  const disposition = resolveCra15GateDisposition({
    mode,
    errors: result.errors,
    pending: result.pending,
  });

  if (!result.ok) {
    throw new Error(
      `WO-CRA-15 runtime hardening gate failed:\n- ${result.errors.join(
        "\n- "
      )}`
    );
  }
  if (shouldWrite) {
    mkdirSync(dirname(DEFAULT_ARTIFACT_PATH), { recursive: true });
    writeFileSync(DEFAULT_ARTIFACT_PATH, stableJson(result.artifact));
  }
  if (shouldCheck) {
    const artifactErrors = checkCra15CertificationArtifact(result);
    if (artifactErrors.length > 0) {
      throw new Error(
        `WO-CRA-15 certification artifact failed:\n- ${artifactErrors.join(
          "\n- "
        )}`
      );
    }
  }
  if (!disposition.passed) {
    throw new Error(
      "WO-CRA-15 is structurally green but not completion-eligible:\n- " +
        result.pending.join("\n- ")
    );
  }

  process.stdout.write(
    `${stableJson({
      ok: disposition.passed,
      mode,
      structurallyPassed: disposition.structurallyPassed,
      completionEligible: disposition.completionEligible,
      workOrder: result.artifact.workOrder,
      package: result.artifact.package,
      sourceFingerprint: result.artifact.sourceFingerprint,
      pending: result.pending,
    })}`
  );
}
