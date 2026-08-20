import assert from "node:assert/strict";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  readModernRescueContracts,
  validateModernRescueContracts,
} from "./program-check.mjs";
import { repoRoot as findRepoRoot } from '../../../lib/repo-root/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = findRepoRoot(__dirname);
const programDir = "packages/core/scripts/quality-evidence/programs/modern-rescue";
const programRoot = join(repoRoot, programDir);
// The manifest graduated to the package root; the programme still owns it.
const manifestRoot = join(repoRoot, 'packages/core/manifest');

const baseline = readModernRescueContracts();

function mutated(mutator) {
  const copy = structuredClone(baseline);
  mutator(copy);
  return validateModernRescueContracts(copy, { includeManifestGate: false });
}

function expectError(errors, fragment, message) {
  assert.ok(
    errors.some((error) => error.includes(fragment)),
    `${message ?? `expected error containing ${JSON.stringify(fragment)}`}; got ${JSON.stringify(errors)}`
  );
}

test("live modern-rescue program contracts are internally consistent", () => {
  assert.deepEqual(validateModernRescueContracts(baseline), []);
});

test("role drift fails closed", () => {
  expectError(
    mutated((copy) => { copy.orchestration.coordinator.model = "Opus"; }),
    "coordinator must be Codex",
    "Opus as coordinator must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.modelRouting.implementer.actor = "Sonnet"; }),
    "implementer must be the Cloud Opus implementer pool",
    "Sonnet as implementer must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.modelRouting.implementer.actor = "Kimi 2.7"; }),
    "implementer must be the Cloud Opus implementer pool",
    "reverting to the retired Kimi 2.7 implementer must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.model = "Kimi 2.7";
      copy.orchestration.modelRouting.implementer.actor = "Codex";
    }),
    "coordinator must be Codex",
    "swapped coordinator/implementer must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.advisoryReadOnly.actors = ["Fable 5"];
    }),
    "must name Fable 5 and Kimi K3",
    "dropping Kimi K3 from advisors must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.promotionLaw = "Escalate to Sonnet when in doubt.";
    }),
    "must not mention Opus or Sonnet",
    "Sonnet mention in routing law must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.promotionLaw = "Escalate to a bare Opus lane when in doubt.";
    }),
    "must not mention Opus or Sonnet",
    "an ungoverned Opus mention must still be rejected"
  );
});

test("implementer succession fails closed", () => {
  expectError(
    mutated((copy) => { delete copy.orchestration.modelRouting.implementer.succession; }),
    "implementer must carry a succession record",
    "removing the succession record must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession.predecessor = "Codex";
    }),
    "succession predecessor must be Kimi 2.7",
    "rewriting the retired implementer must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession.ownerOrderDate = "2026-08-16";
    }),
    "succession must cite the 2026-08-17 owner order",
    "an unmoored succession date must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession.proof = "";
    }),
    "succession must state a written succession proof",
    "an empty succession proof must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession.retainedAuditCapacity = ["Fable 5"];
    }),
    "succession must retain Kimi K3 audit capacity",
    "dropping Kimi K3 audit capacity in the succession must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.implementationActor = "Kimi 2.7";
    }),
    "doubleAccept implementationActor must be the Cloud Opus implementer pool",
    "a doubleAccept implementer that contradicts the succession must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.mechanicalWriters.maximum = 2; }),
    "mechanicalWriters.maximum must remain 1",
    "raising the mechanical writer ceiling must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.mechanicalWriters.actor = "Kimi 2.7"; }),
    "r7Execution mechanical writer must be the Cloud Opus implementer pool",
    "an R7 mechanical writer that contradicts the succession must be rejected"
  );
});

