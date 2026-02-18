/**
 * BhWorkflowStageEditor - Core Interface
 * Drag-drop stage reordering for BitHire ATS platform
 *
 * DB Reference: DBApprovalRequest from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApprovalRequest } from '@rottay/recruiter';

export type BhWorkflowStageEditorPreset = 'editor' | 'compact';

/** Re-export for consumer convenience */
export type { DBApprovalRequest };

export interface WorkflowStage {
  id?: string;
  name?: string;
  type?: 'manual' | 'automated' | 'approval';
  order?: number;
  color?: string;
  actions?: string[];

  /** Description of this stage */
  description?: string;
  /** SLA in hours for completing this stage */
  slaHours?: number;
  /** Whether this stage is required in the workflow */
  isRequired?: boolean;
  /** Stage automation configuration */
  automations?: { autoAdvance?: boolean; autoReject?: boolean };
  /** ID of the interview template used in this stage */
  interviewTemplateId?: string;
  /** Whether knockout scoring is enabled */
  knockoutEnabled?: boolean;
  /** Minimum score threshold for knockout */
  knockoutThreshold?: number;
  /** Weight of this stage in overall scoring */
  weight?: number;
  /** Estimated duration for this stage (e.g. "2 days") */
  estimatedDuration?: string;
}

export interface BhWorkflowStageEditorProps extends EngineAwareProps {
  preset?: BhWorkflowStageEditorPreset;

  /** List of workflow stages */
  stages?: WorkflowStage[];

  /** Callback when a stage is reordered */
  onStageReorder?: (stageId: string, newOrder: number) => void;

  /** Callback when a stage is edited */
  onStageEdit?: (stageId: string) => void;

  /** Callback when a stage is deleted */
  onStageDelete?: (stageId: string) => void;

  /** Callback to add a new stage */
  onAddStage?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_WORKFLOW_STAGE_EDITOR_DEFAULTS: Partial<BhWorkflowStageEditorProps> = {
  preset: 'editor',
};
