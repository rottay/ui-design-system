/**
 * PlUserAssignment - Core Interface
 * Manage user-to-tenant/company assignments with roles, statuses, and expiration tracking
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset Type ─────────────────────────────────────────────────────────────

export type PlUserAssignmentPreset = 'table' | 'matrix';

// ─── Enums & Unions ──────────────────────────────────────────────────────────

export type AssignmentStatus = 'active' | 'pending' | 'expired' | 'revoked';

export type AssignmentRole =
  | 'owner'
  | 'admin'
  | 'editor'
  | 'viewer'
  | 'billing'
  | 'support'
  | 'developer'
  | 'analyst';

// ─── Data Types ──────────────────────────────────────────────────────────────

export interface UserAssignment {
  /** Unique assignment identifier */
  id: string;
  /** User identifier */
  userId: string;
  /** Display name of the user */
  userName: string;
  /** Email address of the user */
  userEmail: string;
  /** Avatar URL for the user (optional) */
  userAvatar?: string;
  /** Tenant the user is assigned to */
  tenantId: string;
  /** Display name of the tenant */
  tenantName: string;
  /** Company identifier (optional, for multi-company tenants) */
  companyId?: string;
  /** Display name of the company (optional) */
  companyName?: string;
  /** Role assigned to the user */
  role: AssignmentRole;
  /** Current status of the assignment */
  status: AssignmentStatus;
  /** When the assignment was created */
  assignedAt: Date;
  /** Who created the assignment (optional) */
  assignedBy?: string;
  /** When the assignment expires (optional) */
  expiresAt?: Date;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface PlUserAssignmentProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlUserAssignmentPreset;

  /** List of user assignments to display */
  assignments: UserAssignment[];

  /** Callback when an assignment row is clicked */
  onAssignmentClick?: (assignmentId: string) => void;

  /** Callback to create a new assignment */
  onAssign?: () => void;

  /** Callback to revoke an assignment */
  onRevoke?: (assignmentId: string) => void;

  /** Callback to extend an assignment expiration */
  onExtend?: (assignmentId: string) => void;

  /** Controlled search query */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Filter by role */
  filterRole?: AssignmentRole | null;

  /** Callback when role filter changes */
  onFilterRole?: (role: AssignmentRole | null) => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state text */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const PL_USER_ASSIGNMENT_DEFAULTS: Partial<PlUserAssignmentProps> = {
  preset: 'table',
  emptyText: 'No assignments found',
};