test("Standard14 and Pro drift fail closed", () => {
  expectError(
    mutated((copy) => { copy.program.controlBaselines.standard = 14; }),
    "standard controls must be 13",
    "program.json standard=14 must be rejected"
  );
  expectError(
    mutated((copy) => { copy.customization.standard.current.push("global.magic"); }),
    "standard.current must contain exactly 13 controls",
    "14th standard control must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.controlBaselines.proCapabilities = 8; }),
    "pro capabilities must be 7",
    "program.json pro=8 must be rejected"
  );
  expectError(
    mutated((copy) => { copy.customization.pro.capabilities.push("chrome.extra"); }),
    "pro.capabilities must contain exactly 7 capabilities",
    "8th pro capability must be rejected"
  );
});

test("--_ds namespace loss fails closed", () => {
  expectError(
    mutated((copy) => {
      copy.customization.namespaceLifecycle.privateProvisional.prefix = "--ds-*";
    }),
    "privateProvisional must be --_ds-*",
    "erasing --_ds-* must be rejected"
  );
  expectError(
    mutated((copy) => { delete copy.customization.namespaceLifecycle; }),
    "must contain namespaceLifecycle",
    "removing namespaceLifecycle must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.customization.namespaceLifecycle.publicCanon.forbiddenPatterns = [];
    }),
    "must forbid product/vertical dialects",
    "dropping public deny-list must be rejected"
  );
});

test("target controls remain proposed, not operational", () => {
  expectError(
    mutated((copy) => {
      copy.customization.targetControlModel.implementationState = "OPERATIONAL";
    }),
    "PROPOSED_NOT_IMPLEMENTED",
    "target model promoted to operational must be rejected"
  );
});

test("r7Enabled stays false across all contracts", () => {
  expectError(
    mutated((copy) => { copy.program.r7Enabled = true; }),
    "r7Enabled must be false",
    "program.json r7Enabled=true must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.enabled = true; }),
    "r7Execution.enabled must be false",
    "orchestration r7 enabled=true must be rejected"
  );
  expectError(
    mutated((copy) => { copy.customization.r7Execution.enabled = true; }),
    "r7Execution.enabled must equal agent-orchestration.json r7Execution.enabled",
    "model r7 enabled=true must be rejected"
  );
});





test("home law: pattern folds stay green, literal duplicates go red", () => {
  const a = join(manifestRoot, "cascade/roots/surfaces.effect-intensity.json");
  const b = join(manifestRoot, "cascade/roots/typography.scale.json");
  const origA = readFileSync(a, "utf8");
  const origB = readFileSync(b, "utf8");
  try {
    // VERDE: dos raices con to "--ds-*" y toIsPattern true NO conflictuan
    let da = JSON.parse(origA); let db = JSON.parse(origB);
    da.derivations[0].to = "--ds-*"; da.derivations[0].toIsPattern = true;
    db.derivations[0].to = "--ds-*"; db.derivations[0].toIsPattern = true;
    writeFileSync(a, `${JSON.stringify(da, null, 2)}\n`);
    writeFileSync(b, `${JSON.stringify(db, null, 2)}\n`);
    let errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    assert.ok(!errors.some((e) => e.includes("has two homes")), `pattern folds must not conflict; got ${JSON.stringify(errors.filter((e) => e.includes("two homes")))}`);
    // ROJO: mismo canal LITERAL en dos raices
    da = JSON.parse(origA); db = JSON.parse(origB);
    da.derivations[0].to = "--ds-canal-duplicado"; delete da.derivations[0].toIsPattern;
    db.derivations[0].to = "--ds-canal-duplicado"; delete db.derivations[0].toIsPattern;
    writeFileSync(a, `${JSON.stringify(da, null, 2)}\n`);
    writeFileSync(b, `${JSON.stringify(db, null, 2)}\n`);
    errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(errors, "has two homes", "literal duplicate channel must fail R6");
  } finally {
    writeFileSync(a, origA);
    writeFileSync(b, origB);
  }
});

