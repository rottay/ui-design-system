/**
 * BhLeaderboard - Core Interface
 * Dashboard widget showing recruiter leaderboard rankings.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhLeaderboardPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single leaderboard entry */
export interface LeaderboardEntry {
  rank: number;
  recruiterId: string;
  recruiterName: string;
  avatarUrl?: string;
  score: number;
  hires: number;
  avgTimeToFill: number;
  streak?: number;
  change: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhLeaderboardProps extends EngineAwareProps {
  preset?: BhLeaderboardPreset;

  /** Leaderboard entries */
  entries?: LeaderboardEntry[];

  /** Current authenticated user's ID for highlighting */
  currentUserId?: string;

  /** Loading state */
  loading?: boolean;

  /** Callback when a recruiter profile is clicked */
  onViewProfile?: (recruiterId: string) => void;

  /** Time period for the leaderboard */
  period?: 'week' | 'month' | 'quarter';

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_LEADERBOARD_DEFAULTS: Partial<BhLeaderboardProps> = {
  preset: 'compact',
  period: 'month',
};

/** Re-export n helper for convenience */
export { n };
