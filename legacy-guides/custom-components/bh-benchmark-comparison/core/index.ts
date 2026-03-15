/**
 * BhBenchmarkComparison - Core Interface
 * Dashboard widget comparing recruitment metrics against industry benchmarks.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhBenchmarkComparisonPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single benchmark metric comparing your value to industry data */
export interface BenchmarkMetric {
  name: string;
  yourValue: number;
  industryAvg: number;
  topQuartile: number;
  unit: string;
  betterDirection: 'higher' | 'lower';
}

/** Complete benchmark comparison dataset */
export interface BenchmarkData {
  metrics: BenchmarkMetric[];
  overallPercentile: number;
  industry: string;
  companySize: string;
  lastUpdated: Date | string;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhBenchmarkComparisonProps extends EngineAwareProps {
  preset?: BhBenchmarkComparisonPreset;

  /** Benchmark comparison data */
  data?: BenchmarkData;

  /** Loading state */
  loading?: boolean;

  /** Callback when "View Full Comparison" is clicked */
  onViewDetails?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_BENCHMARK_COMPARISON_DEFAULTS: Partial<BhBenchmarkComparisonProps> = {
  preset: 'compact',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns the appropriate color scale based on benchmark performance.
 * Above top quartile = successScale
 * Above average = infoScale
 * Below average = warningScale
 * Bottom quartile = errorScale
 */
export function getBenchmarkColor(
  yours: number,
  avg: number,
  topQ: number,
  direction: 'higher' | 'lower',
  tokens: DesignTokens,
): { bg: string; text: string; border: string; label: string } {
  const isHigherBetter = direction === 'higher';
  const aboveTopQ = isHigherBetter ? yours >= topQ : yours <= topQ;
  const aboveAvg = isHigherBetter ? yours >= avg : yours <= avg;
  const bottomQ = isHigherBetter
    ? yours < avg - (topQ - avg)
    : yours > avg + (avg - topQ);

  if (aboveTopQ) {
    return {
      bg: tokens.colors.successScale[100],
      text: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      label: 'Top Quartile',
    };
  }
  if (aboveAvg) {
    return {
      bg: tokens.colors.infoScale[100],
      text: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
      label: 'Above Avg',
    };
  }
  if (bottomQ) {
    return {
      bg: tokens.colors.errorScale[100],
      text: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
      label: 'Bottom Quartile',
    };
  }
  return {
    bg: tokens.colors.warningScale[100],
    text: tokens.colors.warningScale[700],
    border: tokens.colors.warningScale[200],
    label: 'Below Avg',
  };
}

/** Re-export n helper for convenience */
export { n };
