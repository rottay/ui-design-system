/**
 * BhProcessDesigner - Core Interface
 * Visual workflow builder for hiring process templates.
 *
 * DB Reference: DBHiringProcessTemplate from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBHiringProcessTemplate } from '@rottay/recruiter';

export type BhProcessDesignerPreset = 'visual' | 'compact';

/** Re-export for consumer convenience */
export type { DBHiringProcessTemplate };

export type StageType = 'application_review' | 'phone_screen' | 'technical_interview' | 'onsite_interview' | 'panel_review' | 'reference_check' | 'offer' | 'custom';

export interface KnockoutRule {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string;
  action: 'reject' | 'flag' | 'skip_stage';
}

export interface ScoringRubric {
  id: string;
  dimensionName: string;
  weight: number;
  maxScore: number;
}

export interface ProcessStage {
  id: string;
  name: string;
  type: StageType;
  order: number;
  description?: string;
  durationDays?: number;
  isRequired: boolean;
  interviewerCount?: number;
  scoringRubrics?: ScoringRubric[];
  knockoutRules?: KnockoutRule[];
  automations?: string[];
}

export interface ProcessTemplate {
  id: string;
  name: string;
  description?: string;
  stages: ProcessStage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BhProcessDesignerProps extends EngineAwareProps {
  preset?: BhProcessDesignerPreset;

  /** The process template being edited */
  template?: ProcessTemplate;

  /** Selected stage for editing */
  selectedStage?: string | null;

  /** Callback when stage is selected */
  onStageSelect?: (stageId: string | null) => void;

  /** Callback when stages are reordered */
  onStageReorder?: (stageId: string, newOrder: number) => void;

  /** Callback when stage is added */
  onStageAdd?: (afterStageId: string | null) => void;

  /** Callback when stage is removed */
  onStageRemove?: (stageId: string) => void;

  /** Callback when stage config changes */
  onStageUpdate?: (stageId: string, updates: Partial<ProcessStage>) => void;

  /** Callback when template name/description changes */
  onTemplateUpdate?: (updates: Partial<ProcessTemplate>) => void;

  /** Whether the designer is read-only */
  readOnly?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCESS_DESIGNER_DEFAULTS: Partial<BhProcessDesignerProps> = {
  preset: 'visual',
  readOnly: false,
};
