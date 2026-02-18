/**
 * BhWorkflowAutomation - Core Interface
 * Visual rule builder WHEN/IF/THEN for BitHire ATS platform
 *
 * DB Reference: DBApprovalRequest from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApprovalRequest } from '@rottay/recruiter';

export type BhWorkflowAutomationPreset = 'builder' | 'compact';

/** Re-export for consumer convenience */
export type { DBApprovalRequest };

export interface WorkflowRule {
  id?: string;
  name?: string;
  trigger?: string;
  conditions?: string[];
  actions?: string[];
  enabled?: boolean;
  lastTriggered?: Date;

  /** Description of what this rule does */
  description?: string;
  /** Rule execution priority */
  priority?: 'low' | 'medium' | 'high';
  /** Category for grouping rules */
  category?: string;
  /** Number of times this rule has been triggered */
  triggerCount?: number;
  /** Date of last successful execution */
  lastSuccess?: Date;
  /** Date of last failed execution */
  lastFailure?: Date;
  /** Number of failed executions */
  failureCount?: number;
  /** User who created this rule */
  createdBy?: string;
  /** Whether this is a system-defined rule */
  isSystem?: boolean;
}

export interface BhWorkflowAutomationProps extends EngineAwareProps {
  preset?: BhWorkflowAutomationPreset;

  /** List of automation rules */
  rules?: WorkflowRule[];

  /** Callback when a rule is toggled */
  onRuleToggle?: (ruleId: string) => void;

  /** Callback when a rule is edited */
  onRuleEdit?: (ruleId: string) => void;

  /** Callback when a rule is deleted */
  onRuleDelete?: (ruleId: string) => void;

  /** Callback to add a new rule */
  onAddRule?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_WORKFLOW_AUTOMATION_DEFAULTS: Partial<BhWorkflowAutomationProps> = {
  preset: 'builder',
};
