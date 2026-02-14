/**
 * BhEmailComposer - Core Interface
 * AI email drafting with templates and variables
 *
 * DB Reference: DBMessageTemplate from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBMessageTemplate } from '@rottay/recruiter';

export type BhEmailComposerPreset = 'full' | 'minimal';

/** Re-export for consumer convenience */
export type { DBMessageTemplate };

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailVariable {
  key: string;
  label: string;
  value: string;
}

export interface BhEmailComposerProps extends EngineAwareProps {
  preset?: BhEmailComposerPreset;

  /** Available email templates */
  templates?: EmailTemplate[];

  /** Variable values for template substitution */
  variables?: EmailVariable[];

  /** Currently selected template ID */
  selectedTemplateId?: string | null;

  /** Current subject line */
  subject?: string;

  /** Current email body */
  body?: string;

  /** Recipient name */
  recipientName?: string;

  /** Recipient email */
  recipientEmail?: string;

  /** Callback when template is selected */
  onTemplateSelect?: (templateId: string) => void;

  /** Callback when subject changes */
  onSubjectChange?: (subject: string) => void;

  /** Callback when body changes */
  onBodyChange?: (body: string) => void;

  /** Callback when send is clicked */
  onSend?: () => void;

  /** Callback to trigger AI rewrite */
  onAiRewrite?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_EMAIL_COMPOSER_DEFAULTS: Partial<BhEmailComposerProps> = {
  preset: 'full',
};