test("planted missing cascade root fails closed", () => {
  const target = join(manifestRoot, "cascade/roots/density.mode.json");
  const backup = `${target}.t1-test-backup`;
  try {
    renameSync(target, backup);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(errors, "is missing for active control", "missing cascade root must fail");
  } finally {
    renameSync(backup, target);
  }
});
test("planted cascade defects fail closed (kind, site, orphan terminalReach)", () => {
  const target = join(manifestRoot, "cascade/roots/shape.radius-scale.json");
  const original = readFileSync(target, "utf8");
  const run = () => validateModernRescueContracts(baseline, { includeManifestGate: false });
  try {
    // 1) kind inventado
    let doc = JSON.parse(original);
    doc.derivations[0].rule.kind = "vibes-derive";
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    expectError(run(), "is not a governed derivation kind", "invented derivation kind must fail");
    // 2) site inexistente
    doc = JSON.parse(original);
    doc.derivations[0].site = "packages/core/NO-EXISTE.css";
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    expectError(run(), "site does not resolve", "nonexistent site must fail");
    // 3) terminalReach huerfano (sin edge que lo respalde)
    doc = JSON.parse(original);
    doc.terminalReach.push({ channelId: "--_ds-fantasma-radius", familyId: "primitive/inputs/button", state: "LIVE" });
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    expectError(run(), "orphan terminalReach", "orphan terminalReach must fail");
  } finally {
    writeFileSync(target, original);
  }
});

test("cabeza nula: sin razon citada va rojo, bien declarada va verde", () => {
  const target = join(manifestRoot, "cascade/roots/responsive.posture.json");
  const original = readFileSync(target, "utf8");
  const run = () => validateModernRescueContracts(baseline, { includeManifestGate: false });
  try {
    // ROJO: cabeza nula SIN headEmptyReason -- la razon es obligatoria, como en la cola
    const doc = JSON.parse(original);
    delete doc.rootChannel.headEmptyReason;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    expectError(run(), "requires rootChannel.headEmptyReason", "null head without a cited reason must fail");
    // VERDE: el estado real de hoy -- cabeza nula con razon citada y colas vacias
    writeFileSync(target, original);
    const errors = run();
    assert.ok(
      !errors.some((e) => e.includes("responsive.posture.json")),
      `declared null head must be accepted; got ${JSON.stringify(errors.filter((e) => e.includes("responsive.posture")))}`
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("planted invented domain.kind fails closed", () => {
  const target = join(manifestRoot, "controls/density.mode.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.domain.kind = "vibes-based";
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(errors, "is not a governed domain kind", "invented kind must fail the gate");
  } finally {
    writeFileSync(target, original);
  }
});

test("manifest deep regression fails closed", () => {
  const target = join(manifestRoot, "families/primitive/inputs/button.json");
  const backup = `${target}.t1-test-backup`;
  let restored = false;
  try {
    renameSync(target, backup);
    const errors = validateModernRescueContracts(baseline);
    expectError(errors, "missing family manifest", "deleted family manifest must be reported");
  } finally {
    if (!restored) {
      renameSync(backup, target);
      restored = true;
    }
  }
});

test("double-accept does not authorize commit or R7", () => {
  expectError(
    mutated((copy) => { delete copy.orchestration.doubleAccept; }),
    "must codify doubleAccept",
    "removing doubleAccept must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.notAuthorizationFor = [];
    }),
    "notAuthorizationFor must list actions",
    "empty notAuthorizationFor must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.actors = ["Fable 5"];
    }),
    "actors must be Fable 5 and Kimi K3",
    "dropping Kimi K3 from doubleAccept must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.coordinator = "Kimi 2.7";
    }),
    "doubleAccept coordinator must be Codex",
    "non-Codex doubleAccept coordinator must be rejected"
  );
});

test("cross-contract control baselines stay consistent", () => {
  expectError(
    mutated((copy) => {
      copy.program.controlBaselines.standard = 13;
      copy.customization.standard.current = copy.customization.standard.current.slice(1);
    }),
    "standard baseline must equal",
    "program/model standard mismatch must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.program.controlBaselines.expertExactAllowlist = 295;
    }),
    "Expert exact allowlist must be 294",
    "Expert allowlist growth without model must be rejected"
  );
});

