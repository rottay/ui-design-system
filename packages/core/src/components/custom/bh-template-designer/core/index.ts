/**
 * BhTemplateDesigner - Core Interface
 * Evaluation Template Builder for BitHire ATS platform
 */

/**
 * DB Reference: DBHiringProcessTemplate from @rottay/recruiter
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBHiringProcessTemplate } from '@rottay/recruiter';

export type BhTemplateDesignerPreset = 'canvas' | 'form';

/** Re-export for consumer convenience */
export type { DBHiringProcessTemplate };

/* ── Stage Types ────────────────────────────────────────────────────── */

export type StageType = 'ai_interview' | 'human_interview' | 'assessment' | 'review';

export interface TemplateStage {
  id: string;
  name: string;
  type: StageType;
  order: number;
  agentId?: string;
  agentName?: string;
  rubricId?: string;
  rubricName?: string;
  slaHours: number;
  isKnockout: boolean;

  /** Description of this stage */
  description?: string;
  /** Stage automation configuration */
  automations?: {
    autoAdvance?: boolean;
    autoReject?: boolean;
    autoRejectConfig?: { minScore?: number; afterDays?: number };
  };
  /** Notification configuration for stage transitions */
  notificationConfig?: { notifyOnAdvance?: boolean; notifyOnReject?: boolean };
  /** Weight of this stage in overall scoring */
  weight?: number;
  /** Estimated duration in minutes for this stage */
  estimatedDurationMinutes?: number;
}

/* ── Automation ─────────────────────────────────────────────────────── */

export interface AutomationRule {
  id: string;
  condition: string;
  action: string;
  threshold?: number;

  /** Display name for this rule */
  name?: string;
  /** Description of what this rule does */
  description?: string;
  /** Whether this rule is enabled */
  enabled?: boolean;
  /** ISO date of last trigger */
  lastTriggered?: string;
  /** Number of times this rule has been triggered */
  triggerCount?: number;
}

/* ── Versioning ─────────────────────────────────────────────────────── */

export interface TemplateVersion {
  version: number;
  date: string;
  author: string;
  changes: string[];

  /** Whether this version is the published version */
  isPublished?: boolean;
  /** Number of times this version has been used */
  timesUsed?: number;
}

/* ── Validation ─────────────────────────────────────────────────────── */

export type ValidationStatus = 'pass' | 'fail' | 'warning';

export interface ValidationItem {
  check: string;
  status: ValidationStatus;
  message: string;

  /** Category for grouping validation items */
  category?: string;
  /** Whether this issue can be auto-fixed */
  autoFix?: boolean;
  /** Additional details about the validation result */
  details?: string;
}

/* ── Selectable Entities ────────────────────────────────────────────── */

export interface AvailableAgent {
  id: string;
  name: string;
  compatible?: boolean;
}

export interface AvailableRubric {
  id: string;
  name: string;
}

/* ── Template Status ────────────────────────────────────────────────── */

export type TemplateStatus = 'draft' | 'active' | 'disabled';

/* ── Main Props ─────────────────────────────────────────────────────── */

export interface BhTemplateDesignerProps extends EngineAwareProps {
  preset?: BhTemplateDesignerPreset;

  /* data */
  templateName: string;
  category: string;
  industry: string;
  status: TemplateStatus;
  stages: TemplateStage[];
  selectedStage?: string | null;
  automationRules: AutomationRule[];
  validationResults: ValidationItem[];
  versions: TemplateVersion[];
  isDirty: boolean;

  /* callbacks */
  onChange?: (field: string, value: unknown) => void;
  onStageAdd?: (afterOrder?: number) => void;
  onStageRemove?: (stageId: string) => void;
  onStageReorder?: (stageId: string, newOrder: number) => void;
  onStageSelect?: (stageId: string | null) => void;
  onRuleAdd?: () => void;
  onRuleRemove?: (ruleId: string) => void;
  onSave?: () => void;
  onPublish?: () => void;
  onVersionRollback?: (version: number) => void;

  /* available entities */
  agents?: AvailableAgent[];
  rubrics?: AvailableRubric[];

  /* layout */
  className?: string;
  style?: CSSProperties;
}

export const BH_TEMPLATE_DESIGNER_DEFAULTS: Partial<BhTemplateDesignerProps> = {
  preset: 'canvas',
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

export function getStageTypeColors(tokens: DesignTokens) {
  return {
    ai_interview: {
      bg: tokens.colors.primaryScale[50],
      color: tokens.colors.primaryScale[700],
      border: tokens.colors.primaryScale[200],
      dot: tokens.colors.primaryScale[500],
    },
    human_interview: {
      bg: tokens.colors.infoScale[50],
      color: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
      dot: tokens.colors.infoScale[500],
    },
    assessment: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
      dot: tokens.colors.warningScale[500],
    },
    review: {
      bg: tokens.colors.secondaryScale[50],
      color: tokens.colors.secondaryScale[700],
      border: tokens.colors.secondaryScale[200],
      dot: tokens.colors.secondaryScale[500],
    },
  };
}

export function getStatusColors(tokens: DesignTokens) {
  return {
    draft: {
      bg: tokens.colors.neutral[100],
      color: tokens.colors.neutral[600],
      border: tokens.colors.neutral[200],
    },
    active: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
    },
    disabled: {
      bg: tokens.colors.errorScale[50],
      color: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
    },
  };
}

export function getValidationStatusColors(tokens: DesignTokens) {
  return {
    pass: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      icon: tokens.colors.successScale[500],
    },
    fail: {
      bg: tokens.colors.errorScale[50],
      color: tokens.colors.errorScale[700],
      icon: tokens.colors.errorScale[500],
    },
    warning: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      icon: tokens.colors.warningScale[500],
    },
  };
}
