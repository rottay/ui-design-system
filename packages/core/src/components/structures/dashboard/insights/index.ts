/**
 * @fileoverview dashboard insights — structures-tier barrel for the
 * 8 widget-chrome variants that power dashboard insight strips.
 *
 * @description
 * Engine-free structures family organized by responsibility: stable shared
 * contracts and tokens live in `foundation/`, variant selection lives in
 * `runtime/`, and the activity/metrics renderers live in `presentation/`.
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
 *   - Renderers compose DS primitives (`Box`, `Text`, `Stack`, `Flex`,
 *     `Grid`) through the package's internal source alias.
 *   - Navigation goes through the `useNavigationLink()` adapter so
 *     consumers in Next.js, Remix, etc. all work as long as they mount
 *     the corresponding provider (or fall back to a native `<a>` when
 *     none is mounted).
 *
 * All metrics variants use the canonical `useSmoothCounter` from
 * `@/graphics/motion/react/runtime` for counter animations (consolidated in Wave X3).
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
} from "./foundation/contracts";

// Hook
export { useVariant } from "./runtime/variant";

// Rendered variants
export {
  MetricsRows,
  MetricsCards,
  MetricsMinimal,
  MetricsChart,
  ActivityTimeline,
  ActivityCompact,
  ActivityCards,
  ActivityTicker,
} from "./presentation";
