/**
 * BhBiasMonitor - Core Interface
 * Dashboard widget showing interviewer bias monitoring metrics.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhBiasMonitorPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Individual bias metric measurement */
export interface BiasMetric {
  type: 'talk_time_ratio' | 'question_consistency' | 'scoring_distribution' | 'demographic_variance' | 'interruption_pattern';
  label: string;
  score: number;
  benchmark: number;
  status: 'good' | 'watch' | 'concern';
}

/** Alert triggered by bias detection */
export interface BiasAlert {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detectedAt: Date | string;
}

/** Full bias monitor data payload */
export interface BiasMonitorData {
  overallBiasScore: number;
  trend: 'improving' | 'stable' | 'worsening';
  metrics: BiasMetric[];
  alerts: BiasAlert[];
  interviewCount: number;
  lastAnalyzedAt: Date | string;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhBiasMonitorProps extends EngineAwareProps {
  preset?: BhBiasMonitorPreset;

  /** Bias monitoring data */
  data?: BiasMonitorData;

  /** Loading state */
  loading?: boolean;

  /** Callback when "View Full Report" is clicked */
  onViewDetails?: () => void;

  /** Callback when an alert is clicked */
  onViewAlert?: (alert: BiasAlert) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_BIAS_MONITOR_DEFAULTS: Partial<BhBiasMonitorProps> = {
  preset: 'compact',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns a color from the appropriate scale based on bias metric status.
 * good = successScale, watch = warningScale, concern = errorScale
 */
export function getBiasStatusColor(status: 'good' | 'watch' | 'concern', tokens: DesignTokens): string {
  switch (status) {
    case 'good':
      return tokens.colors.successScale[500];
    case 'watch':
      return tokens.colors.warningScale[500];
    case 'concern':
      return tokens.colors.errorScale[500];
  }
}

/**
 * Returns a badge color key for bias metric status.
 */
export function getBiasStatusBadgeColor(status: 'good' | 'watch' | 'concern'): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'good':
      return 'success';
    case 'watch':
      return 'warning';
    case 'concern':
      return 'error';
  }
}

/**
 * Returns color + label for overall bias score.
 * Lower is better: <20 success "Excellent", 20-40 info "Good",
 * 40-60 warning "Watch", >60 error "Concern"
 */
export function getOverallBiasInfo(score: number, tokens: DesignTokens): {
  color: string;
  label: string;
  badgeColor: 'success' | 'info' | 'warning' | 'error';
} {
  const s = n(score);
  if (s < 20) return { color: tokens.colors.successScale[500], label: 'Excellent', badgeColor: 'success' };
  if (s < 40) return { color: tokens.colors.infoScale[500], label: 'Good', badgeColor: 'info' };
  if (s < 60) return { color: tokens.colors.warningScale[500], label: 'Watch', badgeColor: 'warning' };
  return { color: tokens.colors.errorScale[500], label: 'Concern', badgeColor: 'error' };
}

/** Re-export n helper for convenience */
export { n };
