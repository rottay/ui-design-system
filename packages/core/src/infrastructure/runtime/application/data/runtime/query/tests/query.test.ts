/**
 * useSurfaceQuery Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSurfaceQuery } from '..';
import type { SurfaceQueryParams, SurfaceQueryResult } from '..';

// Helper: create a mock query function
function createMockQueryFn<T>(items: T[], total?: number) {
  return vi.fn(async (params: SurfaceQueryParams): Promise<SurfaceQueryResult<T>> => {
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageItems = items.slice(start, end);
    return {
      data: pageItems,
      total: total ?? items.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  });
}

describe('useSurfaceQuery', () => {
  const testItems = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  describe('Initial Fetch', () => {
    it('fetches data on mount', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      // Initially loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(10); // Default pageSize
      expect(result.current.total).toBe(50);
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.error).toBeNull();
    });

    it('uses initial params', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({
          queryFn,
          initialParams: { page: 2, pageSize: 5 },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(queryFn).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, pageSize: 5 })
      );
      expect(result.current.page).toBe(2);
      expect(result.current.pageSize).toBe(5);
    });

    it('does not fetch when enabled is false', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn, enabled: false })
      );

      // Wait a tick to ensure no async call happened
      await new Promise((r) => setTimeout(r, 50));

      expect(queryFn).not.toHaveBeenCalled();
      expect(result.current.data).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('changes page', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPage(3);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.page).toBe(3);
      expect(queryFn).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3 })
      );
    });

    it('changes page size and resets to page 1', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({
          queryFn,
          initialParams: { page: 3 },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setPageSize(25);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.page).toBe(1); // Reset
      expect(result.current.pageSize).toBe(25);
    });
  });

  describe('Sorting', () => {
    it('sets sort configuration', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSort({ field: 'name', direction: 'asc' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(queryFn).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: { field: 'name', direction: 'asc' },
        })
      );
    });

    it('clears sort configuration', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({
          queryFn,
          initialParams: { sort: { field: 'name', direction: 'asc' } },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSort(undefined);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(queryFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: undefined })
      );
    });
  });

  describe('Filtering', () => {
    it('sets filters and resets to page 1', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({
          queryFn,
          initialParams: { page: 3 },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setFilters({ status: 'active' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.page).toBe(1);
      expect(queryFn).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          filters: { status: 'active' },
        })
      );
    });
  });

  describe('Search', () => {
    it('sets search and resets to page 1', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({
          queryFn,
          initialParams: { page: 2 },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSearch('hello');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.page).toBe(1);
      expect(queryFn).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          search: 'hello',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('captures errors from queryFn', async () => {
      const queryFn = vi.fn().mockRejectedValue(new Error('Network error'));
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn, onError })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('clears error on successful refetch', async () => {
      let shouldFail = true;
      const queryFn = vi.fn(async (params: SurfaceQueryParams) => {
        if (shouldFail) {
          throw new Error('Temporary error');
        }
        return { data: [], total: 0, page: params.page, pageSize: params.pageSize };
      });

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      shouldFail = false;

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Refetch', () => {
    it('refetches with current params', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCount = queryFn.mock.calls.length;

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(queryFn.mock.calls.length).toBeGreaterThan(callCount);
      });
    });
  });

  describe('Surface Props', () => {
    it('produces surfaceProps with correct structure', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const { surfaceProps } = result.current;

      expect(surfaceProps).toHaveProperty('data');
      expect(surfaceProps).toHaveProperty('loading');
      expect(surfaceProps).toHaveProperty('error');
      expect(surfaceProps).toHaveProperty('config.behavior.pagination');
      expect(surfaceProps).toHaveProperty('config.behavior.sorting');

      expect(surfaceProps.config.behavior.pagination.current).toBe(1);
      expect(surfaceProps.config.behavior.pagination.pageSize).toBe(10);
      expect(surfaceProps.config.behavior.pagination.total).toBe(50);
      expect(typeof surfaceProps.config.behavior.pagination.onChange).toBe('function');
      expect(typeof surfaceProps.config.behavior.sorting.onSortChange).toBe('function');
    });

    it('surfaceProps.data matches current data', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.surfaceProps.data).toEqual(result.current.data);
    });

    it('pagination onChange updates page', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.surfaceProps.config.behavior.pagination.onChange(2, 10);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });
    });

    it('pagination onChange with different pageSize resets page', async () => {
      const queryFn = createMockQueryFn(testItems);

      const { result } = renderHook(() =>
        useSurfaceQuery({
          queryFn,
          initialParams: { page: 3 },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.surfaceProps.config.behavior.pagination.onChange(3, 25);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(1);
        expect(result.current.pageSize).toBe(25);
      });
    });
  });

  describe('Stale Response Handling', () => {
    it('ignores stale responses from earlier fetches', async () => {
      let resolveFirst: ((value: SurfaceQueryResult<{ id: number }>) => void) | null = null;
      let callCount = 0;

      const queryFn = vi.fn(async (params: SurfaceQueryParams) => {
        callCount++;
        if (callCount === 1) {
          // First call: wait for manual resolve
          return new Promise<SurfaceQueryResult<{ id: number }>>((resolve) => {
            resolveFirst = resolve;
          });
        }
        // Second call: resolve immediately
        return {
          data: [{ id: 999 }],
          total: 1,
          page: params.page,
          pageSize: params.pageSize,
        };
      });

      const { result } = renderHook(() =>
        useSurfaceQuery({ queryFn })
      );

      // Wait for first call to be in progress
      await waitFor(() => {
        expect(queryFn).toHaveBeenCalledTimes(1);
      });

      // Trigger second fetch (changes params)
      act(() => {
        result.current.setPage(2);
      });

      // Wait for second call to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Now resolve the first (stale) call
      if (resolveFirst) {
        resolveFirst({
          data: [{ id: 1 }, { id: 2 }],
          total: 2,
          page: 1,
          pageSize: 10,
        });
      }

      // Give time for the stale resolution to potentially update state
      await new Promise((r) => setTimeout(r, 50));

      // Should still have the second fetch's data, not the stale first
      expect(result.current.data).toEqual([{ id: 999 }]);
    });
  });
});
