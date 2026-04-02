/**
 * @fileoverview CollectionWorkspaceSurface - unified collection screen.
 *
 * Composes the shared workspace contract with patterns to create a
 * full collection screen: toolbar + filters + saved views + table/cards + bulk actions.
 *
 * This surface replaces ad-hoc composition in apps and provides a standard
 * workspace layout that all collection-oriented screens can use.
 */

import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ColumnDef } from '../../patterns/types';
import type { CollectionWorkspaceConfig } from '../contracts/collection';
import { useCollectionWorkspace } from '../hooks/useCollectionWorkspace';
import { PatternDataTable } from '../../patterns/data-table';
import { PatternFilterPanel } from '../../patterns/filter-panel';
import { PatternSavedViewsBar } from '../../patterns/saved-views';
import { Box } from '../../../components/primitives/layout/Box';
import { Stack } from '../../../components/primitives/layout/Stack';
import { Flex } from '../../../components/primitives/layout/Flex';
import { Text } from '../../../components/primitives/display/Typography';

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
  const density = controls?.density?.value ?? 'comfortable';
  const compact = density === 'compact';

  // Preview rail
  const showPreviewRail = behavior?.previewRail?.enabled && behavior.previewRail.render;

  // Whether to show the toolbar row
  const showToolbar =
    controls?.search?.enabled ||
    controls?.viewMode?.enabled ||
    controls?.density?.enabled ||
    controls?.export?.enabled;

  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <Stack spacing="md" style={{ maxWidth: presentation?.maxWidth }}>
      {/* Header slot */}
      {headerSlot}

      {/* Title bar */}
      <Box>
        <Text size="xl" weight="semibold">{title}</Text>
        {subtitle && <Text size="sm" color="muted">{subtitle}</Text>}
      </Box>

      {/* Toolbar: search + viewMode + density + export */}
      {showToolbar && (
        <Flex gap={3} align="center" wrap="wrap">
          {/* Search */}
          {controls?.search?.enabled && (
            <Box>
              <input
                type="text"
                placeholder={controls.search.placeholder ?? 'Search...'}
                value={workspace.searchValue}
                onChange={(e) => workspace.setSearchValue(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '8px 12px',
                  border: '1px solid var(--ds-color-border-primary)',
                  borderRadius: 'var(--ds-radius-md, 8px)',
                  background: 'var(--ds-color-bg-primary)',
                  color: 'var(--ds-color-text-primary)',
                  fontSize: '14px',
                }}
              />
            </Box>
          )}

          {/* View mode switcher */}
          {controls?.viewMode?.enabled && (
            <Flex gap={2}>
              {controls.viewMode.modes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => workspace.setViewMode(mode)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--ds-color-border-primary)',
                    borderRadius: 'var(--ds-radius-sm, 6px)',
                    background: workspace.activeViewMode === mode
                      ? 'var(--ds-color-primary)'
                      : 'var(--ds-color-bg-secondary)',
                    color: workspace.activeViewMode === mode
                      ? 'var(--ds-color-text-on-primary, #fff)'
                      : 'var(--ds-color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </Flex>
          )}

          {/* Density control */}
          {controls?.density?.enabled && (
            <Flex gap={2}>
              {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => controls.density?.onChange?.(d)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid var(--ds-color-border-primary)',
                    borderRadius: 'var(--ds-radius-sm, 6px)',
                    background: density === d ? 'var(--ds-color-bg-tertiary)' : 'transparent',
                    color: 'var(--ds-color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {d}
                </button>
              ))}
            </Flex>
          )}

          {/* Spacer */}
          <Box style={{ flex: 1 }} />

          {/* Export */}
          {controls?.export?.enabled && (() => {
            const formats = controls.export?.formats ?? ['csv'];
            if (formats.length === 1) {
              return (
                <button
                  onClick={() => controls.export?.onExport?.(formats[0])}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--ds-color-border-primary)',
                    borderRadius: 'var(--ds-radius-sm, 6px)',
                    background: 'var(--ds-color-bg-secondary)',
                    color: 'var(--ds-color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'background var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
                  }}
                >
                  Export {formats[0].toUpperCase()}
                </button>
              );
            }
            return (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => setShowExportMenu(prev => !prev)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--ds-color-border-primary)',
                    borderRadius: 'var(--ds-radius-sm, 6px)',
                    background: 'var(--ds-color-bg-secondary)',
                    color: 'var(--ds-color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'background var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
                  }}
                >
                  Export ▾
                </button>
                {showExportMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      border: '1px solid var(--ds-color-border-primary)',
                      borderRadius: 'var(--ds-radius-md, 8px)',
                      background: 'var(--ds-color-bg-primary)',
                      boxShadow: 'var(--ds-shadow-lg, 0 10px 15px rgba(0,0,0,0.1))',
                      zIndex: 50,
                      minWidth: '120px',
                      overflow: 'hidden',
                    }}
                  >
                    {formats.map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => { controls.export?.onExport?.(fmt); setShowExportMenu(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 16px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--ds-color-text-primary)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textAlign: 'left',
                          transition: 'background var(--ds-duration-fast, 0.15s) var(--ds-ease-out)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--ds-color-bg-tertiary)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </Flex>
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
