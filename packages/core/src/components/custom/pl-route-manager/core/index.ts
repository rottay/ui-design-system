/**
 * PlRouteManager - Core Interface
 * Define and manage application routes with URL patterns and middleware
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlRouteManagerPreset = 'table' | 'tree';

export interface RouteManagerItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlRouteManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlRouteManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: RouteManagerItem[];
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

export const PL_ROUTE_MANAGER_DEFAULTS: Partial<PlRouteManagerProps> = {
  preset: 'table',
};
