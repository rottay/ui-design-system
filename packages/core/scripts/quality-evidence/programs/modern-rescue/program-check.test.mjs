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
  // The expected total is DERIVED from the live contract, never restated. A
  // literal here has to be chased every time the owner adjudicates a family,
  // and a drill that needs editing on every legitimate recount stops being a
  // drill. What must hold is that dropping a row is reported at all.
  const expected = baseline.program.denominators.visibleFamilies;
  assert.ok(
    mutated((copy) => copy.inventory.rows.pop()).some((error) =>
      error.includes(`exactly ${expected}`)
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
      row.family = "SemanticSurfaceRenamed";
    }).some((error) => error.includes("SemanticSurface"))
  );
});

test("families the owner struck out cannot reappear", () => {
  // The three 2026-08-12 retirements are regression guards, not presence checks:
  // they must fire on RE-APPEARANCE. Planting each name back on a live row is the
  // only drill that distinguishes a working guard from one that never runs.
  for (const [retired, fragment] of Object.entries({
    OverlayModal: "forwarding alias",
    TableCheckboxStyles: "global-CSS injector",
    RecordContent: "never a component"
  })) {
    assert.ok(
      mutated((copy) => {
        copy.inventory.rows[0].family = retired;
      }).some(
        (error) => error.includes(`retired ${retired}`) && error.includes(fragment)
      ),
      `${retired} may not be resurrected as a family`
    );
  }
});

test("a sixth family layer cannot be smuggled in", () => {
  assert.ok(
    mutated((copy) => {
      copy.inventory.rows[0].layer = "commercial";
    }).some((error) => error.includes("forbidden layer 'commercial'"))
  );
  assert.ok(
    mutated((copy) => {
      copy.inventory.counts["surface-composition"] = 4;
    }).some((error) =>
      error.includes("count for forbidden layer 'surface-composition'")
    )
  );
  assert.ok(
    mutated((copy) => {
      copy.program.denominators.commercialKit = 11;
    }).some((error) => error.includes("forbidden layer"))
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
          "surface"
        ] = 2;
    }).some((error) => error.includes("surface must remain 7"))
  );
  assert.ok(
    // The floor map is read in both directions, so a resurrected pseudo-layer key
    // cannot sit beside the five real profiles collecting nothing.
    mutated((copy) => {
      copy.rubric.familyCompletionContract.materialImprovement.minimumImprovedDimensionsUnlessEveryOtherApplicableDimensionAlreadyMeetsFloor[
        "surface-composition"
      ] = 7;
    }).some((error) => error.includes("retired profile 'surface-composition'"))
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

test("same-total distribution drift fails closed", () => {
  // Every mutation here PRESERVES the total. That is the whole point: the
  // previous laws summed their axes, so a +1/-1 trade between two categories
  // passed while the contract misdescribed the catalog. Each drill therefore
  // has to be checked against the sum it leaves intact, not just against red.

  // R3: one pattern reclassified as a chart. 57+18 and 56+19 are both 75.
  const r3 = baseline.rounds.rounds.find((round) => round.id === "R3");
  assert.equal(r3.scope.patterns + r3.scope.charts, 75, "drill precondition");
  const r3Errors = mutated((copy) => {
    const round = copy.rounds.rounds.find((entry) => entry.id === "R3");
    round.scope.patterns -= 1;
    round.scope.charts += 1;
    assert.equal(round.scope.patterns + round.scope.charts, 75, "the drill must keep the total");
  });
  assert.ok(
    r3Errors.some((error) => error.includes("R3 scope patterns is 56")),
    `an individual-axis trade must be rejected, got: ${JSON.stringify(r3Errors)}`
  );

  // R4: 39/36 traded to 38/37. Still 75.
  const r4 = baseline.rounds.rounds.find((round) => round.id === "R4");
  assert.equal(r4.scope.structures + r4.scope.pageSurfaces, 75, "drill precondition");
  const r4Errors = mutated((copy) => {
    const round = copy.rounds.rounds.find((entry) => entry.id === "R4");
    round.scope.structures = 38;
    round.scope.pageSurfaces = 37;
    assert.equal(
      round.scope.structures + round.scope.pageSurfaces,
      75,
      "the drill must keep the total"
    );
  });
  assert.ok(
    r4Errors.some((error) => error.includes("R4 scope structures is 38")),
    `38/37 must be rejected despite summing to 75, got: ${JSON.stringify(r4Errors)}`
  );

  // Cohort labels: the real defect this reconciliation repaired. Reverting
  // structure-shell to 5 and surface-workspace to 5 keeps the R4 cohort total at
  // 75 AND keeps the R7 label set an exact replay of R2-R4, so neither the
  // denominator law nor the replay law can see it. Only the inventory can.
  const revert = (labels) =>
    labels.map((cohort) =>
      cohort.map((label) =>
        label === "structure-shell-6"
          ? "structure-shell-5"
          : label === "surface-workspace-4"
            ? "surface-workspace-5"
            : label
      )
    );
  const cohortErrors = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    policy.R4 = revert(policy.R4);
    policy.R7 = revert(policy.R7);
    const suffixTotal = (round) =>
      round.flat().reduce((sum, label) => sum + Number(label.match(/-(\d+)$/)?.[1] ?? 1), 0);
    assert.equal(suffixTotal(policy.R4), 75, "the drill must keep the R4 cohort total");
    assert.deepEqual(
      [...policy.R7.flat()].sort(),
      [...["R2", "R3", "R4"].flatMap((id) => policy[id].flat())].sort(),
      "the drill must keep the R7 replay exact"
    );
  });
  assert.ok(
    cohortErrors.some(
      (error) =>
        error.includes("structure-shell-5") &&
        error.includes("claims 5 families but the inventory holds 6")
    ),
    `the inventory-category law must catch shell 6->5, got: ${JSON.stringify(cohortErrors)}`
  );
  assert.ok(
    cohortErrors.some(
      (error) =>
        error.includes("surface-workspace-5") &&
        error.includes("claims 5 families but the inventory holds 4")
    ),
    `the inventory-category law must catch workspace 4->5, got: ${JSON.stringify(cohortErrors)}`
  );
  // ...and it must fire for BOTH rounds, since the mutation lives in both.
  for (const roundId of ["R4", "R7"]) {
    assert.ok(
      cohortErrors.some((error) => error.startsWith(`${roundId} cohort label`)),
      `${roundId} must report the category drift it carries`
    );
  }
  // Non-vacuity: the counts above are read from the inventory, so moving a real
  // row must move the finding rather than leave a hardcoded expectation intact.
  const movedRow = mutated((copy) => {
    const row = copy.inventory.rows.find(
      (entry) => entry.layer === "structure" && entry.category === "shell"
    );
    row.category = "dashboard";
  });
  assert.ok(
    movedRow.some((error) =>
      error.includes("structure-shell-6") && error.includes("the inventory holds 5")
    ),
    `the category count must come from rows, got: ${JSON.stringify(movedRow)}`
  );
});

