/**
 * BhTeamBoard - Core Interface
 * Team Management Board for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBTeam[] directly - no mapping needed.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBTeam } from '@rottay/recruiter';

export type BhTeamBoardPreset = 'grid' | 'detail';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterTeam = DBTeam;

/**
 * Member representation for display purposes.
 * Not a DB entity - these are derived from the members JSONB in DBTeam.
 */
export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  allocationPercent: number;
  activeJobs: number;
  hires: number;
}

/**
 * KPI data for the selected team (computed/aggregated, not stored directly).
 */
export interface TeamKpiData {
  hiresVsTarget: { actual: number; target: number };
  velocityTrend: number[];
  slaCompliance: number;
  satisfactionScore: number;
}

/**
 * Sprint data (computed/aggregated from team sprints).
 */
export interface SprintData {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  burndownData: number[];
}

/**
 * Target metrics for the team.
 */
export interface TeamTarget {
  metric: string;
  period: string;
  value: number;
  current: number;
}

export interface BhTeamBoardProps extends EngineAwareProps {
  preset?: BhTeamBoardPreset;

  /** All teams to display - accepts DBTeam[] directly from @rottay/recruiter */
  teams?: DBTeam[];

  /** Currently selected team ID */
  selectedTeam?: string | null;

  /** Callback when a team is selected */
  onTeamSelect?: (teamId: string) => void;

  /** Members of the selected team */
  members?: TeamMember[];

  /** KPI data for the selected team */
  teamKpis?: TeamKpiData;

  /** Sprint data for the selected team */
  sprintData?: SprintData;

  /** Target goals for the selected team */
  targets?: TeamTarget[];

  /** Callback to add a new team */
  onAddTeam?: () => void;

  /** Callback to edit a team */
  onEditTeam?: (teamId: string) => void;

  /** Callback to add a member to the team */
  onAddMember?: () => void;

  /** Callback to remove a member from the team */
  onRemoveMember?: (memberId: string) => void;

  /** Callback when a member role changes */
  onMemberRoleChange?: (memberId: string, role: string) => void;

  /** Whether the add/edit team modal is open */
  showAddModal?: boolean;

  /** Toggle add/edit team modal */
  onAddModalToggle?: (open: boolean) => void;

  /** Current view mode */
  viewMode?: 'grid' | 'list';

  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'grid' | 'list') => void;

  /** ID of the member currently being edited */
  editingMember?: string | null;

  /** Callback when a member is being edited */
  onMemberEdit?: (memberId: string | null) => void;

  /** Target period filter */
  targetPeriod?: 'monthly' | 'quarterly';

  /** Callback when target period changes */
  onTargetPeriodChange?: (period: 'monthly' | 'quarterly') => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TEAM_BOARD_DEFAULTS: Partial<BhTeamBoardProps> = {
  preset: 'grid',
  viewMode: 'grid',
  targetPeriod: 'monthly',
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterTeam (DBTeam) instead */
export type TeamItem = RecruiterTeam;
