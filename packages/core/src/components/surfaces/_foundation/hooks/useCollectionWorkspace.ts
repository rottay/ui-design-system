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
import type {
  CollectionWorkspaceConfig,
  WorkspaceControlsConfig,
  CollectionBehaviorConfig,
} from '../../contracts/collection';

interface UseCollectionWorkspaceOptions<T> {
  config: CollectionWorkspaceConfig<T>;
  /** Default view mode when none is specified. */
  defaultViewMode?: string;
  /** Breakpoint below which mobile defaults apply (px). */
  mobileBreakpoint?: number;
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

  /** Whether the viewport is in mobile mode. */
  isMobile: boolean;
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
  const resolvedBreakpoint = options.mobileBreakpoint
    ?? config.presentation?.responsive?.mobileBreakpoint
    ?? 768;
  const controls = config.controls;
  const behavior = config.behavior;

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------
  const [internalSearchValue, setInternalSearchValue] = useState(
    controls?.search?.value ?? '',
  );

  const searchValue = controls?.search?.value ?? internalSearchValue;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearchValue = useCallback(
    (value: string) => {
      setInternalSearchValue(value);

      const debounceMs = controls?.search?.debounceMs;
      if (debounceMs && debounceMs > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          controls?.search?.onChange?.(value);
        }, debounceMs);
      } else {
        controls?.search?.onChange?.(value);
      }
    },
    [controls?.search?.onChange, controls?.search?.debounceMs],
  );

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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${resolvedBreakpoint}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${resolvedBreakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [resolvedBreakpoint]);

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
      controls?.viewMode?.onChange?.(mode);
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
    return Object.values(filterValues).filter(
      (v) => v !== undefined && v !== null && v !== '',
    ).length;
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
    isMobile,
  };
}
