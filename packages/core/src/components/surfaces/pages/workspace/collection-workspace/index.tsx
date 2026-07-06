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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckSquare2, ChevronDown, Filter } from 'lucide-react';
import type { ColumnDef, EditableConfig, PaginationConfig, SortConfig } from '../../../../patterns/foundation/types';
import type {
  CollectionWorkspaceChromeConfig,
  CollectionWorkspaceConfig,
  CollectionWorkspaceSurfaceMode,
  WorkspaceActiveFiltersConfig,
} from '../../../foundation/contracts/collection';
import type { AdaptiveConfig } from '../../../foundation/contracts/adaptive';
import type { DensityKey, ViewMode } from '../../../../patterns/data/list-toolbar/ListToolbar.types';
import type {
  CollectionHeaderMetaItem,
  CollectionHeaderProps,
} from '../../../../structures/headers/collection';
import type {
  SearchCommandBarConfig,
  SearchCommandBarCommand,
} from '../../../../structures/workspace/search-command-bar';
import { useCollectionWorkspace } from '../../../foundation/hooks/useCollectionWorkspace';
import { useAdaptivePosture } from '../../../foundation/hooks/useAdaptivePosture';
import { PatternDataTable } from '../../../../patterns/data/data-table';
import { PatternFilterPanel } from '../../../../patterns/forms/filter-panel';
import { PatternSavedViewsBar } from '../../../../patterns/data/saved-views';
import { PatternListToolbar } from '../../../../patterns/data/list-toolbar';
import { ScopeSwitcher } from '../../../../structures/workspace/scope-switcher';
import { ColumnMenu } from '../../../../structures/workspace/column-menu';
import { CollectionHeader } from '../../../../structures/headers/collection';
import { SearchCommandBar } from '../../../../structures/workspace/search-command-bar';
import { ActiveFiltersBar } from '../../../../structures/workspace/active-filters-bar';
import { Box } from '../../../../primitives/layout/Box';
import { Stack } from '../../../../primitives/layout/Stack';
import { Flex } from '../../../../primitives/layout/Flex';
import { Text } from '../../../../primitives/display/Typography';
import { Button } from '../../../../primitives/inputs/Button';
import { WorkspaceShell } from '../../../layout/collection-shell';
import { CollectionRenderDispatch } from './render-dispatch';
import type { CollectionViewMode, CollectionViewModeConfigs } from '../../../foundation/contracts/collection';
import { resolveDensityStyleVars, normalizeDensityMode } from '../../../../../tokens/ts/base/density';
import type { DensityMode } from '../../../../../tokens/ts/base/density';

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
   * `--ds-density-scale` on its root and threads the mode to the inner table,
   * so density derives declaratively from each capability's style contract.
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
  mobileCard?: (row: T, index: number) => ReactNode;
  defaultViewMode?: 'table' | 'cards';
  /** Per-mode render configurations (grid, kanban, gallery, calendar, cards) */
  viewModes?: CollectionViewModeConfigs<T>;
  primaryAction?: { label: string; onClick: () => void; icon?: ReactNode };
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
  return typeof rowKey === 'function' ? rowKey(item) : String(item[rowKey]);
}

function resolveSortValue<T extends object>(row: T, column: ColumnDef<T>): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey) return row[column.accessorKey];
  return (row as Record<string, unknown>)[column.key];
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
  const lastPx = pxMatches.at(-1)?.[1];
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

function formatHeaderMetaCount(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US', {
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
  const record = row as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] != null) return record[key];
  }
  return undefined;
}

function buildStatusMetaItems<T extends object>(data: T[]): CollectionHeaderMetaItem[] {
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
      label: `${formatHeaderMetaCount(count)} ${key}`,
      tone: ['open', 'active', 'published', 'completed', 'approved'].includes(key)
        ? 'success'
        : 'neutral',
    }));
}

