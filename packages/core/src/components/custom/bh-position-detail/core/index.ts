/**
 * BhPositionDetail - Core Interface
 * Position / Client Requisition Detail for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhPositionDetailPreset = 'standard';

export type PositionStatus = 'draft' | 'open' | 'in-progress' | 'on-hold' | 'filled' | 'cancelled';
export type FeeStructure = 'percentage' | 'fixed' | 'retainer';
export type PositionEventType = 'created' | 'opened' | 'job-linked' | 'team-assigned' | 'milestone-reached' | 'sla-breach' | 'filled' | 'note';
export type PositionTab = 'overview' | 'jobs' | 'team' | 'financials' | 'sla';

export interface PositionInfo {
  title: string;
  clientName: string;
  status: PositionStatus;
  deadline: Date;
  feeStructure: FeeStructure;
}

export interface RequirementSummary {
  description: string;
  skills: string[];
  seniority: string;
  location: string;
  headcount: number;
  filled: number;
}

export interface LinkedJob {
  id: string;
  title: string;
  candidateCount: number;
  status: 'draft' | 'open' | 'paused' | 'closed' | 'filled';
}

export interface TeamAssignment {
  teamName: string;
  leadRecruiter: string;
  allocationPercent: number;
}

export interface FinancialTracker {
  feeType: FeeStructure;
  amount: number;
  projectedCost: number;
  actualCost: number;
}

export interface SlaMilestone {
  label: string;
  deadline: Date;
  completed: boolean;
}

export interface SlaMonitor {
  deadline: Date;
  milestones: SlaMilestone[];
  breaches: number;
  progress: number;
}

export interface PositionEvent {
  id: string;
  type: PositionEventType;
  message: string;
  time: Date;
}

export interface BhPositionDetailProps extends EngineAwareProps {
  preset?: BhPositionDetailPreset;

  /** Core position information */
  positionInfo: PositionInfo;

  /** Requirements summary */
  requirements?: RequirementSummary;

  /** Linked jobs */
  linkedJobs?: LinkedJob[];

  /** Team assignments */
  teamAssignments?: TeamAssignment[];

  /** Financial tracker data */
  financials?: FinancialTracker;

  /** SLA monitoring data */
  slaMonitor?: SlaMonitor;

  /** Position activity events */
  events?: PositionEvent[];

  /** Tab change callback */
  onTabChange?: (tab: PositionTab) => void;

  /** Job click callback */
  onJobClick?: (jobId: string) => void;

  /** Edit position callback */
  onEdit?: () => void;

  /** Team assign callback */
  onTeamAssign?: (teamName: string) => void;

  /** Team remove callback */
  onTeamRemove?: (teamName: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_POSITION_DETAIL_DEFAULTS: Partial<BhPositionDetailProps> = {
  preset: 'standard',
};
