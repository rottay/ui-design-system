/**
 * BhTeamDetail - Core Interface
 * Team detail with member list, positions, performance for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhTeamDetailPreset = 'full' | 'compact';

export interface TeamPosition {
  id: string;
  title: string;
  status: 'open' | 'filled' | 'closed';
  assignee?: string;
}

export interface BhTeamDetailProps extends EngineAwareProps {
  preset?: BhTeamDetailPreset;
  teamName: string;
  department: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    avatarInitial: string;
    hireDate: string;
  }>;
  positions: TeamPosition[];
  metrics?: Array<{ label: string; value: number; target: number }>;
  onMemberClick?: (memberId: string) => void;
  onPositionClick?: (positionId: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_TEAM_DETAIL_DEFAULTS: Partial<BhTeamDetailProps> = {
  preset: 'full',
  loading: false,
};
