import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  auditCra15RuntimeHardening,
  auditRoadmapAuthority,
} from "../index.mjs";
import { repoRoot as findRepoRoot } from "../../../../../libraries/repo-root/index.mjs";

const REPOSITORY_ROOT = findRepoRoot(import.meta.dirname);
const SEALED_RECEIPT_PATH = "test-artifacts/craft/cra-15/browser-evidence.json";
const SEALED_RECORD_ID =
  "cra-15/browser-receipt-superseded-by-canonical-path-refactor";
const ASSEMBLER_PATH =
  "packages/showroom/e2e/responsive/runtime-hardening/assembler/index.mjs";

test("the roadmap leg follows the approved phase 6 and its structured control", () => {
  const LOCKED = "Phase 6 remains locked without structured owner GO";
  const LOST = "roadmap registry lost the structured Phase 6 control";
  const WRONG_PHASE = "WO-CRA-15 phase must be 6";
  const liveRegistry = readFileSync(
    resolve(REPOSITORY_ROOT, "roadmap/registry.json"),
    "utf8"
  );
  const controlsOf = (registry) =>
    registry.traceability["ds-improvements"].phaseControls;
  const workOrderOf = (registry, id = "WO-CRA-15") =>
    registry.workOrders.find((workOrder) => workOrder.id === id);
  const decide = (control, claimState, decision) => {
    control.claimState = claimState;
    control.ownerGo.decision = decision;
  };
  const run = (mutate) => {
    const registry = JSON.parse(liveRegistry);
    decide(controlsOf(registry)["6"], "locked", "pending");
    mutate?.(registry);
    const root = mkdtempSync(join(tmpdir(), "cra15-roadmap-authority-"));
    try {
      mkdirSync(join(root, "roadmap"));
      writeFileSync(
        join(root, "roadmap/registry.json"),
        JSON.stringify(registry)
      );
      return auditRoadmapAuthority(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  };

  // The live registry carries the approved mapping, whatever its claim state.
  const live = auditRoadmapAuthority(REPOSITORY_ROOT);
  const liveControl = controlsOf(JSON.parse(liveRegistry))["6"];
  assert.deepEqual(live.errors, []);
  assert.equal(live.snapshot.phase, "6");
  assert.equal(live.snapshot.claimState, liveControl.claimState);
  assert.equal(live.snapshot.ownerGo, liveControl.ownerGo.decision);

  const locked = run();
  assert.deepEqual(locked.errors, []);
  assert.deepEqual(locked.pending, [LOCKED]);
  assert.equal(locked.snapshot.claimState, "locked");
  assert.equal(locked.snapshot.ownerGo, "pending");

  const open = run((registry) =>
    decide(controlsOf(registry)["6"], "open", "go")
  );
  assert.deepEqual(open.errors, []);
  assert.deepEqual(open.pending, []);
  assert.equal(open.snapshot.claimState, "open");
  assert.equal(open.snapshot.ownerGo, "go");

  // Both halves of the control are required; neither opens the phase alone.
  for (const [claimState, decision] of [
    ["open", "pending"],
    ["locked", "go"],
  ]) {
    const partial = run((registry) =>
      decide(controlsOf(registry)["6"], claimState, decision)
    );
    assert.deepEqual(partial.errors, [], `${claimState}/${decision}`);
    assert.deepEqual(partial.pending, [LOCKED], `${claimState}/${decision}`);
  }

  // Only the exact pair opens the phase; a malformed half is never admitted.
  for (const [claimState, decision] of [
    ["OPEN", "go"],
    ["open", "GO"],
    ["open ", "go"],
    ["open", "go "],
    [undefined, "go"],
    ["open", undefined],
    [null, "go"],
    ["open", null],
    [true, "go"],
    ["open", true],
  ]) {
    const malformed = run((registry) =>
      decide(controlsOf(registry)["6"], claimState, decision)
    );
    const label = `${String(claimState)}/${String(decision)}`;
    assert.deepEqual(malformed.errors, [], label);
    assert.deepEqual(malformed.pending, [LOCKED], label);
  }

  // The superseded 2C control is not read: opening it opens nothing.
  const staleOpen = run((registry) =>
    decide(controlsOf(registry)["2C"], "open", "go")
  );
  assert.deepEqual(staleOpen.errors, []);
  assert.deepEqual(staleOpen.pending, [LOCKED]);

  // Nor does a GO recorded there stand in for the one Phase 6 needs.
  const staleGo = run((registry) => {
    decide(controlsOf(registry)["6"], "open", "pending");
    controlsOf(registry)["2C"].ownerGo.decision = "go";
  });
  assert.deepEqual(staleGo.errors, []);
  assert.deepEqual(staleGo.pending, [LOCKED]);

  // An open control cannot excuse a wrong phase, and the comparison is exact.
  for (const wrongPhase of ["2C", 6, "6 ", undefined]) {
    const wrong = run((registry) => {
      workOrderOf(registry).phase = wrongPhase;
      decide(controlsOf(registry)["6"], "open", "go");
    });
    assert.deepEqual(wrong.errors, [WRONG_PHASE], String(wrongPhase));
  }

  // A locked control does not defer the check: the error stands beside the lock.
  for (const wrongPhase of ["2C", 6, "6 ", undefined]) {
    const wrong = run((registry) => {
      workOrderOf(registry).phase = wrongPhase;
    });
    assert.deepEqual(wrong.errors, [WRONG_PHASE], String(wrongPhase));
    assert.deepEqual(wrong.pending, [LOCKED], String(wrongPhase));
  }

  for (const [label, mutate] of [
    ["control removed", (registry) => delete controlsOf(registry)["6"]],
    [
      "control not structured",
      (registry) => (controlsOf(registry)["6"] = "open"),
    ],
    ["ownerGo removed", (registry) => delete controlsOf(registry)["6"].ownerGo],
    [
      "ownerGo not structured",
      (registry) => {
        controlsOf(registry)["6"].claimState = "open";
        controlsOf(registry)["6"].ownerGo = "go";
      },
    ],
    [
      "2C open while 6 is removed",
      (registry) => {
        decide(controlsOf(registry)["2C"], "open", "go");
        delete controlsOf(registry)["6"];
      },
    ],
  ]) {
    const lost = run(mutate);
    assert.deepEqual(lost.errors, [LOST], label);
    assert.deepEqual(lost.pending, [], label);
    assert.equal(lost.snapshot.phase, "6", label);
  }

  // Dependency status and authority stay independent of the phase leg.
  const unfinished = run((registry) => {
    workOrderOf(registry, "WO-RET-01").status = "todo";
  });
  assert.deepEqual(unfinished.errors, []);
  assert.deepEqual(unfinished.pending, ["WO-RET-01 is todo, not done", LOCKED]);
  const drifted = run((registry) => {
    workOrderOf(registry).dependsOn = workOrderOf(registry).dependsOn.slice(1);
  });
  assert.deepEqual(drifted.errors, ["WO-CRA-15 dependency authority drifted"]);
});

test("one closed record pins the sealed receipt, and no record holds anything open", () => {
  const bytes = readFileSync(resolve(REPOSITORY_ROOT, SEALED_RECEIPT_PATH));
  const receipt = JSON.parse(bytes.toString("utf8"));
  const [record] = JSON.parse(
    readFileSync(
      resolve(import.meta.dirname, "../obligations/index.json"),
      "utf8"
    )
  ).closed;
  const run = (options = {}) =>
    auditCra15RuntimeHardening({
      repositoryRoot: REPOSITORY_ROOT,
      liveReceiptSourceOverride: null,
      ...options,
    });
  const closedOnly = (entries) => ({
    supersessionObligationsOverride: { obligations: [], closed: entries },
  });

  assert.deepEqual(run().errors, []);

  // Each pin, moved on its own, is an error rather than a quiet pending state.
  for (const [label, options, pattern] of [
    [
      "receipt rewritten",
      { sealedReceiptSourceOverride: `${bytes.toString("utf8")} ` },
      /sealed browser receipt moved/u,
    ],
    [
      "receipt removed",
      { sealedReceiptSourceOverride: null },
      /sealed browser receipt is missing/u,
    ],
    [
      "record repointed at other bytes",
      closedOnly([{ ...record, receiptSha256: "d".repeat(64) }]),
      /sealed browser receipt moved/u,
    ],
    [
      "recorded coordinate moved",
      closedOnly([{ ...record, recordedFingerprint: "e".repeat(64) }]),
      /no longer records its closed coordinate/u,
    ],
    [
      "record about another receipt",
      closedOnly([{ ...record, receiptPath: "elsewhere.json" }]),
      /no closed record accounts for the sealed receipt/u,
    ],
    [
      "two records for one receipt",
      closedOnly([record, { ...record, id: "fixture/twin" }]),
      /exactly one may/u,
    ],
  ]) {
    const result = run(options);
    assert.equal(result.ok, false, label);
    assert.match(result.errors.join("\n"), pattern, label);
    assert.equal(
      result.artifact.checks.realBrowserPerformanceAndBundle.status,
      "fail",
      label
    );
  }

  // An open entry is refused even as an exact copy of the sealed coordinate.
  const reopened = run({
    supersessionObligationsOverride: {
      obligations: [record],
      closed: [record],
    },
  });
  assert.equal(reopened.ok, false);
  assert.match(
    reopened.errors.join("\n"),
    new RegExp(`authorises nothing.*${SEALED_RECORD_ID}`, "u")
  );

  // The historical number stays bounded by the ceiling it was captured under.
  const overCeiling = JSON.stringify({
    ...receipt,
    assertions: {
      ...receipt.assertions,
      bundle: { ...receipt.assertions.bundle, spatialSpecGzipBytes: 1_301 },
    },
  });
  const outside = run({
    sealedReceiptSourceOverride: overCeiling,
    ...closedOnly([
      {
        ...record,
        receiptSha256: createHash("sha256").update(overCeiling).digest("hex"),
      },
    ]),
  });
  assert.match(
    outside.errors.join("\n"),
    /historical \.\/spatial\/spec measurement is missing or outside/u
  );
});

test("a fresh live receipt suspends neither the sealed pin nor the open-record law", () => {
  const sealedSource = readFileSync(
    resolve(REPOSITORY_ROOT, SEALED_RECEIPT_PATH),
    "utf8"
  );
  const sealed = JSON.parse(sealedSource);
  const [record] = JSON.parse(
    readFileSync(
      resolve(import.meta.dirname, "../obligations/index.json"),
      "utf8"
    )
  ).closed;
  const { artifact } = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
    liveReceiptSourceOverride: null,
  });
  const reportSource = '{"suites":[]}\n';
  const { spatialSpecGzipBytes: _retired, ...bundle } =
    sealed.assertions.bundle;
  // In memory only: the sealed shape rebased on today's coordinate, so the
  // admitted run proves each refusal below comes from the sealed law alone.
  const live = JSON.stringify({
    ...sealed,
    package: artifact.package,
    sourceFingerprint: artifact.sourceFingerprint,
    report: {
      ...sealed.report,
      sha256: createHash("sha256").update(reportSource).digest("hex"),
    },
    assertions: { ...sealed.assertions, bundle },
  });
  const run = (options = {}) =>
    auditCra15RuntimeHardening({
      repositoryRoot: REPOSITORY_ROOT,
      sourceOverrides: new Map([[sealed.report.path, reportSource]]),
      liveReceiptSourceOverride: live,
      ...options,
    });

  const admitted = run();
  assert.deepEqual(admitted.errors, []);
  assert.equal(
    admitted.artifact.checks.realBrowserPerformanceAndBundle.status,
    "pass"
  );

  for (const [label, options, pattern] of [
    [
      "sealed receipt rewritten",
      { sealedReceiptSourceOverride: `${sealedSource} ` },
      /sealed browser receipt moved/u,
    ],
    [
      "sealed receipt removed",
      { sealedReceiptSourceOverride: null },
      /sealed browser receipt is missing/u,
    ],
    [
      "open record",
      {
        supersessionObligationsOverride: {
          obligations: [record],
          closed: [record],
        },
      },
      new RegExp(`authorises nothing.*${SEALED_RECORD_ID}`, "u"),
    ],
  ]) {
    const result = run(options);
    assert.equal(result.ok, false, label);
    assert.match(result.errors.join("\n"), pattern, label);
    assert.equal(
      result.artifact.checks.realBrowserPerformanceAndBundle.status,
      "fail",
      label
    );
  }
});

test("the assembler writes the path the gate reads and never the sealed receipt", () => {
  const { liveReceiptPath } = auditCra15RuntimeHardening({
    repositoryRoot: REPOSITORY_ROOT,
  });
  assert.notEqual(liveReceiptPath, SEALED_RECEIPT_PATH);
  assert.match(
    liveReceiptPath,
    /^test-artifacts\/craft\/cra-15\/[a-z-]+\.json$/u
  );

  const assembler = readFileSync(
    resolve(REPOSITORY_ROOT, ASSEMBLER_PATH),
    "utf8"
  );
  assert.deepEqual(
    [...assembler.matchAll(/\bwriteFileSync\(\s*(.+?),?\n/gu)].map(
      ([, target]) => target
    ),
    ["join(REPO_ROOT, audit.liveReceiptPath)"]
  );
  assert.doesNotMatch(assembler, /browser-evidence\.json|EVIDENCE_PATH/u);
});
