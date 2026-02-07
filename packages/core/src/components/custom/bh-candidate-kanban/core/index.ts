/**
 * BhCandidateKanban - Core Interface
 * Pipeline Kanban Board for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhCandidateKanbanPreset = 'board' | 'swimlane';

export type CandidateSource = 'applied' | 'referral' | 'sourced' | 'agency' | 'internal';

export type AiRecommendation = 'advance' | 'hold' | 'reject';

export type SlaStatus = 'green' | 'yellow' | 'red';

export interface KanbanCandidate {
  id: string;
  name: string;
  avatar?: string;
  scorePercent: number;
  daysInStage: number;
  source: CandidateSource;
  tags: string[];
  aiRecommendation: AiRecommendation;
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
  source?: CandidateSource[];
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
  jobName: string;
  totalCandidates: number;
  stages: KanbanStage[];
  candidates: KanbanCandidate[];
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
