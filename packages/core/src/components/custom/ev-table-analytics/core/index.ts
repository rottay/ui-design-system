/**
 * EvTableAnalytics - Core Interface
 * Table analytics with revenue heatmap, turnover, dwell time, and AI recommendations
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvTableAnalyticsPreset = 'heatmap' | 'insights';

export interface TableMetric {
  tableId: string;
  tableLabel: string;
  zone: string;
  revenue: number;
  ordersCount: number;
  avgDwellMinutes: number;
  turnoverRate: number;
  avgSpendPerGuest: number;
  peakHour: string;
  occupancyPercent: number;
}

export interface TableInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  tableId?: string;
}

export interface EvTableAnalyticsProps extends EngineAwareProps {
  preset?: EvTableAnalyticsPreset;
  metrics?: TableMetric[];
  insights?: TableInsight[];
  dateRange?: { from: Date; to: Date };
  onTableClick?: (tableId: string) => void;
  onInsightAction?: (insightId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_TABLE_ANALYTICS_DEFAULTS: Partial<EvTableAnalyticsProps> = {
  preset: 'heatmap',
};
