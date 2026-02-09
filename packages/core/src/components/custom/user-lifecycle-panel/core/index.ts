import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type UserLifecyclePanelPreset = 'flow' | 'actions' | 'history';

export type UserLifecycleState =
  | 'invited'
  | 'pending-verification'
  | 'active'
  | 'suspended'
  | 'deactivated'
  | 'locked'
  | 'archived'
  | 'deleted';

export interface LifecycleTransition {
  id: string;
  from: UserLifecycleState;
  to: UserLifecycleState;
  performedBy: string;
  performedAt: Date;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface UserLifecycleData {
  userId: string;
  displayName: string;
  email: string;
  currentState: UserLifecycleState;
  stateChangedAt: Date;
  transitions: LifecycleTransition[];
  availableActions: UserLifecycleState[];
}

export interface UserLifecyclePanelProps extends EngineAwareProps {
  preset?: UserLifecyclePanelPreset;
  user: UserLifecycleData;
  onTransition?: (userId: string, toState: UserLifecycleState, reason?: string) => void;
  onResendInvite?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const USER_LIFECYCLE_PANEL_DEFAULTS: Partial<UserLifecyclePanelProps> = {
  preset: 'flow',
  title: 'User Lifecycle',
};

export function getStateColors(tokens: DesignTokens) {
  return {
    invited: { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] },
    'pending-verification': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    active: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
    suspended: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    deactivated: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] },
    locked: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] },
    archived: { bg: tokens.colors.neutral[50], color: tokens.colors.neutral[500], border: tokens.colors.neutral[200] },
    deleted: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] },
  };
}

export function getStateIcon(state: UserLifecycleState): string {
  return {
    invited: '📨',
    'pending-verification': '⏳',
    active: '✅',
    suspended: '⏸',
    deactivated: '🚫',
    locked: '🔒',
    archived: '📦',
    deleted: '🗑',
  }[state];
}

export function getActionLabel(state: UserLifecycleState): string {
  return {
    invited: 'Invite',
    'pending-verification': 'Request Verification',
    active: 'Activate',
    suspended: 'Suspend',
    deactivated: 'Deactivate',
    locked: 'Lock',
    archived: 'Archive',
    deleted: 'Delete',
  }[state];
}
