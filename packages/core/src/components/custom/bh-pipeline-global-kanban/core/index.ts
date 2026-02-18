/**
 * BhPipelineGlobalKanban - Core Interface
 * Full pipeline Kanban board with columns per stage.
 * Candidate cards map to DBApplication records.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApplication, ApplicationStatusValue } from '@rottay/recruiter';

export type BhPipelineGlobalKanbanPreset = 'board' | 'compact';

/**
 * Kanban card candidate - maps to a DBApplication with candidate info.
 * All fields optional for null-safety.
 */
export interface KanbanStageCandidate {
  id?: string;
  name?: string;
  avatarInitial?: string;
  score?: number;
  appliedAt?: Date | string | null;
  tags?: string[];
  /** Priority level of the application */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** Source channel where the application originated */
  source?: string;
  /** AI-calculated match score (0-100) */
  aiMatchScore?: number;
  /** Whether the SLA for this application has been breached */
  slaBreached?: boolean;
  /** SLA due date/time */
  slaDueAt?: Date | string | null;
  /** Number of days the candidate has been in the pipeline */
  daysInPipeline?: number;
  /** Interview recommendation from interviewers */
  interviewRecommendation?: string;
  /** ID of the recruiter assigned to this application */
  assignedRecruiterId?: string;
  /** Timestamp of the last communication with the candidate */
  lastCommunicationAt?: Date | string | null;
  /** Optional: raw application record for consumers who need full data */
  application?: Partial<DBApplication>;
}

export interface KanbanStage {
  id?: string;
  name?: string;
  status?: ApplicationStatusValue;
  candidates?: KanbanStageCandidate[];
  color?: string;
  limit?: number;
  /** Average number of days candidates spend in this stage */
  avgDaysInStage?: number;
  /** Stage conversion rate (0-1) */
  conversionRate?: number;
  /** Number of candidates with breached SLAs in this stage */
  slaBreachCount?: number;
}

export interface KanbanFilters {
  search?: string;
  scoreMin?: number;
  scoreMax?: number;
  tags?: string[];
  /** Filter by priority level */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** Filter by application source */
  source?: string;
  /** Filter by SLA breach status */
  slaBreached?: boolean;
  /** Filter by assigned recruiter ID */
  assignedRecruiterId?: string;
}

export interface BhPipelineGlobalKanbanProps extends EngineAwareProps {
  preset?: BhPipelineGlobalKanbanPreset;

  /** Pipeline stages with candidates */
  stages?: KanbanStage[];

  /** Callback when a card is moved between stages */
  onCardMove?: (candidateId: string, fromStageId: string, toStageId: string) => void;

  /** Callback when a card is clicked */
  onCardClick?: (candidateId: string) => void;

  /** Callback when a stage header is clicked */
  onStageClick?: (stageId: string) => void;

  /** Active filters */
  filters?: KanbanFilters;

  /** Currently selected card */
  selectedCardId?: string | null;

  /** Callback when add candidate button is clicked */
  onAddCandidate?: (stageId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_GLOBAL_KANBAN_DEFAULTS: Partial<BhPipelineGlobalKanbanProps> = {
  preset: 'board',
};
