/**
 * BhPositionDetail - Core Interface
 * Position / Client Requisition Detail for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts a DBPosition directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBPosition } from '@rottay/recruiter';

export type BhPositionDetailPreset = 'standard';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterPosition = DBPosition;

/**
 * Tab options for the position detail view.
 */
export type PositionTab = 'overview' | 'jobs' | 'team' | 'financials' | 'sla';

/**
 * Linked job for display (simplified).
 */
export interface LinkedJob {
  id: string;
  title: string;
  candidateCount: number;
  status: string;
  /** Hiring urgency level for this job */
  hiringUrgency?: 'low' | 'normal' | 'high' | 'urgent';
  /** Number of positions already filled */
  filledCount?: number;
  /** Total number of openings for this job */
  openings?: number;
}

/**
 * Team assignment for display.
 */
export interface TeamAssignment {
  teamName: string;
  leadRecruiter: string;
  allocationPercent: number;
  /** Maximum capacity of the team for this position */
  capacity?: number;
  /** Current utilization percentage of the team */
  utilization?: number;
}

/**
 * SLA milestone for the position.
 */
export interface SlaMilestone {
  label: string;
  deadline: Date;
  completed: boolean;
}

/**
 * SLA monitoring data (computed from DB fields).
 */
export interface SlaMonitor {
  deadline: Date;
  milestones: SlaMilestone[];
  breaches: number;
  progress: number;
}

/**
 * Position activity event.
 */
export interface PositionEvent {
  id: string;
  type: string;
  message: string;
  time: Date;
}

export interface BhPositionDetailProps extends EngineAwareProps {
  preset?: BhPositionDetailPreset;

  /** Position data - accepts DBPosition directly from @rottay/recruiter */
  position?: DBPosition;

  /** Linked jobs */
  linkedJobs?: LinkedJob[];

  /** Team assignments */
  teamAssignments?: TeamAssignment[];

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

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterPosition (DBPosition) instead */
export type PositionInfo = RecruiterPosition;
/** @deprecated Requirements are now part of DBPosition jsonb fields */
export interface RequirementSummary {
  label: string;
  met: boolean;
  detail?: string;
}
/** @deprecated Financial tracking is now part of DBPosition directly */
export interface FinancialTracker {
  totalFee: number;
  invoiced: number;
  collected: number;
  outstanding: number;
  currency?: string;
}
/** @deprecated Use DBPosition.status field (string) instead */
export type PositionStatus = string;
/** @deprecated Fee structure is part of DBPosition billing fields */
export interface FeeStructure {
  type: 'contingency' | 'retained' | 'flat';
  percentage?: number;
  flatAmount?: number;
  currency?: string;
}
/** @deprecated Use PositionEvent['type'] instead */
export type PositionEventType = string;
