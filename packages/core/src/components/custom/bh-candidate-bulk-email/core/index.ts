/**
 * BhCandidateBulkEmail - Core Interface
 * Multi-candidate email with per-candidate preview
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhCandidateBulkEmailPreset = 'full' | 'compact';

export interface BulkEmailRecipient {
  id: string;
  name: string;
  email: string;
  variables: Record<string, string>;
}

export interface BhCandidateBulkEmailProps extends EngineAwareProps {
  preset?: BhCandidateBulkEmailPreset;

  /** Recipients for the bulk email */
  recipients: BulkEmailRecipient[];

  /** Email subject template */
  subject?: string;

  /** Email body template */
  body?: string;

  /** Title */
  title?: string;

  /** Callback when a recipient is toggled */
  onRecipientToggle?: (recipientId: string) => void;

  /** Callback when send is triggered */
  onSend?: () => void;

  /** Callback when preview is requested for a recipient */
  onPreview?: (recipientId: string) => void;

  /** Selected recipient IDs */
  selectedIds?: string[];

  /** Currently previewing recipient ID */
  previewId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CANDIDATE_BULK_EMAIL_DEFAULTS: Partial<BhCandidateBulkEmailProps> = {
  preset: 'full',
};
