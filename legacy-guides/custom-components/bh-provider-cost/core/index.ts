/**
 * BhProviderCost - Core Interface
 * Cost analytics by provider/model with budget alerts
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBUsage fields: cost, currency, requestCount, etc.
 * DBProviderPricing fields: unitPrice, currency, providerCode, metricType, etc.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBUsage, DBProviderPricing, DBProviderCache } from '@rottay/ia-chat';

export type BhProviderCostPreset = 'dashboard' | 'compact';

/** Re-export for consumer convenience */
export type RecruiterProviderCache = DBProviderCache;

export type CostTrend = 'up' | 'down' | 'flat';

/**
 * Provider cost entry - aggregated from DBUsage records per provider/model.
 */
export interface ProviderCostEntry {
  /** DBProvider.code or DBProvider.name */
  provider: string;
  model: string;
  /** Sum of DBUsage.cost */
  totalCost: number;
  /** Sum of DBUsage.quantity for token metrics */
  tokenCount: number;
  avgCostPerRequest: number;
  budgetLimit: number;
  budgetUsed: number;
  trend: CostTrend;
}

export type CostAlertSeverity = 'critical' | 'warning' | 'info';

export interface CostAlert {
  id: string;
  provider: string;
  message: string;
  severity: CostAlertSeverity;
  timestamp: Date;
}

export interface BhProviderCostProps extends EngineAwareProps {
  preset?: BhProviderCostPreset;
  providers?: ProviderCostEntry[];
  alerts?: CostAlert[];
  totalBudget?: number;
  totalSpent?: number;
  /** Defaults to DBUsage.currency = 'USD' */
  currency?: string;
  period?: string;
  onProviderClick?: (provider: string) => void;
  onAlertDismiss?: (alertId: string) => void;
  /** Cache entries showing cost savings - accepts DBProviderCache[] from @rottay/ia-chat */
  cacheEntries?: DBProviderCache[];
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_PROVIDER_COST_DEFAULTS: Partial<BhProviderCostProps> = {
  preset: 'dashboard',
  currency: 'USD',
  period: 'This Month',
};
