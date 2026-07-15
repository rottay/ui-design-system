import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  actionableWorkOrders,
  canonicalCrossProgramConvergenceLedger,
  dsImprovementsPlanFingerprint,
  localDate,
  localDateTime,
  phaseClaimBlocker,
  summarizeDsImprovements,
  summarizeDsSupportMilestones,
  validateDoneTransition,
  validateCrossProgramConvergenceLedger,
  validateDsImprovementsTraceability,
  validateGat09CompletionBarrier,
  validateRegistryMutationIntegrity,
  validateRegistryTemporalIntegrity,
} from "./roadmap-status.mjs";

const allIds = Array.from(
  { length: 128 },
  (_, index) => `DS-IMP-${String(index + 1).padStart(3, "0")}`,
);
const phases = ["0", "1", "2A", "2B", "2C", "3", "4", "5", "6"];
const liveRegistry = () => JSON.parse(
  fs.readFileSync(new URL("../roadmap/registry.json", import.meta.url), "utf8"),
);
// Live-registry assertions must follow the program's fixed New York calendar;
// fixture-only temporal tests below retain their explicit 2026-07-14 clock.
const LIVE_REGISTRY_TODAY = localDate();
const convergenceLedgerFixture = () => structuredClone(
  liveRegistry().traceability["ds-improvements"].convergenceLedger,
);

const validPhaseControls = () => Object.fromEntries(phases.map((phase) => {
  const isOpen = phase === "0";
  return [phase, {
    decisionOwner: "design-system",
    decisionDate: "2026-07-14",
    claimState: isOpen ? "open" : "locked",
    openedBy: isOpen ? "owner" : null,
    openedAt: isOpen ? "2026-07-14" : null,
    claimStateReason: isOpen ? "Owner GO explicitly approved for tests." : "Awaiting owner GO.",
    ownerGo: isOpen ? {
      decision: "go",
      by: "owner",
      at: "2026-07-14",
      evidence: "Owner GO fixture evidence.",
    } : {
      decision: "pending",
      by: null,
      at: null,
      evidence: null,
    },
    rollback: `Rollback phase ${phase}.`,
    disable: "not-applicable",
    telemetry: [`phase-${phase}-telemetry`],
    stopConditions: [`phase-${phase}-stop-condition`],
  }];
}));

function validRegistry() {
  return {
    updated: "2026-07-14",
    traceability: {
      "ds-improvements": {
        source: "../docs-engineering/engineering/audits/ds-improvements/08-consolidated-findings-and-feature-backlog.md",
        sourceRevision: "969205380fd24eb45947bf3748db5a6cacd798f8",
        roadmap: "../docs-engineering/engineering/audits/ds-improvements/09-implementation-roadmap-and-gates.md",
        adjudication: "../docs-engineering/engineering/audits/ds-improvements/13-claude-reaudit-adjudication.md",
        statusAuthority: "roadmap/registry.json",
        range: { prefix: "DS-IMP", first: 1, last: 128 },
        phaseControls: validPhaseControls(),
        convergenceLedger: convergenceLedgerFixture(),
        items: allIds.map((id) => id === "DS-IMP-061"
          ? {
            id,
            disposition: "deferred",
            owner: "design-system-program",
            reviewBy: "2999-01-01",
            reason: "TenantThemeConfig runtime delivery remains in Phase 1.",
            targetPhase: "1",
          }
          : {
            id,
            disposition: "execute",
            authority: "WO-GAT-05",
            phase: "0",
          }),
      },
    },
    workOrders: [
      {
        id: "WO-GAT-05",
        title: "DS improvements traceability",
        lane: "gates",
        status: "todo",
        programs: ["ds-improvements"],
        sourceIds: allIds.filter((id) => id !== "DS-IMP-061"),
        phase: "0",
        dependsOn: [],
        mustLandWith: [],
        execution: {
          decisionOwner: "design-system",
          touchedRepos: ["ui-design-system"],
          rollback: "Revert the registry-only commit.",
          disable: "not-applicable",
          telemetry: ["pnpm roadmap:check"],
          stopConditions: ["A DS-IMP id has more than one authority."],
        },
      },
      {
        id: "WO-ARC-11",
        status: "todo",
        programs: [],
        dependsOn: [],
        mustLandWith: [],
      },
      {
        id: "WO-CRA-13",
        status: "todo",
        programs: [],
        dependsOn: [],
        mustLandWith: [],
      },
    ],
  };
}

function executionControls(id) {
  return {
    decisionOwner: "design-system",
    touchedRepos: ["ui-design-system"],
    rollback: `Rollback ${id} without changing another work order.`,
    disable: `Disable ${id} independently.`,
    telemetry: [`${id}-telemetry`],
    stopConditions: [`${id}-stop-condition`],
  };
}

function workOrderFixture({
  id,
  phase = "0",
  status = "todo",
  sourceIds,
  supportsSourceIds,
  milestone,
}) {
  return {
    id,
    title: `${id} fixture`,
    lane: "gates",
    status,
    programs: ["ds-improvements"],
    ...(sourceIds ? { sourceIds } : {}),
    ...(supportsSourceIds ? { supportsSourceIds } : {}),
    ...(milestone ? { milestone } : {}),
    phase,
    dependsOn: id === "WO-GAT-05" ? [] : id === "WO-GAT-06" ? ["WO-GAT-05"] : ["WO-GAT-05", "WO-GAT-06"],
    mustLandWith: [],
    execution: executionControls(id),
    evidence: status === "done" ? `${id} fixture evidence.` : null,
    claimedBy: status === "todo" ? null : "fixture-owner",
    claimedAt: status === "todo" ? null : "2026-07-14",
    doneAt: status === "done" ? "2026-07-14" : null,
  };
}

function reassignAuthority(registry, sourceId, { id, phase, status = "todo" }) {
  const item = registry.traceability["ds-improvements"].items.find((candidate) => candidate.id === sourceId);
  const priorAuthority = registry.workOrders.find((workOrder) => workOrder.id === item.authority);
  priorAuthority.sourceIds = priorAuthority.sourceIds.filter((idToKeep) => idToKeep !== sourceId);
  item.authority = id;
  item.phase = phase;
  const authority = workOrderFixture({ id, phase, status, sourceIds: [sourceId] });
  registry.workOrders.push(authority);
  return authority;
}

function addGate06(registry, { status = "todo" } = {}) {
  return reassignAuthority(registry, "DS-IMP-128", { id: "WO-GAT-06", phase: "0", status });
}

function addSupportMilestone(registry, {
  id,
  sourceId,
  finalAuthority,
  finalPhase,
  status = "done",
}) {
  const support = workOrderFixture({
    id,
    phase: "0",
    status,
    supportsSourceIds: [sourceId],
    milestone: {
      id: `${sourceId}-${id}-milestone`,
      scope: `Partial support evidence for ${sourceId}.`,
      completionEffect: "none",
      finalAuthority,
      finalPhase,
    },
  });
  registry.workOrders.push(support);
  return support;
}

function promoteTenantThemeAuthority(registry, { status = "done" } = {}) {
  const item = registry.traceability["ds-improvements"].items.find(
    (candidate) => candidate.id === "DS-IMP-061",
  );
  Object.assign(item, {
    disposition: "execute",
    authority: "WO-ARC-61",
    phase: "1",
  });
  delete item.owner;
  delete item.reviewBy;
  delete item.reason;
  delete item.targetPhase;
  const authority = workOrderFixture({
    id: "WO-ARC-61",
    phase: "1",
    status,
    sourceIds: ["DS-IMP-061"],
  });
  registry.workOrders.push(authority);
  return authority;
}

function openPhase(registry, phase) {
  for (const [candidate, controls] of Object.entries(registry.traceability["ds-improvements"].phaseControls)) {
    if (candidate === phase) continue;
    Object.assign(controls, {
      claimState: "locked",
      openedBy: null,
      openedAt: null,
      claimStateReason: `Phase ${candidate} locked for the fixture.`,
      ownerGo: {
        decision: "pending",
        by: null,
        at: null,
        evidence: null,
      },
    });
  }
  Object.assign(registry.traceability["ds-improvements"].phaseControls[phase], {
    claimState: "open",
    openedBy: "owner",
    openedAt: "2026-07-14",
    claimStateReason: `Owner GO explicitly approved Phase ${phase} for the fixture.`,
    ownerGo: {
      decision: "go",
      by: "owner",
      at: "2026-07-14",
      evidence: `Owner GO evidence for Phase ${phase}.`,
    },
  });
}

test("formats roadmap dates and progress timestamps in the selected local time zone", () => {
  const utcBoundary = new Date("2026-07-15T01:10:00.000Z");

  assert.equal(localDate(utcBoundary, { timeZone: "America/New_York" }), "2026-07-14");
  assert.equal(localDateTime(utcBoundary, { timeZone: "America/New_York" }), "2026-07-14 21:10");
  assert.equal(localDate(utcBoundary, { timeZone: "UTC" }), "2026-07-15");
  assert.equal(localDateTime(utcBoundary, { timeZone: "UTC" }), "2026-07-15 01:10");
  assert.equal(localDate(utcBoundary), "2026-07-14", "default roadmap time zone must be stable in UTC CI");
});

test("accepts registry dates on or before the local calendar date", () => {
  const registry = validRegistry();
  registry.updated = "2026-07-14";
  registry.workOrders[0].claimedAt = "2026-07-13";
  registry.workOrders[0].doneAt = "2026-07-14";

  assert.deepEqual(
    validateRegistryTemporalIntegrity(registry, { today: "2026-07-14" }),
    [],
  );
});

test("mutation guard rejects future updated, claimedAt, and doneAt dates", () => {
  for (const [label, mutate] of [
    ["registry.updated", (registry) => { registry.updated = "2026-07-15"; }],
    ["WO-GAT-05.claimedAt", (registry) => { registry.workOrders[0].claimedAt = "2026-07-15"; }],
    ["WO-GAT-05.doneAt", (registry) => { registry.workOrders[0].doneAt = "2026-07-15"; }],
  ]) {
    const registry = validRegistry();
    mutate(registry);

    const errors = validateRegistryTemporalIntegrity(registry, { today: "2026-07-14" });
    assert.ok(
      errors.some((error) => error.includes(`${label} 2026-07-15 is in the future as of local date 2026-07-14`)),
      `${label} mutation must fail closed: ${errors.join("; ")}`,
    );
  }
});

