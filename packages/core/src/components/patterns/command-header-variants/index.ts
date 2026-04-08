/**
 * @fileoverview Command Header Variants barrel -- engine-free DS patterns
 * @module @rottay/design-system/patterns/command-header-variants
 *
 * Verbatim extraction (Wave 6.2) of the 8 widget chrome variants that
 * power the dashboard CommandHeader orchestrator. The orchestrator
 * itself stays in app-platform as a transition shell because it carries
 * Rottay-specific narrative (AI moods, fun facts, seeded randomness,
 * ambient particles).
 *
 * The 8 variants are domain-clean and reusable:
 *   - 4 metrics variants: MetricsRows, MetricsCards, MetricsMinimal,
 *     MetricsChart
 *   - 4 activity variants: ActivityTimeline, ActivityCompact,
 *     ActivityCards, ActivityTicker
 *
 * Plus the shared `useVariant` hook (random metrics + activity variant
 * picker, persisted across re-renders via useState init) and the
 * shared variant types.
 *
 * The two non-verbatim adjustments versus the original `_shared/layout/
 * command-header/` files are:
 *   1. `Box, Text, Stack, Flex, Grid` imports from `@rottay/design-system`
 *      → relative imports from `../../primitives` (since DS cannot
 *      depend on its own published name)
 *   2. `Link` from `next/link` → internal `NavLinkAnchor` adapter using
 *      `useNavigationLink()` (mirrors the Wave 5/6.1 precedent)
 *
 * Each metrics variant keeps its own local `useCountUp` helper inlined
 * (Wave 4.6e precedent for inlining instead of creating a shared
 * helper).
 */

// Types
export type {
  MetricsVariant,
  ActivityVariant,
  KeyMetric,
  ActivityItem,
  ScheduleItem,
  MetricsProps,
  ActivityProps,
  VariantConfig,
} from "./types";

// Hook
export { useVariant } from "./use-variant";

// Metrics variants
export { MetricsRows } from "./metrics-rows";
export { MetricsCards } from "./metrics-cards";
export { MetricsMinimal } from "./metrics-minimal";
export { MetricsChart } from "./metrics-chart";

// Activity variants
export { ActivityTimeline } from "./activity-timeline";
export { ActivityCompact } from "./activity-compact";
export { ActivityCards } from "./activity-cards";
export { ActivityTicker } from "./activity-ticker";
