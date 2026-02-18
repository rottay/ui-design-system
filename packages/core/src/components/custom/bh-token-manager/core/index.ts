/**
 * BhTokenManager - Core Interface
 * Token & Billing Dashboard for BitHire ATS platform
 *
 * Token types imported from @rottay/recruiter (single source of truth).
 * TokenBalance fields: currentBalance, reservedBalance, lifetimePurchased, lifetimeConsumed,
 *   lowBalanceThreshold, autoPurchaseEnabled, etc.
 * TokenTransaction fields: transactionType, amount, balanceBefore, balanceAfter, etc.
 * DBQuota fields from @rottay/ia-chat: quotaLimit, quotaUsed, alertThreshold, etc.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBQuota, DBUsage } from '@rottay/ia-chat';
import type {
  TokenBalance as DBTokenBalance,
  DBTokenTransaction,
} from '@rottay/recruiter';

export type BhTokenManagerPreset = 'overview' | 'detailed';

/**
 * Display balance summary - derived from DBTokenBalance fields.
 */
export interface TokenBalanceSummary {
  /** DBTokenBalance.currentBalance */
  balance: number;
  /** Computed from recent transactions */
  burnRatePerDay: number;
  /** Computed projection */
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

/**
 * Team quota display - derived from DBQuota fields.
 */
export interface TeamQuota {
  teamId: string;
  teamName: string;
  /** DBQuota.quotaUsed */
  used: number;
  /** DBQuota.quotaLimit */
  limit: number;
  /** Department the team belongs to */
  department?: string;
  /** Percentage threshold to trigger warning (0-100) */
  warningThreshold?: number;
  /** Whether the quota is a hard limit (blocks usage) vs soft (warning only) */
  hardLimit?: boolean;
  /** ISO date when the quota resets */
  resetDate?: string;
}

/**
 * Transaction display - derived from DBTokenTransaction fields.
 * DBTokenTransaction.transactionType: 'purchase' | 'consumption' | 'reservation' | 'release' |
 *   'refund' | 'expiration' | 'adjustment' | 'bonus' | 'transfer_in' | 'transfer_out'
 */
export interface TokenTransactionDisplay {
  id: string;
  date: string;
  /** Simplified from DBTokenTransaction.transactionType */
  type: 'usage' | 'purchase' | 'credit';
  /** DBTokenTransaction.amount */
  amount: number;
  provider?: string;
  team?: string;
  cost: number;
  /** DBTokenTransaction.balanceAfter */
  runningBalance: number;
  /** DBTokenTransaction.balanceBefore */
  balanceBefore?: number;
  /** DBTokenTransaction.balanceAfter (raw) */
  balanceAfter?: number;
  /** Reference entity type (e.g. 'interview', 'screening') */
  referenceType?: string;
  /** Reference entity ID */
  referenceId?: string;
  /** Human-readable transaction description */
  description?: string;
  /** User who initiated the transaction */
  performedBy?: string;
  /** Payment amount in cents (for purchase transactions) */
  paymentAmountCents?: number;
  /** Payment currency code */
  paymentCurrency?: string;
}

export interface AlertConfig {
  id: string;
  type: 'low_balance' | 'high_usage' | 'quota_exceeded';
  /** Maps to DBTokenBalance.lowBalanceThreshold or DBQuota.alertThreshold */
  threshold: number;
  enabled: boolean;
  /** ISO date when the alert was created */
  createdAt?: string;
  /** ISO date when the alert last fired */
  lastTriggeredAt?: string;
  /** Channel used for alert delivery */
  notificationChannel?: 'email' | 'slack' | 'in-app';
}

export interface ForecastPoint {
  date: string;
  projected: number;
  confidenceLow: number;
  confidenceHigh: number;
  /** Actual observed value (populated for past dates) */
  actual?: number;
  /** Difference between projected and actual */
  variance?: number;
}

export interface BhTokenManagerProps extends EngineAwareProps {
  preset?: BhTokenManagerPreset;

  /** Current token balance information */
  balance?: TokenBalanceSummary;

  /** Consumption data for charting */
  consumptionData?: ConsumptionDataPoint[];

  /** Cost breakdown items for donut chart */
  costBreakdown?: CostBreakdownItem[];

  /** Per-team quota configuration */
  teamQuotas?: TeamQuota[];

  /** Transaction history records */
  transactions?: TokenTransactionDisplay[];

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

  /** ISO date of the most recent token purchase */
  lastPurchaseAt?: string;

  /** Whether automatic top-up is enabled */
  autoPurchaseEnabled?: boolean;

  /** Total lifetime spend in the account's currency */
  totalLifetimeSpend?: number;
}

export const BH_TOKEN_MANAGER_DEFAULTS: Partial<BhTokenManagerProps> = {
  preset: 'overview',
};

/** Backward-compat alias (old name from pre-migration) */
export type TokenTransaction = DBTokenTransaction;

/** Re-export DB types for convenience */
export type { DBTokenBalance, DBTokenTransaction, DBQuota, DBUsage };
