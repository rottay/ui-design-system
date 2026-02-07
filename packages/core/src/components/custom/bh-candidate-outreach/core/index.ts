import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhCandidateOutreachPreset = 'composer' | 'tracker';

export type OutreachChannel = 'email' | 'sms' | 'whatsapp' | 'linkedin';

export interface OutreachRecipient {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  effectiveness?: number;
}

export interface CampaignMetrics {
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
}

export interface ABVariant {
  id: string;
  name: string;
  content: string;
  splitPercent: number;
  metrics?: CampaignMetrics;
}

export interface ScheduleConfig {
  sendNow: boolean;
  scheduledDate?: string;
  batchSize?: number;
  rateLimit?: number;
}

export interface BhCandidateOutreachProps extends EngineAwareProps {
  preset?: BhCandidateOutreachPreset;
  channel?: OutreachChannel;
  onChannelChange?: (channel: OutreachChannel) => void;
  recipients?: OutreachRecipient[];
  onRecipientsChange?: (recipients: OutreachRecipient[]) => void;
  templates?: OutreachTemplate[];
  selectedTemplate?: OutreachTemplate | null;
  onTemplateSelect?: (template: OutreachTemplate) => void;
  messageContent?: string;
  onMessageChange?: (content: string) => void;
  subject?: string;
  onSubjectChange?: (subject: string) => void;
  scheduleConfig?: ScheduleConfig;
  onScheduleChange?: (config: ScheduleConfig) => void;
  campaignMetrics?: CampaignMetrics;
  variants?: ABVariant[];
  onVariantsChange?: (variants: ABVariant[]) => void;
  previewRecipient?: OutreachRecipient | null;
  onPreviewChange?: (recipient: OutreachRecipient | null) => void;
  onSend?: () => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_CANDIDATE_OUTREACH_DEFAULTS: Partial<BhCandidateOutreachProps> = {
  preset: 'composer',
};

export function getChannelColors(tokens: DesignTokens) {
  return {
    email: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50], border: tokens.colors.primaryScale[200], iconBg: tokens.colors.primaryScale[100] },
    sms: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200], iconBg: tokens.colors.successScale[100] },
    whatsapp: { color: tokens.colors.successScale[800], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200], iconBg: tokens.colors.successScale[100] },
    linkedin: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200], iconBg: tokens.colors.infoScale[100] },
  };
}

export function getMetricColors(tokens: DesignTokens) {
  return {
    sent: { color: tokens.colors.primaryScale[600], bgColor: tokens.colors.primaryScale[50] },
    opened: { color: tokens.colors.infoScale[600], bgColor: tokens.colors.infoScale[50] },
    replied: { color: tokens.colors.successScale[600], bgColor: tokens.colors.successScale[50] },
    bounced: { color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50] },
  };
}

export function getRecipientInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

export function resolveVariables(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

export function extractVariables(text: string): string[] {
  const matches = text.match(/\{(\w+)\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{|\}/g, '')))];
}

export function getChannelLabel(channel: OutreachChannel): string {
  const labels: Record<OutreachChannel, string> = {
    email: 'Email',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn',
  };
  return labels[channel];
}

export function getSmsCharacterLimit(): number {
  return 160;
}

export function getLinkedInCharacterLimit(): number {
  return 300;
}
