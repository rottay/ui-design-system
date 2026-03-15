/**
 * EvAnalyticsHub - Core Interface
 * Analytics command center
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvAnalyticsHubPreset = 'realtime' | 'historical';

export interface RealtimeMetric {
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "flat";
  sparklineData?: number[];
}

export interface AnalyticsChart {
  id: string;
  title: string;
  type: "line" | "bar" | "pie" | "area";
  dataPoints: Array<{ label: string;
  value: number }>;
  color?: string;
}

export interface PredictionItem {
  id: string;
  metric: string;
  predicted: number;
  confidence: number;
  timeframe: string;
}

export interface BenchmarkEntry {
  metric: string;
  current: number;
  benchmark: number;
  percentile: number;
}

export interface EvAnalyticsHubProps extends EngineAwareProps {
  preset?: EvAnalyticsHubPreset;
  realtimeMetrics?: RealtimeMetric[];
  charts?: AnalyticsChart[];
  predictions?: PredictionItem[];
  benchmarks?: BenchmarkEntry[];
  onChartClick?: (chartId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ANALYTICS_HUB_DEFAULTS: Partial<EvAnalyticsHubProps> = {
  preset: 'realtime',

};