test("temporal guard rejects malformed registry dates instead of bypassing lexical checks", () => {
  const registry = validRegistry();
  registry.updated = "tomorrow";
  registry.workOrders[0].claimedAt = "2026-7-15";
  registry.workOrders[0].doneAt = "2026-02-30";

  const errors = validateRegistryTemporalIntegrity(registry, { today: "2026-07-14" });
  assert.ok(errors.some((error) => error.includes("registry.updated must be a valid YYYY-MM-DD")));
  assert.ok(errors.some((error) => error.includes("WO-GAT-05.claimedAt must be a valid YYYY-MM-DD")));
  assert.ok(errors.some((error) => error.includes("WO-GAT-05.doneAt must be a valid YYYY-MM-DD")));
});

test("temporal guard rejects malformed and future-dated progress entries", () => {
  const registry = validRegistry();
  registry.workOrders[0].progressLog = [
    { at: "tomorrow", by: "fixture", note: "Malformed." },
    { at: "2026-07-15 00:01", by: "fixture", note: "Future." },
  ];
  const errors = validateRegistryTemporalIntegrity(registry, { today: "2026-07-14" });
  assert.ok(errors.some((error) => error.includes("progressLog[0].at must be a valid")));
  assert.ok(errors.some((error) => error.includes("progressLog[1].at 2026-07-15 00:01 is in the future")));
});

test("accepts one complete 001..128 mapping with execution controls", () => {
  assert.deepEqual(validateDsImprovementsTraceability(validRegistry()), []);
});

test("fails closed when a DS-IMP id is missing", () => {
  const registry = validRegistry();
  registry.traceability["ds-improvements"].items.pop();

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("DS-IMP-128: missing traceability item")));
});

test("rejects duplicate traceability ids", () => {
  const registry = validRegistry();
  registry.traceability["ds-improvements"].items.push({
    id: "DS-IMP-001",
    disposition: "execute",
    authority: "WO-GAT-05",
  });

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("DS-IMP-001: duplicate traceability item")));
});

test("rejects an execute item whose authority WO does not exist", () => {
  const registry = validRegistry();
  registry.traceability["ds-improvements"].items[0].authority = "WO-GAT-999";

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("authority WO-GAT-999 does not exist")));
});

test("forbids status on every trace item", () => {
  const registry = validRegistry();
  registry.traceability["ds-improvements"].items[0].status = "done";

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("trace items must never store status")));
});

test("accepts a complete deferred disposition before its review date", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-128",
  );
  registry.traceability["ds-improvements"].items[127] = {
    id: "DS-IMP-128",
    disposition: "deferred",
    owner: "design-system",
    reviewBy: "2026-07-15",
    reason: "Wait for the phase 6 evidence window.",
    targetPhase: "6",
  };

  assert.deepEqual(
    validateDsImprovementsTraceability(registry, { today: "2026-07-14" }),
    [],
  );
});

test("rejects an overdue deferred disposition", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-128",
  );
  registry.traceability["ds-improvements"].items[127] = {
    id: "DS-IMP-128",
    disposition: "deferred",
    owner: "design-system",
    reviewBy: "2026-07-13",
    reason: "Wait for the phase 6 evidence window.",
    targetPhase: "6",
  };

  const errors = validateDsImprovementsTraceability(registry, { today: "2026-07-14" });
  assert.ok(errors.some((error) => error.includes("reviewBy 2026-07-13 is overdue")));
});

test("execute items require exactly one sourceId backlink", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-001",
  );

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("execute requires exactly one work-order sourceId backlink (found 0)")));
});

test("rejects a sourceId backlink repeated across work orders", () => {
  const registry = validRegistry();
  registry.workOrders.push({
    id: "WO-GAT-06",
    title: "Duplicate source backlink fixture",
    lane: "gates",
    status: "todo",
    programs: ["ds-improvements"],
    sourceIds: ["DS-IMP-001"],
    phase: "0",
    execution: {
      decisionOwner: "design-system",
      touchedRepos: ["ui-design-system"],
      rollback: "Delete the fixture.",
      disable: "not-applicable",
      telemetry: ["pnpm roadmap:check"],
      stopConditions: ["Duplicate backlink found."],
    },
  });

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes(
    "DS-IMP-001: sourceId is repeated across work orders: WO-GAT-05, WO-GAT-06",
  )));
});

test("authority work orders must declare the ds-improvements program", () => {
  const registry = validRegistry();
  registry.workOrders[0].programs = [];

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes(
    "authority WO-GAT-05 programs must include ds-improvements",
  )));
});

test("rejects absorbed canonical cycles", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-127" && id !== "DS-IMP-128",
  );
  registry.traceability["ds-improvements"].items[126] = {
    id: "DS-IMP-127",
    disposition: "absorbed",
    canonicalIds: ["DS-IMP-128"],
    decisionRef: "ADR-DS-127",
  };
  registry.traceability["ds-improvements"].items[127] = {
    id: "DS-IMP-128",
    disposition: "absorbed",
    canonicalIds: ["DS-IMP-127"],
    decisionRef: "13-claude-reaudit-adjudication.md#ds-imp-114128-disposition",
  };

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes(
    "absorbed canonical cycle: DS-IMP-127 -> DS-IMP-128 -> DS-IMP-127",
  )));
});

test("accepts terminal absorbed items without their own authority", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-128",
  );
  registry.traceability["ds-improvements"].items[127] = {
    id: "DS-IMP-128",
    disposition: "absorbed",
    canonicalIds: ["DS-IMP-001"],
    decisionRef: "13-claude-reaudit-adjudication.md#ds-imp-114128-disposition",
  };

  assert.deepEqual(validateDsImprovementsTraceability(registry), []);
});

test("absorbed items require decisionRef and forbid an authority", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-128",
  );
  registry.traceability["ds-improvements"].items[127] = {
    id: "DS-IMP-128",
    disposition: "absorbed",
    authority: "WO-GAT-05",
    canonicalIds: ["DS-IMP-001"],
  };

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("absorbed requires a non-empty decisionRef")));
  assert.ok(errors.some((error) => error.includes("absorbed is terminal and must not declare an authority")));
});

test("routed items require an external authority and cannot copy its status", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-122",
  );
  registry.traceability["ds-improvements"].items[121] = {
    id: "DS-IMP-122",
    disposition: "routed",
    external: {
      owner: "dm-ia-chat",
      path: "../docs-engineering/engineering/audits/2026-07-09-full-ecosystem-max-audit/modules/dm-ia-chat",
      status: "todo",
    },
  };

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("routed external links must never copy external status")));
});

test("routed external paths must exist and resolve from the design-system root", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-122",
  );
  registry.traceability["ds-improvements"].items[121] = {
    id: "DS-IMP-122",
    disposition: "routed",
    external: {
      owner: "dm-ia-chat",
      path: "../docs-engineering/path-that-does-not-exist",
    },
  };

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("routed external.path does not exist")));
});

test("accepts routed paths resolved through ../docs-engineering", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-122",
  );
  registry.traceability["ds-improvements"].items[121] = {
    id: "DS-IMP-122",
    disposition: "routed",
    external: {
      owner: "dm-ia-chat",
      path: "../docs-engineering/engineering/audits/2026-07-09-full-ecosystem-max-audit/modules/dm-ia-chat",
    },
  };

  assert.deepEqual(validateDsImprovementsTraceability(registry), []);
});

test("requires a full source Git SHA and accepts the object source form", () => {
  const invalid = validRegistry();
  invalid.traceability["ds-improvements"].sourceRevision = "9692053";
  assert.ok(validateDsImprovementsTraceability(invalid).some(
    (error) => error.includes("sourceRevision must be a full 40-character Git SHA"),
  ));

  const objectSource = validRegistry();
  objectSource.traceability["ds-improvements"].source = {
    path: objectSource.traceability["ds-improvements"].source,
    revision: objectSource.traceability["ds-improvements"].sourceRevision,
  };
  delete objectSource.traceability["ds-improvements"].sourceRevision;
  assert.deepEqual(validateDsImprovementsTraceability(objectSource), []);
});

test("requires source and adjudication paths to exist", () => {
  const registry = validRegistry();
  registry.traceability["ds-improvements"].source = "./does-not-exist.md";
  registry.traceability["ds-improvements"].adjudication = "./also-missing.md";

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("source does not exist")));
  assert.ok(errors.some((error) => error.includes("adjudication does not exist")));
});

test("pins the source, roadmap, adjudication and sole status authority to real revision paths", () => {
  const fakeRevision = validRegistry();
  fakeRevision.traceability["ds-improvements"].sourceRevision = "0".repeat(40);
  assert.ok(validateDsImprovementsTraceability(fakeRevision).some(
    (error) => error.includes("sourceRevision must remain pinned"),
  ));

  const missingRoadmap = validRegistry();
  missingRoadmap.traceability["ds-improvements"].roadmap = "../docs-engineering/does-not-exist.md";
  assert.ok(validateDsImprovementsTraceability(missingRoadmap).some(
    (error) => error.includes("roadmap does not exist"),
  ));

  const shadowStatus = validRegistry();
  shadowStatus.traceability["ds-improvements"].statusAuthority = "roadmap/SHADOW.md";
  assert.ok(validateDsImprovementsTraceability(shadowStatus).some(
    (error) => error.includes("statusAuthority must be roadmap/registry.json"),
  ));
});

