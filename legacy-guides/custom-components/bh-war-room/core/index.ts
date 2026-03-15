/**
 * BhWarRoom - Core Interface
 * Live War Room for BitHire ATS platform - real-time collaborative
 * hiring decision space with voting, candidate comparison, and decision tracking.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhWarRoomPreset = 'list' | 'collaborative';

// =============================================================================
// WAR ROOM DATA TYPES
// =============================================================================

/**
 * A war room session entity for display.
 */
export interface WarRoomSession {
  id: string;
  jobId: string;
  jobTitle: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'active' | 'voting' | 'decided' | 'closed';
  participants: WarRoomParticipant[];
  candidateIds: string[];
  candidateCount: number;
  voteCount: number;
  decisionCount: number;
  actionCount: number;
  startedAt?: string;
  endedAt?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  summary?: string;
  createdAt: string;
}

/**
 * A participant in a war room session.
 */
export interface WarRoomParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  isOnline: boolean;
  joinedAt: string;
}

/**
 * A candidate being evaluated in the war room.
 */
export interface WarRoomCandidate {
  id: string;
  name: string;
  avatarUrl?: string;
  currentTitle?: string;
  overallScore: number;
  dimensionScores: WarRoomDimensionScore[];
  applicationStatus?: string;
  strengths?: string[];
  weaknesses?: string[];
  interviewHighlights?: string[];
}

/**
 * A dimension score for a candidate (e.g., technical, communication).
 */
export interface WarRoomDimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  label: string;
}

/**
 * A vote cast by a participant on a candidate.
 */
export interface WarRoomVote {
  participantId: string;
  participantName?: string;
  participantAvatar?: string;
  candidateId: string;
  vote: 'hire' | 'no_hire' | 'maybe' | 'strong_hire' | 'strong_no_hire';
  notes?: string;
  timestamp: string;
}

/**
 * A decision made for a candidate.
 */
export interface WarRoomDecision {
  candidateId: string;
  candidateName?: string;
  decision: 'advance' | 'reject' | 'hold';
  reason: string;
  decidedBy: string;
  decidedByName?: string;
  timestamp: string;
}

/**
 * An action item from the war room.
 */
export interface WarRoomAction {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName?: string;
  dueDate?: string;
  completed: boolean;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhWarRoomProps extends EngineAwareProps {
  preset?: BhWarRoomPreset;

  /** All war room sessions */
  sessions?: WarRoomSession[];

  /** Currently selected/active session */
  selectedSession?: WarRoomSession | null;

  /** Candidates in the current session */
  candidates?: WarRoomCandidate[];

  /** Participants in the current session */
  participants?: WarRoomParticipant[];

  /** Votes in the current session */
  votes?: WarRoomVote[];

  /** Decisions in the current session */
  decisions?: WarRoomDecision[];

  /** Action items in the current session */
  actions?: WarRoomAction[];

  /** Callback to create a new war room session */
  onCreateSession?: (data: {
    title: string;
    jobId: string;
    candidateIds: string[];
    participantIds: string[];
  }) => void;

  /** Callback to join a session */
  onJoinSession?: (sessionId: string) => void;

  /** Callback to cast a vote */
  onCastVote?: (candidateId: string, vote: WarRoomVote['vote'], notes?: string) => void;

  /** Callback to add a decision */
  onAddDecision?: (candidateId: string, decision: WarRoomDecision['decision'], reason: string) => void;

  /** Callback to add an action item */
  onAddAction?: (title: string, assigneeId: string, dueDate?: string) => void;

  /** Callback to end the session */
  onEndSession?: (summary?: string) => void;

  /** Whether data is loading */
  loading?: boolean;

  /** Current authenticated user ID */
  currentUserId?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_WAR_ROOM_DEFAULTS: Partial<BhWarRoomProps> = {
  preset: 'list',
};
