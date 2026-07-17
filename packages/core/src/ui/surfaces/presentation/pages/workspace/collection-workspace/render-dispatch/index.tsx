/**
 * @fileoverview CollectionRenderDispatch - internal render mode router.
 *
 * Routes collection data to the correct pattern component based on the
 * active view mode: table, cards, grid, kanban, gallery, calendar.
 *
 * This component is internal to CollectionWorkspaceSurface and should
 * NOT be exported from the DS public API.
 */

'use client';

import React from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { CollectionViewMode, CollectionViewModeConfigs } from '../../../../../foundation/contracts/adaptive/collection';
import type {
  SurfaceAccessInput,
  SurfaceCapabilityRegistration,
} from '../../../../../foundation/contracts';
import {
  isAllSurfaceAccess,
  resolveSurfaceCapabilityRegistry,
} from '../../../../../runtime/helpers';
import { SurfaceCapabilityAnatomy } from '../../../../../runtime/helpers/states';
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
import { Box } from '../../../../../../primitives/layout/Box';
import { Text } from '../../../../../../primitives/display/Typography';

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
      ? [{ kind: 'action' as const, id: 'row-actions', label: 'Row actions' }]
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
      style={{ display: 'grid', gap: 'var(--ds-spacing-4, 16px)' }}
    >
      <Box data-part="error-state" aria-live="polite">
        {error}
      </Box>

      <SurfaceCapabilityAnatomy
        capabilities={capabilities}
        ariaLabel="Registered collection capabilities"
      />
    </Box>
  );
}

