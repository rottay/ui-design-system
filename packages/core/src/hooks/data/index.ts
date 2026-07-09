'use client';

/**
 * @fileoverview Data Hooks - Rottay Design System
 * @description App-facing React hooks for data fetching, pagination, filtering,
 * sorting, and export. These are **not** consumed by DS components internally —
 * Surfaces receive data as props and delegate fetching to the app layer.
 *
 * ## Ownership: app-facing utilities
 *
 * These hooks provide domain-agnostic data plumbing that apps wire into their
 * own state management. They are exported from `@rottay/design-system` for
 * convenience, but no Surface, Pattern, or Structure calls them internally.
 * The DS owns the visual contract; apps own the data pipeline.
 *
 * @remarks
 * `useSurfaceQuery` produces a `surfaceProps` object compatible with Surface
 * component prop shapes (pagination, sorting, filtering). Apps use it to
 * fetch data and then pass the results to a Surface via props.
 *
 * @example
 * ```tsx
 * // App code — the app owns the fetch, the Surface owns the render
 * const { data, loading, surfaceProps } = useSurfaceQuery({
 *   queryFn: fetchUsers,
 * });
 *
 * <ListSurface data={data} loading={loading} config={config} />
 * ```
 *
 * @status app-facing
 * @module System/Hooks/Data
 * @category App-Facing
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
  // All query parameters are individual state values rather than a single
  // params object so that changing one param (e.g. page) doesn't create a
  // new object reference for the others, minimizing downstream re-renders.
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

  // Monotonically increasing fetch ID prevents stale responses from
  // overwriting newer data. Each fetchData call increments the counter
  // and only applies results if its own ID is still the latest.
  const fetchIdRef = useRef(0);

  // Refs for callbacks keep fetchData's dependency array stable so it
  // only re-creates when query parameters change, not when the consumer
  // passes a new function reference.
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // ---- Fetch function ----
  // fetchData is memoized against all query parameters so that the
  // auto-fetch effect re-runs whenever any parameter changes.
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      // Omit empty filters and blank search strings to keep the request
      // payload clean and avoid unnecessary server-side processing.
      const params: SurfaceQueryParams = {
        page,
        pageSize,
        sort,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        search: search || undefined,
      };

      const result = await queryFnRef.current(params);

      // Guard against stale responses: if another fetch was triggered
      // while this one was in-flight, discard these results.
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
  // Because fetchData's identity changes whenever any query parameter
  // changes, this single effect handles all refetch triggers.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Refetch interval ----
  // Polling is opt-in via refetchInterval. The interval is cleared and
  // recreated whenever fetchData changes (query param updates), ensuring
  // the poll always uses the latest parameters.
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0 || !enabled) return;

    const intervalId = setInterval(fetchData, refetchInterval);
    return () => clearInterval(intervalId);
  }, [fetchData, refetchInterval, enabled]);

  // ---- Setters ----
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  // setPageSize, setFilters, and setSearch all reset to page 1 because
  // changing these parameters invalidates the current page offset --
  // e.g. switching from 10-per-page to 50-per-page makes page 5 invalid.
  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1);
  }, []);

  const setSort = useCallback(
    (newSort: { field: string; direction: 'asc' | 'desc' } | undefined) => {
      setSortState(newSort);
    },
    []
  );

  const setFilters = useCallback((newFilters: Record<string, unknown>) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);

  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch);
    setPageState(1);
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ---- Surface props ----
  // handlePaginationChange bridges the Surface component's combined
  // onChange(page, pageSize) signature with our separate setters. We
  // check which value actually changed to apply the correct setter
  // (setPageSize resets to page 1, setPage does not).
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

// ============================================================================
// Re-exports
// ============================================================================

export { useTableExport } from './table-export';
export type {
  TableExportColumn,
  UseTableExportOptions,
  UseTableExportReturn,
} from './table-export';

export { useOptimisticUpdate, useOptimisticList } from './optimistic';
export type {
  UseOptimisticUpdateOptions,
  UseOptimisticUpdateReturn,
  UseOptimisticListOptions,
  UseOptimisticListReturn,
} from './optimistic';

export { useDeferredPending } from './deferred-pending';
export type {
  UseDeferredPendingOptions,
  UseDeferredPendingResult,
} from './deferred-pending';

export { usePdfExport } from './pdf-export';
export type {
  PdfMargins,
  PdfExportOptions,
  PdfTableData,
  PdfExportColumn,
  UsePdfExportReturn,
} from './pdf-export';
