/**
 * BhSlaMonitor - Core Interface
 * SLA Tracking Dashboard for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhSlaMonitorPreset = 'standard';

/* -- SLA Compliance --------------------------------------------------- */

export interface SlaCompliance {
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

/* -- Breach ----------------------------------------------------------- */

export interface SlaBreach {
  id: string;
  jobName: string;
  stageName: string;
  slaHours: number;
  actualHours: number;
  assignedRecruiter: string;
  recruiterAvatar?: string;
}

/* -- Stage SLA -------------------------------------------------------- */

export type SlaStatusColor = 'green' | 'yellow' | 'red';

export interface StageSla {
  stageName: string;
  avgHours: number;
  limitHours: number;
  status: SlaStatusColor;
}

/* -- At-Risk Items ---------------------------------------------------- */

export interface AtRiskItem {
  id: string;
  type: 'candidate' | 'interview';
  name: string;
  stage: string;
  hoursRemaining: number;
  assignee: string;
}

/* -- History ---------------------------------------------------------- */

export interface SlaHistoryPoint {
  date: string;
  compliance: number;
}

/* -- Configuration ---------------------------------------------------- */

export interface SlaConfig {
  stageId: string;
  stageName: string;
  limitHours: number;
  alertRecipients: string[];
  escalationRules: string;
}

/* -- Main Props ------------------------------------------------------- */

export interface BhSlaMonitorProps extends EngineAwareProps {
  preset?: BhSlaMonitorPreset;

  /* data */
  compliance?: SlaCompliance;
  breaches?: SlaBreach[];
  stageSlaData?: StageSla[];
  atRiskItems?: AtRiskItem[];
  history?: SlaHistoryPoint[];
  config?: SlaConfig[];

  /* state & callbacks */
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  showConfig?: boolean;
  onConfigToggle?: () => void;
  selectedStage?: string | null;
  onStageSelect?: (stage: string | null) => void;
  breachFilter?: 'all' | 'active' | 'resolved';
  onBreachFilterChange?: (filter: 'all' | 'active' | 'resolved') => void;

  /* layout */
  className?: string;
  style?: CSSProperties;
}

export const BH_SLA_MONITOR_DEFAULTS: Partial<BhSlaMonitorProps> = {
  preset: 'standard',
  breaches: [],
  stageSlaData: [],
  atRiskItems: [],
  history: [],
  config: [],
  timeRange: '7d',
  showConfig: false,
  breachFilter: 'all',
};

/* -- Helpers ---------------------------------------------------------- */

export function getSlaStatusColors(tokens: DesignTokens) {
  return {
    green: {
      color: tokens.colors.successScale[700],
      bg: tokens.colors.successScale[50],
      dot: tokens.colors.successScale[500],
      border: tokens.colors.successScale[200],
    },
    yellow: {
      color: tokens.colors.warningScale[700],
      bg: tokens.colors.warningScale[50],
      dot: tokens.colors.warningScale[500],
      border: tokens.colors.warningScale[200],
    },
    red: {
      color: tokens.colors.errorScale[700],
      bg: tokens.colors.errorScale[50],
      dot: tokens.colors.errorScale[500],
      border: tokens.colors.errorScale[200],
    },
  };
}

export function getComplianceColor(
  tokens: DesignTokens,
  percentage: number
): { color: string; bg: string } {
  if (percentage >= 90)
    return {
      color: tokens.colors.successScale[700],
      bg: tokens.colors.successScale[50],
    };
  if (percentage >= 75)
    return {
      color: tokens.colors.warningScale[700],
      bg: tokens.colors.warningScale[50],
    };
  return {
    color: tokens.colors.errorScale[700],
    bg: tokens.colors.errorScale[50],
  };
}

export const TIME_RANGE_OPTIONS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
] as const;
