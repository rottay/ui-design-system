/**
 * BhRecruiterWorkload - Core Interface
 * Visual workload balancer for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhRecruiterWorkloadPreset = 'balancer' | 'compact';

export interface RecruiterWorkload {
  recruiterId: string;
  name: string;
  activePositions: number;
  capacity: number;
  interviews: number;
  pendingTasks: number;
}

export interface BhRecruiterWorkloadProps extends EngineAwareProps {
  preset?: BhRecruiterWorkloadPreset;

  /** List of recruiter workloads */
  recruiters: RecruiterWorkload[];

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
