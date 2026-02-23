/**
 * BhMarketIntelligence - Core Interface
 * Dashboard widget showing labor market data and salary benchmarking.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhMarketIntelligencePreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Full market intelligence data */
export interface MarketIntelData {
  jobTitle: string;
  location: string;
  salaryRange: {
    p25: number;
    p50: number;
    p75: number;
    offered: number;
  };
  competitorCount: number;
  demandTrend: 'hot' | 'warm' | 'cooling' | 'cold';
  avgTimeToFill: number;
  industryAvgTimeToFill: number;
  talentPoolSize: number;
  insights: string[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhMarketIntelligenceProps extends EngineAwareProps {
  preset?: BhMarketIntelligencePreset;

  /** Market intelligence data */
  data?: MarketIntelData;

  /** Loading state */
  loading?: boolean;

  /** Callback when "Full Report" is clicked */
  onViewReport?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Returns a color from tokens based on demand trend */
export function getDemandColor(
  trend: 'hot' | 'warm' | 'cooling' | 'cold',
  tokens: DesignTokens,
): string {
  switch (trend) {
    case 'hot':
      return tokens.colors.errorScale[500];
    case 'warm':
      return tokens.colors.warningScale[500];
    case 'cooling':
      return tokens.colors.infoScale[500];
    case 'cold':
      return tokens.colors.neutral[400];
  }
}

/** Returns badge color type for demand trend */
export function getDemandBadgeColor(
  trend: 'hot' | 'warm' | 'cooling' | 'cold',
): 'error' | 'warning' | 'info' | 'secondary' {
  switch (trend) {
    case 'hot':
      return 'error';
    case 'warm':
      return 'warning';
    case 'cooling':
      return 'info';
    case 'cold':
      return 'secondary';
  }
}

/** Formats a salary amount with K suffix */
export function formatSalary(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${amount.toLocaleString()}`;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_MARKET_INTELLIGENCE_DEFAULTS: Partial<BhMarketIntelligenceProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
