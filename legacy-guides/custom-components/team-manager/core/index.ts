import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type TeamManagerPreset = 'table' | 'cards';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status?: 'active' | 'pending' | 'deactivated';
  joinedAt?: string;
}

export interface TeamRole {
  key: string;
  label: string;
  description?: string;
}

export interface TeamManagerProps extends EngineAwareProps {
  preset?: TeamManagerPreset;
  members: TeamMember[];
  roles: TeamRole[];
  currentUserId?: string;
  onInvite?: (email: string, role: string) => void;
  onRoleChange?: (memberId: string, role: string) => void;
  onRemove?: (memberId: string) => void;
  onResendInvite?: (memberId: string) => void;
  title?: string;
  maxMembers?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TEAM_MANAGER_DEFAULTS: Partial<TeamManagerProps> = {
  preset: 'table',
  title: 'Team Members',
};
