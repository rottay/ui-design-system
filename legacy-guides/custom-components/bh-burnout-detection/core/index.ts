/**
 * BhBurnoutDetection - Core Interface
 * Dashboard widget for monitoring recruiter burnout risk and team health.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhBurnoutDetectionPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Individual recruiter burnout information */
export interface BurnoutRecruiter {
  recruiterId: string;
  name: string;
  avatarUrl?: string;
  burnoutScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  indicators: string[];
  trend: 'improving' | 'stable' | 'worsening';
  throttleRecommendation?: string;
}

/** Team-wide burnout detection data */
export interface BurnoutData {
  teamSize: number;
  atRiskCount: number;
  highRiskRecruiters: BurnoutRecruiter[];
  avgBurnoutScore: number;
  trend: 'improving' | 'stable' | 'worsening';
  topIndicators: string[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhBurnoutDetectionProps extends EngineAwareProps {
  preset?: BhBurnoutDetectionPreset;

  /** Burnout detection data */
  data?: BurnoutData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a recruiter is clicked */
  onViewRecruiter?: (recruiterId: string) => void;

  /** Callback when throttle is applied for a recruiter */
  onApplyThrottle?: (recruiterId: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Returns the appropriate color from tokens based on burnout risk level */
export function getBurnoutColor(
  riskLevel: 'low' | 'moderate' | 'high' | 'critical',
  tokens: DesignTokens,
): string {
  switch (riskLevel) {
    case 'low':
      return tokens.colors.successScale[500];
    case 'moderate':
      return tokens.colors.warningScale[400];
    case 'high':
      return tokens.colors.warningScale[600];
    case 'critical':
      return tokens.colors.errorScale[500];
  }
}

/** Returns an emoji icon string based on burnout risk level */
export function getBurnoutIcon(riskLevel: 'low' | 'moderate' | 'high' | 'critical'): string {
  switch (riskLevel) {
    case 'low':
      return 'check';
    case 'moderate':
      return 'alert';
    case 'high':
      return 'warning';
    case 'critical':
      return 'critical';
  }
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_BURNOUT_DETECTION_DEFAULTS: Partial<BhBurnoutDetectionProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
