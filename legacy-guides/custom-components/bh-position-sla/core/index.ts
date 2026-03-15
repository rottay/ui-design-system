/**
 * BhPositionSla - Core Interface
 * SLA countdown monitor for positions in BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBPosition[] directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBPosition } from '@rottay/recruiter';

export type BhPositionSlaPreset = 'monitor' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterPosition = DBPosition;

/**
 * SLA-focused view data derived from DBPosition.
 * Kept as a separate interface since these are computed/display values.
 */
/** Historical breach record for SLA tracking */
export interface SlaBreachRecord {
  /** Unique breach identifier */
  id: string;
  /** Date when the breach occurred */
  breachedAt: Date | string;
  /** Stage at which the breach occurred */
  stage?: string;
  /** Duration of the breach in days */
  durationDays?: number;
  /** Resolution notes */
  resolution?: string;
  /** Whether the breach has been resolved */
  resolved?: boolean;
}

/** Milestone tracking entry for SLA progress */
export interface SlaMilestoneEntry {
  /** Milestone label */
  label: string;
  /** Target deadline for the milestone */
  deadline: Date | string;
  /** Whether the milestone has been completed */
  completed: boolean;
  /** Actual completion date */
  completedAt?: Date | string | null;
}

/** Compliance status for SLA tracking */
export type SlaComplianceStatus = 'compliant' | 'non-compliant' | 'under-review' | 'exempt';

export interface PositionSlaData {
  id: string;
  positionTitle: string;
  clientName?: string;
  slaDeadline?: Date | null;
  daysRemaining: number;
  status: 'on-track' | 'at-risk' | 'breached';
  currentStage?: string;
  candidateCount?: number;
  /** Historical breach records */
  breachHistory?: SlaBreachRecord[];
  /** Milestone tracking entries */
  milestones?: SlaMilestoneEntry[];
  /** Overall compliance status */
  complianceStatus?: SlaComplianceStatus;
  /** Total number of breaches */
  totalBreaches?: number;
  /** Average days per stage */
  avgDaysPerStage?: number;
  /** Target days to fill */
  targetDaysToFill?: number;
}

export interface BhPositionSlaProps extends EngineAwareProps {
  preset?: BhPositionSlaPreset;

  /** Positions with SLA data - can use DBPosition[] or computed PositionSlaData[] */
  positions?: PositionSlaData[];

  /** Callback when a position is clicked */
  onPositionClick?: (positionId: string) => void;

  /** Currently selected position ID */
  selectedPositionId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_POSITION_SLA_DEFAULTS: Partial<BhPositionSlaProps> = {
  preset: 'monitor',
  loading: false,
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use PositionSlaData instead */
export type PositionSla = PositionSlaData;
