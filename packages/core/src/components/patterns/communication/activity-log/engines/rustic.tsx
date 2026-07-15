'use client';

/**
 * @fileoverview Rustic (Vanilla/CSS-variable) engine for the ActivityLog pattern.
 * Zero external UI library dependency -- renders a custom vertical timeline with
 * colored dots, connecting lines, action tags, avatar circles, and diff rendering,
 * through token-backed style objects referencing `--ds-*` CSS custom properties. Includes
 * native `<select>` filters for action type and user.
 *
 * @example
 * <RusticActivityLog
 *   activities={[
 *     { id: '1', action: 'deleted', user: { name: 'Ana' }, timestamp: new Date().toISOString() },
 *   ]}
 *   onActivityClick={(a) => openDetail(a.id)}
 * />
 */

import React, { type CSSProperties } from 'react';
import type { ActivityLogProps, Activity } from '../ActivityLog.types';

/**
 * Resolves a --ds-* color token from an action string via substring match.
 * Falls back to text-secondary for unrecognized action verbs.
 */
function getActionColor(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('created') || lower.includes('added')) return 'var(--ds-color-success)';
  if (lower.includes('updated') || lower.includes('edited')) return 'var(--ds-color-primary)';
  if (lower.includes('deleted') || lower.includes('removed')) return 'var(--ds-color-error)';
  if (lower.includes('viewed')) return 'var(--ds-color-secondary)';
  return 'var(--ds-color-text-secondary, var(--ds-color-text-muted))';
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

// --- Shared style constants ---
// Extracted as module-level objects to avoid re-creating on every render.

const containerStyle: CSSProperties = {
  padding: 16,
};

const selectStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
};

/**
 * Rustic engine activity log using token-backed style objects and CSS variables.
 * Renders a hand-crafted vertical timeline (dot + connecting line per entry)
 * with action tags, avatars, timestamps, and optional field-level diffs.
 *
 * @param props - {@link ActivityLogProps}
 * @returns A bordered container with optional filters and a custom timeline.
 */
export default function RusticActivityLog(props: ActivityLogProps) {
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

  if (loading) {
    return (
      <div data-part="root" className={`ds-pattern-activity-log ds-engine-rustic ${className ?? ''}`} style={{ ...containerStyle, textAlign: 'center', padding: 48, ...style }}>
        <span data-part="loading">Loading...</span>
      </div>
    );
  }

  // Timeline dot -- colored circle that visually represents the action type.
  // marginTop: 6 aligns the dot center with the first line of text.
  const dotStyle: CSSProperties = {
    width: 10,
    height: 10,
    flexShrink: 0,
    marginTop: 6,
  };

  // Vertical connecting line between timeline dots. marginLeft: 4 centers
  // the 2px line under the 10px dot.
  const lineStyle: CSSProperties = {
    width: 2,
    flexShrink: 0,
    alignSelf: 'stretch',
    marginLeft: 4,
  };

  const avatarStyle = (size: number): CSSProperties => ({
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.45,
    fontWeight: 600,
    overflow: 'hidden',
    flexShrink: 0,
  });

  // Inline action tag: filled background with on-primary text color.
  const tagStyle: CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 'var(--ds-font-size-xs, 12px)',
    fontWeight: 500,
  };

  return (
    <div data-part="root" className={`ds-pattern-activity-log ds-engine-rustic ${className ?? ''}`} style={{ ...containerStyle, ...style }}>
      {/* Filters */}
      {onFilterChange && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {actionTypes && actionTypes.length > 0 && (
            <select
              data-part="filter"
              style={selectStyle}
              value={filters?.type?.[0] || ''}
              onChange={(e) => {
                const val = e.target.value;
                onFilterChange({ ...filters, type: val ? [val] : [] });
              }}
            >
              <option value="">All actions</option>
              {actionTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          {users && users.length > 0 && (
            <select
              data-part="filter"
              style={selectStyle}
              value={filters?.user?.[0] || ''}
              onChange={(e) => {
                const val = e.target.value;
                onFilterChange({ ...filters, user: val ? [val] : [] });
              }}
            >
              <option value="">All users</option>
              {users.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
            </select>
          )}
        </div>
      )}

      {activities.length === 0 ? (
        <div data-part="empty" style={{ textAlign: 'center', padding: 48 }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activities.map((activity, index) => {
            const color = getActionColor(activity.action);
            return (
              <div key={activity.id} style={{ display: 'flex', gap: 12 }}>
                {/* Timeline line + dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 10 }}>
                  <div data-part="dot" data-action-category={color} style={dotStyle} />
                  {index < activities.length - 1 && <div data-part="line" style={{ ...lineStyle, flex: 1 }} />}
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    paddingBottom: index < activities.length - 1 ? 20 : 0,
                    cursor: onActivityClick ? 'pointer' : undefined,
                  }}
                  onClick={() => onActivityClick?.(activity)}
                >
                  {renderActivity ? renderActivity(activity) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div data-part="avatar" style={avatarStyle(24)}>
                          {activity.user.avatar ? (
                            <img src={activity.user.avatar} alt={activity.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            activity.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span data-part="user" style={{ fontWeight: 500, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
                          {activity.user.name}
                        </span>
                        <span data-part="badge" data-action-category={color} style={tagStyle}>{activity.action}</span>
                        {activity.entityType && (
                          <span data-part="entity" style={{ fontSize: 'var(--ds-font-size-xs, 12px)' }}>
                            on {activity.entityType}
                            {activity.entityId ? ` #${activity.entityId}` : ''}
                          </span>
                        )}
                      </div>
                      <div data-part="timestamp" style={{ fontSize: 'var(--ds-font-size-xs, 12px)', marginTop: 4, marginLeft: 32 }}>
                        {formatTimestamp(activity.timestamp)}
                      </div>
                      {activity.diff && (
                        <div data-part="diff" style={{ marginTop: 8, marginLeft: 32, fontSize: 'var(--ds-font-size-xs, 12px)' }}>
                          {Object.entries(activity.diff).map(([field, { from, to }]) => (
                            <div key={field}>
                              <strong>{field}:</strong>{' '}
                              <span style={{ textDecoration: 'line-through' }}>{String(from)}</span>{' -> '}
                              <span style={{ fontWeight: 500 }}>{String(to)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
