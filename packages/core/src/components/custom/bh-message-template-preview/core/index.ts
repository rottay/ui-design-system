/**
 * BhMessageTemplatePreview - Core Interface
 * Template preview with sample data for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhMessageTemplatePreviewPreset = 'preview' | 'compact';

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
