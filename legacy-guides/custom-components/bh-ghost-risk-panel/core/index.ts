/**
 * BhGhostRiskPanel - Core Interface
 * Dashboard panel showing candidate ghost risk scores, engagement trends,
 * and intervention controls for the recruiter dashboard.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhGhostRiskPanelPreset = 'panel';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Risk level classification */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Engagement trend direction */
export type TrendDirection = 'improving' | 'stable' | 'declining' | 'critical_decline';

/** A candidate entry in the ghost risk panel */
export interface GhostRiskCandidate {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  riskLevel: RiskLevel;
  riskScore: number;
  daysSilent: number;
  lastActivityAt: Date | string | null;
  trend: TrendDirection;
  suggestedIntervention?: string;
  jobTitle?: string;
}

/** Aggregated ghost risk stats */
export interface GhostRiskStats {
  totalAtRisk: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  avgDaysSilent: number;
  interventionSuccessRate: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhGhostRiskPanelProps extends EngineAwareProps {
  preset?: BhGhostRiskPanelPreset;

  /** List of at-risk candidates */
  candidates?: GhostRiskCandidate[];

  /** Aggregated risk statistics */
  stats?: GhostRiskStats;

  /** Loading state */
  loading?: boolean;

  /** Callback when intervention is triggered for a candidate */
  onTriggerIntervention?: (candidateId: string, interventionType: string) => void;

  /** Callback when a candidate row is clicked */
  onViewCandidate?: (candidateId: string) => void;

  /** Maximum number of candidates to display */
  maxDisplay?: number;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_GHOST_RISK_PANEL_DEFAULTS: Partial<BhGhostRiskPanelProps> = {
  preset: 'panel',
  maxDisplay: 6,
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns the appropriate color from tokens based on risk level.
 * low=successScale, medium=warningScale, high=errorScale[400], critical=errorScale[700]
 */
export function getRiskLevelColor(level: RiskLevel, tokens: DesignTokens): string {
  switch (level) {
    case 'low':
      return tokens.colors.successScale[500];
    case 'medium':
      return tokens.colors.warningScale[500];
    case 'high':
      return tokens.colors.errorScale[400];
    case 'critical':
      return tokens.colors.errorScale[700];
  }
}

/**
 * Returns the background color for risk level badges.
 */
export function getRiskLevelBgColor(level: RiskLevel, tokens: DesignTokens): string {
  switch (level) {
    case 'low':
      return tokens.colors.successScale[100];
    case 'medium':
      return tokens.colors.warningScale[100];
    case 'high':
      return tokens.colors.errorScale[100];
    case 'critical':
      return tokens.colors.errorScale[200];
  }
}

/**
 * Returns the border color for risk level badges.
 */
export function getRiskLevelBorderColor(level: RiskLevel, tokens: DesignTokens): string {
  switch (level) {
    case 'low':
      return tokens.colors.successScale[200];
    case 'medium':
      return tokens.colors.warningScale[200];
    case 'high':
      return tokens.colors.errorScale[200];
    case 'critical':
      return tokens.colors.errorScale[300];
  }
}

/**
 * Returns a descriptive label for the risk level.
 */
export function getRiskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'Low Risk';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High Risk';
    case 'critical':
      return 'Critical';
  }
}

/**
 * Returns the trend indicator character and color information.
 */
export function getTrendInfo(trend: TrendDirection, tokens: DesignTokens): {
  label: string;
  color: string;
} {
  switch (trend) {
    case 'improving':
      return { label: 'Improving', color: tokens.colors.successScale[600] };
    case 'stable':
      return { label: 'Stable', color: tokens.colors.neutral[500] };
    case 'declining':
      return { label: 'Declining', color: tokens.colors.errorScale[500] };
    case 'critical_decline':
      return { label: 'Critical', color: tokens.colors.errorScale[700] };
  }
}

/** Re-export n helper for convenience */
export { n };
