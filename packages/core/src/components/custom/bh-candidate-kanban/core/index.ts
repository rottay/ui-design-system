/**
 * BhCandidateKanban - Core Interface
 * Pipeline Kanban Board for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBApplication[] for pipeline cards.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApplication } from '@rottay/recruiter';

export type BhCandidateKanbanPreset = 'board' | 'swimlane';

export type RecruiterApplication = DBApplication;

export type AiRecommendation = 'advance' | 'hold' | 'reject';

export type SlaStatus = 'green' | 'yellow' | 'red';

/**
 * Kanban card data - extends DB application with display-only fields
 * that are joined/computed at the API layer.
 */
export interface KanbanCandidate {
  /** Application ID */
  id: string;
  /** Candidate display name (joined from candidate table) */
  name: string;
  avatar?: string;
  /** Overall score from application (overallScore or aiMatchScore) */
  scorePercent: number;
  /** Computed: days in current stage */
  daysInStage: number;
  /** Application source */
  source: string;
  /** Application tags */
  tags: string[];
  /** AI recommendation (computed externally) */
  aiRecommendation: AiRecommendation;
  /** Current stage ID for column placement */
  stageId: string;
  email?: string;
}

export interface KanbanStage {
  id: string;
  name: string;
  order: number;
  slaHours: number;
  candidateCount: number;
}

export interface KanbanFilter {
  source?: string[];
  aiRecommendation?: AiRecommendation[];
  tags?: string[];
  scoreMin?: number;
  scoreMax?: number;
}

export interface BulkAction {
  type: 'move' | 'reject' | 'hold' | 'tag' | 'schedule';
  targetStageId?: string;
  tag?: string;
}

export interface BhCandidateKanbanProps extends EngineAwareProps {
  preset?: BhCandidateKanbanPreset;
  jobName?: string;
  totalCandidates?: number;
  stages?: KanbanStage[];
  candidates?: KanbanCandidate[];
  onCandidateMove?: (candidateId: string, fromStageId: string, toStageId: string) => void;
  onCandidateClick?: (candidateId: string) => void;
  onScheduleInterview?: (candidateId: string) => void;
  onAddNote?: (candidateId: string) => void;
  onReject?: (candidateId: string) => void;
  onHold?: (candidateId: string) => void;
  filters?: KanbanFilter;
  onFilterChange?: (filters: KanbanFilter) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCandidate?: string | null;
  bulkSelection?: string[];
  onBulkSelectionChange?: (ids: string[]) => void;
  onBulkAction?: (action: BulkAction) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_CANDIDATE_KANBAN_DEFAULTS: Partial<BhCandidateKanbanProps> = {
  preset: 'board',
  totalCandidates: 0,
  stages: [],
  candidates: [],
  searchQuery: '',
  bulkSelection: [],
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use KanbanCandidate['source'] - source is a string field on KanbanCandidate */
export type CandidateSource = string;
