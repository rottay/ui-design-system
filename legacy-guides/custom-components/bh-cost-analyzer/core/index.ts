/**
 * BhCostAnalyzer - Core Interface
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBUsage fields: cost, currency, quantity, requestCount, etc.
 * DBProviderPricing fields: unitPrice, currency, providerCode, metricType, etc.
 * DBPricingConfig fields: markupPercent, discountPercent, tokenRate, etc.
 * Token types from @rottay/recruiter: TokenBalance.currentBalance, etc.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBUsage, DBProviderPricing, DBPricingConfig } from '@rottay/ia-chat';
import type { TokenBalance as DBTokenBalance, DBSearchCostLog } from '@rottay/recruiter';

export type BhCostAnalyzerPreset = 'dashboard' | 'breakdown';

/**
 * Re-export the DB type for convenience.
 * DBSearchCostLog tracks position search expenses (labor, advertising, tools, etc.).
 */
export type RecruiterSearchCostLog = DBSearchCostLog;

export type CostCategory = 'interview' | 'evaluation' | 'rubric' | 'email' | 'other';
export type TrendDirection = 'up' | 'down' | 'flat';

/**
 * Provider cost - aggregated from DBUsage records per provider.
 */
export interface ProviderCost {
  /** DBProvider.id */
  providerId: string;
  /** DBProvider.name */
  providerName: string;
  /** Sum of DBUsage.cost */
  totalCost: number;
  /** Sum of DBUsage.quantity for token metric */
  tokenCount: number;
  /** Sum of DBUsage.requestCount */
  requestCount: number;
  share: number;
  trend: TrendDirection;
  trendValue: number;
  avgLatencyMs?: number;
  successRate?: number;
  errorCount?: number;
}

/**
 * Model cost - aggregated from DBUsage records per model.
 */
export interface ModelCost {
  /** DBModel.id via DBUsage.modelId */
  modelId: string;
  modelName: string;
  provider: string;
  totalCost: number;
  tokenCount: number;
  requestCount: number;
  avgCostPerRequest: number;
  avgLatencyMs?: number;
  successRate?: number;
  p95LatencyMs?: number;
}

export interface CostTrendPoint {
  /** DBUsage.periodStart */
  date: string;
  /** DBUsage.cost */
  cost: number;
  tokens: number;
  label?: string;
  requests?: number;
  errors?: number;
}

/**
 * Token balance summary - derived from DBTokenBalance fields.
 */
export interface TokenBalanceSummary {
  /** DBTokenBalance.currentBalance */
  current: number;
  dailyBurnRate: number;
  projectedDepletionDays: number;
}

export interface BudgetAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  threshold: number;
  currentValue: number;
  acknowledged: boolean;
  createdAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface CostSummary {
  totalSpend: number;
  costPerInterview: number;
  costPerHire: number;
  monthOverMonthChange: number;
  costByDepartment?: Record<string, number>;
  projectedMonthEnd?: number;
  savingsOpportunity?: number;
}

export interface BhCostAnalyzerProps extends EngineAwareProps {
  preset?: BhCostAnalyzerPreset;
  providers?: ProviderCost[];
  models?: ModelCost[];
  trends?: CostTrendPoint[];
  tokenBalance?: TokenBalanceSummary;
  alerts?: BudgetAlert[];
  summary?: CostSummary;
  categoryFilter?: CostCategory;
  onCategoryFilterChange?: (category: CostCategory) => void;
  onAlertAcknowledge?: (alertId: string) => void;
  /** Search cost logs - accepts DBSearchCostLog[] from @rottay/recruiter for position search expenses */
  searchCosts?: DBSearchCostLog[];
  period?: string;
  showLatency?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_COST_ANALYZER_DEFAULTS: Partial<BhCostAnalyzerProps> = {
  preset: 'dashboard',
};

export function getAlertSeverityColors(tokens: DesignTokens) {
  return {
    critical: { color: tokens.colors.errorScale[800], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    warning: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
    info: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200] },
  };
}

export function getTrendColors(tokens: DesignTokens) {
  return {
    up: tokens.colors.errorScale[600],
    down: tokens.colors.successScale[600],
    flat: tokens.colors.neutral[500],
  };
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}
