'use client';

/**
 * @fileoverview ListSurface - Rottay Design System
 * @description Reusable list-page surface with filters, table/card views,
 * row actions, and standard empty/loading handling.
 *
 * @remarks
 * The surface owns mechanics rather than product identity. Apps supply adapters,
 * renderers, and actions while the DS owns the layout and interaction shell.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Stack, Text } from '../../../../primitives';
import { PatternDataTable, PatternFilterPanel, resolveRowKey } from '../../../../patterns';
import { PatternListToolbar } from '../../../../patterns/data/list-toolbar';
import type { ViewMode } from '../../../../patterns/data/list-toolbar';
import { FadeIn, StaggerChildren, recordTransitionName } from '../../../../../motion';
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';
import {
  countActiveFilters,
  resolveSurfaceAction,
  filterSurfaceActions,
  filterSurfaceColumns,
  mapSurfaceData,
  resolveColumnValue,
  resolveSurfaceButtonVariant,
  stringifySurfaceValue,
} from '../../../foundation/helpers';
import type { EntityAdapter, ListSurfaceConfig, ListSurfaceView, SurfaceAction } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceTranslations } from '../../../foundation/i18n';
import { useSurfaceProfileDefaults } from '../../../foundation/profile-defaults';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../foundation/personality-helpers';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../foundation/states';

// ---------------------------------------------------------------------------
// View-mode bridging helpers
// ---------------------------------------------------------------------------
// ListSurface uses 'table' | 'cards' while PatternListToolbar uses 'list' | 'cards'.
// These helpers translate between the two vocabularies.

function surfaceViewToToolbarMode(view: ListSurfaceView): ViewMode {
  return view === 'table' ? 'list' : 'cards';
}

function toolbarModeToSurfaceView(mode: ViewMode): ListSurfaceView {
  return mode === 'list' ? 'table' : 'cards';
}

/** Render a single surface action using the normalized surface-to-button mapping. */
function renderActionButton<TView>(
  action: SurfaceAction<TView>,
  item: TView,
  options?: { size?: 'sm' | 'md' | 'lg'; stopPropagation?: boolean }
): React.ReactElement {
  return (
    <Button
      key={action.id}
      /**
       * Surface actions intentionally use the surface vocabulary. We normalize
       * that into the exact primitive button contract here so page configs stay
       * expressive without weakening the DS types.
       */
      variant={resolveSurfaceButtonVariant(action.variant)}
      size={options?.size ?? 'sm'}
      disabled={action.disabled}
      loading={action.loading}
      icon={action.icon}
      onClick={(event) => {
        if (options?.stopPropagation) {
          event.stopPropagation();
        }

        action.onClick?.(item);
      }}
    >
      {action.label}
    </Button>
  );
}

/** Resolve the most specific cell renderer available for a list field. */
function buildSurfaceCellRenderer<TView>(
  config: ListSurfaceConfig<TView>,
  columnKey: string,
  fieldId: string,
  value: unknown,
  item: TView,
  index: number,
  defaultRenderer?: (value: unknown, item: TView, index: number) => React.ReactNode
): React.ReactNode {
  // Renderer resolution chain (most specific wins):
  // 1. presentation.renderCell keyed by fieldId (domain-specific override)
  // 2. presentation.renderCell keyed by columnKey (column-level override)
  // 3. Column's own default renderer from the column config
  // 4. stringifySurfaceValue fallback (toString with null safety)
  const presentationRenderer =
    config.presentation.renderCell?.[fieldId] ?? config.presentation.renderCell?.[columnKey];

  if (presentationRenderer) {
    return presentationRenderer(value, item, index);
  }

  if (defaultRenderer) {
    return defaultRenderer(value, item, index);
  }

  return stringifySurfaceValue(value);
}

