import assert from "node:assert/strict";
import test from "node:test";
import {
  readModernRescueContracts,
  validateModernRescueContracts
} from "./program-check.mjs";

const baseline = readModernRescueContracts();

function mutated(mutator) {
  const copy = structuredClone(baseline);
  mutator(copy);
  return validateModernRescueContracts(copy);
}

test("live modern-rescue program contracts are internally consistent", () => {
  assert.deepEqual(validateModernRescueContracts(baseline), []);
});

test("family omissions and duplicates fail closed", () => {
  assert.ok(
    mutated((copy) => copy.inventory.rows.pop()).some((error) =>
      error.includes("exactly 252")
    )
  );
  assert.ok(
    mutated((copy) => {
      copy.inventory.rows[1].id = copy.inventory.rows[0].id;
    }).some((error) => error.includes("ids must be unique"))
  );
  assert.ok(
    mutated((copy) => {
      const row = copy.inventory.rows.find(
        (entry) => entry.family === "SemanticSurface"
      );
      row.family = "OverlayModal";
    }).some((error) => error.includes("SemanticSurface"))
  );
});

test("rubric dilution and sighted self-acceptance fail closed", () => {
  assert.ok(
    mutated((copy) => {
      copy.rubric.schemaVersion = 2;
    }).some((error) => error.includes("schema must remain v3"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.dimensions[0].weight -= 1;
    }).some((error) => error.includes("weight must equal 100"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.eligibility.finalSightedAuthority = "writer";
    }).some((error) => error.includes("Codex"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.dimensions[0].evidenceRequired = false;
    }).some((error) => error.includes("observable evidence"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.stressMatrix.lifecycle = copy.rubric.stressMatrix.lifecycle.filter(
        (entry) => entry !== "redacted"
      );
    }).some((error) => error.includes("redacted"))
  );
});

test("shallow family visitation cannot masquerade as elevation", () => {
  assert.ok(
    mutated((copy) => {
      copy.rubric.familyCompletionContract.materialImprovement
        .minimumImprovedDimensionsUnlessEveryOtherApplicableDimensionAlreadyMeetsFloor[
          "surface-composition"
        ] = 2;
    }).some((error) => error.includes("surface-composition must remain 7"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.familyCompletionContract.statuses = copy.rubric.familyCompletionContract.statuses.filter(
        (status) => status !== "ASSESSED_NOT_ELEVATED"
      );
    }).some((error) => error.includes("ASSESSED_NOT_ELEVATED"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.familyCompletionContract.materialImprovement.testsDocsCommentsGeneratedOutputAwardCraft =
        true;
    }).some((error) => error.includes("zero craft"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.familyCompletionContract.requiredFamilyReceiptFields =
        copy.rubric.familyCompletionContract.requiredFamilyReceiptFields.filter(
          (field) => field !== "materialDeltaTable"
        );
    }).some((error) => error.includes("materialDeltaTable"))
  );
});

test("dead CSS and disconnected tenant customization fail closed", () => {
  assert.ok(
    mutated((copy) => {
      copy.rubric.cssOwnershipContract.allowedClassifications.push("MISC_CSS");
    }).some((error) => error.includes("closed and exact"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.cssOwnershipContract.roundScopeExit =
        "dead CSS may be handled later";
    }).some((error) => error.includes("zero dead CSS"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.cssOwnershipContract.tenantAuthorityLaw =
        "family files may define tenant values directly";
    }).some((error) => error.includes("static and DB canonical authority"))
  );
});

test("model routing stays adaptive and context-efficient", () => {
  assert.ok(
    mutated((copy) => {
      copy.orchestration.modelRouting.programCoordinatorAndArchitectureControl.preferred =
        "Sonnet only";
    }).some((error) => error.includes("coordinator/creative/mechanical"))
  );
  assert.ok(
    mutated((copy) => {
      copy.orchestration.modelRouting.advisoryReadOnly.preferred =
        "writing reviewer";
    }).some((error) => error.includes("coordinator/creative/mechanical"))
  );
  assert.ok(
    mutated((copy) => {
      copy.orchestration.modelRouting.creativePremiumFamilyWork.preferred =
        "cheapest available model";
    }).some((error) => error.includes("coordinator/creative/mechanical"))
  );
  assert.ok(
    mutated((copy) => {
      copy.orchestration.modelRouting.law = "always use a fixed model";
    }).some((error) => error.includes("adaptive"))
  );
});

