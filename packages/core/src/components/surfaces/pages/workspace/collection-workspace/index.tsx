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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckSquare2, Filter } from 'lucide-react';
import type { ColumnDef } from '../../../../patterns/foundation/types';
import type {
  CollectionWorkspaceConfig,
  WorkspaceActiveFiltersConfig,
} from '../../../foundation/contracts/collection';
import type { AdaptiveConfig } from '../../../foundation/contracts/adaptive';
import type { DensityKey, ViewMode } from '../../../../patterns/data/list-toolbar/ListToolbar.types';
import type { CollectionHeaderProps } from '../../../../structures/headers/collection';
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
import { WorkspaceShell } from '../../../layout/workspace-shell';
import { CollectionRenderDispatch } from './render-dispatch';
import type { CollectionViewMode, CollectionViewModeConfigs } from '../../../foundation/contracts/collection';

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

function resolveKey<T extends object>(
  item: T,
  rowKey: keyof T | ((row: T) => string),
): string {
  return typeof rowKey === 'function' ? rowKey(item) : String(item[rowKey]);
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
`;

const COLLECTION_WORKSPACE_COLUMNS_EVENT = 'collection-workspace:toggle-columns-menu';

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

  const posture = useAdaptivePosture(adaptive);
  const density: DensityKey = controls?.density?.value ?? 'comfortable';
  const compact = density === 'compact';
  const enhanced = presentation?.enhancedInteractions ?? false;
  const isPremium = Boolean(header || command);
  const selectionEnabled = behavior?.selection?.enabled ?? false;
  const canToggleSelectionMode = Boolean(behavior?.selection?.onModeChange);

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

  // Focus
  const focusEnabled = behavior?.focus?.enabled ?? false;
  const focusedKey = behavior?.focus?.focusedKey ?? null;
  const previewKey = focusedKey
    ?? (workspace.selectedKeys.length === 1 ? workspace.selectedKeys[0] : null);
  const showPreviewRail = behavior?.previewRail?.enabled
    && behavior.previewRail.render
    && posture.pane !== 'hidden'
    && previewKey != null;

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

  const handleExport = useMemo(() => {
    if (!controls?.export?.enabled || !controls.export.onExport) return undefined;
    const fmt = controls.export.formats?.[0] ?? 'csv';
    return () => controls.export!.onExport!(fmt);
  }, [controls?.export?.enabled, controls?.export?.onExport, controls?.export?.formats]);

  const defaultColumnKeys = useMemo(
    () => columns.map((column) => column.key),
    [columns],
  );

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
            boxShadow: 'inset 3px 0 0 0 var(--ds-color-primary)',
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
    const hasCommandBar = Boolean(command);
    const showToolbar =
      controls?.viewMode?.enabled ||
      controls?.density?.enabled ||
      controls?.export?.enabled ||
      (!hasCommandBar && controls?.search?.enabled);
    const toolbarViewMode: ViewMode = workspace.activeViewMode === 'table' ? 'list' : 'cards';

    return (
      <Stack spacing="md" style={{ maxWidth: presentation?.maxWidth }}>
        {headerSlot}
        {!showToolbar && (
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
        <Flex gap={4}>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <PatternDataTable<T>
              data={data}
              columns={columns}
              rowKey={rowKey}
              loading={loading}
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
              sorting={behavior?.sorting}
              onSortChange={behavior?.onSortChange}
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
              resizable={presentation?.resizable}
              columnWidths={controls?.columnSettings?.columnWidths}
              onColumnResize={controls?.columnSettings?.onColumnResize}
              mobileCard={mobileCard}
            />
          </Box>
          {showPreviewRail && (() => {
            const railItem = data.find((item) => resolveKey(item, rowKey) === previewKey);
            if (!railItem) return null;
            return (
              <Box style={{
                width: behavior!.previewRail!.width ?? '380px',
                flexShrink: 0,
                borderLeft: '2px solid color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-border-secondary))',
                paddingLeft: 'var(--ds-spacing-md, 16px)',
                overflow: 'auto',
              }}>
                {behavior!.previewRail!.render!(railItem)}
              </Box>
            );
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
  const activeFilterCount = activeFilters?.filters.length ?? workspace.activeFilterCount;
  const hasActiveFilters = activeFilterCount > 0;
  const showInlineResultCount = !contextSlot;
  const shellConfig = presentation?.shell;
  const useAtmosphericShell = Boolean(
    isPremium && shellConfig?.variant && shellConfig.variant !== 'default',
  );
  const editorialTechMasthead = Boolean(
    useAtmosphericShell && header?.layoutVariant === 'editorial-tech',
  );
  const promotedShortcuts =
    editorialTechMasthead && command && header?.shortcuts?.length
      ? header.shortcuts
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
      {header && (
        <CollectionHeader
          {...header}
          shortcuts={promotedShortcuts ? undefined : header.shortcuts}
          surfaceVariant={useAtmosphericShell ? 'embedded' : header.surfaceVariant}
        />
      )}

      {command && (
        <SearchCommandBar
          command={{
            placeholder: command.placeholder,
            value: command.value,
            onSearch: command.onSearch,
            hint: command.hint,
            suggestions: command.suggestions,
            recentQueries: command.recentQueries,
          }}
          commands={command.commands}
          showCommandPalette={command.showCommandPalette}
          topRailSlot={commandTopRailSlot}
          surfaceVariant={useAtmosphericShell ? 'embedded' : 'default'}
          layoutVariant={header?.layoutVariant}
        />
      )}

      {contextSlot && (
        <Box style={{
          padding: slotsCollapsed
            ? 0
            : editorialTechMasthead
              ? '0 20px 4px'
              : '0 16px 6px',
          marginTop: slotsCollapsed ? 0 : editorialTechMasthead ? -2 : -4,
          background: useAtmosphericShell ? 'transparent' : 'var(--ds-surface-card)',
          borderBottom: useAtmosphericShell ? 'none' : '1px solid var(--ds-color-border-subtle)',
          maxHeight: slotsCollapsed ? 0 : 36,
          opacity: slotsCollapsed ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 250ms ease-out, opacity 250ms ease-out, padding 250ms ease-out',
          pointerEvents: slotsCollapsed ? 'none' : undefined,
        }}>
          {contextSlot}
        </Box>
      )}
    </>
  );

  const premiumContent = (
    <Stack spacing="none" className={enhanced ? 'ds-collection-enhanced' : undefined}>
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
      {statsSlot && (
        <Box style={{
          padding: slotsCollapsed ? 0 : '14px 16px 0',
          maxHeight: slotsCollapsed ? 0 : 400,
          opacity: slotsCollapsed ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms cubic-bezier(0.4,0,0.2,1), padding 300ms cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: slotsCollapsed ? 'none' : undefined,
        }}>
          {statsSlot}
        </Box>
      )}

      {/* 5. Single compact controls rail with animated saved-views <-> filters swap */}
      <Box
        style={{
          padding: '6px 16px 0',
          borderTop: useAtmosphericShell
            ? '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 16%, transparent)'
            : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 30%, transparent)',
          position: 'relative',
          zIndex: filtersExpanded ? 24 : 4,
          overflow: 'visible',
        }}
      >
        <Flex align="center" gap={10} wrap="nowrap" style={{ minHeight: 34 }}>
          <Box
            style={{
              flex: 1,
              minWidth: 0,
              overflow: filtersExpanded ? 'visible' : 'hidden',
              position: 'relative',
              zIndex: filtersExpanded ? 16 : 1,
            }}
          >
            <Box style={{ position: 'relative', minHeight: 44, overflow: 'visible' }}>
              <Box
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
                  style={{
                    maxHeight: filtersExpanded ? 88 : 0,
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
                            color: '#fff',
                          }}
                        >
                          {activeFilterCount}
                        </Box>
                      )}
                    </Flex>

                    <Box style={{ flex: 1, minWidth: 0 }}>
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
                {data.length} results
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* 5.5 Active filters (embedded into the shell when present) */}
      {activeFilters && activeFilters.filters.length > 0 && (
        <ActiveFiltersBar
          activeFilters={activeFilters.filters}
          onRemoveFilter={activeFilters.onRemove}
          onClearAll={activeFilters.onClearAll}
          onAddFilter={activeFilters.onAddFilter}
          surfaceVariant={useAtmosphericShell ? 'embedded' : 'default'}
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
      <Box style={{ padding: '4px 16px 16px' }}>
        <Flex gap={4}>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <CollectionRenderDispatch<T>
              viewMode={effectiveViewMode}
              viewModes={viewModes}
              data={data}
              columns={columns}
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
              sorting={behavior?.sorting}
              onSortChange={behavior?.onSortChange}
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
              resizable={presentation?.resizable}
              columnWidths={controls?.columnSettings?.columnWidths}
              onColumnResize={controls?.columnSettings?.onColumnResize}
              mobileCard={mobileCard}
              focusEnabled={focusEnabled}
            />
          </Box>

          {/* Preview rail */}
          {showPreviewRail && (() => {
            const railItem = data.find((item) => resolveKey(item, rowKey) === previewKey);
            if (!railItem) return null;
            return (
              <Box style={{
                width: behavior!.previewRail!.width ?? '380px',
                flexShrink: 0,
                borderLeft: '2px solid color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-border-secondary))',
                paddingLeft: 'var(--ds-spacing-md, 16px)',
                background: 'color-mix(in srgb, var(--ds-surface-card) 50%, var(--ds-color-bg-primary) 50%)',
                borderRadius: '0 var(--ds-radius-sm, 6px) var(--ds-radius-sm, 6px) 0',
                transition: 'width 200ms ease-out',
                overflow: 'auto',
              }}>
                {behavior!.previewRail!.render!(railItem)}
              </Box>
            );
          })()}
        </Flex>
      </Box>

      {footerSlot}
    </Stack>
  );

  return (
    <>
      {useAtmosphericShell ? (
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
          style={{ maxWidth: presentation?.maxWidth }}
        >
          {premiumContent}
        </WorkspaceShell>
      ) : (
        <Box style={{ maxWidth: presentation?.maxWidth }}>
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
