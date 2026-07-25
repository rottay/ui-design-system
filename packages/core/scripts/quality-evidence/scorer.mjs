import { getComponentEvidenceContract, QUALITY_EVIDENCE_SCHEMA_VERSION } from './registry.mjs';
import {
  PASS1_DIMENSIONS,
  PASS2_DIMENSIONS,
  validateQualityScorecard,
} from './schema.mjs';

const PASS1_MAXIMUM = Object.values(PASS1_DIMENSIONS).reduce((sum, value) => sum + value, 0);
const PASS2_MAXIMUM = Object.values(PASS2_DIMENSIONS).reduce((sum, value) => sum + value, 0);

export function createEmptyQualityScorecard(componentId) {
  const component = getComponentEvidenceContract(componentId);
  if (!component) throw new Error(`Unknown quality-evidence component ${componentId}`);

  return {
    schemaVersion: QUALITY_EVIDENCE_SCHEMA_VERSION,
    componentId,
    evidenceRevision: 'unassigned',
    pass1: {
      dimensions: Object.fromEntries(
        Object.keys(PASS1_DIMENSIONS).map((dimension) => [
          dimension,
          { status: 'pending', evidence: [], reason: '' },
        ]),
      ),
      hardFailures: [],
    },
    pass2: {
      scores: Object.fromEntries(Object.keys(PASS2_DIMENSIONS).map((dimension) => [dimension, 0])),
      evidence: Object.fromEntries(component.pass2.requiredEvidence.map((key) => [key, []])),
      review: {
        status: 'pending',
        reviewer: null,
        reviewedAt: null,
        notes: '',
      },
    },
  };
}

function pass1Score(scorecard) {
  return Object.entries(PASS1_DIMENSIONS).reduce((score, [dimension, weight]) => {
    const status = scorecard.pass1.dimensions[dimension].status;
    return score + (status === 'pass' || status === 'not-applicable' ? weight : 0);
  }, 0);
}

function pass2Score(scorecard) {
  return Object.keys(PASS2_DIMENSIONS).reduce(
    (score, dimension) => score + scorecard.pass2.scores[dimension],
    0,
  );
}

export function scoreQualityEvidence(scorecard) {
  const validation = validateQualityScorecard(scorecard);
  const component = getComponentEvidenceContract(scorecard?.componentId);
  if (!validation.valid || !component) {
    return {
      schemaVersion: QUALITY_EVIDENCE_SCHEMA_VERSION,
      componentId: scorecard?.componentId ?? null,
      valid: false,
      errors: validation.errors,
      disposition: 'invalid',
      completionEligible: false,
      automaticCraftApproval: false,
    };
  }

  const contractScore = pass1Score(scorecard);
  const hardFailures = scorecard.pass1.hardFailures;
  const failedDimensions = Object.entries(scorecard.pass1.dimensions)
    .filter(([, value]) => value.status === 'fail')
    .map(([dimension]) => dimension);
  const pendingDimensions = Object.entries(scorecard.pass1.dimensions)
    .filter(([, value]) => value.status === 'pending')
    .map(([dimension]) => dimension);
  const pass1Passed =
    contractScore === PASS1_MAXIMUM &&
    hardFailures.length === 0 &&
    failedDimensions.length === 0 &&
    pendingDimensions.length === 0;

  const craftScore = pass2Score(scorecard);
  const missingCraftEvidence = component.pass2.requiredEvidence.filter(
    (key) => !Array.isArray(scorecard.pass2.evidence[key]) || scorecard.pass2.evidence[key].length === 0,
  );
  const humanApproved = scorecard.pass2.review.status === 'approved';
  const totalScore = contractScore + craftScore;
  const pass2Passed =
    pass1Passed &&
    humanApproved &&
    missingCraftEvidence.length === 0 &&
    totalScore >= component.acceptanceThreshold;

  let disposition = 'pending-contract';
  if (hardFailures.length > 0 || failedDimensions.length > 0) disposition = 'contract-failed';
  else if (pass1Passed && scorecard.pass2.review.status === 'changes-requested') disposition = 'craft-changes-requested';
  else if (pass1Passed && scorecard.pass2.review.status === 'rejected') disposition = 'craft-rejected';
  else if (pass1Passed && !pass2Passed) disposition = 'pending-craft';
  if (pass2Passed) disposition = 'accepted';

  return {
    schemaVersion: QUALITY_EVIDENCE_SCHEMA_VERSION,
    componentId: component.id,
    publicName: component.publicName,
    valid: true,
    flagship: component.flagship,
    threshold: component.acceptanceThreshold,
    score: {
      total: totalScore,
      maximum: PASS1_MAXIMUM + PASS2_MAXIMUM,
      pass1: contractScore,
      pass1Maximum: PASS1_MAXIMUM,
      pass2: craftScore,
      pass2Maximum: PASS2_MAXIMUM,
    },
    pass1: {
      passed: pass1Passed,
      hardFailures,
      failedDimensions,
      pendingDimensions,
    },
    pass2: {
      passed: pass2Passed,
      humanApproved,
      reviewStatus: scorecard.pass2.review.status,
      missingEvidence: missingCraftEvidence,
    },
    disposition,
    completionEligible: pass2Passed,
    // Deliberately immutable policy signal: no screenshot, DOM result or score
    // can manufacture sighted craft approval.
    automaticCraftApproval: false,
  };
}
