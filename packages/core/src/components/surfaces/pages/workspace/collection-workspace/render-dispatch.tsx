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
import type { ColumnDef } from '../../../../patterns/foundation/types';
import type { CollectionViewMode, CollectionViewModeConfigs } from '../../../foundation/contracts/collection';
import type { DensityKey } from '../../../../patterns/data/list-toolbar/ListToolbar.types';
import type { BulkAction } from '../../../../patterns/foundation/types';
import type { SortConfig, PaginationConfig, FilterDef } from '../../../../patterns/foundation/types';
import { PatternDataTable } from '../../../../patterns/data/data-table';
import { PatternGridView } from '../../../../patterns/data/grid-view';
import { PatternGalleryView } from '../../../../patterns/data/gallery-view';
import { Box } from '../../../../primitives/layout/Box';
import { Text } from '../../../../primitives/display/Typography';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CollectionRenderDispatchProps<T extends object> {
  viewMode: CollectionViewMode | string;
  viewModes?: CollectionViewModeConfigs<T>;
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: keyof T | ((row: T) => string);
  loading?: boolean;
  emptyState?: ReactNode;
  error?: ReactNode;

  // Table-specific props
  actions?: (row: T, index: number) => ReactNode;
  actionsColumnWidth?: number | string;
  onRowClick?: (row: T, index: number) => void;
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
  mobileCard?: (row: T, index: number) => ReactNode;

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
  return typeof rowKey === 'function' ? rowKey(item) : String(item[rowKey]);
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
    borderRadius: 'var(--ds-radius-md, 8px)',
    border: '1px solid var(--ds-color-border, #d4d4d8)',
    background: 'var(--ds-color-bg-primary, #fff)',
    color: 'var(--ds-color-text-primary, #18181b)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.45,
    cursor: 'not-allowed',
  };

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--ds-spacing-3, 12px)',
        flexWrap: 'wrap',
        padding: 'var(--ds-spacing-3, 12px) var(--ds-spacing-4, 16px)',
        marginTop: 'var(--ds-spacing-4, 16px)',
        borderRadius: 'var(--ds-radius-lg, 12px)',
        border: '1px solid var(--ds-color-border, #d4d4d8)',
        background: 'var(--ds-color-bg-primary, #fff)',
      }}
    >
      <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
        {start}-{end} of {total.toLocaleString()}
      </Text>

      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => pagination.onChange(current - 1, pageSize)}
          style={canGoBack ? buttonStyle : disabledButtonStyle}
          aria-label="Go to previous page"
        >
          Previous
        </button>
        <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
          Page {current} of {totalPages}
        </Text>
        <button
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--ds-color-text-muted)',
            fontSize: 13,
          }}
        >
          Rows
          <select
            value={pageSize}
            onChange={(event) => pagination.onChange(1, Number(event.currentTarget.value))}
            style={{
              height: 34,
              borderRadius: 'var(--ds-radius-md, 8px)',
              border: '1px solid var(--ds-color-border, #d4d4d8)',
              background: 'var(--ds-color-bg-primary, #fff)',
              color: 'var(--ds-color-text-primary, #18181b)',
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
    mobileCard,
    onRowClick,
    focusEnabled,
  } = props;

  // Error state
  if (error) {
    return <Box padding="lg">{error}</Box>;
  }

  // ── Grid mode ──
  if (viewMode === 'grid' && viewModes?.grid) {
    const gc = viewModes.grid;
    // Grid uses cards config renderCard if grid doesn't have its own
    const cardRenderer = viewModes.cards?.renderCard ?? mobileCard;
    if (!cardRenderer) {
      return <Box padding="lg"><Text style={{ color: 'var(--ds-color-text-muted)' }}>Grid mode requires a card renderer (viewModes.cards.renderCard or mobileCard)</Text></Box>;
    }
    return (
      <PatternGridView<T>
        data={data}
        renderCard={cardRenderer}
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
      const groupValue = String((item as Record<string, unknown>)[groupField] ?? 'Uncategorized');
      if (!groupMap.has(groupValue)) groupMap.set(groupValue, []);
      groupMap.get(groupValue)!.push(item);
    }

    // Use static column definitions if provided, otherwise auto-detect from data
    const columnDefs = kc.columns ?? Array.from(groupMap.keys()).map(id => ({ id, title: id }));

    return (
      <Box style={{
        display: 'flex',
        gap: kc.columnGap ?? 'var(--ds-spacing-4, 16px)',
        overflowX: 'auto',
        padding: '4px 0',
        minHeight: 200,
      }}>
        {columnDefs.map((col: { id: string; title: string }) => {
          const items = groupMap.get(col.id) ?? [];
          return (
            <Box
              key={col.id}
              style={{
                minWidth: kc.columnMinWidth ?? 280,
                maxWidth: 360,
                flex: '0 0 auto',
                background: 'var(--ds-color-bg-secondary, var(--ds-surface-inset))',
                borderRadius: 'var(--ds-radius-lg, 12px)',
                padding: 'var(--ds-spacing-3, 12px)',
              }}
            >
              <Box style={{
                marginBottom: 'var(--ds-spacing-3, 12px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                {kc.renderColumnHeader
                  ? kc.renderColumnHeader(col.id, col.title, items.length)
                  : (
                    <Text style={{ fontWeight: 600, fontSize: 'var(--ds-font-size-sm, 13px)' }}>
                      {col.title} <span style={{ color: 'var(--ds-color-text-muted)', fontWeight: 400 }}>({items.length})</span>
                    </Text>
                  )
                }
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2, 8px)' }}>
                {items.length === 0 && (
                  <Text style={{ color: 'var(--ds-color-text-disabled)', fontSize: 12, textAlign: 'center' as const, padding: 16 }}>
                    No items
                  </Text>
                )}
                {items.map((item) => (
                  <Box key={resolveKey(item, rowKey)}>
                    {kc.renderCard?.(item, col.id) ?? mobileCard?.(item, 0) ?? (
                      <Text style={{ color: 'var(--ds-color-text-muted)' }}>No card renderer</Text>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
        {loading && data.length === 0 && (
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 32 }}>
            <Text style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</Text>
          </Box>
        )}
      </Box>
    );
  }

  // ── Cards mode (legacy inline grid with mobileCard) ──
  if (viewMode === 'cards' && mobileCard) {
    if (loading && data.length === 0) {
      return (
        <Box style={{
          padding: '32px 20px',
          borderRadius: 'var(--ds-collection-card-radius, var(--ds-radius-xl, 24px))',
          border: '1px solid var(--ds-listing-grid-empty-border, var(--ds-collection-card-border, var(--ds-color-border)))',
          background: 'var(--ds-listing-grid-empty-bg, var(--ds-collection-card-bg, var(--ds-card-bg, var(--ds-surface-card))))',
        }}>
          <Text style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</Text>
        </Box>
      );
    }
    if (data.length === 0) {
      return (
        <Box style={{
          borderRadius: 'var(--ds-collection-card-radius, var(--ds-radius-xl, 24px))',
          border: '1px solid var(--ds-listing-grid-empty-border, var(--ds-collection-card-border, var(--ds-color-border)))',
          background: 'var(--ds-listing-grid-empty-bg, var(--ds-collection-card-bg, var(--ds-card-bg, var(--ds-surface-card))))',
          overflow: 'hidden',
        }}>
          {emptyState ?? (
            <Box style={{ padding: '32px 20px' }}>
              <Text style={{ color: 'var(--ds-color-text-muted)' }}>No data</Text>
            </Box>
          )}
        </Box>
      );
    }
    return (
      <>
        <Box style={{
          display: 'grid',
          gridTemplateColumns: viewModes?.cards?.columns
            ? viewModes.cards.columns === 'auto'
              ? 'repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr))'
              : `repeat(${viewModes.cards.columns}, 1fr)`
            : 'var(--ds-listing-grid-columns, repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr)))',
          gap: viewModes?.cards?.gap ?? 'var(--ds-listing-grid-gap, var(--ds-spacing-4, 16px))',
        }}>
          {data.map((item, i) => (
            <Box
              key={resolveKey(item, rowKey)}
              onClick={() => onRowClick?.(item, i)}
              style={{ cursor: focusEnabled || onRowClick ? 'pointer' : undefined }}
            >
              {viewModes?.cards?.renderCard
                ? viewModes.cards.renderCard(item, i)
                : mobileCard(item, i)
              }
            </Box>
          ))}
        </Box>
        {renderPaginationFooter(props.pagination)}
      </>
    );
  }

  // ── Calendar mode (placeholder - apps wire PatternCalendarView) ──
  if (viewMode === 'calendar' && viewModes?.calendar) {
    return (
      <Box style={{
        padding: 'var(--ds-spacing-6, 24px)',
        textAlign: 'center',
        border: '1px dashed var(--ds-color-border)',
        borderRadius: 'var(--ds-radius-lg, 12px)',
        color: 'var(--ds-color-text-muted)',
      }}>
        <Text>Calendar view: {data.length} items with date field "{String(viewModes.calendar.startField)}"</Text>
        <Text size="sm" style={{ marginTop: 8, color: 'var(--ds-color-text-disabled)' }}>
          Wire PatternCalendarView here for full calendar rendering
        </Text>
      </Box>
    );
  }

  // ── Default: Table mode ──
  return (
    <PatternDataTable<T>
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