test("cross-round cohort swaps fail closed", () => {
  // The counts above are round-blind: every governed label carries its own
  // correct number, so trading two equally sized labels ACROSS the R3/R4
  // boundary keeps every earlier law green. `pattern-feedback-3` and
  // `structure-dashboard-3` are both size 3, so R3 stays 75, R4 stays 75, R7
  // stays 255 and -- because the swap only moves labels between two rounds whose
  // union R7 replays -- the R7 set is untouched. Only a round-membership law
  // sees that R3 now certifies a structure family and R4 a pattern family.
  const swapped = { "pattern-feedback-3": "structure-dashboard-3" };
  const swap = (labels) =>
    labels.map((cohort) =>
      cohort.map(
        (label) =>
          swapped[label] ??
          Object.keys(swapped).find((key) => swapped[key] === label) ??
          label
      )
    );
  const suffixTotal = (round) =>
    round.flat().reduce((sum, label) => sum + Number(label.match(/-(\d+)$/)?.[1] ?? 1), 0);

  const swapErrors = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    const beforeR7 = [...policy.R7.flat()].sort();
    policy.R3 = swap(policy.R3);
    policy.R4 = swap(policy.R4);
    // R7 is deliberately NOT mutated: the plant has to survive the replay law.
    assert.deepEqual(
      [...policy.R7.flat()].sort(),
      beforeR7,
      "the drill must leave R7 byte-identical"
    );
    assert.equal(suffixTotal(policy.R3), 75, "the drill must keep the R3 cohort total");
    assert.equal(suffixTotal(policy.R4), 75, "the drill must keep the R4 cohort total");
    assert.equal(suffixTotal(policy.R7), 255, "the drill must keep the R7 cohort total");
    assert.deepEqual(
      [...policy.R7.flat()].sort(),
      [...["R2", "R3", "R4"].flatMap((id) => policy[id].flat())].sort(),
      "the drill must keep the R7 replay exact"
    );
    // Both labels really did change rounds, or the drill proves nothing.
    assert.ok(
      policy.R3.flat().includes("structure-dashboard-3") &&
        policy.R4.flat().includes("pattern-feedback-3"),
      "the drill must actually move both labels"
    );
  });

  // BOTH misplaced labels must be reported, each against the round it landed in.
  assert.ok(
    swapErrors.some(
      (error) =>
        error.startsWith("R3 cohort label structure-dashboard-3") &&
        error.includes("is a structure family") &&
        error.includes("pattern+chart")
    ),
    `R3 must reject a structure family, got: ${JSON.stringify(swapErrors)}`
  );
  assert.ok(
    swapErrors.some(
      (error) =>
        error.startsWith("R4 cohort label pattern-feedback-3") &&
        error.includes("is a pattern family") &&
        error.includes("structure+surface")
    ),
    `R4 must reject a pattern family, got: ${JSON.stringify(swapErrors)}`
  );
  // R7 carries every layer by design and must NOT be swept up by this law.
  assert.ok(
    !swapErrors.some((error) => error.startsWith("R7 cohort label") && error.includes("may only carry")),
    `R7 is the global replay round and must stay unrestricted, got: ${JSON.stringify(swapErrors)}`
  );
});

