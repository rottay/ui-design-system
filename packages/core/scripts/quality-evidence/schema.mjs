import {
  BRAND_FIXTURES,
  CANVASES,
  COMPONENT_EVIDENCE_REGISTRY,
  CONTENT_PROFILES,
  DENSITIES,
  DIRECTIONS,
  LOCALES,
  MOTION_PREFERENCES,
  QUALITY_EVIDENCE_SCHEMA_VERSION,
  RESPONSIVE_CONTEXTS,
} from "./registry.mjs";

export const PASS1_DIMENSIONS = Object.freeze({
  anatomySemantics: 10,
  variantsRecipes: 10,
  stateCompleteness: 10,
  tokenWhitelabelContract: 8,
  responsiveContent: 10,
  inputParity: 10,
  accessibilityI18n: 10,
  behavioralEvidence: 2,
});

export const PASS2_DIMENSIONS = Object.freeze({
  defaultVisualQuality: 15,
  tokenWhitelabelCraft: 7,
  motionQuality: 5,
  documentationVisual: 3,
});

export const HARD_FAILURE_CODES = Object.freeze([
  "overlap-or-clipping",
  "invisible-or-pointer-only-action",
  "focus-indicator-clipped",
  "shared-chrome-hardcode",
  "modern-raw-paint-without-exemption",
  "incoherent-border-radius-grammar",
  "placeholder-only-state",
  "unlocalized-copy",
  "brand-locale-coupling",
  "tenant-fixtures-visually-identical",
]);

const PASS1_STATUSES = new Set(["pending", "pass", "fail", "not-applicable"]);
const CRAFT_REVIEW_STATUSES = new Set([
  "pending",
  "changes-requested",
  "approved",
  "rejected",
]);
const AXIS_KEYS = Object.freeze([
  "density",
  "brand",
  "responsive",
  "direction",
  "locale",
  "motion",
  "input",
  "canvas",
]);
const RISKS = new Set(["low", "standard", "high", "critical"]);
const PROFILES = new Set([
  "static",
  "layout",
  "interactive",
  "control",
  "data",
  "overlay",
]);

export const QUALITY_EVIDENCE_SCHEMA = Object.freeze({
  schemaVersion: QUALITY_EVIDENCE_SCHEMA_VERSION,
  registry: Object.freeze({
    requiredComponentFields: Object.freeze([
      "id",
      "tier",
      "family",
      "name",
      "wave",
      "profile",
      "risk",
      "flagship",
      "acceptanceThreshold",
      "renderedStates",
      "renderedContentProfiles",
      "axes",
      "pairwiseGroups",
      "matrixBudget",
      "pass1",
      "pass2",
    ]),
    axisKeys: AXIS_KEYS,
  }),
  scorecard: Object.freeze({
    pass1Dimensions: PASS1_DIMENSIONS,
    pass2Dimensions: PASS2_DIMENSIONS,
    hardFailureCodes: HARD_FAILURE_CODES,
    pass1Statuses: Object.freeze([...PASS1_STATUSES]),
    craftReviewStatuses: Object.freeze([...CRAFT_REVIEW_STATUSES]),
  }),
});

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameMembers(actual, expected) {
  return (
    actual.length === expected.length &&
    expected.every((value) => actual.includes(value))
  );
}

function requireStringArray(value, path, errors, { nonEmpty = true } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return;
  }
  if (nonEmpty && value.length === 0) errors.push(`${path} must not be empty`);
  if (value.some((entry) => typeof entry !== "string" || entry.trim() === "")) {
    errors.push(`${path} must contain only non-empty strings`);
  }
  if (new Set(value).size !== value.length)
    errors.push(`${path} must not contain duplicates`);
}

function requireExactAxis(component, key, expected, errors) {
  const value = component.axes?.[key];
  requireStringArray(value, `${component.id}.axes.${key}`, errors);
  if (Array.isArray(value) && !sameMembers(value, expected)) {
    errors.push(
      `${component.id}.axes.${key} must cover ${expected.join(", ")}`
    );
  }
}

