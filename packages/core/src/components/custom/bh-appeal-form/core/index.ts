/**
 * BhAppealForm - Core Interface
 * Appeal submission form for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhAppealFormPreset = 'form' | 'compact';

export interface BhAppealFormProps extends EngineAwareProps {
  preset?: BhAppealFormPreset;

  /** Candidate name */
  candidateName?: string;

  /** Position title */
  positionTitle?: string;

  /** Original decision */
  originalDecision?: string;

  /** Appeal reason text */
  reason?: string;

  /** Supporting evidence text */
  evidence?: string;

  /** Callback when reason changes */
  onReasonChange?: (reason: string) => void;

  /** Callback when evidence changes */
  onEvidenceChange?: (evidence: string) => void;

  /** Callback to submit appeal */
  onSubmit?: () => void;

  /** Callback to cancel */
  onCancel?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_APPEAL_FORM_DEFAULTS: Partial<BhAppealFormProps> = {
  preset: 'form',
};
