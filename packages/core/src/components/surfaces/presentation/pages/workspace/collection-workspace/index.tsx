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

import type { SurfacePostures } from '../../../../foundation/contracts/postures';
import { SurfacePostureScope, SurfacePostureSlot, useScopedSurfacePosture } from '../../../../runtime/postures/scope';
import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import React, { useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { tabPanelTransitionName, TAB_PANEL_TRANSITION_CLASS } from '@/graphics/motion/react/runtime';
import type { ColumnDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
import type {
  CollectionWorkspaceChromeConfig,
  CollectionWorkspaceConfig,
  CollectionWorkspaceSurfaceMode,
  WorkspaceActiveFiltersConfig,
} from '../../../../foundation/contracts/adaptive/collection';
import type { SurfaceAdaptivePosture } from '../../../../foundation/contracts/adaptive';
import type { ViewMode } from '../../../../../patterns/data/list-toolbar/contracts';
import type { DensityPosture } from '@/infrastructure/runtime/foundation/density';
import type { CollectionHeaderProps } from '../../../../../structures/headers/collection';
import type {
  SearchCommandBarConfig,
  SearchCommandBarCommand,
} from '../../../../../structures/workspace/search-command-bar';
import { useSurfaceTranslations } from '../../../../../structures/foundation/chrome/runtime/i18n';
import { useReadingDirectionIsRtl } from '@/infrastructure/runtime/i18n';
import type { DataTablePatternProps } from '../../../../../patterns/data/data-table';
import { Box } from '../../../../../primitives/layout/box';
import { Stack } from '../../../../../primitives/layout/stack';
import { Flex } from '../../../../../primitives/layout/flex';
import { Button } from '../../../../../primitives/inputs/button';
import { PatternFilterPanel } from '../../../../../patterns/forms/filter-panel';
import { WorkspaceShell } from '../../../../../structures/shell/workspace-shell';
import { CollectionRenderDispatch } from './render-dispatch';
import type { CollectionViewModeConfigs } from '../../../../foundation/contracts/adaptive/collection';
import { normalizeDensityMode } from '../../../../../../foundation/tokens/ts/foundation/base/density';
import {
  markCollectionWorkspaceFocusedRow,
  resolveCollectionWorkspaceDensityStyleVars,
  resolveKey,
} from './foundation';
import { useCollectionWorkspaceChrome, useCollectionWorkspaceResolution } from './resolution';
import {
  renderLegacyPreviewRailItem,
  renderPremiumPreviewRailItem,
  useCollectionPreviewRail,
} from './preview-rail';
import { useCollectionRows } from './rows';
import { useCollectionCompactPreview } from './compact-preview';
import { useCollectionRowActivation } from './row-activation';
import { useCollectionColumnSettings } from './column-settings';
import { useCollectionFilterDisclosure } from './filter-disclosure';
import { renderCollectionOverlays } from './overlays';
import { renderToolbarUtilities } from './toolbar-utilities';
import {
  renderCollectionActiveFilters,
  renderCollectionSmartSelection,
  renderCollectionStickyDock,
  renderCollectionTopChrome,
  renderCollectionViewsStrip,
} from './premium';
import {
  renderLegacyFilterTrigger,
  renderLegacyHeader,
  renderLegacyInlineFilters,
  renderLegacySavedViews,
  renderLegacyScopes,
  renderLegacyToolbar,
} from './legacy';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CollectionWorkspaceProps<T extends object> extends CollectionWorkspaceConfig<T> {
  postures?: SurfacePostures;
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
   * The inline `--ds-density-cell-padding` is the nearest scope for the tables
   * inside, so it replaces a tenant's legacy `chrome.table.cellPadding`. The
   * tenant's `chrome.table.cellPadding<Mode>` still wins, and a tenant or
   * preview scope nested inside this workspace is nearer than it.
   *
   * A runtime `controls.density` switcher (`WorkspaceDensityConfig`), when
   * enabled and given a value, still overrides this baseline.
   * @default 'comfortable'
   */
  density?: Exclude<DensityPosture, 'spacious'>;
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
  adaptive?: SurfaceAdaptivePosture;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollectionWorkspaceSurface<T extends object>(props: CollectionWorkspaceProps<T>) {
  return (
    <SurfacePostureScope postures={props.postures} family="workspace">
      <CollectionWorkspaceSurfaceContent {...props} />
    </SurfacePostureScope>
  );
}

function CollectionWorkspaceSurfaceContent<T extends object>(props: CollectionWorkspaceProps<T>) {
  const surfacePosture = useScopedSurfacePosture();
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
    onRetry,
    emptyState,
    adaptive,
    access,
    capabilityRegistry,
  } = props;

  const surfaceAccess = access;
  const { tSurfaceOr, locale } = useSurfaceTranslations();
  // The reading direction comes from the shared i18n authority. It used to be
  // read off `document.documentElement`, which the provider CLAIMS from the
  // locale in its default scope -- so the value is the same one, minus the
  // layout read. In `directionScope="element"` the provider deliberately leaves
  // `<html>` alone, and there the authority is the only correct answer: a
  // locale island must not take its direction from the shell it sits in.
  const directionIsRtl = useReadingDirectionIsRtl();
  const {
    capabilityColumns, workspace, collectionTransitionScope, changeViewMode, setInternalSorting, internalSorting,
    columnsResizable, postureDevice, postureIsPhone, primaryPlacement, primaryActionVisible, relocatePrimaryAction,
    posture,
  } = useCollectionWorkspaceResolution({
    surfacePosture, columns, defaultViewMode, controls, behavior, presentation, data, adaptive, surfaceAccess,
  });
  const density: DensityPosture = surfacePosture?.density ?? controls?.density?.value ?? densityMode;
  const densityStyleVars = resolveCollectionWorkspaceDensityStyleVars(
    normalizeDensityMode(density),
  );
  const compact = density === 'compact';
  const {
    scopedPrimaryAction, enhanced, resolvedChrome, resolvedCommand, resolvedContextSlot, resolvedStatsSlot,
    resolvedActiveFilters, resolvedHeader, isPremium, selectionEnabled, rootInstanceStyle, canToggleSelectionMode,
    hasInlinePersistenceHandler, inlineEditingEnabled, autoEnableInlineEditing, setDraftCellValues, draftCellValues,
    previousDataRef, searchCommand, hasFilters, setFiltersExpanded, filtersExpanded, filterDraftValues,
    setFilterDraftValues, setCompactActionsOpen, compactActionsOpen, compactPreviewOpen, setCompactPreviewOpen,
    compactPreviewKey, setCompactPreviewKey, dismissedCompactPreviewKeyRef, unavailableCompactPreviewKeyRef,
    filterDisclosureId, filterDropdownAnchorRef, compactActionsId, compactPreviewId, usesFilterSheet,
    usesFilterDropdown, usesFilterDisclosure, inlineFiltersExpanded, usesStickyActionContinuity, usesMinimalHeader,
    actionOverflowItems, effectiveViewMode, showContextChrome, showStatsChrome, focusEnabled, focusedKey, previewKey,
    usesPreviewSheet, usesPreviewAccordion, usesCompactPreview, showPreviewRail,
  } = useCollectionWorkspaceChrome({
    surfacePosture, header, command, contextSlot, statsSlot, activeFilters, surfaceMode, chrome, primaryAction,
    controls, behavior, presentation, data, loading, error, tSurfaceOr, locale, workspace, postureDevice,
    postureIsPhone, primaryPlacement, primaryActionVisible, posture,
  });
  const { renderPreviewRail } = useCollectionPreviewRail({ behavior, tSurfaceOr, directionIsRtl });

  const handleExport = useMemo(() => {
    if (!controls?.export?.enabled || !controls.export.onExport) return undefined;
    const fmt = controls.export.formats?.[0] ?? 'csv';
    return () => controls.export!.onExport!(fmt);
  }, [controls?.export?.enabled, controls?.export?.onExport, controls?.export?.formats]);

  const {
    defaultColumnKeys, effectiveSorting, effectiveColumns, handleInlineCellEdit, handleSortChange, displayData,
  } = useCollectionRows({
    rowKey, behavior, data, capabilityColumns, setInternalSorting, internalSorting, hasInlinePersistenceHandler,
    inlineEditingEnabled, autoEnableInlineEditing, setDraftCellValues, draftCellValues, previousDataRef,
  });

  const {
    resolvedCompactPreviewKey, previewItem, compactPreviewVisible, handleCompactPreviewOpenChange,
    openCompactPreviewForKey, handleWorkspaceSelectionChange,
  } = useCollectionCompactPreview({
    surfacePosture, rowKey, loading, workspace, compactPreviewOpen, setCompactPreviewOpen, compactPreviewKey,
    setCompactPreviewKey, dismissedCompactPreviewKeyRef, unavailableCompactPreviewKeyRef, focusedKey, previewKey,
    usesCompactPreview, displayData,
  });

  const { handleRowClick, resolveRowHref, resolveRowActivationLabel } = useCollectionRowActivation({
    title, rowKey, onRowClick, behavior, tSurfaceOr, posture, focusEnabled, focusedKey, usesCompactPreview,
    handleCompactPreviewOpenChange, openCompactPreviewForKey,
  });

  const {
    hasColumnMenu, columnMenuColumns, columnMenuActions, handleColumnsApply, handleColumnsReset,
    handleVisibleActionsApply, handleSelectionModeToggle,
  } = useCollectionColumnSettings({
    controls, behavior, capabilityColumns, selectionEnabled, defaultColumnKeys,
  });

  const {
    clearFilters, activeFilterCount, hasActiveFilters, draftActiveFilterCount, closeFilterDisclosure,
    applyFilterDisclosure, clearFilterDraft, handleFiltersToggle, handleFilterDisclosureOpenChange,
  } = useCollectionFilterDisclosure({
    activeFilters, controls, workspace, hasFilters, setFiltersExpanded, filtersExpanded, filterDraftValues,
    setFilterDraftValues, usesFilterDisclosure,
  });

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
      return markCollectionWorkspaceFocusedRow(defaultRender);
    },
    [focusEnabled, focusedKey, rowKey],
  );

  const {
    filterSheet, filterDropdown, compactPreviewSheet, compactPreviewAccordion, compactActionsSheet,
  } = renderCollectionOverlays({
    surfacePosture, title, controls, behavior, loading, tSurfaceOr, hasFilters, filtersExpanded, filterDraftValues,
    setFilterDraftValues, compactActionsOpen, setCompactActionsOpen, compactPreviewOpen, filterDisclosureId,
    filterDropdownAnchorRef, compactActionsId, compactPreviewId, usesFilterSheet, usesFilterDropdown,
    usesStickyActionContinuity, actionOverflowItems, usesPreviewSheet, usesPreviewAccordion, resolvedCompactPreviewKey,
    previewItem, compactPreviewVisible, handleCompactPreviewOpenChange, draftActiveFilterCount, closeFilterDisclosure,
    applyFilterDisclosure, clearFilterDraft, handleFilterDisclosureOpenChange,
  });

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
        {renderLegacyHeader({ title, subtitle, surfaceMode, showToolbar })}
        {renderLegacyToolbar({
          title, subtitle, primaryAction, icon, controls, data, tSurfaceOr, workspace, changeViewMode,
          primaryActionVisible, relocatePrimaryAction, density, handleExport, showToolbar, toolbarViewMode,
        })}
        {renderLegacyScopes({ controls, postureIsPhone })}
        {renderLegacySavedViews({ controls, workspace })}
        {renderLegacyInlineFilters({ controls, workspace, hasFilters, usesFilterDisclosure })}
        {renderLegacyFilterTrigger({
          tSurfaceOr, filtersExpanded, filterDisclosureId, filterDropdownAnchorRef, usesFilterDisclosure,
          activeFilterCount, hasActiveFilters, handleFiltersToggle,
        })}
        <Flex className="ds-collection-workspace__content" data-part="content" gap={4}>
          <SurfacePostureSlot name="collection" asChild><Box
            ref={workspace.collectionRef}
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
              onRetry={onRetry}
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
          </Box></SurfacePostureSlot>
          {renderLegacyPreviewRailItem({ rowKey, previewKey, showPreviewRail, renderPreviewRail, displayData })}
        </Flex>
        {compactPreviewAccordion}
          <SurfacePostureSlot name="footer">{footerSlot}</SurfacePostureSlot>
          {relocatePrimaryAction && scopedPrimaryAction}
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
  const { topChrome } = renderCollectionTopChrome({
    command, surfaceMode, slotsCollapsed, primaryAction, tSurfaceOr, primaryPlacement, primaryActionVisible, posture,
    resolvedContextSlot, resolvedHeader, searchCommand, usesStickyActionContinuity, usesMinimalHeader,
    showContextChrome, useWorkspaceShell, editorialTechMasthead,
  });

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
        <SurfacePostureSlot name="stats" asChild><Box
          className="ds-collection-workspace__stats-slot"
          data-part="stats-slot"
          data-collapsed={slotsCollapsed ? 'true' : 'false'}
        >
          {resolvedStatsSlot}
        </Box></SurfacePostureSlot>
      )}

      {/* 5. Single compact controls rail with animated saved-views <-> filters swap.
          The data-ds-collection-* attributes are the STABLE addressing contract
          for consumers (WO-UX-03): apps must target these hooks, never the
          inline-style values, which may change in any release. */}
      <SurfacePostureSlot name="toolbar" asChild><Box
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
          wrap={postureIsPhone ? 'wrap' : 'nowrap'}
          data-ds-collection-controls-row="true"
        >
          <Box
            className="ds-collection-workspace__controls-rail"
            data-part="controls-rail"
            data-filters-expanded={inlineFiltersExpanded ? 'true' : 'false'}
            style={{
              // Test-pinned inline geometry (phone full-width rail).
              flex: postureIsPhone ? '1 1 100%' : 1,
              width: postureIsPhone ? '100%' : undefined,
            }}
          >
            <Box
              className="ds-collection-workspace__strip-host"
              data-part="strip-host"
              data-ds-collection-strip-host="true"
            >
              {renderCollectionViewsStrip({
                controls, workspace, postureIsPhone, inlineFiltersExpanded, hasScopes, hasSavedViews,
              })}

              {hasFilters && !usesFilterDisclosure && (
                <Box
                  className="ds-collection-workspace__filters-strip"
                  data-part="filters-strip"
                  data-active={inlineFiltersExpanded ? 'true' : 'false'}
                  data-phone={postureIsPhone ? 'true' : 'false'}
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
                          minWidth: postureIsPhone ? undefined : 'max-content',
                          // Custom-property passthrough (sanctioned): the
                          // filter panel's inline layout channels.
                          ['--ds-filter-panel-inline-wrap' as string]: postureIsPhone ? 'wrap' : 'nowrap',
                          ['--ds-filter-panel-inline-flex' as string]: postureIsPhone
                            ? '1 1 268px'
                            : '0 0 auto',
                          ['--ds-filter-panel-inline-min-width' as string]: postureIsPhone
                            ? '196px'
                            : 'auto',
                          ['--ds-filter-panel-inline-control-width' as string]: postureIsPhone
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

          {renderToolbarUtilities({
            primaryAction, controls, behavior, data, tSurfaceOr, workspace, postureIsPhone, primaryPlacement,
            primaryActionVisible, density, scopedPrimaryAction, resolvedHeader, selectionEnabled,
            canToggleSelectionMode, hasFilters, filtersExpanded, filterDisclosureId, filterDropdownAnchorRef,
            usesFilterDisclosure, usesStickyActionContinuity, handleExport, defaultColumnKeys, hasColumnMenu,
            columnMenuColumns, columnMenuActions, handleColumnsApply, handleColumnsReset, handleVisibleActionsApply,
            handleSelectionModeToggle, activeFilterCount, hasActiveFilters, handleFiltersToggle, showInlineResultCount,
          })}
        </Flex>
      </Box></SurfacePostureSlot>

      {/* 5.5 Active filters (embedded into the shell when present) */}
      {renderCollectionActiveFilters({ resolvedActiveFilters, useWorkspaceShell })}

      {/* 6. Smart selection sets (visible only while selection mode is on) */}
      {renderCollectionSmartSelection({ behavior, tSurfaceOr, workspace, selectionEnabled })}

      {/* 7. Table + preview rail */}
      <Box
        className="ds-collection-workspace__body"
        data-part="body"
        data-phone={postureIsPhone ? 'true' : 'false'}
        data-ds-collection-body="true"
      >
        <Flex className="ds-collection-workspace__body-content" data-part="body-content" gap={4}>
          <SurfacePostureSlot name="collection" asChild><Box
            ref={workspace.collectionRef}
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
              onRetry={onRetry}
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
          </Box></SurfacePostureSlot>

          {/* Preview rail */}
          {renderPremiumPreviewRailItem({ rowKey, previewKey, showPreviewRail, renderPreviewRail, displayData })}
        </Flex>
      </Box>

      {compactPreviewAccordion}

      <SurfacePostureSlot name="footer">{footerSlot}</SurfacePostureSlot>
      {relocatePrimaryAction && scopedPrimaryAction}
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
      {renderCollectionStickyDock({
        primaryAction, tSurfaceOr, workspace, primaryActionVisible, posture, compactActionsOpen, setCompactActionsOpen,
        compactActionsId, actionOverflowItems,
      })}
    </>
  );
}

/** Canonical public alias. */
export { CollectionWorkspaceSurface as CollectionWorkspace };
export type CollectionWorkspaceSurfaceProps<T extends object> =
  CollectionWorkspaceProps<T>;
