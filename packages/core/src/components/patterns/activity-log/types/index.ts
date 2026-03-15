/**
 * ActivityLog - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface ActivityFilter {
  type?: string[];
  user?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface ActivityLogProps extends PatternBaseProps {
  /** List of activities to display */
  activities: Activity[];
  /** Active filter configuration */
  filters?: ActivityFilter;
  /** Called when filters change */
  onFilterChange?: (filters: ActivityFilter) => void;
  /** Message displayed when no activities */
  emptyMessage?: string;
  /** Available action types for filter dropdown */
  actionTypes?: string[];
  /** Available users for filter dropdown */
  users?: { name: string; avatar?: string }[];
  /** Custom activity renderer */
  renderActivity?: (activity: Activity) => ReactNode;
  /** Callback when an activity is clicked */
  onActivityClick?: (activity: Activity) => void;
}
