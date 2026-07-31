/**
 * @fileoverview CollectionRenderDispatch - internal render mode router.
 *
 * Routes collection data to the correct pattern component based on the
 * active view mode: table, cards, grid, kanban, gallery, calendar.
 *
 * Composition law: every view mode delegates to its sanctioned pattern
 * (PatternDataTable / PatternGridView / PatternGalleryView /
 * PatternKanbanBoard / PatternCalendarView). The dispatch owns only the
 * config->pattern adapters, the cards grid (which has no pattern of its
 * own) and the shared pagination footers; it never re-implements pattern
 * chrome.
 *
 * This component is internal to CollectionWorkspaceSurface and should
 * NOT be exported from the DS public API.
 */

'use client';

import React from 'react';
import type { ReactNode } from 'react';
import type {
  ColumnDef,
  KanbanColumnDef,
} from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { CalendarEvent } from '../../../../../../../foundation/contracts/runtime/components/patterns/visualization';
import type { CollectionViewMode, CollectionViewModeConfigs } from '../../../../../foundation/contracts/adaptive/collection';
import type {
  SurfaceAccessInput,
  SurfaceCapabilityRegistration,
} from '../../../../../foundation/contracts';
import {
  isAllSurfaceAccess,
  resolveSurfaceCapabilityRegistry,
} from '../../../../../runtime/helpers';
import { SurfaceCapabilityAnatomy, SurfaceEmptyState } from '../../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../../runtime/helpers/states/i18n';
import type { DensityKey } from '../../../../../../patterns/data/list-toolbar/contracts';
import type { BulkAction } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { SortConfig, PaginationConfig, FilterDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { PatternDataTable } from '../../../../../../patterns/data/data-table';
import type {
  DataTableMobileCardContext,
  DataTablePatternProps,
} from '../../../../../../patterns/data/data-table';
import { PatternGridView } from '../../../../../../patterns/data/grid-view';
import { PatternGalleryView } from '../../../../../../patterns/data/gallery-view';
import { PatternKanbanBoard } from '../../../../../../patterns/visualization/kanban-board';
import { PatternCalendarView } from '../../../../../../patterns/visualization/calendar-view';
import { Box } from '../../../../../../primitives/layout/Box';
import { Text } from '../../../../../../primitives/display/Typography';
import { Button } from '../../../../../../primitives/inputs/Button';
import { Select } from '../../../../../../primitives/inputs/Select';
import { Skeleton } from '../../../../../../primitives/feedback/Skeleton';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CollectionRenderDispatchProps<T extends object> {
  viewMode: CollectionViewMode | string;
  viewModes?: CollectionViewModeConfigs<T>;
  /** Resolved adaptive posture override. Applied only while rendering cards. */
  cardColumnsOverride?: number;
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: keyof T | ((row: T) => string);
  loading?: boolean;
  emptyState?: ReactNode;
  error?: ReactNode;
  access?: SurfaceAccessInput;
  capabilityRegistry?: ReadonlyArray<SurfaceCapabilityRegistration>;

  // Table-specific props
  actions?: (row: T, index: number) => ReactNode;
  actionsColumnWidth?: number | string;
  onRowClick?: (row: T, index: number) => void;
  /** Optional semantic destination for card activation. */
  rowHref?: (row: T, index: number) => string | undefined;
  /** Accessible label for the card activation target. */
  rowActivationLabel?: (row: T, index: number) => string;
  onRowDoubleClick?: (row: T, index: number) => void;
  expandedRow?: (row: T) => ReactNode;
  renderRow?: (row: T, defaultRender: ReactNode, index: number) => ReactNode;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[], rows: T[]) => void;
  bulkActions?: BulkAction<T>[];
  sorting?: SortConfig | null;
  onSortChange?: (sort: SortConfig) => void;
  pagination?: PaginationConfig | false;
  compact?: boolean;
  density?: DensityKey;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  columnVisibility?: boolean;
  visibleColumns?: string[];
  onVisibleColumnsChange?: (keys: string[]) => void;
  lockedColumns?: string[];
  reorderable?: boolean;
  columnOrder?: string[];
  onColumnReorder?: (order: string[]) => void;
  pinnedColumns?: { left: string[]; right: string[] };
  onPinChange?: (pinned: { left: string[]; right: string[] }) => void;
  resizable?: boolean;
  columnWidths?: Record<string, number>;
  onColumnResize?: (key: string, width: number) => void;
  onCellEdit?: (row: T, columnKey: string, newValue: unknown, oldValue: unknown) => void | Promise<void>;
  onCellEditStart?: (row: T, columnKey: string) => void;
  onCellEditCancel?: (row: T, columnKey: string) => void;
  editingCell?: { rowKey: string; columnKey: string } | null;
  editTrigger?: 'click' | 'doubleClick';
  tabNavigation?: boolean;
  mobileCard?: DataTablePatternProps<T>['mobileCard'];

  // Cards-specific (legacy inline card grid)
  focusEnabled?: boolean;
}

