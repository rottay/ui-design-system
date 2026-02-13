/**
 * BhProviderCost - Core Interface
 * Cost analytics by provider/model with budget alerts
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhProviderCostPreset = 'dashboard' | 'compact';

export type CostTrend = 'up' | 'down' | 'flat';

export interface ProviderCostEntry {
  provider: string;
  model: string;
  totalCost: number;
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
  providers: ProviderCostEntry[];
  alerts?: CostAlert[];
  totalBudget: number;
  totalSpent: number;
  currency?: string;
  period?: string;
  onProviderClick?: (provider: string) => void;
  onAlertDismiss?: (alertId: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_PROVIDER_COST_DEFAULTS: Partial<BhProviderCostProps> = {
  preset: 'dashboard',
  currency: 'USD',
  period: 'This Month',
};