export function validateComponentEvidenceRegistry(
  registry = COMPONENT_EVIDENCE_REGISTRY
) {
  const errors = [];

  if (!Array.isArray(registry))
    return { valid: false, errors: ["registry must be an array"] };
  if (registry.length !== 89)
    errors.push(
      `registry must contain 89 primitives; received ${registry.length}`
    );

  const ids = new Set();
  const publicNames = new Set();

  for (const component of registry) {
    if (!isRecord(component)) {
      errors.push("registry entries must be objects");
      continue;
    }

    for (const field of QUALITY_EVIDENCE_SCHEMA.registry
      .requiredComponentFields) {
      if (!(field in component))
        errors.push(`${component.id ?? "<unknown>"}.${field} is required`);
    }

    if (!/^DS-P\d{3}$/u.test(component.id ?? ""))
      errors.push(`${component.id ?? "<unknown>"}.id is invalid`);
    if (ids.has(component.id)) errors.push(`${component.id}.id is duplicated`);
    ids.add(component.id);

    if (component.tier !== "primitive")
      errors.push(`${component.id}.tier must equal primitive`);
    if (
      typeof component.publicName !== "string" ||
      !component.publicName.includes("/")
    ) {
      errors.push(`${component.id}.publicName must be family/name`);
    }
    if (publicNames.has(component.publicName))
      errors.push(`${component.id}.publicName is duplicated`);
    publicNames.add(component.publicName);

    if (!Number.isInteger(component.wave) || component.wave < 0)
      errors.push(`${component.id}.wave must be a non-negative integer`);
    if (!PROFILES.has(component.profile))
      errors.push(`${component.id}.profile is invalid`);
    if (!RISKS.has(component.risk))
      errors.push(`${component.id}.risk is invalid`);
    if (typeof component.flagship !== "boolean")
      errors.push(`${component.id}.flagship must be boolean`);
    if (component.acceptanceThreshold !== (component.flagship ? 95 : 90)) {
      errors.push(
        `${component.id}.acceptanceThreshold must be ${
          component.flagship ? 95 : 90
        }`
      );
    }

    requireStringArray(
      component.renderedStates,
      `${component.id}.renderedStates`,
      errors
    );
    requireStringArray(
      component.renderedContentProfiles,
      `${component.id}.renderedContentProfiles`,
      errors
    );
    if (
      !component.renderedStates?.includes(
        component.profile === "overlay" ? "open" : "default"
      )
    ) {
      errors.push(
        `${component.id}.renderedStates lacks its canonical resting state`
      );
    }
    if (
      !sameMembers(component.renderedContentProfiles ?? [], CONTENT_PROFILES)
    ) {
      errors.push(
        `${component.id}.renderedContentProfiles must cover short, long and pathological content`
      );
    }

    if (!isRecord(component.axes))
      errors.push(`${component.id}.axes must be an object`);
    requireExactAxis(component, "density", DENSITIES, errors);
    requireExactAxis(component, "brand", BRAND_FIXTURES, errors);
    requireExactAxis(component, "responsive", RESPONSIVE_CONTEXTS, errors);
    requireExactAxis(component, "direction", DIRECTIONS, errors);
    requireExactAxis(component, "locale", LOCALES, errors);
    requireExactAxis(component, "motion", MOTION_PREFERENCES, errors);
    requireExactAxis(component, "canvas", CANVASES, errors);
    requireStringArray(
      component.axes?.input,
      `${component.id}.axes.input`,
      errors
    );

    if (
      !Array.isArray(component.pairwiseGroups) ||
      component.pairwiseGroups.length === 0
    ) {
      errors.push(`${component.id}.pairwiseGroups must not be empty`);
    } else {
      const groupedAxes = new Set();
      for (const [groupIndex, group] of component.pairwiseGroups.entries()) {
        requireStringArray(
          group,
          `${component.id}.pairwiseGroups[${groupIndex}]`,
          errors
        );
        for (const axis of group ?? []) {
          if (!AXIS_KEYS.includes(axis))
            errors.push(
              `${component.id}.pairwiseGroups references unknown axis ${axis}`
            );
          if (groupedAxes.has(axis))
            errors.push(`${component.id}.pairwiseGroups repeats axis ${axis}`);
          groupedAxes.add(axis);
        }
      }
      for (const axis of AXIS_KEYS) {
        if (!groupedAxes.has(axis))
          errors.push(
            `${component.id}.pairwiseGroups does not cover axis ${axis}`
          );
      }
    }

    if (
      !Number.isInteger(component.matrixBudget) ||
      component.matrixBudget < 1
    ) {
      errors.push(`${component.id}.matrixBudget must be a positive integer`);
    }
    if (component.pass1?.approval !== "automated-contract") {
      errors.push(
        `${component.id}.pass1.approval must equal automated-contract`
      );
    }
    if (component.pass2?.approval !== "human-sighted-review") {
      errors.push(
        `${component.id}.pass2.approval must equal human-sighted-review`
      );
    }
    requireStringArray(
      component.pass1?.requiredEvidence,
      `${component.id}.pass1.requiredEvidence`,
      errors
    );
    requireStringArray(
      component.pass2?.requiredEvidence,
      `${component.id}.pass2.requiredEvidence`,
      errors
    );
  }

  return { valid: errors.length === 0, errors };
}

