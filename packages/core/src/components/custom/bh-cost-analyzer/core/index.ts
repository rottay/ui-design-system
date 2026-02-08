import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhCostAnalyzerPreset = 'dashboard' | 'breakdown';

export type CostCategory = 'interview' | 'evaluation' | 'rubric' | 'email' | 'other';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface ProviderCost {
  providerId: string;
  providerName: string;
  totalCost: number;
  tokenCount: number;
  requestCount: number;
  share: number;
  trend: TrendDirection;
  trendValue: number;
}

export interface ModelCost {
  modelId: string;
  modelName: string;
  provider: string;
  totalCost: number;
  tokenCount: number;
  requestCount: number;
  avgCostPerRequest: number;
}

export interface CostTrendPoint {
  date: string;
  cost: number;
  tokens: number;
  label?: string;
}

export interface TokenBalance {
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
}

export interface CostSummary {
  totalSpend: number;
  costPerInterview: number;
  costPerHire: number;
  monthOverMonthChange: number;
}

export interface BhCostAnalyzerProps extends EngineAwareProps {
  preset?: BhCostAnalyzerPreset;
  providers: ProviderCost[];
  models?: ModelCost[];
  trends?: CostTrendPoint[];
  tokenBalance?: TokenBalance;
  alerts?: BudgetAlert[];
  summary?: CostSummary;
  categoryFilter?: CostCategory;
  onCategoryFilterChange?: (category: CostCategory) => void;
  onAlertAcknowledge?: (alertId: string) => void;
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
