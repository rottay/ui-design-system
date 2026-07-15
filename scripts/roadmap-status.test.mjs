import assert from "node:assert/strict";
import test from "node:test";

import {
  summarizeDsImprovements,
  validateDsImprovementsTraceability,
} from "./roadmap-status.mjs";

const allIds = Array.from(
  { length: 128 },
  (_, index) => `DS-IMP-${String(index + 1).padStart(3, "0")}`,
);
const phases = ["0", "1", "2A", "2B", "2C", "3", "4", "5", "6"];

const validPhaseControls = () => Object.fromEntries(phases.map((phase) => [
  phase,
  {
    decisionOwner: "design-system",
    decisionDate: "2026-07-14",
    rollback: `Rollback phase ${phase}.`,
    disable: "not-applicable",
    telemetry: [`phase-${phase}-telemetry`],
    stopConditions: [`phase-${phase}-stop-condition`],
  },
]));

function validRegistry() {
  return {
    traceability: {
      "ds-improvements": {
        source: "../docs-engineering/engineering/audits/ds-improvements/08-consolidated-findings-and-feature-backlog.md",
        sourceRevision: "969205380fd24eb45947bf3748db5a6cacd798f8",
        adjudication: "../docs-engineering/engineering/audits/ds-improvements/13-claude-reaudit-adjudication.md",
        range: { prefix: "DS-IMP", first: 1, last: 128 },
        phaseControls: validPhaseControls(),
        items: allIds.map((id) => ({
          id,
          disposition: "execute",
          authority: "WO-GAT-05",
        })),
      },
    },
    workOrders: [
      {
        id: "WO-GAT-05",
        title: "DS improvements traceability",
        lane: "gates",
        status: "todo",
        programs: ["ds-improvements"],
        sourceIds: [...allIds],
        phase: "0",
        execution: {
          decisionOwner: "design-system",
          touchedRepos: ["ui-design-system"],
          rollback: "Revert the registry-only commit.",
          disable: "not-applicable",
          telemetry: ["pnpm roadmap:check"],
          stopConditions: ["A DS-IMP id has more than one authority."],
        },
      },
    ],
  };
}

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
    decisionRef: "ADR-DS-128",
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
    decisionRef: "ADR-DS-128",
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
    executeSourceIds: 124,
    authorityIds: ["WO-GAT-05"],
    done: 1,
    "in-progress": 0,
    todo: 0,
    unknown: 0,
    sourceDone: 124,
    sourceInProgress: 0,
    sourceTodo: 0,
    sourceUnknown: 0,
    deferred: 1,
    absorbed: 1,
    routed: 1,
    rejected: 1,
  });
});

test("keeps the completed pre-program registry valid before atomic activation", () => {
  assert.deepEqual(
    validateDsImprovementsTraceability({ workOrders: [{ id: "WO-SKIN-07", status: "done" }] }),
    [],
  );
});
