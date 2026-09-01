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
import { interpolateTranslation } from '@/foundation/i18n/runtime/resolution/translation';
import { Select } from '../../../../../primitives/inputs/select';
import { VisuallyHidden } from '../../../../../primitives/foundation';
import type { SelectOption as SelectOptionDef } from '../../../../../primitives/inputs/select/contracts';
import ModernTimeline from '../../../../../primitives/display/timeline/engines/modern';
import ModernAvatar from '../../../../../primitives/display/avatar/engines/modern';
import ModernTag from '../../../../../primitives/display/tag/engines/modern';
import ModernSkeleton from '../../../../../primitives/feedback/skeleton/engines/modern';
import ModernEmpty from '../../../../../primitives/display/empty/engines/modern';
import { ActionAddIcon } from '@/graphics/icons/semantic/generated/roles/action-add';
import { ActionEditIcon } from '@/graphics/icons/semantic/generated/roles/action-edit';
import { ActionDeleteIcon } from '@/graphics/icons/semantic/generated/roles/action-delete';
import { PrivacyVisibilityIcon } from '@/graphics/icons/semantic/generated/roles/privacy-visibility';
import { NavigationSettingsIcon } from '@/graphics/icons/semantic/generated/roles/navigation-settings';
import { NavigationForwardIcon } from '@/graphics/icons/semantic/generated/roles/navigation-forward';

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
function formatAbsoluteTime(ts: string, locale?: string): string {
  const date = new Date(ts);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DIFF_MAX_SUBROWS = 6;
const DIFF_MAX_ARRAY_ITEMS = 4;

type DiffCopy = {
  diffFrom: string;
  diffTo: string;
  diffEmpty: string;
  diffOpaque: string;
  locale?: string;
  listMore: (count: number) => string;
  itemCount: (count: number) => string;
  valueCount: (count: number) => string;
  moreChanges: (count: number) => string;
};

/** Plain data object (literal or null-prototype). A Map, Set, class instance or
    function is opaque to a generic diff and is never walked. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Union of both sides' keys, minus the ones that did not move. */
function changedDiffKeys(from: unknown, to: unknown): string[] {
  const a = isPlainObject(from) ? from : {};
  const b = isPlainObject(to) ? to : {};
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
    (key) => !Object.is(a[key], b[key]),
  );
}

/** One diff value as text. A structured value never reaches a JS coercion
    ("[object Object]") nor a serialization dump (which throws on cycles). */
function formatDiffValue(value: unknown, copy: DiffCopy): string {
  if (value === null || value === undefined || value === '') return copy.diffEmpty;
  if (value instanceof Date) return formatAbsoluteTime(value.toISOString(), copy.locale);
  if (Array.isArray(value)) {
    if (!value.every((item) => item === null || typeof item !== 'object')) {
      return copy.itemCount(value.length);
    }
    const head = value
      .slice(0, DIFF_MAX_ARRAY_ITEMS)
      .map((item) => formatDiffValue(item, copy))
      .join(', ');
    const rest = value.length - DIFF_MAX_ARRAY_ITEMS;
    return rest > 0 ? `${head}, ${copy.listMore(rest)}` : head;
  }
  if (isPlainObject(value)) return copy.valueCount(Object.keys(value).length);
  if (typeof value === 'object' || typeof value === 'function') return copy.diffOpaque;
  return String(value);
}

/* ---------------------------------------------------------------------------
 * Diff renderer
 * --------------------------------------------------------------------------- */

/** Renders a field-level diff showing old values with strikethrough and new
    values emphasized. The from-to connector is the governed auto-mirroring
    forward icon (flips in RTL), never a Unicode arrow. */
function DiffRow({
  label,
  from,
  to,
  copy,
  depth,
}: {
  label: string;
  from: unknown;
  to: unknown;
  copy: DiffCopy;
  depth: 0 | 1;
}) {
  return (
    <div data-part="diff-row" data-diff-depth={depth}>
      <span data-part="diff-cell" data-diff-role="label">
        {label}:
      </span>
      {/* Strikethrough and the muted tint are the only visual marks of the
          old value, and neither reaches a screen reader -- this text does. */}
      <span data-part="diff-cell" data-diff-role="from">
        <VisuallyHidden>{copy.diffFrom}</VisuallyHidden>
        {formatDiffValue(from, copy)}
      </span>
      <span data-part="diff-cell" data-diff-role="arrow" aria-hidden="true">
        <NavigationForwardIcon decorative size={12} />
      </span>
      <span data-part="diff-cell" data-diff-role="to">
        <VisuallyHidden>{copy.diffTo}</VisuallyHidden>
        {formatDiffValue(to, copy)}
      </span>
    </div>
  );
}

