import { useCallback, useId, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { flushSync } from 'react-dom';
import { SurfacePostureAction } from '../../../../../runtime/postures/scope';
import type { PrimaryActionPlacement, ResolvedSurfacePosture } from '../../../../../foundation/contracts/postures';
import { directionFromIndexDelta, useDirectionalViewTransition } from '@/graphics/motion/react/runtime';
import type { ColumnDef, SortConfig } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type {
  CollectionWorkspaceChromeConfig,
  CollectionWorkspaceConfig,
  CollectionWorkspaceSurfaceMode,
} from '../../../../../foundation/contracts/adaptive/collection';
import { deviceAliasForBreakpoint } from '@/foundation/contracts/kernel/responsive/breakpoints';
import { useResponsive } from '@/infrastructure/runtime/responsive';
import { useDeclaredEngine } from '@/infrastructure/runtime/engines/composition/react/provider';
import { isFrozenEngineName } from '@/foundation/contracts/kernel/engine-identity';
import { resolveSurfacePosture, type SurfacePosture } from '../../../../../foundation/contracts/adaptive';
import type { CollectionHeaderMetaItem } from '../../../../../../structures/headers/collection';
import { useCollectionWorkspace } from '../../../../../runtime/collection-workspace';
import { resolveSurfacePermission, hasSurfaceError } from '../../../../../runtime/helpers';
import { Button } from '../../../../../../primitives/inputs/button';
import type { CollectionWorkspaceProps } from '..';
import { isPrimaryCollectionAction, type SurfaceTranslator } from '../foundation';

function collectionColumnCapabilityId<T>(column: ColumnDef<T>): string {
  const fieldId = (column as ColumnDef<T> & { fieldId?: string }).fieldId;
  return fieldId?.trim() || column.key;
}

function resolveCollectionWorkspaceChrome(
  surfaceMode: CollectionWorkspaceSurfaceMode,
  chrome: CollectionWorkspaceChromeConfig | undefined,
): Required<CollectionWorkspaceChromeConfig> {
  const pageChrome = surfaceMode === 'page';

  return {
    header: chrome?.header ?? pageChrome,
    command: chrome?.command ?? true,
    context: chrome?.context ?? pageChrome,
    stats: chrome?.stats ?? pageChrome,
    activeFilters: chrome?.activeFilters ?? true,
  };
}

/**
 * Canonical presentation order of collection view modes, mirroring the
 * ViewModeSwitcher's left-to-right layout. The view-mode transition derives
 * its slide direction from index deltas in this order; modes not listed
 * resolve to the directionless crossfade.
 */
const COLLECTION_VIEW_MODE_ORDER: readonly string[] = [
  'table',
  'list',
  'cards',
  'grid',
  'kanban',
  'gallery',
  'calendar',
];

function formatHeaderMetaCount(value: number, locale?: string): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat(locale, {
    notation: Math.abs(value) >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

function normalizeHeaderMetaLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}


function buildDefaultHeaderMetaItems<T extends object>({
  data,
  controls,
  loading,
  error,
  t,
  locale,
}: {
  data?: T[];
  controls?: CollectionWorkspaceConfig<T>['controls'];
  loading?: boolean;
  error?: unknown;
  t: SurfaceTranslator;
  locale?: string;
}): CollectionHeaderMetaItem[] {
  if (hasSurfaceError(error)) {
    return [{
      key: 'state-error',
      label: t('collection_workspace.meta_needs_attention', 'Needs attention'),
      tone: 'neutral',
    }];
  }

  if (loading) {
    return [{
      key: 'state-loading',
      label: t('collection_workspace.meta_syncing', 'Syncing data'),
      tone: 'primary',
    }];
  }

  const rows = Array.isArray(data) ? data : [];
  const items: CollectionHeaderMetaItem[] = [
    {
      key: 'visible',
      label: t('collection_workspace.meta_in_view', '{count} in view', {
        count: formatHeaderMetaCount(rows.length, locale),
      }),
      tone: 'primary',
    },
  ];

  // The scopes a config DECLARES, ranked by their own counts. The DS used to
  // rank them against a hardcoded list of recruiting/events words ('open',
  // 'published', 'watchlist', 'high-risk'…) and to tint five of those green,
  // which made a generic surface assert what a status MEANS in someone's
  // product. Rank is a number the config already carries; meaning is not.
  const scopes = controls?.scopes?.scopes ?? [];
  const scopedItems = scopes
    .filter((scope) => scope.key !== 'all' && typeof scope.count === 'number')
    .sort((left, right) => (right.count ?? 0) - (left.count ?? 0))
    .slice(0, 3)
    .map((scope) => ({
      key: `scope-${scope.key}`,
      label: `${formatHeaderMetaCount(scope.count ?? 0, locale)} ${normalizeHeaderMetaLabel(scope.label)}`,
      tone: 'neutral',
    } satisfies CollectionHeaderMetaItem));

  for (const item of scopedItems) {
    if (items.length >= 4) break;
    items.push(item);
  }

  return items;
}

export interface CollectionWorkspaceResolutionInput<T extends object> {
  surfacePosture: ResolvedSurfacePosture | undefined;
  columns: CollectionWorkspaceProps<T>['columns'];
  defaultViewMode: NonNullable<CollectionWorkspaceProps<T>['defaultViewMode']>;
  controls: CollectionWorkspaceProps<T>['controls'];
  behavior: CollectionWorkspaceProps<T>['behavior'];
  presentation: CollectionWorkspaceProps<T>['presentation'];
  data: CollectionWorkspaceProps<T>['data'];
  adaptive: CollectionWorkspaceProps<T>['adaptive'];
  surfaceAccess: CollectionWorkspaceProps<T>['access'];
}

export function useCollectionWorkspaceResolution<T extends object>(input: CollectionWorkspaceResolutionInput<T>) {
  const { surfacePosture, columns, defaultViewMode, controls, behavior, presentation, data, adaptive, surfaceAccess } = input;
  const capabilityColumns = useMemo(
    () =>
      columns.filter((column) =>
        resolveSurfacePermission(surfaceAccess, {
          kind: 'column',
          id: collectionColumnCapabilityId(column),
        }),
      ),
    [columns, surfaceAccess],
  );

  // `adaptive` is the canonical responsive authority for the surface. The
  // older presentation.responsive contract remains supported when no adaptive
  // posture is supplied, but it must never run in parallel and resolve a
  // different view mode at the same viewport.
  const workspacePresentation = useMemo(
    () => adaptive && presentation?.responsive
      ? { ...presentation, responsive: undefined }
      : presentation,
    [adaptive, presentation],
  );

  const workspace = useCollectionWorkspace({
    config: {
      controls,
      behavior,
      presentation: workspacePresentation,
      data,
      columns: capabilityColumns,
    },
    defaultViewMode,
  });

  // View-mode switches run inside a direction-aware view transition scoped to
  // the collection container (see collectionTransitionStyle below). Direction
  // follows the switcher's presentation order; reduced motion and browsers
  // without the View Transitions API resolve to an instant swap.
  const collectionTransitionScope = useId().replace(/:/g, '');
  const runViewModeTransition = useDirectionalViewTransition();
  const changeViewMode = useCallback(
    (mode: string) => {
      const previousMode = workspace.activeViewMode;
      if (mode === previousMode) return;
      const direction = directionFromIndexDelta(
        COLLECTION_VIEW_MODE_ORDER.indexOf(previousMode),
        COLLECTION_VIEW_MODE_ORDER.indexOf(mode),
      );
      // flushSync puts the re-rendered collection in the DOM before the new
      // snapshot is captured; on the immediate path it degrades to a plain
      // synchronous state update.
      runViewModeTransition(
        () => {
          flushSync(() => workspace.setViewMode(mode));
        },
        { direction },
      );
    },
    [runViewModeTransition, workspace.activeViewMode, workspace.setViewMode],
  );
  const [internalSorting, setInternalSorting] = useState<SortConfig | null>(
    behavior?.sorting ?? null,
  );
  const columnsResizable = presentation?.resizable ?? !!controls?.columnSettings?.onColumnResize;

  const { activeBreakpoint } = useResponsive();
  // The posture follows the COLLECTION's own box when it has been measured and
  // the viewport otherwise, so an embedded workspace in a narrow column reads
  // its own width rather than the window's.
  const postureBreakpoint = workspace.containerBreakpoint ?? activeBreakpoint;
  const postureDevice = deviceAliasForBreakpoint(postureBreakpoint);
  const postureIsPhone = postureDevice === 'phone';
  const legacyPosture = resolveSurfacePosture(adaptive, postureBreakpoint);
  const primaryPlacement = surfacePosture?.primaryAction;
  const primaryActionVisible = surfacePosture?.regions['primary-action'] !== 'hide' && surfacePosture?.regions['primary-action'] !== 'collapse';
  const relocatePrimaryAction = primaryPlacement === 'bottom-bar' || primaryPlacement === 'floating';
  const posture = primaryPlacement ? { ...legacyPosture, actionBar: 'inline' as const } : legacyPosture;
  // Effective density: a runtime `controls.density` switcher value wins; else
  // the declarative `density` prop baseline (default 'comfortable'). The
  // resolved density CSS variables (design-language §3) are emitted on the
  // surface root so the inner table + embedded cards derive cell/card padding
  // from the token cascade.
  return {
    capabilityColumns, workspace, collectionTransitionScope, changeViewMode, setInternalSorting, internalSorting,
    columnsResizable, postureDevice, postureIsPhone, primaryPlacement, primaryActionVisible, relocatePrimaryAction,
    posture,
  };
}

export interface CollectionWorkspaceChromeInput<T extends object> {
  surfacePosture: ResolvedSurfacePosture | undefined;
  header: CollectionWorkspaceProps<T>['header'];
  command: CollectionWorkspaceProps<T>['command'];
  contextSlot: CollectionWorkspaceProps<T>['contextSlot'];
  statsSlot: CollectionWorkspaceProps<T>['statsSlot'];
  activeFilters: CollectionWorkspaceProps<T>['activeFilters'];
  surfaceMode: NonNullable<CollectionWorkspaceProps<T>['surfaceMode']>;
  chrome: CollectionWorkspaceProps<T>['chrome'];
  primaryAction: CollectionWorkspaceProps<T>['primaryAction'];
  controls: CollectionWorkspaceProps<T>['controls'];
  behavior: CollectionWorkspaceProps<T>['behavior'];
  presentation: CollectionWorkspaceProps<T>['presentation'];
  data: CollectionWorkspaceProps<T>['data'];
  loading: CollectionWorkspaceProps<T>['loading'];
  error: CollectionWorkspaceProps<T>['error'];
  tSurfaceOr: SurfaceTranslator;
  locale: string;
  workspace: ReturnType<typeof useCollectionWorkspace<T>>;
  postureDevice: ReturnType<typeof deviceAliasForBreakpoint>;
  postureIsPhone: boolean;
  primaryPlacement: PrimaryActionPlacement | undefined;
  primaryActionVisible: boolean;
  posture: SurfacePosture;
}

export function useCollectionWorkspaceChrome<T extends object>(input: CollectionWorkspaceChromeInput<T>) {
  const {
    surfacePosture, header, command, contextSlot, statsSlot, activeFilters, surfaceMode, chrome, primaryAction,
    controls, behavior, presentation, data, loading, error, tSurfaceOr, locale, workspace, postureDevice,
    postureIsPhone, primaryPlacement, primaryActionVisible, posture,
  } = input;
  const scopedPrimaryAction = primaryPlacement && primaryAction && primaryActionVisible ? (
    <SurfacePostureAction>
      <Button
        variant="primary"
        size="sm"
        className="ds-collection-workspace__toolbar-primary-action"
        icon={primaryAction.icon}
        disabled={primaryAction.disabled}
        pending={primaryAction.pending ?? primaryAction.loading}
        pendingLabel={primaryAction.pendingLabel}
        aria-label={primaryAction.ariaLabel}
        onClick={primaryAction.onClick}
      >
        {primaryAction.label}
      </Button>
    </SurfacePostureAction>
  ) : null;
  const enhanced = presentation?.enhancedInteractions ?? false;
  const resolvedChrome = resolveCollectionWorkspaceChrome(surfaceMode, chrome);
  const autoEmbeddedSearchCommand =
    surfaceMode === 'embed' && !command && controls?.search?.enabled
      ? {
          placeholder: controls.search.placeholder
            ?? tSurfaceOr('collection_workspace.search_placeholder', 'Search...'),
          value: workspace.searchValue,
          onSearch: workspace.setSearchValue,
          hint: undefined,
          suggestions: undefined,
          recentQueries: undefined,
        }
      : undefined;
  const resolvedCommand = resolvedChrome.command
    ? (command ?? autoEmbeddedSearchCommand)
    : undefined;
  const resolvedContextSlot = surfacePosture?.regions.context && surfacePosture.regions.context !== 'hide' ? contextSlot : resolvedChrome.context ? contextSlot : undefined;
  const resolvedStatsSlot = surfacePosture?.regions.stats && surfacePosture.regions.stats !== 'hide' ? statsSlot : resolvedChrome.stats ? statsSlot : undefined;
  const resolvedActiveFilters = resolvedChrome.activeFilters
    ? activeFilters
    : undefined;
  const fallbackHeaderMetaItems = buildDefaultHeaderMetaItems({
    data,
    controls,
    loading,
    error,
    t: tSurfaceOr,
    locale,
  });
  const resolvedHeader = resolvedChrome.header && header
    ? {
        ...header,
        metaItems: header.metaItems?.length ? header.metaItems : fallbackHeaderMetaItems,
        metaItemsPlacement: header.metaItemsPlacement ?? 'eyebrow-end',
      }
    : undefined;
  // Premium rendering is a presentation contract, not a side effect of
  // mounting page chrome. Headerless operational collections (for example a
  // list nested under app-owned navigation) must keep the same workspace,
  // density, filter and preview primitives instead of falling back to the
  // legacy toolbar merely because their duplicate heading was removed.
  const isPremium = Boolean(
    resolvedHeader
      || resolvedCommand
      || presentation?.enhancedInteractions
      || presentation?.shell,
  );
  const selectionEnabled = behavior?.selection?.enabled ?? false;
  // Instance geometry only: caller-owned max width. Static layout (inline
  // size, embed flex posture) lives in the skin keyed on data-surface-mode.
  const rootInstanceStyle: React.CSSProperties = {
    maxWidth: presentation?.maxWidth ?? (surfaceMode === 'embed' ? '100%' : undefined),
  };
  const canToggleSelectionMode = Boolean(behavior?.selection?.onModeChange);
  const hasInlinePersistenceHandler = typeof behavior?.cellEditing?.onCellEdit === 'function';
  const inlineEditingEnabled = behavior?.cellEditing?.enabled ?? true;
  const autoEnableInlineEditing = behavior?.cellEditing?.autoEnable ?? true;
  const [draftCellValues, setDraftCellValues] = useState<Record<string, Record<string, unknown>>>({});
  const previousDataRef = useRef(data);
  const searchCommand = resolvedCommand
    ?? (resolvedChrome.command && controls?.search?.enabled
        ? {
            placeholder: controls.search.placeholder
              ?? tSurfaceOr('collection_workspace.search_placeholder', 'Search...'),
            value: workspace.searchValue,
            onSearch: workspace.setSearchValue,
            hint: undefined,
            suggestions: undefined,
            recentQueries: undefined,
          }
        : undefined);

  // Collapsible advanced filters
  const hasFilters = Boolean(controls?.filters && controls.filters.length > 0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filterDraftValues, setFilterDraftValues] = useState<Record<string, unknown>>({});
  const [compactActionsOpen, setCompactActionsOpen] = useState(false);
  const [compactPreviewOpen, setCompactPreviewOpen] = useState(false);
  const [compactPreviewKey, setCompactPreviewKey] = useState<string | null>(null);
  const dismissedCompactPreviewKeyRef = useRef<string | null>(null);
  const unavailableCompactPreviewKeyRef = useRef<string | null>(null);
  const filterDisclosureId = `ds-collection-filter-${useId().replace(/:/g, '')}`;
  const filterDropdownAnchorRef = useRef<HTMLButtonElement | null>(null);
  const compactActionsId = `ds-collection-actions-${useId().replace(/:/g, '')}`;
  const compactPreviewId = `ds-collection-preview-${useId().replace(/:/g, '')}`;
  const usesFilterSheet = Boolean(
    hasFilters && posture.filters === 'sheet',
  );
  // The anchored disclosure is Modern-only; a forced frozen engine keeps the filters inline.
  const declaredEngine = useDeclaredEngine();
  const hostsAnchoredDisclosure = !isFrozenEngineName(declaredEngine);
  const usesFilterDropdown = Boolean(
    hasFilters && posture.filters === 'dropdown' && hostsAnchoredDisclosure,
  );
  const usesFilterDisclosure = usesFilterSheet || usesFilterDropdown;
  const inlineFiltersExpanded = filtersExpanded && !usesFilterDisclosure;
  const usesStickyActionContinuity = posture.actionBar === 'sticky-bottom';
  const usesMinimalHeader = Boolean(
    posture.compactHeader && usesStickyActionContinuity,
  );
  const actionOverflowItems = useMemo(
    () => usesStickyActionContinuity
      ? (resolvedHeader?.quickActions ?? []).filter(
          (action) => !isPrimaryCollectionAction(action, primaryAction),
        )
      : [],
    [primaryAction, resolvedHeader?.quickActions, usesStickyActionContinuity],
  );

  const effectiveViewMode = useMemo(() => {
    if (posture.collection && postureDevice !== 'desktop') {
      return posture.collection;
    }
    return workspace.activeViewMode;
  }, [posture.collection, postureDevice, workspace.activeViewMode]);

  const showOptionalChrome = !posture.compactHeader && !postureIsPhone;
  const showContextChrome = Boolean(
    resolvedContextSlot && (surfacePosture?.regions.context ? surfacePosture.regions.context !== 'hide' : showOptionalChrome || chrome?.context === true),
  );
  const showStatsChrome = Boolean(
    resolvedStatsSlot && (surfacePosture?.regions.stats ? surfacePosture.regions.stats !== 'hide' : showOptionalChrome || chrome?.stats === true),
  );

  // Focus
  const focusEnabled = behavior?.focus?.enabled ?? false;
  const focusedKey = behavior?.focus?.focusedKey ?? null;
  const previewKey = focusedKey
    ?? (workspace.selectedKeys.length === 1 ? workspace.selectedKeys[0] : null);
  const panePosture = posture.pane ?? 'inline';
  const previewEnabled = Boolean(
    behavior?.previewRail?.enabled && behavior.previewRail.render && surfacePosture?.regions['preview-rail'] !== 'hide',
  );
  const usesPreviewSheet = previewEnabled && panePosture === 'sheet';
  const usesPreviewAccordion = previewEnabled && panePosture === 'accordion';
  const usesCompactPreview = usesPreviewSheet || usesPreviewAccordion;
  const previewRailAllowed = effectiveViewMode === 'table' || effectiveViewMode === 'list';
  const showPreviewRail = previewEnabled
    && panePosture === 'inline'
    && previewRailAllowed
    && previewKey != null;
  return {
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
  };
}
