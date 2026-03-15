/**
 * BhPipelineKanbanCard - Core Interface
 * Enhanced draggable pipeline card for individual candidates.
 * Card data maps to a DBApplication record.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApplication, ApplicationStatusValue } from '@rottay/recruiter';

export type BhPipelineKanbanCardPreset = 'standard' | 'minimal';

/**
 * Kanban candidate - maps to a DBApplication with candidate display info.
 * All fields optional for null-safety.
 */
export interface KanbanCandidate {
  id?: string;
  name?: string;
  avatarInitial?: string;
  score?: number;
  stage?: string;
  status?: ApplicationStatusValue;
  appliedAt?: Date | string | null;
  tags?: string[];
  /** Optional: raw application record for consumers who need full data */
  application?: Partial<DBApplication>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  source?: string;
  aiMatchScore?: number;
  daysInStage?: number;
  interviewDate?: Date | string | null;
  assignedRecruiterName?: string;
  slaBreached?: boolean;
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