// ---------------------------------------------------------------------------
// Key resolver
// ---------------------------------------------------------------------------

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

function getColumnHeader(column: ColumnDef<unknown>): ReactNode {
  const legacyTitle = (column as ColumnDef<unknown> & { title?: ReactNode }).title;
  return column.header ?? legacyTitle ?? column.key;
}

function getColumnCapabilityId<T>(column: ColumnDef<T>): string {
  const fieldId = (column as ColumnDef<T> & { fieldId?: string }).fieldId;
  return fieldId?.trim() || column.key;
}

type SurfaceTranslator = (
  key: string,
  fallback: string,
  params?: Record<string, string | number>,
) => string;

function CollectionErrorAnatomy<T extends object>({
  access,
  actions,
  capabilityRegistry,
  columns,
  error,
  viewMode,
}: Pick<
  CollectionRenderDispatchProps<T>,
  'access' | 'actions' | 'capabilityRegistry' | 'columns' | 'error' | 'viewMode'
>): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const registeredColumns = isAllSurfaceAccess(access)
    ? columns
    : columns.filter((column) => column.visible !== false);
  const explicitRegistry = capabilityRegistry ?? [];
  const hasExplicitRowActions = explicitRegistry.some(
    (capability) => capability.kind === 'action'
  );
  const registrations: SurfaceCapabilityRegistration[] = [
    ...explicitRegistry,
    ...registeredColumns.map((column) => ({
      kind: 'column' as const,
      id: getColumnCapabilityId(column),
      label: getColumnHeader(column as ColumnDef<unknown>),
    })),
    ...(actions && !hasExplicitRowActions
      ? [{
          kind: 'action' as const,
          id: 'row-actions',
          label: tSurfaceOr('collection_workspace.row_actions', 'Row actions'),
        }]
      : []),
  ];
  const capabilities = resolveSurfaceCapabilityRegistry(registrations, access);

  return (
    <Box
      className="ds-surface ds-collection-render-dispatch"
      data-part="root"
      data-view-mode={viewMode}
      data-state="error"
      data-capability-count={capabilities.length}
      padding="lg"
    >
      <Box data-part="error-state" aria-live="polite">
        {error}
      </Box>

      <SurfaceCapabilityAnatomy
        capabilities={capabilities}
        ariaLabel={tSurfaceOr('states.capability_aria', 'Registered surface capabilities')}
      />
    </Box>
  );
}

function getColumnValue<T extends object>(
  row: T,
  column: ColumnDef<T>,
  index: number,
  t: SurfaceTranslator,
): ReactNode {
  const rawValue = column.accessorFn
    ? column.accessorFn(row)
    : column.accessorKey
      ? readCollectionRecordValue(row, column.accessorKey)
      : readCollectionRecordValue(row, column.key);

  if (column.render) {
    return column.render(rawValue, row, index);
  }

  if (rawValue == null || rawValue === '') {
    return t('collection_workspace.not_set', 'Not set');
  }
  if (rawValue instanceof Date) return rawValue.toLocaleDateString();
  if (typeof rawValue === 'boolean') {
    return rawValue
      ? t('collection_workspace.boolean_yes', 'Yes')
      : t('collection_workspace.boolean_no', 'No');
  }
  if (typeof rawValue === 'object') return JSON.stringify(rawValue);
  return String(rawValue);
}