function validateEvidenceItem(item, path, errors) {
  if (!isRecord(item)) {
    errors.push(`${path} must be an object`);
    return;
  }
  if (!PASS1_STATUSES.has(item.status))
    errors.push(`${path}.status is invalid`);
  requireStringArray(item.evidence, `${path}.evidence`, errors, {
    nonEmpty: false,
  });
  if (
    (item.status === "pass" || item.status === "not-applicable") &&
    (!Array.isArray(item.evidence) || item.evidence.length === 0)
  ) {
    errors.push(
      `${path} cannot ${
        item.status === "pass" ? "pass" : "be waived"
      } without evidence references`
    );
  }
  if (
    item.status === "not-applicable" &&
    (typeof item.reason !== "string" || item.reason.trim() === "")
  ) {
    errors.push(`${path} not-applicable requires a reason`);
  }
}

export function validateQualityScorecard(
  scorecard,
  registry = COMPONENT_EVIDENCE_REGISTRY
) {
  const errors = [];
  if (!isRecord(scorecard))
    return { valid: false, errors: ["scorecard must be an object"] };
  if (scorecard.schemaVersion !== QUALITY_EVIDENCE_SCHEMA_VERSION)
    errors.push("scorecard.schemaVersion must equal 1");
  if (
    typeof scorecard.evidenceRevision !== "string" ||
    scorecard.evidenceRevision.trim() === ""
  ) {
    errors.push("scorecard.evidenceRevision must be a non-empty string");
  }

  const component = registry.find(
    (entry) => entry.id === scorecard.componentId
  );
  if (!component)
    errors.push(
      `scorecard.componentId ${
        scorecard.componentId ?? "<missing>"
      } is not registered`
    );

  if (!isRecord(scorecard.pass1)) {
    errors.push("scorecard.pass1 must be an object");
  } else {
    if (!isRecord(scorecard.pass1.dimensions))
      errors.push("scorecard.pass1.dimensions must be an object");
    for (const dimension of Object.keys(PASS1_DIMENSIONS)) {
      validateEvidenceItem(
        scorecard.pass1.dimensions?.[dimension],
        `scorecard.pass1.dimensions.${dimension}`,
        errors
      );
    }
    requireStringArray(
      scorecard.pass1.hardFailures,
      "scorecard.pass1.hardFailures",
      errors,
      { nonEmpty: false }
    );
    for (const code of scorecard.pass1.hardFailures ?? []) {
      if (!HARD_FAILURE_CODES.includes(code))
        errors.push(
          `scorecard.pass1.hardFailures contains unknown code ${code}`
        );
    }
  }

  if (!isRecord(scorecard.pass2)) {
    errors.push("scorecard.pass2 must be an object");
  } else {
    if (!isRecord(scorecard.pass2.scores))
      errors.push("scorecard.pass2.scores must be an object");
    for (const [dimension, maximum] of Object.entries(PASS2_DIMENSIONS)) {
      const value = scorecard.pass2.scores?.[dimension];
      if (!Number.isFinite(value) || value < 0 || value > maximum) {
        errors.push(
          `scorecard.pass2.scores.${dimension} must be between 0 and ${maximum}`
        );
      }
    }
    if (!isRecord(scorecard.pass2.review)) {
      errors.push("scorecard.pass2.review must be an object");
    } else {
      if (!CRAFT_REVIEW_STATUSES.has(scorecard.pass2.review.status))
        errors.push("scorecard.pass2.review.status is invalid");
      if (scorecard.pass2.review.status === "approved") {
        if (
          typeof scorecard.pass2.review.reviewer !== "string" ||
          scorecard.pass2.review.reviewer.trim() === ""
        ) {
          errors.push("approved craft review requires reviewer");
        }
        if (
          typeof scorecard.pass2.review.reviewedAt !== "string" ||
          Number.isNaN(Date.parse(scorecard.pass2.review.reviewedAt))
        ) {
          errors.push(
            "approved craft review requires an ISO reviewedAt timestamp"
          );
        }
        if (
          typeof scorecard.pass2.review.notes !== "string" ||
          scorecard.pass2.review.notes.trim() === ""
        ) {
          errors.push("approved craft review requires review notes");
        }
      }
    }
    if (!isRecord(scorecard.pass2.evidence)) {
      errors.push("scorecard.pass2.evidence must be an object");
    } else if (component) {
      for (const evidenceKey of component.pass2.requiredEvidence) {
        requireStringArray(
          scorecard.pass2.evidence[evidenceKey],
          `scorecard.pass2.evidence.${evidenceKey}`,
          errors,
          { nonEmpty: false }
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
