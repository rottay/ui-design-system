import assert from "node:assert/strict";
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

import { auditRoadmapAuthority } from "../index.mjs";
import { repoRoot as findRepoRoot } from "../../../../../libraries/repo-root/index.mjs";

const REPOSITORY_ROOT = findRepoRoot(import.meta.dirname);

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
