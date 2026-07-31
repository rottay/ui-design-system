/**
 * @fileoverview CollectionWorkspace -- unified premium collection screen.
 *
 * Single canonical workspace surface for all collection/list/table screens.
 *
 * Premium mode layout (when `header` + `command` are provided):
 *   1. CollectionHeader (hero title, eyebrow, quick actions, shortcuts)
 *   2. SearchCommandBar (voice, Cmd+K, suggestions)
 *   3. Context slot (optional: recent activity)
 *   4. Stats slot (optional: KPI cards)
 *   5. Compact controls row (scopes + saved views + utilities in ONE line)
 *   6. Active filter chips (only when filters are applied)
 *   7. Table + preview rail
 *
 * Advanced filters are collapsible -- hidden by default, toggled via button.
 */

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { arrayValueAt } from '@/foundation/kernel/collections';
import {
  directionFromIndexDelta,
  tabPanelTransitionName,
  TAB_PANEL_TRANSITION_CLASS,
  useDirectionalViewTransition,
} from '@/graphics/motion/react/runtime';
import {
  CheckSquareIcon,
  ChevronDownIcon,
} from '@/graphics/icons';
import { ActionFilterIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-filter';
import { DataExportIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-export';
import { NavigationMoreIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-more';
import type { ColumnDef, EditableConfig, FilterDef, PaginationConfig, SortConfig } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
import type {
  CollectionWorkspaceChromeConfig,
  CollectionWorkspaceConfig,
  CollectionWorkspaceSurfaceMode,
  WorkspaceActiveFiltersConfig,
} from '../../../../foundation/contracts/adaptive/collection';
import type { AdaptiveConfig } from '../../../../foundation/contracts/adaptive';
import type { DensityKey, ViewMode } from '../../../../../patterns/data/list-toolbar/contracts';
import type {
  CollectionHeaderMetaItem,
  CollectionHeaderProps,
  CollectionHeaderQuickAction,
} from '../../../../../structures/headers/collection';
import type {
  SearchCommandBarConfig,
  SearchCommandBarCommand,
} from '../../../../../structures/workspace/connected-command-palette/search-command-bar';
import {
  isCollectionFilterValueActive,
  useCollectionWorkspace,
} from '../../../../runtime/collection-workspace';
import { useAdaptivePosture } from '../../../../runtime/adaptive-posture';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import {
  resolveSurfacePermission,
} from '../../../../runtime/helpers';
import { PatternDataTable } from '../../../../../patterns/data/data-table';
import type { DataTablePatternProps } from '../../../../../patterns/data/data-table';
import { PatternFilterPanel } from '../../../../../patterns/forms/filter-panel';
import { PatternSavedViewsBar } from '../../../../../patterns/data/saved-views';
import { PatternListToolbar } from '../../../../../patterns/data/list-toolbar';
import { ScopeSwitcher } from '../../../../../structures/workspace/scope-switcher';
import { ColumnMenu } from '../../../../../structures/workspace/column-menu';
import { CollectionHeader } from '../../../../../structures/headers/collection';
import { SearchCommandBar } from '../../../../../structures/workspace/connected-command-palette/search-command-bar';
import { ActiveFiltersBar } from '../../../../../structures/workspace/active-filters-bar';
import { Box } from '../../../../../primitives/layout/Box';
import { Stack } from '../../../../../primitives/layout/Stack';
import { Flex } from '../../../../../primitives/layout/Flex';
import { Text } from '../../../../../primitives/display/Typography';
import { Button } from '../../../../../primitives/inputs/Button';
import { ActionDock } from '../../../../../structures/workspace/action-dock';
import { AdaptiveOverlay } from '../../../../../patterns/feedback/adaptive-overlay';
import { WorkspaceShell } from '../../../../composition/layout/collection-shell';
import { CollectionRenderDispatch } from './render-dispatch';
import { CollectionFilterDropdown } from './filter-dropdown';
import type { CollectionViewMode, CollectionViewModeConfigs } from '../../../../foundation/contracts/adaptive/collection';
import {
  DENSITY_PRESETS,
  normalizeDensityMode,
} from '../../../../../../foundation/tokens/ts/foundation/base/density';
import type { DensityMode } from '../../../../../../foundation/tokens/ts/foundation/base/density';

const COLLECTION_WORKSPACE_DENSITY_LOCAL_FACTOR_HOOK =
  '--ds-collection-workspace-density-local-factor';

/**
 * Keeps the mode preset as the stable fallback while allowing a presentation
 * profile to govern the workspace's local posture through the CSS cascade.
 * Structural `--ds-density-scale` and appearance
 * `--ds-density-mode-factor` stay inherited from brand/tenant resolution.
 */
function resolveCollectionWorkspaceDensityStyleVars(mode: DensityMode): React.CSSProperties {
  const preset = DENSITY_PRESETS[mode];
  return {
    '--ds-density-cell-padding': preset.cellPadding,
    '--ds-density-card-padding': preset.cardPadding,
    '--ds-density-local-factor': `var(${COLLECTION_WORKSPACE_DENSITY_LOCAL_FACTOR_HOOK}, ${preset.modeFactor})`,
  } as React.CSSProperties;
}

function collectionColumnCapabilityId<T>(column: ColumnDef<T>): string {
  const fieldId = (column as ColumnDef<T> & { fieldId?: string }).fieldId;
  return fieldId?.trim() || column.key;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CollectionWorkspaceProps<T extends object> extends CollectionWorkspaceConfig<T> {
  title: string;
  subtitle?: string;
  columns: ColumnDef<T>[];
  rowKey: keyof T | ((row: T) => string);
  actions?: (row: T, index: number) => ReactNode;
  actionsColumnWidth?: number | string;
  onRowClick?: (row: T, index: number) => void;

  // Premium chrome
  header?: CollectionHeaderProps;
  command?: SearchCommandBarConfig & {
    commands?: SearchCommandBarCommand[];
    showCommandPalette?: boolean;
  };
  contextSlot?: ReactNode;
  statsSlot?: ReactNode;
  activeFilters?: WorkspaceActiveFiltersConfig;
  /**
   * Page workspaces render the full collection chrome. Embedded workspaces are
   * nested inside another surface, so their default chrome is intentionally
   * leaner and avoids duplicate headings/metrics.
   */
  surfaceMode?: CollectionWorkspaceSurfaceMode;
  /**
   * Presentation density for this workspace instance (design-language §3).
   * Route-grade listings render `'comfortable'` (the default); embedded /
   * beside-chat collections render `'compact'`. Resolved from tokens — the
   * surface emits `--ds-density-cell-padding` / `--ds-density-card-padding` /
   * `--ds-density-local-factor` on its root and threads the mode to the inner
   * table, so density derives declaratively without replacing either the
   * tenant's structural `--ds-density-scale` or appearance
   * `--ds-density-mode-factor`. Presentation profiles may govern the local
   * factor through `--ds-collection-workspace-density-local-factor`; when
   * absent, the selected mode's canonical factor remains the fallback.
   *
   * A runtime `controls.density` switcher (`WorkspaceDensityConfig`), when
   * enabled and given a value, still overrides this baseline.
   * @default 'comfortable'
   */
  density?: DensityMode;
  /** Override which chrome regions render for this workspace instance. */
  chrome?: CollectionWorkspaceChromeConfig;
  /**
   * When true, contextSlot and statsSlot collapse with a smooth animation.
   * Drive this from the app's focus-mode or presentation-mode state.
   */
  slotsCollapsed?: boolean;

  // Layout
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  mobileCard?: DataTablePatternProps<T>['mobileCard'];
  defaultViewMode?: 'table' | 'cards';
  /** Per-mode render configurations (grid, kanban, gallery, calendar, cards) */
  viewModes?: CollectionViewModeConfigs<T>;
  primaryAction?: {
    /** Stable identity used to de-duplicate the same action from header quick actions. */
    key?: string;
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
    /** Canonical mutation/busy posture forwarded to the DS Button. */
    pending?: boolean;
    pendingLabel?: string;
    /** Backward-compatible busy alias. Prefer `pending`. */
    loading?: boolean;
    ariaLabel?: string;
  };
  icon?: ReactNode;
  adaptive?: AdaptiveConfig;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveCollectionWorkspaceChrome(
  surfaceMode: CollectionWorkspaceSurfaceMode,
  chrome: CollectionWorkspaceChromeConfig | undefined,
): Required<CollectionWorkspaceChromeConfig> {
  const pageChrome = surfaceMode === 'page';

  return {
    header: chrome?.header ?? pageChrome,
    command: chrome?.command ?? true,
    context: chrome?.context ?? pageChrome,
    stats: chrome?.stats ?? pageChrome,
    activeFilters: chrome?.activeFilters ?? true,
  };
}

function resolveKey<T extends object>(
  item: T,
  rowKey: keyof T | ((row: T) => string),
): string {
  if (typeof rowKey === 'function') return rowKey(item);
  return String(readCollectionRecordValue(item, rowKey));
}

function readCollectionRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

function resolveDefaultFilterValues(filters: FilterDef[] | undefined): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const filter of filters ?? []) {
    if (filter.defaultValue !== undefined) defaults[filter.key] = filter.defaultValue;
  }
  return defaults;
}

function countActiveFilterValues(values: Record<string, unknown>): number {
  return Object.values(values).filter(isCollectionFilterValueActive).length;
}

function normalizeCollectionActionLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

function isPrimaryCollectionAction(
  action: CollectionHeaderQuickAction,
  primaryAction: CollectionWorkspaceProps<object>['primaryAction'],
): boolean {
  if (!primaryAction) return false;

  if (primaryAction.key) return action.key === primaryAction.key;
  if (action.onClick === primaryAction.onClick) return true;

  return normalizeCollectionActionLabel(action.label)
    === normalizeCollectionActionLabel(primaryAction.label);
}

function resolveSortValue<T extends object>(row: T, column: ColumnDef<T>): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey) return readCollectionRecordValue(row, column.accessorKey);
  return readCollectionRecordValue(row, column.key);
}

function compareSortValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

const DEFAULT_PREVIEW_RAIL_WIDTH = 380;
const DEFAULT_PREVIEW_RAIL_MIN_WIDTH = 280;
const DEFAULT_PREVIEW_RAIL_MAX_WIDTH = 720;

/**
 * Canonical presentation order of collection view modes, mirroring the
 * ViewModeSwitcher's left-to-right layout. The view-mode transition derives
 * its slide direction from index deltas in this order; modes not listed
 * resolve to the directionless crossfade.
 */
const COLLECTION_VIEW_MODE_ORDER: readonly string[] = [
  'table',
  'list',
  'cards',
  'grid',
  'kanban',
  'gallery',
  'calendar',
];

function isInlineEditablePrimitive(value: unknown): boolean {
  return value == null || ['string', 'number', 'boolean'].includes(typeof value);
}

function inferInlineEditor<T>(value: unknown): EditableConfig<T> | null {
  if (!isInlineEditablePrimitive(value)) return null;
  if (typeof value === 'number') return { type: 'number' };
  if (typeof value === 'boolean') return { type: 'checkbox' };
  return { type: 'text' };
}

function hasColumnInlineSave<T>(column: ColumnDef<T> | undefined): boolean {
  return Boolean(
    column?.editable
      && typeof column.editable === 'object'
      && typeof column.editable.onSave === 'function',
  );
}

function resolvePersistedInlineColumns<T>(
  columns: ColumnDef<T>[],
  options: {
    enabled: boolean;
    hasTableSave: boolean;
  },
): ColumnDef<T>[] {
  return columns.map((column) => {
    if (!column.editable) return column;
    if (!options.enabled || (!options.hasTableSave && !hasColumnInlineSave(column))) {
      return { ...column, editable: undefined };
    }
    return column;
  });
}

function parseRailWidth(value: string | number | undefined, fallback = DEFAULT_PREVIEW_RAIL_WIDTH): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return fallback;
  const pxMatches = [...value.matchAll(/(\d+(?:\.\d+)?)px/g)];
  const lastPx = arrayValueAt(pxMatches, -1)?.[1];
  if (lastPx) return Number(lastPx);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clampRailWidth(value: number, minWidth: number, maxWidth: number): number {
  return Math.min(Math.max(value, minWidth), maxWidth);
}

function getPreviewRailViewportMax(minWidth: number, maxWidth: number): number {
  if (typeof window === 'undefined') return maxWidth;
  return Math.max(minWidth, Math.min(maxWidth, window.innerWidth - 360));
}

function readStoredPreviewRailWidth(storageKey: string): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedWidth = window.localStorage.getItem(storageKey);
    if (storedWidth == null) return null;
    const parsedStoredWidth = Number(storedWidth);
    return Number.isFinite(parsedStoredWidth) ? parsedStoredWidth : null;
  } catch {
    return null;
  }
}