test("historical reference lab checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.program.referenceLab.scenes.pop(); }),
    "must retain all eight governed scenes",
    "dropping a reference scene must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.referenceLab.route = "/probe/other"; }),
    "must remain /probe/ds-reference",
    "changing the reference lab route must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.referenceLab.applicationImportsAllowed = true; }),
    "must forbid product application imports",
    "allowing product imports in the lab must be rejected"
  );
});

test("historical quality rubric checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.rubric.schemaVersion = 2; }),
    "quality rubric schema must remain v3",
    "rubric schema downgrade must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.dimensions[0].weight -= 1; }),
    "quality rubric weight must equal 100",
    "rubric weight drift must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.eligibility.finalSightedAuthority = "writer"; }),
    "Codex must remain final sighted authority",
    "non-Codex final sighted authority must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.hardVetoes = copy.rubric.hardVetoes.slice(0, 19); }),
    "must retain at least 20 hard vetoes",
    "dropping hard vetoes must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.cssOwnershipContract.allowedClassifications.push("MISC_CSS"); }),
    "CSS ownership classifications must remain closed and exact",
    "extra CSS classification must be rejected"
  );
});

test("historical family inventory checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.program.denominators.primitives = 104; }),
    "program denominator primitives must be 105",
    "primitive denominator shrink must be rejected"
  );
  expectError(
    mutated((copy) => { copy.inventory.rows[0].layer = "commercial"; }),
    "declares forbidden layer",
    "forbidden layer reintroduction must be rejected"
  );
  expectError(
    mutated((copy) => { copy.inventory.rows[0].sourceRoot = "packages/core/nonexistent"; }),
    "sourceRoot does not exist",
    "bogus family sourceRoot must be rejected"
  );
  expectError(
    mutated((copy) => { copy.inventory.counts.primitive = 104; }),
    "family inventory declared primitive count must be 105",
    "inventory count mismatch must be rejected"
  );
});

test("historical checkpoint and registry checks fail closed", () => {
  expectError(
    mutated((copy) => { delete copy.checkpoint.refused; }),
    "must explicitly refuse R7 execution",
    "removing R7 refusal from checkpoint must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.statusAuthority = "roadmap/other.json"; }),
    "statusAuthority must remain roadmap/registry.json",
    "changing status authority must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.workOrderId = "WO-OTHER"; }),
    "program.workOrderId must be WO-CRA-23",
    "changing work order id must be rejected"
  );
});

test("historical round and checkpoint cohort checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.rounds.rounds[0].enabled = false; }),
    "must remain enabled inside the authorized R0-R6 scope",
    "disabling an R0-R6 round must be rejected"
  );
  expectError(
    mutated((copy) => {
      const r3 = copy.rounds.rounds.find((r) => r.id === "R3");
      r3.scope.patterns -= 1;
      r3.scope.charts += 1;
    }),
    "R3 scope patterns is",
    "same-total R3 axis trade must be rejected"
  );
  expectError(
    mutated((copy) => {
      const r7 = copy.rounds.rounds.find((r) => r.id === "R7");
      r7.scope.recipeGroups.target = 13;
    }),
    "fourteen target groups",
    "R7 target recipe group shrink must be rejected"
  );
});

test("historical visual craft and evidence receipt checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.visualCraft.referenceIncidents.pop(); }),
    "must retain the twelve reproduced incidents",
    "dropping a reference incident must be rejected"
  );
  expectError(
    mutated((copy) => { copy.visualCraft.mechanicalFloors.coarsePointerTargetPx = 40; }),
    "coarsePointerTargetPx must remain 44",
    "touch-target floor regression must be rejected"
  );
  expectError(
    mutated((copy) => { copy.evidence.receiptRequiredFields.pop(); }),
    "evidence receipt must require",
    "dropping a receipt required field must be rejected"
  );
  expectError(
    mutated((copy) => { copy.evidence.schemaVersion = 1; }),
    "evidence contract schema must remain v2",
    "evidence schema downgrade must be rejected"
  );
});

