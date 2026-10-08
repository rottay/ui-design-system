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
import { hasSurfaceError } from '../../../../../runtime/helpers';
import { SurfaceEmptyState } from '../../../../../../structures/feedback/surface-lifecycle';
import { useFormatter } from '@/infrastructure/runtime/i18n';
import { useSurfaceTranslations } from '../../../../../../structures/foundation/chrome/runtime/i18n';
import type { DensityPosture } from '@/infrastructure/runtime/foundation/density';
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
import { Box } from '../../../../../../primitives/layout/box';
import { Text } from '../../../../../../primitives/display/typography';
import { Button } from '../../../../../../primitives/inputs/button';
import { NavLink } from '../../../../../../primitives/navigation/link';
import { Skeleton } from '../../../../../../primitives/feedback/skeleton';
import { readCollectionRecordValue, resolveKey } from './foundation';
import { CollectionErrorAnatomy } from './error-anatomy';
import {
  CARDS_SKELETON_COUNT,
  CardItem,
  isNestedInteractiveCardTarget,
  renderFallbackCard,
  resolveCardsGridTemplateColumns,
} from './cards';
import { CardsIncrementalFooter, CollectionPaginationFooter } from './footers';

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
  /** A caught value; a valid React ELEMENT is custom chrome, anything else is normalized. */
  error?: unknown;
  onRetry?: () => void | Promise<void>;
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
  density?: DensityPosture;
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
// Component
// ---------------------------------------------------------------------------

export function CollectionRenderDispatch<T extends object>(
  props: CollectionRenderDispatchProps<T>,
): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const format = useFormatter();
  const {
    viewMode,
    viewModes,
    data,
    columns,
    rowKey,
    loading,
    emptyState,
    error,
    onRetry,
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
  if (hasSurfaceError(error)) {
    return (
      <CollectionErrorAnatomy
        access={access}
        actions={actions}
        capabilityRegistry={capabilityRegistry}
        columns={columns}
        error={error}
        onRetry={onRetry}
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
        aspectRatio={gl.aspectRatio}
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
            <CardItem
              isLoneFinalCard={isLoneFinalCard}
              hasActivation={hasActivation}
              href={href}
              key={resolveKey(item, rowKey)}
              onActivate={(event) => {
                if (isNestedInteractiveCardTarget(event.target, event.currentTarget)) return;
                onRowClick?.(item, i);
              }}
            >
              {cardRenderer && hasActivation ? (
                href ? (
                  <NavLink
                    className="ds-collection-render-dispatch__card-activation"
                    data-part="card-activation"
                    underline={false}
                    href={href}
                    aria-label={activationLabel}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {activationLabel}
                  </NavLink>
                ) : (
                  <Button
                    className="ds-collection-render-dispatch__card-activation"
                    data-part="card-activation"
                    variant="ghost"
                    aria-label={activationLabel}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRowClick?.(item, i);
                    }}
                  >
                    {activationLabel}
                  </Button>
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
                    format,
                  })}
            </CardItem>
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
