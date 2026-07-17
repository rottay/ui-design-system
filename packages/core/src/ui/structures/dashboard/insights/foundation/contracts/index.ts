import type { ComponentType } from 'react';
import type { DensityMode } from '../../../../../../foundation/tokens/ts/foundation/base/density';
type LucideIcon = ComponentType<any>;

// Variant types
export type MetricsVariant = "rows" | "cards" | "minimal" | "chart";
export type ActivityVariant = "timeline" | "compact" | "cards" | "ticker";

// Data interfaces
export interface KeyMetric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  unit?: string;
  progress?: number;
}

export interface ActivityItem {
  text: string;
  time: string;
  type: "success" | "primary" | "info" | "warning" | "error";
  icon?: LucideIcon;
  label?: string;
  sublabel?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
}

// Component props
export interface MetricsProps {
  metrics: KeyMetric[];
  /**
   * Presentation density (design-language §3). `comfortable` (default) uses
   * `1rem` card padding and maps to the `md` metric preset; `compact` uses
   * `0.75rem` and maps to `sm`. Resolved from the `--ds-density-card-padding`
   * token with a literal fallback, so embedded / beside-chat metric strips
   * render denser than route-grade dashboards.
   * @default 'comfortable'
   */
  density?: DensityMode;
}

export interface ActivityProps {
  items: ActivityItem[];
  schedule?: ScheduleItem[];
  /**
   * Optional URL for the activity-list "View all" CTA. When omitted the
   * CTA is hidden, which keeps the variant domain-clean and reusable
   * across apps that don't have a dedicated activity index page.
   */
  viewAllHref?: string;
  /**
   * Optional label for the activity-list "View all" CTA. Defaults to
   * `"View all"`. Only rendered when `viewAllHref` is set.
   */
  viewAllLabel?: string;
}

// Variant configuration
export interface VariantConfig {
  metrics?: MetricsVariant | "auto";
  activity?: ActivityVariant | "auto";
}