/** Default card-based presentation used when the list is not shown as a table. */
function DefaultCardView<TView>({
  items,
  config,
  columns,
  rowActions,
  cardMinWidth,
  cardVariant,
  animateEntrance,
  staggerDelay,
  entranceDuration,
}: {
  items: TView[];
  config: ListSurfaceConfig<TView>;
  columns: ReturnType<typeof filterSurfaceColumns<TView>>;
  rowActions: SurfaceAction<TView>[];
  cardMinWidth: number;
  cardVariant: 'outlined' | 'elevated' | 'filled' | 'ghost';
  animateEntrance: boolean;
  staggerDelay: number;
  entranceDuration: number;
}): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();

  if (items.length === 0) {
    return (
      <Card variant={cardVariant}>
        <Card.Body>
          {config.presentation.emptyState ?? (
            <SurfaceEmptyState
              title={tSurface('list.empty_title')}
              description={tSurface('list.empty_description')}
            />
          )}
        </Card.Body>
      </Card>
    );
  }

  const gridContent = (
    <Grid templateColumns={`repeat(auto-fit, minmax(${cardMinWidth}px, 1fr))`} gap="lg">
      {items.map((item, index) => {
        // Give apps a full escape hatch before falling back to the stock card rendering.
        const customCard = config.presentation.renderCard?.(item, index);

        // Per-item view-transition seam, keyed by the SAME rowKey resolution
        // the table view uses (resolveRowKey) so a card and the detail
        // surface displaying the same record agree on identity structurally
        // rather than by two files sharing a convention. Falls back to the
        // array index when no rowKey is configured, matching resolveRowKey's
        // table behavior; an index-derived name is unique within this page
        // but does not carry record identity across a sort, filter, or
        // navigation.
        const itemTransitionName = recordTransitionName(resolveRowKey(item, config.behavior.rowKey, index));

        if (customCard) {
          return (
            <Box key={index} style={{ viewTransitionName: itemTransitionName }}>
              {customCard}
            </Box>
          );
        }

        return (
          <Card
            key={index}
            variant={cardVariant}
            hoverable={!!config.behavior.onRowClick}
            clickable={!!config.behavior.onRowClick}
            onClick={() => config.behavior.onRowClick?.(item, index)}
            style={{ viewTransitionName: itemTransitionName }}
          >
            <Card.Body>
              <Stack spacing="md">
                {columns
                  .filter((column) => !column.hideInCards)
                  .map((column) => {
                    const columnValue = resolveColumnValue(column, item);

                    return (
                      <Box key={column.key}>
                        <Text
                          className="ds-list__card-label"
                          data-part="card-label"
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {column.header}
                        </Text>
                        <Text
                          className="ds-list__card-value"
                          data-part="card-value"
                        >
                          {buildSurfaceCellRenderer(
                            config,
                            column.key,
                            column.fieldId,
                            columnValue,
                            item,
                            index,
                            column.render
                          )}
                        </Text>
                      </Box>
                    );
                  })}

                {rowActions.length > 0 && (
                  <Box onClick={(event) => event.stopPropagation()}>
                    <Flex gap={8} wrap="wrap">
                    {rowActions.map((action) => renderActionButton(action, item, { stopPropagation: true }))}
                    </Flex>
                  </Box>
                )}
              </Stack>
            </Card.Body>
          </Card>
        );
      })}
    </Grid>
  );

  if (animateEntrance) {
    return (
      <StaggerChildren staggerDelay={staggerDelay} duration={entranceDuration}>
        {gridContent}
      </StaggerChildren>
    );
  }

  return gridContent;
}

export interface ListSurfaceProps<TRaw, TView extends object> {
  data: TRaw[];
  adapter: EntityAdapter<TRaw, TView>;
  config: ListSurfaceConfig<TView>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Full list-page shell with data mapping, permission filtering, and responsive view switching. */
export function ListSurface<TRaw, TView extends object>({
  data,
  adapter,
  config,
  loading = false,
  error,
  onRetry,
}: ListSurfaceProps<TRaw, TView>): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const { tSurface } = useSurfaceTranslations();
  const { isMobile } = useBreakpoints();
  // Visual defaults cascade: explicit surface config -> product profile -> DS defaults.
  // This three-tier resolution lets apps override per-page while the product
  // profile provides a consistent baseline.
  const resolvedDefaultView = config.visual.defaultView ?? profileDefaults.listView;
  const resolvedMobileView = config.visual.mobileDefaultView ?? 'cards';
  const resolvedCompact = config.visual.compact ?? profileDefaults.listCompact;
  const resolvedCardMinWidth = config.visual.cardMinWidth ?? profileDefaults.listCardMinWidth;
  const [activeView, setActiveView] = useState<ListSurfaceView>(resolvedDefaultView);

  useEffect(() => {
    /**
     * Product profile defaults are part of the effective surface contract, so
     * when they change we resync the uncontrolled active view as well.
     */
    setActiveView(resolvedDefaultView);
  }, [resolvedDefaultView]);

  // Adapter mapping runs once per data change, transforming raw API records
  // into the view shape that column renderers and actions expect.
  const mappedItems = useMemo(() => {
    return mapSurfaceData(data, adapter);
  }, [data, adapter]);

  // Permission filtering is memoized because it drives both column visibility
  // and the "no visible columns" edge case detection.
  const permittedColumns = useMemo(() => {
    return filterSurfaceColumns(config.behavior.columns, config.permissions);
  }, [config.behavior.columns, config.permissions]);
  const primaryAction = useMemo(() => {
    return resolveSurfaceAction(config.behavior.primaryAction, config.permissions);
  }, [config.behavior.primaryAction, config.permissions]);

