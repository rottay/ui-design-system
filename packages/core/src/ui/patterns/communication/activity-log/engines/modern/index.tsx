'use client';

/**
 * @fileoverview Modern engine for the ActivityLog pattern.
 *
 * Premium vertical timeline with:
 * - Color-coded dot indicators per action type (create/update/delete/system)
 * - Connecting vertical lines between timeline entries
 * - Relative timestamps ("2h ago") with title tooltip for absolute date
 * - Actor avatar + name display
 * - Field-level diff rendering with before/after visualization
 * - Clean empty state with muted message
 * - Filter controls using native selects styled with DS tokens
 * - All styling via DS tokens -- zero DaisyUI classes or hardcoded colors
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
import type { ActivityLogProps, Activity } from '../../contracts';
import { Select } from '../../../../../primitives/inputs/Select';
import type { SelectOption as SelectOptionDef } from '../../../../../primitives/inputs/Select/contracts';

/* ---------------------------------------------------------------------------
 * Action type color mapping
 * --------------------------------------------------------------------------- */

type ActionCategory = 'create' | 'update' | 'delete' | 'view' | 'system';

/** Classifies an action string into a semantic category. */
function classifyAction(action: string): ActionCategory {
  const lower = action.toLowerCase();
  if (lower.includes('created') || lower.includes('added')) return 'create';
  if (lower.includes('updated') || lower.includes('edited') || lower.includes('changed')) return 'update';
  if (lower.includes('deleted') || lower.includes('removed') || lower.includes('archived')) return 'delete';
  if (lower.includes('viewed') || lower.includes('read') || lower.includes('accessed')) return 'view';
  return 'system';
}

/** Returns DS token color for the dot indicator based on action category. */
function getDotColor(category: ActionCategory): string {
  switch (category) {
    case 'create': return 'var(--ds-color-success)';
    case 'update': return 'var(--ds-color-info)';
    case 'delete': return 'var(--ds-color-error)';
    case 'view': return 'var(--ds-color-text-muted)';
    case 'system': return 'var(--ds-color-warning)';
  }
}

/** Returns the glyph for the dot indicator. */
function getDotGlyph(category: ActionCategory): string {
  switch (category) {
    case 'create': return '+';
    case 'update': return '\u270E';
    case 'delete': return '\u2715';
    case 'view': return '\u25CF';
    case 'system': return '\u2699';
  }
}

/** Returns badge style for the action label. */
function getActionBadgeStyle(): React.CSSProperties {
  return {
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    textTransform: 'capitalize' as const,
    whiteSpace: 'nowrap' as const,
  };
}

/* ---------------------------------------------------------------------------
 * Timestamp formatting
 * --------------------------------------------------------------------------- */

/**
 * Converts an ISO timestamp to a human-friendly relative string.
 * Uses minute/hour/day thresholds, falling back to locale date for 7+ days.
 */
