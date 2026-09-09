/**
 * @fileoverview The vertical envelope's range law, stated once for every
 * transport that publishes an artifact.
 *
 * The v1 terminal and the v2 adapter take the SAME `verticalEnvelope` option,
 * so they must answer "is this envelope well formed" and "does this document's
 * dials fit inside it" identically. Before this owner existed only the v1
 * terminal asked either question, which is how a v2 publication accepted a
 * radius the same envelope refused on the v1 path.
 *
 * @module Compilers/TenantTheme/Foundation/Envelope
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantAppearanceGeneral } from "@/foundation/contracts/composition/tenants/themes";
import type {
  TenantThemeValidationIssue,
  TenantThemeVerticalEnvelope,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
  TENANT_THEME_RADIUS_SCALE_BOUNDS,
  TENANT_THEME_TYPE_SCALE_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { isInsideEnvelopeRange } from "@/contracts/theme/runtime/envelopes";

/** The global v1 caps a vertical envelope may narrow but never widen. */
const RANGE_BOUNDS = Object.freeze({
  densityScale: { min: 0.75, max: 1.25 },
  effectIntensity: TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
  motionIntensity: { min: 0, max: 1 },
  motionDurationScale: { min: 0.5, max: 1.5 },
  typeScale: TENANT_THEME_TYPE_SCALE_BOUNDS,
  radiusScale: TENANT_THEME_RADIUS_SCALE_BOUNDS,
} as const);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Whether the envelope's own `ranges` are finite, ordered and inside the global
 * caps. An envelope that fails this is refused before any document is measured
 * against it, because a malformed range cannot say what it permits.
 */
export function envelopeRangeShapeIssues(
  ranges: unknown
): TenantThemeValidationIssue[] {
  const issues: TenantThemeValidationIssue[] = [];
  if (ranges === undefined) return issues;
  if (!isPlainObject(ranges)) {
    issues.push({
      code: "invalid_type",
      path: "$.verticalEnvelope.ranges",
      message: "Expected a ranges object",
    });
    return issues;
  }
  for (const [key, value] of Object.entries(ranges)) {
    const global = RANGE_BOUNDS[key as keyof typeof RANGE_BOUNDS];
    if (!global) {
      issues.push({
        code: "unknown_key",
        path: `$.verticalEnvelope.ranges.${key}`,
        message: "Unknown range",
      });
      continue;
    }
    if (
      !isPlainObject(value) ||
      Object.keys(value).some((field) => field !== "min" && field !== "max") ||
      typeof value.min !== "number" ||
      typeof value.max !== "number" ||
      !Number.isFinite(value.min) ||
      !Number.isFinite(value.max) ||
      value.min > value.max ||
      value.min < global.min ||
      value.max > global.max
    ) {
      issues.push({
        code: "invalid_value",
        path: `$.verticalEnvelope.ranges.${key}`,
        message: "Range must be finite, ordered and inside global v1 caps",
      });
    }
  }
  return issues;
}

/**
 * The dials an envelope range governs, named by their v1 general field. The
 * field spelling is also the catalog's `keypath.document` tail, which is how
 * the v2 adapter maps a refusal back onto the decision that authored it.
 */
export const ENVELOPE_RANGED_DIALS = Object.freeze([
  "motion.intensity",
  "motion.durationScale",
  "typography.scale",
  "shape.radiusScale",
  "surfaces.effectIntensity",
] as const);

export type EnvelopeRangedDial = (typeof ENVELOPE_RANGED_DIALS)[number];

function dialValue(
  general: TenantAppearanceGeneral | undefined,
  dial: EnvelopeRangedDial
): number | undefined {
  switch (dial) {
    case "motion.intensity":
      return general?.motion?.intensity;
    case "motion.durationScale":
      return general?.motion?.durationScale;
    case "typography.scale":
      return general?.typography?.scale;
    case "shape.radiusScale":
      return general?.shape?.radiusScale;
    case "surfaces.effectIntensity":
      return general?.surfaces?.effectIntensity;
  }
}

function dialRange(
  ranges: TenantThemeVerticalEnvelope["ranges"],
  dial: EnvelopeRangedDial
): { min: number; max: number } | undefined {
  switch (dial) {
    case "motion.intensity":
      return ranges?.motionIntensity;
    case "motion.durationScale":
      return ranges?.motionDurationScale;
    case "typography.scale":
      return ranges?.typeScale;
    case "shape.radiusScale":
      return ranges?.radiusScale;
    case "surfaces.effectIntensity":
      return ranges?.effectIntensity;
  }
}

/**
 * The named refusal a DIRECTLY authored dial earns when it leaves the vertical
 * envelope. A profile default never reaches here: it is clamped by the
 * expansion station, which is the difference between "the tenant asked for
 * something this vertical forbids" and "this vertical narrows a default".
 */
export function envelopeDialIssues(input: {
  general: TenantAppearanceGeneral | undefined;
  ranges: TenantThemeVerticalEnvelope["ranges"];
  verticalKey: string;
  pathOf: (dial: EnvelopeRangedDial) => string;
}): TenantThemeValidationIssue[] {
  const issues: TenantThemeValidationIssue[] = [];
  for (const dial of ENVELOPE_RANGED_DIALS) {
    // The VERDICT is `contracts/theme/runtime/envelopes`'; only the spelling of
    // the path is the transport's.
    const value = dialValue(input.general, dial);
    if (value !== undefined && !isInsideEnvelopeRange(value, dialRange(input.ranges, dial))) {
      issues.push({
        code: "invalid_value",
        path: input.pathOf(dial),
        message: `Value exceeds the ${input.verticalKey} envelope`,
      });
    }
  }
  return issues;
}
