/**
 * @fileoverview Shared state hook for collection workspace orchestration.
 *
 * Manages: view mode, filter lifecycle, selection state, saved view
 * activation, and mobile responsive fallbacks.
 *
 * This hook is the reusable state spine for ListSurface, SearchSurface,
 * CollectionWorkspaceSurface, and future workspace families.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefCallback } from 'react';
import {
  RESPONSIVE_BREAKPOINTS,
  breakpointForWidth,
  type ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import { useResponsive } from '@/infrastructure/runtime/responsive';
import type {
  CollectionWorkspaceConfig,
  CollectionViewMode,
  WorkspaceControlsConfig,
  CollectionBehaviorConfig,
} from '../../foundation/contracts/adaptive/collection';
interface UseCollectionWorkspaceOptions<T> {
  config: CollectionWorkspaceConfig<T>;
  /** Default view mode when none is specified. */
  defaultViewMode?: string;
  /** Ladder step below which mobile defaults apply. */
  mobileBreakpoint?: ResponsiveBreakpointKey;
}

interface UseCollectionWorkspaceReturn<T> {
  /** Resolved active view mode (respects mobile fallback). */
  activeViewMode: string;
  /** Change view mode (delegates to controls.viewMode.onChange if provided). */
  setViewMode: (mode: string) => void;

  /** Current search query (from controls.search.value or internal state). */
  searchValue: string;
  /** Update the search query. */
  setSearchValue: (value: string) => void;

  /** Current filter values (from controls or internal state). */
  filterValues: Record<string, unknown>;
  /** Apply filter changes. */
  applyFilters: (values: Record<string, unknown>) => void;
  /** Reset all filters to defaults. */
  resetFilters: () => void;
  /** Number of active (non-default) filters. */
  activeFilterCount: number;

  /** Current selection keys. */
  selectedKeys: string[];
  /** Update selection. */
  setSelection: (keys: string[], items: T[]) => void;
  /** Clear selection. */
  clearSelection: () => void;
  /** Whether any items are selected. */
  hasSelection: boolean;

  /** Active saved view ID. */
  activeSavedViewId: string | undefined;
  /** Activate a saved view. */
  activateSavedView: (viewId: string) => void;

  /** Ref for the collection box that owns responsive posture. */
  collectionRef: RefCallback<HTMLElement>;
  /** Measured container step; undefined keeps the viewport fallback. */
  containerBreakpoint: ResponsiveBreakpointKey | undefined;
  /** Whether the collection container is in mobile mode. */
  isMobile: boolean;
}

/** Whether a filter value carries a meaningful constraint. */
export function isCollectionFilterValueActive(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (value === false) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(isCollectionFilterValueActive);
  return true;
}

/**
 * Shared state hook for collection workspace orchestration.
 *
 * Centralizes view mode, filter lifecycle, selection, saved views,
 * and responsive behavior so surfaces don't reimplement these concerns.
 */
