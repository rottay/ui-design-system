/**
 * BhPipelineStageDrawer - Core Interface
 * Drawer/panel with stage detail, conversion trend, bulk actions
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPipelineStageDrawerPreset = 'drawer' | 'modal';

export type CandidateStatus = 'active' | 'on_hold' | 'rejected' | 'advanced' | 'new';

export interface StageCandidate {
  id: string;
  name: string;
  avatarInitial: string;
  status: CandidateStatus;
  appliedAt: Date;
  score?: number;
}

export interface StageDetail {
  name: string;
  candidateCount: number;
  avgDays: number;
  conversionRate: number;
  candidates: StageCandidate[];
}

export type BulkActionType = 'advance' | 'reject' | 'send_email';

export interface BhPipelineStageDrawerProps extends EngineAwareProps {
  preset?: BhPipelineStageDrawerPreset;

  /** Stage data to display */
  stage?: StageDetail;

  /** Whether the drawer/modal is open */
  isOpen?: boolean;

  /** Callback when drawer is closed */
  onClose?: () => void;

  /** Callback when a bulk action is triggered */
  onBulkAction?: (action: BulkActionType, candidateIds: string[]) => void;

  /** Callback when a candidate is clicked */
  onCandidateClick?: (candidateId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_STAGE_DRAWER_DEFAULTS: Partial<BhPipelineStageDrawerProps> = {
  preset: 'drawer',
  isOpen: true,
};