// Shared probes for the round-partition hardening below. Each plant states the
// invariant it PRESERVES, so none of them can quietly stop being the drill it
// claims to be.
const suffixTotal = (round) =>
  round.flat().reduce((sum, label) => sum + Number(label.match(/-(\d+)$/)?.[1] ?? 1), 0);
const labelSet = (round) => [...round.flat()].sort().join(",");
const cohortsOf = (policy, ids) => ids.flatMap((id) => policy[id]);

test("stale round family denominators fail closed", () => {
  // Only R7's denominator used to be pinned. R0, R5 and R6 each restate the same
  // number and answered to nothing -- so 253, the exact value this program spent a
  // reconciliation pass draining, could return to three rounds in silence.
  for (const roundId of ["R0", "R5", "R6", "R7"]) {
    const round = baseline.rounds.rounds.find((entry) => entry.id === roundId);
    assert.equal(round.scope.families, 255, `${roundId} drill precondition`);
    const errors = mutated((copy) => {
      copy.rounds.rounds.find((entry) => entry.id === roundId).scope.families = 253;
    });
    assert.ok(
      errors.some((error) => error.startsWith(`${roundId} must `) && error.includes("253")),
      `${roundId} must reject a stale family denominator, got: ${JSON.stringify(errors)}`
    );
  }
  // R2/R3/R4 declare per-layer axes instead and must NOT be dragged into this law.
  for (const roundId of ["R2", "R3", "R4"]) {
    assert.equal(
      baseline.rounds.rounds.find((entry) => entry.id === roundId).scope.families,
      undefined,
      `${roundId} states axes, not a families denominator`
    );
  }
});

test("an unread checkpoint cohort block fails closed", () => {
  // `expectedCheckpointTotals` iterates its own keys, so an extra round block was
  // bound by nothing -- not the denominator, not the 25 cap, not the replay. An
  // unread cohort block reads as governed plan while being inert.
  const errors = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    assert.deepEqual(Object.keys(policy), ["R1", "R2", "R3", "R4", "R7"], "drill precondition");
    policy.R5 = [["fabricated-cohort-99"]];
  });
  assert.ok(
    errors.some(
      (error) => error.includes("roundCohorts must declare exactly") && error.includes("R5")
    ),
    `an invented cohort round must be rejected, got: ${JSON.stringify(errors)}`
  );
  // Removing a governed block must fail too, not merely adding one.
  const dropped = mutated((copy) => {
    delete copy.visualCraft.checkpointPolicy.roundCohorts.R2;
  });
  assert.ok(
    dropped.some((error) => error.includes("roundCohorts must declare exactly")),
    `a missing cohort round must be rejected, got: ${JSON.stringify(dropped)}`
  );
});

