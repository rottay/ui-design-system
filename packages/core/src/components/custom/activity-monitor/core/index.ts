import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type ActivityMonitorPreset = 'dashboard' | 'compact';

export type LogStatus = 'success' | 'error' | 'warning' | 'running' | 'pending';
export type TimeRange = '24h' | '7d' | '30d' | '6m';
export type DetailTab = 'completion' | 'variables' | 'evaluations' | 'raw';

export interface TimelineDataPoint {
  timestamp: string;
  successCount: number;
  errorCount: number;
  label?: string;
}

export interface Evaluation {
  label: string;
  result: 'pass' | 'fail';
  score?: number;
}

export interface LogDetail {
  metrics: Record<string, string | number>;
  evaluations?: Evaluation[];
  input?: string;
  output?: string;
  rawData?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  name: string;
  latency: string;
  status: LogStatus;
  cost?: string;
  tokens?: number;
  detail?: LogDetail;
}

export interface ActivityMonitorProps extends EngineAwareProps {
  preset?: ActivityMonitorPreset;
  logs: LogEntry[];
  timeline?: TimelineDataPoint[];
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  selectedLogId?: string;
  onLogSelect?: (logId: string) => void;
  activeDetailTab?: DetailTab;
  onDetailTabChange?: (tab: DetailTab) => void;
  onRefresh?: () => void;
  title?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const ACTIVITY_MONITOR_DEFAULTS: Partial<ActivityMonitorProps> = {
  preset: 'dashboard',
  timeRange: '24h',
  title: 'Monitor',
  activeDetailTab: 'completion',
};

export function getLogStatusColors(tokens: DesignTokens) {
  return {
    success: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], dot: tokens.colors.successScale[500] },
    error: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], dot: tokens.colors.errorScale[500] },
    warning: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], dot: tokens.colors.warningScale[500] },
    running: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], dot: tokens.colors.infoScale[500] },
    pending: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], dot: tokens.colors.neutral[400] },
  };
}

export function getEvaluationColors(tokens: DesignTokens) {
  return {
    pass: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    fail: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
  };
}

export function getTimeRangeOptions(): Array<{ value: TimeRange; label: string }> {
  return [
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '6m', label: '6 months' },
  ];
}

export function calculateBarHeight(value: number, maxValue: number, maxHeight: number = 60): number {
  if (maxValue === 0) return 0;
  return Math.max(2, (value / maxValue) * maxHeight);
}
