/**
 * BhMessageTemplatePreview - Core Interface
 * Template preview with sample data for BitHire ATS platform
 *
 * DB Reference: DBMessageTemplate from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBMessageTemplate } from '@rottay/recruiter';

export type BhMessageTemplatePreviewPreset = 'preview' | 'compact';

/** Re-export for consumer convenience */
export type { DBMessageTemplate };

export interface BhMessageTemplatePreviewProps extends EngineAwareProps {
  preset?: BhMessageTemplatePreviewPreset;

  /** Template name */
  templateName?: string;

  /** Email subject line */
  subject?: string;

  /** Email body content */
  body?: string;

  /** Sample data to replace variables */
  sampleData?: Record<string, string>;

  /** Preview recipient name */
  recipientName?: string;

  /** Preview recipient email */
  recipientEmail?: string;

  /** Callback to send the message */
  onSend?: () => void;

  /** Callback to edit the template */
  onEdit?: () => void;

  /** Callback to close the preview */
  onClose?: () => void;

  /** Template delivery type */
  templateType?: 'email' | 'sms' | 'whatsapp' | 'linkedin';
  /** Plain text version of the body */
  plainTextBody?: string;
  /** Template variables with current values */
  variables?: Array<{ key: string; label: string; value?: string }>;
  /** Target audience for this template */
  targetAudience?: string;
  /** Use case this template is designed for */
  useCase?: string;
  /** Language code (e.g. "en", "es") */
  language?: string;
  /** Template version number */
  version?: number;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_MESSAGE_TEMPLATE_PREVIEW_DEFAULTS: Partial<BhMessageTemplatePreviewProps> = {
  preset: 'preview',
};