test("terminal decision references must resolve their pinned Markdown anchor", () => {
  const registry = validRegistry();
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => id !== "DS-IMP-128",
  );
  registry.traceability["ds-improvements"].items[127] = {
    id: "DS-IMP-128",
    disposition: "absorbed",
    canonicalIds: ["DS-IMP-001"],
    decisionRef: "13-claude-reaudit-adjudication.md#anchor-that-does-not-exist",
  };
  assert.ok(validateDsImprovementsTraceability(registry).some(
    (error) => error.includes("decisionRef anchor does not resolve"),
  ));
});

test("requires the exact DS improvements phases and complete phase controls", () => {
  const registry = validRegistry();
  delete registry.traceability["ds-improvements"].phaseControls["2B"];
  registry.traceability["ds-improvements"].phaseControls["7"] = validPhaseControls()["0"];
  registry.traceability["ds-improvements"].phaseControls["2A"].decisionDate = "";
  registry.traceability["ds-improvements"].phaseControls["3"].telemetry = [];

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("phaseControls.2B is required")));
  assert.ok(errors.some((error) => error.includes("phaseControls.7 is not a declared")));
  assert.ok(errors.some((error) => error.includes("phaseControls.2A.decisionDate must be a valid YYYY-MM-DD")));
  assert.ok(errors.some((error) => error.includes("phaseControls.3.telemetry must be a non-empty")));
});

test("requires valid phase-control decision dates", () => {
  const registry = validRegistry();
  registry.traceability["ds-improvements"].phaseControls["2C"].decisionDate = "soon";

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("phaseControls.2C.decisionDate must be a valid YYYY-MM-DD")));
});

test("every required field in all nine phase controls is deletion-drilled", () => {
  const fields = [
    "decisionOwner",
    "decisionDate",
    "claimState",
    "openedBy",
    "openedAt",
    "claimStateReason",
    "ownerGo",
    "rollback",
    "disable",
    "telemetry",
    "stopConditions",
  ];
  let drills = 0;
  for (const phase of phases) {
    for (const field of fields) {
      const registry = validRegistry();
      delete registry.traceability["ds-improvements"].phaseControls[phase][field];
      const errors = validateDsImprovementsTraceability(registry, { today: "2026-07-14" });
      assert.ok(errors.length > 0, `deleting phase ${phase}.${field} must fail closed`);
      drills += 1;
    }
  }
  assert.equal(drills, 99);
});

test("DS-IMP work orders must reference one of the declared phases", () => {
  const registry = validRegistry();
  registry.workOrders[0].phase = "7";

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("phase 7 is not declared")));
});

test("requires complete execution controls on DS-IMP authority work orders", () => {
  const registry = validRegistry();
  registry.workOrders[0].execution.telemetry = [];
  registry.workOrders[0].execution.stopConditions = [];

  const errors = validateDsImprovementsTraceability(registry);
  assert.ok(errors.some((error) => error.includes("execution.telemetry must be a non-empty")));
  assert.ok(errors.some((error) => error.includes("execution.stopConditions must be a non-empty")));
});

test("derives burn-down from unique execute-authority work-order statuses", () => {
  const registry = validRegistry();
  registry.workOrders[0].status = "done";
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter(
    (id) => !["DS-IMP-125", "DS-IMP-126", "DS-IMP-127", "DS-IMP-128"].includes(id),
  );
  registry.traceability["ds-improvements"].items[124] = {
    id: "DS-IMP-125",
    disposition: "deferred",
    owner: "design-system",
    reviewBy: "2999-01-01",
    reason: "A future review window.",
    targetPhase: "6",
  };
  registry.traceability["ds-improvements"].items[125] = {
    id: "DS-IMP-126",
    disposition: "absorbed",
    canonicalIds: ["DS-IMP-001"],
    decisionRef: "ADR-DS-126",
  };
  registry.traceability["ds-improvements"].items[126] = {
    id: "DS-IMP-127",
    disposition: "routed",
    external: {
      owner: "docs-engineering",
      path: "../docs-engineering",
    },
  };
  registry.traceability["ds-improvements"].items[127] = {
    id: "DS-IMP-128",
    disposition: "rejected",
    decisionRef: "ADR-DS-128",
  };

  assert.deepEqual(summarizeDsImprovements(registry), {
    total: 1,
    executeSourceIds: 123,
    authorityIds: ["WO-GAT-05"],
    done: 1,
    "in-progress": 0,
    todo: 0,
    unknown: 0,
    sourceDone: 123,
    sourceInProgress: 0,
    sourceTodo: 0,
    sourceUnknown: 0,
    deferred: 2,
    absorbed: 1,
    routed: 1,
    rejected: 1,
  });
});

test("fails closed if the activated DS-improvements program is removed", () => {
  const errors = validateDsImprovementsTraceability({
    updated: "2026-07-14",
    workOrders: [{ id: "WO-SKIN-07", status: "done" }],
  });
  assert.ok(errors.some((error) => error.includes("activated program cannot be disabled")));
});

test("done support milestones for DS-IMP-060 and DS-IMP-106 never increment authority burn-down", () => {
  const registry = validRegistry();
  Object.assign(registry.workOrders[0], {
    status: "done",
    evidence: "GAT05 evidence.",
    claimedBy: "fixture-owner",
    claimedAt: "2026-07-14",
    doneAt: "2026-07-14",
  });
  addGate06(registry, { status: "done" });
  reassignAuthority(registry, "DS-IMP-060", { id: "WO-GAT-09", phase: "6" });
  reassignAuthority(registry, "DS-IMP-106", { id: "WO-CRA-15", phase: "2C" });
  addSupportMilestone(registry, {
    id: "WO-GAT-07",
    sourceId: "DS-IMP-060",
    finalAuthority: "WO-GAT-09",
    finalPhase: "6",
  });
  addSupportMilestone(registry, {
    id: "WO-CRA-14",
    sourceId: "DS-IMP-106",
    finalAuthority: "WO-CRA-15",
    finalPhase: "2C",
  });

  assert.deepEqual(validateDsImprovementsTraceability(registry, { today: "2026-07-14" }), []);
  const burnDown = summarizeDsImprovements(registry);
  assert.equal(burnDown.sourceDone, 125);
  assert.equal(burnDown.sourceTodo, 2);
  assert.equal(burnDown.total, 4);
  assert.ok(!burnDown.authorityIds.includes("WO-GAT-07"));
  assert.ok(!burnDown.authorityIds.includes("WO-CRA-14"));
  assert.deepEqual(
    summarizeDsSupportMilestones(registry).map(({ id, status, completionEffect }) => ({ id, status, completionEffect })),
    [
      { id: "WO-GAT-07", status: "done", completionEffect: "none" },
      { id: "WO-CRA-14", status: "done", completionEffect: "none" },
    ],
  );
});

test("rejects malformed support milestones and any attempt to make support an authority backlink", () => {
  const registry = validRegistry();
  addGate06(registry);
  reassignAuthority(registry, "DS-IMP-060", { id: "WO-GAT-09", phase: "6" });
  const support = addSupportMilestone(registry, {
    id: "WO-GAT-07",
    sourceId: "DS-IMP-060",
    finalAuthority: "WO-GAT-09",
    finalPhase: "6",
  });
  delete support.milestone.scope;
  support.milestone.completionEffect = "complete";
  support.milestone.finalPhase = "2C";
  support.sourceIds = ["DS-IMP-060"];

  const errors = validateDsImprovementsTraceability(registry, { today: "2026-07-14" });
  assert.ok(errors.some((error) => error.includes("milestone.scope must be non-empty")));
  assert.ok(errors.some((error) => error.includes('milestone.completionEffect must be "none"')));
  assert.ok(errors.some((error) => error.includes("milestone.finalPhase 2C must match finalAuthority WO-GAT-09 phase 6")));
  assert.ok(errors.some((error) => error.includes("cannot be both sourceIds authority work and a non-completing support milestone")));
  assert.ok(errors.some((error) => error.includes("sourceId is repeated across work orders")));
});

test("execute trace phase must match its sole authority phase", () => {
  const registry = validRegistry();
  registry.traceability["ds-improvements"].items[0].phase = "1";

  const errors = validateDsImprovementsTraceability(registry, { today: "2026-07-14" });
  assert.ok(errors.some((error) => error.includes(
    "DS-IMP-001: execute phase 1 must match authority WO-GAT-05 phase 0",
  )));
});

test("phase lock removes a work order from actionable results and the claim helper fails closed", () => {
  const registry = validRegistry();
  const controls = registry.traceability["ds-improvements"].phaseControls["0"];
  Object.assign(controls, {
    claimState: "locked",
    openedBy: null,
    openedAt: null,
    claimStateReason: "Waiting for the Wave-0 owner GO.",
  });

  assert.match(phaseClaimBlocker(registry, registry.workOrders[0], { today: "2026-07-14" }), /phase 0 is locked/);
  assert.ok(!actionableWorkOrders(registry).some((workOrder) => workOrder.id === "WO-GAT-05"));

  openPhase(registry, "0");
  assert.equal(phaseClaimBlocker(registry, registry.workOrders[0], { today: "2026-07-14" }), null);
  assert.ok(actionableWorkOrders(registry).some((workOrder) => workOrder.id === "WO-GAT-05"));
});

test("future phases require sole owner opening, prior completion and deferred adjudication", () => {
  const premature = validRegistry();
  openPhase(premature, "1");
  const prematureErrors = validateDsImprovementsTraceability(premature, { today: "2026-07-14" });
  assert.ok(prematureErrors.some((error) => error.includes("prior execute authorities are done")));
  assert.ok(prematureErrors.some((error) => error.includes("deferred items targeted through that phase")));

  const simultaneous = validRegistry();
  Object.assign(simultaneous.traceability["ds-improvements"].phaseControls["1"], {
    claimState: "open",
    openedBy: "owner",
    openedAt: "2026-07-14",
    claimStateReason: "Owner GO explicitly approved Phase 1 for the fixture.",
    ownerGo: {
      decision: "go",
      by: "owner",
      at: "2026-07-14",
      evidence: "Owner GO evidence for Phase 1.",
    },
  });
  assert.ok(validateDsImprovementsTraceability(simultaneous, { today: "2026-07-14" }).some(
    (error) => error.includes("may open at most one phase"),
  ));

  const unapproved = validRegistry();
  unapproved.traceability["ds-improvements"].phaseControls["0"].openedBy = "unapproved-agent";
  assert.match(
    phaseClaimBlocker(unapproved, unapproved.workOrders[0], { today: "2026-07-14" }),
    /openedBy must be "owner"/,
  );
});