const INTERACTIVE_CARD_TARGET_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'label',
  'option',
  'select',
  'textarea',
  'summary',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isNestedInteractiveCardTarget(
  target: EventTarget | null,
  currentTarget: HTMLElement,
): boolean {
  if (!(target instanceof Element) || target === currentTarget) return false;
  const interactiveTarget = target.closest<HTMLElement>(INTERACTIVE_CARD_TARGET_SELECTOR);
  return Boolean(
    interactiveTarget
    && interactiveTarget !== currentTarget
    && currentTarget.contains(interactiveTarget),
  );
}

function renderFallbackCard<T extends object>({
  row,
  index,
  columns,
  actions,
  href,
  activationLabel,
  onActivate,
  t,
}: {
  row: T;
  index: number;
  columns: ColumnDef<T>[];
  actions?: (row: T, index: number) => ReactNode;
  href?: string;
  activationLabel: string;
  onActivate?: () => void;
  t: SurfaceTranslator;
}): ReactNode {
  const visibleColumns = columns
    .filter((column) => column.visible !== false)
    .slice(0, 6);
  const [primaryColumn, ...detailColumns] = visibleColumns;
  const primaryValue = primaryColumn
    ? getColumnValue(row, primaryColumn, index, t)
    : t('collection_workspace.record_number', 'Record {index}', { index: index + 1 });
  const actionContent = actions?.(row, index);

  return (
    <Box
      className="ds-collection-render-dispatch__fallback-card"
      data-part="fallback-card"
    >
      <Box className="ds-collection-render-dispatch__fallback-heading">
        <Text
          className="ds-collection-render-dispatch__muted-text"
          data-part="fallback-label"
          size="xs"
        >
          {primaryColumn
            ? getColumnHeader(primaryColumn as ColumnDef<unknown>)
            : t('collection_workspace.record_label', 'Record')}
        </Text>
        <Text
          className="ds-collection-render-dispatch__fallback-title"
          data-part="title"
          weight="semibold"
        >
          {primaryValue}
        </Text>
      </Box>

      <Box
        className="ds-collection-render-dispatch__fallback-grid"
        data-part="fallback-grid"
      >
        {detailColumns.slice(0, 4).map((column) => (
          <Box key={column.key} className="ds-collection-render-dispatch__fallback-field">
            <Text
              className="ds-collection-render-dispatch__muted-text"
              data-part="fallback-label"
              size="xs"
            >
              {getColumnHeader(column as ColumnDef<unknown>)}
            </Text>
            <Text
              className="ds-collection-render-dispatch__fallback-value"
              data-part="fallback-value"
              size="sm"
            >
              {getColumnValue(row, column, index, t)}
            </Text>
          </Box>
        ))}
      </Box>

      {actionContent || href || onActivate ? (
        <Box
          className="ds-collection-render-dispatch__fallback-actions"
          data-part="fallback-actions"
          onClick={(event) => event.stopPropagation()}
        >
          {actionContent}
          {href ? (
            <a
              className="ds-collection-render-dispatch__fallback-open-link"
              data-part="fallback-open-link"
              href={href}
              aria-label={activationLabel}
            >
              {t('collection_workspace.open_details', 'Open details')}
            </a>
          ) : onActivate ? (
            <Button
              variant="ghost"
              size="sm"
              className="ds-collection-render-dispatch__fallback-open-link"
              data-part="fallback-open-link"
              aria-label={activationLabel}
              onClick={onActivate}
            >
              {t('collection_workspace.open_details', 'Open details')}
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

function CollectionPaginationFooter({
  pagination,
}: {
  pagination?: PaginationConfig | false;
}): React.ReactElement | null {
  const { tSurfaceOr } = useSurfaceTranslations();
  if (!pagination) return null;

  const pageSize = Math.max(1, pagination.pageSize);
  const total = Math.max(0, pagination.total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, pagination.current), totalPages);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);
  const pageSizeOptions = pagination.pageSizeOptions?.length
    ? pagination.pageSizeOptions
    : [pageSize];
  const canGoBack = current > 1;
  const canGoForward = current < totalPages;

  return (
    <Box
      className="ds-surface ds-collection-render-dispatch ds-collection-render-dispatch__pagination"
      data-part="pagination"
    >
      <Text
        className="ds-collection-render-dispatch__muted-text"
        size="sm"
      >
        {total === 0
          ? tSurfaceOr('collection_workspace.results_zero', '0 results')
          : tSurfaceOr('collection_workspace.range_of', '{start}-{end} of {total}', {
              start,
              end,
              total: total.toLocaleString(),
            })}
      </Text>

      <Box
        className="ds-collection-render-dispatch__pagination-controls"
        data-part="pagination-controls"
      >
        <Button
          variant="default"
          size="sm"
          className="ds-collection-render-dispatch__pagination-prev"
          data-part="pagination-prev"
          data-disabled={canGoBack ? 'false' : 'true'}
          disabled={!canGoBack}
          onClick={() => pagination.onChange(current - 1, pageSize)}
          aria-label={tSurfaceOr('collection_workspace.pagination_prev_aria', 'Go to previous page')}
        >
          {tSurfaceOr('collection_workspace.pagination_previous', 'Previous')}
        </Button>
        <Text
          className="ds-collection-render-dispatch__muted-text"
          size="sm"
        >
          {tSurfaceOr('collection_workspace.page_of', 'Page {current} of {total}', {
            current,
            total: totalPages,
          })}
        </Text>
        <Button
          variant="default"
          size="sm"
          className="ds-collection-render-dispatch__pagination-next"
          data-part="pagination-next"
          data-disabled={canGoForward ? 'false' : 'true'}
          disabled={!canGoForward}
          onClick={() => pagination.onChange(current + 1, pageSize)}
          aria-label={tSurfaceOr('collection_workspace.pagination_next_aria', 'Go to next page')}
        >
          {tSurfaceOr('collection_workspace.pagination_next', 'Next')}
        </Button>
      </Box>

      {pageSizeOptions.length > 1 ? (
        <Box
          as="label"
          className="ds-collection-render-dispatch__page-size"
          data-part="page-size"
        >
          {tSurfaceOr('collection_workspace.rows_unit', 'Rows')}
          <Select
            size="sm"
            className="ds-collection-render-dispatch__page-size-select"
            aria-label={tSurfaceOr('collection_workspace.rows_per_page', 'Rows per page')}
            value={pageSize}
            options={pageSizeOptions.map((option) => ({
              value: option,
              label: String(option),
            }))}
            onChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              const parsed = Number(next);
              if (Number.isFinite(parsed) && parsed > 0) pagination.onChange(1, parsed);
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
}

function CardsIncrementalFooter({
  pagination,
  visibleCount,
}: {
  pagination: PaginationConfig;
  visibleCount: number;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const sentinelRef = React.useRef<HTMLElement | null>(null);
  const loadingRef = React.useRef(false);
  const pageSize = Math.max(1, pagination.pageSize);
  const total = Math.max(0, pagination.total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, pagination.current), totalPages);
  const visible = Math.min(Math.max(0, visibleCount), total);
  const canLoadMore = visible < total && current < totalPages;

  const loadMore = React.useCallback(() => {
    if (!canLoadMore || loadingRef.current) return;
    loadingRef.current = true;
    pagination.onChange(current + 1, pageSize);
    window.setTimeout(() => {
      loadingRef.current = false;
    }, 220);
  }, [canLoadMore, current, pageSize, pagination]);

  React.useEffect(() => {
    loadingRef.current = false;
  }, [current, visible]);

  React.useEffect(() => {
    if (!canLoadMore) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: '420px 0px 420px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, loadMore]);

  return (
    <Box
      className="ds-surface ds-collection-render-dispatch ds-collection-render-dispatch__incremental-footer"
      data-part="incremental-footer"
      data-can-load-more={canLoadMore ? 'true' : 'false'}
      ref={sentinelRef}
    >
      <Text
        className="ds-collection-render-dispatch__incremental-count"
        data-part="incremental-count"
        size="xs"
      >
        {total === 0
          ? tSurfaceOr('collection_workspace.results_zero', '0 results')
          : tSurfaceOr('collection_workspace.cards_showing', 'Showing 1-{visible} of {total}', {
              visible,
              total: total.toLocaleString(),
            })}
      </Text>
      {canLoadMore ? (
        <Button
          variant="default"
          size="sm"
          className="ds-collection-render-dispatch__load-more"
          data-part="load-more"
          onClick={loadMore}
        >
          {tSurfaceOr('collection_workspace.load_more', 'Load more')}
        </Button>
      ) : (
        <Text
          className="ds-collection-render-dispatch__incremental-end"
          data-part="incremental-end"
          size="xs"
        >
          {tSurfaceOr('collection_workspace.end_of_cards', 'End of cards')}
        </Text>
      )}
    </Box>
  );
}

/** Number of skeleton cards rendered while the cards grid loads. */
const CARDS_SKELETON_COUNT = 6;

/**
 * Resolves the cards grid template. Kept as a single source so the loading
 * skeleton mirrors the ready grid exactly (no layout shift on swap). The
 * resolved template stays an inline style: instance column counts are true
 * per-instance geometry and tests pin the inline declaration.
 */
function resolveCardsGridTemplateColumns(
  cardColumns: number | 'auto' | undefined,
): string {
  if (cardColumns) {
    return cardColumns === 'auto'
      ? 'repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr))'
      : `repeat(${cardColumns}, minmax(0, 1fr))`;
  }
  return 'var(--ds-listing-grid-columns, repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr)))';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollectionRenderDispatch<T extends object>(
  props: CollectionRenderDispatchProps<T>,
): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const {
    viewMode,
    viewModes,
    data,
    columns,
    rowKey,
    loading,
    emptyState,
    error,
    access,
    capabilityRegistry,
    mobileCard,
    actions,
    onRowClick,
    rowHref,
    rowActivationLabel,
    focusEnabled,
    cardColumnsOverride,
  } = props;

  const createCardContext = (
    item: T,
    index: number,
  ): DataTableMobileCardContext<T> => {
    const itemKey = resolveKey(item, rowKey);
    const selectedKeys = props.selectedKeys ?? [];
    const selected = selectedKeys.includes(itemKey);

    return {
      item,
      index,
      rowKey: itemKey,
      selected,
      selectable: props.selectable ?? false,
      toggleSelection: (event) => {
        event?.stopPropagation?.();
        if (!props.selectable) return;

        const nextKeys = selected
          ? selectedKeys.filter((key) => key !== itemKey)
          : [...selectedKeys, itemKey];
        const selectedItems = data.filter((candidate) =>
          nextKeys.includes(resolveKey(candidate, rowKey)),
        );

        props.onSelectionChange?.(nextKeys, selectedItems);
      },
      open: (event) => {
        event?.stopPropagation?.();
        onRowClick?.(item, index);
      },
      actions: actions?.(item, index),
    };
  };

  // Error state
  if (error) {
    return (
      <CollectionErrorAnatomy
        access={access}
        actions={actions}
        capabilityRegistry={capabilityRegistry}
        columns={columns}
        error={error}
        viewMode={viewMode}
      />
    );
  }

  // ── Grid mode ──
  if (viewMode === 'grid' && viewModes?.grid) {
    const gc = viewModes.grid;
    // Grid uses cards config renderCard if grid doesn't have its own
    const cardRenderer = viewModes.cards?.renderCard ?? mobileCard;
    if (!cardRenderer) {
      return (
        <Box
          className="ds-surface ds-collection-render-dispatch"
          data-part="root"
          data-view-mode="grid"
          data-state="error"
          padding="lg"
        >
          <Text className="ds-collection-render-dispatch__muted-text">
            {tSurfaceOr(
              'collection_workspace.grid_renderer_missing',
              'Grid mode requires a card renderer (viewModes.cards.renderCard or mobileCard)',
            )}
          </Text>
        </Box>
      );
    }
    return (
      <PatternGridView<T>
        className="ds-surface ds-collection-render-dispatch"
        data={data}
        renderCard={(item, index) => cardRenderer(item, index, createCardContext(item, index))}
        rowKey={rowKey}
        columns={gc.columns}
        minColumnWidth={typeof gc.minCardWidth === 'number' ? gc.minCardWidth : undefined}
        gap={gc.gap}
        selectable={props.selectable}
        selectedKeys={props.selectedKeys}
        onSelectionChange={props.onSelectionChange}
        pagination={props.pagination || undefined}
        emptyState={emptyState}
        loading={loading}
      />
    );
  }

  // ── Gallery mode ──
  if (viewMode === 'gallery' && viewModes?.gallery) {
    const gl = viewModes.gallery;
    return (
      <PatternGalleryView<T>
        className="ds-surface ds-collection-render-dispatch"
        data={data}
        imageField={gl.imageField}
        captionField={gl.captionField}
        renderCard={gl.renderItem}
        rowKey={rowKey}
        columns={gl.columns}
        aspectRatio={gl.aspectRatio}
        minColumnWidth={typeof gl.minThumbnailWidth === 'number' ? gl.minThumbnailWidth : undefined}
        selectable={props.selectable}
        selectedKeys={props.selectedKeys}
        onSelectionChange={props.onSelectionChange}
        onItemClick={gl.onItemClick ?? onRowClick}
        pagination={props.pagination || undefined}
        emptyState={emptyState}
        loading={loading}
      />
    );
  }

  // ── Kanban mode ──
  // Composes PatternKanbanBoard (the sanctioned kanban pattern): grouping
  // adapts CollectionKanbanConfig to KanbanColumnDef; card movement, WIP
  // limits, column accents, add-item and FLIP motion are pattern-owned.
  if (viewMode === 'kanban' && viewModes?.kanban) {
    const kc = viewModes.kanban;
    const groupField = kc.groupByField;

    // Group data by field value
    const groupMap = new Map<string, T[]>();
    for (const item of data) {
      const groupValue = String(
        readCollectionRecordValue(item, groupField)
          ?? tSurfaceOr('collection_workspace.uncategorized', 'Uncategorized'),
      );
      if (!groupMap.has(groupValue)) groupMap.set(groupValue, []);
      groupMap.get(groupValue)!.push(item);
    }

    // Use static column definitions if provided, otherwise auto-detect from data
    // Normalize to the exact KanbanColumnDef<T> contract: the union of
    // static defs and auto-detected defs is widened once via annotation
    // (not a cast), and optional color/limit are set by mutation so no
    // `{}` spread ever reaches the pattern.
    const columnDefs: Array<{ id: string; title: string; color?: string; limit?: number }> =
      kc.columns ?? Array.from(groupMap.keys()).map((id) => ({ id, title: id }));
    const kanbanColumns: KanbanColumnDef<T>[] = columnDefs.map((col) => {
      const column: KanbanColumnDef<T> = {
        id: col.id,
        title: col.title,
        items: groupMap.get(col.id) ?? [],
      };
      if (col.color) column.color = col.color;
      if (col.limit !== undefined) column.limit = col.limit;
      return column;
    });

    return (
      <PatternKanbanBoard
        className="ds-surface ds-collection-render-dispatch"
        columns={kanbanColumns}
        renderCard={(item, columnId) =>
          kc.renderCard?.(item, columnId) ?? mobileCard?.(
            item,
            data.indexOf(item),
            createCardContext(item, data.indexOf(item)),
          ) ?? (
            <Text className="ds-collection-render-dispatch__muted-text">
              {tSurfaceOr('collection_workspace.no_card_renderer', 'No card renderer')}
            </Text>
          )
        }
        renderColumnHeader={
          kc.renderColumnHeader
            ? (column, itemCount) => kc.renderColumnHeader!(column.id, column.title, itemCount)
            : undefined
        }
        itemKey={(item) => resolveKey(item, rowKey)}
        onItemMove={kc.onCardMove ?? (() => {})}
        onItemClick={onRowClick ? (item) => onRowClick(item, data.indexOf(item)) : undefined}
        emptyColumn={
          <Text className="ds-collection-render-dispatch__muted-text" size="sm">
            {tSurfaceOr('collection_workspace.kanban_empty_column', 'No items')}
          </Text>
        }
        columnGap={kc.columnGap}
        columnMinWidth={kc.columnMinWidth}
        onAddItem={kc.onAddItem}
        addItemLabel={kc.addItemLabel}
        loading={Boolean(loading && data.length === 0)}
      />
    );
  }

  // ── Cards mode ──
  if (viewMode === 'cards') {
    const cardRenderer = viewModes?.cards?.renderCard ?? mobileCard;
    const cardColumns = cardColumnsOverride ?? viewModes?.cards?.columns;
    const gridTemplateColumns = resolveCardsGridTemplateColumns(cardColumns);
    const gridInstanceStyle = {
      gridTemplateColumns,
      gap: viewModes?.cards?.gap ?? 'var(--ds-listing-grid-gap, var(--ds-spacing-4, 16px))',
      ['--ds-listing-grid-min-card-width' as string]:
        viewModes?.cards?.minCardWidth
          ? typeof viewModes.cards.minCardWidth === 'number'
            ? `${viewModes.cards.minCardWidth}px`
            : viewModes.cards.minCardWidth
          : undefined,
    } as React.CSSProperties;

    if (loading && data.length === 0) {
      return (
        <Box
          className="ds-surface ds-collection-render-dispatch"
          data-part="root"
          data-view-mode="cards"
          data-state="loading"
          aria-busy="true"
          style={gridInstanceStyle}
        >
          <Text
            as="span"
            className="ds-collection-render-dispatch__loading-label"
            data-part="loading-label"
          >
            {tSurfaceOr('collection_workspace.loading_label', 'Loading…')}
          </Text>
          {Array.from({ length: CARDS_SKELETON_COUNT }, (_, skeletonIndex) => (
            <Box
              key={skeletonIndex}
              className="ds-collection-render-dispatch__skeleton-card"
              data-part="skeleton-card"
              aria-hidden="true"
            >
              <Skeleton variant="text" rows={3} active />
            </Box>
          ))}
        </Box>
      );
    }
    if (data.length === 0) {
      return (
        <Box
          className="ds-surface ds-collection-render-dispatch"
          data-part="root"
          data-view-mode="cards"
          data-state="empty"
        >
          {emptyState ?? <SurfaceEmptyState />}
        </Box>
      );
    }
    const explicitColumnCount = typeof cardColumns === 'number' ? cardColumns : undefined;
    const hasLoneFinalCard = Boolean(
      explicitColumnCount &&
      explicitColumnCount > 1 &&
      data.length > explicitColumnCount &&
      data.length % explicitColumnCount === 1,
    );

    return (
      <>
        <Box
          className="ds-surface ds-collection-render-dispatch"
          data-part="root"
          data-view-mode="cards"
          data-state="ready"
          style={gridInstanceStyle}
        >
          {data.map((item, i) => {
            const isLoneFinalCard = hasLoneFinalCard && i === data.length - 1;
            const href = rowHref?.(item, i);
            const activationLabel = rowActivationLabel?.(item, i) ?? `Open item ${i + 1}`;
            const hasActivation = Boolean(onRowClick);
            return (
            <Box
              className="ds-collection-render-dispatch__card-item"
              data-part="card-item"
              data-lone-final={isLoneFinalCard ? 'true' : 'false'}
              data-activatable={hasActivation ? 'true' : 'false'}
              data-href={href}
              key={resolveKey(item, rowKey)}
              onClick={(event) => {
                if (isNestedInteractiveCardTarget(event.target, event.currentTarget)) return;
                onRowClick?.(item, i);
              }}
            >
              {cardRenderer && hasActivation ? (
                href ? (
                  <a
                    className="ds-collection-render-dispatch__card-activation"
                    data-part="card-activation"
                    href={href}
                    aria-label={activationLabel}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {activationLabel}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="ds-collection-render-dispatch__card-activation"
                    data-part="card-activation"
                    aria-label={activationLabel}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRowClick?.(item, i);
                    }}
                  >
                    {activationLabel}
                  </button>
                )
              ) : null}
              {cardRenderer
                ? cardRenderer(item, i, createCardContext(item, i))
                : renderFallbackCard({
                    row: item,
                    index: i,
                    columns,
                    actions,
                    href,
                    activationLabel,
                    onActivate: onRowClick ? () => onRowClick(item, i) : undefined,
                    t: tSurfaceOr,
                  })}
            </Box>
            );
          })}
        </Box>
        {props.pagination && props.pagination.loadMode === 'incremental' ? (
          <CardsIncrementalFooter pagination={props.pagination} visibleCount={data.length} />
        ) : (
          <CollectionPaginationFooter pagination={props.pagination} />
        )}
      </>
    );
  }

  // ── Calendar mode ──
  // Composes PatternCalendarView: date-field mapping adapts the collection
  // rows into CalendarEvent entries; event activation keeps the workspace's
  // row-click contract (focus + preview rail parity).
  if (viewMode === 'calendar' && viewModes?.calendar) {
    const cal = viewModes.calendar;
    const resolveEventTitle = (item: T, index: number): string => {
      if (cal.titleField) {
        const titled = readCollectionRecordValue(item, cal.titleField);
        if (titled != null && String(titled).trim()) return String(titled);
      }
      for (const column of columns) {
        const value = readCollectionRecordValue(
          item,
          (column.accessorKey ?? column.key) as PropertyKey,
        );
        if (typeof value === 'string' && value.trim()) return value;
      }
      return resolveKey(item, rowKey) || String(index + 1);
    };
    const events: Array<CalendarEvent<T>> = data.map((item, index) => {
      const colorValue = cal.colorField
        ? readCollectionRecordValue(item, cal.colorField)
        : undefined;
      const event: CalendarEvent<T> = {
        id: resolveKey(item, rowKey) || String(index),
        title: resolveEventTitle(item, index),
        start: readCollectionRecordValue(item, cal.startField) as Date | string,
        end: cal.endField
          ? (readCollectionRecordValue(item, cal.endField) as Date | string | undefined)
          : undefined,
        allDay: cal.defaultAllDay,
        data: item,
      };
      if (typeof colorValue === 'string' && colorValue.trim()) {
        event.color = colorValue;
      }
      return event;
    });

    return (
      <PatternCalendarView
        className="ds-surface ds-collection-render-dispatch"
        events={events}
        view={cal.defaultView}
        loading={Boolean(loading && data.length === 0)}
        onDateClick={cal.onDateClick}
        onEventClick={
          onRowClick
            ? (event) => {
                if (event.data) onRowClick(event.data, data.indexOf(event.data));
              }
            : undefined
        }
        renderEvent={
          cal.renderEvent
            ? (event) => (event.data ? cal.renderEvent!(event.data, event) : null)
            : undefined
        }
      />
    );
  }

  // ── Default: Table mode ──
  return (
    <PatternDataTable<T>
      className="ds-surface ds-collection-render-dispatch"
      data={data}
      columns={columns}
      rowKey={rowKey}
      loading={loading}
      emptyState={emptyState}
      actions={props.actions}
      actionsColumnWidth={props.actionsColumnWidth}
      onRowClick={onRowClick}
      onRowDoubleClick={props.onRowDoubleClick}
      expandedRow={props.expandedRow}
      renderRow={props.renderRow}
      selectable={props.selectable}
      selectedKeys={props.selectedKeys}
      onSelectionChange={props.onSelectionChange}
      bulkActions={props.bulkActions}
      sorting={props.sorting}
      onSortChange={props.onSortChange}
      pagination={props.pagination}
      compact={props.compact}
      density={props.density}
      striped={props.striped}
      bordered={props.bordered}
      hoverable={props.hoverable ?? true}
      stickyHeader={props.stickyHeader}
      columnVisibility={props.columnVisibility}
      visibleColumns={props.visibleColumns}
      onVisibleColumnsChange={props.onVisibleColumnsChange}
      lockedColumns={props.lockedColumns}
      reorderable={props.reorderable}
      columnOrder={props.columnOrder}
      onColumnReorder={props.onColumnReorder}
      pinnedColumns={props.pinnedColumns}
      onPinChange={props.onPinChange}
      resizable={props.resizable}
      columnWidths={props.columnWidths}
      onColumnResize={props.onColumnResize}
      onCellEdit={props.onCellEdit}
      onCellEditStart={props.onCellEditStart}
      onCellEditCancel={props.onCellEditCancel}
      editingCell={props.editingCell}
      editTrigger={props.editTrigger}
      tabNavigation={props.tabNavigation}
      mobileCard={mobileCard}
      autoMobileCards={false}
    />
  );
}
