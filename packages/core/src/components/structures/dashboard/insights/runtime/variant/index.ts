"use client";

import type { MetricsVariant, ActivityVariant } from "../../foundation/contracts";

interface StoredVariants {
  metrics: MetricsVariant;
  activity: ActivityVariant;
}

const METRICS_VARIANTS: MetricsVariant[] = ["rows", "cards", "minimal", "chart"];
const ACTIVITY_VARIANTS: ActivityVariant[] = ["timeline", "compact", "cards", "ticker"];

/**
 * The anatomy a caller gets when it declares `"auto"`.
 *
 * `"auto"` used to mean a die roll per mount, so the server rendered one
 * anatomy and the client another, and two users of the same tenant saw two
 * different products. It means the canonical variant now: a surface that wants
 * a different one names it.
 */
const DEFAULT_VARIANTS: StoredVariants = {
  metrics: METRICS_VARIANTS[0],
  activity: ACTIVITY_VARIANTS[0],
};

export function useVariant(
  metricsOverride?: MetricsVariant | "auto",
  activityOverride?: ActivityVariant | "auto"
): StoredVariants {
  return {
    metrics:
      metricsOverride && metricsOverride !== "auto"
        ? metricsOverride
        : DEFAULT_VARIANTS.metrics,
    activity:
      activityOverride && activityOverride !== "auto"
        ? activityOverride
        : DEFAULT_VARIANTS.activity,
  };
}
