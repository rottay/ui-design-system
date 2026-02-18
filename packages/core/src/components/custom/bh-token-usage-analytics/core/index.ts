/**
 * BhTokenUsageAnalytics - Core Interface
 * AreaChart consumption, PieChart by category for BitHire ATS platform
 *
 * Usage types imported from @rottay/ia-chat (single source of truth).
 * DBUsage fields: metricType, quantity, cost, currency, requestCount, etc.
 * Token types from @rottay/recruiter: TokenBalance.lifetimeConsumed, etc.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBUsage } from '@rottay/ia-chat';

export type BhTokenUsageAnalyticsPreset = 'detailed' | 'compact';

export interface TokenUsagePoint {
  /** Period date */
  date: string;
  /** DBUsage.quantity for token metric type */
  tokens: number;
  /** DBUsage.cost */
  cost: number;
  /** Number of API requests in this period */
  requests?: number;
  /** Number of failed requests in this period */
  errors?: number;
  /** Average latency in milliseconds */
  avgLatencyMs?: number;
}

export interface TokenCategory {
  /** DBUsage.metricType or provider category */
  category: string;
  tokens: number;
  percentage: number;
  /** Usage trend compared to previous period */
  trend?: 'up' | 'down' | 'flat';
  /** Token count from the previous period for comparison */
  previousPeriodTokens?: number;
  /** Cost per individual token for this category */
  costPerToken?: number;
}

export interface BhTokenUsageAnalyticsProps extends EngineAwareProps {
  preset?: BhTokenUsageAnalyticsPreset;

  /** Usage data over time */
  usageData?: TokenUsagePoint[];

  /** Token usage by category */
  categories?: TokenCategory[];

  /** Total tokens consumed */
  totalTokens?: number;

  /** Total cost */
  totalCost?: number;

  /** Budget limit */
  budget?: number;

  /** Currency code (defaults to DBUsage.currency = 'USD') */
  currency?: string;

  /** Component title */
  title?: string;

  /** Callback when date range changes */
  onDateRangeChange?: (range: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Time granularity for usage data aggregation */
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';

  /** Whether to show latency metrics in the chart */
  showLatency?: boolean;

  /** Whether to show error metrics in the chart */
  showErrors?: boolean;

  /** Top AI providers by usage for summary display */
  topProviders?: Array<{ name: string; tokens: number; cost: number }>;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TOKEN_USAGE_ANALYTICS_DEFAULTS: Partial<BhTokenUsageAnalyticsProps> = {
  preset: 'detailed',
};
