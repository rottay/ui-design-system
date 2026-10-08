import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { SurfacePostureSlot } from '../../../../../runtime/postures/scope';
import { NavigationMoreIcon } from '@/graphics/icons/semantic/generated/roles/navigation-more';
import type { SurfacePosture } from '../../../../../foundation/contracts/adaptive';
import type {
  CollectionHeaderProps,
  CollectionHeaderQuickAction,
} from '../../../../../../structures/headers/collection';
import type { SearchCommandBarConfig } from '../../../../../../structures/workspace/search-command-bar';
import { PatternSavedViewsBar } from '../../../../../../patterns/data/saved-views';
import { ScopeSwitcher } from '../../../../../../structures/workspace/scope-switcher';
import { CollectionHeader } from '../../../../../../structures/headers/collection';
import { SearchCommandBar } from '../../../../../../structures/workspace/search-command-bar';
import type { WorkspaceActiveFiltersConfig } from '../../../../../foundation/contracts/adaptive/collection';
import { ActiveFiltersBar } from '../../../../../../structures/workspace/active-filters-bar';
import { Box } from '../../../../../../primitives/layout/box';
import { Flex } from '../../../../../../primitives/layout/flex';
import { Text } from '../../../../../../primitives/display/typography';
import { Button } from '../../../../../../primitives/inputs/button';
import { ActionDock } from '../../../../../../structures/workspace/action-dock';
import type { PrimaryActionPlacement } from '../../../../../foundation/contracts/postures';
import type { useCollectionWorkspace } from '../../../../../runtime/collection-workspace';
import type { CollectionWorkspaceProps } from '..';
import { isPrimaryCollectionAction, type SurfaceTranslator } from '../foundation';

export interface CollectionTopChromeInput<T extends object> {
  command: CollectionWorkspaceProps<T>['command'];
  surfaceMode: NonNullable<CollectionWorkspaceProps<T>['surfaceMode']>;
  slotsCollapsed: boolean;
  primaryAction: CollectionWorkspaceProps<T>['primaryAction'];
  tSurfaceOr: SurfaceTranslator;
  primaryPlacement: PrimaryActionPlacement | undefined;
  primaryActionVisible: boolean;
  posture: SurfacePosture;
  resolvedContextSlot: ReactNode;
  resolvedHeader: CollectionHeaderProps | undefined;
  searchCommand: SearchCommandBarConfig | undefined;
  usesStickyActionContinuity: boolean;
  usesMinimalHeader: boolean;
  showContextChrome: boolean;
  useWorkspaceShell: boolean;
  editorialTechMasthead: boolean;
}

