/**
 * @fileoverview dashboard-insight-variants — chrome-tier barrel for the
 * 8 widget-chrome variants that power dashboard insight strips.
 *
 * @description
 * Engine-free chrome family. 8 variants grouped into two subfolders
 * (following the audit's no-repeated-parent rule — activity variants
 * live under `activity/` and metrics variants live under `metrics/`
 * instead of being flat `activity-cards/`, `metrics-rows/`, etc):
 *
 *   - 4 metrics variants: MetricsRows, MetricsCards, MetricsMinimal,
 *     MetricsChart
 *   - 4 activity variants: ActivityTimeline, ActivityCompact,
 *     ActivityCards, ActivityTicker
 *
 * Plus the shared `useVariant` hook (random metrics + activity variant
 * picker, persisted across re-renders via useState init) and the
 * shared variant types.
 *
 * This family is framework-agnostic:
 *   - Primitives (`Box`, `Text`, `Stack`, `Flex`, `Grid`) are imported
 *     relatively from `../../primitives` since the DS cannot depend on
 *     its own published name.
 *   - Navigation goes through the `useNavigationLink()` adapter so
 *     consumers in Next.js, Remix, etc. all work as long as they mount
 *     the corresponding provider (or fall back to a native `<a>` when
 *     none is mounted).
 *
 * Each metrics variant keeps its own local `useCountUp` helper inlined;
 * extracting a shared motion helper is on the audit's future work
 * backlog (Feature 6).
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
export { MetricsRows } from "./metrics/rows";
export { MetricsCards } from "./metrics/cards";
export { MetricsMinimal } from "./metrics/minimal";
export { MetricsChart } from "./metrics/chart";

// Activity variants
export { ActivityTimeline } from "./activity/timeline";
export { ActivityCompact } from "./activity/compact";
export { ActivityCards } from "./activity/cards";
export { ActivityTicker } from "./activity/ticker";
