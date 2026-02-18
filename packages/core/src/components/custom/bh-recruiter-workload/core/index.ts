/**
 * BhRecruiterWorkload - Core Interface
 * Visual workload balancer for BitHire ATS platform
 *
 * DB Reference: DBRecruiter from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBRecruiter } from '@rottay/recruiter';

export type BhRecruiterWorkloadPreset = 'balancer' | 'compact';

/** Re-export for consumer convenience */
export type { DBRecruiter };

export interface RecruiterWorkloadItem {
  recruiterId?: string;
  name?: string;
  activePositions?: number;
  capacity?: number;
  interviews?: number;
  pendingTasks?: number;
  avatar?: string;
  utilizationPercent?: number;
  avgTimePerCandidate?: number;
  activeCandidates?: number;
  slaBreachCount?: number;
  overdue?: number;
  department?: string;
  teamName?: string;
}

export interface BhRecruiterWorkloadProps extends EngineAwareProps {
  preset?: BhRecruiterWorkloadPreset;

  /** List of recruiter workloads */
  recruiters?: RecruiterWorkloadItem[];

  /** Callback when rebalancing a position */
  onRebalance?: (recruiterId: string, positionId: string) => void;

  /** Currently selected recruiter */
  selectedRecruiterId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_RECRUITER_WORKLOAD_DEFAULTS: Partial<BhRecruiterWorkloadProps> = {
  preset: 'balancer',
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterWorkloadItem instead */
export type RecruiterWorkload = RecruiterWorkloadItem;
/** @deprecated Use BhRecruiterWorkloadProps instead */
export type BhRecruiterWorkloadItemProps = BhRecruiterWorkloadProps;
