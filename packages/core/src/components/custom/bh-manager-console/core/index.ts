import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhManagerConsolePreset = 'overview' | 'performance';

export type SlaStatus = 'green' | 'yellow' | 'red';
export type AlertSeverity = 'critical' | 'warning';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TrendDirection = 'up' | 'down' | 'flat';
export type DateRangeOption = '7d' | '14d' | '30d' | '90d';
export type MetricViewMode = 'heatmap' | 'list';

export interface Team {
  id: string;
  name: string;
  memberCount: number;
  lead: string;
}

export interface TeamKpi {
  label: string;
  value: string | number;
  trend: TrendDirection;
  trendValue: string;
  sparklineData: number[];
}

export interface RecruiterWorkload {
  recruiterId: string;
  name: string;
  avatar?: string;
  metrics: Record<string, number>;
}

export interface SlaItem {
  stage: string;
  avgHours: number;
  limitHours: number;
  status: SlaStatus;
}

export interface TaskCard {
  id: string;
  title: string;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
}

export interface PipelineStage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PerformanceAlert {
  id: string;
  recruiterName: string;
  metric: string;
  threshold: number;
  actual: number;
  severity: AlertSeverity;
}

export interface SprintSummary {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
}

export interface BhManagerConsoleProps extends EngineAwareProps {
  preset?: BhManagerConsolePreset;
  teams: Team[];
  selectedTeamId?: string;
  onTeamChange?: (teamId: string) => void;
  kpis?: TeamKpi[];
  recruiters?: RecruiterWorkload[];
  metricColumns?: string[];
  slaItems?: SlaItem[];
  tasks?: TaskCard[];
  onTaskReassign?: (taskId: string, fromRecruiter: string, toRecruiter: string) => void;
  pipeline?: PipelineStage[];
  alerts?: PerformanceAlert[];
  onAlertDismiss?: (alertId: string) => void;
  sprint?: SprintSummary;
  dateRange?: DateRangeOption;
  onDateRangeChange?: (range: DateRangeOption) => void;
  onRecruiterClick?: (recruiterId: string) => void;
  onExport?: () => void;
  title?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_MANAGER_CONSOLE_DEFAULTS: Partial<BhManagerConsoleProps> = {
  preset: 'overview',
  dateRange: '30d',
  title: 'Team Manager Console',
  metricColumns: ['Open Reqs', 'Screens', 'Interviews', 'Offers', 'Hires', 'Time to Fill'],
};