test("ordinary visual craft and unchecked propagation fail closed", () => {
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.referenceIncidents.pop();
    }).some((error) => error.includes("twelve reproduced incidents"))
  );
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.mechanicalFloors.dominantBoundariesPerSemanticRegion = 2;
    }).some((error) => error.includes("dominantBoundariesPerSemanticRegion"))
  );
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.hardVisualVetoes.push("new-visual-veto");
    }).some((error) => error.includes("rubric eligibility"))
  );
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.checkpointPolicy.calibrationFamilyCount = 10;
    }).some((error) => error.includes("exactly three families"))
  );
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.checkpointPolicy.roundCohorts.R2[0].push(
        "uncontrolled-extra-10"
      );
    }).some((error) => error.includes("exceeds twenty-five"))
  );
  assert.ok(
    mutated((copy) => {
      copy.artDirection.targets[0].currentPaletteIsTarget = true;
    }).some((error) => error.includes("palettes must remain rejected"))
  );
  assert.ok(
    mutated((copy) => {
      delete copy.visualCraft.failureTaxonomy.categories["fields-and-form-controls"];
    }).some((error) => error.includes("exactly twenty categories"))
  );
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.failureTaxonomy.categories["icons-imagery-and-assistive-ai"].pop();
    }).some((error) => error.includes("exactly 120 checks"))
  );
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.iconGovernanceContract.canonicalFacade =
        "use any named icon";
    }).some((error) => error.includes("semantic role facade"))
  );
  assert.ok(
    mutated((copy) => {
      delete copy.visualCraft.iconGovernanceContract.exceptionBoundaryLaw;
    }).some((error) => error.includes("functional chart icons"))
  );
  assert.ok(
    mutated((copy) => {
      copy.evidence.checkpointRequiredFields =
        copy.evidence.checkpointRequiredFields.filter(
          (field) => field !== "beforeAfterCapturePairs"
        );
    }).some((error) => error.includes("beforeAfterCapturePairs"))
  );
});

test("public control baselines and closure floors fail closed", () => {
  assert.ok(
    mutated((copy) => copy.customization.standard.current.push("global.magic")).some(
      (error) => error.includes("13 controls")
    )
  );
  assert.ok(
    mutated((copy) => {
      copy.customization.kpis.pathParity.roundExit = 0.9;
    }).some((error) => error.includes("pathParity"))
  );
});

test("round omission and a fixed agent count fail closed", () => {
  assert.ok(
    mutated((copy) => copy.rounds.rounds.splice(3, 1)).some((error) =>
      error.includes("R0..R7")
    )
  );
  assert.ok(
    mutated((copy) => {
      copy.orchestration.graph.agentCount = 20;
    }).some((error) => error.includes("dynamic"))
  );
  assert.ok(
    mutated((copy) => {
      copy.orchestration.workOrderAdmission.requiredBeforeWrite = false;
    }).some((error) => error.includes("block writes"))
  );
  assert.ok(
    mutated((copy) => {
      delete copy.evidence.minimumReliableEvidenceByRound.R0;
    }).some((error) => error.includes("every round R0..R7"))
  );
});

