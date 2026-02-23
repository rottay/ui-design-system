/**
 * BhDraftBoard - Core Interface
 * NFL-style candidate drafting board for BitHire ATS platform.
 * Supports setup, live drafting, and results views.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhDraftBoardPreset = 'setup' | 'live' | 'results';

// =============================================================================
// DRAFT DATA TYPES
// =============================================================================

/**
 * A candidate available for drafting.
 */
export interface DraftCandidate {
  id: string;
  name: string;
  avatarUrl?: string;
  currentScore: number;
  dimensions: DraftCandidateDimension[];
  position?: string;
  source?: string;
  tags: string[];
  drafted: boolean;
  draftedBy?: string;
  draftRound?: number;
  draftPick?: number;
}

/**
 * A scoring dimension for a draft candidate.
 */
export interface DraftCandidateDimension {
  name: string;
  score: number;
}

/**
 * A team participating in the draft.
 */
export interface DraftTeam {
  id: string;
  teamName: string;
  managerName: string;
  avatarUrl?: string;
  picks: DraftPick[];
  totalScore: number;
  budget?: number;
  budgetRemaining?: number;
}

/**
 * A single pick made during the draft.
 */
export interface DraftPick {
  round: number;
  pick: number;
  candidateId: string;
  candidateName: string;
  score: number;
  timestamp: Date;
}

/**
 * Configuration for a draft session.
 */
export interface DraftConfig {
  jobId: string;
  jobTitle: string;
  rounds: number;
  timePerPick?: number;
  snakeOrder: boolean;
  auctionMode: boolean;
  budgetPerTeam?: number;
}

/**
 * A draft session entity.
 */
export interface DraftSession {
  id: string;
  config: DraftConfig;
  status: 'setup' | 'active' | 'paused' | 'completed';
  teams: DraftTeam[];
  availableCandidates: DraftCandidate[];
  currentRound: number;
  currentPick: number;
  currentTeamId?: string;
  timer?: number;
  startedAt?: Date;
  completedAt?: Date;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhDraftBoardProps extends EngineAwareProps {
  preset?: BhDraftBoardPreset;

  /** The current draft session data */
  session?: DraftSession;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback when a candidate is drafted */
  onDraftCandidate?: (candidateId: string, teamId: string) => void;

  /** Callback to start the draft */
  onStartDraft?: () => void;

  /** Callback to pause/resume the draft */
  onPauseDraft?: () => void;

  /** Callback when draft config is updated */
  onConfigUpdate?: (config: Partial<DraftConfig>) => void;

  /** Callback to create a new draft session */
  onCreateDraft?: (config: DraftConfig, teams: Array<{ teamName: string; managerName: string }>) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_DRAFT_BOARD_DEFAULTS: Partial<BhDraftBoardProps> = {
  preset: 'setup',
};
