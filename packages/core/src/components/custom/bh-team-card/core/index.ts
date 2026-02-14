/**
 * BhTeamCard - Core Interface
 * Team summary card with performance metrics for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts a DBTeam directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBTeam } from '@rottay/recruiter';

export type BhTeamCardPreset = 'standard' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterTeam = DBTeam;

/**
 * Additional metric data for display (computed/aggregated).
 */
export interface TeamMetric {
  label: string;
  value: number;
  target: number;
}

export interface BhTeamCardProps extends EngineAwareProps {
  preset?: BhTeamCardPreset;

  /** Team data - accepts DBTeam directly from @rottay/recruiter */
  team?: DBTeam;

  /** Additional display metrics (computed/aggregated) */
  metrics?: TeamMetric[];

  /** Click handler */
  onClick?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TEAM_CARD_DEFAULTS: Partial<BhTeamCardProps> = {
  preset: 'standard',
};
