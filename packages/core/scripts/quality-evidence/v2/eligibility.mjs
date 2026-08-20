import {
  divergenceMinimumFor,
  getFamily,
  layerThresholdFor,
  loadProgramContracts,
} from './contracts.mjs';
import { improvedDimensionCount, scoreCraft } from './craft-score.mjs';
import { validateReceipts } from './receipts.mjs';

export const FAMILY_STATUSES = Object.freeze([
  'ELEVATED_PENDING_CODEX_AUDIT',
  'ALREADY_REFERENCE_GRADE_PENDING_CODEX_AUDIT',
  'ASSESSED_NOT_ELEVATED',
  'BLOCKED_OWNER_DECISION',
]);

const NON_PRODUCTIVE_SOURCE = [
  /(^|\/)tests?\//,
  /\.test\.[cm]?[jt]sx?$/,
  /\.spec\.[cm]?[jt]sx?$/,
  /\.stories\.[cm]?[jt]sx?$/,
  /(^|\/)__snapshots__\//,
  /(^|\/)docs?-engineering\//,
  /(^|\/)styles\//,
  /(^|\/)dist\//,
  /\.md$/,
];

export function isProductiveSourceChange(relativePath) {
  return !NON_PRODUCTIVE_SOURCE.some((pattern) => pattern.test(relativePath));
}

function collectFailureTaxonomy(receipt, contracts) {
  const declared = receipt?.failureTaxonomy ?? {};
  const categories = contracts.visualCraft.failureTaxonomy.categories;
  const outcomes = new Set(contracts.visualCraft.failureTaxonomy.outcomes);
  const failures = [];
  let evaluated = 0;
  let failed = 0;
  let notApplicable = 0;

  for (const [category, checks] of Object.entries(categories)) {
    const declaredCategory = declared?.[category];
    if (!Array.isArray(declaredCategory)) {
      failures.push(`failure taxonomy category ${category} is omitted`);
      continue;
    }
    if (declaredCategory.length !== checks.length) {
      failures.push(
        `failure taxonomy category ${category} declares ${declaredCategory.length} of ${checks.length} checks`,
      );
    }
    declaredCategory.forEach((row, index) => {
      evaluated += 1;
      if (!outcomes.has(row?.outcome)) {
        failures.push(`failure taxonomy ${category}[${index}] outcome is not PASS/FAIL/NOT_APPLICABLE_WITH_REASON`);
        return;
      }
      if (row.outcome === 'FAIL') failed += 1;
      if (row.outcome === 'NOT_APPLICABLE_WITH_REASON') {
        notApplicable += 1;
        if (typeof row.reason !== 'string' || row.reason.trim().length === 0) {
          failures.push(`failure taxonomy ${category}[${index}] uses N/A without naming the absent capability`);
        }
      }
    });
  }

  return {
    categoriesDeclared: Object.keys(declared ?? {}).length,
    categoriesRequired: Object.keys(categories).length,
    checksEvaluated: evaluated,
    checksRequired: Object.values(categories).reduce((sum, checks) => sum + checks.length, 0),
    failed,
    notApplicable,
    failures,
  };
}

function collectStressFloor(receipt, contracts) {
  const matrix = contracts.rubric.stressMatrix;
  const declared = receipt?.applicableStressCases ?? {};
  const missing = [];
  for (const [axis, cases] of Object.entries(matrix)) {
    const declaredAxis = declared?.[axis];
    if (!Array.isArray(declaredAxis)) {
      missing.push(`stress axis ${axis} is not declared`);
      continue;
    }
    for (const value of cases) {
      if (!declaredAxis.includes(value)) missing.push(`stress axis ${axis} omits floor case ${String(value)}`);
    }
  }
  return { missing, resilience: missing.length === 0 ? 1 : 0 };
}

/**
 * Binary eligibility. This function never awards a craft point: it consumes the
 * separately computed sighted score only to compare it against the layer threshold.
 */