test("R7 customization depth and benchmark policy fail closed", () => {
  assert.ok(
    mutated((copy) => {
      copy.rounds.rounds.pop();
    }).some((error) => error.includes("R0..R7"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rounds.rounds.find((round) => round.id === "R7").scope.recipeGroups.target = 13;
    }).some((error) => error.includes("fourteen target groups"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rounds.rounds.find((round) => round.id === "R7").benchmarkPolicy.codeReuseLaw =
        "copy public systems wholesale";
    }).some((error) => error.includes("wholesale external copying"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rounds.rounds.find((round) => round.id === "R7").scope.referencePostures = 3;
    }).some((error) => error.includes("five coherent reference postures"))
  );
  assert.ok(
    mutated((copy) => {
      const r7 = copy.rounds.rounds.find((round) => round.id === "R7");
      r7.exit = r7.exit.filter((entry) => !entry.includes("dormant public"));
    }).some((error) => error.includes("dormant public customization channels"))
  );
  assert.ok(
    mutated((copy) => {
      const r7 = copy.rounds.rounds.find((round) => round.id === "R7");
      r7.objectives = r7.objectives.filter((entry) => !entry.includes("evidence sealer"));
    }).some((error) => error.includes("R0-only evidence sealer"))
  );
  assert.ok(
    mutated((copy) => {
      delete copy.evidence.minimumReliableEvidenceByRound.R7;
    }).some((error) => error.includes("every round R0..R7"))
  );
  assert.ok(
    mutated((copy) => {
      copy.customization.r7Execution.familyAnatomyDispositionRequiredFields.pop();
      copy.customization.r7Execution.familyAnatomyDispositionRequiredFields.pop();
    }).some((error) => error.includes("family anatomy disposition contract"))
  );
  assert.ok(
    mutated((copy) => {
      copy.customization.r7Execution.referencePostures.minimumNonColorAxesPerPair = 3;
    }).some((error) => error.includes("six non-color axes"))
  );
  assert.ok(
    mutated((copy) => {
      copy.rubric.binaryContracts = copy.rubric.binaryContracts.filter(
        (entry) => entry !== "r7-reference-parity-without-copy"
      );
    }).some((error) => error.includes("r7-reference-parity-without-copy"))
  );
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.checkpointPolicy.roundCohorts.R7[0].push("duplicate-overflow-10");
    }).some((error) => error.includes("exceeds twenty-five"))
  );
  assert.ok(
    mutated((copy) => {
      copy.visualCraft.checkpointPolicy.roundCohorts.R7[1].push(
        "foundation-visual-5"
      );
    }).some((error) => error.includes("must be unique"))
  );
  assert.ok(
    mutated((copy) => {
      copy.orchestration.r7Execution.mechanicalWriters.maximum = 5;
    }).some((error) => error.includes("two Sonnet writers"))
  );
  assert.ok(
    mutated((copy) => {
      copy.orchestration.r7Execution.machineBudget.chromium = 3;
    }).some((error) => error.includes("one heavy process"))
  );
});

test("tenant direction cannot collapse to shallow or advisory authority", () => {
  assert.ok(
    mutated((copy) => {
      copy.artDirection.divergenceContract.r1MinimumObservableAxes = 3;
    }).some((error) => error.includes("eight observable axes"))
  );
  assert.ok(
    mutated((copy) => {
      copy.artDirection.kimiProposalBoundary.allowedWrites = "edit the roadmap";
    }).some((error) => error.includes("new-files-only"))
  );
  assert.ok(
    mutated((copy) => {
      copy.artDirection.r0MechanismDecisions.profileRegistries.mustRemainIndependent =
        false;
    }).some((error) => error.includes("must remain independent"))
  );
  assert.ok(
    mutated((copy) => {
      copy.artDirection.r0MechanismDecisions.boundedEnvelopeRanges.pop();
    }).some((error) => error.includes("six bounded envelope ranges"))
  );
  assert.ok(
    mutated((copy) => {
      copy.artDirection.kimiProposalBoundary.adjudicationRecord =
        "KIMI-ANNOTATIONS/retained-report.md";
    }).some((error) => error.includes("parallel retained authority"))
  );
  assert.ok(
    mutated((copy) => {
      copy.artDirection.kimiProposalBoundary.claudeMayConsume =
        "raw Kimi report plus canon";
    }).some((error) => error.includes("reconciled canonical program"))
  );
});

test("parallel status state is rejected anywhere in program JSON", () => {
  assert.ok(
    mutated((copy) => {
      copy.program.status = "in-progress";
    }).some((error) => error.includes("shadow-state key status"))
  );
});
