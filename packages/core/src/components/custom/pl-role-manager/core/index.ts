/**
 * PlRoleManager - Core Interface
 * Hierarchical role management with inheritance, permissions, and user assignment
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Enums & Literal Types ────────────────────────────────────────────────

export type PlRoleManagerPreset = 'tree' | 'table';

export type RoleType = 'system' | 'custom' | 'inherited';

export type RoleStatus = 'active' | 'inactive' | 'deprecated';

// ─── Role Model ───────────────────────────────────────────────────────────

export interface Role {
  /** Unique identifier */
  id: string;
  /** Machine-readable name */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Optional description of the role */
  description?: string;
  /** Role classification */
  type: RoleType;
  /** Current status */
  status: RoleStatus;
  /** Parent role ID for inheritance */
  parentId?: string;
  /** Child roles for tree hierarchy */
  children?: Role[];
  /** Number of permissions assigned */
  permissionCount: number;
  /** Number of users assigned to this role */
  userCount: number;
  /** Whether this is a system-managed role (locked) */
  isSystem: boolean;
  /** When the role was created */
  createdAt: Date;
  /** When the role was last updated */
  updatedAt?: Date;
  /** Who created the role */
  createdBy?: string;
  /** Optional color for the role icon */
  color?: string;
  /** Optional icon identifier */
  icon?: string;
  /** Depth level in the hierarchy (0 = root) */
  level: number;
}

// ─── Props ────────────────────────────────────────────────────────────────

export interface PlRoleManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlRoleManagerPreset;

  /** Roles to display */
  roles: Role[];

  /** Callback when a role is clicked */
  onRoleClick?: (roleId: string) => void;

  /** Callback to create a new role, optionally under a parent */
  onCreate?: (parentId?: string) => void;

  /** Callback when a role is deleted */
  onDelete?: (roleId: string) => void;

  /** Callback when a role is duplicated */
  onDuplicate?: (roleId: string) => void;

  /** Search query for filtering roles */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Set of expanded role IDs in the tree */
  expandedIds?: Set<string>;

  /** Callback to toggle a role's expand/collapse state */
  onToggleExpand?: (roleId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state text */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_ROLE_MANAGER_DEFAULTS: Partial<PlRoleManagerProps> = {
  preset: 'tree',
  emptyText: 'No roles found',
};
