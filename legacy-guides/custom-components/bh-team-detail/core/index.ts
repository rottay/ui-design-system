/**
 * BhTeamDetail - Core Interface
 * Team detail with member list, positions, performance for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts a DBTeam directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBTeam } from '@rottay/recruiter';

export type BhTeamDetailPreset = 'full' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterTeam = DBTeam;

/**
 * Position item for display within the team detail view.
 */
export interface TeamPosition {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  /** Position priority level */
  priority?: string;
  /** Number of days the position has been open */
  daysOpen?: number;
  /** Total candidates in pipeline for this position */
  totalCandidates?: number;
  /** Client name associated with this position */
  clientName?: string;
}

/**
 * Member item for display within the team detail view.
 */
export interface TeamDetailMember {
  id: string;
  name: string;
  role: string;
  avatarInitial: string;
  hireDate?: string;
  /** Member allocation percentage (from DBTeam.members JSONB) */
  allocation?: number;
  /** Number of active positions assigned to this member */
  activePositions?: number;
  /** Current utilization percentage */
  currentUtilization?: number;
  /** Member specializations */
  specializations?: string[];
}

export interface BhTeamDetailProps extends EngineAwareProps {
  preset?: BhTeamDetailPreset;

  /** Team data - accepts DBTeam directly from @rottay/recruiter */
  team?: DBTeam;

  /** Members for display (derived from team.members JSONB) */
  members?: TeamDetailMember[];

  /** Positions assigned to this team */
  positions?: TeamPosition[];

  /** Performance metrics (computed/aggregated) */
  metrics?: Array<{ label: string; value: number; target: number }>;

  /** Callback when a member is clicked */
  onMemberClick?: (memberId: string) => void;

  /** Callback when a position is clicked */
  onPositionClick?: (positionId: string) => void;

  /** KPI targets map (from DBTeam.kpiTargets JSONB) */
  kpiTargets?: Record<string, number>;

  /** KPI actuals map (from DBTeam.kpiActuals JSONB) */
  kpiActuals?: Record<string, number>;

  /** Team specializations (from DBTeam.specializations JSONB) */
  specializations?: string[];

  /** Industries the team covers (from DBTeam.industries JSONB) */
  industries?: string[];

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TEAM_DETAIL_DEFAULTS: Partial<BhTeamDetailProps> = {
  preset: 'full',
  loading: false,
};
