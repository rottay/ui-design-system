/**
 * BhFantasyLeague - Core Interface
 * Dashboard widget showing fantasy recruiting league stats at a glance.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhFantasyLeaguePreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single prediction in the fantasy league */
export interface FantasyPrediction {
  candidateName: string;
  prediction: 'hire' | 'pass' | 'offer';
  actual?: 'hire' | 'pass' | 'offer' | null;
  correct?: boolean;
  points: number;
}

/** Fantasy league data for the widget */
export interface FantasyLeagueData {
  leagueName: string;
  currentRound: number;
  totalRounds: number;
  userRank: number;
  totalParticipants: number;
  userScore: number;
  topScore: number;
  nextPredictionDeadline?: Date | string;
  recentPredictions: FantasyPrediction[];
  streakCount: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhFantasyLeagueProps extends EngineAwareProps {
  preset?: BhFantasyLeaguePreset;

  /** Fantasy league data */
  data?: FantasyLeagueData;

  /** Loading state */
  loading?: boolean;

  /** Callback when make prediction is clicked */
  onMakePrediction?: () => void;

  /** Callback when view league is clicked */
  onViewLeague?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_FANTASY_LEAGUE_DEFAULTS: Partial<BhFantasyLeagueProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
