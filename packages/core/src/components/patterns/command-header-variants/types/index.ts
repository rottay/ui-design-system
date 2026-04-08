import type { LucideIcon } from "lucide-react";

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
}

// Variant configuration
export interface VariantConfig {
  metrics?: MetricsVariant | "auto";
  activity?: ActivityVariant | "auto";
}
