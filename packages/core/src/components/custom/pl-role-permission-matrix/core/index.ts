/**
 * PlRolePermissionMatrix - Core Interface
 * View and edit role-permission assignments in an interactive matrix grid
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlRolePermissionMatrixPreset = 'matrix' | 'list';

export interface RolePermissionMatrixItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlRolePermissionMatrixProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlRolePermissionMatrixPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: RolePermissionMatrixItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback when an item is created */
  onCreate?: () => void;
  /** Search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_ROLE_PERMISSION_MATRIX_DEFAULTS: Partial<PlRolePermissionMatrixProps> = {
  preset: 'matrix',
};
