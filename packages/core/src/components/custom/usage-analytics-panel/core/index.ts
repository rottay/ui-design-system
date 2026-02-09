import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type UsageAnalyticsPanelPreset = 'dashboard' | 'widget';

export interface UsageMetric {
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  color?: string;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export interface UsageDataset {
  label: string;
  data: TimeSeriesPoint[];
  color?: string;
}

export interface UsageAnalyticsPanelProps extends EngineAwareProps {
  preset?: UsageAnalyticsPanelPreset;
  metrics: UsageMetric[];
  datasets?: UsageDataset[];
  period?: string;
  onPeriodChange?: (period: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const USAGE_ANALYTICS_PANEL_DEFAULTS: Partial<UsageAnalyticsPanelProps> = {
  preset: 'dashboard',
  title: 'Usage Analytics',
};

export function getTrendColors(tokens: DesignTokens) {
  return {
    up: { color: tokens.colors.successScale[600], bgColor: tokens.colors.successScale[50] },
    down: { color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50] },
    stable: { color: tokens.colors.neutral[500], bgColor: tokens.colors.neutral[100] },
  };
}

export function formatChangePercent(current: number, previous: number): string {
  if (previous === 0) return '+100%';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function getDefaultPeriodOptions(): Array<{ value: string; label: string }> {
  return [
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
  ];
}
