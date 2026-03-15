'use client';

/**
 * @fileoverview Data Hooks - Rottay Design System
 * @description React hooks for data fetching, pagination, filtering, and sorting.
 * Designed to integrate with Surface components (ListSurface, TableSurface, etc.).
 *
 * @remarks
 * The `useSurfaceQuery` hook provides a complete data-fetching solution with
 * built-in state management for pagination, sorting, filtering, and search.
 * It produces ready-made props that can be spread directly onto Surface components.
 *
 * @example Basic Usage
 * ```tsx
 * import { useSurfaceQuery } from '@rottay/design-system';
 *
 * const { data, loading, surfaceProps, setPage } = useSurfaceQuery({
 *   queryFn: async (params) => {
 *     const res = await fetch(`/api/users?page=${params.page}&size=${params.pageSize}`);
 *     return res.json();
 *   },
 * });
 * ```
 *
 * @example With ListSurface
 * ```tsx
 * const { surfaceProps } = useSurfaceQuery({
 *   queryFn: fetchUsers,
 * });
 *
 * <ListSurface {...surfaceProps} renderItem={(user) => <UserCard user={user} />} />
 * ```
 *
 * @module System/Hooks/Data
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters sent to the query function for fetching data.
 */
export interface SurfaceQueryParams {
  /** Current page number (1-indexed). */
  page: number;
  /** Number of items per page. */
  pageSize: number;
  /** Sort configuration. */
  sort?: { field: string; direction: 'asc' | 'desc' };
  /** Active filter values keyed by field name. */
  filters?: Record<string, unknown>;
  /** Global search query string. */
  search?: string;
}

/**
 * Expected shape of the response from the query function.
 */
export interface SurfaceQueryResult<T> {
  /** Array of data items for the current page. */
  data: T[];
  /** Total number of items across all pages. */
  total: number;
  /** Current page number. */
  page: number;
  /** Current page size. */
  pageSize: number;
}

/**
 * Options for configuring the `useSurfaceQuery` hook.
 */
export interface UseSurfaceQueryOptions<T> {
  /**
   * Async function that fetches data given the current query parameters.
   * Must return a `SurfaceQueryResult<T>`.
   */
  queryFn: (params: SurfaceQueryParams) => Promise<SurfaceQueryResult<T>>;

  /**
   * Initial parameter overrides. Merged with defaults (page=1, pageSize=10).
   */
  initialParams?: Partial<SurfaceQueryParams>;

  /**
   * Whether the query should execute. Set to false to defer fetching.
   * @default true
   */
  enabled?: boolean;

  /**
   * Interval in ms to automatically refetch data. Set to 0 or undefined to disable.
   */
  refetchInterval?: number;

  /**
   * Callback invoked when the query function throws.
   */
  onError?: (error: Error) => void;
}

/**
 * Return type of the `useSurfaceQuery` hook.
 */