test("a DS work order cannot depend on a later phase", () => {
  const registry = liveRegistry();
  registry.workOrders.find((workOrder) => workOrder.id === "WO-GAT-08").dependsOn.push("WO-GAT-09");
  assert.ok(validateDsImprovementsTraceability(registry, { today: "2026-07-14" }).some(
    (error) => error.includes("WO-GAT-08: phase 0 cannot depend on later-phase WO-GAT-09 (6)"),
  ));
});

test("rejects future phase decision/open dates and incoherent locked metadata", () => {
  const futureRegistry = validRegistry();
  Object.assign(futureRegistry.traceability["ds-improvements"].phaseControls["0"], {
    decisionDate: "2026-07-15",
    openedAt: "2026-07-15",
  });
  const futureErrors = validateDsImprovementsTraceability(futureRegistry, { today: "2026-07-14" });
  assert.ok(futureErrors.some((error) => error.includes("decisionDate 2026-07-15 is in the future")));
  assert.ok(futureErrors.some((error) => error.includes("openedAt 2026-07-15 is in the future")));

  const lockedRegistry = validRegistry();
  Object.assign(lockedRegistry.traceability["ds-improvements"].phaseControls["0"], {
    claimState: "locked",
    openedBy: "owner",
    openedAt: "2026-07-14",
    claimStateReason: "Locked fixture.",
  });
  const lockedErrors = validateDsImprovementsTraceability(lockedRegistry, { today: "2026-07-14" });
  assert.ok(lockedErrors.some((error) => error.includes("openedBy must be null while claimState is locked")));
  assert.ok(lockedErrors.some((error) => error.includes("openedAt must be null while claimState is locked")));
});

test("rejects rollback and disable controls duplicated between DS work orders", () => {
  const registry = validRegistry();
  const gate06 = addGate06(registry);
  gate06.execution.rollback = registry.workOrders[0].execution.rollback;
  gate06.execution.disable = registry.workOrders[0].execution.disable;

  const errors = validateDsImprovementsTraceability(registry, { today: "2026-07-14" });
  assert.ok(errors.some((error) => error.includes(
    "DS-IMP execution.rollback is duplicated across work orders: WO-GAT-05, WO-GAT-06",
  )));
  assert.ok(errors.some((error) => error.includes(
    "DS-IMP execution.disable is duplicated across work orders: WO-GAT-05, WO-GAT-06",
  )));
});

test("bootstrap mutation guard requires GAT05 and GAT06 dependencies", () => {
  const missingGat05 = validRegistry();
  const gate06 = addGate06(missingGat05);
  gate06.dependsOn = [];
  assert.ok(validateDsImprovementsTraceability(missingGat05, { today: "2026-07-14" }).some(
    (error) => error.includes("WO-GAT-06: ds-improvements bootstrap requires dependsOn WO-GAT-05"),
  ));

  const missingGat06 = validRegistry();
  addGate06(missingGat06);
  const gat09 = reassignAuthority(missingGat06, "DS-IMP-060", { id: "WO-GAT-09", phase: "6" });
  gat09.dependsOn = ["WO-GAT-05"];
  assert.ok(validateDsImprovementsTraceability(missingGat06, { today: "2026-07-14" }).some(
    (error) => error.includes("WO-GAT-09: ds-improvements bootstrap requires dependsOn WO-GAT-06"),
  ));
});

test("done transition requires the work order to be in-progress", () => {
  const registry = validRegistry();
  assert.ok(validateDoneTransition(registry, registry.workOrders[0]).some(
    (error) => error.includes("done requires status in-progress"),
  ));
  registry.workOrders[0].status = "in-progress";
  assert.deepEqual(validateDoneTransition(registry, registry.workOrders[0]), []);
});

test("GAT09 completion barrier requires every other authority done and zero deferred items", () => {
  const registry = validRegistry();
  Object.assign(registry.workOrders[0], {
    status: "done",
    evidence: "GAT05 evidence.",
    claimedBy: "fixture-owner",
    claimedAt: "2026-07-14",
    doneAt: "2026-07-14",
  });
  const gate06 = addGate06(registry, { status: "done" });
  promoteTenantThemeAuthority(registry, { status: "done" });
  const gat09 = reassignAuthority(registry, "DS-IMP-060", {
    id: "WO-GAT-09",
    phase: "6",
    status: "in-progress",
  });
  openPhase(registry, "6");

  assert.deepEqual(validateGat09CompletionBarrier(registry, { today: "2026-07-14" }), []);
  assert.deepEqual(validateDoneTransition(registry, gat09, { today: "2026-07-14" }), []);

  gate06.status = "todo";
  assert.ok(validateGat09CompletionBarrier(registry, { today: "2026-07-14" }).some(
    (error) => error.includes("every other execute authority must be done (WO-GAT-06=todo)"),
  ));
  gate06.status = "done";

  const deferred = registry.traceability["ds-improvements"].items[0];
  registry.workOrders[0].sourceIds = registry.workOrders[0].sourceIds.filter((id) => id !== deferred.id);
  Object.assign(deferred, {
    disposition: "deferred",
    owner: "design-system",
    reviewBy: "2026-08-01",
    reason: "Future review fixture.",
    targetPhase: "6",
  });
  delete deferred.authority;
  delete deferred.phase;

  assert.ok(validateGat09CompletionBarrier(registry, { today: "2026-07-14" }).some(
    (error) => error.includes("completion requires zero deferred items (found 1: DS-IMP-001)"),
  ));
  gat09.status = "done";
  gat09.evidence = "GAT09 evidence.";
  gat09.doneAt = "2026-07-14";
  assert.ok(validateDsImprovementsTraceability(registry, { today: "2026-07-14" }).some(
    (error) => error.includes("WO-GAT-09: completion requires zero deferred items"),
  ));
});

test("the pre-write mutation validator includes DS trace and phase invariants", () => {
  const registry = validRegistry();
  registry.traceability["ds-improvements"].items[0].phase = "1";

  const errors = validateRegistryMutationIntegrity(registry, { today: "2026-07-14" });
  assert.ok(errors.some((error) => error.includes(
    "DS-IMP-001: execute phase 1 must match authority WO-GAT-05 phase 0",
  )));
});

test("the mutation guard rejects duplicate work-order ids and incoherent done metadata", () => {
  const duplicate = liveRegistry();
  duplicate.workOrders.push(structuredClone(
    duplicate.workOrders.find((workOrder) => workOrder.id === "WO-GAT-05"),
  ));
  assert.ok(validateRegistryMutationIntegrity(duplicate, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("WO-GAT-05: duplicate work-order id (2 entries)"),
  ));

  const incoherent = validRegistry();
  Object.assign(incoherent.workOrders[0], {
    status: "done",
    evidence: "   ",
    claimedBy: null,
    claimedAt: null,
    doneAt: null,
  });
  const errors = validateDsImprovementsTraceability(incoherent, { today: LIVE_REGISTRY_TODAY });
  assert.ok(errors.some((error) => error.includes("done requires claimedBy")));
  assert.ok(errors.some((error) => error.includes("done requires a valid claimedAt")));
  assert.ok(errors.some((error) => error.includes("done requires a valid doneAt")));
  assert.ok(errors.some((error) => error.includes("done requires non-empty evidence")));
});

const convergenceCapability = (registry, id) => registry.traceability["ds-improvements"]
  .convergenceLedger.capabilities.find((capability) => capability?.id === id);
const convergenceEdges = (registry) => registry.traceability["ds-improvements"].convergenceLedger.edges;
const endpointReference = (registry, entity) => {
  for (const capability of registry.traceability["ds-improvements"].convergenceLedger.capabilities) {
    for (const field of ["consumerEndpoints", "nonConsumerEndpoints"]) {
      const found = capability[field].find((endpoint) => endpoint.entity === entity);
      if (found) return structuredClone(found);
    }
  }
  throw new Error(`missing endpoint fixture ${entity}`);
};
const semanticErrors = (registry) => validateCrossProgramConvergenceLedger(registry);
const assertSemanticRejects = (registry, matcher) => {
  let errors;
  assert.doesNotThrow(() => { errors = semanticErrors(registry); });
  assert.ok(errors.length > 0, "semantic convergence validation must reject the mutation");
  if (matcher) {
    assert.ok(errors.some((error) => matcher.test(error)), `${matcher} not found in:\n${errors.join("\n")}`);
  }
  return errors;
};
const assertFullGateRejectsWithoutThrowing = (registry) => {
  let errors;
  assert.doesNotThrow(() => {
    errors = validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY });
  });
  assert.ok(errors.length > 0, "full registry mutation gate must reject the mutation");
  return errors;
};

test("the live v2 convergence ledger is the exact 32-capability, 65-edge canonical manifest", () => {
  const registry = liveRegistry();
  const ledger = registry.traceability["ds-improvements"].convergenceLedger;
  assert.equal(ledger.schemaVersion, 2);
  assert.equal(ledger.capabilities.length, 32);
  assert.equal(ledger.edges.length, 65);
  assert.deepEqual(ledger, canonicalCrossProgramConvergenceLedger());
  assert.deepEqual(validateCrossProgramConvergenceLedger(registry), []);
  assert.deepEqual(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }), []);
});

test("equivalent convergence reordering preserves semantics, fingerprint and the full gate", () => {
  const registry = liveRegistry();
  const baselineFingerprint = dsImprovementsPlanFingerprint(registry);
  const ledger = registry.traceability["ds-improvements"].convergenceLedger;
  ledger.capabilities.reverse();
  ledger.edges.reverse();
  for (const capability of ledger.capabilities) {
    capability.sourceIds.reverse();
    capability.consumerEndpoints.reverse();
    capability.nonConsumerEndpoints.reverse();
  }
  assert.deepEqual(validateCrossProgramConvergenceLedger(registry), []);
  assert.equal(dsImprovementsPlanFingerprint(registry), baselineFingerprint);
  assert.deepEqual(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }), []);
});

