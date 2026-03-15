/**
 * BhFantasyLeagueGame - Core Interface
 * Full Fantasy League game experience for BitHire ATS platform.
 * Supports predict, leaderboard, and dashboard views.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhFantasyLeagueGamePreset = 'predict' | 'leaderboard' | 'dashboard';

// =============================================================================
// FANTASY LEAGUE DATA TYPES
// =============================================================================

/**
 * A candidate in the fantasy league context.
 */
export interface FantasyCandidate {
  id: string;
  name: string;
  jobTitle: string;
  stage: string;
  interviewScore?: number;
  currentOdds: number;
}

/**
 * A prediction entry made by a player.
 */
export interface FantasyPredictionEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  prediction: 'hire' | 'pass' | 'offer' | 'advance' | 'reject';
  confidence: number;
  timestamp: Date;
  resolved: boolean;
  correct?: boolean;
  pointsEarned: number;
}

/**
 * A player in the fantasy league.
 */
export interface FantasyPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  totalPoints: number;
  rank: number;
  accuracy: number;
  predictions: number;
  streak: number;
  badges: string[];
}

/**
 * League-level information.
 */
export interface FantasyLeagueInfo {
  id: string;
  name: string;
  season: string;
  currentRound: number;
  totalRounds: number;
  players: FantasyPlayer[];
  rules: string;
  prizes?: string[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhFantasyLeagueGameProps extends EngineAwareProps {
  preset?: BhFantasyLeagueGamePreset;

  /** League information */
  league?: FantasyLeagueInfo;

  /** Current authenticated player */
  currentPlayer?: FantasyPlayer;

  /** Active candidates for predictions */
  candidates?: FantasyCandidate[];

  /** Current player's predictions */
  predictions?: FantasyPredictionEntry[];

  /** Whether data is loading */
  loading?: boolean;

  /** Callback to make a prediction */
  onMakePrediction?: (candidateId: string, prediction: FantasyPredictionEntry['prediction'], confidence: number) => void;

  /** Callback to view a player profile */
  onViewPlayer?: (playerId: string) => void;

  /** Callback to join the league */
  onJoinLeague?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_FANTASY_LEAGUE_GAME_DEFAULTS: Partial<BhFantasyLeagueGameProps> = {
  preset: 'predict',
};