function formatRelativeTime(ts: string): string {
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

/** Returns a full absolute timestamp string for title/tooltip. */
function formatAbsoluteTime(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ---------------------------------------------------------------------------
 * Diff renderer
 * --------------------------------------------------------------------------- */

/** Renders a field-level diff showing old values with strikethrough and new values emphasized. */
function DiffView({ diff }: { diff: Record<string, { from: unknown; to: unknown }> }) {
  return (
    <div
      data-part="diff"
      style={{
        marginTop: 8,
        padding: '8px 12px',
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      {Object.entries(diff).map(([field, { from, to }]) => (
        <div
          key={field}
          data-part="diff-row"
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
          }}
        >
          <span data-part="diff-cell" data-diff-role="label" style={{ fontWeight: 600, minWidth: 60 }}>
            {field}:
          </span>
          <span data-part="diff-cell" data-diff-role="from" style={{ textDecoration: 'line-through' }}>
            {String(from)}
          </span>
          <span data-part="diff-cell" data-diff-role="arrow">{'\u2192'}</span>
          <span data-part="diff-cell" data-diff-role="to" style={{ fontWeight: 500 }}>
            {String(to)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Avatar
 * --------------------------------------------------------------------------- */

/** Renders a small circular avatar with image or initial fallback. */
function Avatar({ name, src, size = 28 }: { name: string; src?: string; size?: number }) {
  if (src) {
    return (
      <img
        data-part="avatar"
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      data-part="avatar"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize: size * 0.42,
        fontWeight: 600,
        flexShrink: 0,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * Loading skeleton
 * --------------------------------------------------------------------------- */

function LoadingSkeleton() {
  const shimmerAnimation: React.CSSProperties = {
    animation: 'ds-activity-shimmer 1.5s ease-in-out infinite',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 0' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16 }}>
          {/* Dot skeleton */}
          <div
            data-part="skeleton"
            style={{
              ...shimmerAnimation,
              width: 10,
              height: 10,
              borderRadius: '50%',
              flexShrink: 0,
              marginTop: 4,
            }}
          />
          {/* Content skeleton */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div data-part="skeleton" style={{ ...shimmerAnimation, width: '60%', height: 14 }} />
            <div data-part="skeleton" style={{ ...shimmerAnimation, width: '40%', height: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Empty state
 * --------------------------------------------------------------------------- */

function EmptyState({ message }: { message: string }) {
  return (
    <div
      data-part="empty"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: 32,
          lineHeight: 1,
          marginBottom: 12,
          opacity: 0.4,
        }}
        aria-hidden="true"
      >
        {'\u25CB'}
      </span>
      <span style={{ fontSize: 14 }}>{message}</span>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Filter bar
 * --------------------------------------------------------------------------- */

/* selectStyle removed -- filter bar now uses the DS Select primitive. */

/* ---------------------------------------------------------------------------
 * Timeline item
 * --------------------------------------------------------------------------- */

function TimelineItem({
  activity,
  isLast,
  onClick,
  renderActivity,
}: {
  activity: Activity;
  isLast: boolean;
  onClick?: (activity: Activity) => void;
  renderActivity?: (activity: Activity) => React.ReactNode;
}) {
  const category = classifyAction(activity.action);

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        position: 'relative',
        paddingBottom: isLast ? 0 : 24,
      }}
    >
      {/* Timeline column: dot + connecting line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 24,
          flexShrink: 0,
        }}
      >
        {/* Dot indicator */}
        <div
          data-part="dot"
          data-action-category={category}
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
            zIndex: 1,
          }}
          aria-hidden="true"
        >
          {getDotGlyph(category)}
        </div>

        {/* Connecting line */}
        {!isLast && (
          <div
            data-part="line"
            style={{
              width: 2,
              flex: 1,
              marginTop: 4,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content column */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          cursor: onClick ? 'pointer' : undefined,
          paddingTop: 1,
        }}
        onClick={onClick ? () => onClick(activity) : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(activity) : undefined}
      >
        {renderActivity ? (
          renderActivity(activity)
        ) : (
          <>
            {/* Header: avatar + name + action badge + entity */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <Avatar name={activity.user.name} src={activity.user.avatar} size={24} />
              <span
                data-part="user"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {activity.user.name}
              </span>
              <span data-part="badge" data-action-category={category} style={getActionBadgeStyle()}>
                {activity.action}
              </span>
              {activity.entityType && (
                <span
                  data-part="entity"
                  style={{
                    fontSize: 12,
                  }}
                >
                  on {activity.entityType}
                  {activity.entityId ? ` #${activity.entityId}` : ''}
                </span>
              )}
            </div>

            {/* Timestamp: relative with absolute tooltip */}
            <div
              data-part="timestamp"
              title={formatAbsoluteTime(activity.timestamp)}
              style={{
                fontSize: 12,
                marginTop: 4,
                cursor: 'default',
              }}
            >
              {formatRelativeTime(activity.timestamp)}
            </div>

            {/* Diff view */}
            {activity.diff && <DiffView diff={activity.diff} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ModernActivityLog (main export)
 * --------------------------------------------------------------------------- */

/**
 * Modern engine for the ActivityLog pattern component.
 *
 * Renders a premium vertical timeline with color-coded dot indicators,
 * connecting lines, relative timestamps, actor avatars, and field-level
 * diffs. All styling uses DS tokens with zero DaisyUI or hardcoded values.
 *
 * @param props - {@link ActivityLogProps}
 * @returns A filterable vertical activity timeline.
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

  /* Loading state */
  if (loading) {
    return (
      <div
        data-part="root"
        className={`ds-pattern-activity-log ds-engine-modern ${className ?? ''}`}
        style={{
          ...style,
          padding: '16px 24px',
        }}
      >
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div
      data-part="root"
      className={`ds-pattern-activity-log ds-engine-modern ${className ?? ''}`}
      style={{
        ...style,
        padding: '20px 24px',
      }}
    >
      {/* Filter bar */}
      {onFilterChange && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Action type filter */}
          {actionTypes && actionTypes.length > 0 && (
            <Select
              size="sm"
              placeholder="All actions"
              value={filters?.type?.[0] || ''}
              options={[
                { value: '', label: 'All actions' } as SelectOptionDef,
                ...actionTypes.map((t) => ({ value: t, label: t } as SelectOptionDef)),
              ]}
              onChange={(val) => {
                const v = val as string;
                onFilterChange({ ...filters, type: v ? [v] : [] });
              }}
            />
          )}
          {/* User filter */}
          {users && users.length > 0 && (
            <Select
              size="sm"
              placeholder="All users"
              value={filters?.user?.[0] || ''}
              options={[
                { value: '', label: 'All users' } as SelectOptionDef,
                ...users.map((u) => ({ value: u.name, label: u.name } as SelectOptionDef)),
              ]}
              onChange={(val) => {
                const v = val as string;
                onFilterChange({ ...filters, user: v ? [v] : [] });
              }}
            />
          )}
        </div>
      )}

      {/* Timeline or empty state */}
      {activities.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activities.map((activity, index) => (
            <TimelineItem
              key={activity.id}
              activity={activity}
              isLast={index === activities.length - 1}
              onClick={onActivityClick}
              renderActivity={renderActivity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
