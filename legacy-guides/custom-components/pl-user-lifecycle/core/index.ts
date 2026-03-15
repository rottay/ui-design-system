/**
 * PlUserLifecycle - Core Types & Defaults
 * User lifecycle management with stage transitions, history, and progress tracking
 */

import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset Type ──────────────────────────────────────────────────────────────

export type PlUserLifecyclePreset = 'timeline' | 'actions';

// ─── Lifecycle Stages ─────────────────────────────────────────────────────────

export type LifecycleStage =
  | 'invited'
  | 'onboarding'
  | 'active'
  | 'suspended'
  | 'offboarding'
  | 'deactivated'
  | 'deleted';

// ─── Lifecycle Actions ────────────────────────────────────────────────────────

export type LifecycleAction =
  | 'invite'
  | 'resend_invite'
  | 'revoke_invite'
  | 'activate'
  | 'complete_onboarding'
  | 'extend_onboarding'
  | 'suspend'
  | 'start_offboarding'
  | 'reactivate'
  | 'deactivate'
  | 'complete_offboarding'
  | 'cancel_offboarding'
  | 'delete';

// ─── Core Types ───────────────────────────────────────────────────────────────

export interface TriggeredBy {
  id: string;
  name: string;
}

export interface LifecycleEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  fromStage: LifecycleStage | null;
  toStage: LifecycleStage;
  triggeredBy: TriggeredBy;
  reason?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  isAutomated: boolean;
}

export interface OffboardingChecklistItem {
  item: string;
  completed: boolean;
}

export interface LifecycleUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currentStage: LifecycleStage;
  stageHistory: LifecycleEvent[];
  daysSinceLastTransition: number;
  onboardingProgress?: number; // 0-100
  offboardingChecklist?: OffboardingChecklistItem[];
  invitedAt?: Date;
  activatedAt?: Date;
  lastActive?: Date;
}

export interface LifecycleStats {
  byStage: Record<LifecycleStage, number>;
  avgOnboardingDays: number;
  avgTimeToActive: number;
  churnRate30d: number;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PlUserLifecycleProps extends EngineAwareProps {
  /** Which preset to render */
  preset?: PlUserLifecyclePreset;

  /** List of users with lifecycle data */
  users: LifecycleUser[];

  /** Overall lifecycle statistics */
  stats?: LifecycleStats;

  /** Currently selected user ID for timeline view */
  selectedUserId?: string;

  /** Callback when a user is selected */
  onUserSelect?: (userId: string) => void;

  /** Callback when a user is transitioned to a new stage */
  onTransitionUser?: (userId: string, toStage: LifecycleStage, reason?: string) => void;

  /** Callback for lifecycle actions on a user */
  onAction?: (userId: string, action: LifecycleAction) => void;

  /** Callback for bulk actions on stage */
  onBulkAction?: (stage: LifecycleStage, action: string, userIds: string[]) => void;

  /** Filter by stage */
  stageFilter?: LifecycleStage | null;

  /** Callback when stage filter changes */
  onStageFilterChange?: (stage: LifecycleStage | null) => void;

  /** Search query for filtering users */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state text */
  emptyText?: string;

  /** Custom class name */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const PL_USER_LIFECYCLE_DEFAULTS = {
  emptyText: 'No users found',
  users: [],
  preset: 'timeline' as PlUserLifecyclePreset,
} as const;