test("reference canary erosion fails closed", () => {
  // R1 stands outside the family census, which left it outside every law but its
  // own total: twelve weight-one strings summing to twelve is satisfied by the same
  // canary twelve times over.
  const dupErrors = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    policy.R1 = policy.R1.map((cohort) =>
      cohort.map((label) =>
        label === "record-detail-composition" ? "Button-and-action-cluster" : label
      )
    );
    assert.equal(suffixTotal(policy.R1), 12, "the drill must keep the R1 total");
    assert.equal(new Set(policy.R1.flat()).size, 11, "the drill must actually drop a canary");
  });
  assert.ok(
    dupErrors.some((error) => error.includes("R1 reference canaries must be unique")),
    `a repeated canary must be rejected, got: ${JSON.stringify(dupErrors)}`
  );

  // The roster is stated twice. Each side is now checked against the other, so
  // divergence in either direction is a finding.
  const renamed = mutated((copy) => {
    const round = copy.rounds.rounds.find((entry) => entry.id === "R1");
    round.scope.families = round.scope.families.map((family) =>
      family === "Card-SemanticSurface" ? "Card-something-else-entirely" : family
    );
    assert.equal(round.scope.families.length, 12, "the drill must keep the roster length");
  });
  assert.ok(
    renamed.some((error) => error.includes("must name the same reference canaries")),
    `roster divergence must be rejected, got: ${JSON.stringify(renamed)}`
  );

  const truncated = mutated((copy) => {
    const round = copy.rounds.rounds.find((entry) => entry.id === "R1");
    round.scope.families = round.scope.families.slice(0, 11);
  });
  assert.ok(
    truncated.some((error) => error.includes("R1 scope must name exactly 12")),
    `a short roster must be rejected, got: ${JSON.stringify(truncated)}`
  );
});

test("checkpoint cadence drift fails closed", () => {
  // A cohort array is one checkpoint between two explicit Codex GOs, not a bag of
  // labels. Set-based replay let two R7 cohorts merge -- deleting a human review
  // gate -- while still certifying "exact replay".
  const mergeErrors = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    const before = policy.R7.length;
    const into = policy.R7.findIndex((cohort) => cohort.includes("pattern-communication-6"));
    const from = policy.R7.findIndex((cohort) => cohort.includes("pattern-customization-4"));
    const merged = [...policy.R7[into], ...policy.R7[from]];
    policy.R7 = policy.R7
      .map((cohort, index) => (index === into ? merged : cohort))
      .filter((_, index) => index !== from);
    assert.equal(policy.R7.length, before - 1, "the drill must delete exactly one checkpoint");
    assert.equal(suffixTotal(policy.R7), 255, "the drill must keep the R7 total");
    assert.equal(
      labelSet(policy.R7),
      labelSet(cohortsOf(policy, ["R2", "R3", "R4"])),
      "the drill must keep the R7 label set exact"
    );
    assert.ok(suffixTotal([merged]) <= 25, "the drill must respect the twenty-five cap");
  });
  assert.ok(
    mergeErrors.some((error) => error.includes("must replay the R2-R4 checkpoint cadence")),
    `a merged checkpoint must be rejected, got: ${JSON.stringify(mergeErrors)}`
  );

  // Reordering is caught too: the census is identical, the cadence is not.
  const reordered = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    policy.R7 = [...policy.R7.slice(1), policy.R7[0]];
    assert.equal(
      labelSet(policy.R7),
      labelSet(cohortsOf(policy, ["R2", "R3", "R4"])),
      "the drill must keep the R7 label set exact"
    );
  });
  assert.ok(
    reordered.some((error) => error.includes("must replay the R2-R4 checkpoint cadence")),
    `a reordered replay must be rejected, got: ${JSON.stringify(reordered)}`
  );

  // Regrouping a certifying round alone breaks the structural replay as well,
  // because R7 no longer matches R2 ++ R3 ++ R4. Regrouping a round AND R7 in step
  // remains permitted: how many checkpoints a round takes is an authorship
  // decision (audit item P2-6), deliberately NOT legislated here.
  const r3Regrouped = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    policy.R3 = [policy.R3.flat()].map((all) => all.slice(0, 2)).concat([policy.R3.flat().slice(2)]);
    assert.equal(suffixTotal(policy.R3), 75, "the drill must keep the R3 total");
  });
  assert.ok(
    r3Regrouped.some((error) => error.includes("must replay the R2-R4 checkpoint cadence")),
    `a regrouped certifying round must be rejected, got: ${JSON.stringify(r3Regrouped)}`
  );
});

