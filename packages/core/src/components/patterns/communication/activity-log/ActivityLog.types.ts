/**
 * @fileoverview Type definitions for the ActivityLog pattern component.
 * Defines the {@link Activity} record shape (user, action, timestamp,
 * entity reference, and optional diff/metadata), the {@link ActivityFilter}
 * configuration, and {@link ActivityLogProps} controlling rendering,
 * filtering, and interaction callbacks.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Represents a single activity record in the log.
 *
 * Each activity captures who performed an action, what was changed, when
 * it happened, and optionally which entity was affected. The `diff` field
 * stores before/after values for auditable field-level changes.
 */
export interface Activity {
  /** Unique identifier for this activity entry. */
  id: string;

  /** The user who performed the action. */
  user: {
    /** Display name of the user. */
    name: string;
    /** URL to the user's avatar image. */
    avatar?: string;
  };

  /**
   * Human-readable description of the action performed
   * (e.g., "updated", "created", "deleted", "commented").
   */
  action: string;

  /** ISO 8601 timestamp of when the action occurred. */
  timestamp: string;

  /**
   * Type of the entity this action was performed on
   * (e.g., "user", "order", "document"). Used for filtering.
   */
  entityType?: string;

  /** Unique identifier of the affected entity. */
  entityId?: string;

  /**
   * Field-level change diff. Each key is a field name and the value
   * contains the previous (`from`) and new (`to`) values, enabling
   * side-by-side change visualization.
   */
  diff?: Record<string, { from: unknown; to: unknown }>;

  /** Arbitrary additional metadata associated with this activity. */
  metadata?: Record<string, unknown>;
}

/**
 * Filter configuration for narrowing the displayed activities.
 *
 * All fields are optional -- omitted fields are treated as "no filter"
 * for that dimension.
 */
export interface ActivityFilter {
  /** Filter by action/entity types (e.g., `['created', 'updated']`). */
  type?: string[];

  /** Filter by user names or IDs. */
  user?: string[];

  /** Include only activities on or after this ISO 8601 date. */
  dateFrom?: string;

  /** Include only activities on or before this ISO 8601 date. */
  dateTo?: string;
}

/**
 * Props for the ActivityLog pattern component.
 *
 * Renders a chronological list of user activities with built-in filter
 * controls for action type, user, and date range. Supports custom
 * activity renderers and click handlers.
 *
 * @example
 * ```tsx
 * <ActivityLog
 *   activities={activities}
 *   filters={{ type: ['updated'], dateFrom: '2026-03-01' }}
 *   onFilterChange={(filters) => setFilters(filters)}
 *   actionTypes={['created', 'updated', 'deleted', 'commented']}
 *   users={[{ name: 'Jane Smith' }, { name: 'Bob Johnson' }]}
 *   renderActivity={(activity) => <CustomActivityCard activity={activity} />}
 *   onActivityClick={(activity) => openDetail(activity.entityId)}
 *   emptyMessage="No activity found for the selected filters."
 * />
 * ```
 */
export interface ActivityLogProps extends PatternBaseProps {
  /** List of activity records to display. */
  activities: Activity[];

  /** Currently active filter configuration. */
  filters?: ActivityFilter;

  /** Callback fired when the user changes any filter. */
  onFilterChange?: (filters: ActivityFilter) => void;

  /** Message displayed when no activities match the current filters. */
  emptyMessage?: string;

  /**
   * Available action types for the filter dropdown.
   * These populate the "type" filter options.
   */
  actionTypes?: string[];

  /**
   * Available users for the filter dropdown.
   * Each entry provides a name and optional avatar for display.
   */
  users?: { name: string; avatar?: string }[];

  /**
   * Custom renderer for individual activity entries.
   * When provided, replaces the default activity card layout.
   */
  renderActivity?: (activity: Activity) => ReactNode;

  /** Callback fired when an activity entry is clicked. */
  onActivityClick?: (activity: Activity) => void;
}