function buildDefaultHeaderMetaItems<T extends object>({
  data,
  controls,
  loading,
  error,
}: {
  data?: T[];
  controls?: CollectionWorkspaceConfig<T>['controls'];
  loading?: boolean;
  error?: ReactNode;
}): CollectionHeaderMetaItem[] {
  if (error) {
    return [{ key: 'state-error', label: 'Needs attention', tone: 'neutral' }];
  }

  if (loading) {
    return [{ key: 'state-loading', label: 'Syncing data', tone: 'primary' }];
  }

  const rows = Array.isArray(data) ? data : [];
  const items: CollectionHeaderMetaItem[] = [
    {
      key: 'visible',
      label: `${formatHeaderMetaCount(rows.length)} in view`,
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
      label: `${formatHeaderMetaCount(scope.count ?? 0)} ${normalizeHeaderMetaLabel(scope.label)}`,
      tone: ['open', 'active', 'published', 'completed', 'approved'].includes(scope.key)
        ? 'success'
        : 'neutral',
    } satisfies CollectionHeaderMetaItem));

  for (const item of scopedItems) {
    if (items.length >= 4) break;
    items.push(item);
  }

  if (items.length < 3) {
    for (const item of buildStatusMetaItems(rows)) {
      if (items.length >= 4) break;
      if (!items.some((existing) => existing.label === item.label)) {
        items.push(item);
      }
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Enhanced CSS
// ---------------------------------------------------------------------------

const ENHANCED_CSS = `
.ds-collection-enhanced tr[data-row-key]:hover td {
  background: color-mix(in srgb, var(--ds-color-primary) 5%, transparent) !important;
  transition: background 140ms ease, box-shadow 140ms ease !important;
}
.ds-collection-enhanced tr[data-row-key]:hover {
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--ds-color-primary) 8%, transparent),
    inset 0 -1px 0 color-mix(in srgb, var(--ds-color-primary) 6%, transparent);
}
.ds-collection-enhanced tr[data-row-key]:hover td:first-child {
  box-shadow: inset 3px 0 0 color-mix(in srgb, var(--ds-color-primary) 30%, transparent);
}
.ds-collection-enhanced tr[data-selected="true"] td {
  background: color-mix(in srgb, var(--ds-color-primary) 12%, transparent) !important;
}
.ds-collection-enhanced tr[data-row-key]:hover button:hover,
.ds-collection-enhanced tr[data-row-key]:hover a:hover {
  transform: translateY(-1px);
  color: var(--ds-color-primary);
  transition: transform 120ms ease, color 120ms ease;
}
.ds-collection-enhanced thead th {
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}
.ds-collection-enhanced tbody td {
  vertical-align: middle;
  line-height: 1.3;
  transition: background 140ms ease, box-shadow 140ms ease;
}
.ds-collection-enhanced .ds-resize-handle:hover .ds-resize-handle__bar,
.ds-collection-enhanced .ds-resize-handle:focus-visible .ds-resize-handle__bar {
  opacity: 1;
  background: var(--ds-color-primary);
}
.ds-collection-enhanced .ds-collection-preview-rail__resize:hover > *,
.ds-collection-enhanced .ds-collection-preview-rail__resize:focus-visible > * {
  left: 5px !important;
  width: 4px !important;
  background: color-mix(in srgb, var(--ds-color-primary) 74%, transparent) !important;
}
.ds-collection-enhanced .ds-collection-preview-rail__resize:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--ds-color-primary) 42%, transparent);
  outline-offset: -2px;
}
`;

const COLLECTION_WORKSPACE_COLUMNS_EVENT = 'collection-workspace:toggle-columns-menu';

const PAGE_SIZE_CONTROL_CSS = `
.ds-collection-page-size-control {
  transition:
    border-color 140ms ease,
    background-color 140ms ease,
    box-shadow 140ms ease;
}
.ds-collection-page-size-control:hover {
  border-color: color-mix(in srgb, var(--ds-color-primary) 26%, var(--ds-color-border-secondary));
  box-shadow: 0 8px 18px color-mix(in srgb, var(--ds-color-primary) 6%, transparent);
}
.ds-collection-page-size-control:focus-within {
  border-color: color-mix(in srgb, var(--ds-color-primary) 42%, var(--ds-color-border-secondary));
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 12%, transparent),
    0 8px 18px color-mix(in srgb, var(--ds-color-primary) 7%, transparent);
}
.ds-collection-page-size-control__picker {
  transition:
    border-color 140ms ease,
    background-color 140ms ease,
    color 140ms ease;
}
.ds-collection-page-size-control__value,
.ds-collection-page-size-control__chevron {
  transition:
    color 140ms ease,
    transform 140ms ease;
}
.ds-collection-page-size-control:hover .ds-collection-page-size-control__picker,
.ds-collection-page-size-control:focus-within .ds-collection-page-size-control__picker {
  background: color-mix(in srgb, var(--ds-color-primary) 13%, var(--ds-surface-card-bg));
  border-color: color-mix(in srgb, var(--ds-color-primary) 34%, var(--ds-color-border-secondary));
  color: var(--ds-color-primary);
}
.ds-collection-page-size-control:hover .ds-collection-page-size-control__chevron,
.ds-collection-page-size-control:focus-within .ds-collection-page-size-control__chevron {
  color: var(--ds-color-primary);
  transform: translateY(1px);
}
.ds-collection-page-size-control__select:focus {
  outline: none;
}
`;

// ---------------------------------------------------------------------------
// Compact utility button (inline in controls row)
// ---------------------------------------------------------------------------

function UtilityIcon({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        padding: 0,
        borderRadius: 8,
        border: active
          ? '1px solid color-mix(in srgb, var(--ds-color-primary) 30%, transparent)'
          : '1px solid transparent',
        background: active
          ? 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)'
          : 'transparent',
        color: active ? 'var(--ds-color-primary)' : 'var(--ds-color-text-muted)',
        cursor: 'pointer',
        transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
      }}
    >
      {icon}
    </Box>
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

function formatPaginationRange(pagination?: PaginationConfig | false, visibleCount?: number): string {
  if (!pagination) return `${visibleCount ?? 0} results`;

  const pageSize = Math.max(1, pagination.pageSize);
  const total = Math.max(0, pagination.total);
  if (pagination.loadMode === 'incremental') {
    const visible = Math.min(Math.max(0, visibleCount ?? 0), total);
    return total === 0 ? '0 results' : `1-${visible} of ${total.toLocaleString()}`;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, pagination.current), totalPages);

  if (total === 0) return '0 results';

  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  return `${start}-${end} of ${total.toLocaleString()}`;
}