export function renderCollectionTopChrome<T extends object>(input: CollectionTopChromeInput<T>) {
  const {
    command, surfaceMode, slotsCollapsed, primaryAction, tSurfaceOr, primaryPlacement, primaryActionVisible, posture,
    resolvedContextSlot, resolvedHeader, searchCommand, usesStickyActionContinuity, usesMinimalHeader,
    showContextChrome, useWorkspaceShell, editorialTechMasthead,
  } = input;
  const promotedShortcuts =
    !usesMinimalHeader
    && editorialTechMasthead
    && searchCommand
    && resolvedHeader?.shortcuts?.length
      ? resolvedHeader.shortcuts
      : undefined;
  const commandTopRailSlot = promotedShortcuts ? (
    <Flex align="center" gap={10} wrap="wrap" justify="end">
      <Text
        className="ds-collection-workspace__shortcut-label"
        data-part="shortcut-label"
        size="xs"
      >
        {tSurfaceOr('collection_workspace.shortcuts_label', 'Shortcuts')}
      </Text>
      {promotedShortcuts.map((shortcut) => (
        <Box
          className="ds-collection-workspace__shortcut"
          data-part="shortcut"
          key={shortcut.key}
        >
          {shortcut.label}
        </Box>
      ))}
    </Flex>
  ) : undefined;
  const topChrome = (
    <>
      {resolvedHeader && (
        <CollectionHeader
          {...resolvedHeader}
          compact={posture.compactHeader}
          minimal={usesMinimalHeader}
          quickActions={usesStickyActionContinuity ? undefined : primaryPlacement || !primaryActionVisible
            ? resolvedHeader.quickActions?.filter((action) => !isPrimaryCollectionAction(action, primaryAction))
            : resolvedHeader.quickActions}
          shortcuts={usesMinimalHeader || promotedShortcuts
            ? undefined
            : resolvedHeader.shortcuts}
          surfaceVariant={useWorkspaceShell ? 'embedded' : resolvedHeader.surfaceVariant}
        />
      )}

      {searchCommand && (
        <SearchCommandBar
          command={{
            placeholder: searchCommand.placeholder,
            value: searchCommand.value,
            onSearch: searchCommand.onSearch,
            hint: searchCommand.hint,
            suggestions: searchCommand.suggestions,
            recentQueries: searchCommand.recentQueries,
          }}
          commands={command?.commands}
          showCommandPalette={command?.showCommandPalette}
          topRailSlot={commandTopRailSlot}
          surfaceVariant={useWorkspaceShell || surfaceMode === 'embed' ? 'embedded' : 'default'}
          layoutVariant={resolvedHeader?.layoutVariant}
        />
      )}

      {showContextChrome && (
        <SurfacePostureSlot name="context" asChild><Box
          className="ds-collection-workspace__context-slot"
          data-part="context-slot"
          data-collapsed={slotsCollapsed ? 'true' : 'false'}
          data-masthead={editorialTechMasthead ? 'true' : 'false'}
        >
          {resolvedContextSlot}
        </Box></SurfacePostureSlot>
      )}
    </>
  );
  return { topChrome };
}

export interface CollectionViewsStripInput<T extends object> {
  controls: CollectionWorkspaceProps<T>['controls'];
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  postureIsPhone: boolean;
  inlineFiltersExpanded: boolean;
  hasScopes: boolean | undefined;
  hasSavedViews: boolean | undefined;
}

export function renderCollectionViewsStrip<T extends object>(input: CollectionViewsStripInput<T>) {
  const { controls, workspace, postureIsPhone, inlineFiltersExpanded, hasScopes, hasSavedViews } = input;
  return (
              <Box
                className="ds-collection-workspace__views-strip"
                data-part="views-strip"
                data-active={inlineFiltersExpanded ? 'false' : 'true'}
                data-ds-collection-views-strip="true"
              >
                <Flex
                  align="center"
                  gap={8}
                  wrap={postureIsPhone ? 'wrap' : 'nowrap'}
                  className="ds-collection-workspace__views-strip-row"
                >
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
                      className="ds-collection-workspace__divider"
                      data-part="divider"
                    />
                  )}

                  {hasSavedViews && (
                    <Box className="ds-collection-workspace__saved-views-host" data-part="saved-views-host">
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
  );
}

export interface CollectionSmartSelectionInput<T extends object> {
  behavior: CollectionWorkspaceProps<T>['behavior'];
  tSurfaceOr: SurfaceTranslator;
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  selectionEnabled: boolean;
}

export function renderCollectionSmartSelection<T extends object>(input: CollectionSmartSelectionInput<T>) {
  const { behavior, tSurfaceOr, workspace, selectionEnabled } = input;
  return (
      selectionEnabled && behavior?.smartSelection && behavior.smartSelection.length > 0 && workspace.selectedKeys.length > 0 && (
        <SurfacePostureSlot name="selection" asChild><Box className="ds-collection-workspace__smart-selection" data-part="smart-selection">
          <Flex align="center" gap={8} wrap="wrap">
            <Box
              as="span"
              className="ds-collection-workspace__selection-count"
              data-part="selection-count"
            >
              {tSurfaceOr('collection_workspace.selected_count', '{count} selected', {
                count: workspace.selectedKeys.length,
              })}
            </Box>
            <Box
              as="span"
              className="ds-collection-workspace__muted-text"
              data-part="smart-sets-label"
            >
              {tSurfaceOr('collection_workspace.smart_sets', 'Smart sets')}
            </Box>
            {behavior.smartSelection.map((set) => (
              <Button
                key={set.key}
                variant={set.key === 'clear' ? 'ghost' : 'secondary'}
                size="sm"
                onClick={set.onClick}
                disabled={set.disabled}
              >
                {set.label}
              </Button>
            ))}
          </Flex>
        </Box></SurfacePostureSlot>
      )
  );
}

