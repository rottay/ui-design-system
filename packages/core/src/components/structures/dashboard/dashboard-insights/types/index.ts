import type { ComponentType } from 'react';
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
