/**
 * BhSprintCapacity - Core Interface
 * Dashboard widget showing sprint capacity utilization at a glance.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhSprintCapacityPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Sprint capacity data for the widget */
export interface SprintCapacityData {
  sprintName: string;
  totalCapacity: number;
  usedCapacity: number;
  memberCount: number;
  avgUtilization: number;
  overloadedMembers: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhSprintCapacityProps extends EngineAwareProps {
  preset?: BhSprintCapacityPreset;

  /** Sprint capacity data */
  data?: SprintCapacityData;

  /** Loading state */
  loading?: boolean;

  /** Callback when view sprint is clicked */
  onViewSprint?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_SPRINT_CAPACITY_DEFAULTS: Partial<BhSprintCapacityProps> = {
  preset: 'compact',
};

// =============================================================================
// HELPERS
// =============================================================================

/** Returns the appropriate color from tokens based on utilization percentage */
export function getUtilizationColor(pct: number, tokens: DesignTokens): string {
  if (pct < 70) return tokens.colors.successScale[500];
  if (pct <= 90) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/** Returns a badge color variant based on utilization */
export function getUtilizationBadgeVariant(pct: number): 'success' | 'warning' | 'error' {
  if (pct < 70) return 'success';
  if (pct <= 90) return 'warning';
  return 'error';
}

/** Re-export n helper for convenience */
export { n };
