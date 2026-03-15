'use client';

/**
 * @fileoverview useLayoutPreference Hook - Rottay Design System
 * @description React hook for persisting and managing layout preferences such as
 * sidebar state, column configuration, density, view mode, sorting, and filters.
 * SSR-safe with debounced storage writes.
 *
 * @remarks
 * Features:
 * - Persists preferences to localStorage or sessionStorage
 * - SSR-safe: reads from storage only after mount (hydration-safe)
 * - Debounced writes to avoid spamming storage on rapid updates (column resize)
 * - Deep merge on partial updates
 * - Column management helpers: visibility, width, reorder
 * - Ready-made props for ListSurface integration
 * - Reset to defaults
 *
 * @example Basic usage
 * ```tsx
 * const { preference, setPreference, toggleSidebar } = useLayoutPreference({
 *   key: 'events-list',
 *   defaults: {
 *     viewMode: 'table',
 *     density: 'comfortable',
 *     sidebarCollapsed: false,
 *     columns: [
 *       { key: 'name', visible: true, width: 200, order: 0 },
 *       { key: 'date', visible: true, width: 150, order: 1 },
 *       { key: 'status', visible: true, width: 100, order: 2 },
 *     ],
 *   },
 * });
 * ```
 *
 * @example With ListSurface
 * ```tsx
 * const { listSurfaceProps } = useLayoutPreference({
 *   key: 'users-table',
 *   defaults: { viewMode: 'table', density: 'comfortable', columns: [...] },
 * });
 *
 * <ListSurface {...listSurfaceProps} data={users} />
 * ```
 *
 * @module System/Hooks/State/LayoutPreference
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Column configuration for table/list layouts.
 */
export interface ColumnPreference {
  /** Unique column identifier. */
  key: string;
  /** Whether the column is visible. */
  visible: boolean;
  /** Column width in pixels. */
  width?: number;
  /** Display order (0-based). */
  order?: number;
}

/**
 * Layout preference values that can be persisted.
 */
export interface LayoutPreference {
  /** Whether the sidebar is collapsed. */
  sidebarCollapsed?: boolean;
  /** Sidebar width in pixels. */
  sidebarWidth?: number;
  /** Column configuration. */
  columns?: ColumnPreference[];
  /** Content density. */
  density?: 'compact' | 'comfortable' | 'spacious';
  /** View mode identifier (e.g., 'table', 'cards', 'grid', 'list'). */
  viewMode?: string;
  /** Field to sort by. */
  sortField?: string;
  /** Sort direction. */
  sortDirection?: 'asc' | 'desc';
  /** Active filter values keyed by field name. */
  filters?: Record<string, unknown>;
  /** Number of items per page. */
  pageSize?: number;
  /** Extensible: any additional layout-related preferences. */
  [key: string]: unknown;
}

/**
 * Configuration options for the `useLayoutPreference` hook.
 */
export interface UseLayoutPreferenceOptions {
  /** Unique key for this layout. Used as the storage key prefix. */
  key: string;
  /** Default preference values. Used on first load and for reset(). */
  defaults: LayoutPreference;
  /** Storage backend. @default 'localStorage' */
  storage?: 'localStorage' | 'sessionStorage';
  /** Debounce interval in ms for storage writes. @default 300 */
  debounceMs?: number;
}

/**
 * Return type of the `useLayoutPreference` hook.
 */
export interface UseLayoutPreferenceReturn {
  /** Current preference values. */
  preference: LayoutPreference;
  /** Partially update preferences (deep merged with current). */
  setPreference: (update: Partial<LayoutPreference>) => void;
  /** Reset all preferences to defaults. */
  resetPreference: () => void;
  /** Toggle the sidebar collapsed state. */
  toggleSidebar: () => void;
  /** Set the width of a specific column by key. */
  setColumnWidth: (key: string, width: number) => void;
  /** Set the visibility of a specific column by key. */
  setColumnVisibility: (key: string, visible: boolean) => void;
  /** Reorder columns by moving one from `fromIndex` to `toIndex`. */
  reorderColumns: (fromIndex: number, toIndex: number) => void;
  /** Ready-made props for ListSurface integration. */
  listSurfaceProps: {
    columns: ColumnPreference[];
    density: string;
    viewMode: string;
  };
}

// ============================================================================
// Utilities
// ============================================================================

const STORAGE_PREFIX = 'ds-layout-';

/**
 * Deep merge two objects. Arrays are replaced (not concatenated).
 * Only merges plain objects; other types are overwritten.
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== null &&
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      targetValue !== undefined &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      // Both are plain objects: recurse
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else {
      result[key] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Safely read from web storage. Returns null if unavailable or on error.
 */
function readFromStorage(
  storageType: 'localStorage' | 'sessionStorage',
  key: string
): LayoutPreference | null {
  if (typeof window === 'undefined') return null;

  try {
    const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
    const raw = storage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as LayoutPreference;
  } catch {
    return null;
  }
}

/**
 * Safely write to web storage.
 */
function writeToStorage(
  storageType: 'localStorage' | 'sessionStorage',
  key: string,
  value: LayoutPreference
): void {
  if (typeof window === 'undefined') return;

  try {
    const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
    storage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable - silently ignore
  }
}

/**
 * Safely remove from web storage.
 */
