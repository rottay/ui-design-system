/**
 * PlUserRoleAssignment - Core Interface
 * Assign roles to users with effective permission preview and conflict detection
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlUserRoleAssignmentPreset = 'table' | 'panel';

export interface UserRoleAssignmentItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlUserRoleAssignmentProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlUserRoleAssignmentPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: UserRoleAssignmentItem[];
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

export const PL_USER_ROLE_ASSIGNMENT_DEFAULTS: Partial<PlUserRoleAssignmentProps> = {
  preset: 'table',
};
