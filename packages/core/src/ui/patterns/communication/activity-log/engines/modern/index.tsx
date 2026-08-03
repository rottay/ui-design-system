'use client';

/**
 * @fileoverview Modern engine for the ActivityLog pattern.
 *
 * Premium vertical activity feed that COMPOSES certified DS primitives and
 * never recreates them:
 * - Timeline (P18) owns the temporal axis: ordered list, per-item dot slot and
 *   the connectors (its skin paints them as neutral 1px hairlines, never a
 *   state hue and never a colored vertical rail).
 * - Avatar (P01) owns the actor image with the initials fallback.
 * - Tag (P17) owns the action badge chrome (semantic variant per category).
 * - Skeleton (P30) owns the loading placeholder anatomy (avatar + lines,
 *   mirroring a feed item).
 * - Empty (P09) owns the empty state; Select owns the filter controls.
 * - Governed semantic icon roles carry the activity TYPE inside the dot
 *   (action.add / action.edit / action.delete / privacy.visibility /
 *   navigation.settings) -- the type is never colour-alone and never a
 *   Unicode glyph; the pattern skin only tints the dot ring per category.
 *
 * Component-owned copy (filter floors, empty floor, relative-time units and
 * the entity preposition) resolves through the optional `components` i18n
 * channel with an English floor. Relative time uses ONE parametric catalog
 * message per unit (`{count}`) -- translated fragments are never
 * concatenated. Geometry and paint live in the unlayered modern
 * activity-log skin; this file stamps `data-part` hooks only.
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
import type { ActivityLogProps } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Select } from '../../../../../primitives/inputs/Select';
import type { SelectOption as SelectOptionDef } from '../../../../../primitives/inputs/Select/contracts';
import ModernTimeline from '../../../../../primitives/display/Timeline/engines/modern';
import ModernAvatar from '../../../../../primitives/display/Avatar/engines/modern';
import ModernTag from '../../../../../primitives/display/Tag/engines/modern';
import ModernSkeleton from '../../../../../primitives/feedback/Skeleton/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';
import { ActionAddIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-add';
import { ActionEditIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-edit';
import { ActionDeleteIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-delete';
import { PrivacyVisibilityIcon } from '@/graphics/icons/presentation/semantic/generated/roles/privacy-visibility';
import { NavigationSettingsIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-settings';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

/* ---------------------------------------------------------------------------
 * Action type classification
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

/** Governed icon per category: the activity TYPE reads from the icon shape,
    never from colour alone (the ring tint is a redundant channel). */
const ICON_BY_CATEGORY: Record<
  ActionCategory,
  React.ComponentType<{ decorative: true; size: number }>
> = {
  create: ActionAddIcon,
  update: ActionEditIcon,
  delete: ActionDeleteIcon,
  view: PrivacyVisibilityIcon,
  system: NavigationSettingsIcon,
};

/** Timeline dot tone per category (the primitive's certified preset union). */
const TONE_BY_CATEGORY = {
  create: 'success',
  update: 'blue',
  delete: 'error',
  view: 'gray',
  system: 'warning',
} as const;

/** Tag variant per category (the primitive's certified variant union). */
const TAG_VARIANT_BY_CATEGORY = {
  create: 'success',
  update: 'primary',
  delete: 'error',
  view: 'default',
  system: 'warning',
} as const;

/* ---------------------------------------------------------------------------
 * Timestamp formatting
 * --------------------------------------------------------------------------- */

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

/** Renders a field-level diff showing old values with strikethrough and new
    values emphasized. The from-to connector is the governed auto-mirroring
    forward icon (flips in RTL), never a Unicode arrow. */
