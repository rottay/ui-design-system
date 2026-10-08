import type { RefObject } from 'react';
import { SurfacePostureSlot } from '../../../../../runtime/postures/scope';
import { ActionFilterIcon } from '@/graphics/icons/semantic/generated/roles/action-filter';
import type { ViewMode } from '../../../../../../patterns/data/list-toolbar/contracts';
import type { DensityPosture } from '@/infrastructure/runtime/foundation/density';
import { PatternFilterPanel } from '../../../../../../patterns/forms/filter-panel';
import { PatternSavedViewsBar } from '../../../../../../patterns/data/saved-views';
import { PatternListToolbar } from '../../../../../../patterns/data/list-toolbar';
import { ScopeSwitcher } from '../../../../../../structures/workspace/scope-switcher';
import { Box } from '../../../../../../primitives/layout/box';
import { Text } from '../../../../../../primitives/display/typography';
import { Button } from '../../../../../../primitives/inputs/button';
import type { useCollectionWorkspace } from '../../../../../runtime/collection-workspace';
import type { CollectionWorkspaceProps } from '..';
import type { SurfaceTranslator } from '../foundation';

export interface CollectionLegacyHeaderInput<T extends object> {
  title: CollectionWorkspaceProps<T>['title'];
  subtitle: CollectionWorkspaceProps<T>['subtitle'];
  surfaceMode: NonNullable<CollectionWorkspaceProps<T>['surfaceMode']>;
  showToolbar: boolean | undefined;
}

export function renderLegacyHeader<T extends object>(input: CollectionLegacyHeaderInput<T>) {
  const { title, subtitle, surfaceMode, showToolbar } = input;
  return (
        !showToolbar && surfaceMode !== 'embed' && (
          <Box className="ds-collection-workspace__header" data-part="header">
            <Text className="ds-collection-workspace__title" data-part="title" size="xl" weight="semibold">{title}</Text>
            {subtitle && <Text className="ds-collection-workspace__muted-text" size="sm" color="muted">{subtitle}</Text>}
          </Box>
        )
  );
}

export interface CollectionLegacyToolbarInput<T extends object> {
  title: CollectionWorkspaceProps<T>['title'];
  subtitle: CollectionWorkspaceProps<T>['subtitle'];
  primaryAction: CollectionWorkspaceProps<T>['primaryAction'];
  icon: CollectionWorkspaceProps<T>['icon'];
  controls: CollectionWorkspaceProps<T>['controls'];
  data: CollectionWorkspaceProps<T>['data'];
  tSurfaceOr: SurfaceTranslator;
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  changeViewMode: (mode: string) => void;
  primaryActionVisible: boolean;
  relocatePrimaryAction: boolean;
  density: DensityPosture;
  handleExport: (() => void) | undefined;
  showToolbar: boolean | undefined;
  toolbarViewMode: ViewMode;
}

export function renderLegacyToolbar<T extends object>(input: CollectionLegacyToolbarInput<T>) {
  const {
    title, subtitle, primaryAction, icon, controls, data, tSurfaceOr, workspace, changeViewMode, primaryActionVisible,
    relocatePrimaryAction, density, handleExport, showToolbar, toolbarViewMode,
  } = input;
  return (
        showToolbar && (
          <>
            {/* Legacy PatternListToolbar import kept inline for backward compat */}
            <SurfacePostureSlot name="toolbar"><PatternListToolbar
              title={title}
              icon={icon}
              totalCount={data.length}
              search={workspace.searchValue}
              onSearchChange={workspace.setSearchValue}
              searchPlaceholder={controls?.search?.placeholder
                ?? tSurfaceOr('collection_workspace.search_placeholder', 'Search...')}
              viewMode={toolbarViewMode}
              onViewModeChange={(mode: ViewMode) => changeViewMode(mode === 'list' ? 'table' : mode)}
              density={density}
              onDensityChange={(d: DensityPosture) => controls?.density?.onChange?.(d)}
              activeFilters={workspace.filterValues}
              onClearFilters={workspace.resetFilters}
              activeFilterCount={workspace.activeFilterCount}
              primaryAction={relocatePrimaryAction || !primaryActionVisible ? undefined : primaryAction}
              onExport={handleExport}
            /></SurfacePostureSlot>
            {subtitle && <Text className="ds-collection-workspace__muted-text" size="sm" color="muted">{subtitle}</Text>}
          </>
        )
  );
}

