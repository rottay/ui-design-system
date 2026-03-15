import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type ApprovalWorkflowPreset = 'editor' | 'summary';

export type StatusCategory = 'todo' | 'in-progress' | 'done';

export interface Approver {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
}

export interface Transition {
  id: string;
  name: string;
  fromStatus: string;
  toStatus: string;
  statusBadgeColor?: string;
}

export interface WorkflowStatus {
  id: string;
  name: string;
  category: StatusCategory;
}

export type ApprovalOutcome = 'approved' | 'declined';

export interface ApprovalRule {
  id: string;
  approvers: Approver[];
  approverField?: string;
  outcomes: Record<ApprovalOutcome, { transitionId?: string }>;
}

export interface ApprovalWorkflowProps extends EngineAwareProps {
  preset?: ApprovalWorkflowPreset;
  statuses: WorkflowStatus[];
  transitions: Transition[];
  approvalRules: ApprovalRule[];
  selectedStatusId?: string;
  onStatusSelect?: (statusId: string) => void;
  onApproverAdd?: (ruleId: string, approver: Approver) => void;
  onApproverRemove?: (ruleId: string, approverId: string) => void;
  onOutcomeTransitionChange?: (ruleId: string, outcome: ApprovalOutcome, transitionId: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  showTransitionLabels?: boolean;
  title?: string;
  subtitle?: string;
  learnMoreUrl?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  // Interactive props
  onRuleReorder?: (ruleId: string, newIndex: number) => void;
  onRuleCreate?: () => void;
  onRuleDelete?: (ruleId: string) => void;
}

export const APPROVAL_WORKFLOW_DEFAULTS: Partial<ApprovalWorkflowProps> = {
  preset: 'editor',
  title: 'Approvals',
  showTransitionLabels: true,
};

/**
 * Returns outcome colors for approved/declined states
 */
export function getOutcomeColors(tokens: DesignTokens) {
  return {
    approved: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      icon: tokens.colors.successScale[500],
    },
    declined: {
      bg: tokens.colors.errorScale[50],
      color: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
      icon: tokens.colors.errorScale[500],
    },
  };
}

/**
 * Returns colors for each status category
 */
export function getStatusCategoryColors(tokens: DesignTokens) {
  return {
    'todo': {
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
      dotColor: tokens.colors.neutral[400],
    },
    'in-progress': {
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      dotColor: tokens.colors.infoScale[500],
    },
    'done': {
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      dotColor: tokens.colors.successScale[500],
    },
  };
}

/**
 * Returns selectable category options
 */
export function getCategoryOptions(): Array<{ value: StatusCategory; label: string }> {
  return [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];
}

/**
 * Formats an approver for display
 */
export function formatApproverDisplay(approver: Approver): string {
  if (approver.role) {
    return `${approver.name} (${approver.role})`;
  }
  return approver.name;
}