  const rowActions = useMemo(() => {
    return filterSurfaceActions(config.behavior.rowActions, config.permissions);
  }, [config.behavior.rowActions, config.permissions]);

  const activeFilterCount = countActiveFilters(config.behavior.filterValues);
  const effectiveView = isMobile ? resolvedMobileView : activeView;
  const shouldShowViewSwitch =
    config.visual.allowViewSwitch !== false &&
    (!isMobile || config.visual.hideViewSwitchOnMobile === false);

  const hasToolbar = !!config.toolbar;

  // Bridge the toolbar view-mode change back into the surface's view state.
  const handleToolbarViewModeChange = useCallback(
    (mode: ViewMode) => {
      setActiveView(toolbarModeToSurfaceView(mode));
    },
    [],
  );

  // Build the toolbar's primaryAction descriptor from the surface's resolved action.
  const toolbarPrimaryAction = useMemo(() => {
    if (!primaryAction) return undefined;
    return {
      label: primaryAction.label,
      onClick: () => primaryAction.onClick?.(undefined as void),
      icon: primaryAction.icon,
    };
  }, [primaryAction]);

  // When the toolbar is active, the PageShellSurface header only renders
  // toolbarEnd and any extra items -- the toolbar owns the view switch and
  // primary action.  When the toolbar is absent, we keep the legacy layout.
  const headerActions = hasToolbar ? (
    config.presentation.toolbarEnd ? (
      <Flex gap={8} wrap="wrap" justify="end">
        {config.presentation.toolbarEnd}
      </Flex>
    ) : undefined
  ) : (
    <Flex gap={8} wrap="wrap" justify="end">
      {config.presentation.toolbarEnd}

      {/* View switch defaults to visible. Apps opt out with allowViewSwitch:false
          when only one view makes sense (e.g. audit logs should always be tabular). */}
      {shouldShowViewSwitch && (
        <Flex gap={8}>
          <Button
            variant={resolveSurfaceButtonVariant(activeView === 'table' ? 'primary' : 'secondary')}
            size="sm"
            onClick={() => setActiveView('table')}
          >
            {tSurface('list.view_table')}
          </Button>
          <Button
            variant={resolveSurfaceButtonVariant(activeView === 'cards' ? 'primary' : 'secondary')}
            size="sm"
            onClick={() => setActiveView('cards')}
          >
            {tSurface('list.view_cards')}
          </Button>
        </Flex>
      )}

      {primaryAction && (
        <Button
          variant={resolveSurfaceButtonVariant(primaryAction.variant ?? 'primary')}
          disabled={primaryAction.disabled}
          loading={primaryAction.loading}
          onClick={() => primaryAction.onClick?.(undefined as void)}
          icon={primaryAction.icon}
        >
          {primaryAction.label}
        </Button>
      )}
    </Flex>
  );