export interface CollectionLegacyScopesInput<T extends object> {
  controls: CollectionWorkspaceProps<T>['controls'];
  postureIsPhone: boolean;
}

export function renderLegacyScopes<T extends object>(input: CollectionLegacyScopesInput<T>) {
  const { controls, postureIsPhone } = input;
  return (
        controls?.scopes?.enabled && controls.scopes.scopes.length > 0 && (
          <ScopeSwitcher
            scopes={controls.scopes.scopes}
            activeScope={controls.scopes.activeScope ?? controls.scopes.scopes[0]?.key ?? ''}
            onScopeChange={controls.scopes.onScopeChange ?? (() => {})}
            variant={postureIsPhone ? 'inline' : 'section'}
          />
        )
  );
}

export interface CollectionLegacySavedViewsInput<T extends object> {
  controls: CollectionWorkspaceProps<T>['controls'];
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
}

export function renderLegacySavedViews<T extends object>(input: CollectionLegacySavedViewsInput<T>) {
  const { controls, workspace } = input;
  return (
        controls?.savedViews?.enabled && controls.savedViews.views && controls.savedViews.views.length > 0 && (
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
        )
  );
}

export interface CollectionLegacyInlineFiltersInput<T extends object> {
  controls: CollectionWorkspaceProps<T>['controls'];
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  hasFilters: boolean;
  usesFilterDisclosure: boolean;
}

export function renderLegacyInlineFilters<T extends object>(input: CollectionLegacyInlineFiltersInput<T>) {
  const { controls, workspace, hasFilters, usesFilterDisclosure } = input;
  return (
        hasFilters && !usesFilterDisclosure && (
          <PatternFilterPanel
            filters={controls!.filters!}
            values={workspace.filterValues}
            onChange={workspace.applyFilters}
            onReset={workspace.resetFilters}
            activeCount={workspace.activeFilterCount}
            layout="inline"
          />
        )
  );
}

export interface CollectionLegacyFilterTriggerInput<T extends object> {
  tSurfaceOr: SurfaceTranslator;
  filtersExpanded: boolean;
  filterDisclosureId: string;
  filterDropdownAnchorRef: RefObject<HTMLButtonElement | null>;
  usesFilterDisclosure: boolean;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  handleFiltersToggle: () => void;
}

export function renderLegacyFilterTrigger<T extends object>(input: CollectionLegacyFilterTriggerInput<T>) {
  const {
    tSurfaceOr, filtersExpanded, filterDisclosureId, filterDropdownAnchorRef, usesFilterDisclosure, activeFilterCount,
    hasActiveFilters, handleFiltersToggle,
  } = input;
  return (
        usesFilterDisclosure && (
          <Button
            ref={filterDropdownAnchorRef}
            variant="secondary"
            icon={<ActionFilterIcon decorative size={15} />}
            aria-label={hasActiveFilters
              ? tSurfaceOr('collection_workspace.filters_title_count', 'Advanced filters ({count})', { count: activeFilterCount })
              : tSurfaceOr('collection_workspace.filters_title', 'Advanced filters')}
            aria-expanded={filtersExpanded}
            aria-haspopup="dialog"
            aria-controls={filterDisclosureId}
            onClick={handleFiltersToggle}
          >
            {hasActiveFilters
              ? tSurfaceOr('collection_workspace.filters_trigger_count', 'Filters ({count})', { count: activeFilterCount })
              : tSurfaceOr('collection_workspace.filters_trigger', 'Filters')}
          </Button>
        )
  );
}
