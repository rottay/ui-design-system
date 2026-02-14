/**
 * BhCapacityPlanner - Core Interface
 * Recruiter workload visualization with utilization and rebalancing.
 *
 * DB Reference: DBRecruiter from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBRecruiter } from '@rottay/recruiter';

export type BhCapacityPlannerPreset = 'grid' | 'list';

/** Re-export for consumer convenience */
export type { DBRecruiter };

export interface RecruiterCapacity {
  id?: string;
  name?: string;
  avatar?: string;
  department?: string;
  currentAssignments?: number;
  maxCapacity?: number;
  utilizationPercent?: number;
  activePositions?: number;
  activeCandidates?: number;
  avgTimePerCandidate?: number;
  status?: 'underutilized' | 'optimal' | 'overloaded';
}

export interface RebalanceSuggestion {
  fromRecruiterId?: string;
  fromRecruiterName?: string;
  toRecruiterId?: string;
  toRecruiterName?: string;
  candidateCount?: number;
  reason?: string;
}

export interface CapacitySummary {
  totalRecruiters?: number;
  avgUtilization?: number;
  overloadedCount?: number;
  underutilizedCount?: number;
  totalOpenReqs?: number;
}

export interface BhCapacityPlannerProps extends EngineAwareProps {
  preset?: BhCapacityPlannerPreset;

  /** Recruiter capacity data */
  recruiters?: RecruiterCapacity[];

  /** Rebalancing suggestions */
  suggestions?: RebalanceSuggestion[];

  /** Summary metrics */
  summary?: CapacitySummary;

  /** Selected recruiter for detail */
  selectedRecruiter?: string | null;

  /** Callback when recruiter is selected */
  onRecruiterSelect?: (recruiterId: string | null) => void;

  /** Callback when rebalance is accepted */
  onAcceptSuggestion?: (fromId: string, toId: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CAPACITY_PLANNER_DEFAULTS: Partial<BhCapacityPlannerProps> = {
  preset: 'grid',
};
