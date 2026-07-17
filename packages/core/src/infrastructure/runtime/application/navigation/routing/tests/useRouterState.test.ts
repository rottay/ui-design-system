/**
 * useRouterState Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRouterState } from '../index';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Creates a mock router adapter backed by an in-memory URLSearchParams.
 */
function createMockRouter() {
  let params = new URLSearchParams();

  return {
    getSearchParams: vi.fn(() => new URLSearchParams(params.toString())),
    setSearchParams: vi.fn((newParams: URLSearchParams) => {
      params = new URLSearchParams(newParams.toString());
    }),
    /** Read the current internal params (for test assertions). */
    getCurrentParams: () => params,
    /** Seed the params before a test. */
    setParams: (init: Record<string, string>) => {
      params = new URLSearchParams(init);
    },
  };
}

describe('useRouterState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==========================================================================
  // In-memory mode (no router adapter)
  // ==========================================================================

  describe('In-Memory Mode (no router)', () => {
    it('initializes with defaults', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
        })
      );

      expect(result.current.state).toEqual({
        page: 1,
        pageSize: 10,
        search: '',
      });
    });

    it('updates state via setState', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
        })
      );

      act(() => {
        result.current.setState({ page: 3 });
      });

      expect(result.current.state.page).toBe(3);
      expect(result.current.state.pageSize).toBe(10);
      expect(result.current.state.search).toBe('');
    });

    it('merges partial updates', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
        })
      );

      act(() => {
        result.current.setState({ search: 'hello' });
      });

      act(() => {
        result.current.setState({ page: 2 });
      });

      expect(result.current.state).toEqual({
        page: 2,
        pageSize: 10,
        search: 'hello',
      });
    });

    it('resets to defaults', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
        })
      );

      act(() => {
        result.current.setState({ page: 5, search: 'test' });
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.state).toEqual({
        page: 1,
        pageSize: 10,
        search: '',
      });
    });
  });

  // ==========================================================================
  // Router mode (with adapter)
  // ==========================================================================

  describe('Router Mode (with adapter)', () => {
    it('reads initial state from URL params', () => {
      const router = createMockRouter();
      router.setParams({ page: '3', search: 'foo' });

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      expect(result.current.state.page).toBe(3);
      expect(result.current.state.search).toBe('foo');
      expect(result.current.state.pageSize).toBe(10); // from defaults
    });

    it('pushes state changes to URL after debounce', () => {
      const router = createMockRouter();

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
          debounceMs: 100,
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      act(() => {
        result.current.setState({ page: 5 });
      });

      // Not yet pushed (debounce hasn't fired)
      expect(router.setSearchParams).not.toHaveBeenCalled();

      // Advance past debounce
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(router.setSearchParams).toHaveBeenCalledTimes(1);
      const pushedParams = router.setSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(pushedParams.get('page')).toBe('5');
    });

    it('debounces rapid state changes', () => {
      const router = createMockRouter();

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
          debounceMs: 200,
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      // Rapid-fire updates
      act(() => {
        result.current.setState({ search: 'a' });
      });

      act(() => {
        vi.advanceTimersByTime(50);
        result.current.setState({ search: 'ab' });
      });

      act(() => {
        vi.advanceTimersByTime(50);
        result.current.setState({ search: 'abc' });
      });

      // No push yet
      expect(router.setSearchParams).not.toHaveBeenCalled();

      // Advance past debounce
      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Only one push with the final value
      expect(router.setSearchParams).toHaveBeenCalledTimes(1);
      const params = router.setSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.get('search')).toBe('abc');
    });

    it('omits default values from URL', () => {
      const router = createMockRouter();

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
          debounceMs: 0,
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      act(() => {
        result.current.setState({ search: 'hello' });
      });

      act(() => {
        vi.advanceTimersByTime(10);
      });

      const params = router.setSearchParams.mock.calls[0][0] as URLSearchParams;
      // page=1 and pageSize=10 are defaults, should be omitted
      expect(params.has('page')).toBe(false);
      expect(params.has('pageSize')).toBe(false);
      expect(params.get('search')).toBe('hello');
    });

    it('clears URL on resetState (no debounce)', () => {
      const router = createMockRouter();
      router.setParams({ page: '5', search: 'test' });

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
          debounceMs: 300,
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      act(() => {
        result.current.resetState();
      });

      // Reset should push immediately (no debounce)
      expect(router.setSearchParams).toHaveBeenCalledTimes(1);
      const params = router.setSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.toString()).toBe('');

      // State should be defaults
      expect(result.current.state).toEqual({
        page: 1,
        pageSize: 10,
        search: '',
      });
    });
  });

  // ==========================================================================
  // Type coercion / deserialization
  // ==========================================================================

  describe('Deserialization', () => {
    it('coerces number params from URL strings', () => {
      const router = createMockRouter();
      router.setParams({ page: '7', pageSize: '25' });

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10 },
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      expect(result.current.state.page).toBe(7);
      expect(typeof result.current.state.page).toBe('number');
      expect(result.current.state.pageSize).toBe(25);
    });

    it('coerces boolean params from URL strings', () => {
      const router = createMockRouter();
      router.setParams({ showArchived: 'true' });

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, showArchived: false },
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      expect(result.current.state.showArchived).toBe(true);
    });

    it('parses JSON object params from URL', () => {
      const router = createMockRouter();
      router.setParams({
        filters: JSON.stringify({ status: 'active', role: 'admin' }),
      });

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, filters: {} as Record<string, string> },
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      expect(result.current.state.filters).toEqual({
        status: 'active',
        role: 'admin',
      });
    });

    it('ignores unknown URL params not in defaults', () => {
      const router = createMockRouter();
      router.setParams({ page: '2', unknown_param: 'xyz' });

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, search: '' },
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      expect(result.current.state).toEqual({ page: 2, search: '' });
      expect((result.current.state as any).unknown_param).toBeUndefined();
    });

    it('falls back to default on invalid number in URL', () => {
      const router = createMockRouter();
      router.setParams({ page: 'not-a-number' });

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1 },
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      expect(result.current.state.page).toBe(1);
    });
  });

  // ==========================================================================
  // Custom serialize / deserialize
  // ==========================================================================

  describe('Custom Serialize / Deserialize', () => {
    it('uses custom serializer', () => {
      const router = createMockRouter();

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10 },
          debounceMs: 0,
          serialize: (state) => ({
            p: String(state.page),
            s: String(state.pageSize),
          }),
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      act(() => {
        result.current.setState({ page: 3 });
      });

      act(() => {
        vi.advanceTimersByTime(10);
      });

      const params = router.setSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.get('p')).toBe('3');
      expect(params.get('s')).toBe('10');
    });

    it('uses custom deserializer', () => {
      const router = createMockRouter();
      router.setParams({ p: '5', q: 'hello' });

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, search: '' },
          deserialize: (params) => ({
            page: params.p ? Number(params.p) : undefined,
            search: params.q,
          }),
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      expect(result.current.state.page).toBe(5);
      expect(result.current.state.search).toBe('hello');
    });
  });

  // ==========================================================================
  // surfaceQueryProps
  // ==========================================================================

  describe('surfaceQueryProps', () => {
    it('extracts page and pageSize', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 3, pageSize: 25, search: '' },
        })
      );

      expect(result.current.surfaceQueryProps.page).toBe(3);
      expect(result.current.surfaceQueryProps.pageSize).toBe(25);
    });

    it('extracts search', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: 'hello' },
        })
      );

      expect(result.current.surfaceQueryProps.search).toBe('hello');
    });

    it('returns undefined search when empty', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
        })
      );

      expect(result.current.surfaceQueryProps.search).toBeUndefined();
    });

    it('extracts sort object', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: {
            page: 1,
            pageSize: 10,
            sort: { field: 'name', direction: 'asc' as const },
          },
        })
      );

      expect(result.current.surfaceQueryProps.sort).toEqual({
        field: 'name',
        direction: 'asc',
      });
    });

    it('parses sort from "field:direction" string', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, sort: '' },
        })
      );

      act(() => {
        result.current.setState({ sort: 'createdAt:desc' });
      });

      expect(result.current.surfaceQueryProps.sort).toEqual({
        field: 'createdAt',
        direction: 'desc',
      });
    });

    it('extracts filters object', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: {
            page: 1,
            pageSize: 10,
            filters: { status: 'active' } as Record<string, any>,
          },
        })
      );

      expect(result.current.surfaceQueryProps.filters).toEqual({
        status: 'active',
      });
    });

    it('returns undefined filters when empty', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: {
            page: 1,
            pageSize: 10,
            filters: {} as Record<string, any>,
          },
        })
      );

      expect(result.current.surfaceQueryProps.filters).toBeUndefined();
    });

    it('uses sensible defaults when page/pageSize not in state', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { search: '' },
        })
      );

      expect(result.current.surfaceQueryProps.page).toBe(1);
      expect(result.current.surfaceQueryProps.pageSize).toBe(10);
    });

    it('updates surfaceQueryProps when state changes', () => {
      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10, search: '' },
        })
      );

      act(() => {
        result.current.setState({ page: 4, search: 'query' });
      });

      expect(result.current.surfaceQueryProps.page).toBe(4);
      expect(result.current.surfaceQueryProps.search).toBe('query');
    });
  });

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles empty URL params gracefully', () => {
      const router = createMockRouter();
      // params are empty by default

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1, pageSize: 10 },
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      expect(result.current.state).toEqual({ page: 1, pageSize: 10 });
    });

    it('default debounceMs is 300', () => {
      const router = createMockRouter();

      const { result } = renderHook(() =>
        useRouterState({
          defaults: { page: 1 },
          getSearchParams: router.getSearchParams,
          setSearchParams: router.setSearchParams,
        })
      );

      act(() => {
        result.current.setState({ page: 2 });
      });

      // At 200ms, should not have pushed yet
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(router.setSearchParams).not.toHaveBeenCalled();

      // At 350ms, should have pushed
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(router.setSearchParams).toHaveBeenCalledTimes(1);
    });
  });
});