export interface UseSurfaceQueryReturn<T> {
  /** Current page data. */
  data: T[];
  /** Total number of items across all pages. */
  total: number;
  /** Whether a fetch is in progress. */
  loading: boolean;
  /** The last error encountered, or null. */
  error: Error | null;
  /** Current page number. */
  page: number;
  /** Current page size. */
  pageSize: number;
  /** Navigate to a specific page. */
  setPage: (page: number) => void;
  /** Change the number of items per page (resets to page 1). */
  setPageSize: (size: number) => void;
  /** Update sort configuration. */
  setSort: (sort: { field: string; direction: 'asc' | 'desc' } | undefined) => void;
  /** Replace the current filter values. */
  setFilters: (filters: Record<string, unknown>) => void;
  /** Set the global search string (resets to page 1). */
  setSearch: (search: string) => void;
  /** Manually trigger a refetch with current parameters. */
  refetch: () => void;
  /**
   * Ready-made props object designed to be spread onto a Surface component.
   * Contains data, loading, error, and config for pagination/sorting.
   */
  surfaceProps: {
    data: T[];
    loading: boolean;
    error: Error | null;
    config: {
      behavior: {
        pagination: {
          current: number;
          pageSize: number;
          total: number;
          onChange: (page: number, pageSize: number) => void;
        };
        sorting: {
          sort: { field: string; direction: 'asc' | 'desc' } | undefined;
          onSortChange: (sort: { field: string; direction: 'asc' | 'desc' } | undefined) => void;
        };
      };
    };
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Data fetching hook designed for Surface components.
 *
 * Manages pagination, sorting, filtering, and search state internally,
 * automatically refetching when any parameter changes. Produces a `surfaceProps`
 * object that can be spread directly onto ListSurface / TableSurface components.
 *
 * @param options - Hook configuration
 * @returns Data state plus control functions and ready-made surface props
 *
 * @example
 * ```tsx
 * const { data, loading, setPage, setSearch, surfaceProps } = useSurfaceQuery({
 *   queryFn: async (params) => {
 *     const res = await fetch(`/api/users?page=${params.page}&q=${params.search || ''}`);
 *     return res.json();
 *   },
 *   initialParams: { pageSize: 20 },
 * });
 * ```
 */
export function useSurfaceQuery<T>(
  options: UseSurfaceQueryOptions<T>
): UseSurfaceQueryReturn<T> {
  const {
    queryFn,
    initialParams = {},
    enabled = true,
    refetchInterval,
    onError,
  } = options;

  // ---- State ----
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPageState] = useState(initialParams.page ?? 1);
  const [pageSize, setPageSizeState] = useState(initialParams.pageSize ?? 10);
  const [sort, setSortState] = useState<{ field: string; direction: 'asc' | 'desc' } | undefined>(
    initialParams.sort
  );
  const [filters, setFiltersState] = useState<Record<string, unknown>>(
    initialParams.filters ?? {}
  );
  const [search, setSearchState] = useState(initialParams.search ?? '');

  // Track latest fetch to avoid stale responses
  const fetchIdRef = useRef(0);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // ---- Fetch function ----
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const params: SurfaceQueryParams = {
        page,
        pageSize,
        sort,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        search: search || undefined,
      };

      const result = await queryFnRef.current(params);

      // Only apply if this is still the latest fetch
      if (fetchId === fetchIdRef.current) {
        setData(result.data);
        setTotal(result.total);
      }
    } catch (err) {
      if (fetchId === fetchIdRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, page, pageSize, sort, filters, search]);

  // ---- Auto-fetch on param changes ----
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Refetch interval ----
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0 || !enabled) return;

    const intervalId = setInterval(fetchData, refetchInterval);
    return () => clearInterval(intervalId);
  }, [fetchData, refetchInterval, enabled]);

  // ---- Setters ----
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1); // Reset to first page on page size change
  }, []);

  const setSort = useCallback(
    (newSort: { field: string; direction: 'asc' | 'desc' } | undefined) => {
      setSortState(newSort);
    },
    []
  );

  const setFilters = useCallback((newFilters: Record<string, unknown>) => {
    setFiltersState(newFilters);
    setPageState(1); // Reset to first page on filter change
  }, []);

  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch);
    setPageState(1); // Reset to first page on search change
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ---- Surface props ----
  const handlePaginationChange = useCallback(
    (newPage: number, newPageSize: number) => {
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
      } else {
        setPage(newPage);
      }
    },
    [pageSize, setPage, setPageSize]
  );

  const surfaceProps = {
    data,
    loading,
    error,
    config: {
      behavior: {
        pagination: {
          current: page,
          pageSize,
          total,
          onChange: handlePaginationChange,
        },
        sorting: {
          sort,
          onSortChange: setSort,
        },
      },
    },
  };

  return {
    data,
    total,
    loading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
    setSort,
    setFilters,
    setSearch,
    refetch,
    surfaceProps,
  };
}