  const resolvedSectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);

  if (error) {
    return (
      <PageShellSurface chrome={config.presentation.chrome} actions={headerActions} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const listContent = (
    <Stack
      className="ds-surface ds-list"
      data-part="root"
      data-view={effectiveView}
      data-mobile={isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      spacing={resolvedSectionSpacing}
    >
      {/* --------------------------------------------------------------- */}
      {/* Toolbar: canonical PatternListToolbar when config.toolbar is set */}
      {/* --------------------------------------------------------------- */}
      {hasToolbar && config.toolbar && (
        <PatternListToolbar
          title={config.toolbar.title}
          showTitleSection={config.toolbar.showTitleSection}
          icon={config.toolbar.icon}
          totalCount={config.toolbar.totalCount}
          search={config.toolbar.search}
          onSearchChange={config.toolbar.onSearchChange}
          searchPlaceholder={config.toolbar.searchPlaceholder}
          filterPills={config.toolbar.filterPills}
          activeFilters={config.toolbar.activeFilters}
          onFilterChange={config.toolbar.onFilterChange}
          onClearFilters={config.toolbar.onClearFilters}
          activeFilterCount={config.toolbar.activeFilterCount}
          viewMode={surfaceViewToToolbarMode(activeView)}
          onViewModeChange={handleToolbarViewModeChange}
          density={config.toolbar.density}
          onDensityChange={config.toolbar.onDensityChange}
          columnSettingsContent={config.toolbar.columnSettingsContent}
          savedViewsContent={config.toolbar.savedViewsContent}
          primaryAction={toolbarPrimaryAction}
          onExport={config.toolbar.onExport}
        />
      )}

      {/* Extra toolbar slots (kept for backward compatibility / injection) */}
      {config.presentation.toolbarStart}

      {config.behavior.filters && config.behavior.filters.length > 0 && (
        config.visual.filterPanelChrome === 'plain' ? (
          <Box
            style={{
              padding: isMobile ? '0 4px' : '0 2px',
            }}
          >
            <PatternFilterPanel
              filters={config.behavior.filters}
              values={config.behavior.filterValues ?? {}}
              onChange={(values) => config.behavior.onFilterChange?.(values)}
              onReset={config.behavior.onFilterReset}
              showReset={!!config.behavior.onFilterReset && activeFilterCount > 0}
              showApply={!!config.behavior.onFilterApply}
              onApply={config.behavior.onFilterApply}
              activeCount={activeFilterCount}
              title={
                isMobile || config.behavior.filters.length > 1
                  ? tSurface('list.filters_title')
                  : undefined
              }
              layout={isMobile ? (config.visual.mobileFiltersLayout ?? 'stacked') : 'inline'}
            />
          </Box>
        ) : (
          <Card variant={profileDefaults.cardVariant}>
            <Card.Body>
              <PatternFilterPanel
                filters={config.behavior.filters}
                values={config.behavior.filterValues ?? {}}
                onChange={(values) => config.behavior.onFilterChange?.(values)}
                onReset={config.behavior.onFilterReset}
                showReset={!!config.behavior.onFilterReset && activeFilterCount > 0}
                showApply={!!config.behavior.onFilterApply}
                onApply={config.behavior.onFilterApply}
                activeCount={activeFilterCount}
                title={
                  isMobile || config.behavior.filters.length > 1
                    ? tSurface('list.filters_title')
                    : undefined
                }
                layout={isMobile ? (config.visual.mobileFiltersLayout ?? 'stacked') : 'inline'}
              />
            </Card.Body>
          </Card>
        )
      )}

      {effectiveView === 'table' ? (
        <PatternDataTable<TView>
          data={mappedItems}
          columns={permittedColumns
            .filter((column) => !column.hideInTable)
            .map((column) => ({
              ...column,
              render: (value, item, index) =>
                buildSurfaceCellRenderer(
                  config,
                  column.key,
                  column.fieldId,
                  value,
                  item as TView,
                  index,
                  column.render
                ),
            }))}
          rowKey={config.behavior.rowKey}
          sorting={config.behavior.sorting}
          onSortChange={config.behavior.onSortChange}
          pagination={config.behavior.pagination}
          compact={resolvedCompact}
          stickyHeader={config.visual.stickyHeader}
          maxHeight={config.visual.maxHeight}
          onRowClick={config.behavior.onRowClick}
          selectable={config.behavior.selectable}
          selectedKeys={config.behavior.selectedKeys}
          onSelectionChange={config.behavior.onSelectionChange}
          bulkActions={config.behavior.bulkActions}
          onRowDoubleClick={config.behavior.onRowDoubleClick}
          expandedRow={config.behavior.expandedRow}
          resizable={config.visual.columnResizable}
          columnWidths={config.visual.columnWidths}
          onColumnResize={config.visual.onColumnResize}
          reorderable={config.visual.columnReorderable}
          columnOrder={config.visual.columnOrder}
          onColumnReorder={config.visual.onColumnReorder}
          columnVisibility={config.visual.columnVisibilityEnabled}
          visibleColumns={config.visual.columnVisibility}
          onVisibleColumnsChange={config.visual.onColumnVisibilityChange}
          actions={
            rowActions.length > 0
              ? (item: TView) => (
                  <Flex gap={8} justify="end" wrap="wrap">
                    {rowActions.map((action) => renderActionButton(action, item))}
                  </Flex>
                )
              : undefined
          }
          emptyState={
            config.presentation.emptyState ?? (
              <SurfaceEmptyState
                title={tSurface('list.empty_title')}
                description={tSurface('list.empty_description')}
              />
            )
          }
        />
      ) : (
        <DefaultCardView
          items={mappedItems}
          config={config}
          columns={permittedColumns}
          rowActions={rowActions}
          cardMinWidth={resolvedCardMinWidth}
          cardVariant={profileDefaults.cardVariant}
          animateEntrance={profileDefaults.animateEntrance}
          staggerDelay={profileDefaults.staggerDelay}
          entranceDuration={profileDefaults.entranceDuration}
        />
      )}
    </Stack>
  );

  return (
    <PageShellSurface chrome={config.presentation.chrome} actions={headerActions} loading={loading}>
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {/* Coarse view-transition seam wrapping the list body. Inert outside an
            active view transition. */}
        <Box style={{ viewTransitionName: 'ds-vt-list-body' }}>
          {profileDefaults.animateEntrance ? (
            <FadeIn duration={profileDefaults.entranceDuration}>
              {listContent}
            </FadeIn>
          ) : (
            listContent
          )}
        </Box>
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