test("all 32 canonical capabilities are deletion-drilled", () => {
  const baseline = liveRegistry();
  const ids = baseline.traceability["ds-improvements"].convergenceLedger.capabilities
    .map((capability) => capability.id);
  assert.equal(ids.length, 32);
  for (const id of ids) {
    const registry = liveRegistry();
    registry.traceability["ds-improvements"].convergenceLedger.capabilities =
      registry.traceability["ds-improvements"].convergenceLedger.capabilities
        .filter((capability) => capability.id !== id);
    assertSemanticRejects(registry, new RegExp(`${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: convergence capability must appear exactly once`));
  }
});

test("all 65 canonical edges are deletion-drilled", () => {
  const baseline = liveRegistry();
  const edges = baseline.traceability["ds-improvements"].convergenceLedger.edges;
  assert.equal(edges.length, 65);
  for (let index = 0; index < edges.length; index += 1) {
    const registry = liveRegistry();
    registry.traceability["ds-improvements"].convergenceLedger.edges.splice(index, 1);
    assertSemanticRejects(registry, /missing canonical convergence edge/);
  }
});

test("catalog ownership, source, canonical, authority and consumer mappings are exact", () => {
  const mutations = [
    {
      name: "owner",
      mutate(registry) {
        convergenceCapability(registry, "authorization.permission-resolution").implementationOwner = "design-system";
      },
      matcher: /implementationOwner must be scalar "platform-core"/,
    },
    {
      name: "source",
      mutate(registry) {
        convergenceCapability(registry, "assistant.prompt-composer-anatomy").sourceIds = ["DS-IMP-069"];
      },
      matcher: /sourceIds must be exactly DS-IMP-067/,
    },
    {
      name: "same-program canonical",
      mutate(registry) {
        convergenceCapability(registry, "collection.saved-view-mechanics").canonicalRef.entity = "DS-IMP-033";
      },
      matcher: /canonicalRef must be/,
    },
    {
      name: "same-program local authority",
      mutate(registry) {
        convergenceCapability(registry, "collection.saved-view-mechanics").statusAuthority.entity = "DS-IMP-033";
      },
      matcher: /statusAuthority must match the canonical v2 authority DS-IMP-032/,
    },
    {
      name: "same-program external canonical",
      mutate(registry) {
        convergenceCapability(registry, "compliance.control-policy").canonicalRef.entity = "T-CP-3";
      },
      matcher: /canonicalRef must be/,
    },
    {
      name: "same-program external authority",
      mutate(registry) {
        convergenceCapability(registry, "compliance.control-policy").statusAuthority.entity = "T-CP-3";
      },
      matcher: /statusAuthority must match the canonical v2 authority T-CP-1/,
    },
    {
      name: "consumer swap",
      mutate(registry) {
        const capability = convergenceCapability(registry, "collection.mobile-filter-mechanics");
        capability.consumerEndpoints[2] = endpointReference(registry, "T-P2-marketing");
      },
      matcher: /consumerEndpoints must be exactly/,
    },
    {
      name: "extra consumer",
      mutate(registry) {
        convergenceCapability(registry, "collection.mobile-filter-mechanics")
          .consumerEndpoints.push(endpointReference(registry, "T-CP-3"));
      },
      matcher: /consumerEndpoints must be exactly/,
    },
    {
      name: "non-consumer deletion",
      mutate(registry) {
        convergenceCapability(registry, "spatial.node-canvas-anatomy").nonConsumerEndpoints = [];
      },
      matcher: /nonConsumerEndpoints must be exactly T-P2-marketing/,
    },
  ];
  for (const { name, mutate, matcher } of mutations) {
    const registry = liveRegistry();
    mutate(registry);
    assertSemanticRejects(registry, matcher);
    assertFullGateRejectsWithoutThrowing(registry);
    assert.notEqual(dsImprovementsPlanFingerprint(registry), dsImprovementsPlanFingerprint(liveRegistry()), name);
  }
});

test("atomic chat and chart rows retain their independent status authorities", () => {
  const registry = liveRegistry();
  const expected = new Map([
    ["assistant.chat-surface-anatomy", [["DS-IMP-063"], "DS-IMP-063"]],
    ["assistant.prompt-composer-anatomy", [["DS-IMP-067"], "DS-IMP-067"]],
    ["assistant.agent-trace-anatomy", [["DS-IMP-069"], "DS-IMP-069"]],
    ["assistant.experience-suite", [["DS-IMP-094"], "DS-IMP-094"]],
    ["visualization.correctness-foundation", [["DS-IMP-095", "DS-IMP-096", "DS-IMP-097"], "WO-CRA-13"]],
    ["visualization.react-owned-kernel", [["DS-IMP-098"], "DS-IMP-098"]],
    ["visualization.renderer-neutral-spec", [["DS-IMP-099"], "DS-IMP-099"]],
    ["visualization.a11y-interaction", [["DS-IMP-100"], "DS-IMP-100"]],
    ["visualization.vertical-grammar", [["DS-IMP-101"], "DS-IMP-101"]],
    ["visualization.analytical-purpose-catalog", [["DS-IMP-102"], "DS-IMP-102"]],
  ]);
  for (const [id, [sourceIds, authorityEntity]] of expected) {
    const capability = convergenceCapability(registry, id);
    assert.deepEqual(capability.sourceIds, sourceIds);
    assert.equal(capability.statusAuthority.entity, authorityEntity);
  }
});

test("permission resolution and presentation visibility stay separate and ordered to honest consumers", () => {
  const registry = liveRegistry();
  const resolution = convergenceCapability(registry, "authorization.permission-resolution");
  const presentation = convergenceCapability(registry, "authorization.presentation-visibility");
  assert.equal(resolution.implementationOwner, "platform-core");
  assert.equal(resolution.statusAuthority.entity, "T-C1-04");
  assert.equal(presentation.implementationOwner, "design-system");
  assert.equal(presentation.statusAuthority.entity, "WO-ARC-11");
  assert.deepEqual(
    resolution.consumerEndpoints.map((endpoint) => endpoint.entity),
    ["T-P2-permissions"],
  );
  assert.ok(convergenceEdges(registry).some((edge) =>
    edge.from === "authorization.permission-resolution"
      && edge.to === "T-P2-permissions"
      && edge.scope === "server-policy-only"));
});

test("edge semantics reject endpoint sources, endpoint chains, arbitrary capability chains and scope duplicates", () => {
  const mutations = [
    (registry) => convergenceEdges(registry).push({
      from: "T-P2-appbithire",
      to: "assistant.chat-surface-anatomy",
      relationship: "precedes",
      scope: "consumer-ui-only",
    }),
    (registry) => convergenceEdges(registry).push({
      from: "T-P2-appbithire",
      to: "T-P2-appplatform",
      relationship: "precedes",
      scope: "consumer-ui-only",
    }),
    (registry) => convergenceEdges(registry).push({
      from: "assistant.chat-surface-anatomy",
      to: "visualization.react-owned-kernel",
      relationship: "precedes",
      scope: "generic-dependency",
    }),
    (registry) => convergenceEdges(registry).push({
      from: "authorization.permission-resolution",
      to: "tenant-theme.schema-compiler",
      relationship: "precedes",
      scope: "backend-wide",
    }),
    (registry) => {
      const duplicate = structuredClone(convergenceEdges(registry)[0]);
      duplicate.scope = "different-scope";
      convergenceEdges(registry).push(duplicate);
    },
  ];
  for (const mutate of mutations) {
    const registry = liveRegistry();
    mutate(registry);
    assertSemanticRejects(registry, /canonical v2 edge set|from must be a declared capability|duplicates from\/relationship\/to/);
    assertFullGateRejectsWithoutThrowing(registry);
  }
});

test("consumer swaps cannot be laundered by changing the matching edge", () => {
  const registry = liveRegistry();
  const capability = convergenceCapability(registry, "collection.mobile-filter-mechanics");
  capability.consumerEndpoints[2] = endpointReference(registry, "T-CP-3");
  const edge = convergenceEdges(registry).find((candidate) =>
    candidate.from === capability.id && candidate.to === "T-P2-appplatform");
  edge.to = "T-CP-3";
  assertSemanticRejects(registry, /consumerEndpoints must be exactly|canonical v2 edge set/);
  assertFullGateRejectsWithoutThrowing(registry);
});

test("NodeCanvas has exactly two real consumers and marketing is an explicit non-consumer", () => {
  const baseline = liveRegistry();
  const capability = convergenceCapability(baseline, "spatial.node-canvas-anatomy");
  assert.deepEqual(
    capability.consumerEndpoints.map((endpoint) => endpoint.entity),
    ["T-P2-appbithire", "T-CP-3"],
  );
  assert.deepEqual(
    capability.nonConsumerEndpoints.map((endpoint) => endpoint.entity),
    ["T-P2-marketing"],
  );

  const mutations = [
    (registry) => {
      convergenceCapability(registry, capability.id).consumerEndpoints.pop();
    },
    (registry) => {
      convergenceCapability(registry, capability.id)
        .consumerEndpoints.push(endpointReference(registry, "T-P2-appplatform"));
    },
    (registry) => {
      const nodeCanvas = convergenceCapability(registry, capability.id);
      nodeCanvas.consumerEndpoints.push(endpointReference(registry, "T-P2-marketing"));
      nodeCanvas.nonConsumerEndpoints = [];
    },
  ];
  for (const mutate of mutations) {
    const registry = liveRegistry();
    mutate(registry);
    assertSemanticRejects(registry, /consumerEndpoints must be exactly|nonConsumerEndpoints must be exactly/);
  }
});