function writeStoredPreviewRailWidth(storageKey: string, width: number): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(storageKey, String(width));
  } catch {
    // Storage can be unavailable in private or embedded browser contexts.
  }
}

const HIGH_VALUE_SCOPE_KEYS = [
  'open',
  'active',
  'published',
  'pending',
  'pending_approval',
  'urgent',
  'high-risk',
  'watchlist',
  'draft',
  'paused',
  'closed',
  'completed',
  'approved',
  'overloaded',
  'open-capacity',
];

function formatHeaderMetaCount(value: number, locale?: string): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat(locale, {
    notation: Math.abs(value) >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

function normalizeHeaderMetaLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function readHeaderMetaValue(row: object, keys: string[]): unknown {
  for (const key of keys) {
    const value = readCollectionRecordValue(row, key);
    if (value != null) return value;
  }
  return undefined;
}

function buildStatusMetaItems<T extends object>(data: T[], locale?: string): CollectionHeaderMetaItem[] {
  const counts = new Map<string, number>();

  data.forEach((row) => {
    const value = readHeaderMetaValue(row, ['status', 'state', 'stage']);
    if (typeof value !== 'string' || !value.trim()) return;
    const key = normalizeHeaderMetaLabel(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort(([leftKey, leftCount], [rightKey, rightCount]) => {
      const leftPriority = HIGH_VALUE_SCOPE_KEYS.indexOf(leftKey);
      const rightPriority = HIGH_VALUE_SCOPE_KEYS.indexOf(rightKey);
      if (leftPriority !== -1 || rightPriority !== -1) {
        return (leftPriority === -1 ? 999 : leftPriority) - (rightPriority === -1 ? 999 : rightPriority);
      }
      return rightCount - leftCount;
    })
    .slice(0, 2)
    .map(([key, count]) => ({
      key: `status-${key}`,
      label: `${formatHeaderMetaCount(count, locale)} ${key}`,
      tone: ['open', 'active', 'published', 'completed', 'approved'].includes(key)
        ? 'success'
        : 'neutral',
    }));
}

type SurfaceTranslator = (
  key: string,
  fallback: string,
  params?: Record<string, string | number>,
) => string;

function buildDefaultHeaderMetaItems<T extends object>({
  data,
  controls,
  loading,
  error,
  t,
  locale,
}: {
  data?: T[];
  controls?: CollectionWorkspaceConfig<T>['controls'];
  loading?: boolean;
  error?: ReactNode;
  t: SurfaceTranslator;
  locale?: string;
}): CollectionHeaderMetaItem[] {
  if (error) {
    return [{
      key: 'state-error',
      label: t('collection_workspace.meta_needs_attention', 'Needs attention'),
      tone: 'neutral',
    }];
  }

  if (loading) {
    return [{
      key: 'state-loading',
      label: t('collection_workspace.meta_syncing', 'Syncing data'),
      tone: 'primary',
    }];
  }

  const rows = Array.isArray(data) ? data : [];
  const items: CollectionHeaderMetaItem[] = [
    {
      key: 'visible',
      label: t('collection_workspace.meta_in_view', '{count} in view', {
        count: formatHeaderMetaCount(rows.length, locale),
      }),
      tone: 'primary',
    },
  ];

  const scopes = controls?.scopes?.scopes ?? [];
  const scopedItems = scopes
    .filter((scope) => scope.key !== 'all' && typeof scope.count === 'number')
    .sort((left, right) => {
      const leftPriority = HIGH_VALUE_SCOPE_KEYS.indexOf(left.key);
      const rightPriority = HIGH_VALUE_SCOPE_KEYS.indexOf(right.key);
      if (leftPriority !== -1 || rightPriority !== -1) {
        return (leftPriority === -1 ? 999 : leftPriority) - (rightPriority === -1 ? 999 : rightPriority);
      }
      return (right.count ?? 0) - (left.count ?? 0);
    })
    .slice(0, 3)
    .map((scope) => ({
      key: `scope-${scope.key}`,
      label: `${formatHeaderMetaCount(scope.count ?? 0, locale)} ${normalizeHeaderMetaLabel(scope.label)}`,
      tone: ['open', 'active', 'published', 'completed', 'approved'].includes(scope.key)
        ? 'success'
        : 'neutral',
    } satisfies CollectionHeaderMetaItem));

  for (const item of scopedItems) {
    if (items.length >= 4) break;
    items.push(item);
  }

  if (items.length < 3) {
    for (const item of buildStatusMetaItems(rows, locale)) {
      if (items.length >= 4) break;
      if (!items.some((existing) => existing.label === item.label)) {
        items.push(item);
      }
    }
  }

  return items;
}

const COLLECTION_WORKSPACE_COLUMNS_EVENT = 'collection-workspace:toggle-columns-menu';

// ---------------------------------------------------------------------------
// Compact utility button (inline in controls row)
// ---------------------------------------------------------------------------

function UtilityIcon({
  icon,
  label,
  active,
  onClick,
  ariaControls,
  ariaExpanded,
  ariaHasPopup,
  buttonRef,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: React.AriaAttributes['aria-haspopup'];
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="sm"
      icon={icon}
      className="ds-collection-workspace__utility-icon-toggle"
      data-part="utility-icon-toggle"
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
    />
  );
}

function getPageSizeOptions(pagination?: PaginationConfig | false): number[] {
  if (!pagination) return [];

  const options = pagination.pageSizeOptions?.length
    ? pagination.pageSizeOptions
    : [pagination.pageSize];

  return [...new Set(options.concat(pagination.pageSize))]
    .filter((option) => Number.isFinite(option) && option > 0)
    .sort((left, right) => left - right);
}

function formatPaginationRange(
  t: SurfaceTranslator,
  pagination?: PaginationConfig | false,
  visibleCount?: number,
): string {
  if (!pagination) {
    return t('collection_workspace.range_results', '{count} results', { count: visibleCount ?? 0 });
  }

  const pageSize = Math.max(1, pagination.pageSize);
  const total = Math.max(0, pagination.total);
  if (pagination.loadMode === 'incremental') {
    const visible = Math.min(Math.max(0, visibleCount ?? 0), total);
    return total === 0
      ? t('collection_workspace.results_zero', '0 results')
      : t('collection_workspace.range_from_start_of', '1-{visible} of {total}', {
          visible,
          total: total.toLocaleString(),
        });
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, pagination.current), totalPages);

  if (total === 0) return t('collection_workspace.results_zero', '0 results');

  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  return t('collection_workspace.range_of', '{start}-{end} of {total}', {
    start,
    end,
    total: total.toLocaleString(),
  });
}

function PageSizeControl({
  pagination,
  visibleCount,
  compact = false,
}: {
  pagination?: PaginationConfig | false;
  visibleCount: number;
  compact?: boolean;
}) {
  const { tSurfaceOr } = useSurfaceTranslations();
  const options = getPageSizeOptions(pagination);
  const rangeLabel = formatPaginationRange(tSurfaceOr, pagination, visibleCount);
  const isIncremental = !!pagination && pagination.loadMode === 'incremental';
  const unitLabel = isIncremental
    ? tSurfaceOr('collection_workspace.cards_unit', 'Cards')
    : tSurfaceOr('collection_workspace.rows_unit', 'Rows');
  const suffixLabel = isIncremental
    ? tSurfaceOr('collection_workspace.per_batch', '/ batch')
    : tSurfaceOr('collection_workspace.per_page', '/ page');
  const controlLabel = isIncremental
    ? tSurfaceOr('collection_workspace.cards_per_batch', 'Cards per batch')
    : tSurfaceOr('collection_workspace.rows_per_page', 'Rows per page');

  if (!pagination || options.length <= 1) {
    return (
      <Text
        className="ds-collection-page-size-control__summary"
        data-part="page-size-summary"
        size="xs"
      >
        {rangeLabel}
      </Text>
    );
  }

  return (
    <>
      <Box
        as="label"
        className="ds-collection-page-size-control"
        data-part="page-size-control"
        data-load-mode={isIncremental ? 'incremental' : 'paged'}
        data-compact={compact ? 'true' : 'false'}
        title={controlLabel}
      >
        <Text
          className="ds-collection-page-size-control__range"
          data-part="page-size-range"
          as="span"
          size="xs"
        >
          {rangeLabel}
        </Text>
        <Box
          className="ds-collection-page-size-control__picker"
          data-part="page-size-picker"
        >
          {!compact && (
            <Text
              className="ds-collection-page-size-control__unit"
              data-part="page-size-unit"
              as="span"
              size="xs"
            >
              {unitLabel}
            </Text>
          )}
          <Text
            as="span"
            className="ds-collection-page-size-control__value"
            data-part="page-size-value"
            size="xs"
          >
            {pagination.pageSize}
          </Text>
          {!compact && (
            <Text
              className="ds-collection-page-size-control__suffix"
              data-part="page-size-suffix"
              as="span"
              size="xs"
            >
              {suffixLabel}
            </Text>
          )}
          {/* Pinned native select (tests: role combobox named 'Rows per page'):
              an invisible native control overlaid on the styled picker keeps
              the OS-native popup (best mobile UX) while the DS Select cannot
              reproduce this overlaid presentation without losing the custom
              pill anatomy. See lane fragment for the minimal contract. */}
          <select
            aria-label={controlLabel}
            className="ds-collection-page-size-control__select"
            data-part="page-size-select"
            value={pagination.pageSize}
            onChange={(event) => pagination.onChange(1, Number(event.currentTarget.value))}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {tSurfaceOr('collection_workspace.page_size_option', '{count} / page', { count: option })}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden
            className="ds-collection-page-size-control__chevron"
            data-part="page-size-chevron"
            size={13}
            strokeWidth={2.3}
          />
        </Box>
      </Box>
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollectionWorkspaceSurface<T extends object>(props: CollectionWorkspaceProps<T>) {
  const {
    title,
    subtitle,
    columns,
    rowKey,
    actions,
    actionsColumnWidth,
    onRowClick,
    header,
    command,
    contextSlot,
    statsSlot,
    activeFilters,
    surfaceMode = 'page',
    density: densityMode = 'comfortable',
    chrome,
    slotsCollapsed = false,
    headerSlot,
    footerSlot,
    mobileCard,
    defaultViewMode = 'table',
    viewModes,
    primaryAction,
    icon,
    controls,
    behavior,
    presentation,
    data,
    loading,
    error,
    emptyState,
    adaptive,
    access,
    capabilityRegistry,
  } = props;

  const surfaceAccess = access;
  const { tSurfaceOr, locale } = useSurfaceTranslations();
  const capabilityColumns = useMemo(
    () =>
      columns.filter((column) =>
        resolveSurfacePermission(surfaceAccess, {
          kind: 'column',
          id: collectionColumnCapabilityId(column),
        }),
      ),
    [columns, surfaceAccess],
  );

  // `adaptive` is the canonical responsive authority for the surface. The
  // older presentation.responsive contract remains supported when no adaptive
  // posture is supplied, but it must never run in parallel and resolve a
  // different view mode at the same viewport.
  const workspacePresentation = useMemo(
    () => adaptive && presentation?.responsive
      ? { ...presentation, responsive: undefined }
      : presentation,
    [adaptive, presentation],
  );

  const workspace = useCollectionWorkspace({
    config: {
      controls,
      behavior,
      presentation: workspacePresentation,
      data,
      columns: capabilityColumns,
    },
    defaultViewMode,
  });

  // View-mode switches run inside a direction-aware view transition scoped to
  // the collection container (see collectionTransitionStyle below). Direction
  // follows the switcher's presentation order; reduced motion and browsers
  // without the View Transitions API resolve to an instant swap.
  const collectionTransitionScope = useId().replace(/:/g, '');
  const runViewModeTransition = useDirectionalViewTransition();
  const changeViewMode = useCallback(
    (mode: string) => {
      const previousMode = workspace.activeViewMode;
      if (mode === previousMode) return;
      const direction = directionFromIndexDelta(
        COLLECTION_VIEW_MODE_ORDER.indexOf(previousMode),
        COLLECTION_VIEW_MODE_ORDER.indexOf(mode),
      );
      // flushSync puts the re-rendered collection in the DOM before the new
      // snapshot is captured; on the immediate path it degrades to a plain
      // synchronous state update.
      runViewModeTransition(
        () => {
          flushSync(() => workspace.setViewMode(mode));
        },
        { direction },
      );
    },
    [runViewModeTransition, workspace.activeViewMode, workspace.setViewMode],
  );
  const [internalSorting, setInternalSorting] = useState<SortConfig | null>(
    behavior?.sorting ?? null,
  );
  const columnsResizable = presentation?.resizable ?? !!controls?.columnSettings?.onColumnResize;

  const posture = useAdaptivePosture(adaptive);
  // Effective density: a runtime `controls.density` switcher value wins; else
  // the declarative `density` prop baseline (default 'comfortable'). The
  // resolved density CSS variables (design-language §3) are emitted on the
  // surface root so the inner table + embedded cards derive cell/card padding
  // from the token cascade.
  const density: DensityKey = controls?.density?.value ?? densityMode;
  const densityStyleVars = resolveCollectionWorkspaceDensityStyleVars(
    normalizeDensityMode(density),
  );
  const compact = density === 'compact';
  const enhanced = presentation?.enhancedInteractions ?? false;
  const resolvedChrome = resolveCollectionWorkspaceChrome(surfaceMode, chrome);
  const autoEmbeddedSearchCommand =
    surfaceMode === 'embed' && !command && controls?.search?.enabled
      ? {
          placeholder: controls.search.placeholder
            ?? tSurfaceOr('collection_workspace.search_placeholder', 'Search...'),
          value: workspace.searchValue,
          onSearch: workspace.setSearchValue,
          hint: undefined,
          suggestions: undefined,
          recentQueries: undefined,
        }
      : undefined;
  const resolvedCommand = resolvedChrome.command
    ? (command ?? autoEmbeddedSearchCommand)
    : undefined;
  const resolvedContextSlot = resolvedChrome.context ? contextSlot : undefined;
  const resolvedStatsSlot = resolvedChrome.stats ? statsSlot : undefined;
  const resolvedActiveFilters = resolvedChrome.activeFilters
    ? activeFilters
    : undefined;
  const fallbackHeaderMetaItems = buildDefaultHeaderMetaItems({
    data,
    controls,
    loading,
    error,
    t: tSurfaceOr,
    locale,
  });
  const resolvedHeader = resolvedChrome.header && header
    ? {
        ...header,
        metaItems: header.metaItems?.length ? header.metaItems : fallbackHeaderMetaItems,
        metaItemsPlacement: header.metaItemsPlacement ?? 'eyebrow-end',
      }
    : undefined;
  // Premium rendering is a presentation contract, not a side effect of
  // mounting page chrome. Headerless operational collections (for example a
  // list nested under app-owned navigation) must keep the same workspace,
  // density, filter and preview primitives instead of falling back to the
  // legacy toolbar merely because their duplicate heading was removed.
  const isPremium = Boolean(
    resolvedHeader
      || resolvedCommand
      || presentation?.enhancedInteractions
      || presentation?.shell,
  );
  const selectionEnabled = behavior?.selection?.enabled ?? false;
  // Instance geometry only: caller-owned max width. Static layout (inline
  // size, embed flex posture) lives in the skin keyed on data-surface-mode.
  const rootInstanceStyle: React.CSSProperties = {
    maxWidth: presentation?.maxWidth ?? (surfaceMode === 'embed' ? '100%' : undefined),
  };
  const canToggleSelectionMode = Boolean(behavior?.selection?.onModeChange);
  const hasInlinePersistenceHandler = typeof behavior?.cellEditing?.onCellEdit === 'function';
  const inlineEditingEnabled = behavior?.cellEditing?.enabled ?? true;
  const autoEnableInlineEditing = behavior?.cellEditing?.autoEnable ?? true;
  const [draftCellValues, setDraftCellValues] = useState<Record<string, Record<string, unknown>>>({});
  const previousDataRef = useRef(data);
  const searchCommand = resolvedCommand
    ?? (resolvedChrome.command && controls?.search?.enabled
        ? {
            placeholder: controls.search.placeholder
              ?? tSurfaceOr('collection_workspace.search_placeholder', 'Search...'),
            value: workspace.searchValue,
            onSearch: workspace.setSearchValue,
            hint: undefined,
            suggestions: undefined,
            recentQueries: undefined,
          }
        : undefined);

  // Collapsible advanced filters
  const hasFilters = Boolean(controls?.filters && controls.filters.length > 0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filterDraftValues, setFilterDraftValues] = useState<Record<string, unknown>>({});
  const [compactActionsOpen, setCompactActionsOpen] = useState(false);
  const [compactPreviewOpen, setCompactPreviewOpen] = useState(false);
  const [compactPreviewKey, setCompactPreviewKey] = useState<string | null>(null);
  const dismissedCompactPreviewKeyRef = useRef<string | null>(null);
  const unavailableCompactPreviewKeyRef = useRef<string | null>(null);
  const filterDisclosureId = `ds-collection-filter-${useId().replace(/:/g, '')}`;
  const filterDropdownAnchorRef = useRef<HTMLButtonElement | null>(null);
  const compactActionsId = `ds-collection-actions-${useId().replace(/:/g, '')}`;
  const compactPreviewId = `ds-collection-preview-${useId().replace(/:/g, '')}`;
  const usesFilterSheet = Boolean(
    hasFilters && posture.filters === 'sheet',
  );
  const usesFilterDropdown = Boolean(
    hasFilters && posture.filters === 'dropdown',
  );
  const usesFilterDisclosure = usesFilterSheet || usesFilterDropdown;
  const inlineFiltersExpanded = filtersExpanded && !usesFilterDisclosure;
  const usesStickyActionContinuity = posture.actionBar === 'sticky-bottom';
  const usesMinimalHeader = Boolean(
    posture.compactHeader && usesStickyActionContinuity,
  );
  const actionOverflowItems = useMemo(
    () => usesStickyActionContinuity
      ? (resolvedHeader?.quickActions ?? []).filter(
          (action) => !isPrimaryCollectionAction(action, primaryAction),
        )
      : [],
    [primaryAction, resolvedHeader?.quickActions, usesStickyActionContinuity],
  );

  const effectiveViewMode = useMemo(() => {
    if (posture.collection && posture.breakpoint !== 'desktop') {
      return posture.collection;
    }
    return workspace.activeViewMode;
  }, [posture.collection, posture.breakpoint, workspace.activeViewMode]);

  const showOptionalChrome = !posture.compactHeader && !posture.isPhone;
  const showContextChrome = Boolean(
    resolvedContextSlot && (showOptionalChrome || chrome?.context === true),
  );
  const showStatsChrome = Boolean(
    resolvedStatsSlot && (showOptionalChrome || chrome?.stats === true),
  );

  // Focus
  const focusEnabled = behavior?.focus?.enabled ?? false;
  const focusedKey = behavior?.focus?.focusedKey ?? null;
  const previewKey = focusedKey
    ?? (workspace.selectedKeys.length === 1 ? workspace.selectedKeys[0] : null);
  const panePosture = posture.pane ?? 'inline';
  const previewEnabled = Boolean(
    behavior?.previewRail?.enabled && behavior.previewRail.render,
  );
  const usesPreviewSheet = previewEnabled && panePosture === 'sheet';
  const usesPreviewAccordion = previewEnabled && panePosture === 'accordion';
  const usesCompactPreview = usesPreviewSheet || usesPreviewAccordion;
  const previewRailAllowed = effectiveViewMode === 'table' || effectiveViewMode === 'list';
  const showPreviewRail = previewEnabled
    && panePosture === 'inline'
    && previewRailAllowed
    && previewKey != null;
  const previewRailResizable = behavior?.previewRail?.resizable ?? true;
  const previewRailMinWidth = behavior?.previewRail?.minWidth ?? DEFAULT_PREVIEW_RAIL_MIN_WIDTH;
  const previewRailMaxWidth = behavior?.previewRail?.maxWidth ?? DEFAULT_PREVIEW_RAIL_MAX_WIDTH;
  const previewRailStorageKey = behavior?.previewRail?.storageKey
    ?? `ds:collection-preview-rail:${title}`;
  const previewRailDefaultWidth = useMemo(
    () => clampRailWidth(
      parseRailWidth(behavior?.previewRail?.width, DEFAULT_PREVIEW_RAIL_WIDTH),
      previewRailMinWidth,
      previewRailMaxWidth,
    ),
    [behavior?.previewRail?.width, previewRailMaxWidth, previewRailMinWidth],
  );
  const [previewRailWidth, setPreviewRailWidth] = useState(previewRailDefaultWidth);
  const previewRailWidthRef = useRef(previewRailDefaultWidth);
  const previewRailDragActiveRef = useRef(false);

  useEffect(() => {
    previewRailWidthRef.current = previewRailWidth;
  }, [previewRailWidth]);

  useEffect(() => {
    if (!previewRailResizable || typeof window === 'undefined') {
      setPreviewRailWidth(previewRailDefaultWidth);
      return;
    }

    const viewportMax = getPreviewRailViewportMax(previewRailMinWidth, previewRailMaxWidth);
    const storedWidth = readStoredPreviewRailWidth(previewRailStorageKey);
    const nextWidth = clampRailWidth(
      storedWidth ?? previewRailDefaultWidth,
      previewRailMinWidth,
      viewportMax,
    );

    setPreviewRailWidth(nextWidth);
  }, [
    previewRailDefaultWidth,
    previewRailMaxWidth,
    previewRailMinWidth,
    previewRailResizable,
    previewRailStorageKey,
  ]);

  const commitPreviewRailWidth = useCallback(
    (nextWidth: number) => {
      const viewportMax = getPreviewRailViewportMax(previewRailMinWidth, previewRailMaxWidth);
      const clampedWidth = clampRailWidth(nextWidth, previewRailMinWidth, viewportMax);

      previewRailWidthRef.current = clampedWidth;
      setPreviewRailWidth(clampedWidth);
      behavior?.previewRail?.onWidthChange?.(clampedWidth);
      writeStoredPreviewRailWidth(previewRailStorageKey, clampedWidth);
    },
    [
      behavior?.previewRail,
      previewRailMaxWidth,
      previewRailMinWidth,
      previewRailStorageKey,
    ],
  );

  const handlePreviewRailResizeStart = useCallback(
    (event: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
      if (!previewRailResizable || typeof window === 'undefined') return;

      event.preventDefault();
      event.stopPropagation();
      if (previewRailDragActiveRef.current) return;

      const startX = event.clientX;
      const startWidth = previewRailWidthRef.current;
      // The rail sits at the inline-end edge: in RTL that flips it to the
      // left side of the row, so the same physical drag has the opposite
      // effect on the rail width.
      const directionFactor =
        window.getComputedStyle(document.documentElement).direction === 'rtl' ? -1 : 1;

      previewRailDragActiveRef.current = true;

      const handlePointerMove = (moveEvent: PointerEvent | MouseEvent) => {
        const delta = (startX - moveEvent.clientX) * directionFactor;
        commitPreviewRailWidth(startWidth + delta);
      };

      const handlePointerUp = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('mouseup', handlePointerUp);
        previewRailDragActiveRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('mousemove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('mouseup', handlePointerUp);
    },
    [commitPreviewRailWidth, previewRailResizable],
  );

  const handlePreviewRailResizeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!previewRailResizable) return;

      // Logical arrows: ArrowLeft always moves the separator towards the
      // inline-start, which widens the inline-end rail in LTR and shrinks it
      // in RTL.
      const directionFactor =
        typeof window !== 'undefined'
          && window.getComputedStyle(document.documentElement).direction === 'rtl'
          ? -1
          : 1;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        commitPreviewRailWidth(previewRailWidthRef.current + 24 * directionFactor);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        commitPreviewRailWidth(previewRailWidthRef.current - 24 * directionFactor);
      }
    },
    [commitPreviewRailWidth, previewRailResizable],
  );

  const renderPreviewRail = useCallback(
    (railItem: T) => {
      const configuredWidth = previewRailResizable
        ? `${previewRailWidth}px`
        : behavior?.previewRail?.width ?? `${DEFAULT_PREVIEW_RAIL_WIDTH}px`;

      return (
        <Box
          className="ds-collection-preview-rail"
          data-part="preview-rail"
          data-resizable={previewRailResizable ? 'true' : 'false'}
          style={{
            // Instance geometry: the user-resolved rail width is true
            // per-instance data (resized + persisted), not paint.
            width: configuredWidth,
            minWidth: configuredWidth,
            maxWidth: configuredWidth,
            flex: `0 0 ${configuredWidth}`,
          }}
        >
          {previewRailResizable ? (
            <Box
              as="div"
              role="separator"
              aria-orientation="vertical"
              aria-label={tSurfaceOr('collection_workspace.resize_rail_aria', 'Resize detail panel')}
              aria-valuemin={previewRailMinWidth}
              aria-valuemax={getPreviewRailViewportMax(previewRailMinWidth, previewRailMaxWidth)}
              aria-valuenow={previewRailWidth}
              tabIndex={0}
              title={tSurfaceOr('collection_workspace.resize_rail_title', 'Drag to resize detail panel')}
              onPointerDown={handlePreviewRailResizeStart}
              onMouseDown={handlePreviewRailResizeStart}
              onKeyDown={handlePreviewRailResizeKeyDown}
              className="ds-collection-preview-rail__resize"
              data-part="preview-rail-resize"
            >
              <Box
                className="ds-collection-preview-rail__resize-bar"
                data-part="preview-rail-resize-bar"
                aria-hidden
              />
            </Box>
          ) : null}
          {behavior!.previewRail!.render!(railItem, { pane: 'inline', compact: false })}
        </Box>
      );
    },
    [
      behavior,
      handlePreviewRailResizeKeyDown,
      handlePreviewRailResizeStart,
      previewRailResizable,
      previewRailWidth,
      tSurfaceOr,
    ],
  );

  const handleExport = useMemo(() => {
    if (!controls?.export?.enabled || !controls.export.onExport) return undefined;
    const fmt = controls.export.formats?.[0] ?? 'csv';
    return () => controls.export!.onExport!(fmt);
  }, [controls?.export?.enabled, controls?.export?.onExport, controls?.export?.formats]);

  const defaultColumnKeys = useMemo(
    () => capabilityColumns.map((column) => column.key),
    [capabilityColumns],
  );

  const usesExternalSorting = Boolean(behavior?.onSortChange);

  useEffect(() => {
    if (usesExternalSorting) {
      setInternalSorting(behavior?.sorting ?? null);
    }
  }, [behavior?.sorting, usesExternalSorting]);

  const effectiveSorting = usesExternalSorting
    ? behavior?.sorting ?? null
    : internalSorting;

  const effectiveColumns = useMemo<ColumnDef<T>[]>(() => {
    const persistedColumns = resolvePersistedInlineColumns(capabilityColumns, {
      enabled: inlineEditingEnabled,
      hasTableSave: hasInlinePersistenceHandler,
    });

    if (!inlineEditingEnabled || !autoEnableInlineEditing || !hasInlinePersistenceHandler) {
      return persistedColumns;
    }

    return persistedColumns.map((column) => {
      if (column.editable !== undefined || !column.accessorKey) return column;

      const sampleValue = data
        .map((item) => readCollectionRecordValue(item, column.accessorKey as PropertyKey))
        .find(isInlineEditablePrimitive);
      const editor = inferInlineEditor<T>(sampleValue);
      if (!editor) return column;

      return {
        ...column,
        editable: editor,
      };
    });
  }, [autoEnableInlineEditing, capabilityColumns, data, hasInlinePersistenceHandler, inlineEditingEnabled]);

  useEffect(() => {
    if (previousDataRef.current === data) return;
    previousDataRef.current = data;
    setDraftCellValues((current) => (
      Object.keys(current).length > 0 ? {} : current
    ));
  }, [data]);

  const draftedData = useMemo(() => {
    if (Object.keys(draftCellValues).length === 0) return data;

    return data.map((item) => {
      const itemKey = resolveKey(item, rowKey);
      const itemDraft = readCollectionRecordValue(draftCellValues, itemKey) as Partial<T> | undefined;
      if (!itemDraft) return item;

      return {
        ...item,
        ...itemDraft,
      };
    }) as T[];
  }, [data, draftCellValues, rowKey]);

  const handleInlineCellEdit = useCallback(
    async (row: T, columnKey: string, newValue: unknown, oldValue: unknown) => {
      const column = effectiveColumns.find((candidate) => candidate.key === columnKey);
      const hasPersistence = hasInlinePersistenceHandler || hasColumnInlineSave(column);

      if (!hasPersistence) {
        throw new Error('Inline persistence is not configured for this field.');
      }

      await behavior?.cellEditing?.onCellEdit?.(row, columnKey, newValue, oldValue);

      if (!column?.accessorKey) return;

      const itemKey = resolveKey(row, rowKey);
      setDraftCellValues((current) => ({
        ...current,
        [itemKey]: {
          ...((readCollectionRecordValue(current, itemKey) as Record<string, unknown> | undefined) ?? {}),
          [column.accessorKey as string]: newValue,
        },
      }));
    },
    [behavior?.cellEditing, effectiveColumns, hasInlinePersistenceHandler, rowKey],
  );

  const handleSortChange = useCallback(
    (sort: SortConfig) => {
      if (behavior?.onSortChange) {
        behavior.onSortChange(sort);
        return;
      }

      setInternalSorting(sort);
    },
    [behavior?.onSortChange],
  );

  const displayData = useMemo(() => {
    if (usesExternalSorting || !effectiveSorting) return draftedData;

    const sortColumn = effectiveColumns.find((column) => column.key === effectiveSorting.key);
    if (!sortColumn?.sortable) return draftedData;

    return draftedData
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        const comparison = compareSortValues(
          resolveSortValue(left.item, sortColumn),
          resolveSortValue(right.item, sortColumn),
        );
        const directedComparison =
          effectiveSorting.direction === 'asc' ? comparison : -comparison;

        return directedComparison || left.index - right.index;
      })
      .map(({ item }) => item);
  }, [draftedData, effectiveColumns, effectiveSorting, usesExternalSorting]);

  const resolvedCompactPreviewKey = compactPreviewKey
    ?? (unavailableCompactPreviewKeyRef.current === previewKey ? null : previewKey);
  const previewItem = useMemo(
    () => resolvedCompactPreviewKey == null
      ? undefined
      : displayData.find((item) => resolveKey(item, rowKey) === resolvedCompactPreviewKey),
    [displayData, resolvedCompactPreviewKey, rowKey],
  );
  const compactPreviewVisible = Boolean(
    usesCompactPreview && compactPreviewOpen && resolvedCompactPreviewKey != null,
  );

  const handleCompactPreviewOpenChange = useCallback((open: boolean) => {
    if (open) {
      const nextKey = compactPreviewKey ?? previewKey;
      if (nextKey == null) return;
      dismissedCompactPreviewKeyRef.current = null;
      setCompactPreviewKey(nextKey);
      setCompactPreviewOpen(true);
      return;
    }

    dismissedCompactPreviewKeyRef.current = compactPreviewKey ?? previewKey;
    setCompactPreviewOpen(false);
  }, [compactPreviewKey, previewKey]);

  const openCompactPreviewForKey = useCallback((key: string) => {
    dismissedCompactPreviewKeyRef.current = null;
    unavailableCompactPreviewKeyRef.current = null;
    setCompactPreviewKey(key);
    setCompactPreviewOpen(true);
  }, []);

  const previousExternalPreviewKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const previousExternalKey = previousExternalPreviewKeyRef.current;

    if (!usesCompactPreview) {
      previousExternalPreviewKeyRef.current = null;
      dismissedCompactPreviewKeyRef.current = null;
      unavailableCompactPreviewKeyRef.current = null;
      setCompactPreviewKey(null);
      setCompactPreviewOpen(false);
      return;
    }

    previousExternalPreviewKeyRef.current = previewKey;
    if (previewKey == null) {
      if (previousExternalKey != null) {
        dismissedCompactPreviewKeyRef.current = null;
        unavailableCompactPreviewKeyRef.current = null;
        setCompactPreviewKey(null);
        setCompactPreviewOpen(false);
      }
      return;
    }

    if (unavailableCompactPreviewKeyRef.current === previewKey) {
      if (compactPreviewKey != null) setCompactPreviewKey(null);
      return;
    }

    if (unavailableCompactPreviewKeyRef.current != null) {
      unavailableCompactPreviewKeyRef.current = null;
    }

    if (compactPreviewKey !== previewKey) {
      setCompactPreviewKey(previewKey);
      if (dismissedCompactPreviewKeyRef.current !== previewKey) {
        setCompactPreviewOpen(true);
      }
    }
  }, [compactPreviewKey, previewKey, usesCompactPreview]);

  useEffect(() => {
    if (
      !usesCompactPreview
      || !compactPreviewOpen
      || resolvedCompactPreviewKey == null
      || previewItem
      || loading
    ) {
      return;
    }

    // Loading may transiently empty the collection. Only close once the app
    // declares a settled dataset that no longer contains the previewed item.
    dismissedCompactPreviewKeyRef.current = resolvedCompactPreviewKey;
    unavailableCompactPreviewKeyRef.current = resolvedCompactPreviewKey;
    setCompactPreviewKey(null);
    setCompactPreviewOpen(false);
  }, [
    compactPreviewOpen,
    loading,
    previewItem,
    resolvedCompactPreviewKey,
    usesCompactPreview,
  ]);

  const handleWorkspaceSelectionChange = useCallback((keys: string[], items: T[]) => {
    workspace.setSelection(keys, items);
    if (!usesCompactPreview || focusedKey) return;

    if (keys.length === 1) {
      openCompactPreviewForKey(keys[0]);
      return;
    }

    dismissedCompactPreviewKeyRef.current = null;
    setCompactPreviewKey(null);
    setCompactPreviewOpen(false);
  }, [focusedKey, openCompactPreviewForKey, usesCompactPreview, workspace]);

  const handleRowClick = useCallback(
    (item: T, index: number) => {
      const mobileNav = behavior?.previewRail?.mobileNavigation;
      const usesDeclaredRoute = posture.pane === 'route';
      const usesLegacyHiddenRoute = posture.pane === 'hidden' && mobileNav?.enabled;
      const usesEnabledNavigation = mobileNav?.enabled === true;

      // `route` is the named navigation posture. Keep hidden + mobileNavigation
      // as a compatibility alias until apps migrate their adaptive configs.
      if (usesDeclaredRoute || usesLegacyHiddenRoute) {
        if (usesEnabledNavigation && mobileNav?.href) {
          window.location.href = mobileNav.href(item);
          return;
        }
        if (usesEnabledNavigation && mobileNav?.onClick) {
          mobileNav.onClick(item);
          return;
        }

        if (usesDeclaredRoute) {
          (onRowClick ?? behavior?.onRowClick)?.(item, index);
          return;
        }
      }

      const key = resolveKey(item, rowKey);
      if (focusEnabled && behavior?.focus?.onFocusChange) {
        const nextKey = key === focusedKey ? null : key;
        behavior.focus.onFocusChange(nextKey);
        if (usesCompactPreview) {
          if (nextKey) openCompactPreviewForKey(nextKey);
          else handleCompactPreviewOpenChange(false);
        }
      } else if (usesCompactPreview) {
        openCompactPreviewForKey(key);
      }
      (onRowClick ?? behavior?.onRowClick)?.(item, index);
    },
    [
      behavior?.focus,
      behavior?.onRowClick,
      behavior?.previewRail?.mobileNavigation,
      focusEnabled,
      focusedKey,
      handleCompactPreviewOpenChange,
      onRowClick,
      openCompactPreviewForKey,
      posture.pane,
      rowKey,
      usesCompactPreview,
    ],
  );

  const resolveRowHref = useCallback((item: T) => {
    const mobileNav = behavior?.previewRail?.mobileNavigation;
    const usesDeclaredRoute = posture.pane === 'route';
    const usesLegacyHiddenRoute = posture.pane === 'hidden' && mobileNav?.enabled;
    if (
      (!usesDeclaredRoute && !usesLegacyHiddenRoute)
      || mobileNav?.enabled !== true
      || !mobileNav.href
    ) {
      return undefined;
    }

    return mobileNav.href(item);
  }, [behavior?.previewRail?.mobileNavigation, posture.pane]);

  const resolveRowActivationLabel = useCallback(
    (_item: T, index: number) => tSurfaceOr(
      'collection_workspace.open_item_aria',
      'Open {title} item {index}',
      { title, index: index + 1 },
    ),
    [tSurfaceOr, title],
  );

  const hasColumnMenu = Boolean(
    controls?.columnSettings?.enabled &&
      (
        (
          capabilityColumns.length > 0 &&
          (
            controls.columnSettings.onColumnsChange ||
            controls.columnSettings.onVisibleColumnsChange ||
            controls.columnSettings.onColumnOrderChange ||
            controls.columnSettings.onReset
          )
        ) ||
        (
          Boolean(controls.columnSettings.actionItems?.length) &&
          Boolean(controls.columnSettings.onVisibleActionKeysChange)
        )
      ),
  );

  const columnMenuColumns = useMemo(
    () =>
      capabilityColumns.map((column) => ({
        key: column.key,
        title: typeof column.header === 'string' ? column.header : column.key,
        group: column.group,
      })),
    [capabilityColumns],
  );

  const columnMenuActions = useMemo(
    () =>
      (controls?.columnSettings?.actionItems ?? []).map((action) => ({
        key: action.key,
        title: action.label,
        locked: action.locked,
      })),
    [controls?.columnSettings?.actionItems],
  );

  const handleColumnsApply = useCallback(
    (visibleKeys: string[], orderedKeys: string[]) => {
      const settings = controls?.columnSettings;
      if (!settings) return;

      if (settings.onColumnsChange) {
        settings.onColumnsChange(visibleKeys, orderedKeys);
        return;
      }

      settings.onColumnOrderChange?.(orderedKeys);
      settings.onVisibleColumnsChange?.(visibleKeys);
    },
    [controls?.columnSettings],
  );

  const handleColumnsReset = useCallback(() => {
    const settings = controls?.columnSettings;
    if (!settings) return;

    if (settings.onReset) {
      settings.onReset();
      return;
    }

    handleColumnsApply(defaultColumnKeys, defaultColumnKeys);
  }, [controls?.columnSettings, defaultColumnKeys, handleColumnsApply]);

  const handleVisibleActionsApply = useCallback((visibleKeys: string[]) => {
    controls?.columnSettings?.onVisibleActionKeysChange?.(visibleKeys);
  }, [controls?.columnSettings]);

  const handleSelectionModeToggle = useCallback(() => {
    behavior?.selection?.onModeChange?.(!selectionEnabled);
  }, [behavior?.selection, selectionEnabled]);

  const clearFilters = useCallback(() => {
    activeFilters?.onClearAll?.();
    if (!activeFilters?.onClearAll) {
      workspace.resetFilters();
    }
  }, [activeFilters?.onClearAll, workspace]);
  const activeFilterCount = workspace.activeFilterCount;
  const hasActiveFilters = activeFilterCount > 0;
  const draftActiveFilterCount = useMemo(
    () => countActiveFilterValues(filterDraftValues),
    [filterDraftValues],
  );
  const openFilterDisclosure = useCallback(() => {
    setFilterDraftValues({ ...workspace.filterValues });
    setFiltersExpanded(true);
  }, [workspace.filterValues]);
  const closeFilterDisclosure = useCallback(() => {
    setFilterDraftValues({ ...workspace.filterValues });
    setFiltersExpanded(false);
  }, [workspace.filterValues]);
  const applyFilterDisclosure = useCallback(() => {
    workspace.applyFilters({ ...filterDraftValues });
    setFiltersExpanded(false);
  }, [filterDraftValues, workspace]);
  const clearFilterDraft = useCallback(() => {
    setFilterDraftValues(resolveDefaultFilterValues(controls?.filters));
  }, [controls?.filters]);
  const handleFiltersToggle = useCallback(() => {
    if (!usesFilterDisclosure) {
      setFiltersExpanded((current) => !current);
      return;
    }
    if (filtersExpanded) closeFilterDisclosure();
    else openFilterDisclosure();
  }, [closeFilterDisclosure, filtersExpanded, openFilterDisclosure, usesFilterDisclosure]);
  const handleFilterDisclosureOpenChange = useCallback((open: boolean) => {
    if (open) openFilterDisclosure();
    else closeFilterDisclosure();
  }, [closeFilterDisclosure, openFilterDisclosure]);

  useEffect(() => {
    if (!isPremium || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingContext =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        Boolean(target?.isContentEditable);

      if (isTypingContext) return;

      const key = event.key.toLowerCase();
      if (key === 'f' && hasFilters) {
        event.preventDefault();
        handleFiltersToggle();
      } else if (key === 'c' && hasColumnMenu) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent(COLLECTION_WORKSPACE_COLUMNS_EVENT));
      } else if (key === 's' && canToggleSelectionMode) {
        event.preventDefault();
        handleSelectionModeToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    canToggleSelectionMode,
    handleSelectionModeToggle,
    handleFiltersToggle,
    hasColumnMenu,
    hasFilters,
    isPremium,
  ]);

  const previousUsesFilterDisclosureRef = useRef(usesFilterDisclosure);
  useEffect(() => {
    const previouslyUsedDisclosure = previousUsesFilterDisclosureRef.current;
    previousUsesFilterDisclosureRef.current = usesFilterDisclosure;

    if (!hasFilters) {
      setFiltersExpanded(false);
      return;
    }

    if (!previouslyUsedDisclosure && usesFilterDisclosure && filtersExpanded) {
      setFilterDraftValues({ ...workspace.filterValues });
      return;
    }

    if (previouslyUsedDisclosure && !usesFilterDisclosure) {
      setFiltersExpanded(false);
    }
  }, [filtersExpanded, hasFilters, usesFilterDisclosure, workspace.filterValues]);

  useEffect(() => {
    if (!usesStickyActionContinuity || actionOverflowItems.length === 0) {
      setCompactActionsOpen(false);
    }
  }, [actionOverflowItems.length, usesStickyActionContinuity]);

  // Focused row render
  const renderRow = useCallback(
    (row: T, defaultRender: ReactNode, _index: number) => {
      if (!focusEnabled) return defaultRender;
      const key = resolveKey(row, rowKey);
      if (key !== focusedKey) return defaultRender;
      return (
        <Box
          className="ds-collection-workspace__focused-row"
          data-part="focused-row"
          data-focused="true"
        >
          {defaultRender}
        </Box>
      );
    },
    [focusEnabled, focusedKey, rowKey],
  );

  const filterDraftPanel = hasFilters ? (
    <PatternFilterPanel
      filters={controls!.filters!}
      values={filterDraftValues}
      onChange={setFilterDraftValues}
      onReset={clearFilterDraft}
      activeCount={draftActiveFilterCount}
      layout="stacked"
      showReset={draftActiveFilterCount > 0}
    />
  ) : null;

  const filterSheet = usesFilterSheet ? (
    <AdaptiveOverlay
      mode="sheet"
      open={filtersExpanded}
      onOpenChange={handleFilterDisclosureOpenChange}
      title={tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
      id={filterDisclosureId}
      aria-label={tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
      className="ds-collection-workspace__filter-sheet"
      footer={(
        <Flex gap={2} justify="end">
          <Button variant="secondary" onClick={closeFilterDisclosure}>
            {tSurfaceOr('collection_workspace.cancel', 'Cancel')}
          </Button>
          <Button variant="primary" onClick={applyFilterDisclosure}>
            {tSurfaceOr('collection_workspace.apply_filters', 'Apply filters')}
          </Button>
        </Flex>
      )}
    >
      <Box
        className="ds-collection-workspace__filter-sheet-content"
        data-part="filter-sheet-content"
      >
        {filterDraftPanel}
      </Box>
    </AdaptiveOverlay>
  ) : null;

  const filterDropdown = hasFilters ? (
    <CollectionFilterDropdown
      anchorRef={filterDropdownAnchorRef}
      open={usesFilterDropdown && filtersExpanded}
      onOpenChange={handleFilterDisclosureOpenChange}
      id={filterDisclosureId}
      ariaLabel={tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
    >
      <Box
        className="ds-collection-workspace__filter-dropdown-content"
        data-part="filter-dropdown-content"
      >
        {filterDraftPanel}
        <Flex
          className="ds-collection-workspace__filter-dropdown-actions"
          data-part="filter-dropdown-actions"
          gap={2}
          justify="end"
        >
          <Button variant="secondary" onClick={closeFilterDisclosure}>
            {tSurfaceOr('collection_workspace.cancel', 'Cancel')}
          </Button>
          <Button variant="primary" onClick={applyFilterDisclosure}>
            {tSurfaceOr('collection_workspace.apply_filters', 'Apply filters')}
          </Button>
        </Flex>
      </Box>
    </CollectionFilterDropdown>
  ) : null;

  const previewDetailsTitle = tSurfaceOr(
    'collection_workspace.preview_details_title',
    '{title} details',
    { title },
  );
  const loadingDetailsLabel = tSurfaceOr(
    'collection_workspace.loading_details',
    'Loading details…',
  );

  const compactPreviewSheet = usesPreviewSheet ? (
    <AdaptiveOverlay
      mode="sheet"
      open={compactPreviewVisible}
      onOpenChange={handleCompactPreviewOpenChange}
      title={previewDetailsTitle}
      id={compactPreviewId}
      aria-label={previewDetailsTitle}
      className="ds-collection-workspace__preview-sheet"
    >
      <Box
        className="ds-collection-workspace__preview-sheet-content"
        data-part="preview-sheet-content"
        data-preview-key={resolvedCompactPreviewKey ?? undefined}
      >
        {previewItem
          ? behavior!.previewRail!.render!(previewItem, { pane: 'sheet', compact: true })
          : loading && resolvedCompactPreviewKey != null
            ? <Text color="muted">{loadingDetailsLabel}</Text>
            : null}
      </Box>
    </AdaptiveOverlay>
  ) : null;

  const compactPreviewAccordion = usesPreviewAccordion && resolvedCompactPreviewKey != null ? (
    <Box
      className="ds-collection-workspace__preview-accordion"
      data-part="preview-accordion"
      data-preview-key={resolvedCompactPreviewKey ?? undefined}
      data-expanded={compactPreviewOpen ? 'true' : 'false'}
    >
      <Button
        id={`${compactPreviewId}-trigger`}
        variant="ghost"
        block
        aria-expanded={compactPreviewOpen}
        aria-controls={`${compactPreviewId}-region`}
        data-expanded={compactPreviewOpen ? 'true' : 'false'}
        onClick={() => handleCompactPreviewOpenChange(!compactPreviewOpen)}
      >
        <Flex align="center" justify="between" gap={2} className="ds-collection-workspace__preview-accordion-trigger">
          <Text as="span" weight="semibold">{previewDetailsTitle}</Text>
          <ChevronDownIcon
            aria-hidden
            data-part="preview-accordion-icon"
            size={16}
          />
        </Flex>
      </Button>
      {compactPreviewOpen ? (
        <Box
          id={`${compactPreviewId}-region`}
          role="region"
          aria-labelledby={`${compactPreviewId}-trigger`}
          data-part="preview-accordion-content"
        >
          {previewItem
            ? behavior!.previewRail!.render!(previewItem, { pane: 'accordion', compact: true })
            : loading
              ? <Text color="muted">{loadingDetailsLabel}</Text>
              : null}
        </Box>
      ) : null}
    </Box>
  ) : null;

  const compactActionsSheet = usesStickyActionContinuity
    && actionOverflowItems.length > 0 ? (
      <AdaptiveOverlay
        mode="sheet"
        open={compactActionsOpen}
        onOpenChange={setCompactActionsOpen}
        title={tSurfaceOr('collection_workspace.more_actions', 'More actions')}
        id={compactActionsId}
        aria-label={tSurfaceOr('collection_workspace.more_actions', 'More actions')}
        className="ds-collection-workspace__compact-actions-sheet"
      >
        <Stack
          spacing="sm"
          className="ds-collection-workspace__compact-actions-list"
          data-part="compact-actions-list"
        >
          {actionOverflowItems.map((action) => (
            <Button
              key={action.key}
              variant={action.variant ?? 'default'}
              icon={action.icon}
              block
              data-action-key={action.key}
              className="ds-collection-workspace__compact-action"
              onClick={() => {
                setCompactActionsOpen(false);
                action.onClick();
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </AdaptiveOverlay>
    ) : null;

  // -------------------------------------------------------------------------
  // Non-premium (legacy) mode: keep old stacked layout for backward compat
  // -------------------------------------------------------------------------
  if (!isPremium) {
    const hasCommandBar = Boolean(resolvedCommand);
    const showToolbar =
      controls?.viewMode?.enabled ||
      controls?.density?.enabled ||
      controls?.export?.enabled ||
      (!hasCommandBar && resolvedChrome.command && controls?.search?.enabled);
    const toolbarViewMode: ViewMode = effectiveViewMode === 'table' ? 'list' : 'cards';

    return (
      <>
        <Stack
        className="ds-surface ds-collection-workspace"
        data-component="collection-workspace"
        {...densityScopeAttributes(density)}
        data-has-actions={actions ? 'true' : 'false'}
        data-part="root"
        data-preview-open={showPreviewRail || compactPreviewVisible ? 'true' : 'false'}
        data-selection-enabled={selectionEnabled ? 'true' : 'false'}
        data-surface-mode={surfaceMode}
        data-view-mode={effectiveViewMode}
        data-loading={loading ? 'true' : 'false'}
        data-premium="false"
        spacing="md"
        style={{
          ...rootInstanceStyle,
          ...densityStyleVars,
        }}
      >
        {headerSlot}
        {!showToolbar && surfaceMode !== 'embed' && (
          <Box className="ds-collection-workspace__header" data-part="header">
            <Text className="ds-collection-workspace__title" data-part="title" size="xl" weight="semibold">{title}</Text>
            {subtitle && <Text className="ds-collection-workspace__muted-text" size="sm" color="muted">{subtitle}</Text>}
          </Box>
        )}
        {showToolbar && (
          <>
            {/* Legacy PatternListToolbar import kept inline for backward compat */}
            <PatternListToolbar
              title={title}
              icon={icon}
              totalCount={data.length}
              search={workspace.searchValue}
              onSearchChange={workspace.setSearchValue}
              searchPlaceholder={controls?.search?.placeholder
                ?? tSurfaceOr('collection_workspace.search_placeholder', 'Search...')}
              viewMode={toolbarViewMode}
              onViewModeChange={(mode: ViewMode) => changeViewMode(mode === 'list' ? 'table' : mode)}
              density={density}
              onDensityChange={(d: DensityKey) => controls?.density?.onChange?.(d)}
              activeFilters={workspace.filterValues}
              onClearFilters={workspace.resetFilters}
              activeFilterCount={workspace.activeFilterCount}
              primaryAction={primaryAction}
              onExport={handleExport}
            />
            {subtitle && <Text className="ds-collection-workspace__muted-text" size="sm" color="muted">{subtitle}</Text>}
          </>
        )}
        {controls?.scopes?.enabled && controls.scopes.scopes.length > 0 && (
          <ScopeSwitcher
            scopes={controls.scopes.scopes}
            activeScope={controls.scopes.activeScope ?? controls.scopes.scopes[0]?.key ?? ''}
            onScopeChange={controls.scopes.onScopeChange ?? (() => {})}
            variant={posture.isPhone ? 'inline' : 'section'}
          />
        )}
        {controls?.savedViews?.enabled && controls.savedViews.views && controls.savedViews.views.length > 0 && (
          <PatternSavedViewsBar
            views={controls.savedViews.views}
            activeViewId={workspace.activeSavedViewId}
            onViewSelect={workspace.activateSavedView}
            onViewSave={controls.savedViews.onViewSave ?? (() => {})}
            onViewDelete={controls.savedViews.onViewDelete ?? (() => {})}
            onViewRename={controls.savedViews.onViewRename ?? (() => {})}
            onViewCreate={controls.savedViews.onViewCreate ?? (() => {})}
            onViewReorder={controls.savedViews.onViewReorder}
            allowCreate={controls.savedViews.allowCreate}
            allowDelete={controls.savedViews.allowDelete}
            allowRename={controls.savedViews.allowRename}
            maxViews={controls.savedViews.maxViews}
          />
        )}
        {hasFilters && !usesFilterDisclosure && (
          <PatternFilterPanel
            filters={controls!.filters!}
            values={workspace.filterValues}
            onChange={workspace.applyFilters}
            onReset={workspace.resetFilters}
            activeCount={workspace.activeFilterCount}
            layout="inline"
          />
        )}
        {usesFilterDisclosure && (
          <Button
            ref={filterDropdownAnchorRef}
            variant="secondary"
            icon={<ActionFilterIcon decorative size={15} />}
            aria-label={hasActiveFilters
              ? tSurfaceOr('collection_workspace.filters_title_count', 'Advanced filters ({count})', { count: activeFilterCount })
              : tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
            aria-expanded={filtersExpanded}
            aria-haspopup="dialog"
            aria-controls={filterDisclosureId}
            onClick={handleFiltersToggle}
          >
            {hasActiveFilters
              ? tSurfaceOr('collection_workspace.filters_trigger_count', 'Filters ({count})', { count: activeFilterCount })
              : tSurfaceOr('collection_workspace.filters_trigger', 'Filters')}
          </Button>
        )}
        <Flex className="ds-collection-workspace__content" data-part="content" gap={4}>
          <Box
            className="ds-collection-workspace__collection"
            data-part="collection"
            style={{
              viewTransitionName: tabPanelTransitionName(collectionTransitionScope),
              viewTransitionClass: TAB_PANEL_TRANSITION_CLASS,
            } as React.CSSProperties}
          >
            <CollectionRenderDispatch<T>
              viewMode={effectiveViewMode}
              viewModes={viewModes}
              cardColumnsOverride={posture.gridColumns}
              data={displayData}
              columns={effectiveColumns}
              rowKey={rowKey}
              loading={loading}
              error={error}
              access={surfaceAccess}
              capabilityRegistry={capabilityRegistry}
              emptyState={emptyState}
              actions={actions}
              actionsColumnWidth={actionsColumnWidth}
              onRowClick={handleRowClick}
              rowHref={resolveRowHref}
              rowActivationLabel={resolveRowActivationLabel}
              onRowDoubleClick={behavior?.onRowDoubleClick}
              expandedRow={behavior?.expandedRow}
              renderRow={focusEnabled ? renderRow : undefined}
              selectable={selectionEnabled}
              selectedKeys={selectionEnabled ? workspace.selectedKeys : undefined}
              onSelectionChange={selectionEnabled ? handleWorkspaceSelectionChange : undefined}
              bulkActions={behavior?.bulkActions}
              sorting={effectiveSorting}
              onSortChange={handleSortChange}
              pagination={behavior?.pagination}
              compact={compact}
              density={density}
              striped={presentation?.striped}
              bordered={presentation?.bordered}
              hoverable={presentation?.hoverable ?? true}
              stickyHeader={presentation?.stickyHeader}
              columnVisibility={controls?.columnSettings?.enabled}
              visibleColumns={controls?.columnSettings?.visibleColumns}
              onVisibleColumnsChange={controls?.columnSettings?.onVisibleColumnsChange}
              lockedColumns={controls?.columnSettings?.lockedColumns}
              reorderable={!!controls?.columnSettings?.onColumnOrderChange}
              columnOrder={controls?.columnSettings?.columnOrder}
              onColumnReorder={controls?.columnSettings?.onColumnOrderChange}
              pinnedColumns={controls?.columnSettings?.pinnedColumns ? {
                left: controls.columnSettings.pinnedColumns.left ?? [],
                right: controls.columnSettings.pinnedColumns.right ?? [],
              } : undefined}
              onPinChange={controls?.columnSettings?.onPinnedColumnsChange ? (pinned) => {
                controls.columnSettings!.onPinnedColumnsChange!(pinned);
              } : undefined}
              resizable={columnsResizable}
              columnWidths={controls?.columnSettings?.columnWidths}
              onColumnResize={controls?.columnSettings?.onColumnResize}
              onCellEdit={handleInlineCellEdit}
              onCellEditStart={behavior?.cellEditing?.onCellEditStart}
              onCellEditCancel={behavior?.cellEditing?.onCellEditCancel}
              editingCell={behavior?.cellEditing?.editingCell}
              editTrigger={behavior?.cellEditing?.editTrigger}
              tabNavigation={behavior?.cellEditing?.tabNavigation}
              mobileCard={mobileCard}
            />
          </Box>
          {showPreviewRail && (() => {
            const railItem = displayData.find((item) => resolveKey(item, rowKey) === previewKey);
            if (!railItem) return null;
            return renderPreviewRail(railItem);
          })()}
        </Flex>
        {compactPreviewAccordion}
          {footerSlot}
        </Stack>
        {filterSheet}
        {filterDropdown}
        {compactPreviewSheet}
      </>
    );
  }

  // -------------------------------------------------------------------------
  // Premium mode: clean hierarchy, single controls row, collapsible filters
  // -------------------------------------------------------------------------

  const hasScopes = controls?.scopes?.enabled && controls.scopes.scopes.length > 0;
  const hasSavedViews = controls?.savedViews?.enabled && controls.savedViews.views && controls.savedViews.views.length > 0;
  const showInlineResultCount = !resolvedContextSlot;
  const shellConfig = presentation?.shell;
  const useWorkspaceShell = Boolean(isPremium && shellConfig);
  const useAtmosphericShell = Boolean(
    useWorkspaceShell && shellConfig?.variant && shellConfig.variant !== 'default',
  );
  const editorialTechMasthead = Boolean(
    useAtmosphericShell && resolvedHeader?.layoutVariant === 'editorial-tech',
  );
  const promotedShortcuts =
    !usesMinimalHeader
    && editorialTechMasthead
    && searchCommand
    && resolvedHeader?.shortcuts?.length
      ? resolvedHeader.shortcuts
      : undefined;
  const commandTopRailSlot = promotedShortcuts ? (
    <Flex align="center" gap={10} wrap="wrap" justify="end">
      <Text
        className="ds-collection-workspace__shortcut-label"
        data-part="shortcut-label"
        size="xs"
      >
        {tSurfaceOr('collection_workspace.shortcuts_label', 'Shortcuts')}
      </Text>
      {promotedShortcuts.map((shortcut) => (
        <Box
          className="ds-collection-workspace__shortcut"
          data-part="shortcut"
          key={shortcut.key}
        >
          {shortcut.label}
        </Box>
      ))}
    </Flex>
  ) : undefined;
  const topChrome = (
    <>
      {resolvedHeader && (
        <CollectionHeader
          {...resolvedHeader}
          compact={posture.compactHeader}
          minimal={usesMinimalHeader}
          quickActions={usesStickyActionContinuity ? undefined : resolvedHeader.quickActions}
          shortcuts={usesMinimalHeader || promotedShortcuts
            ? undefined
            : resolvedHeader.shortcuts}
          surfaceVariant={useWorkspaceShell ? 'embedded' : resolvedHeader.surfaceVariant}
        />
      )}

      {searchCommand && (
        <SearchCommandBar
          command={{
            placeholder: searchCommand.placeholder,
            value: searchCommand.value,
            onSearch: searchCommand.onSearch,
            hint: searchCommand.hint,
            suggestions: searchCommand.suggestions,
            recentQueries: searchCommand.recentQueries,
          }}
          commands={command?.commands}
          showCommandPalette={command?.showCommandPalette}
          topRailSlot={commandTopRailSlot}
          surfaceVariant={useWorkspaceShell || surfaceMode === 'embed' ? 'embedded' : 'default'}
          layoutVariant={resolvedHeader?.layoutVariant}
        />
      )}

      {showContextChrome && (
        <Box
          className="ds-collection-workspace__context-slot"
          data-part="context-slot"
          data-collapsed={slotsCollapsed ? 'true' : 'false'}
          data-masthead={editorialTechMasthead ? 'true' : 'false'}
        >
          {resolvedContextSlot}
        </Box>
      )}
    </>
  );

  const premiumContent = (
    <Stack
      spacing="none"
      className={['ds-collection-workspace__content', enhanced ? 'ds-collection-enhanced' : undefined].filter(Boolean).join(' ')}
      data-component="collection-workspace"
      {...densityScopeAttributes(density)}
      data-has-actions={actions ? 'true' : 'false'}
      data-part="content"
      data-preview-open={showPreviewRail || compactPreviewVisible ? 'true' : 'false'}
      data-selection-enabled={selectionEnabled ? 'true' : 'false'}
      data-surface-mode={surfaceMode}
      data-view-mode={effectiveViewMode}
      data-loading={loading ? 'true' : 'false'}
      data-premium="true"
      data-enhanced={enhanced ? 'true' : 'false'}
    >
      {editorialTechMasthead ? (
        <Box
          className="ds-collection-workspace__masthead"
          data-part="masthead"
        >
          {topChrome}
        </Box>
      ) : topChrome}

      {/* 4. Stats slot (optional, collapsible) */}
      {showStatsChrome && (
        <Box
          className="ds-collection-workspace__stats-slot"
          data-part="stats-slot"
          data-collapsed={slotsCollapsed ? 'true' : 'false'}
        >
          {resolvedStatsSlot}
        </Box>
      )}

      {/* 5. Single compact controls rail with animated saved-views <-> filters swap.
          The data-ds-collection-* attributes are the STABLE addressing contract
          for consumers (WO-UX-03): apps must target these hooks, never the
          inline-style values, which may change in any release. */}
      <Box
        className="ds-collection-workspace__toolbar-row"
        data-part="toolbar-row"
        data-filters-expanded={inlineFiltersExpanded ? 'true' : 'false'}
        data-ds-collection-toolbar-row="true"
      >
        <Flex
          className="ds-collection-workspace__controls-row"
          data-part="controls-row"
          align="center"
          gap={10}
          wrap={posture.isPhone ? 'wrap' : 'nowrap'}
          data-ds-collection-controls-row="true"
        >
          <Box
            className="ds-collection-workspace__controls-rail"
            data-part="controls-rail"
            data-filters-expanded={inlineFiltersExpanded ? 'true' : 'false'}
            style={{
              // Test-pinned inline geometry (phone full-width rail).
              flex: posture.isPhone ? '1 1 100%' : 1,
              width: posture.isPhone ? '100%' : undefined,
            }}
          >
            <Box
              className="ds-collection-workspace__strip-host"
              data-part="strip-host"
              data-ds-collection-strip-host="true"
            >
              <Box
                className="ds-collection-workspace__views-strip"
                data-part="views-strip"
                data-active={inlineFiltersExpanded ? 'false' : 'true'}
                data-ds-collection-views-strip="true"
              >
                <Flex
                  align="center"
                  gap={8}
                  wrap={posture.isPhone ? 'wrap' : 'nowrap'}
                  className="ds-collection-workspace__views-strip-row"
                >
                  {hasScopes && (
                    <ScopeSwitcher
                      scopes={controls!.scopes!.scopes}
                      activeScope={controls!.scopes!.activeScope ?? controls!.scopes!.scopes[0]?.key ?? ''}
                      onScopeChange={controls!.scopes!.onScopeChange ?? (() => {})}
                      variant="inline"
                    />
                  )}

                  {hasScopes && hasSavedViews && (
                    <Box
                      className="ds-collection-workspace__divider"
                      data-part="divider"
                    />
                  )}

                  {hasSavedViews && (
                    <Box className="ds-collection-workspace__saved-views-host" data-part="saved-views-host">
                      <PatternSavedViewsBar
                        views={controls!.savedViews!.views!}
                        activeViewId={workspace.activeSavedViewId}
                        onViewSelect={workspace.activateSavedView}
                        onViewSave={controls!.savedViews!.onViewSave ?? (() => {})}
                        onViewDelete={controls!.savedViews!.onViewDelete ?? (() => {})}
                        onViewRename={controls!.savedViews!.onViewRename ?? (() => {})}
                        onViewCreate={controls!.savedViews!.onViewCreate ?? (() => {})}
                        onViewReorder={controls!.savedViews!.onViewReorder}
                        allowCreate={controls!.savedViews!.allowCreate}
                        allowDelete={controls!.savedViews!.allowDelete}
                        allowRename={controls!.savedViews!.allowRename}
                        maxViews={controls!.savedViews!.maxViews}
                      />
                    </Box>
                  )}
                </Flex>
              </Box>

              {hasFilters && !usesFilterDisclosure && (
                <Box
                  className="ds-collection-workspace__filters-strip"
                  data-part="filters-strip"
                  data-active={inlineFiltersExpanded ? 'true' : 'false'}
                  data-phone={posture.isPhone ? 'true' : 'false'}
                  data-ds-collection-filters-strip="true"
                >
                  <Flex
                    align="center"
                    gap={10}
                    wrap="nowrap"
                    className="ds-collection-workspace__filters-strip-row"
                  >
                    <Flex align="center" gap={6} className="ds-collection-workspace__filters-eyebrow">
                      <Box
                        as="span"
                        className="ds-collection-workspace__muted-text"
                        data-part="filters-eyebrow-text"
                      >
                        {tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
                      </Box>
                      {activeFilterCount > 0 && (
                        <Box
                          as="span"
                          className="ds-collection-workspace__filter-count"
                          data-part="filter-count"
                        >
                          {activeFilterCount}
                        </Box>
                      )}
                    </Flex>

                    <Box
                      className="ds-collection-workspace__strip-scroller"
                      data-ds-collection-strip-scroller="true"
                    >
                      <PatternFilterPanel
                        filters={controls!.filters!}
                        values={workspace.filterValues}
                        onChange={workspace.applyFilters}
                        onReset={clearFilters}
                        activeCount={activeFilterCount}
                        layout="inline"
                        style={{
                          position: 'relative',
                          zIndex: 4,
                          overflow: 'visible',
                          minWidth: posture.isPhone ? undefined : 'max-content',
                          // Custom-property passthrough (sanctioned): the
                          // filter panel's inline layout channels.
                          ['--ds-filter-panel-inline-wrap' as string]: posture.isPhone ? 'wrap' : 'nowrap',
                          ['--ds-filter-panel-inline-flex' as string]: posture.isPhone
                            ? '1 1 268px'
                            : '0 0 auto',
                          ['--ds-filter-panel-inline-min-width' as string]: posture.isPhone
                            ? '196px'
                            : 'auto',
                          ['--ds-filter-panel-inline-control-width' as string]: posture.isPhone
                            ? '100%'
                            : '156px',
                        }}
                      />
                    </Box>

                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ds-collection-workspace__filter-reset"
                        data-part="filter-reset"
                        onClick={clearFilters}
                      >
                        {tSurfaceOr('collection_workspace.reset', 'Reset')}
                      </Button>
                    )}
                  </Flex>
                </Box>
              )}
            </Box>
          </Box>

          <Flex
            className="ds-collection-workspace__utilities"
            data-part="utilities"
            align="center"
            gap={4}
            style={{
              flexShrink: 0,
              ...(posture.isPhone
                ? {
                    width: '100%',
                    justifyContent: 'flex-end',
                  }
                : null),
            }}
          >
            {canToggleSelectionMode && (
              <UtilityIcon
                icon={<CheckSquareIcon size={15} />}
                label={
                  selectionEnabled
                    ? tSurfaceOr('collection_workspace.selected_count', '{count} selected', {
                        count: behavior?.selection?.selectedKeys?.length ?? workspace.selectedKeys.length,
                      })
                    : behavior?.selection?.toggleLabel
                      ?? tSurfaceOr('collection_workspace.select_rows', 'Select rows')
                }
                active={selectionEnabled}
                onClick={handleSelectionModeToggle}
              />
            )}

            {controls?.density?.enabled && controls.density.onChange && (
              <UtilityIcon
                icon={
                  <Box as="span" className="ds-collection-workspace__density-glyph" data-part="density-glyph">
                    {density === 'compact' ? 'S' : density === 'spacious' ? 'L' : 'M'}
                  </Box>
                }
                label={tSurfaceOr('collection_workspace.density_label', 'Density: {mode}', { mode: density })}
                onClick={() => {
                  const next = density === 'compact' ? 'comfortable' : density === 'comfortable' ? 'spacious' : 'compact';
                  controls.density!.onChange!(next);
                }}
              />
            )}

            {hasColumnMenu && (
              <ColumnMenu
                columns={columnMenuColumns}
                visibleColumns={controls?.columnSettings?.visibleColumns ?? defaultColumnKeys}
                columnOrder={controls?.columnSettings?.columnOrder ?? defaultColumnKeys}
                onColumnsChange={handleColumnsApply}
                actions={columnMenuActions}
                visibleActions={controls?.columnSettings?.visibleActionKeys}
                onVisibleActionsChange={handleVisibleActionsApply}
                pinnedColumns={
                  controls?.columnSettings?.pinnedColumns
                    ? {
                        left: controls.columnSettings.pinnedColumns.left ?? [],
                        right: controls.columnSettings.pinnedColumns.right ?? [],
                      }
                    : undefined
                }
                onPinChange={
                  controls?.columnSettings?.onPinnedColumnsChange
                    ? (pinned) => controls.columnSettings!.onPinnedColumnsChange!(pinned)
                    : undefined
                }
                columnWidths={controls?.columnSettings?.columnWidths}
                onColumnResize={controls?.columnSettings?.onColumnResize}
                groups={controls?.columnSettings?.groups}
                onReset={handleColumnsReset}
                compact
                externalToggleEventName={COLLECTION_WORKSPACE_COLUMNS_EVENT}
              />
            )}

            {hasFilters && (
              <UtilityIcon
                icon={<ActionFilterIcon decorative size={15} />}
                label={hasActiveFilters
                  ? tSurfaceOr('collection_workspace.filters_title_count', 'Advanced filters ({count})', { count: activeFilterCount })
                  : tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
                active={filtersExpanded || hasActiveFilters}
                onClick={handleFiltersToggle}
                ariaControls={usesFilterDisclosure ? filterDisclosureId : undefined}
                ariaExpanded={filtersExpanded}
                ariaHasPopup={usesFilterDisclosure ? 'dialog' : undefined}
                buttonRef={filterDropdownAnchorRef}
              />
            )}

            {handleExport && (
              <UtilityIcon
                icon={<DataExportIcon decorative size={15} />}
                label={tSurfaceOr('collection_workspace.export_aria', 'Export')}
                onClick={handleExport}
              />
            )}

            {showInlineResultCount && (
              <PageSizeControl
                pagination={behavior?.pagination}
                visibleCount={data.length}
                compact={posture.isPhone}
              />
            )}

            {!resolvedHeader && !usesStickyActionContinuity && primaryAction && (
              <Button
                variant="primary"
                size="sm"
                icon={primaryAction.icon}
                disabled={primaryAction.disabled}
                pending={primaryAction.pending ?? primaryAction.loading}
                pendingLabel={primaryAction.pendingLabel}
                aria-label={primaryAction.ariaLabel}
                onClick={primaryAction.onClick}
                className="ds-collection-workspace__toolbar-primary-action"
                data-part="toolbar-primary-action"
              >
                {primaryAction.label}
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* 5.5 Active filters (embedded into the shell when present) */}
      {resolvedActiveFilters && resolvedActiveFilters.filters.length > 0 && (
        <ActiveFiltersBar
          activeFilters={resolvedActiveFilters.filters}
          onRemoveFilter={resolvedActiveFilters.onRemove}
          onClearAll={resolvedActiveFilters.onClearAll}
          onAddFilter={resolvedActiveFilters.onAddFilter}
          surfaceVariant={useWorkspaceShell ? 'embedded' : 'default'}
        />
      )}

      {/* 6. Smart selection sets (visible only while selection mode is on) */}
      {selectionEnabled && behavior?.smartSelection && behavior.smartSelection.length > 0 && workspace.selectedKeys.length > 0 && (
        <Box className="ds-collection-workspace__smart-selection" data-part="smart-selection">
          <Flex align="center" gap={8} wrap="wrap">
            <Box
              as="span"
              className="ds-collection-workspace__selection-count"
              data-part="selection-count"
            >
              {tSurfaceOr('collection_workspace.selected_count', '{count} selected', {
                count: workspace.selectedKeys.length,
              })}
            </Box>
            <Box
              as="span"
              className="ds-collection-workspace__muted-text"
              data-part="smart-sets-label"
            >
              {tSurfaceOr('collection_workspace.smart_sets', 'Smart sets')}
            </Box>
            {behavior.smartSelection.map((set) => (
              <Button
                key={set.key}
                variant={set.key === 'clear' ? 'ghost' : 'secondary'}
                size="sm"
                onClick={set.onClick}
                disabled={set.disabled}
              >
                {set.label}
              </Button>
            ))}
          </Flex>
        </Box>
      )}

      {/* 7. Table + preview rail */}
      <Box
        className="ds-collection-workspace__body"
        data-part="body"
        data-phone={posture.isPhone ? 'true' : 'false'}
        data-ds-collection-body="true"
      >
        <Flex className="ds-collection-workspace__body-content" data-part="body-content" gap={4}>
          <Box
            className="ds-collection-workspace__collection"
            data-part="collection"
            style={{
              viewTransitionName: tabPanelTransitionName(collectionTransitionScope),
              viewTransitionClass: TAB_PANEL_TRANSITION_CLASS,
            } as React.CSSProperties}
          >
            <CollectionRenderDispatch<T>
              viewMode={effectiveViewMode}
              viewModes={viewModes}
              cardColumnsOverride={posture.gridColumns}
              data={displayData}
              columns={effectiveColumns}
              rowKey={rowKey}
              loading={loading}
              emptyState={emptyState}
              error={error}
              access={surfaceAccess}
              capabilityRegistry={capabilityRegistry}
              actions={actions}
              actionsColumnWidth={actionsColumnWidth}
              onRowClick={handleRowClick}
              rowHref={resolveRowHref}
              rowActivationLabel={resolveRowActivationLabel}
              onRowDoubleClick={behavior?.onRowDoubleClick}
              expandedRow={behavior?.expandedRow}
              renderRow={focusEnabled ? renderRow : undefined}
              selectable={selectionEnabled}
              selectedKeys={selectionEnabled ? workspace.selectedKeys : undefined}
              onSelectionChange={selectionEnabled ? handleWorkspaceSelectionChange : undefined}
              bulkActions={behavior?.bulkActions}
              sorting={effectiveSorting}
              onSortChange={handleSortChange}
              pagination={behavior?.pagination}
              compact={compact}
              density={density}
              striped={presentation?.striped}
              bordered={presentation?.bordered}
              hoverable={presentation?.hoverable ?? true}
              stickyHeader={presentation?.stickyHeader}
              columnVisibility={controls?.columnSettings?.enabled}
              visibleColumns={controls?.columnSettings?.visibleColumns}
              onVisibleColumnsChange={controls?.columnSettings?.onVisibleColumnsChange}
              lockedColumns={controls?.columnSettings?.lockedColumns}
              reorderable={!!controls?.columnSettings?.onColumnOrderChange}
              columnOrder={controls?.columnSettings?.columnOrder}
              onColumnReorder={controls?.columnSettings?.onColumnOrderChange}
              pinnedColumns={controls?.columnSettings?.pinnedColumns ? {
                left: controls.columnSettings.pinnedColumns.left ?? [],
                right: controls.columnSettings.pinnedColumns.right ?? [],
              } : undefined}
              onPinChange={controls?.columnSettings?.onPinnedColumnsChange ? (pinned) => {
                controls.columnSettings!.onPinnedColumnsChange!(pinned);
              } : undefined}
              resizable={columnsResizable}
              columnWidths={controls?.columnSettings?.columnWidths}
              onColumnResize={controls?.columnSettings?.onColumnResize}
              onCellEdit={handleInlineCellEdit}
              onCellEditStart={behavior?.cellEditing?.onCellEditStart}
              onCellEditCancel={behavior?.cellEditing?.onCellEditCancel}
              editingCell={behavior?.cellEditing?.editingCell}
              editTrigger={behavior?.cellEditing?.editTrigger}
              tabNavigation={behavior?.cellEditing?.tabNavigation}
              mobileCard={mobileCard}
              focusEnabled={focusEnabled}
            />
          </Box>

          {/* Preview rail */}
          {showPreviewRail && (() => {
            const railItem = displayData.find((item) => resolveKey(item, rowKey) === previewKey);
            if (!railItem) return null;
            return renderPreviewRail(railItem);
          })()}
        </Flex>
      </Box>

      {compactPreviewAccordion}

      {footerSlot}
    </Stack>
  );

  return (
    <>
      {useWorkspaceShell ? (
        <WorkspaceShell
          variant={shellConfig?.variant}
          mood={shellConfig?.mood}
          fieldPattern={shellConfig?.fieldPattern}
          intensity={shellConfig?.intensity}
          continuity={shellConfig?.continuity}
          focusReaction={shellConfig?.focusReaction}
          previewEmphasis={shellConfig?.previewEmphasis}
          particleField={shellConfig?.particleField}
          focusActive={Boolean(focusedKey)}
          previewActive={Boolean(showPreviewRail || compactPreviewVisible)}
          className={['ds-surface ds-collection-workspace', enhanced ? 'ds-collection-enhanced' : undefined].filter(Boolean).join(' ')}
          style={{
            ...rootInstanceStyle,
            ...densityStyleVars,
          }}
        >
          {premiumContent}
        </WorkspaceShell>
      ) : (
        <Box
          className="ds-surface ds-collection-workspace"
          data-part="root"
          data-surface-mode={surfaceMode}
          data-view-mode={effectiveViewMode}
          data-loading={loading ? 'true' : 'false'}
          data-premium="true"
          style={{
            ...rootInstanceStyle,
            ...densityStyleVars,
          }}
        >
          {premiumContent}
        </Box>
      )}

      {filterSheet}
      {filterDropdown}
      {compactPreviewSheet}
      {compactActionsSheet}

      {/* Sticky bottom action bar (phone posture) */}
      {posture.actionBar === 'sticky-bottom'
        && (primaryAction || actionOverflowItems.length > 0) && (
        <ActionDock
          mode="sticky"
          className="ds-surface ds-collection-workspace ds-collection-workspace__sticky-action-bar"
          data-testid="collection-action-dock"
          aria-label={tSurfaceOr('collection_workspace.collection_actions_aria', 'Collection actions')}
        >
          {workspace.hasSelection && (
            <Text
              className="ds-collection-workspace__muted-text"
              size="sm"
              color="muted"
              aria-live="polite"
              data-part="dock-selection-count"
            >
              {tSurfaceOr('collection_workspace.selected_count', '{count} selected', {
                count: workspace.selectedKeys.length,
              })}
            </Text>
          )}

          {actionOverflowItems.length > 0 && (
            <Button
              variant="secondary"
              icon={<NavigationMoreIcon decorative size={18} />}
              aria-label={tSurfaceOr('collection_workspace.more_actions', 'More actions')}
              aria-haspopup="dialog"
              aria-expanded={compactActionsOpen}
              aria-controls={compactActionsId}
              className="ds-collection-workspace__dock-more"
              onClick={() => setCompactActionsOpen(true)}
            >
              {tSurfaceOr('collection_workspace.more', 'More')}
            </Button>
          )}

          {primaryAction && (
            <Button
              variant="primary"
              icon={primaryAction.icon}
              disabled={primaryAction.disabled}
              pending={primaryAction.pending ?? primaryAction.loading}
              pendingLabel={primaryAction.pendingLabel}
              aria-label={primaryAction.ariaLabel}
              onClick={primaryAction.onClick}
              className="ds-collection-workspace__sticky-primary-action"
            >
              {primaryAction.label}
            </Button>
          )}
        </ActionDock>
      )}
    </>
  );
}

/** Canonical public alias. */
export { CollectionWorkspaceSurface as CollectionWorkspace };
export type CollectionWorkspaceSurfaceProps<T extends object> =
  CollectionWorkspaceProps<T>;