test("R2 primitive cohorts are governed by the inventory", () => {
  // 105 families -- 41% of the catalog -- were exempt from the category law on the
  // grounds that R2 partitions on a different axis. It does; the axis is a single
  // carve-out and is fully derivable, so exemption was never the consequence.
  const drift = (labels) =>
    labels.map((cohort) =>
      cohort.map((label) =>
        label === "primitive-display-24"
          ? "primitive-display-20"
          : label === "primitive-navigation-12"
            ? "primitive-navigation-16"
            : label
      )
    );
  const driftErrors = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    policy.R2 = drift(policy.R2);
    policy.R7 = drift(policy.R7);
    assert.equal(suffixTotal(policy.R2), 105, "the drill must keep the R2 total");
    assert.equal(suffixTotal(policy.R7), 255, "the drill must keep the R7 total");
    assert.equal(
      labelSet(policy.R7),
      labelSet(cohortsOf(policy, ["R2", "R3", "R4"])),
      "the drill must keep the R7 replay exact"
    );
    for (const cohort of policy.R2) {
      assert.ok(suffixTotal([cohort]) <= 25, "the drill must stay under the twenty-five cap");
    }
  });
  for (const [label, held] of [
    ["primitive-display-20", 24],
    ["primitive-navigation-16", 12]
  ]) {
    assert.ok(
      driftErrors.some(
        (error) =>
          error.startsWith("R2 cohort label") &&
          error.includes(label) &&
          error.includes(`the inventory holds ${held}`)
      ),
      `R2 must reject ${label}, got: ${JSON.stringify(driftErrors)}`
    );
  }

  // An invented stem can no longer opt a primitive cohort out of the law.
  const inventedErrors = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    const rename = (labels) =>
      labels.map((cohort) =>
        cohort.map((label) => (label === "primitive-overlay-10" ? "totally-invented-10" : label))
      );
    policy.R2 = rename(policy.R2);
    policy.R7 = rename(policy.R7);
    assert.equal(suffixTotal(policy.R2), 105, "the drill must keep the R2 total");
  });
  assert.ok(
    inventedErrors.some(
      (error) =>
        error.includes("totally-invented-10") && error.includes("no inventory category binding")
    ),
    `an ungoverned R2 stem must be rejected, got: ${JSON.stringify(inventedErrors)}`
  );

  // Non-vacuity 1: a real primitive changing category must move the finding. This
  // is the exact drill that fired for patterns and stayed silent for primitives.
  const movedCategory = mutated((copy) => {
    // Explicitly a NON-carve-out display family, so the expected counts are exact
    // rather than dependent on row order: display 24 -> 23, inputs 25 -> 26.
    const row = copy.inventory.rows.find(
      (entry) =>
        entry.layer === "primitive" &&
        entry.category === "display" &&
        !entry.sourceOwner.includes("/ui/primitives/foundation/")
    );
    row.category = "inputs";
  });
  for (const [label, held] of [
    ["primitive-display-24", 23],
    ["primitive-inputs-25", 26]
  ]) {
    assert.ok(
      movedCategory.some(
        (error) =>
          error.startsWith("R2 cohort label") &&
          error.includes(label) &&
          error.includes(`the inventory holds ${held}`)
      ),
      `a moved primitive must be counted at ${label}, got: ${JSON.stringify(movedCategory)}`
    );
  }

  // Non-vacuity 2: the carve-out itself is read from `sourceOwner`, not pinned at
  // five. Moving one family out of the foundation owner must move both sides.
  const movedOwner = mutated((copy) => {
    const row = copy.inventory.rows.find(
      (entry) =>
        entry.layer === "primitive" &&
        typeof entry.sourceOwner === "string" &&
        entry.sourceOwner.includes("/ui/primitives/foundation/")
    );
    row.sourceOwner = row.sourceOwner.replace("/ui/primitives/foundation/", "/ui/primitives/display/");
  });
  assert.ok(
    movedOwner.some(
      (error) => error.includes("foundation-visual-5") && error.includes("the inventory holds 4")
    ),
    `the carve-out must be derived from sourceOwner, got: ${JSON.stringify(movedOwner)}`
  );

  // And a primitive label may not wander into a certifying round it does not own.
  const wandered = mutated((copy) => {
    const policy = copy.visualCraft.checkpointPolicy.roundCohorts;
    const swap = {
      "primitive-navigation-12": "structure-workspace-12",
      "structure-workspace-12": "primitive-navigation-12"
    };
    policy.R2 = policy.R2.map((cohort) => cohort.map((label) => swap[label] ?? label));
    policy.R4 = policy.R4.map((cohort) => cohort.map((label) => swap[label] ?? label));
    assert.equal(suffixTotal(policy.R2), 105, "the drill must keep the R2 total");
    assert.equal(suffixTotal(policy.R4), 75, "the drill must keep the R4 total");
  });
  assert.ok(
    wandered.some(
      (error) =>
        error.startsWith("R2 cohort label structure-workspace-12") &&
        error.includes("may only carry primitive")
    ),
    `R2 must reject a structure family, got: ${JSON.stringify(wandered)}`
  );
  assert.ok(
    wandered.some(
      (error) =>
        error.startsWith("R4 cohort label primitive-navigation-12") &&
        error.includes("is a primitive family")
    ),
    `R4 must reject a primitive family, got: ${JSON.stringify(wandered)}`
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