function DiffView({
  diff,
  copy,
}: {
  diff: Record<string, { from: unknown; to: unknown }>;
  copy: DiffCopy;
}) {
  return (
    <div data-part="diff">
      {Object.entries(diff).map(([field, { from, to }]) => {
        const structural = isPlainObject(from) || isPlainObject(to);
        const keys = structural ? changedDiffKeys(from, to) : [];
        // A serialized blob buries the delta in unchanged noise, so a struct
        // field expands into one sub-row per key that actually moved.
        if (!structural || keys.length === 0) {
          return <DiffRow key={field} label={field} from={from} to={to} copy={copy} depth={0} />;
        }
        const shown = keys.slice(0, DIFF_MAX_SUBROWS);
        const a = isPlainObject(from) ? from : {};
        const b = isPlainObject(to) ? to : {};
        return (
          <React.Fragment key={field}>
            {shown.map((key) => (
              <DiffRow
                key={`${field}.${key}`}
                label={`${field}.${key}`}
                from={a[key]}
                to={b[key]}
                copy={copy}
                depth={1}
              />
            ))}
            {/* A capped list that leaves no trace reads as the complete set. */}
            {keys.length > shown.length && (
              <div data-part="diff-row" data-diff-overflow="true">
                <span data-part="diff-cell" data-diff-role="label">
                  {copy.moreChanges(keys.length - shown.length)}
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
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
  // Standalone (no provider) the floor is all there is, and it carries the same
  // `{count}` placeholders as catalog copy -- raw, it prints the template.
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? interpolateTranslation(floor, params);
  const locale = i18n?.locale;

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
    // A placeholder is not an accessible name: the two filters and the feed
    // itself need names that survive an open listbox and a screen-reader
    // landmark/control listing.
    filterByAction: tOr('activityLog.filter.byAction', 'Filter by action'),
    filterByUser: tOr('activityLog.filter.byUser', 'Filter by user'),
    feed: tOr('activityLog.feedLabel', 'Activity feed'),
    diffFrom: tOr('activityLog.diff.from', 'from'),
    diffTo: tOr('activityLog.diff.to', 'to'),
    diffEmpty: tOr('activityLog.diff.empty', 'empty'),
    // Structured values get bounded parametric floors, never a JSON dump.
    diffOpaque: tOr('activityLog.diff.opaque', 'changed'),
    locale,
    listMore: (count: number) => tOr('activityLog.diff.listMore', '+{count} more', { count }),
    itemCount: (count: number) => tOr('activityLog.diff.itemCount', '{count} items', { count }),
    valueCount: (count: number) => tOr('activityLog.diff.valueCount', '{count} values', { count }),
    moreChanges: (count: number) =>
      tOr('activityLog.diff.moreChanges', '+{count} more changes', { count }),
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
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  /* Loading state: the composed Skeleton primitives own the placeholder
     anatomy; the skin owns the list frame. */
  // Filters outlive the skeleton: a refetch that unmounts them drops the
  // user's own controls out of the page and re-flows what is left.
  const filterBar = onFilterChange && (
        <div data-part="filters">
          {/* Action type filter */}
          {actionTypes && actionTypes.length > 0 && (
            <Select
              size="sm"
              aria-label={copy.filterByAction}
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
              aria-label={copy.filterByUser}
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
      );

  if (loading) {
    return (
      <div
        data-part="root"
        className={`ds-pattern-activity-log ds-engine-modern ${className ?? ''}`}
        data-loading="true"
        aria-busy={true}
        style={style}
      >
        {filterBar}
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div
      data-part="root"
      className={`ds-pattern-activity-log ds-engine-modern ${className ?? ''}`}
      data-loading="false"
      aria-busy={false}
      style={style}
    >
      {filterBar}

      {/* Feed on the composed Timeline axis, or the composed Empty state */}
      {activities.length === 0 ? (
        <div data-part="empty">
          <ModernEmpty description={emptyMessage} />
        </div>
      ) : (
        <ModernTimeline
          aria-label={copy.feed}
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
                        title={formatAbsoluteTime(activity.timestamp, locale)}
                      >
                        {formatRelativeTime(activity.timestamp)}
                      </div>

                      {/* Diff view */}
                      {activity.diff && <DiffView diff={activity.diff} copy={copy} />}
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
