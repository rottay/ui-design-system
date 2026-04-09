/**
 * @fileoverview CollectionWorkspaceSurface - unified collection screen.
 *
 * Composes the shared workspace contract with patterns to create a
 * full collection screen: toolbar + filters + saved views + table/cards + bulk actions.
 *
 * This surface replaces ad-hoc composition in apps and provides a standard
 * workspace layout that all collection-oriented screens can use.
 */

import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '../../../../patterns/types';
import type { CollectionWorkspaceConfig } from '../../../foundation/contracts/collection';
import type { DensityKey, ViewMode } from '../../../../patterns/list-toolbar/ListToolbar.types';
import { useCollectionWorkspace } from '../../../foundation/hooks/useCollectionWorkspace';
import { PatternDataTable } from '../../../../patterns/data-table';
import { PatternFilterPanel } from '../../../../patterns/filter-panel';
import { PatternSavedViewsBar } from '../../../../patterns/saved-views';
import { PatternListToolbar } from '../../../../patterns/list-toolbar';
import { Box } from '../../../../primitives/layout/Box';
import { Stack } from '../../../../primitives/layout/Stack';
import { Flex } from '../../../../primitives/layout/Flex';
import { Text } from '../../../../primitives/display/Typography';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CollectionWorkspaceSurfaceProps<T extends object> extends CollectionWorkspaceConfig<T> {
  /** Page title shown at the top. */
  title: string;
  /** Subtitle or description below the title. */
  subtitle?: string;

  /** Column definitions (for table view). */
  columns: ColumnDef<T>[];

  /** Row key accessor. */
  rowKey: keyof T | ((row: T) => string);

  /** Per-row actions. */
  actions?: (row: T, index: number) => ReactNode;

  /** Row click handler. */
  onRowClick?: (row: T, index: number) => void;

  /** Slot rendered above the toolbar. */
  headerSlot?: ReactNode;
  /** Slot rendered below the data area. */
  footerSlot?: ReactNode;

  /** Mobile card renderer (when viewMode is 'cards'). */
  mobileCard?: (row: T, index: number) => ReactNode;

  /** Default view mode. */
  defaultViewMode?: 'table' | 'cards';

  /** Primary CTA shown in the toolbar. */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };

  /** Optional icon displayed next to the title in the toolbar. */
  icon?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollectionWorkspaceSurface<T extends object>(props: CollectionWorkspaceSurfaceProps<T>) {
  const {
    title,
    subtitle,
    columns,
    rowKey,
    actions,
    onRowClick,
    headerSlot,
    footerSlot,
    mobileCard,
    defaultViewMode = 'table',
    primaryAction,
    icon,
    // Spread workspace config
    controls,
    behavior,
    presentation,
    data,
    loading,
    error,
    emptyState,
  } = props;

  const workspace = useCollectionWorkspace({
    config: { controls, behavior, presentation, data, columns },
    defaultViewMode,
  });

  // Resolve density for DataTable
  const density: DensityKey = controls?.density?.value ?? 'comfortable';
  const compact = density === 'compact';

  // Preview rail
  const showPreviewRail = behavior?.previewRail?.enabled && behavior.previewRail.render;

  // Whether to show the toolbar row
  const showToolbar =
    controls?.search?.enabled ||
    controls?.viewMode?.enabled ||
    controls?.density?.enabled ||
    controls?.export?.enabled;

  // Map between workspace view mode strings ('table'/'cards') and
  // ListToolbar's ViewMode union ('list'/'cards').
  const toolbarViewMode: ViewMode =
    workspace.activeViewMode === 'table' ? 'list' : 'cards';

  const handleViewModeChange = useMemo(
    () => (mode: ViewMode) => {
      workspace.setViewMode(mode === 'list' ? 'table' : mode);
    },
    [workspace.setViewMode],
  );

  // Build export handler -- ListToolbar expects a simple () => void.
  // When formats are configured we call onExport with the first format;
  // for multi-format scenarios consumers should provide their own handler.
  const handleExport = useMemo(() => {
    if (!controls?.export?.enabled || !controls.export.onExport) return undefined;
    const fmt = controls.export.formats?.[0] ?? 'csv';
    return () => controls.export!.onExport!(fmt);
  }, [controls?.export?.enabled, controls?.export?.onExport, controls?.export?.formats]);

  return (
    <Stack spacing="md" style={{ maxWidth: presentation?.maxWidth }}>
      {/* Header slot */}
      {headerSlot}

      {/* Title bar (shown only when toolbar is hidden to avoid duplicate titles) */}
      {!showToolbar && (
        <Box>
          <Text size="xl" weight="semibold">{title}</Text>
          {subtitle && <Text size="sm" color="muted">{subtitle}</Text>}
        </Box>
      )}

      {/* Toolbar: PatternListToolbar replaces the manual toolbar */}
      {showToolbar && (
        <>
          <PatternListToolbar
            title={title}
            icon={icon}
            totalCount={data.length}
            // Search
            search={workspace.searchValue}
            onSearchChange={workspace.setSearchValue}
            searchPlaceholder={controls?.search?.placeholder ?? 'Search...'}
            // View controls
            viewMode={toolbarViewMode}
            onViewModeChange={handleViewModeChange}
            density={density}
            onDensityChange={(d) => controls?.density?.onChange?.(d)}
            // Filter pills (passed through when available)
            activeFilters={workspace.filterValues}
            onClearFilters={workspace.resetFilters}
            activeFilterCount={workspace.activeFilterCount}
            // Primary action
            primaryAction={primaryAction}
            // Export
            onExport={handleExport}
          />
          {subtitle && <Text size="sm" color="muted">{subtitle}</Text>}
        </>
      )}

      {/* Saved views */}
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

      {/* Filters */}
      {controls?.filters && controls.filters.length > 0 && (
        <PatternFilterPanel
          filters={controls.filters}
          values={workspace.filterValues}
          onChange={workspace.applyFilters}
          onReset={workspace.resetFilters}
          activeCount={workspace.activeFilterCount}
          layout={workspace.isMobile ? 'stacked' : 'inline'}
        />
      )}

      {/* Main content area */}
      <Flex gap={4}>
        {/* Data area */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          {error ? (
            <Box padding="lg">{error}</Box>
          ) : workspace.activeViewMode === 'cards' && mobileCard ? (
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {data.map((item, i) => (
                <Box
                  key={typeof rowKey === 'function' ? rowKey(item) : String(item[rowKey])}
                  onClick={() => (onRowClick ?? behavior?.onRowClick)?.(item, i)}
                  style={{
                    cursor: onRowClick || behavior?.onRowClick ? 'pointer' : undefined,
                  }}
                >
                  {mobileCard(item, i)}
                </Box>
              ))}
            </Box>
          ) : (
            <PatternDataTable<T>
              data={data}
              columns={columns}
              rowKey={rowKey}
              loading={loading}
              emptyState={emptyState}
              actions={actions}
              onRowClick={onRowClick ?? behavior?.onRowClick}
              onRowDoubleClick={behavior?.onRowDoubleClick}
              expandedRow={behavior?.expandedRow}
              // Selection
              selectable={behavior?.selection?.enabled}
              selectedKeys={workspace.selectedKeys}
              onSelectionChange={workspace.setSelection}
              bulkActions={behavior?.bulkActions}
              // Sorting
              sorting={behavior?.sorting}
              onSortChange={behavior?.onSortChange}
              // Pagination
              pagination={behavior?.pagination}
              // Visual
              compact={compact}
              density={density}
              striped={presentation?.striped}
              bordered={presentation?.bordered}
              hoverable={presentation?.hoverable ?? true}
              stickyHeader={presentation?.stickyHeader}
              // Column management
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
              // Mobile
              mobileCard={mobileCard}
            />
          )}
        </Box>

        {/* Preview rail */}
        {showPreviewRail && workspace.selectedKeys.length === 1 && (
          <Box
            style={{
              width: behavior!.previewRail!.width ?? '360px',
              flexShrink: 0,
              borderLeft: '1px solid var(--ds-color-border-secondary)',
              paddingLeft: 'var(--ds-spacing-md, 16px)',
            }}
          >
            {(() => {
              const selectedItem = data.find((item) => {
                const key = typeof rowKey === 'function'
                  ? rowKey(item)
                  : String(item[rowKey]);
                return key === workspace.selectedKeys[0];
              });
              return selectedItem ? behavior!.previewRail!.render!(selectedItem) : null;
            })()}
          </Box>
        )}
      </Flex>

      {/* Footer slot */}
      {footerSlot}
    </Stack>
  );
}
