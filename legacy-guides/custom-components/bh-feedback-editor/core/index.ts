/**
 * BhFeedbackEditor - Core Interface
 * Candidate Feedback Composer for the BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhFeedbackEditorPreset = 'standard' | 'compact';

export type FeedbackChannel = 'email' | 'sms' | 'whatsapp' | 'linkedin';

export type FeedbackTone = 'encouraging' | 'neutral' | 'professional';

export type FeedbackTemplateCategory =
  | 'rejection_warm'
  | 'rejection_technical'
  | 'advancement'
  | 'hold';

export interface FeedbackTemplate {
  id: string;
  name: string;
  category: FeedbackTemplateCategory;
  content: string;
  variables: string[];
  effectiveness?: number;
}

export interface DecisionContext {
  candidateName: string;
  jobTitle: string;
  decision: string;
  scoreHighlights: string[];
  keyEvidence: string[];
  reasoning: string;
}

export interface BhFeedbackEditorProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhFeedbackEditorPreset;

  /** Decision context for the candidate */
  context: DecisionContext;

  /** Available templates */
  templates?: FeedbackTemplate[];

  /** Currently selected template ID */
  selectedTemplate?: string | null;

  /** Callback when a template is selected */
  onTemplateSelect?: (templateId: string | null) => void;

  /** Current message content */
  messageContent?: string;

  /** Callback when message content changes */
  onMessageChange?: (content: string) => void;

  /** Email subject line */
  subject?: string;

  /** Callback when subject changes */
  onSubjectChange?: (subject: string) => void;

  /** Active communication channel */
  channel?: FeedbackChannel;

  /** Callback when channel changes */
  onChannelChange?: (channel: FeedbackChannel) => void;

  /** Active tone setting */
  tone?: FeedbackTone;

  /** Callback when tone changes */
  onToneChange?: (tone: FeedbackTone) => void;

  /** Whether AI is generating a draft */
  isGenerating?: boolean;

  /** Callback to trigger AI generation */
  onGenerate?: () => void;

  /** Whether preview panel is shown */
  showPreview?: boolean;

  /** Callback to toggle preview */
  onPreviewToggle?: (show: boolean) => void;

  /** Callback to send the feedback */
  onSend?: () => void;

  /** Recipient preview string (e.g. email address) */
  recipientPreview?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_FEEDBACK_EDITOR_DEFAULTS: Partial<BhFeedbackEditorProps> = {
  preset: 'standard',
};

/**
 * Returns channel display config
 */
export function getChannelConfig(tokens: DesignTokens) {
  return {
    email: {
      label: 'Email',
      color: tokens.colors.primaryScale[600],
      bgColor: tokens.colors.primaryScale[50],
      borderColor: tokens.colors.primaryScale[200],
      hasSubject: true,
      maxChars: 0,
    },
    sms: {
      label: 'SMS',
      color: tokens.colors.successScale[600],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      hasSubject: false,
      maxChars: 160,
    },
    whatsapp: {
      label: 'WhatsApp',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      hasSubject: false,
      maxChars: 0,
    },
    linkedin: {
      label: 'LinkedIn',
      color: tokens.colors.infoScale[600],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
      hasSubject: false,
      maxChars: 0,
    },
  };
}

/**
 * Returns tone display config
 */
export function getToneConfig(tokens: DesignTokens) {
  return {
    encouraging: {
      label: 'Encouraging',
      description: 'Warm and supportive, with optimism about future opportunities',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
    },
    neutral: {
      label: 'Neutral',
      description: 'Balanced and objective, focused on facts and next steps',
      color: tokens.colors.neutral[700],
      bgColor: tokens.colors.neutral[50],
      borderColor: tokens.colors.neutral[200],
    },
    professional: {
      label: 'Professional',
      description: 'Formal and polished, emphasizing mutual respect',
      color: tokens.colors.primaryScale[700],
      bgColor: tokens.colors.primaryScale[50],
      borderColor: tokens.colors.primaryScale[200],
    },
  };
}

/**
 * Returns template category display labels and colors
 */
export function getTemplateCategoryConfig(tokens: DesignTokens) {
  return {
    rejection_warm: {
      label: 'Warm Rejection',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
    },
    rejection_technical: {
      label: 'Technical Rejection',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
    },
    advancement: {
      label: 'Advancement',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
    },
    hold: {
      label: 'On Hold',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[100],
    },
  };
}

/**
 * Returns decision badge color config
 */
export function getDecisionBadgeColors(tokens: DesignTokens, decision: string) {
  const lower = decision.toLowerCase();
  if (lower.includes('advance') || lower.includes('accept') || lower.includes('approve')) {
    return {
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
    };
  }
  if (lower.includes('reject') || lower.includes('decline')) {
    return {
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
    };
  }
  return {
    color: tokens.colors.warningScale[700],
    bgColor: tokens.colors.warningScale[50],
    borderColor: tokens.colors.warningScale[200],
  };
}

/**
 * Substitutes template variables in content
 */
export function substituteVariables(
  content: string,
  context: DecisionContext,
): string {
  return content
    .replace(/\{name\}/g, context.candidateName)
    .replace(/\{job_title\}/g, context.jobTitle)
    .replace(/\{score_summary\}/g, context.scoreHighlights.join(', '))
    .replace(/\{decision\}/g, context.decision)
    .replace(/\{reasoning\}/g, context.reasoning);
}

/**
 * Available variable chips for the editor
 */
export const FEEDBACK_VARIABLES = [
  { key: 'name', label: '{name}' },
  { key: 'job_title', label: '{job_title}' },
  { key: 'score_summary', label: '{score_summary}' },
  { key: 'decision', label: '{decision}' },
  { key: 'reasoning', label: '{reasoning}' },
];
