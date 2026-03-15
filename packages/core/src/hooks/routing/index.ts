'use client';

/**
 * @fileoverview Routing Hooks - Rottay Design System
 * @description Framework-agnostic hook for syncing Surface state with URL query params.
 *
 * @remarks
 * The `useRouterState` hook provides bidirectional synchronization between
 * component state (pagination, sorting, filtering, search) and URL query
 * parameters. It is intentionally framework-agnostic: the consumer supplies
 * `getSearchParams` / `setSearchParams` adapters for their router (Next.js,
 * React Router, vanilla `window.location`).
 *
 * If no adapter is provided the hook falls back to in-memory state, making it
 * safe to use in tests and SSR environments.
 *
 * @example Next.js App Router
 * ```tsx
 * import { useRouterState } from '@rottay/design-system';
 * import { useSearchParams, useRouter, usePathname } from 'next/navigation';
 *
 * function UsersPage() {
 *   const searchParams = useSearchParams();
 *   const router = useRouter();
 *   const pathname = usePathname();
 *
 *   const { state, setState, surfaceQueryProps } = useRouterState({
 *     defaults: { page: 1, pageSize: 20, search: '' },
 *     getSearchParams: () => new URLSearchParams(searchParams.toString()),
 *     setSearchParams: (params) => {
 *       router.replace(`${pathname}?${params.toString()}`);
 *     },
 *   });
 *
 *   const query = useSurfaceQuery({
 *     queryFn: fetchUsers,
 *     initialParams: surfaceQueryProps,
 *   });
 * }
 * ```
 *
 * @example In-memory fallback (no router)
 * ```tsx
 * const { state, setState, resetState } = useRouterState({
 *   defaults: { page: 1, pageSize: 10, search: '' },
 * });
 * ```
 *
 * @module System/Hooks/Routing
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for the `useRouterState` hook.
 */
export interface UseRouterStateOptions<T extends Record<string, any>> {
  /** Default values for every state key. Used on initial load and reset. */
  defaults: T;

  /**
   * Custom serializer: converts the typed state object into string key-value
   * pairs suitable for URL search params. If omitted, the built-in serializer
   * uses `JSON.stringify` for objects/arrays, `String()` for primitives, and
   * omits values that match their default.
   */
  serialize?: (state: T) => Record<string, string>;

  /**
   * Custom deserializer: converts URL search param strings back into the
   * typed state shape. If omitted, the built-in deserializer uses
   * `JSON.parse` for values that look like JSON, otherwise returns the raw
   * string.
   */
  deserialize?: (params: Record<string, string>) => Partial<T>;

  /**
   * Debounce delay in milliseconds before pushing state changes to the URL.
   * Prevents spamming the browser history on rapid state updates (e.g. typing
   * in a search field).
   * @default 300
   */
  debounceMs?: number;

  /**
   * Reads the current URL search params. The consumer provides this so the
   * hook stays framework-agnostic.
   *
   * If omitted, the hook falls back to pure in-memory state (no URL sync).
   */
  getSearchParams?: () => URLSearchParams;

  /**
   * Writes new URL search params. The consumer provides this so the hook
   * stays framework-agnostic.
   *
   * If omitted, the hook falls back to pure in-memory state (no URL sync).
   */
  setSearchParams?: (params: URLSearchParams) => void;
}

/**
 * Return type of the `useRouterState` hook.
 */
export interface UseRouterStateReturn<T extends Record<string, any>> {
  /** The current merged state (defaults + URL overrides). */
  state: T;

  /** Partially update the state. Merged with current state. */
  setState: (update: Partial<T>) => void;

  /** Reset all state to defaults and clear URL params. */
  resetState: () => void;

  /**
   * Ready-made props object designed for `useSurfaceQuery` integration.
   * Extracts the standard pagination/sort/filter/search fields from state.
   */
  surfaceQueryProps: {
    page: number;
    pageSize: number;
    sort?: { field: string; direction: 'asc' | 'desc' };
    filters?: Record<string, any>;
    search?: string;
  };
}

// ============================================================================
// Internal Utilities
// ============================================================================

/**
 * Default serializer: converts state values to URL-safe strings.
 * Omits values that match their default to keep URLs clean.
 */
function defaultSerialize<T extends Record<string, any>>(
  state: T,
  defaults: T
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key of Object.keys(state)) {
    const value = state[key];
    const defaultValue = defaults[key];

    // Skip values that match defaults (keep URL clean)
    if (JSON.stringify(value) === JSON.stringify(defaultValue)) {
      continue;
    }

    // Skip undefined/null
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'object') {
      result[key] = JSON.stringify(value);
    } else {
      result[key] = String(value);
    }
  }

  return result;
}

/**
 * Default deserializer: parses URL param strings back into typed values.
 * Uses the defaults object to infer the expected type for each key.
 */
function defaultDeserialize<T extends Record<string, any>>(
  params: Record<string, string>,
  defaults: T
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(params)) {
    if (!(key in defaults)) continue;

    const raw = params[key];
    const defaultValue = defaults[key];

    try {
      if (typeof defaultValue === 'number') {
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) {
          (result as any)[key] = parsed;
        }
      } else if (typeof defaultValue === 'boolean') {
        (result as any)[key] = raw === 'true';
      } else if (typeof defaultValue === 'object' && defaultValue !== null) {
        (result as any)[key] = JSON.parse(raw);
      } else {
        // string or unknown -> keep as string
        (result as any)[key] = raw;
      }
    } catch {
      // If parsing fails, skip this key (fall back to default)
    }
  }

  return result;
}

