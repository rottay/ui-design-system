/**
 * BhPipelineKanbanCard - Core Interface
 * Enhanced draggable pipeline card for individual candidates
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPipelineKanbanCardPreset = 'standard' | 'minimal';

export interface KanbanCandidate {
  id: string;
  name: string;
  avatarInitial: string;
  score?: number;
  stage: string;
  appliedAt: Date;
  tags?: string[];
}

export type QuickActionType = 'advance' | 'reject' | 'schedule';

export interface BhPipelineKanbanCardProps extends EngineAwareProps {
  preset?: BhPipelineKanbanCardPreset;

  /** Candidate data */
  candidate?: KanbanCandidate;

  /** Whether the card is currently being dragged */
  isDragging?: boolean;

  /** Whether the card is selected */
  isSelected?: boolean;

  /** Callback for quick actions */
  onQuickAction?: (action: QuickActionType, candidateId: string) => void;

  /** Callback when card is expanded */
  onExpand?: (candidateId: string) => void;

  /** Callback when card is clicked */
  onClick?: (candidateId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_KANBAN_CARD_DEFAULTS: Partial<BhPipelineKanbanCardProps> = {
  preset: 'standard',
  isDragging: false,
  isSelected: false,
};
