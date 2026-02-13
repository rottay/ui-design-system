/**
 * BhTeamList - Core Interface
 * DataTable + Card view of teams with member avatars for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhTeamListPreset = 'table' | 'cards';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarInitial: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  memberCount: number;
  members: TeamMember[];
  openPositions: number;
  department: string;
}

export interface BhTeamListProps extends EngineAwareProps {
  preset?: BhTeamListPreset;
  teams: TeamSummary[];
  onTeamClick?: (teamId: string) => void;
  selectedTeamId?: string | null;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_TEAM_LIST_DEFAULTS: Partial<BhTeamListProps> = {
  preset: 'table',
  loading: false,
};
