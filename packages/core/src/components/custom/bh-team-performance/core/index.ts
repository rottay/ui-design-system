/**
 * BhTeamPerformance - Core Interface
 * BarChart comparing team performance metrics for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBTeam[] directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBTeam } from '@rottay/recruiter';

export type BhTeamPerformancePreset = 'chart' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterTeam = DBTeam;

/**
 * Performance data for a single team (computed/aggregated).
 * Kept as a separate interface since these are computed metrics, not raw DB fields.
 */
export interface TeamPerfData {
  teamId?: string;
  teamName: string;
  hires: number;
  timeToFill: number;
  qualityScore: number;
  satisfaction: number;
}

export interface BhTeamPerformanceProps extends EngineAwareProps {
  preset?: BhTeamPerformancePreset;

  /** Teams to display - can use DBTeam[] or computed TeamPerfData[] */
  teams?: TeamPerfData[];

  /** Active metric to compare */
  metric?: 'hires' | 'timeToFill' | 'qualityScore' | 'satisfaction';

  /** Component title */
  title?: string;

  /** Callback when a team bar is clicked */
  onTeamClick?: (teamName: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TEAM_PERFORMANCE_DEFAULTS: Partial<BhTeamPerformanceProps> = {
  preset: 'chart',
  metric: 'hires',
  loading: false,
};
