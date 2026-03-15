/**
 * PlUserDirectory - Core Interface
 * Browse and manage organizational user directory with role-based badges,
 * MFA indicators, department grouping, and bulk administrative actions
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset ──────────────────────────────────────────────────────────────────

export type PlUserDirectoryPreset = 'table' | 'grid';
export type UserDirectoryPreset = PlUserDirectoryPreset; // Alias for backwards compat

// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'invited';

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer' | 'guest';

// ─── Data Models ─────────────────────────────────────────────────────────────

export interface UserDirectoryItem {
  /** Unique identifier */
  id: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Email address */
  email: string;
  /** Avatar URL (optional - initials fallback when missing) */
  avatar?: string;
  /** Current account status */
  status: UserStatus;
  /** Assigned role */
  role: UserRole;
  /** Department name (optional) */
  department?: string;
  /** Job title (optional) */
  title?: string;
  /** Phone number (optional) */
  phone?: string;
  /** Last login timestamp (optional) */
  lastLogin?: Date;
  /** Account creation date */
  createdAt: Date;
  /** Whether multi-factor auth is enabled */
  mfaEnabled: boolean;
  /** Total number of logins */
  loginCount: number;
  /** Group memberships (optional) */
  groups?: string[];
}

// ─── Sort ────────────────────────────────────────────────────────────────────

export type SortField = 'name' | 'email' | 'role' | 'department' | 'status' | 'lastLogin' | 'createdAt' | 'loginCount';
export type SortDirection = 'asc' | 'desc';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface PlUserDirectoryProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlUserDirectoryPreset;

  /** User listings to display */
  users: UserDirectoryItem[];

  /** Callback when a user row/card is clicked */
  onUserClick?: (userId: string) => void;

  /** Callback when invite user button is clicked */
  onInvite?: () => void;

  /** Callback to suspend a user */
  onSuspend?: (userId: string) => void;

  /** Callback to activate a user */
  onActivate?: (userId: string) => void;

  /** Callback to change a user's role */
  onRoleChange?: (userId: string, newRole: UserRole) => void;

  /** Callback to delete a user */
  onDelete?: (userId: string) => void;

  /** Search query (controlled) */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Filter by role (controlled) */
  filterRole?: UserRole | null;

  /** Callback when role filter changes */
  onFilterRole?: (role: UserRole | null) => void;

  /** Filter by status (controlled) */
  filterStatus?: UserStatus | null;

  /** Callback when status filter changes */
  onFilterStatus?: (status: UserStatus | null) => void;

  /** Whether data is loading */
  loading?: boolean;

  /** Sort field (controlled) */
  sortBy?: SortField;

  /** Sort direction (controlled) */
  sortDirection?: SortDirection;

  /** Callback when sort changes */
  onSortChange?: (field: SortField, direction: SortDirection) => void;

  /** Text shown when no users match filters */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const PL_USER_DIRECTORY_DEFAULTS: Partial<PlUserDirectoryProps> = {
  preset: 'table',
  emptyText: 'No users found',
  sortBy: 'name',
  sortDirection: 'asc',
};
