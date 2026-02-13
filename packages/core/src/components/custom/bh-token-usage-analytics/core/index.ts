/**
 * BhTokenUsageAnalytics - Core Interface
 * AreaChart consumption, PieChart by category for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhTokenUsageAnalyticsPreset = 'detailed' | 'compact';

export interface TokenUsagePoint {
  date: string;
  tokens: number;
  cost: number;
}

export interface TokenCategory {
  category: string;
  tokens: number;
  percentage: number;
}

export interface BhTokenUsageAnalyticsProps extends EngineAwareProps {
  preset?: BhTokenUsageAnalyticsPreset;

  /** Usage data over time */
  usageData: TokenUsagePoint[];

  /** Token usage by category */
  categories: TokenCategory[];

  /** Total tokens consumed */
  totalTokens: number;

  /** Total cost */
  totalCost: number;

  /** Budget limit */
  budget?: number;

  /** Currency code */
  currency?: string;

  /** Component title */
  title?: string;

  /** Callback when date range changes */
  onDateRangeChange?: (range: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TOKEN_USAGE_ANALYTICS_DEFAULTS: Partial<BhTokenUsageAnalyticsProps> = {
  preset: 'detailed',
};