export function evaluateFamilyEligibility(receipt, options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const blockers = [];
  const notes = [];

  const family = getFamily(contracts, receipt?.familyId);
  // The denominator is read from the inventory that just answered, never restated. A literal
  // here would go on naming a count the catalog had already left behind.
  if (!family) {
    blockers.push(
      `family ${receipt?.familyId ?? '<missing>'} is not one of the ${contracts.inventory.rows.length} families in the canonical inventory`,
    );
  }

  if (!FAMILY_STATUSES.includes(receipt?.finalPendingStatus)) {
    blockers.push(`finalPendingStatus must be one of ${FAMILY_STATUSES.join(', ')}`);
  }

  for (const field of contracts.rubric.familyCompletionContract.requiredFamilyReceiptFields) {
    if (receipt?.[field] === undefined) blockers.push(`family receipt is missing ${field}`);
  }

  const layerProfile = receipt?.layerProfile ?? family?.layerProfile ?? null;
  const threshold = layerProfile ? layerThresholdFor(contracts, layerProfile) : null;
  if (threshold === null) {
    blockers.push(
      `family has no resolved layer profile, so no acceptance threshold can be applied (fail closed)`,
    );
  }

  const after = scoreCraft(receipt?.afterDimensionScores ?? {}, { contracts });
  const before = scoreCraft(receipt?.beforeDimensionScores ?? {}, { contracts });
  blockers.push(...after.violations.map((violation) => `after scorecard: ${violation}`));
  blockers.push(...before.violations.map((violation) => `before scorecard: ${violation}`));

  if (threshold !== null && after.score < threshold) {
    blockers.push(`craft score ${after.score} is below the ${layerProfile} threshold ${threshold}`);
  }
  if (after.criticalShortfalls.length > 0) {
    blockers.push(
      `critical dimensions below 4/5: ${after.criticalShortfalls.map((row) => row.dimensionId).join(', ')}`,
    );
  }

  const vetoes = Array.isArray(receipt?.vetoes) ? receipt.vetoes : [];
  const unknownVetoes = vetoes.filter((veto) => !contracts.rubric.hardVetoes.includes(veto));
  if (unknownVetoes.length > 0) notes.push(`unrecognized veto ids: ${unknownVetoes.join(', ')}`);
  if (vetoes.length > 0) blockers.push(`hard veto count is ${vetoes.length}, must be zero`);

  const p0p1 = Array.isArray(receipt?.remainingP0P1Defects) ? receipt.remainingP0P1Defects : [];
  if (p0p1.length > 0) blockers.push(`${p0p1.length} P0/P1 defects remain open`);

  const taxonomy = collectFailureTaxonomy(receipt, contracts);
  blockers.push(...taxonomy.failures);
  if (taxonomy.failed > 0) blockers.push(`${taxonomy.failed} applicable failure-taxonomy checks FAIL`);

  const stress = collectStressFloor(receipt, contracts);
  blockers.push(...stress.missing);

  const divergenceProfile = receipt?.divergenceProfile ?? family?.divergenceProfile ?? null;
  const divergenceMinimum = divergenceProfile ? divergenceMinimumFor(contracts, divergenceProfile) : null;
  const axes = Array.isArray(receipt?.tenantDivergenceAxes) ? receipt.tenantDivergenceAxes : [];
  const unknownAxes = axes.filter((axis) => !contracts.rubric.tenantDivergenceAxes.includes(axis));
  if (unknownAxes.length > 0) blockers.push(`unknown tenant divergence axes: ${unknownAxes.join(', ')}`);
  if (divergenceMinimum === null) {
    blockers.push('family has no resolved divergence profile, so the axis minimum cannot be applied');
  } else if (axes.length < divergenceMinimum) {
    blockers.push(`tenant divergence declares ${axes.length} axes, minimum for ${divergenceProfile} is ${divergenceMinimum}`);
  }
  const nonColorAxes = axes.filter((axis) => axis !== 'color');
  if (divergenceMinimum !== null && divergenceMinimum > 0 && nonColorAxes.length === 0) {
    blockers.push('tenant divergence is color-only, which is a hard veto');
  }

  const restore = receipt?.staticDbCausalityAndRestore;
  if (restore?.staticPathCausal !== true || restore?.dbPathCausal !== true || restore?.exactRestore !== true) {
    blockers.push('static and DB paths must both mutate causally and restore the exact default');
  }

  const receiptCheck = validateReceipts(receipt?.evidenceReceipts, { contracts, root: options.root });
  if (!receiptCheck.valid) {
    blockers.push(`${receiptCheck.failed} of ${receiptCheck.total} evidence receipts are stale or invalid`);
  }

  if (receipt?.codexSightedApproval === true) {
    blockers.push('Claude may not record DT sighted approval; only the DT may accept sighted quality');
  }

  const productiveChanges = (receipt?.sourceFilesChanged ?? []).filter(isProductiveSourceChange);
  const status = receipt?.finalPendingStatus;

  if (status === 'ELEVATED_PENDING_CODEX_AUDIT') {
    if (productiveChanges.length === 0) {
      blockers.push('ELEVATED requires a material productive source change; tests/docs/generated output award zero craft');
    }
    const floors =
      contracts.rubric.familyCompletionContract.materialImprovement
        .minimumImprovedDimensionsUnlessEveryOtherApplicableDimensionAlreadyMeetsFloor;
    const requiredImproved = layerProfile ? floors[layerProfile] : null;
    const { improved } = improvedDimensionCount(
      receipt?.beforeDimensionScores ?? {},
      receipt?.afterDimensionScores ?? {},
      { contracts },
    );
    const premiumFloor = contracts.rubric.familyCompletionContract.materialImprovement.premiumDimensionFloor;
    const unchangedBelowFloor = before.rows
      .filter((row) => row.applicable && !improved.includes(row.dimensionId))
      .filter((row) => (row.effectiveScore ?? 0) < premiumFloor)
      .map((row) => row.dimensionId);
    if (requiredImproved !== null && improved.length < requiredImproved && unchangedBelowFloor.length > 0) {
      blockers.push(
        `improved ${improved.length} dimensions but ${layerProfile} requires ${requiredImproved} unless every unchanged applicable dimension already proved 4/5 (below floor: ${unchangedBelowFloor.join(', ')})`,
      );
    }
  }

  if (status === 'ALREADY_REFERENCE_GRADE_PENDING_CODEX_AUDIT' && productiveChanges.length > 0) {
    blockers.push('ALREADY_REFERENCE_GRADE permits no productive source edit');
  }

  const eligible = blockers.length === 0 && receipt?.finalPendingStatus !== 'BLOCKED_OWNER_DECISION';

  return {
    schemaVersion: 2,
    familyId: receipt?.familyId ?? null,
    layerProfile,
    threshold,
    craftScore: after.score,
    resilience: stress.resilience,
    failureTaxonomy: {
      categoriesDeclared: taxonomy.categoriesDeclared,
      categoriesRequired: taxonomy.categoriesRequired,
      checksEvaluated: taxonomy.checksEvaluated,
      checksRequired: taxonomy.checksRequired,
      failed: taxonomy.failed,
      notApplicable: taxonomy.notApplicable,
    },
    binaryEligible: eligible,
    maximumClaim: contracts.evidence.roundMaximumClaim,
    sightedAuthority: contracts.rubric.eligibility.finalSightedAuthority,
    blockers,
    notes,
  };
}
