/**
 * PlMenuRoleAssignment - Core Interface
 * Assign menu visibility and access based on user roles in a matrix view
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlMenuRoleAssignmentPreset = 'matrix' | 'list';

export interface MenuRoleAssignmentItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlMenuRoleAssignmentProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlMenuRoleAssignmentPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: MenuRoleAssignmentItem[];
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

export const PL_MENU_ROLE_ASSIGNMENT_DEFAULTS: Partial<PlMenuRoleAssignmentProps> = {
  preset: 'matrix',
};