function PageSizeControl({
  pagination,
  visibleCount,
}: {
  pagination?: PaginationConfig | false;
  visibleCount: number;
}) {
  const options = getPageSizeOptions(pagination);
  const rangeLabel = formatPaginationRange(pagination, visibleCount);
  const isIncremental = !!pagination && pagination.loadMode === 'incremental';
  const unitLabel = isIncremental ? 'Cards' : 'Rows';
  const suffixLabel = isIncremental ? '/ batch' : '/ page';

  if (!pagination || options.length <= 1) {
    return (
      <Text
        size="xs"
        style={{
          fontSize: 11,
          color: 'var(--ds-color-text-muted)',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap' as const,
        }}
      >
        {rangeLabel}
      </Text>
    );
  }

  return (
    <>
      <style>{PAGE_SIZE_CONTROL_CSS}</style>
      <Box
        as="label"
        className="ds-collection-page-size-control"
        title={isIncremental ? 'Cards per batch' : 'Rows per page'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 30,
          padding: '3px 5px 3px 10px',
          borderRadius: 999,
          border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 74%, transparent)',
          background: 'color-mix(in srgb, var(--ds-surface-card-bg) 90%, transparent)',
          color: 'var(--ds-color-text-muted)',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 680,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        <Text
          as="span"
          size="xs"
          style={{
            fontSize: 11,
            color: 'var(--ds-color-text-secondary)',
            fontWeight: 680,
            lineHeight: 1,
          }}
        >
          {rangeLabel}
        </Text>
        <Box
          className="ds-collection-page-size-control__picker"
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            height: 26,
            minWidth: 104,
            padding: '0 26px 0 9px',
            borderRadius: 999,
            border: '1px solid color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-color-border-secondary))',
            background: 'color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card-bg))',
            color: 'var(--ds-color-text-primary)',
            boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary) 55%, transparent)',
          }}
        >
          <Text
            as="span"
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted)',
              fontSize: 10,
              fontWeight: 780,
              letterSpacing: 0,
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {unitLabel}
          </Text>
          <Text
            as="span"
            className="ds-collection-page-size-control__value"
            size="xs"
            style={{
              color: 'var(--ds-color-text-primary)',
              fontSize: 12,
              fontWeight: 860,
              lineHeight: 1,
            }}
          >
            {pagination.pageSize}
          </Text>
          <Text
            as="span"
            size="xs"
            style={{
              color: 'var(--ds-color-text-muted)',
              fontSize: 10,
              fontWeight: 760,
              lineHeight: 1,
            }}
          >
            {suffixLabel}
          </Text>
          <select
            aria-label={isIncremental ? 'Cards per batch' : 'Rows per page'}
            className="ds-collection-page-size-control__select"
            value={pagination.pageSize}
            onChange={(event) => pagination.onChange(1, Number(event.currentTarget.value))}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              width: '100%',
              height: '100%',
              border: 0,
              borderRadius: 999,
              background: 'transparent',
              color: 'transparent',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 820,
              lineHeight: 1,
              opacity: 0,
              padding: 0,
              outline: 'none',
            }}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="ds-collection-page-size-control__chevron"
            size={13}
            strokeWidth={2.3}
            style={{
              position: 'absolute',
              right: 8,
              color: 'var(--ds-color-text-muted)',
              pointerEvents: 'none',
            }}
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
  } = props;

  const workspace = useCollectionWorkspace({
    config: { controls, behavior, presentation, data, columns },
    defaultViewMode,
  });
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
  const densityStyleVars = resolveDensityStyleVars(normalizeDensityMode(density));
  const compact = density === 'compact';
  const enhanced = presentation?.enhancedInteractions ?? false;
  const resolvedChrome = resolveCollectionWorkspaceChrome(surfaceMode, chrome);
  const autoEmbeddedSearchCommand =
    surfaceMode === 'embed' && !command && controls?.search?.enabled
      ? {
          placeholder: controls.search.placeholder ?? 'Search...',
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
  });
  const resolvedHeader = resolvedChrome.header && header
    ? {
        ...header,
        metaItems: header.metaItems?.length ? header.metaItems : fallbackHeaderMetaItems,
        metaItemsPlacement: header.metaItemsPlacement ?? 'eyebrow-end',
      }
    : undefined;
  const isPremium = Boolean(resolvedHeader || resolvedCommand);
  const selectionEnabled = behavior?.selection?.enabled ?? false;
  const embeddedSurfaceStyle = surfaceMode === 'embed'
    ? {
        display: 'flex',
        flexDirection: 'column' as const,
        flex: '1 1 auto',
        alignSelf: 'stretch',
        width: '100%',
        maxWidth: presentation?.maxWidth ?? '100%',
        minWidth: 0,
        minHeight: 0,
        height: '100%',
      }
    : undefined;
  const canToggleSelectionMode = Boolean(behavior?.selection?.onModeChange);
  const hasInlinePersistenceHandler = typeof behavior?.cellEditing?.onCellEdit === 'function';
  const inlineEditingEnabled = behavior?.cellEditing?.enabled ?? true;
  const autoEnableInlineEditing = behavior?.cellEditing?.autoEnable ?? true;
  const [draftCellValues, setDraftCellValues] = useState<Record<string, Record<string, unknown>>>({});
  const previousDataRef = useRef(data);
  const searchCommand = resolvedCommand
    ?? (resolvedChrome.command && controls?.search?.enabled
        ? {
            placeholder: controls.search.placeholder ?? 'Search...',
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

  const effectiveViewMode = useMemo(() => {
    if (posture.collection && posture.breakpoint !== 'desktop') {
      return posture.collection;
    }
    return workspace.activeViewMode;
  }, [posture.collection, posture.breakpoint, workspace.activeViewMode]);

  const filterLayout = posture.filters === 'sheet' || posture.filters === 'dropdown'
    ? 'stacked' : 'inline';
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
  const previewRailAllowed = effectiveViewMode === 'table' || effectiveViewMode === 'list';
  const showPreviewRail = behavior?.previewRail?.enabled
    && behavior.previewRail.render
    && posture.pane !== 'hidden'
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

      previewRailDragActiveRef.current = true;

      const handlePointerMove = (moveEvent: PointerEvent | MouseEvent) => {
        const delta = startX - moveEvent.clientX;
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

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        commitPreviewRailWidth(previewRailWidthRef.current + 24);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        commitPreviewRailWidth(previewRailWidthRef.current - 24);
      }
    },
    [commitPreviewRailWidth, previewRailResizable],
  );

  const handleRowClick = useCallback(
    (item: T, index: number) => {
      // Mobile navigation: when pane is hidden and mobileNavigation is enabled,
      // navigate instead of opening the preview rail.
      const mobileNav = behavior?.previewRail?.mobileNavigation;
      if (posture.pane === 'hidden' && mobileNav?.enabled) {
        if (mobileNav.href) {
          window.location.href = mobileNav.href(item);
          return;
        }
        if (mobileNav.onClick) {
          mobileNav.onClick(item);
          return;
        }
      }

      if (focusEnabled && behavior?.focus?.onFocusChange) {
        const key = resolveKey(item, rowKey);
        behavior.focus.onFocusChange(key === focusedKey ? null : key);
      }
      (onRowClick ?? behavior?.onRowClick)?.(item, index);
    },
    [focusEnabled, behavior?.focus, behavior?.onRowClick, behavior?.previewRail?.mobileNavigation, onRowClick, posture.pane, rowKey, focusedKey],
  );

  const renderPreviewRail = useCallback(
    (railItem: T) => {
      const configuredWidth = previewRailResizable
        ? `${previewRailWidth}px`
        : behavior?.previewRail?.width ?? `${DEFAULT_PREVIEW_RAIL_WIDTH}px`;

      return (
        <Box
          className="ds-collection-preview-rail"
          style={{
            width: configuredWidth,
            minWidth: configuredWidth,
            maxWidth: configuredWidth,
            flex: `0 0 ${configuredWidth}`,
            position: 'relative',
            borderLeft: '2px solid color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-border-secondary))',
            paddingLeft: 'var(--ds-spacing-md, 16px)',
            background: 'color-mix(in srgb, var(--ds-surface-card) 50%, var(--ds-color-bg-primary) 50%)',
            borderRadius: '0 var(--ds-radius-sm, 6px) var(--ds-radius-sm, 6px) 0',
            overflow: 'auto',
            transition: previewRailResizable
              ? 'width 140ms ease, min-width 140ms ease, max-width 140ms ease, flex-basis 140ms ease'
              : undefined,
          }}
        >
          {previewRailResizable ? (
            <Box
              as="div"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize detail panel"
              aria-valuemin={previewRailMinWidth}
              aria-valuemax={getPreviewRailViewportMax(previewRailMinWidth, previewRailMaxWidth)}
              aria-valuenow={previewRailWidth}
              tabIndex={0}
              title="Drag to resize detail panel"
              onPointerDown={handlePreviewRailResizeStart}
              onMouseDown={handlePreviewRailResizeStart}
              onKeyDown={handlePreviewRailResizeKeyDown}
              className="ds-collection-preview-rail__resize"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: 14,
                padding: 0,
                border: 0,
                cursor: 'col-resize',
                background: 'transparent',
                transform: 'translateX(-50%)',
                pointerEvents: 'auto',
                zIndex: 40,
              }}
            >
              <Box
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 'clamp(12px, 30%, 180px)',
                  bottom: 'clamp(12px, 30%, 180px)',
                  left: 6,
                  width: 2,
                  borderRadius: 999,
                  background: 'color-mix(in srgb, var(--ds-color-primary) 28%, transparent)',
                  boxShadow: '0 0 0 1px color-mix(in srgb, var(--ds-surface-card) 70%, transparent)',
                  transition: 'background 140ms ease, width 140ms ease, left 140ms ease',
                }}
              />
            </Box>
          ) : null}
          {behavior!.previewRail!.render!(railItem)}
        </Box>
      );
    },
    [
      behavior,
      handlePreviewRailResizeKeyDown,
      handlePreviewRailResizeStart,
      previewRailResizable,
      previewRailWidth,
    ],
  );

  const handleExport = useMemo(() => {
    if (!controls?.export?.enabled || !controls.export.onExport) return undefined;
    const fmt = controls.export.formats?.[0] ?? 'csv';
    return () => controls.export!.onExport!(fmt);
  }, [controls?.export?.enabled, controls?.export?.onExport, controls?.export?.formats]);

  const defaultColumnKeys = useMemo(
    () => columns.map((column) => column.key),
    [columns],
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
    const persistedColumns = resolvePersistedInlineColumns(columns, {
      enabled: inlineEditingEnabled,
      hasTableSave: hasInlinePersistenceHandler,
    });

    if (!inlineEditingEnabled || !autoEnableInlineEditing || !hasInlinePersistenceHandler) {
      return persistedColumns;
    }

    return persistedColumns.map((column) => {
      if (column.editable !== undefined || !column.accessorKey) return column;

      const sampleValue = data
        .map((item) => item[column.accessorKey as keyof T])
        .find(isInlineEditablePrimitive);
      const editor = inferInlineEditor<T>(sampleValue);
      if (!editor) return column;

      return {
        ...column,
        editable: editor,
      };
    });
  }, [autoEnableInlineEditing, columns, data, hasInlinePersistenceHandler, inlineEditingEnabled]);

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
      const itemDraft = draftCellValues[itemKey];
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
          ...(current[itemKey] ?? {}),
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

  const hasColumnMenu = Boolean(
    controls?.columnSettings?.enabled &&
      (
        (
          columns.length > 0 &&
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
      columns.map((column) => ({
        key: column.key,
        title: typeof column.header === 'string' ? column.header : column.key,
        group: column.group,
      })),
    [columns],
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
        setFiltersExpanded((prev) => !prev);
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
    hasColumnMenu,
    hasFilters,
    isPremium,
  ]);

  // Focused row render
  const renderRow = useCallback(
    (row: T, defaultRender: ReactNode, _index: number) => {
      if (!focusEnabled) return defaultRender;
      const key = resolveKey(row, rowKey);
      if (key !== focusedKey) return defaultRender;
      return (
        <Box
          style={{
            position: 'relative',
            background: 'color-mix(in srgb, var(--ds-color-primary) 7%, transparent)',
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 34%, transparent)',
            borderRadius: 'var(--ds-radius-xs, 2px)',
            transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
          }}
        >
          {defaultRender}
        </Box>
      );
    },
    [focusEnabled, focusedKey, rowKey],
  );

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
    const toolbarViewMode: ViewMode = workspace.activeViewMode === 'table' ? 'list' : 'cards';

    return (
      <Stack
        spacing="md"
        style={{
          width: '100%',
          maxWidth: presentation?.maxWidth,
          minWidth: 0,
          ...densityStyleVars,
          ...(embeddedSurfaceStyle ?? {}),
        }}
      >
        {headerSlot}
        {!showToolbar && surfaceMode !== 'embed' && (
          <Box>
            <Text size="xl" weight="semibold">{title}</Text>
            {subtitle && <Text size="sm" color="muted">{subtitle}</Text>}
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
              searchPlaceholder={controls?.search?.placeholder ?? 'Search...'}
              viewMode={toolbarViewMode}
              onViewModeChange={(mode: ViewMode) => workspace.setViewMode(mode === 'list' ? 'table' : mode)}
              density={density}
              onDensityChange={(d: DensityKey) => controls?.density?.onChange?.(d)}
              activeFilters={workspace.filterValues}
              onClearFilters={workspace.resetFilters}
              activeFilterCount={workspace.activeFilterCount}
              primaryAction={primaryAction}
              onExport={handleExport}
            />
            {subtitle && <Text size="sm" color="muted">{subtitle}</Text>}
          </>
        )}
        {controls?.scopes?.enabled && controls.scopes.scopes.length > 0 && (
          <ScopeSwitcher
            scopes={controls.scopes.scopes}
            activeScope={controls.scopes.activeScope ?? controls.scopes.scopes[0]?.key ?? ''}
            onScopeChange={controls.scopes.onScopeChange ?? (() => {})}
            variant={workspace.isMobile ? 'inline' : 'section'}
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
        {hasFilters && (
          <PatternFilterPanel
            filters={controls!.filters!}
            values={workspace.filterValues}
            onChange={workspace.applyFilters}
            onReset={workspace.resetFilters}
            activeCount={workspace.activeFilterCount}
            layout={filterLayout}
          />
        )}
        <Flex gap={4} style={{ width: '100%', alignItems: 'stretch' }}>
          <Box style={{ flex: '1 1 0%', minWidth: 0 }}>
            <CollectionRenderDispatch<T>
              viewMode={effectiveViewMode}
              viewModes={viewModes}
              data={displayData}
              columns={effectiveColumns}
              rowKey={rowKey}
              loading={loading}
              error={error}
              emptyState={emptyState}
              actions={actions}
              actionsColumnWidth={actionsColumnWidth}
              onRowClick={handleRowClick}
              onRowDoubleClick={behavior?.onRowDoubleClick}
              expandedRow={behavior?.expandedRow}
              renderRow={focusEnabled ? renderRow : undefined}
              selectable={selectionEnabled}
              selectedKeys={selectionEnabled ? workspace.selectedKeys : undefined}
              onSelectionChange={selectionEnabled ? workspace.setSelection : undefined}
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
        {footerSlot}
      </Stack>
    );
  }

  // -------------------------------------------------------------------------
  // Premium mode: clean hierarchy, single controls row, collapsible filters
  // -------------------------------------------------------------------------

  const hasScopes = controls?.scopes?.enabled && controls.scopes.scopes.length > 0;
  const hasSavedViews = controls?.savedViews?.enabled && controls.savedViews.views && controls.savedViews.views.length > 0;
  const activeFilterCount = resolvedActiveFilters?.filters.length ?? workspace.activeFilterCount;
  const hasActiveFilters = activeFilterCount > 0;
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
    editorialTechMasthead && searchCommand && resolvedHeader?.shortcuts?.length
      ? resolvedHeader.shortcuts
      : undefined;
  const commandTopRailSlot = promotedShortcuts ? (
    <Flex align="center" gap={10} wrap="wrap" justify="end">
      <Text
        size="xs"
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: 'color-mix(in srgb, var(--ds-color-text-muted) 74%, white 6%)',
        }}
      >
        Shortcuts
      </Text>
      {promotedShortcuts.map((shortcut) => (
        <Box
          key={shortcut.key}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 20,
            padding: '0 2px 0 0',
            color: 'color-mix(in srgb, var(--ds-color-text-muted) 88%, white 12%)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.03em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
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
          shortcuts={promotedShortcuts ? undefined : resolvedHeader.shortcuts}
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
        <Box style={{
          padding: slotsCollapsed
            ? 0
            : editorialTechMasthead
              ? '0 20px 12px'
              : '0 16px 12px',
          marginTop: slotsCollapsed ? 0 : editorialTechMasthead ? 0 : 2,
          background: useWorkspaceShell ? 'transparent' : 'var(--ds-surface-card)',
          borderBottom: useWorkspaceShell ? 'none' : '1px solid var(--ds-color-border-subtle)',
          maxHeight: slotsCollapsed ? 0 : 320,
          opacity: slotsCollapsed ? 0 : 1,
          overflow: slotsCollapsed ? 'hidden' : 'visible',
          transition: 'max-height 250ms ease-out, opacity 250ms ease-out, padding 250ms ease-out',
          pointerEvents: slotsCollapsed ? 'none' : undefined,
        }}>
          {resolvedContextSlot}
        </Box>
      )}
    </>
  );

  const premiumContent = (
    <Stack
      spacing="none"
      className={enhanced ? 'ds-collection-enhanced' : undefined}
      style={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        ...(surfaceMode === 'embed'
          ? {
              display: 'flex',
              flex: '1 1 auto',
              minHeight: 0,
              height: '100%',
            }
          : null),
      }}
    >
      {enhanced && <style dangerouslySetInnerHTML={{ __html: ENHANCED_CSS }} />}
      {editorialTechMasthead ? (
        <Box
          style={{
            position: 'relative',
            paddingBottom: 6,
            background: [
              'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 14%, transparent) 0%, color-mix(in srgb, var(--ds-surface-card) 8%, transparent) 44%, transparent 100%)',
              'radial-gradient(88% 90% at 16% 8%, color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent) 0%, transparent 68%)',
            ].join(', '),
            borderBottom:
              '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 34%, transparent)',
          }}
        >
          {topChrome}
        </Box>
      ) : topChrome}

      {/* 4. Stats slot (optional, collapsible) */}
      {showStatsChrome && (
        <Box style={{
          padding: slotsCollapsed ? 0 : '14px 16px 10px',
          maxHeight: slotsCollapsed ? 0 : 400,
          opacity: slotsCollapsed ? 0 : 1,
          overflow: slotsCollapsed ? 'hidden' : 'visible',
          transition: 'max-height 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms cubic-bezier(0.4,0,0.2,1), padding 300ms cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: slotsCollapsed ? 'none' : undefined,
        }}>
          {resolvedStatsSlot}
        </Box>
      )}

      {/* 5. Single compact controls rail with animated saved-views <-> filters swap.
          The data-ds-collection-* attributes are the STABLE addressing contract
          for consumers (WO-UX-03): apps must target these hooks, never the
          inline-style values, which may change in any release. */}
      <Box
        data-ds-collection-toolbar-row="true"
        style={{
          padding: '6px 16px 0',
          borderTop: useWorkspaceShell
            ? '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 16%, transparent)'
            : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 30%, transparent)',
          position: 'relative',
          zIndex: filtersExpanded ? 24 : 4,
          overflow: 'visible',
        }}
      >
        <Flex
          align="center"
          gap={10}
          wrap={posture.isPhone ? 'wrap' : 'nowrap'}
          data-ds-collection-controls-row="true"
          style={{ minHeight: 34 }}
        >
          <Box
            style={{
              flex: 1,
              minWidth: 0,
              overflow: filtersExpanded ? 'visible' : 'hidden',
              position: 'relative',
              zIndex: filtersExpanded ? 16 : 1,
            }}
          >
            <Box
              data-ds-collection-strip-host="true"
              style={{ position: 'relative', minHeight: 44, overflow: 'visible' }}
            >
              <Box
                data-ds-collection-views-strip="true"
                style={{
                  maxHeight: filtersExpanded ? 0 : 52,
                  opacity: filtersExpanded ? 0 : 1,
                  transform: filtersExpanded ? 'translateY(-8px)' : 'translateY(0)',
                  overflow: 'hidden',
                  transition:
                    'max-height 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: filtersExpanded ? 'none' : undefined,
                }}
              >
                <Flex align="center" gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
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
                      style={{
                        width: 1,
                        height: 18,
                        background: 'var(--ds-color-border-subtle)',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {hasSavedViews && (
                    <Box style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
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

              {hasFilters && (
                <Box
                  data-ds-collection-filters-strip="true"
                  style={{
                    maxHeight: filtersExpanded ? (posture.isPhone ? 96 : 48) : 0,
                    opacity: filtersExpanded ? 1 : 0,
                    transform: filtersExpanded ? 'translateY(0)' : 'translateY(8px)',
                    overflow: filtersExpanded ? 'visible' : 'hidden',
                    transition:
                      'max-height 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease, transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                    pointerEvents: filtersExpanded ? undefined : 'none',
                    position: 'relative',
                    zIndex: filtersExpanded ? 28 : 1,
                  }}
                >
                  <Flex
                    align="center"
                    gap={10}
                    wrap="nowrap"
                    style={{
                      minWidth: 0,
                      padding: '2px 0',
                      overflow: 'visible',
                    }}
                  >
                    <Flex align="center" gap={6} style={{ flexShrink: 0 }}>
                      <Box
                        as="span"
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.1em',
                          color: 'var(--ds-color-text-muted)',
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        Advanced filters
                      </Box>
                      {activeFilterCount > 0 && (
                        <Box
                          as="span"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 16,
                            height: 16,
                            padding: '0 4px',
                            fontSize: 9,
                            fontWeight: 700,
                            borderRadius: 8,
                            background: 'var(--ds-color-primary)',
                            color: 'var(--ds-color-text-on-primary)',
                          }}
                        >
                          {activeFilterCount}
                        </Box>
                      )}
                    </Flex>

                    <Box
                      data-ds-collection-strip-scroller="true"
                      style={{
                        flex: '1 1 auto',
                        minWidth: 0,
                        overflowX: posture.isPhone ? 'visible' : 'auto',
                        overflowY: 'visible',
                        scrollbarWidth: 'thin',
                        paddingBottom: posture.isPhone ? 0 : 2,
                      }}
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
                          zIndex: 32,
                          overflow: 'visible',
                          minWidth: posture.isPhone ? undefined : 'max-content',
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
                      <Box
                        as="button"
                        onClick={clearFilters}
                        style={{
                          padding: '2px 8px',
                          border: 0,
                          background: 'transparent',
                          cursor: 'pointer',
                          color: 'var(--ds-color-text-muted)',
                          fontSize: 10,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        Reset
                      </Box>
                    )}
                  </Flex>
                </Box>
              )}
            </Box>
          </Box>

          <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
            {canToggleSelectionMode && (
              <UtilityIcon
                icon={<CheckSquare2 size={15} />}
                label={
                  selectionEnabled
                    ? `${behavior?.selection?.selectedKeys?.length ?? workspace.selectedKeys.length} selected`
                    : behavior?.selection?.toggleLabel ?? 'Select rows'
                }
                active={selectionEnabled}
                onClick={handleSelectionModeToggle}
              />
            )}

            {controls?.density?.enabled && controls.density.onChange && (
              <UtilityIcon
                icon={
                  <Box as="span" style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>
                    {density === 'compact' ? 'S' : density === 'spacious' ? 'L' : 'M'}
                  </Box>
                }
                label={`Density: ${density}`}
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
                icon={<Filter size={15} />}
                label={hasActiveFilters ? `Advanced filters (${activeFilterCount})` : 'Advanced filters'}
                active={filtersExpanded || hasActiveFilters}
                onClick={() => setFiltersExpanded((prev) => !prev)}
              />
            )}

            {handleExport && (
              <UtilityIcon
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                }
                label="Export"
                onClick={handleExport}
              />
            )}

            {showInlineResultCount && (
              <PageSizeControl
                pagination={behavior?.pagination}
                visibleCount={data.length}
              />
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
        <Box style={{ padding: '6px 16px' }}>
          <Flex align="center" gap={8} wrap="wrap">
            <Box
              as="span"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ds-color-primary) 20%, transparent)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--ds-color-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {workspace.selectedKeys.length} selected
            </Box>
            <Box
              as="span"
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: 'var(--ds-color-text-muted)',
              }}
            >
              Smart sets
            </Box>
            {behavior.smartSelection.map((set) => (
              <Button
                key={set.key}
                variant={set.key === 'clear' ? 'ghost' : 'secondary'}
                size="sm"
                onClick={set.onClick}
                disabled={set.disabled}
                style={{ fontSize: 12, gap: 6 }}
              >
                {set.label}
              </Button>
            ))}
          </Flex>
        </Box>
      )}

      {/* 7. Table + preview rail */}
      <Box
        data-ds-collection-body="true"
        style={{
          width: '100%',
          padding: posture.isPhone ? '4px 10px 12px' : '4px 16px 16px',
          ...(surfaceMode === 'embed'
            ? {
                flex: '1 1 auto',
                minHeight: 0,
              }
            : null),
        }}
      >
        <Flex gap={4} style={{ width: '100%', alignItems: 'stretch' }}>
          <Box style={{ flex: '1 1 0%', minWidth: 0 }}>
            <CollectionRenderDispatch<T>
              viewMode={effectiveViewMode}
              viewModes={viewModes}
              data={displayData}
              columns={effectiveColumns}
              rowKey={rowKey}
              loading={loading}
              emptyState={emptyState}
              error={error}
              actions={actions}
              actionsColumnWidth={actionsColumnWidth}
              onRowClick={handleRowClick}
              onRowDoubleClick={behavior?.onRowDoubleClick}
              expandedRow={behavior?.expandedRow}
              renderRow={focusEnabled ? renderRow : undefined}
              selectable={selectionEnabled}
              selectedKeys={selectionEnabled ? workspace.selectedKeys : undefined}
              onSelectionChange={selectionEnabled ? workspace.setSelection : undefined}
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
          focusActive={Boolean(focusedKey)}
          previewActive={Boolean(showPreviewRail)}
          className={enhanced ? 'ds-collection-enhanced' : undefined}
          style={{
            width: '100%',
            maxWidth: presentation?.maxWidth,
            ...densityStyleVars,
            ...(embeddedSurfaceStyle ?? {}),
          }}
        >
          {premiumContent}
        </WorkspaceShell>
      ) : (
        <Box
          style={{
            width: '100%',
            maxWidth: presentation?.maxWidth,
            ...densityStyleVars,
            ...(embeddedSurfaceStyle ?? {}),
          }}
        >
          {premiumContent}
        </Box>
      )}

      {/* Sticky bottom action bar (phone posture) */}
      {posture.actionBar === 'sticky-bottom' && primaryAction && (
        <Box style={{
          position: 'sticky',
          bottom: 0,
          padding: 'var(--ds-spacing-sm, 12px) var(--ds-spacing-md, 16px)',
          background: 'var(--ds-color-bg-primary)',
          borderTop: '1px solid var(--ds-color-border-secondary)',
          zIndex: 10,
        }}>
          <Flex gap={3} justify="between" align="center">
            {workspace.hasSelection && (
              <Text size="sm" color="muted">{workspace.selectedKeys.length} selected</Text>
            )}
            <Box
              as="button"
              onClick={primaryAction.onClick}
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                background: 'var(--ds-color-primary)',
                color: 'var(--ds-color-text-on-primary, #fff)',
                border: 'none',
                borderRadius: 'var(--ds-radius-sm, 6px)',
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Box>
          </Flex>
        </Box>
      )}
    </>
  );
}

/** Canonical public alias. */
export { CollectionWorkspaceSurface as CollectionWorkspace };
export type CollectionWorkspaceSurfaceProps<T extends object> =
  CollectionWorkspaceProps<T>;