function getColumnValue<T extends object>(
  row: T,
  column: ColumnDef<T>,
  index: number,
): ReactNode {
  const rawValue = column.accessorFn
    ? column.accessorFn(row)
    : column.accessorKey
      ? readCollectionRecordValue(row, column.accessorKey)
      : readCollectionRecordValue(row, column.key);

  if (column.render) {
    return column.render(rawValue, row, index);
  }

  if (rawValue == null || rawValue === '') return 'Not set';
  if (rawValue instanceof Date) return rawValue.toLocaleDateString();
  if (typeof rawValue === 'boolean') return rawValue ? 'Yes' : 'No';
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
}: {
  row: T;
  index: number;
  columns: ColumnDef<T>[];
  actions?: (row: T, index: number) => ReactNode;
  href?: string;
  activationLabel: string;
  onActivate?: () => void;
}): ReactNode {
  const visibleColumns = columns
    .filter((column) => column.visible !== false)
    .slice(0, 6);
  const [primaryColumn, ...detailColumns] = visibleColumns;
  const primaryValue = primaryColumn
    ? getColumnValue(row, primaryColumn, index)
    : `Record ${index + 1}`;
  const actionContent = actions?.(row, index);

  return (
    <Box
      className="ds-collection-render-dispatch__fallback-card"
      data-part="fallback-card"
      style={{
        minHeight: 172,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 14,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Box style={{ minWidth: 0 }}>
        <Text
          className="ds-collection-render-dispatch__muted-text"
          data-part="muted-text"
          size="xs"
          style={{
            display: 'block',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {primaryColumn ? getColumnHeader(primaryColumn as ColumnDef<unknown>) : 'Record'}
        </Text>
        <Text
          className="ds-collection-render-dispatch__fallback-title"
          data-part="title"
          weight="semibold"
          style={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {primaryValue}
        </Text>
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px 14px',
          minWidth: 0,
        }}
      >
        {detailColumns.slice(0, 4).map((column) => (
          <Box key={column.key} style={{ minWidth: 0 }}>
            <Text
              className="ds-collection-render-dispatch__muted-text"
              data-part="muted-text"
              size="xs"
              style={{
                display: 'block',
                fontSize: 10,
                fontWeight: 750,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              {getColumnHeader(column as ColumnDef<unknown>)}
            </Text>
            <Text
              className="ds-collection-render-dispatch__fallback-value"
              data-part="fallback-value"
              size="sm"
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {getColumnValue(row, column, index)}
            </Text>
          </Box>
        ))}
      </Box>

      {actionContent || href || onActivate ? (
        <Box
          className="ds-collection-render-dispatch__fallback-actions"
          data-part="fallback-actions"
          onClick={(event) => event.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 'auto',
            paddingTop: 10,
          }}
        >
          {actionContent}
          {href ? (
            <a
              className="ds-collection-render-dispatch__fallback-open-link"
              data-part="fallback-open-link"
              href={href}
              aria-label={activationLabel}
            >
              Open details
            </a>
          ) : onActivate ? (
            <button
              type="button"
              className="ds-collection-render-dispatch__fallback-open-link"
              data-part="fallback-open-link"
              aria-label={activationLabel}
              onClick={onActivate}
            >
              Open details
            </button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

function renderPaginationFooter(pagination?: PaginationConfig | false): ReactNode {
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

  const buttonStyle: React.CSSProperties = {
    minWidth: 34,
    height: 34,
    padding: '0 12px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    cursor: 'not-allowed',
  };

  return (
    <Box
      className="ds-surface ds-collection-render-dispatch ds-collection-render-dispatch__pagination"
      data-part="pagination"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--ds-spacing-3, 12px)',
        flexWrap: 'wrap',
        padding: 'var(--ds-spacing-3, 12px) var(--ds-spacing-4, 16px)',
        marginTop: 'var(--ds-spacing-4, 16px)',
      }}
    >
      <Text
        className="ds-collection-render-dispatch__muted-text"
        data-part="muted-text"
        size="sm"
      >
        {start}-{end} of {total.toLocaleString()}
      </Text>

      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="ds-collection-render-dispatch__pagination-prev"
          data-part="pagination-prev"
          data-disabled={canGoBack ? 'false' : 'true'}
          type="button"
          disabled={!canGoBack}
          onClick={() => pagination.onChange(current - 1, pageSize)}
          style={canGoBack ? buttonStyle : disabledButtonStyle}
          aria-label="Go to previous page"
        >
          Previous
        </button>
        <Text
          className="ds-collection-render-dispatch__muted-text"
          data-part="muted-text"
          size="sm"
        >
          Page {current} of {totalPages}
        </Text>
        <button
          className="ds-collection-render-dispatch__pagination-next"
          data-part="pagination-next"
          data-disabled={canGoForward ? 'false' : 'true'}
          type="button"
          disabled={!canGoForward}
          onClick={() => pagination.onChange(current + 1, pageSize)}
          style={canGoForward ? buttonStyle : disabledButtonStyle}
          aria-label="Go to next page"
        >
          Next
        </button>
      </Box>

      {pageSizeOptions.length > 1 ? (
        <label
          className="ds-collection-render-dispatch__page-size"
          data-part="page-size"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
          }}
        >
          Rows
          <select
            className="ds-collection-render-dispatch__page-size-select"
            data-part="page-size-select"
            value={pageSize}
            onChange={(event) => pagination.onChange(1, Number(event.currentTarget.value))}
            style={{
              height: 34,
              padding: '0 28px 0 10px',
            }}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        minHeight: 54,
        marginTop: 'var(--ds-spacing-4, 16px)',
        fontSize: 12,
        fontWeight: 650,
      }}
    >
      <Text
        className="ds-collection-render-dispatch__incremental-count"
        data-part="incremental-count"
        size="xs"
        style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
      >
        {total === 0 ? '0 results' : `Showing 1-${visible} of ${total.toLocaleString()}`}
      </Text>
      {canLoadMore ? (
        <button
          className="ds-collection-render-dispatch__load-more"
          data-part="load-more"
          type="button"
          onClick={loadMore}
          style={{
            minHeight: 32,
            padding: '0 13px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 760,
          }}
        >
          Load more
        </button>
      ) : (
        <Text
          className="ds-collection-render-dispatch__incremental-end"
          data-part="incremental-end"
          size="xs"
          style={{ fontSize: 12 }}
        >
          End of cards
        </Text>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollectionRenderDispatch<T extends object>(
  props: CollectionRenderDispatchProps<T>,
): React.ReactElement {
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
      return <Box className="ds-surface ds-collection-render-dispatch" data-part="root" data-view-mode="grid" data-state="error" padding="lg"><Text className="ds-collection-render-dispatch__muted-text" data-part="muted-text">Grid mode requires a card renderer (viewModes.cards.renderCard or mobileCard)</Text></Box>;
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
  if (viewMode === 'kanban' && viewModes?.kanban) {
    const kc = viewModes.kanban;
    const groupField = kc.groupByField;

    // Group data by field value
    const groupMap = new Map<string, T[]>();
    for (const item of data) {
      const groupValue = String(readCollectionRecordValue(item, groupField) ?? 'Uncategorized');
      if (!groupMap.has(groupValue)) groupMap.set(groupValue, []);
      groupMap.get(groupValue)!.push(item);
    }

    // Use static column definitions if provided, otherwise auto-detect from data
    const columnDefs = kc.columns ?? Array.from(groupMap.keys()).map(id => ({ id, title: id }));

    return (
      <Box
        className="ds-surface ds-collection-render-dispatch"
        data-part="root"
        data-view-mode="kanban"
        data-loading={loading ? 'true' : 'false'}
        style={{
          display: 'flex',
          gap: kc.columnGap ?? 'var(--ds-spacing-4, 16px)',
          overflowX: 'auto',
          padding: '4px 0',
          minHeight: 200,
        }}
      >
        {columnDefs.map((col: { id: string; title: string }) => {
          const items = groupMap.get(col.id) ?? [];
          return (
            <Box
              className="ds-collection-render-dispatch__kanban-column"
              data-part="kanban-column"
              data-column-id={col.id}
              key={col.id}
              style={{
                minWidth: kc.columnMinWidth ?? 280,
                maxWidth: 360,
                flex: '0 0 auto',
                padding: 'var(--ds-spacing-3, 12px)',
              }}
            >
              <Box
                className="ds-collection-render-dispatch__kanban-header"
                data-part="kanban-header"
                style={{
                  marginBottom: 'var(--ds-spacing-3, 12px)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {kc.renderColumnHeader
                  ? kc.renderColumnHeader(col.id, col.title, items.length)
                  : (
                    <Text style={{ fontWeight: 600, fontSize: 'var(--ds-font-size-sm, 14px)' }}>
                      {col.title} <span className="ds-collection-render-dispatch__kanban-count" data-part="kanban-count" style={{ fontWeight: 400 }}>({items.length})</span>
                    </Text>
                  )
                }
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2, 8px)' }}>
                {items.length === 0 && (
                  <Text className="ds-collection-render-dispatch__muted-text" data-part="muted-text" data-tone="disabled" style={{ fontSize: 12, textAlign: 'center' as const, padding: 16 }}>
                    No items
                  </Text>
                )}
                {items.map((item) => (
                  <Box key={resolveKey(item, rowKey)}>
                    {kc.renderCard?.(item, col.id) ?? mobileCard?.(
                      item,
                      data.indexOf(item),
                      createCardContext(item, data.indexOf(item)),
                    ) ?? (
                      <Text className="ds-collection-render-dispatch__muted-text" data-part="muted-text">No card renderer</Text>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
        {loading && data.length === 0 && (
          <Box className="ds-collection-render-dispatch__loading-state" data-part="loading-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 32 }}>
            <Text className="ds-collection-render-dispatch__muted-text" data-part="muted-text">Loading...</Text>
          </Box>
        )}
      </Box>
    );
  }

  // ── Cards mode ──
  if (viewMode === 'cards') {
    const cardRenderer = viewModes?.cards?.renderCard ?? mobileCard;

    if (loading && data.length === 0) {
      return (
        <Box
          className="ds-surface ds-collection-render-dispatch"
          data-part="root"
          data-view-mode="cards"
          data-state="loading"
          style={{
            padding: '32px 20px',
          }}
        >
          <Text className="ds-collection-render-dispatch__muted-text" data-part="muted-text">Loading...</Text>
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
          style={{
            overflow: 'hidden',
          }}
        >
          {emptyState ?? (
            <Box className="ds-collection-render-dispatch__empty-state" data-part="empty-state" style={{ padding: '32px 20px' }}>
              <Text className="ds-collection-render-dispatch__muted-text" data-part="muted-text">No data</Text>
            </Box>
          )}
        </Box>
      );
    }
    const cardColumns = cardColumnsOverride ?? viewModes?.cards?.columns;
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
          style={{
            display: 'grid',
            gridTemplateColumns: cardColumns
              ? cardColumns === 'auto'
                ? 'repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr))'
                : `repeat(${cardColumns}, minmax(0, 1fr))`
              : 'var(--ds-listing-grid-columns, repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr)))',
            gap: viewModes?.cards?.gap ?? 'var(--ds-listing-grid-gap, var(--ds-spacing-4, 16px))',
            padding: '1px 1px 8px',
            boxSizing: 'border-box',
            alignItems: 'stretch',
            ['--ds-listing-grid-min-card-width' as string]:
              viewModes?.cards?.minCardWidth
                ? typeof viewModes.cards.minCardWidth === 'number'
                  ? `${viewModes.cards.minCardWidth}px`
                  : viewModes.cards.minCardWidth
                : undefined,
          } as React.CSSProperties}
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
              style={{
                cursor: focusEnabled || onRowClick ? 'pointer' : undefined,
                gridColumn: isLoneFinalCard ? '1 / -1' : undefined,
                minWidth: 0,
                height: '100%',
                position: 'relative',
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
                  })}
            </Box>
            );
          })}
        </Box>
        {props.pagination && props.pagination.loadMode === 'incremental' ? (
          <CardsIncrementalFooter pagination={props.pagination} visibleCount={data.length} />
        ) : (
          renderPaginationFooter(props.pagination)
        )}
      </>
    );
  }

  // ── Calendar mode (placeholder - apps wire PatternCalendarView) ──
  if (viewMode === 'calendar' && viewModes?.calendar) {
    return (
      <Box
        className="ds-surface ds-collection-render-dispatch"
        data-part="root"
        data-view-mode="calendar"
        style={{
          padding: 'var(--ds-spacing-6, 24px)',
          textAlign: 'center',
        }}
      >
        <Text>Calendar view: {data.length} items with date field "{String(viewModes.calendar.startField)}"</Text>
        <Text className="ds-collection-render-dispatch__muted-text" data-part="muted-text" data-tone="disabled" size="sm" style={{ marginTop: 8 }}>
          Wire PatternCalendarView here for full calendar rendering
        </Text>
      </Box>
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
    />
  );
}