export function useCollectionWorkspace<T>(
  options: UseCollectionWorkspaceOptions<T>,
): UseCollectionWorkspaceReturn<T> {
  const { config, defaultViewMode = 'table' } = options;
  const mobileStep: ResponsiveBreakpointKey = options.mobileBreakpoint
    ?? config.presentation?.responsive?.mobileBreakpoint
    ?? 'md';
  const mobileMaxWidth = RESPONSIVE_BREAKPOINTS[mobileStep];
  const controls = config.controls;
  const behavior = config.behavior;

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------
  const [internalSearchValue, setInternalSearchValue] = useState(
    controls?.search?.value ?? '',
  );

  // The displayed value is always driven by internal state so every keystroke
  // is reflected immediately. When the search is controlled *and* debounced,
  // the parent `value` only catches up after the debounce fires; reading it
  // here would reset the field to the stale parent value on each keystroke of
  // a fast typing burst (only the last character would survive).
  const searchValue = internalSearchValue;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearchValue = useCallback(
    (value: string) => {
      setInternalSearchValue(value);

      const debounceMs = controls?.search?.debounceMs;
      if (debounceMs && debounceMs > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          controls?.search?.onChange?.(value);
        }, debounceMs);
      } else {
        controls?.search?.onChange?.(value);
      }
    },
    [controls?.search?.onChange, controls?.search?.debounceMs],
  );

  // Sync internal state from a genuine external change to the controlled value
  // (e.g. the parent clears filters or resets the query). This runs only when
  // the controlled `value` prop itself changes. It is skipped while a debounced
  // commit is still pending so an in-flight typing burst is never clobbered,
  // and skipped entirely in the uncontrolled case where internal state is the
  // sole owner of the field.
  const controlledSearchValue = controls?.search?.value;
  useEffect(() => {
    if (controlledSearchValue === undefined) return;
    if (debounceRef.current) return;
    setInternalSearchValue((current) =>
      current === controlledSearchValue ? current : controlledSearchValue,
    );
  }, [controlledSearchValue]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // View mode
  // -------------------------------------------------------------------------
  const [internalViewMode, setInternalViewMode] = useState(
    controls?.viewMode?.value ?? defaultViewMode,
  );

  // -------------------------------------------------------------------------
  // Responsive
  // -------------------------------------------------------------------------
  const [collectionNode, setCollectionNode] = useState<HTMLElement | null>(null);
  const collectionRef = useCallback((node: HTMLElement | null) => {
    setCollectionNode(node);
  }, []);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  // The viewport half comes from the one responsive snapshot, not from a
  // `matchMedia` of this hook's own: the px threshold it used to accept was a
  // breakpoint vocabulary no other owner could read.
  const { activeBreakpoint } = useResponsive();
  const viewportIsMobile =
    RESPONSIVE_BREAKPOINTS[activeBreakpoint] < mobileMaxWidth;

  useEffect(() => {
    const node = collectionNode;
    if (!node) return;

    const update = (width: number) => {
      setContainerWidth(width > 0 ? width : null);
    };
    update(node.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [collectionNode]);

  const containerBreakpoint = useMemo(
    () => (containerWidth === null ? undefined : breakpointForWidth(containerWidth)),
    [containerWidth],
  );
  const isMobile = containerWidth === null
    ? viewportIsMobile
    : containerWidth < mobileMaxWidth;

  const activeViewMode = useMemo(() => {
    const configured = controls?.viewMode?.value ?? internalViewMode;
    if (isMobile && config.presentation?.responsive?.mobileView) {
      return config.presentation.responsive.mobileView;
    }
    return configured;
  }, [controls?.viewMode?.value, internalViewMode, isMobile, config.presentation?.responsive?.mobileView]);

  const setViewMode = useCallback(
    (mode: string) => {
      setInternalViewMode(mode);
      controls?.viewMode?.onChange?.(mode as CollectionViewMode);
    },
    [controls?.viewMode?.onChange],
  );

  // -------------------------------------------------------------------------
  // Filters
  // -------------------------------------------------------------------------
  const [internalFilterValues, setInternalFilterValues] = useState<Record<string, unknown>>({});

  const filterValues = controls?.filterValues ?? internalFilterValues;

  const applyFilters = useCallback(
    (values: Record<string, unknown>) => {
      setInternalFilterValues(values);
      controls?.onFilterChange?.(values);
    },
    [controls?.onFilterChange],
  );

  const resetFilters = useCallback(() => {
    const defaults: Record<string, unknown> = {};
    for (const f of controls?.filters ?? []) {
      if (f.defaultValue !== undefined) {
        defaults[f.key] = f.defaultValue;
      }
    }
    applyFilters(defaults);
  }, [controls?.filters, applyFilters]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filterValues).filter(isCollectionFilterValueActive).length;
  }, [filterValues]);

  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);

  const selectedKeys = behavior?.selection?.selectedKeys ?? internalSelectedKeys;
  const hasSelection = selectedKeys.length > 0;

  const setSelection = useCallback(
    (keys: string[], items: T[]) => {
      setInternalSelectedKeys(keys);
      behavior?.selection?.onSelectionChange?.(keys, items);
    },
    [behavior?.selection?.onSelectionChange],
  );

  const clearSelection = useCallback(() => {
    setSelection([], []);
  }, [setSelection]);

  // -------------------------------------------------------------------------
  // Saved views
  // -------------------------------------------------------------------------
  const [internalSavedViewId, setInternalSavedViewId] = useState<string | undefined>(
    controls?.savedViews?.activeViewId,
  );

  const activeSavedViewId = controls?.savedViews?.activeViewId ?? internalSavedViewId;

  const activateSavedView = useCallback(
    (viewId: string) => {
      setInternalSavedViewId(viewId);
      controls?.savedViews?.onViewSelect?.(viewId);
    },
    [controls?.savedViews?.onViewSelect],
  );

  return {
    searchValue,
    setSearchValue,
    activeViewMode,
    setViewMode,
    filterValues,
    applyFilters,
    resetFilters,
    activeFilterCount,
    selectedKeys,
    setSelection,
    clearSelection,
    hasSelection,
    activeSavedViewId,
    activateSavedView,
    collectionRef,
    containerBreakpoint,
    isMobile,
  };
}
