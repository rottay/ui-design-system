/**
 * BhTeamList - Core Interface
 * DataTable + Card view of teams with member avatars for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBTeam[] directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBTeam } from '@rottay/recruiter';

export type BhTeamListPreset = 'table' | 'cards';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterTeam = DBTeam;

/**
 * Lightweight member representation for avatar display.
 */
export interface TeamMemberSummary {
  id: string;
  name: string;
  role: string;
  avatarInitial: string;
}

export interface BhTeamListProps extends EngineAwareProps {
  preset?: BhTeamListPreset;

  /** Teams to display - accepts DBTeam[] directly from @rottay/recruiter */
  teams?: DBTeam[];

  /** Callback when a team is clicked */
  onTeamClick?: (teamId: string) => void;

  /** Currently selected team ID */
  selectedTeamId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TEAM_LIST_DEFAULTS: Partial<BhTeamListProps> = {
  preset: 'table',
  loading: false,
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use TeamMemberSummary instead */
export type TeamMember = TeamMemberSummary;
/** @deprecated Use RecruiterTeam (DBTeam) instead */
export type TeamSummary = RecruiterTeam;
