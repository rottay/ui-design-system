/**
 * PlRoleComparison - Core Interface
 * Compare two or more roles side-by-side to identify permission differences
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlRoleComparisonPreset = 'comparison' | 'diff';

export interface RoleComparisonItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlRoleComparisonProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlRoleComparisonPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: RoleComparisonItem[];
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

export const PL_ROLE_COMPARISON_DEFAULTS: Partial<PlRoleComparisonProps> = {
  preset: 'comparison',
};