test("the tenant program is exactly the documented 17-edge DB-driven set without DS delivery ownership", () => {
  const registry = liveRegistry();
  const tenantEdges = convergenceEdges(registry)
    .filter((edge) => edge.from.startsWith("tenant-"))
    .map((edge) => `${edge.from}>${edge.to}>${edge.scope}`)
    .sort();
  assert.deepEqual(tenantEdges, [
    "tenant-branding.assets-anatomy>T-P2-appbithire>reusable-assets-contract-only",
    "tenant-branding.assets-anatomy>T-P2-appplatform>reusable-assets-contract-only",
    "tenant-branding.assets-anatomy>T-P2-notifications>reusable-assets-contract-only",
    "tenant-branding.assets-anatomy>T-P2-svcauth>reusable-assets-contract-only",
    "tenant-branding.read-model>T-P2-appbithire>db-read-model-consumer",
    "tenant-branding.read-model>T-P2-appplatform>db-read-model-consumer",
    "tenant-branding.read-model>T-P2-notifications>db-read-model-consumer",
    "tenant-branding.read-model>T-P2-svcauth>db-read-model-consumer",
    "tenant-branding.read-model>tenant-theme.app-platform-console>db-read-model-input",
    "tenant-theme.app-platform-console>T-P2-appbithire>db-write-to-first-paint",
    "tenant-theme.app-platform-console>T-P2-appplatform>db-write-to-first-paint",
    "tenant-theme.schema-compiler>T-P2-appbithire>tenant-theme-compiler-contract-only",
    "tenant-theme.schema-compiler>T-P2-appplatform>tenant-theme-compiler-contract-only",
    "tenant-theme.schema-compiler>tenant-branding.read-model>schema-contract-only",
    "tenant-theme.schema-compiler>tenant-theme.app-platform-console>schema-generated-editor-fields",
    "tenant-theme.schema-compiler>tenant-theme.vertical-capability-manifest>schema-contract-only",
    "tenant-theme.vertical-capability-manifest>tenant-theme.app-platform-console>vertical-capability-fields",
  ]);
  assert.equal(tenantEdges.length, 17);
  assert.equal(
    convergenceCapability(registry, "tenant-branding.read-model").implementationOwner,
    "tenancy",
  );
  assert.equal(
    convergenceCapability(registry, "tenant-theme.app-platform-console").implementationOwner,
    "app-platform",
  );
  assert.match(
    convergenceCapability(registry, "tenant-branding.assets-anatomy").excludedScope,
    /application delivery/,
  );
  assert.ok(convergenceEdges(registry)
    .filter((edge) => edge.from === "tenant-branding.assets-anatomy")
    .every((edge) => edge.scope === "reusable-assets-contract-only"));
});

test("tenant owner, authority, consumer and edge substitutions fail closed", () => {
  const mutations = [
    (registry) => {
      convergenceCapability(registry, "tenant-branding.read-model").implementationOwner = "design-system";
    },
    (registry) => {
      convergenceCapability(registry, "tenant-branding.read-model").statusAuthority =
        structuredClone(convergenceCapability(registry, "tenant-theme.app-platform-console").statusAuthority);
    },
    (registry) => {
      convergenceCapability(registry, "tenant-theme.schema-compiler")
        .consumerEndpoints.push(endpointReference(registry, "T-P2-notifications"));
    },
    (registry) => {
      convergenceEdges(registry).find((edge) =>
        edge.from === "tenant-theme.schema-compiler"
          && edge.to === "tenant-branding.read-model").to = "tenant-theme.app-platform-console";
    },
  ];
  for (const mutate of mutations) {
    const registry = liveRegistry();
    mutate(registry);
    assertSemanticRejects(registry);
    assertFullGateRejectsWithoutThrowing(registry);
  }
});

test("status-copy denylist catches variants, casing, separators, percentages and progress fractions", () => {
  const copiedValues = [
    "TODO",
    "not_started",
    "Not-Started",
    "planned",
    "PENDING",
    "queued",
    "in_progress",
    "blocked",
    "paused",
    "on-hold",
    "verify",
    "VERIFYING",
    "in_review",
    "done",
    "complete",
    "completed",
    "shipped",
    "reopened",
    "cancelled",
    "canceled",
    "`pending`",
    "43%",
    "2/7",
    "2 of 7",
  ];
  for (const copiedValue of copiedValues) {
    const registry = liveRegistry();
    convergenceCapability(registry, "authorization.permission-resolution").ownedScope =
      `External value ${copiedValue}`;
    assertSemanticRejects(registry, /copies external state value|copies a progress quantity/);
  }
  assert.equal(
    semanticErrors(liveRegistry()).some((error) => error.includes("observable-state")),
    false,
  );
});

test("status, state, progress, completion, done, claim and evidence metadata keys are denied recursively", () => {
  for (const key of [
    "status",
    "state",
    "progress",
    "completion",
    "doneAt",
    "claimedBy",
    "evidence",
  ]) {
    const registry = liveRegistry();
    convergenceCapability(registry, "authorization.permission-resolution").canonicalRef[key] = "linked";
    assertSemanticRejects(registry, /forbidden copied state\/progress metadata/);
  }
});

test("all closed convergence object levels reject unknown keys", () => {
  const mutations = [
    (registry) => { registry.traceability["ds-improvements"].convergenceLedger.shadow = true; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").shadow = true; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").canonicalRef.shadow = true; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").statusAuthority.shadow = true; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").consumerEndpoints[0].shadow = true; },
    (registry) => { convergenceCapability(registry, "spatial.node-canvas-anatomy").nonConsumerEndpoints[0].shadow = true; },
    (registry) => { convergenceEdges(registry)[0].shadow = true; },
  ];
  for (const mutate of mutations) {
    const registry = liveRegistry();
    mutate(registry);
    assertSemanticRejects(registry, /closed DS-improvements schema/);
  }
});

test("malformed capability, reference, endpoint and edge shapes never throw in semantic or full gates", () => {
  const mutations = [
    (registry) => { registry.traceability["ds-improvements"].convergenceLedger.capabilities = null; },
    (registry) => { registry.traceability["ds-improvements"].convergenceLedger.capabilities = {}; },
    (registry) => { registry.traceability["ds-improvements"].convergenceLedger.capabilities[0] = null; },
    (registry) => { registry.traceability["ds-improvements"].convergenceLedger.capabilities[0] = "x"; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").sourceIds = {}; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").canonicalRef = null; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").canonicalRef = {}; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").statusAuthority = null; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").statusAuthority = {}; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").consumerEndpoints = null; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").consumerEndpoints = {}; },
    (registry) => { convergenceCapability(registry, "collection.mobile-filter-mechanics").consumerEndpoints[0] = null; },
    (registry) => { convergenceCapability(registry, "spatial.node-canvas-anatomy").nonConsumerEndpoints = null; },
    (registry) => { registry.traceability["ds-improvements"].convergenceLedger.edges = null; },
    (registry) => { registry.traceability["ds-improvements"].convergenceLedger.edges = {}; },
    (registry) => { convergenceEdges(registry)[0] = null; },
    (registry) => { convergenceEdges(registry)[0] = "x"; },
    (registry) => { convergenceEdges(registry)[0].to = {}; },
    (registry) => {
      const endpoints = convergenceCapability(registry, "collection.mobile-filter-mechanics").consumerEndpoints;
      endpoints.push(endpoints);
    },
  ];
  const baselineFingerprint = dsImprovementsPlanFingerprint(liveRegistry());
  for (const mutate of mutations) {
    const registry = liveRegistry();
    mutate(registry);
    assert.doesNotThrow(() => dsImprovementsPlanFingerprint(registry));
    assert.notEqual(dsImprovementsPlanFingerprint(registry), baselineFingerprint);
    assertSemanticRejects(registry);
    assertFullGateRejectsWithoutThrowing(registry);
  }
});

