/**
 * BhPipelineStageDrawer - Core Interface
 * Drawer/panel with stage detail, conversion trend, bulk actions.
 * Renders application data from DBApplication records.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApplication, ApplicationStatusValue } from '@rottay/recruiter';

export type BhPipelineStageDrawerPreset = 'drawer' | 'modal';

/**
 * Candidate display status - uses DB ApplicationStatusValue for active pipeline statuses,
 * plus UI-specific states like 'advanced' and 'new'.
 */
export type CandidateStatus = ApplicationStatusValue | 'active' | 'advanced' | 'new';

export interface StageCandidate {
  id?: string;
  name?: string;
  avatarInitial?: string;
  status?: CandidateStatus;
  appliedAt?: Date | string | null;
  score?: number;
  /** Priority level of the application */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** Source channel where the application originated */
  source?: string;
  /** AI-calculated match score (0-100) */
  aiMatchScore?: number;
  /** Whether the SLA for this application has been breached */
  slaBreached?: boolean;
  /** Number of days the candidate has been in the pipeline */
  daysInPipeline?: number;
  /** Interview recommendation from interviewers */
  interviewRecommendation?: string;
  /** Timestamp of the last communication with the candidate */
  lastCommunicationAt?: Date | string | null;
  /** Number of communications with the candidate */
  communicationCount?: number;
  /** Whether the candidate has a pending response */
  candidateResponsePending?: boolean;
  /** Optional: raw application record */
  application?: Partial<DBApplication>;
}

export interface StageDetail {
  name?: string;
  candidateCount?: number;
  avgDays?: number;
  conversionRate?: number;
  candidates?: StageCandidate[];
  /** Number of candidates with breached SLAs in this stage */
  slaBreachCount?: number;
  /** Average score across all candidates in this stage */
  avgScore?: number;
  /** Most common application source in this stage */
  topSource?: string;
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
