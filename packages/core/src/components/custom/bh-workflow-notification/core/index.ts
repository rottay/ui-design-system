/**
 * BhWorkflowNotification - Core Interface
 * Notification configuration for workflow triggers for BitHire ATS platform
 *
 * DB Reference: DBApprovalRequest from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBApprovalRequest } from '@rottay/recruiter';

export type BhWorkflowNotificationPreset = 'config' | 'compact';

/** Re-export for consumer convenience */
export type { DBApprovalRequest };

export interface NotificationRule {
  id?: string;
  event?: string;
  channel?: 'email' | 'slack' | 'in-app';
  recipients?: string[];
  enabled?: boolean;
  template?: string;

  /** Display name for this rule */
  name?: string;
  /** Description of when/why this notification fires */
  description?: string;
  /** Notification priority level */
  priority?: 'low' | 'medium' | 'high';
  /** Conditions that must be met for the notification to fire */
  triggerConditions?: string[];
  /** Delay in minutes before sending the notification */
  delayMinutes?: number;
  /** Whether notifications are batched together */
  batchEnabled?: boolean;
  /** Date/time when this notification was last sent */
  lastSentAt?: Date;
  /** Number of times this notification has been sent */
  sendCount?: number;
  /** User who created this rule */
  createdBy?: string;
}

export interface BhWorkflowNotificationProps extends EngineAwareProps {
  preset?: BhWorkflowNotificationPreset;

  /** Notification rules */
  rules?: NotificationRule[];

  /** Callback to toggle a rule on/off */
  onRuleToggle?: (ruleId: string) => void;

  /** Callback to edit a rule */
  onRuleEdit?: (ruleId: string) => void;

  /** Callback to add a new rule */
  onAddRule?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_WORKFLOW_NOTIFICATION_DEFAULTS: Partial<BhWorkflowNotificationProps> = {
  preset: 'config',
};
