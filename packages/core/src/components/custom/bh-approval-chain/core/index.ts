/**
 * BhApprovalChain - Core Interface
 * Vertical approval chain visualizer for BitHire ATS platform
 *
 * DB Reference: DBApprovalRequest from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApprovalRequest } from '@rottay/recruiter';

export type BhApprovalChainPreset = 'vertical' | 'compact';

/** Re-export for consumer convenience */
export type { DBApprovalRequest };

export interface ApprovalChainStep {
  id?: string;
  approverName?: string;
  approverRole?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'skipped';
  decidedAt?: Date;
  comment?: string;
  order?: number;
}

export interface BhApprovalChainProps extends EngineAwareProps {
  preset?: BhApprovalChainPreset;

  /** Array of approval chain steps */
  steps?: ApprovalChainStep[];

  /** Title of the entity being approved */
  entityTitle?: string;

  /** Type of entity being approved */
  entityType?: string;

  /** ID of the current active step */
  currentStepId?: string;

  /** Callback when a step is clicked */
  onStepClick?: (stepId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_APPROVAL_CHAIN_DEFAULTS: Partial<BhApprovalChainProps> = {
  preset: 'vertical',
  loading: false,
};
