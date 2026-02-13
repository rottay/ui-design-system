/**
 * BhPipelineGlobalKanban - Core Interface
 * Full pipeline Kanban board with columns per stage
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPipelineGlobalKanbanPreset = 'board' | 'compact';

export interface KanbanStageCandidate {
  id: string;
  name: string;
  avatarInitial: string;
  score?: number;
  appliedAt: Date;
  tags?: string[];
}

export interface KanbanStage {
  id: string;
  name: string;
  candidates: KanbanStageCandidate[];
  color?: string;
  limit?: number;
}

export interface KanbanFilters {
  search?: string;
  scoreMin?: number;
  scoreMax?: number;
  tags?: string[];
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
