/**
 * PlPermissionManager - Core Interface
 * Define and categorize permissions with module-level grouping, risk assessment, and RBAC integration
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlPermissionManagerPreset = 'table' | 'grid';

export type PermissionCategory = 'users' | 'content' | 'billing' | 'settings' | 'api' | 'system';
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'manage';
export type PermissionScope = 'global' | 'tenant' | 'company' | 'own';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Permission {
  /** Unique identifier */
  id: string;
  /** Internal permission name (e.g. 'users.create') */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Optional description of the permission's purpose */
  description?: string;
  /** Functional category */
  category: PermissionCategory;
  /** Action type */
  action: PermissionAction;
  /** Target resource (e.g. 'users', 'invoices', 'api-keys') */
  resource: string;
  /** Scope of applicability */
  scope: PermissionScope;
  /** Whether this is a built-in system permission */
  isSystem: boolean;
  /** Number of roles that include this permission */
  rolesCount: number;
  /** When the permission was created */
  createdAt: Date;
  /** Security risk assessment */
  riskLevel: RiskLevel;
}

export interface PlPermissionManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlPermissionManagerPreset;

  /** Permissions to display */
  permissions: Permission[];

  /** Callback when a permission is clicked */
  onPermissionClick?: (permissionId: string) => void;

  /** Callback to create a new permission */
  onCreate?: () => void;

  /** Callback to delete a permission */
  onDelete?: (permissionId: string) => void;

  /** Controlled search query */
  searchQuery?: string;

  /** Callback when search changes */
  onSearchChange?: (query: string) => void;

  /** Controlled category filter */
  filterCategory?: PermissionCategory | null;

  /** Callback when category filter changes */
  onFilterCategory?: (category: PermissionCategory | null) => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state text */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_PERMISSION_MANAGER_DEFAULTS: Partial<PlPermissionManagerProps> = {
  preset: 'table',
  emptyText: 'No permissions found',
};