test("historical orchestration mechanics fail closed", () => {
  expectError(
    mutated((copy) => { copy.orchestration.schemaVersion = 1; }),
    "agent orchestration schema must remain v2",
    "orchestration schema downgrade must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.graph.agentCount = 5; }),
    "agent count must be dynamic",
    "fixed agentCount must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.graph.integratorBatchRecalculationRequired = false; }),
    "integrator batch recalculation must be required",
    "disabling integrator batch recalculation must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.efficiency = []; }),
    "agent efficiency must require useful comments and structured receipts",
    "empty efficiency array must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.laneTypes["architecture-integrator"].singleton = false; }),
    "architecture-integrator must remain a singleton lane class",
    "non-singleton architecture integrator must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.laneTypes["quality-integrator"].singleton = false; }),
    "quality-integrator must remain a singleton lane class",
    "non-singleton quality integrator must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.reservedPaths = copy.orchestration.reservedPaths.slice(0, 9); }),
    "reservedPaths must contain at least 10 entries",
    "shrinking reservedPaths below 10 must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.workOrderAdmission.requiredBeforeWrite = false; }),
    "workOrderAdmission.requiredBeforeWrite must block writes",
    "optional workOrderAdmission must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.machineBudget.heavyBuildOrTest = 2; }),
    "R7 machine budget must allow exactly one heavy process",
    "heavyBuildOrTest >1 must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.longIterationLaw = "reversible choices"; }),
    "R7 MAIN must run long checkpoint-sized iterations",
    "longIterationLaw without MAIN must be rejected"
  );
});

/*
 * FORMA drills. The rule says an enum must name its vocabulary in ONE of two
 * governed domiciles. Three drills, because a one-sided drill would pass on a
 * rule that only ever checked `enumValues`: the planted red for each domicile
 * missing, and a planted GREEN proving the `calibration.catalog` branch is a
 * real alternative and not decoration.
 */