/**
 * Extract a plain object from URLSearchParams.
 */
function searchParamsToRecord(params: URLSearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  params.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

/**
 * Parse sort string ("field:direction") into a sort object.
 */
function parseSortParam(
  value: unknown
): { field: string; direction: 'asc' | 'desc' } | undefined {
  if (!value || typeof value !== 'string') return undefined;
  const [field, dir] = value.split(':');
  if (!field) return undefined;
  return {
    field,
    direction: dir === 'desc' ? 'desc' : 'asc',
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Framework-agnostic hook for syncing surface state with URL query params.
 *
 * Provides bidirectional synchronization between component state and URL
 * search parameters with debounced updates. Produces `surfaceQueryProps`
 * that integrate directly with `useSurfaceQuery`.
 *
 * @param options - Hook configuration
 * @returns State, control functions, and Surface integration props
 *
 * @example
 * ```tsx
 * const { state, setState, surfaceQueryProps } = useRouterState({
 *   defaults: { page: 1, pageSize: 20, search: '', sort: '' },
 *   getSearchParams: () => new URLSearchParams(window.location.search),
 *   setSearchParams: (params) => {
 *     window.history.replaceState(null, '', `?${params.toString()}`);
 *   },
 * });
 * ```
 */
export function useRouterState<T extends Record<string, any>>(
  options: UseRouterStateOptions<T>
): UseRouterStateReturn<T> {
  const {
    defaults,
    serialize,
    deserialize,
    debounceMs = 300,
    getSearchParams,
    setSearchParams,
  } = options;

  const hasRouter = !!(getSearchParams && setSearchParams);

  // Stable refs for callbacks to avoid effect re-runs
  const serializeRef = useRef(serialize);
  serializeRef.current = serialize;

  const deserializeRef = useRef(deserialize);
  deserializeRef.current = deserialize;

  const getSearchParamsRef = useRef(getSearchParams);
  getSearchParamsRef.current = getSearchParams;

  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flag to prevent URL -> state -> URL loop
  const isUpdatingFromUrlRef = useRef(false);

  // ---- Read initial state from URL (or use defaults) ----
  const getInitialState = useCallback((): T => {
    if (!hasRouter || !getSearchParamsRef.current) {
      return { ...defaults };
    }

    try {
      const urlParams = getSearchParamsRef.current();
      const raw = searchParamsToRecord(urlParams);

      if (Object.keys(raw).length === 0) {
        return { ...defaults };
      }

      const deserialized = deserializeRef.current
        ? deserializeRef.current(raw)
        : defaultDeserialize(raw, defaults);

      return { ...defaults, ...deserialized };
    } catch {
      return { ...defaults };
    }
  }, [defaults, hasRouter]);

  const [state, setStateInternal] = useState<T>(getInitialState);

  // ---- Push state to URL (debounced) ----
  const pushToUrl = useCallback(
    (newState: T) => {
      if (!hasRouter || !setSearchParamsRef.current) return;

      // Clear any pending debounce
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;

        const serialized = serializeRef.current
          ? serializeRef.current(newState)
          : defaultSerialize(newState, defaultsRef.current);

        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(serialized)) {
          if (value !== '' && value !== undefined) {
            params.set(key, value);
          }
        }

        isUpdatingFromUrlRef.current = true;
        setSearchParamsRef.current!(params);

        // Reset the flag after a microtask to allow sync effects to see it
        Promise.resolve().then(() => {
          isUpdatingFromUrlRef.current = false;
        });
      }, debounceMs);
    },
    [hasRouter, debounceMs]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // ---- setState (partial update) ----
  const setState = useCallback(
    (update: Partial<T>) => {
      setStateInternal((prev) => {
        const next = { ...prev, ...update };
        pushToUrl(next);
        return next;
      });
    },
    [pushToUrl]
  );

  // ---- resetState ----
  const resetState = useCallback(() => {
    const fresh = { ...defaultsRef.current };
    setStateInternal(fresh);

    // Clear URL immediately (no debounce for reset)
    if (hasRouter && setSearchParamsRef.current) {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      isUpdatingFromUrlRef.current = true;
      setSearchParamsRef.current(new URLSearchParams());
      Promise.resolve().then(() => {
        isUpdatingFromUrlRef.current = false;
      });
    }
  }, [hasRouter]);

  // ---- Build surfaceQueryProps ----
  const surfaceQueryProps = useMemo(() => {
    const page = typeof state.page === 'number' ? state.page : 1;
    const pageSize = typeof state.pageSize === 'number' ? state.pageSize : 10;

    // Sort: support both object and "field:direction" string formats
    let sort: { field: string; direction: 'asc' | 'desc' } | undefined;
    if (state.sort && typeof state.sort === 'object' && state.sort.field) {
      sort = state.sort as { field: string; direction: 'asc' | 'desc' };
    } else if (typeof state.sort === 'string' && state.sort) {
      sort = parseSortParam(state.sort);
    }

    // Filters: look for a dedicated `filters` key
    let filters: Record<string, any> | undefined;
    if (state.filters && typeof state.filters === 'object') {
      const filterKeys = Object.keys(state.filters);
      if (filterKeys.length > 0) {
        filters = state.filters;
      }
    }

    // Search
    const search = typeof state.search === 'string' && state.search
      ? state.search
      : undefined;

    return { page, pageSize, sort, filters, search };
  }, [state]);

  return {
    state,
    setState,
    resetState,
    surfaceQueryProps,
  };
}
