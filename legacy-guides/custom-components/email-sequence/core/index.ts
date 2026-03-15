import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type EmailSequencePreset = 'builder' | 'preview';

export type SequenceStatus = 'draft' | 'in-review' | 'active' | 'paused' | 'completed' | 'archived';

export type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'blockquote'
  | 'ordered-list'
  | 'unordered-list'
  | 'link'
  | 'embed';

export type DelayUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export interface StepDelay {
  value: number;
  unit: DelayUnit;
}

export type StepStatus = 'draft' | 'scheduled' | 'sent' | 'failed' | 'skipped';

export interface EmailRecipientField {
  value: string;
  email?: string;
}

export interface EmailStep {
  id: string;
  order: number;
  subject: string;
  body: string;
  from?: EmailRecipientField;
  to?: EmailRecipientField[];
  cc?: EmailRecipientField[];
  bcc?: EmailRecipientField[];
  status: StepStatus;
  delay?: StepDelay;
  variables?: string[];
  savedAt?: string;
}

export type ContactSendStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'bounced' | 'replied';

export interface SequenceContact {
  id: string;
  name: string;
  email: string;
  company?: string;
  companyLogo?: string;
  avatar?: string;
  sendStatus: ContactSendStatus;
  currentStepIndex?: number;
  variableValues?: Record<string, string>;
}

export interface EmailSequenceProps extends EngineAwareProps {
  preset?: EmailSequencePreset;
  title?: string;
  status?: SequenceStatus;
  isSaved?: boolean;
  steps?: EmailStep[];
  contacts?: SequenceContact[];
  activeStepId?: string;
  onActiveStepChange?: (stepId: string) => void;
  selectedContactId?: string;
  onSelectedContactChange?: (contactId: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  toolbarActions?: ToolbarAction[];
  onToolbarAction?: (action: ToolbarAction, stepId: string) => void;
  onStepChange?: (stepId: string, field: string, value: unknown) => void;
  onStepAdd?: () => void;
  onStepRemove?: (stepId: string) => void;
  onSend?: (contactIds: string[]) => void;
  onEditDraft?: () => void;
  onStatusChange?: (status: SequenceStatus) => void;
  onBulkAction?: (action: string, contactIds: string[]) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const EMAIL_SEQUENCE_DEFAULTS: Partial<EmailSequenceProps> = {
  preset: 'builder',
  title: 'Email Sequence',
  status: 'draft',
  isSaved: true,
  toolbarActions: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'code',
    'blockquote',
    'ordered-list',
    'unordered-list',
    'link',
    'embed',
  ],
};

export function getSequenceStatusColors(tokens: DesignTokens) {
  return {
    draft: { color: tokens.colors.neutral[700], bgColor: tokens.colors.neutral[100], border: tokens.colors.neutral[200] },
    'in-review': { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
    active: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    paused: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[100], border: tokens.colors.warningScale[200] },
    completed: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50], border: tokens.colors.primaryScale[200] },
    archived: { color: tokens.colors.neutral[500], bgColor: tokens.colors.neutral[50], border: tokens.colors.neutral[200] },
  };
}

export function getStepStatusColors(tokens: DesignTokens) {
  return {
    draft: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[50], border: tokens.colors.neutral[200] },
    scheduled: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200] },
    sent: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    failed: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    skipped: { color: tokens.colors.neutral[500], bgColor: tokens.colors.neutral[50], border: tokens.colors.neutral[200] },
  };
}

export function getContactSendStatusColors(tokens: DesignTokens) {
  return {
    pending: { color: tokens.colors.neutral[500], bgColor: tokens.colors.neutral[100] },
    sending: { color: tokens.colors.infoScale[500], bgColor: tokens.colors.infoScale[100] },
    sent: { color: tokens.colors.successScale[500], bgColor: tokens.colors.successScale[100] },
    failed: { color: tokens.colors.errorScale[500], bgColor: tokens.colors.errorScale[100] },
    bounced: { color: tokens.colors.warningScale[500], bgColor: tokens.colors.warningScale[100] },
    replied: { color: tokens.colors.primaryScale[500], bgColor: tokens.colors.primaryScale[100] },
  };
}

export function getDelayConnectorStyles(tokens: DesignTokens) {
  return {
    line: {
      borderLeft: `2px dashed ${tokens.colors.neutral[300]}`,
    },
    pill: {
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
      border: tokens.colors.neutral[200],
    },
  };
}

export function formatDelayDisplay(delay: StepDelay): string {
  const { value, unit } = delay;
  if (value === 1) {
    const singular: Record<DelayUnit, string> = {
      minutes: 'minute',
      hours: 'hour',
      days: 'day',
      weeks: 'week',
    };
    return `${value} ${singular[unit]}`;
  }
  return `${value} ${unit}`;
}

export function formatContactDisplay(contact: SequenceContact): string {
  if (contact.company) {
    return `${contact.name} (${contact.company})`;
  }
  return contact.name;
}

export function getContactInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

export function resolveTemplateVariables(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

export function extractTemplateVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

export function getToolbarActionLabel(action: ToolbarAction): string {
  const labels: Record<ToolbarAction, string> = {
    bold: 'B',
    italic: 'I',
    underline: 'U',
    strikethrough: 'S',
    code: '<>',
    blockquote: '\u201C',
    'ordered-list': '1.',
    'unordered-list': '\u2022',
    link: '\uD83D\uDD17',
    embed: '\u2423',
  };
  return labels[action];
}

export function getToolbarActionTitle(action: ToolbarAction): string {
  const titles: Record<ToolbarAction, string> = {
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    code: 'Code',
    blockquote: 'Blockquote',
    'ordered-list': 'Ordered List',
    'unordered-list': 'Unordered List',
    link: 'Insert Link',
    embed: 'Embed',
  };
  return titles[action];
}
