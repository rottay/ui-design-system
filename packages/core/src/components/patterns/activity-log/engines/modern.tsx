'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the ActivityLog pattern.
 * Renders activity entries using DaisyUI's `timeline` component with badge-styled
 * action labels, avatar placeholders, and relative timestamps. Uses native HTML
 * `<select>` elements for filtering (single-select per category) instead of Ant
 * Design's multi-select, matching DaisyUI's form control aesthetic.
 *
 * @example
 * <ModernActivityLog
 *   activities={[
 *     { id: '1', action: 'updated', user: { name: 'Ana' }, timestamp: new Date().toISOString() },
 *   ]}
 *   actionTypes={['created', 'updated']}
 *   onFilterChange={(f) => setFilters(f)}
 * />
 */

import React from 'react';
import type { ActivityLogProps, Activity } from '../ActivityLog.types';

/**
 * Resolves a DaisyUI badge color class from an action string via substring match.
 * Returns ghost badge for unrecognized actions.
 */
function getActionBadgeClass(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('created') || lower.includes('added')) return 'badge-success';
  if (lower.includes('updated') || lower.includes('edited')) return 'badge-info';
  if (lower.includes('deleted') || lower.includes('removed')) return 'badge-error';
  if (lower.includes('viewed')) return 'badge-secondary';
  return 'badge-ghost';
}

/** Returns a single-character glyph representing the action, used in the timeline dot. */
function getActionIcon(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('created') || lower.includes('added')) return '+';
  if (lower.includes('deleted') || lower.includes('removed')) return 'x';
  if (lower.includes('viewed')) return '\u25CF';
  return '\u270E';
}

/**
 * Converts an ISO timestamp to a human-friendly relative string.
 * Uses minute/hour/day thresholds, falling back to locale date for 7+ days.
 */
function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Renders a field-level diff showing old values with strikethrough and new values in bold. */
function renderDiff(diff: Record<string, { from: unknown; to: unknown }>): React.ReactNode {
  return (
    <div className="mt-2 text-xs opacity-60 space-y-1">
      {Object.entries(diff).map(([field, { from, to }]) => (
        <div key={field}>
          <span className="font-medium">{field}:</span>{' '}
          <span className="line-through">{String(from)}</span>{' -> '}
          <span className="font-medium">{String(to)}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Modern engine activity log built on DaisyUI's timeline component.
 * Activities are rendered as timeline entries with badge-styled action labels,
 * avatar placeholders, and collapsible diff views. Filters use native select
 * elements (single-select) styled with DaisyUI form classes.
 *
 * @param props - {@link ActivityLogProps}
 * @returns A DaisyUI card containing a filterable vertical timeline.
 */
export default function ModernActivityLog(props: ActivityLogProps) {
  const {
    activities,
    filters,
    onFilterChange,
    emptyMessage = 'No activity recorded',
    actionTypes,
    users,
    renderActivity,
    onActivityClick,
    loading,
    className,
    style,
  } = props;

  /* Show a centered spinner while data is being fetched */
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-sm ds-pattern-activity-log ds-engine-modern ${className ?? ''}`} style={style}>
      <div className="card-body p-4">
        {/* Filters -- native selects (single-select) styled with DaisyUI form classes.
            Uses single-select instead of multi-select to match DaisyUI's form aesthetic.
            Filter state is lifted to the parent via onFilterChange callback. */}
        {onFilterChange && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {/* Action type filter -- empty string resets to "all" */}
            {actionTypes && actionTypes.length > 0 && (
              <select
                className="select select-bordered select-sm"
                value={filters?.type?.[0] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onFilterChange({ ...filters, type: val ? [val] : [] });
                }}
              >
                <option value="">All actions</option>
                {actionTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
            {/* User filter -- filters by user name; wraps single value in array for consistent API */}
            {users && users.length > 0 && (
              <select
                className="select select-bordered select-sm"
                value={filters?.user?.[0] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onFilterChange({ ...filters, user: val ? [val] : [] });
                }}
              >
                <option value="">All users</option>
                {users.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {activities.length === 0 ? (
          <div className="flex justify-center items-center py-12 opacity-50">
            {emptyMessage}
          </div>
        ) : (
          /* DaisyUI timeline-compact removes horizontal padding for a denser layout */
          <ul className="timeline timeline-vertical timeline-compact">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                {/* DaisyUI timeline requires <hr> between items for the connecting line */}
                {index > 0 && <hr />}
                {/* Timestamp positioned to the left of the timeline dot */}
                <div className="timeline-start text-xs opacity-50">
                  {formatTimestamp(activity.timestamp)}
                </div>
                {/* Timeline dot with action glyph */}
                <div className="timeline-middle">
                  <div className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold">
                    {getActionIcon(activity.action)}
                  </div>
                </div>
                {/* Activity content box -- clickable if onActivityClick is provided */}
                <div
                  className={`timeline-end timeline-box ${onActivityClick ? 'cursor-pointer hover:bg-base-200' : ''}`}
                  onClick={() => onActivityClick?.(activity)}
                >
                  {/* Allow consumer to fully override rendering via renderActivity prop */}
                  {renderActivity ? renderActivity(activity) : (
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Avatar -- shows image if available, otherwise first-initial placeholder */}
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-6 h-6">
                            {activity.user.avatar ? (
                              <img src={activity.user.avatar} alt={activity.user.name} />
                            ) : (
                              <span className="text-xs">{activity.user.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-sm">{activity.user.name}</span>
                        {/* Color-coded badge derived from action keyword matching */}
                        <span className={`badge badge-sm ${getActionBadgeClass(activity.action)}`}>
                          {activity.action}
                        </span>
                        {activity.entityType && (
                          <span className="text-xs opacity-50">
                            on {activity.entityType}
                            {activity.entityId ? ` #${activity.entityId}` : ''}
                          </span>
                        )}
                      </div>
                      {/* Field-level diff only shown when change details are available */}
                      {activity.diff && renderDiff(activity.diff)}
                    </div>
                  )}
                </div>
                {index < activities.length - 1 && <hr />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