test("Symbol, BigInt, function, getter, proxy and cycle payloads fail closed across every convergence boundary", () => {
  const baselineFingerprint = dsImprovementsPlanFingerprint(liveRegistry());
  const cycle = () => {
    const value = {};
    value.self = value;
    return value;
  };
  const throwingGetterObject = (field = "value") => Object.defineProperty({}, field, {
    configurable: true,
    enumerable: true,
    get() {
      throw new Error(`hostile getter: ${field}`);
    },
  });
  const throwingProxy = () => new Proxy({}, {
    get() {
      throw new Error("hostile proxy get");
    },
    ownKeys() {
      throw new Error("hostile proxy ownKeys");
    },
  });
  const revokedProxy = () => {
    const revocable = Proxy.revocable({}, {});
    revocable.revoke();
    return revocable.proxy;
  };
  const ledger = (registry) => registry.traceability["ds-improvements"].convergenceLedger;
  const firstCapability = (registry) => ledger(registry).capabilities[0];
  const firstEndpoint = (registry) => firstCapability(registry).consumerEndpoints[0];
  const firstEdge = (registry) => ledger(registry).edges[0];

  const mutations = [
    ["revision Symbol", (registry) => { ledger(registry).sourceRevision = Symbol("revision"); }],
    ["revision BigInt", (registry) => { ledger(registry).sourceRevision = 1n; }],
    ["revision function", (registry) => { ledger(registry).sourceRevision = () => "revision"; }],
    ["revision cycle", (registry) => { ledger(registry).sourceRevision = cycle(); }],
    ["revision getter", (registry) => {
      Object.defineProperty(ledger(registry), "sourceRevision", {
        configurable: true,
        enumerable: true,
        get() { throw new Error("hostile revision getter"); },
      });
    }],
    ["revision proxy", (registry) => { ledger(registry).sourceRevision = throwingProxy(); }],

    ["canonical ref Symbol", (registry) => { firstCapability(registry).canonicalRef.path = Symbol("path"); }],
    ["authority ref BigInt", (registry) => { firstCapability(registry).statusAuthority.entity = 1n; }],
    ["canonical ref function", (registry) => { firstCapability(registry).canonicalRef.entity = () => "entity"; }],
    ["canonical ref cycle", (registry) => { firstCapability(registry).canonicalRef = cycle(); }],
    ["canonical ref getter", (registry) => {
      firstCapability(registry).canonicalRef = throwingGetterObject("path");
    }],
    ["authority ref proxy", (registry) => { firstCapability(registry).statusAuthority = throwingProxy(); }],
    ["canonical ref revoked proxy", (registry) => { firstCapability(registry).canonicalRef = revokedProxy(); }],

    ["sourceIds Symbol", (registry) => { firstCapability(registry).sourceIds = [Symbol("source")]; }],
    ["sourceIds BigInt", (registry) => { firstCapability(registry).sourceIds = [1n]; }],
    ["sourceIds function", (registry) => { firstCapability(registry).sourceIds = [() => "source"]; }],
    ["sourceIds cycle", (registry) => { firstCapability(registry).sourceIds = [cycle()]; }],
    ["sourceIds getter", (registry) => {
      Object.defineProperty(firstCapability(registry), "sourceIds", {
        configurable: true,
        enumerable: true,
        get() { throw new Error("hostile sourceIds getter"); },
      });
    }],
    ["sourceIds proxy", (registry) => { firstCapability(registry).sourceIds = throwingProxy(); }],
    ["sourceIds revoked proxy", (registry) => { firstCapability(registry).sourceIds = revokedProxy(); }],

    ["endpoint Symbol", (registry) => { firstEndpoint(registry).program = Symbol("program"); }],
    ["endpoint BigInt", (registry) => { firstEndpoint(registry).entity = 1n; }],
    ["endpoint function", (registry) => { firstEndpoint(registry).path = () => "path"; }],
    ["endpoint cycle", (registry) => { firstCapability(registry).consumerEndpoints[0] = cycle(); }],
    ["endpoint getter", (registry) => {
      firstCapability(registry).consumerEndpoints[0] = throwingGetterObject("program");
    }],
    ["endpoint proxy", (registry) => { firstCapability(registry).consumerEndpoints[0] = throwingProxy(); }],
    ["endpoint revoked proxy", (registry) => { firstCapability(registry).consumerEndpoints[0] = revokedProxy(); }],

    ["edge Symbol", (registry) => { firstEdge(registry).from = Symbol("from"); }],
    ["edge BigInt", (registry) => { firstEdge(registry).to = 1n; }],
    ["edge function", (registry) => { firstEdge(registry).scope = () => "scope"; }],
    ["edge cycle", (registry) => { ledger(registry).edges[0] = cycle(); }],
    ["edge getter", (registry) => { ledger(registry).edges[0] = throwingGetterObject("from"); }],
    ["edge proxy", (registry) => { ledger(registry).edges[0] = throwingProxy(); }],
    ["edge revoked proxy", (registry) => { ledger(registry).edges[0] = revokedProxy(); }],
  ];

  for (const [name, mutate] of mutations) {
    const registry = liveRegistry();
    mutate(registry);
    let semantic;
    let full;
    let fingerprint;
    assert.doesNotThrow(() => { semantic = validateCrossProgramConvergenceLedger(registry); }, name);
    assert.doesNotThrow(() => {
      full = validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY });
    }, name);
    assert.doesNotThrow(() => { fingerprint = dsImprovementsPlanFingerprint(registry); }, name);
    assert.ok(semantic.length > 0, `${name}: semantic gate must fail closed`);
    assert.ok(full.length > 0, `${name}: full gate must fail closed`);
    assert.notEqual(fingerprint, baselineFingerprint, `${name}: fingerprint must cover malformed state`);
  }
});

test("strict JSON-data shape rejects prototype, accessor, proxy, sparse and non-JSON laundering at every ledger level", () => {
  const baselineFingerprint = dsImprovementsPlanFingerprint(liveRegistry());
  const ledger = (registry) => registry.traceability["ds-improvements"].convergenceLedger;
  const firstCapability = (registry) => ledger(registry).capabilities[0];
  const firstEndpoint = (registry) => firstCapability(registry).consumerEndpoints[0];
  const firstEdge = (registry) => ledger(registry).edges[0];
  const sparseWithInheritedIndices = (values) => {
    const sparse = new Array(values.length);
    const prototype = Object.create(Array.prototype);
    values.forEach((value, index) => {
      Object.defineProperty(prototype, String(index), {
        configurable: true,
        enumerable: true,
        writable: true,
        value,
      });
    });
    Object.setPrototypeOf(sparse, prototype);
    return sparse;
  };
  const canonicalGetter = (target, field) => {
    const value = target[field];
    Object.defineProperty(target, field, {
      configurable: true,
      enumerable: true,
      get() { return value; },
    });
  };
  const revokedProxy = (value) => {
    const revocable = Proxy.revocable(value, {});
    revocable.revoke();
    return revocable.proxy;
  };

  const mutations = [
    ["inherited ledger", (registry) => {
      registry.traceability["ds-improvements"].convergenceLedger = Object.create(ledger(registry));
    }],
    ["inherited capability", (registry) => {
      ledger(registry).capabilities[0] = Object.create(firstCapability(registry));
    }],
    ["inherited canonical reference", (registry) => {
      firstCapability(registry).canonicalRef = Object.create(firstCapability(registry).canonicalRef);
    }],
    ["inherited authority reference", (registry) => {
      firstCapability(registry).statusAuthority = Object.create(firstCapability(registry).statusAuthority);
    }],
    ["inherited endpoint", (registry) => {
      firstCapability(registry).consumerEndpoints[0] = Object.create(firstEndpoint(registry));
    }],
    ["inherited edge", (registry) => {
      ledger(registry).edges[0] = Object.create(firstEdge(registry));
    }],
    ["canonical ledger getter", (registry) => canonicalGetter(ledger(registry), "schemaVersion")],
    ["canonical capability getter", (registry) => canonicalGetter(firstCapability(registry), "id")],
    ["canonical reference getter", (registry) => canonicalGetter(firstCapability(registry).canonicalRef, "path")],
    ["canonical endpoint getter", (registry) => canonicalGetter(firstEndpoint(registry), "program")],
    ["canonical edge getter", (registry) => canonicalGetter(firstEdge(registry), "scope")],
    ["transparent ledger Proxy", (registry) => {
      registry.traceability["ds-improvements"].convergenceLedger = new Proxy(ledger(registry), {});
    }],
    ["transparent capability Proxy", (registry) => {
      ledger(registry).capabilities[0] = new Proxy(firstCapability(registry), {});
    }],
    ["transparent array Proxy", (registry) => {
      ledger(registry).capabilities = new Proxy(ledger(registry).capabilities, {});
    }],
    ["revoked edge Proxy", (registry) => {
      ledger(registry).edges[0] = revokedProxy(firstEdge(registry));
    }],
    ["symbol shadow status", (registry) => {
      ledger(registry)[Symbol("status")] = "done";
    }],
    ["non-enumerable shadow status", (registry) => {
      Object.defineProperty(firstCapability(registry), "status", {
        configurable: true,
        enumerable: false,
        value: "done",
      });
    }],
    ["sparse inherited capabilities", (registry) => {
      ledger(registry).capabilities = sparseWithInheritedIndices(ledger(registry).capabilities);
    }],
    ["sparse inherited sourceIds", (registry) => {
      firstCapability(registry).sourceIds = sparseWithInheritedIndices(firstCapability(registry).sourceIds);
    }],
    ["sparse inherited endpoints", (registry) => {
      firstCapability(registry).consumerEndpoints = sparseWithInheritedIndices(
        firstCapability(registry).consumerEndpoints,
      );
    }],
    ["sparse inherited edges", (registry) => {
      ledger(registry).edges = sparseWithInheritedIndices(ledger(registry).edges);
    }],
    ["array custom property", (registry) => {
      firstCapability(registry).sourceIds.shadow = "done";
    }],
    ["array accessor index", (registry) => canonicalGetter(firstCapability(registry).sourceIds, "0")],
    ["NaN scalar", (registry) => { ledger(registry).schemaVersion = Number.NaN; }],
    ["positive Infinity scalar", (registry) => { firstCapability(registry).ownedScope = Infinity; }],
    ["negative Infinity scalar", (registry) => { firstEdge(registry).scope = -Infinity; }],
    ["cycle", (registry) => {
      const value = {};
      value.self = value;
      firstCapability(registry).canonicalRef = value;
    }],
    ["enumerable unknown ledger key", (registry) => { ledger(registry).shadow = "linked"; }],
  ];

  for (const [name, mutate] of mutations) {
    const registry = liveRegistry();
    mutate(registry);
    let semantic;
    let full;
    let fingerprint;
    assert.doesNotThrow(() => {
      semantic = validateCrossProgramConvergenceLedger(registry);
    }, name);
    assert.doesNotThrow(() => {
      full = validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY });
    }, name);
    assert.doesNotThrow(() => {
      fingerprint = dsImprovementsPlanFingerprint(registry);
    }, name);
    assert.ok(semantic.length > 0, `${name}: semantic gate must reject`);
    assert.ok(full.length > 0, `${name}: full mutation gate must reject`);
    assert.notEqual(fingerprint, baselineFingerprint, `${name}: fingerprint must fail closed`);
  }

  const pollutedPrototypeRegistry = liveRegistry();
  const pollutedLedger = ledger(pollutedPrototypeRegistry);
  const inheritedSchemaVersion = pollutedLedger.schemaVersion;
  delete pollutedLedger.schemaVersion;
  Object.defineProperty(Object.prototype, "schemaVersion", {
    configurable: true,
    value: inheritedSchemaVersion,
  });
  try {
    assert.ok(validateCrossProgramConvergenceLedger(pollutedPrototypeRegistry).length > 0);
    assert.ok(validateRegistryMutationIntegrity(
      pollutedPrototypeRegistry,
      { today: LIVE_REGISTRY_TODAY },
    ).length > 0);
    assert.notEqual(
      dsImprovementsPlanFingerprint(pollutedPrototypeRegistry),
      baselineFingerprint,
      "an inherited field cannot supply missing JSON data",
    );
  } finally {
    delete Object.prototype.schemaVersion;
  }

  const nullPrototypeRegistry = liveRegistry();
  const originalLedger = ledger(nullPrototypeRegistry);
  nullPrototypeRegistry.traceability["ds-improvements"].convergenceLedger = Object.assign(
    Object.create(null),
    originalLedger,
  );
  assert.deepEqual(validateCrossProgramConvergenceLedger(nullPrototypeRegistry), []);
  assert.deepEqual(
    validateRegistryMutationIntegrity(nullPrototypeRegistry, { today: LIVE_REGISTRY_TODAY }),
    [],
  );
  assert.equal(dsImprovementsPlanFingerprint(nullPrototypeRegistry), baselineFingerprint);

  const aliasedRegistry = liveRegistry();
  const emptyEndpoints = [];
  const externalCapability = convergenceCapability(
    aliasedRegistry,
    "economy.financial-ledger-truth",
  );
  externalCapability.consumerEndpoints = emptyEndpoints;
  externalCapability.nonConsumerEndpoints = emptyEndpoints;
  assert.deepEqual(validateCrossProgramConvergenceLedger(aliasedRegistry), []);
  assert.deepEqual(
    validateRegistryMutationIntegrity(aliasedRegistry, { today: LIVE_REGISTRY_TODAY }),
    [],
  );
  assert.equal(dsImprovementsPlanFingerprint(aliasedRegistry), baselineFingerprint);
});