test("planted enum with neither enumValues nor calibration.catalog fails closed", () => {
  const target = join(manifestRoot, "controls/chrome.anatomy.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    delete doc.calibration.catalog;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "an enum must name its vocabulary in one of the two governed domiciles",
      "an enum whose catalog is removed and whose enumValues are empty must fail"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("planted closed-enum emptied of enumValues, with no catalog, fails closed", () => {
  const target = join(manifestRoot, "controls/density.mode.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.domain.enumValues = [];
    delete doc.calibration?.catalog;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "an enum must name its vocabulary in one of the two governed domiciles",
      "emptying a closed-enum without a catalog must fail"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("CONTROL: a catalog is a real alternative domicile, not decoration", () => {
  const target = join(manifestRoot, "controls/density.mode.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.domain.enumValues = [];
    doc.calibration = { ...(doc.calibration ?? {}), catalog: { mode: ["compact", "normal", "spacious"] } };
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    assert.equal(
      errors.filter((error) => error.includes("two governed domiciles")).length,
      0,
      `a catalog must satisfy the rule on its own; got ${JSON.stringify(errors)}`
    );
  } finally {
    writeFileSync(target, original);
  }
});

/*
 * ADMISSION drills. The rule is an implication (emitted => admitted), so a
 * drill that only proved the green path would pass on a rule that admitted
 * everything. Each of the three adjudications gets a planted red of its own,
 * plus the live tree as the standing positive.
 */
test("planted emitted value with no admission fails closed", () => {
  const target = join(manifestRoot, "cascade/roots/chrome.anatomy.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.variants.push({
      id: "card:invented",
      value: "invented",
      effects: { emits: "data-anatomy-card=invented" },
      pinned: {},
    });
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      'chrome.anatomy emits "card:invented"',
      "a value the catalog does not admit must fail"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("the card <-> cardComponent alias is the resolution path, not decoration", () => {
  const target = join(manifestRoot, "controls/chrome.anatomy.json");
  const original = readFileSync(target, "utf8");
  try {
    // The live tree is green while the root says `card` and the catalog says
    // `cardComponent`: that IS the alias working. Removing the catalog axis
    // proves the alias is where the lookup goes, and names it in the failure.
    const doc = JSON.parse(original);
    delete doc.calibration.catalog.cardComponent;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "calibration.catalog.cardComponent",
      "the card axis must resolve through the cardComponent alias"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("the density axis is admitted by density.mode, not by the sibling catalog", () => {
  const target = join(manifestRoot, "controls/density.mode.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.domain.enumValues = ["compact", "normal"];
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      'profiles.expressive emits "density:spacious" but controls/density.mode.json',
      "the cross-owner exception must read density.mode"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("planted root axis with no mapped owner fails closed", () => {
  const target = join(manifestRoot, "cascade/roots/profiles.expressive.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.variants.push({
      id: "weather:sunny",
      value: "sunny",
      effects: { emits: "--ds-weather: sunny" },
      pinned: {},
    });
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      'emits axis "weather" but no governed owner admits it',
      "an axis nobody owns must fail, never be skipped"
    );
  } finally {
    writeFileSync(target, original);
  }
});

/*
 * CELDA GOBERNADA drills. La regla es una disyuncion de tres, asi que un solo
 * drill no alcanza: hay que plantar la celda pelada Y probar que cada una de
 * las tres coberturas la salva por si sola. Si no, la regla podria estar
 * mirando una sola de las tres y nadie lo notaria.
 */
function withFamily(relPath, mutate, run) {
  const target = join(manifestRoot, `families/${relPath}`);
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    mutate(doc);
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    run(validateModernRescueContracts(baseline, { includeManifestGate: false }));
  } finally {
    writeFileSync(target, original);
  }
}

/** Deja la celda pelada: sin filas, sin ley escrita y sin marca. */
function strip(cell) {
  delete cell.internalChannels;
  delete cell.targetBinding;
}

test("planted bare cell fails closed", () => {
  withFamily(
    "primitive/inputs/form.json",
    (doc) => strip(doc.themeControls.find((c) => c.controlId === "density.mode")),
    (errors) =>
      expectError(
        errors,
        "governed-cell: primitive/inputs/form#density.mode is bare",
        "una celda sin ninguna de las tres coberturas debe fallar"
      )
  );
});

test("CONTROL (a): internalChannels alone governs the cell", () => {
  withFamily(
    "primitive/inputs/form.json",
    (doc) => {
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      strip(cell);
      cell.internalChannels = [
        {
          channelId: "--_ds-form-radius",
          semanticOwner: "shape.radius-scale",
          producer: "packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/form.css",
          fallbackAuthority: null,
          productiveConsumerFamilyIds: ["primitive/inputs/form"],
          sourceBindings: [
            "packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/form.css",
          ],
          replacementDisposition: { state: "REQUIRED_ADDITION", reason: "drill" },
        },
      ];
    },
    (errors) =>
      assert.equal(
        errors.filter((e) => e.includes("primitive/inputs/form#density.mode is bare")).length,
        0,
        `las filas solas deben gobernar la celda; got ${JSON.stringify(errors)}`
      )
  );
});

test("CONTROL (b): a written status alone governs the cell", () => {
  withFamily(
    "primitive/inputs/form.json",
    (doc) => {
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      strip(cell);
      cell.targetBinding = { status: "MUST_NOT_REACH", source: "drill", bindings: [] };
    },
    (errors) =>
      assert.equal(
        errors.filter((e) => e.includes("primitive/inputs/form#density.mode is bare")).length,
        0,
        `la ley escrita sola debe gobernar la celda; got ${JSON.stringify(errors)}`
      )
  );
});

test("CONTROL (c): the adjudication mark alone governs the cell", () => {
  withFamily(
    "primitive/inputs/form.json",
    (doc) => {
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      strip(cell);
      cell.targetBinding = { source: "drill", bindings: [], migratedToInternalChannels: true };
    },
    (errors) =>
      assert.equal(
        errors.filter((e) => e.includes("primitive/inputs/form#density.mode is bare")).length,
        0,
        `la marca sola debe gobernar la celda; got ${JSON.stringify(errors)}`
      )
  );
});

test("an empty internalChannels list does not govern by itself", () => {
  withFamily(
    "primitive/inputs/form.json",
    (doc) => {
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      strip(cell);
      cell.internalChannels = [];
    },
    (errors) =>
      expectError(
        errors,
        "governed-cell: primitive/inputs/form#density.mode is bare",
        "una lista vacia es la ausencia de mecanismo, no su declaracion"
      )
  );
});

test("a walk that misses cells fails, instead of reporting zero bare ones", () => {
  withFamily(
    "primitive/inputs/form.json",
    (doc) => {
      doc.themeControls = doc.themeControls.filter((c) => c.controlId !== "density.mode");
    },
    (errors) =>
      expectError(
        errors,
        "the walk saw 5099 cells but manifest/index.json declares 5100",
        "un recorrido que pierde celdas no puede parecer un arbol limpio"
      )
  );
});

/*
 * ADMISSION universal (correccion F1 de la auditoria). La lista de raices se
 * deriva del arbol, asi que el drill que importa es el que Fable uso para
 * probar el agujero: una raiz que ANTES no estaba cubierta.
 */
test("F1: an invented variant in a newly covered root fails closed", () => {
  const target = join(manifestRoot, "cascade/roots/density.mode.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.variants.push({
      id: "ultra",
      value: 0.7,
      effects: { emits: "--ds-density-effective-scale: 0.7" },
      pinned: {},
    });
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      'admission: density.mode emits "ultra"',
      "density.mode no estaba en la lista pineada; derivada del arbol, si esta"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("F1: a flat root reads its token from the id, not from the emitted value", () => {
  // density.mode escribe id `compact` con value 0.85. Si la ley comparara
  // `value` contra enumValues, el arbol vivo daria rojo sin que nadie tocara
  // nada. Este control lo fija: hoy pasa, y si alguien invierte el criterio
  // el arbol REAL se cae.
  const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
  assert.equal(
    errors.filter((e) => e.includes("admission: density.mode")).length,
    0,
    `density.mode debe pasar leyendo el id; got ${JSON.stringify(errors)}`
  );
});

test("F1: a root that emits variants with no sibling control fails closed", () => {
  const target = join(manifestRoot, "controls/profiles.icon.json");
  const backup = `${target}.f1-drill-backup`;
  try {
    renameSync(target, backup);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "profiles.icon emits 4 variants but has no sibling control",
      "una raiz que emite sin control hermano es un hueco de gobierno, no una exencion"
    );
  } finally {
    renameSync(backup, target);
  }
});

test("F3: an invented targetBinding.status is a typo, not a new law", () => {
  withFamily(
    "primitive/inputs/form.json",
    (doc) => {
      // La celda vive por (a) -- tiene filas -- asi que este drill prueba que el
      // vocabulario se revisa SIEMPRE, no solo cuando la celda depende de (b).
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      cell.targetBinding = { ...(cell.targetBinding ?? {}), status: "MUST_NOT_REACHX" };
    },
    (errors) =>
      expectError(
        errors,
        'declares targetBinding.status "MUST_NOT_REACHX", which is not one of',
        "un status inventado saca la celda de todas las particiones en silencio"
      )
  );
});

test("F5: an empty catalog is not a domicile", () => {
  const target = join(manifestRoot, "controls/chrome.anatomy.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.calibration.catalog = {};
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "an enum must name its vocabulary in one of the two governed domiciles",
      "un catalogo vacio declara vocabulario vacio: FORMA debe rechazarlo"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("F6: a missing controlFamilyCells denominator fails closed", () => {
  const target = join(manifestRoot, "index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    delete doc.denominators.controlFamilyCells;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "does not publish a numeric denominators.controlFamilyCells",
      "un piso que se apaga desde el productor que vigila no es un piso"
    );
  } finally {
    writeFileSync(target, original);
  }
});
