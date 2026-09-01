"use client";

import { useState } from "react";
import type { MetricsVariant, ActivityVariant } from "../../foundation/contracts";

interface StoredVariants {
  metrics: MetricsVariant;
  activity: ActivityVariant;
}

const METRICS_VARIANTS: MetricsVariant[] = ["rows", "cards", "minimal", "chart"];
const ACTIVITY_VARIANTS: ActivityVariant[] = ["timeline", "compact", "cards", "ticker"];

function getRandomVariants(): StoredVariants {
  return {
    metrics: METRICS_VARIANTS[Math.floor(Math.random() * METRICS_VARIANTS.length)],
    activity: ACTIVITY_VARIANTS[Math.floor(Math.random() * ACTIVITY_VARIANTS.length)],
  };
}

export function useVariant(
  metricsOverride?: MetricsVariant | "auto",
  activityOverride?: ActivityVariant | "auto"
): StoredVariants {
  const [variants] = useState<StoredVariants>(() => getRandomVariants());

  return {
    metrics: metricsOverride && metricsOverride !== "auto" ? metricsOverride : variants.metrics,
    activity: activityOverride && activityOverride !== "auto" ? activityOverride : variants.activity,
  };
}
