/**
 * BhOfferLetterPreview - Core Interface
 * A4 letter preview with variable highlighting
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhOfferLetterPreviewPreset = 'preview' | 'compact';

export interface OfferLetterData {
  candidateName: string;
  position: string;
  salary: number;
  startDate: string;
  benefits: string[];
  customFields?: Record<string, string>;
}

export interface BhOfferLetterPreviewProps extends EngineAwareProps {
  preset?: BhOfferLetterPreviewPreset;

  /** Offer letter data */
  letterData: OfferLetterData;

  /** Company name */
  companyName?: string;

  /** Currency symbol */
  currency?: string;

  /** Whether to highlight variables */
  highlightVariables?: boolean;

  /** Callback when download is clicked */
  onDownload?: () => void;

  /** Callback when print is clicked */
  onPrint?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OFFER_LETTER_PREVIEW_DEFAULTS: Partial<BhOfferLetterPreviewProps> = {
  preset: 'preview',
  currency: '$',
  highlightVariables: true,
};
