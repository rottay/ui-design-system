/**
 * EvRevenueMonitor - Core Interface
 * Revenue monitoring
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvRevenueMonitorPreset = 'realtime' | 'historical';

export interface RevenueStream {
  source: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "flat";
  color: string;
}

export interface RevenueTrend {
  date: string;
  tickets: number;
  bar: number;
  tips: number;
  merchandise: number;
  total: number;
}

export interface EvRevenueMonitorProps extends EngineAwareProps {
  preset?: EvRevenueMonitorPreset;
  streams?: RevenueStream[];
  trends?: RevenueTrend[];
  totalRevenue?: number;
  currency?: string;
  onExport?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_REVENUE_MONITOR_DEFAULTS: Partial<EvRevenueMonitorProps> = {
  preset: 'realtime',
  currency: 'USD',
};
