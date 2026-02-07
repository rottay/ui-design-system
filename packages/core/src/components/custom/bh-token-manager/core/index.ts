/**
 * BhTokenManager - Core Interface
 * Token & Billing Dashboard for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhTokenManagerPreset = 'overview' | 'detailed';

export interface TokenBalance {
  balance: number;
  burnRatePerDay: number;
  projectedRunwayDays: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ConsumptionDataPoint {
  date: string;
  amount: number;
}

export interface CostBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TeamQuota {
  teamId: string;
  teamName: string;
  used: number;
  limit: number;
}

export interface TokenTransaction {
  id: string;
  date: string;
  type: 'usage' | 'purchase' | 'credit';
  amount: number;
  provider?: string;
  team?: string;
  cost: number;
  runningBalance: number;
}

export interface AlertConfig {
  id: string;
  type: 'low_balance' | 'high_usage' | 'quota_exceeded';
  threshold: number;
  enabled: boolean;
}

export interface ForecastPoint {
  date: string;
  projected: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface BhTokenManagerProps extends EngineAwareProps {
  preset?: BhTokenManagerPreset;

  /** Current token balance information */
  balance?: TokenBalance;

  /** Consumption data for charting */
  consumptionData?: ConsumptionDataPoint[];

  /** Cost breakdown items for donut chart */
  costBreakdown?: CostBreakdownItem[];

  /** Per-team quota configuration */
  teamQuotas?: TeamQuota[];

  /** Transaction history records */
  transactions?: TokenTransaction[];

  /** Alert configuration entries */
  alerts?: AlertConfig[];

  /** Forecast projection points */
  forecast?: ForecastPoint[];

  /** Current time range selection */
  timeRange?: '7d' | '30d' | '90d' | 'year';

  /** Callback when time range changes */
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | 'year') => void;

  /** Current cost grouping mode */
  costGrouping?: 'provider' | 'operation' | 'team';

  /** Callback when cost grouping changes */
  onCostGroupingChange?: (grouping: 'provider' | 'operation' | 'team') => void;

  /** Currently selected team filter */
  selectedTeam?: string | null;

  /** Callback when a team is selected */
  onTeamSelect?: (teamId: string | null) => void;

  /** Whether the quota modal is shown */
  showQuotaModal?: boolean;

  /** Callback to toggle the quota modal */
  onQuotaModalToggle?: (show: boolean) => void;

  /** Current transaction filter */
  transactionFilter?: 'all' | 'usage' | 'purchase' | 'credit';

  /** Callback when transaction filter changes */
  onTransactionFilterChange?: (filter: 'all' | 'usage' | 'purchase' | 'credit') => void;

  /** Current forecast period */
  forecastPeriod?: '30d' | '60d' | '90d';

  /** Callback when forecast period changes */
  onForecastPeriodChange?: (period: '30d' | '60d' | '90d') => void;

  /** Callback to initiate token top-up */
  onTopUp?: () => void;

  /** Callback when alert configuration changes */
  onAlertConfigChange?: (alertId: string, config: Partial<AlertConfig>) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TOKEN_MANAGER_DEFAULTS: Partial<BhTokenManagerProps> = {
  preset: 'overview',
};