test("fingerprint covers non-consumers and exact edge scopes while remaining total", () => {
  const baseline = liveRegistry();
  const baselineFingerprint = dsImprovementsPlanFingerprint(baseline);

  const nonConsumer = liveRegistry();
  convergenceCapability(nonConsumer, "spatial.node-canvas-anatomy").nonConsumerEndpoints = [];
  assert.notEqual(dsImprovementsPlanFingerprint(nonConsumer), baselineFingerprint);

  const scope = liveRegistry();
  convergenceEdges(scope)[0].scope = "changed-scope";
  assert.notEqual(dsImprovementsPlanFingerprint(scope), baselineFingerprint);

  for (const registry of [nonConsumer, scope]) {
    assertFullGateRejectsWithoutThrowing(registry);
  }
});

test("DS never absorbs provider transport, financial truth or compliance policy", () => {
  for (const id of [
    "ai.provider-transport",
    "economy.financial-ledger-truth",
    "compliance.control-policy",
  ]) {
    const registry = liveRegistry();
    convergenceCapability(registry, id).implementationOwner = "design-system";
    assertSemanticRejects(registry, /implementationOwner must be scalar/);
  }

  const registry = liveRegistry();
  convergenceEdges(registry).push({
    from: "ai.provider-transport",
    to: "assistant.chat-surface-anatomy",
    relationship: "precedes",
    scope: "backend-wide",
  });
  assertSemanticRejects(registry, /canonical v2 edge set/);
});

test("UIDS-NF-001 remains one DS-owned capability with one external authority", () => {
  const registry = liveRegistry();
  const preset = convergenceCapability(registry, "tooling.eslint-recommended-preset");
  assert.equal(preset.implementationOwner, "design-system");
  assert.deepEqual(preset.sourceIds, ["UIDS-NF-001"]);
  assert.equal(preset.canonicalRef.entity, "UIDS-NF-001");
  assert.equal(preset.statusAuthority.entity, "T-P2-uidesignsystem");

  preset.statusAuthority.entity = "T-P2-appplatform";
  assertSemanticRejects(registry, /statusAuthority must match the canonical v2 authority/);
});

test("the live adjudicated program plan is fingerprint-locked against authority swaps", () => {
  const registry = liveRegistry();
  assert.deepEqual(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }), []);

  const item = registry.traceability["ds-improvements"].items.find(
    (candidate) => candidate.id === "DS-IMP-060",
  );
  item.authority = "WO-GAT-05";
  item.phase = "0";
  const errors = validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY });
  assert.ok(errors.some((error) => error.includes("adjudicated plan fingerprint changed")));
});

test("the adjudicated fingerprint locks structured owner-GO and phase controls", () => {
  const registry = liveRegistry();
  registry.traceability["ds-improvements"].phaseControls["0"].ownerGo.evidence =
    "A different but superficially positive owner authorization.";
  assert.ok(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("adjudicated plan fingerprint changed"),
  ));
});

test("the operational fingerprint rejects removing ARC11 to GAT07", () => {
  const registry = liveRegistry();
  const arc11 = registry.workOrders.find((workOrder) => workOrder.id === "WO-ARC-11");
  arc11.dependsOn = arc11.dependsOn.filter((dependency) => dependency !== "WO-GAT-07");
  assert.ok(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("adjudicated plan fingerprint changed"),
  ));
});

test("the operational fingerprint rejects removing CRA15 to CRA14", () => {
  const registry = liveRegistry();
  const cra15 = registry.workOrders.find((workOrder) => workOrder.id === "WO-CRA-15");
  cra15.dependsOn = cra15.dependsOn.filter((dependency) => dependency !== "WO-CRA-14");
  assert.ok(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("adjudicated plan fingerprint changed"),
  ));
});

test("the operational fingerprint rejects moving the CRA14 support milestone out of Phase 0", () => {
  const registry = liveRegistry();
  registry.workOrders.find((workOrder) => workOrder.id === "WO-CRA-14").phase = "1";
  assert.ok(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("adjudicated plan fingerprint changed"),
  ));
});

test("the DS program rejects a parallel statuses map", () => {
  const registry = liveRegistry();
  registry.traceability["ds-improvements"].statuses = { "DS-IMP-001": "done" };
  assert.ok(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("statuses is a forbidden parallel state/status store"),
  ));

  const rootContainer = liveRegistry();
  rootContainer.dsImprovementsStatuses = { "DS-IMP-001": "done" };
  assert.ok(validateRegistryMutationIntegrity(rootContainer, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("forbidden root-level parallel DS state/status container"),
  ));

  const disguisedMap = liveRegistry();
  disguisedMap.traceability["ds-improvements"].statusesByWo = { "WO-GAT-05": "done" };
  assert.ok(validateRegistryMutationIntegrity(disguisedMap, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("statusesByWo is not part of the closed DS-improvements schema"),
  ));

  const rootAuthority = liveRegistry();
  rootAuthority.statusAuthority = "roadmap/SHADOW.md";
  assert.ok(validateRegistryMutationIntegrity(rootAuthority, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("statusAuthority is a forbidden root-level parallel DS state/status container"),
  ));
});

test("DS trace items reject state aliases outside workOrders status", () => {
  const registry = liveRegistry();
  registry.traceability["ds-improvements"].items[0].state = "done";
  assert.ok(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes(".state is a forbidden parallel state/status store"),
  ));

  const disguisedState = liveRegistry();
  disguisedState.traceability["ds-improvements"].items[0].stateById = { "DS-IMP-001": "done" };
  assert.ok(validateRegistryMutationIntegrity(disguisedState, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("stateById is not part of the closed DS-improvements schema"),
  ));
});

test("structured owner GO rejects an Owner approval denied reason", () => {
  const registry = liveRegistry();
  registry.traceability["ds-improvements"].phaseControls["0"].claimStateReason = "Owner approval denied for Phase 0.";
  assert.ok(validateRegistryMutationIntegrity(registry, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("claimStateReason records a denied/revoked owner decision"),
  ));
  assert.match(
    phaseClaimBlocker(registry, registry.workOrders.find((workOrder) => workOrder.id === "WO-GAT-05"), { today: LIVE_REGISTRY_TODAY }),
    /owner GO is denied or revoked/,
  );

  const withheld = liveRegistry();
  withheld.traceability["ds-improvements"].phaseControls["0"].claimStateReason =
    "Owner withheld approval and vetoed Phase 0.";
  assert.ok(validateRegistryMutationIntegrity(withheld, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("records a denied/revoked owner decision"),
  ));

  const fakeEvidence = liveRegistry();
  fakeEvidence.traceability["ds-improvements"].phaseControls["0"].ownerGo.evidence =
    "FAKE: owner vetoed this wave; authorization does not exist.";
  assert.ok(validateRegistryMutationIntegrity(fakeEvidence, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("records a denied/revoked owner decision"),
  ));

  const nonexistent = liveRegistry();
  nonexistent.traceability["ds-improvements"].phaseControls["0"].ownerGo.evidence =
    "The purported owner approval was nonexistent.";
  assert.match(
    phaseClaimBlocker(
      nonexistent,
      nonexistent.workOrders.find((workOrder) => workOrder.id === "WO-GAT-05"),
      { today: LIVE_REGISTRY_TODAY },
    ),
    /owner GO is denied or revoked/,
  );
});

test("the closed registry schema rejects shadow state outside the DS program subtree", () => {
  const rootLedger = liveRegistry();
  rootLedger.workflowLedger = { "DS-IMP-127": "done" };
  assert.ok(validateRegistryMutationIntegrity(rootLedger, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("registry.workflowLedger is not part of the closed DS-improvements schema"),
  ));

  const traceMirror = liveRegistry();
  traceMirror.traceability.auditMirror = { sourceStates: { "DS-IMP-127": "done" } };
  assert.ok(validateRegistryMutationIntegrity(traceMirror, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("registry.traceability.auditMirror is not part of the closed DS-improvements schema"),
  ));

  const woState = liveRegistry();
  woState.workOrders.find((workOrder) => workOrder.id === "WO-GAT-05").state = "done";
  assert.ok(validateRegistryMutationIntegrity(woState, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("workOrders.WO-GAT-05.state is not part of the closed DS-improvements schema"),
  ));

  const milestoneState = liveRegistry();
  milestoneState.workOrders.find((workOrder) => workOrder.id === "WO-GAT-07").milestone.status = "done";
  assert.ok(validateRegistryMutationIntegrity(milestoneState, { today: LIVE_REGISTRY_TODAY }).some(
    (error) => error.includes("workOrders.WO-GAT-07.milestone.status is not part of the closed DS-improvements schema"),
  ));
});
