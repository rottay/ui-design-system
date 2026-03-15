import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type NotificationTemplateEditorPreset = 'editor' | 'preview' | 'list';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app' | 'webhook';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
  enabled: boolean;
  lastSentAt?: Date;
  sentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplateEditorProps extends EngineAwareProps {
  preset?: NotificationTemplateEditorPreset;
  templates: NotificationTemplate[];
  onCreateTemplate?: () => void;
  onEditTemplate?: (id: string) => void;
  onDeleteTemplate?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggle?: (id: string) => void;
  onPreview?: (id: string) => void;
  selectedTemplateId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const NOTIFICATION_TEMPLATE_EDITOR_DEFAULTS: Partial<NotificationTemplateEditorProps> = {
  preset: 'editor',
  title: 'Notification Templates',
};

export function getChannelColors(tokens: DesignTokens) {
  return {
    email: {
      color: tokens.colors.primaryScale[700],
      bgColor: tokens.colors.primaryScale[50],
      border: tokens.colors.primaryScale[200],
    },
    sms: {
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      border: tokens.colors.successScale[200],
    },
    push: {
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      border: tokens.colors.warningScale[200],
    },
    'in-app': {
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      border: tokens.colors.infoScale[200],
    },
    webhook: {
      color: tokens.colors.secondaryScale[700],
      bgColor: tokens.colors.secondaryScale[50],
      border: tokens.colors.secondaryScale[200],
    },
  };
}

export function getChannelIcon(channel: NotificationChannel): string {
  const icons: Record<NotificationChannel, string> = {
    email: '\u2709',
    sms: '\u{1F4F1}',
    push: '\u{1F514}',
    'in-app': '\u{1F4AC}',
    webhook: '\u{1F517}',
  };
  return icons[channel];
}

export function getChannelLabel(channel: NotificationChannel): string {
  const labels: Record<NotificationChannel, string> = {
    email: 'Email',
    sms: 'SMS',
    push: 'Push',
    'in-app': 'In-App',
    webhook: 'Webhook',
  };
  return labels[channel];
}

export function formatSentCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
