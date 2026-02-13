/**
 * BhWorkflowAutomation - Core Interface
 * Visual rule builder WHEN/IF/THEN for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhWorkflowAutomationPreset = 'builder' | 'compact';

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  enabled: boolean;
  lastTriggered?: Date;
}

export interface BhWorkflowAutomationProps extends EngineAwareProps {
  preset?: BhWorkflowAutomationPreset;

  /** List of automation rules */
  rules: WorkflowRule[];

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