function DiffView({ diff }: { diff: Record<string, { from: unknown; to: unknown }> }) {
  return (
    <div data-part="diff">
      {Object.entries(diff).map(([field, { from, to }]) => (
        <div key={field} data-part="diff-row">
          <span data-part="diff-cell" data-diff-role="label">
            {field}:
          </span>
          <span data-part="diff-cell" data-diff-role="from">
            {String(from)}
          </span>
          <span data-part="diff-cell" data-diff-role="arrow" aria-hidden="true">
            <NavigationForwardIcon decorative size={12} />
          </span>
          <span data-part="diff-cell" data-diff-role="to">
            {String(to)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Loading skeleton: composed Skeleton primitives mirroring a feed item
 * --------------------------------------------------------------------------- */

function LoadingSkeleton() {
  return (
    <div data-part="skeleton-list">
      {Array.from({ length: 4 }).map((_, i) => (
        <ModernSkeleton
          key={i}
          data-part="skeleton"
          avatar
          title
          paragraph={{ rows: 1 }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ModernActivityLog (main export)
 * --------------------------------------------------------------------------- */

/**
 * Modern engine for the ActivityLog pattern component.
 *
 * Renders the activity feed on the composed Timeline axis with governed
 * per-type dot icons, actor avatars, action Tag badges, relative timestamps
 * (i18n floor) and field-level diffs.
 *
 * @param props - {@link ActivityLogProps}
 * @returns A filterable vertical activity timeline.
 */
export default function ModernActivityLog(props: ActivityLogProps) {
  // Optional channel with an English floor: the log renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

  const {
    activities,
    filters,
    onFilterChange,
    emptyMessage: emptyMessageProp,
    actionTypes,
    users,
    renderActivity,
    onActivityClick,
    loading,
    className,
    style,
  } = props;

  const copy = {
    allActions: tOr('activityLog.filter.allActions', 'All actions'),
    allUsers: tOr('activityLog.filter.allUsers', 'All users'),
    empty: tOr('activityLog.empty', 'No activity recorded'),
  };
  const emptyMessage = emptyMessageProp ?? copy.empty;

  /** Relative timestamp: ONE parametric catalog message per unit (the floor
      interpolates `{count}` itself) -- translated fragments are never
      concatenated; 7+ days falls back to the locale date. */
  const formatRelativeTime = (ts: string): string => {
    const date = new Date(ts);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return tOr('activityLog.time.justNow', 'just now');
    if (diffMin < 60) return tOr('activityLog.time.minutesAgo', '{count}m ago', { count: diffMin });
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return tOr('activityLog.time.hoursAgo', '{count}h ago', { count: diffHr });
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return tOr('activityLog.time.daysAgo', '{count}d ago', { count: diffDay });
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  /* Loading state: the composed Skeleton primitives own the placeholder
     anatomy; the skin owns the list frame. */
  if (loading) {
    return (
      <div
        data-part="root"
        className={`ds-pattern-activity-log ds-engine-modern ${className ?? ''}`}
        data-loading="true"
        style={style}
      >
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div
      data-part="root"
      className={`ds-pattern-activity-log ds-engine-modern ${className ?? ''}`}
      data-loading="false"
      style={style}
    >
      {/* Filter bar: composed Select primitives (never recreated pills --
          status-filter-pills is another pattern's anatomy). */}
      {onFilterChange && (
        <div data-part="filters">
          {/* Action type filter */}
          {actionTypes && actionTypes.length > 0 && (
            <Select
              size="sm"
              placeholder={copy.allActions}
              value={filters?.type?.[0] || ''}
              options={[
                { value: '', label: copy.allActions } as SelectOptionDef,
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
              placeholder={copy.allUsers}
              value={filters?.user?.[0] || ''}
              options={[
                { value: '', label: copy.allUsers } as SelectOptionDef,
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

      {/* Feed on the composed Timeline axis, or the composed Empty state */}
      {activities.length === 0 ? (
        <div data-part="empty">
          <ModernEmpty description={emptyMessage} />
        </div>
      ) : (
        <ModernTimeline
          items={activities.map((activity) => {
            const category = classifyAction(activity.action);
            const CategoryIcon = ICON_BY_CATEGORY[category];
            return {
              color: TONE_BY_CATEGORY[category],
              dot: (
                <span data-part="activity-dot" data-action-category={category} aria-hidden="true">
                  <CategoryIcon decorative size={12} />
                </span>
              ),
              children: (
                /* The interactive content contract stays pattern-owned: the
                    whole item body is the action surface when onActivityClick
                    is set (role=button). Enter fires exactly as pinned; Space
                    completes the button activation pattern (preventDefault
                    keeps the keypress from scrolling the page). */
                <div
                  data-part="item-body"
                  data-interactive={onActivityClick ? 'true' : 'false'}
                  onClick={onActivityClick ? () => onActivityClick(activity) : undefined}
                  role={onActivityClick ? 'button' : undefined}
                  tabIndex={onActivityClick ? 0 : undefined}
                  onKeyDown={
                    onActivityClick
                      ? (e) => {
                          if (e.key === 'Enter') {
                            onActivityClick(activity);
                          } else if (e.key === ' ') {
                            e.preventDefault();
                            onActivityClick(activity);
                          }
                        }
                      : undefined
                  }
                >
                  {renderActivity ? (
                    renderActivity(activity)
                  ) : (
                    <>
                      {/* Header: composed Avatar + name + composed Tag badge + entity */}
                      <div data-part="item-header">
                        <ModernAvatar data-part="avatar" name={activity.user.name} src={activity.user.avatar} size="sm" />
                        {/* title mirrors the full string: the skin truncates
                            long names/entities with ellipsis (truncation must
                            never eat content silently). */}
                        <span data-part="user" title={activity.user.name}>
                          {activity.user.name}
                        </span>
                        <span data-part="badge" data-action-category={category}>
                          <ModernTag variant={TAG_VARIANT_BY_CATEGORY[category]}>
                            {activity.action}
                          </ModernTag>
                        </span>
                        {activity.entityType && (
                          <span data-part="entity" title={activity.entityId ? `${activity.entityType} #${activity.entityId}` : activity.entityType}>
                            {activity.entityId
                              ? tOr('activityLog.onEntityWithId', 'on {entity} #{id}', {
                                  entity: activity.entityType,
                                  id: activity.entityId,
                                })
                              : tOr('activityLog.onEntity', 'on {entity}', {
                                  entity: activity.entityType,
                                })}
                          </span>
                        )}
                      </div>

                      {/* Timestamp: relative (i18n floor) with absolute tooltip */}
                      <div
                        data-part="timestamp"
                        title={formatAbsoluteTime(activity.timestamp)}
                      >
                        {formatRelativeTime(activity.timestamp)}
                      </div>

                      {/* Diff view */}
                      {activity.diff && <DiffView diff={activity.diff} />}
                    </>
                  )}
                </div>
              ),
            };
          })}
        />
      )}
    </div>
  );
}