function removeFromStorage(
  storageType: 'localStorage' | 'sessionStorage',
  key: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
    storage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Silently ignore
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * React hook for persisting and managing layout preferences.
 *
 * Reads stored preferences on mount (SSR-safe), merges them with provided
 * defaults, and debounces writes back to storage. Provides convenience
 * helpers for common layout operations like toggling sidebars, resizing
 * columns, and reordering.
 *
 * @param options - Hook configuration
 * @returns Preference state, setters, helpers, and ListSurface integration props
 *
 * @example
 * ```tsx
 * function EventsPage() {
 *   const { preference, setPreference, toggleSidebar, listSurfaceProps } = useLayoutPreference({
 *     key: 'events-list',
 *     defaults: {
 *       viewMode: 'table',
 *       density: 'comfortable',
 *       sidebarCollapsed: false,
 *       columns: [
 *         { key: 'name', visible: true, width: 200, order: 0 },
 *         { key: 'date', visible: true, width: 150, order: 1 },
 *       ],
 *     },
 *   });
 *
 *   return (
 *     <Flex>
 *       <Sidebar collapsed={preference.sidebarCollapsed} onToggle={toggleSidebar} />
 *       <ListSurface {...listSurfaceProps} data={events} />
 *     </Flex>
 *   );
 * }
 * ```
 */
export function useLayoutPreference(
  options: UseLayoutPreferenceOptions
): UseLayoutPreferenceReturn {
  const {
    key,
    defaults,
    storage: storageType = 'localStorage',
    debounceMs = 300,
  } = options;

  // Refs for stable access
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const storageTypeRef = useRef(storageType);
  storageTypeRef.current = storageType;

  const keyRef = useRef(key);
  keyRef.current = key;

  // State: starts with defaults (SSR-safe), hydrated on mount
  const [preference, setPreferenceState] = useState<LayoutPreference>(defaults);

  // Track whether we've hydrated from storage
  const hydratedRef = useRef(false);

  // Hydrate from storage on mount (client-side only)
  useEffect(() => {
    const stored = readFromStorage(storageType, key);
    if (stored) {
      // Deep merge stored values over defaults to handle new default keys
      const merged = deepMerge(defaults, stored);
      setPreferenceState(merged);
    }
    hydratedRef.current = true;
  }, [key, storageType, defaults]);

  // Debounced write to storage
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWriteRef = useRef<LayoutPreference | null>(null);

  const scheduleWrite = useCallback(
    (value: LayoutPreference) => {
      pendingWriteRef.current = value;

      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (pendingWriteRef.current !== null) {
          writeToStorage(
            storageTypeRef.current,
            keyRef.current,
            pendingWriteRef.current
          );
          pendingWriteRef.current = null;
        }
        debounceTimerRef.current = null;
      }, debounceMs);
    },
    [debounceMs]
  );

  // Cleanup debounce timer and flush on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        // Flush pending write on unmount
        if (pendingWriteRef.current !== null) {
          writeToStorage(
            storageTypeRef.current,
            keyRef.current,
            pendingWriteRef.current
          );
          pendingWriteRef.current = null;
        }
      }
    };
  }, []);

  // Partial update with deep merge
  const setPreference = useCallback(
    (update: Partial<LayoutPreference>) => {
      setPreferenceState((prev) => {
        const next = deepMerge(prev, update);
        scheduleWrite(next);
        return next;
      });
    },
    [scheduleWrite]
  );

  // Reset to defaults and clear storage
  const resetPreference = useCallback(() => {
    setPreferenceState(defaultsRef.current);
    removeFromStorage(storageTypeRef.current, keyRef.current);

    // Cancel any pending debounced write
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      pendingWriteRef.current = null;
    }
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebar = useCallback(() => {
    setPreferenceState((prev) => {
      const next = { ...prev, sidebarCollapsed: !prev.sidebarCollapsed };
      scheduleWrite(next);
      return next;
    });
  }, [scheduleWrite]);

  // Update a specific column's width
  const setColumnWidth = useCallback(
    (columnKey: string, width: number) => {
      setPreferenceState((prev) => {
        const columns = (prev.columns ?? []).map((col) =>
          col.key === columnKey ? { ...col, width } : col
        );
        const next = { ...prev, columns };
        scheduleWrite(next);
        return next;
      });
    },
    [scheduleWrite]
  );

  // Update a specific column's visibility
  const setColumnVisibility = useCallback(
    (columnKey: string, visible: boolean) => {
      setPreferenceState((prev) => {
        const columns = (prev.columns ?? []).map((col) =>
          col.key === columnKey ? { ...col, visible } : col
        );
        const next = { ...prev, columns };
        scheduleWrite(next);
        return next;
      });
    },
    [scheduleWrite]
  );

  // Reorder columns by moving one from fromIndex to toIndex
  const reorderColumns = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPreferenceState((prev) => {
        const columns = [...(prev.columns ?? [])];

        if (
          fromIndex < 0 ||
          fromIndex >= columns.length ||
          toIndex < 0 ||
          toIndex >= columns.length ||
          fromIndex === toIndex
        ) {
          return prev;
        }

        // Remove the item from its current position
        const [moved] = columns.splice(fromIndex, 1);
        // Insert at the new position
        columns.splice(toIndex, 0, moved);

        // Update order values to match new positions
        const reordered = columns.map((col, idx) => ({
          ...col,
          order: idx,
        }));

        const next = { ...prev, columns: reordered };
        scheduleWrite(next);
        return next;
      });
    },
    [scheduleWrite]
  );

  // Ready-made props for ListSurface integration
  const listSurfaceProps = useMemo(
    () => ({
      columns: preference.columns ?? [],
      density: preference.density ?? 'comfortable',
      viewMode: preference.viewMode ?? 'table',
    }),
    [preference.columns, preference.density, preference.viewMode]
  );

  return {
    preference,
    setPreference,
    resetPreference,
    toggleSidebar,
    setColumnWidth,
    setColumnVisibility,
    reorderColumns,
    listSurfaceProps,
  };
}
