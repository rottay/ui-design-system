import assert from "node:assert/strict";
import test from "node:test";

import {
  BRAND_FIXTURES,
  COMPONENT_EVIDENCE_MANIFEST,
  COMPONENT_EVIDENCE_REGISTRY,
  LOCALES,
  getComponentEvidenceContract,
} from "./quality-evidence/registry.mjs";
import {
  analyzePairwiseCoverage,
  buildEvidenceMatrix,
} from "./quality-evidence/pairwise.mjs";
import {
  createEmptyQualityScorecard,
  scoreQualityEvidence,
} from "./quality-evidence/scorer.mjs";
import {
  PASS1_DIMENSIONS,
  PASS2_DIMENSIONS,
  validateComponentEvidenceRegistry,
  validateQualityScorecard,
} from "./quality-evidence/schema.mjs";

function completePass1(scorecard) {
  for (const dimension of Object.keys(PASS1_DIMENSIONS)) {
    scorecard.pass1.dimensions[dimension] = {
      status: "pass",
      evidence: [
        `test-artifacts/quality-evidence/${scorecard.componentId}/pass1/${dimension}.json`,
      ],
      reason: "",
    };
  }
}

function completeCraftEvidence(scorecard, component) {
  for (const key of component.pass2.requiredEvidence) {
    scorecard.pass2.evidence[key] = [
      `test-artifacts/quality-evidence/${component.id}/pass2/${key}`,
    ];
  }
  for (const [dimension, maximum] of Object.entries(PASS2_DIMENSIONS)) {
    scorecard.pass2.scores[dimension] = maximum;
  }
}

test("Wave 0 registry contains 89 unique, schema-valid primitive contracts", () => {
  const result = validateComponentEvidenceRegistry();
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
  assert.equal(COMPONENT_EVIDENCE_MANIFEST.schemaVersion, 1);
  assert.equal(COMPONENT_EVIDENCE_MANIFEST.componentCount, 89);
  assert.equal(COMPONENT_EVIDENCE_REGISTRY.length, 89);
  assert.equal(
    new Set(COMPONENT_EVIDENCE_REGISTRY.map((entry) => entry.id)).size,
    89
  );
});

test("every primitive produces complete constrained-pairwise coverage inside its declared budget", () => {
  for (const component of COMPONENT_EVIDENCE_REGISTRY) {
    const matrix = buildEvidenceMatrix(component);
    const coverage = analyzePairwiseCoverage(component, matrix.cells);
    assert.equal(
      coverage.complete,
      true,
      `${component.id} has missing pair coverage`
    );
    assert.equal(
      coverage.withinBudget,
      true,
      `${component.id} exceeds its evidence-cell budget`
    );
    assert.ok(
      matrix.cells.every(
        (cell) => cell.renderedStates === component.renderedStates
      )
    );
    assert.ok(
      matrix.cells.every(
        (cell) =>
          cell.renderedContentProfiles === component.renderedContentProfiles
      )
    );
  }
});

test("every primitive proves that real tenant identity and locale are independent axes", () => {
  for (const component of COMPONENT_EVIDENCE_REGISTRY) {
    const matrix = buildEvidenceMatrix(component);
    for (const brand of BRAND_FIXTURES) {
      for (const locale of LOCALES) {
        assert.ok(
          matrix.cells.some(
            (cell) => cell.axes.brand === brand && cell.axes.locale === locale
          ),
          `${component.id} lacks ${brand} × ${locale} evidence`
        );
      }
    }
  }
});

test("a perfect automated contract remains pending until separate human craft approval", () => {
  const component = getComponentEvidenceContract("DS-P032");
  const scorecard = createEmptyQualityScorecard(component.id);
  completePass1(scorecard);
  completeCraftEvidence(scorecard, component);

  const pending = scoreQualityEvidence(scorecard);
  assert.equal(pending.score.total, 100);
  assert.equal(pending.pass1.passed, true);
  assert.equal(pending.pass2.humanApproved, false);
  assert.equal(pending.completionEligible, false);
  assert.equal(pending.disposition, "pending-craft");
  assert.equal(pending.automaticCraftApproval, false);
});

test("sighted approval plus required evidence can accept a flagship at 95 or better", () => {
  const component = getComponentEvidenceContract("DS-P032");
  const scorecard = createEmptyQualityScorecard(component.id);
  completePass1(scorecard);
  completeCraftEvidence(scorecard, component);
  scorecard.pass2.review = {
    status: "approved",
    reviewer: "design-reviewer@example.test",
    reviewedAt: "2026-07-22T12:00:00.000Z",
    notes: "Adversarial craft review approved against both tenant fixtures.",
  };

  const validation = validateQualityScorecard(scorecard);
  assert.deepEqual(validation.errors, []);
  const result = scoreQualityEvidence(scorecard);
  assert.equal(result.threshold, 95);
  assert.equal(result.score.total, 100);
  assert.equal(result.completionEligible, true);
  assert.equal(result.disposition, "accepted");
});

test("hard failures block completion regardless of numeric craft score and human approval", () => {
  const component = getComponentEvidenceContract("DS-P002");
  const scorecard = createEmptyQualityScorecard(component.id);
  completePass1(scorecard);
  completeCraftEvidence(scorecard, component);
  scorecard.pass1.hardFailures.push("incoherent-border-radius-grammar");
  scorecard.pass2.review = {
    status: "approved",
    reviewer: "design-reviewer@example.test",
    reviewedAt: "2026-07-22T12:00:00.000Z",
    notes: "This approval cannot override an automatic failure.",
  };

  const result = scoreQualityEvidence(scorecard);
  assert.equal(result.score.total, 100);
  assert.equal(result.pass1.passed, false);
  assert.equal(result.completionEligible, false);
  assert.equal(result.disposition, "contract-failed");
});

test("approved Pass 2 is invalid without an attributable reviewer and timestamp", () => {
  const scorecard = createEmptyQualityScorecard("DS-P032");
  scorecard.pass2.review.status = "approved";
  const result = validateQualityScorecard(scorecard);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /requires reviewer/u);
  assert.match(result.errors.join("\n"), /reviewedAt/u);
});