export interface CollectionStickyDockInput<T extends object> {
  primaryAction: CollectionWorkspaceProps<T>['primaryAction'];
  tSurfaceOr: SurfaceTranslator;
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  primaryActionVisible: boolean;
  posture: SurfacePosture;
  compactActionsOpen: boolean;
  setCompactActionsOpen: Dispatch<SetStateAction<boolean>>;
  compactActionsId: string;
  actionOverflowItems: CollectionHeaderQuickAction[];
}

export function renderCollectionStickyDock<T extends object>(input: CollectionStickyDockInput<T>) {
  const {
    primaryAction, tSurfaceOr, workspace, primaryActionVisible, posture, compactActionsOpen, setCompactActionsOpen,
    compactActionsId, actionOverflowItems,
  } = input;
  return (
      posture.actionBar === 'sticky-bottom'
        && ((primaryAction && primaryActionVisible) || actionOverflowItems.length > 0) && (
        <ActionDock
          mode="sticky"
          className="ds-surface ds-collection-workspace ds-collection-workspace__sticky-action-bar"
          data-testid="collection-action-dock"
          aria-label={tSurfaceOr('collection_workspace.collection_actions_aria', 'Collection actions')}
        >
          {workspace.hasSelection && (
            <Text
              className="ds-collection-workspace__muted-text"
              size="sm"
              color="muted"
              aria-live="polite"
              data-part="dock-selection-count"
            >
              {tSurfaceOr('collection_workspace.selected_count', '{count} selected', {
                count: workspace.selectedKeys.length,
              })}
            </Text>
          )}

          {actionOverflowItems.length > 0 && (
            <Button
              variant="secondary"
              icon={<NavigationMoreIcon decorative size={18} />}
              aria-label={tSurfaceOr('collection_workspace.more_actions', 'More actions')}
              aria-haspopup="dialog"
              aria-expanded={compactActionsOpen}
              aria-controls={compactActionsId}
              className="ds-collection-workspace__dock-more"
              onClick={() => setCompactActionsOpen(true)}
            >
              {tSurfaceOr('collection_workspace.more', 'More')}
            </Button>
          )}

          {primaryAction && primaryActionVisible && (
            <Button
              variant="primary"
              icon={primaryAction.icon}
              disabled={primaryAction.disabled}
              pending={primaryAction.pending ?? primaryAction.loading}
              pendingLabel={primaryAction.pendingLabel}
              aria-label={primaryAction.ariaLabel}
              onClick={primaryAction.onClick}
              className="ds-collection-workspace__sticky-primary-action"
            >
              {primaryAction.label}
            </Button>
          )}
        </ActionDock>
      )
  );
}

export interface CollectionActiveFiltersInput {
  resolvedActiveFilters: WorkspaceActiveFiltersConfig | undefined;
  useWorkspaceShell: boolean;
}

export function renderCollectionActiveFilters(input: CollectionActiveFiltersInput) {
  const { resolvedActiveFilters, useWorkspaceShell } = input;
  return (
      resolvedActiveFilters && resolvedActiveFilters.filters.length > 0 && (
        <ActiveFiltersBar
          activeFilters={resolvedActiveFilters.filters}
          onRemoveFilter={resolvedActiveFilters.onRemove}
          onClearAll={resolvedActiveFilters.onClearAll}
          onAddFilter={resolvedActiveFilters.onAddFilter}
          surfaceVariant={useWorkspaceShell ? 'embedded' : 'default'}
        />
      )
  );
}
