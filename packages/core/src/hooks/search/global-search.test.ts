/**
 * useGlobalSearch Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGlobalSearch, type SearchResult, type SearchSource } from './index';

// ============================================================================
// Helpers
// ============================================================================

function makeResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    id: 'r1',
    title: 'Test Result',
    data: { value: 1 },
    score: 0.8,
    ...overrides,
  };
}

function makeSyncSource(
  id: string,
  label: string,
  results: SearchResult[],
  priority = 0
): SearchSource {
  return {
    id,
    label,
    search: vi.fn(() => results),
    priority,
  };
}

function makeAsyncSource(
  id: string,
  label: string,
  results: SearchResult[],
  delay = 10,
  priority = 0
): SearchSource {
  return {
    id,
    label,
    search: vi.fn(
      () => new Promise<SearchResult[]>((resolve) => setTimeout(() => resolve(results), delay))
    ),
    priority,
  };
}

/** localStorage mock */
function mockLocalStorage() {
  const store: Record<string, string> = {};
  const mock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_index: number) => null),
    _store: store,
  };
  Object.defineProperty(globalThis, 'localStorage', { value: mock, writable: true });
  return mock;
}

// ============================================================================
// Tests
// ============================================================================

describe('useGlobalSearch', () => {
  let storage: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    storage = mockLocalStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // Initial State
  // --------------------------------------------------------------------------

  describe('Initial State', () => {
    it('starts with empty query and no results', () => {
      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [] })
      );

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.groupedResults).toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // Multi-source Search
  // --------------------------------------------------------------------------

  describe('Multi-source Search', () => {
    it('queries all sources and merges results by score', async () => {
      const source1 = makeSyncSource('users', 'Users', [
        makeResult({ id: 'u1', title: 'Alice', score: 0.9, category: 'Users' }),
      ]);
      const source2 = makeSyncSource('pages', 'Pages', [
        makeResult({ id: 'p1', title: 'About Page', score: 0.7, category: 'Pages' }),
      ]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source1, source2], debounceMs: 50 })
      );

      act(() => {
        result.current.setQuery('test query');
      });

      // Advance past debounce
      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      expect(result.current.results).toHaveLength(2);
      // Higher score first
      expect(result.current.results[0].id).toBe('u1');
      expect(result.current.results[1].id).toBe('p1');
    });

    it('handles async sources', async () => {
      const source = makeAsyncSource('api', 'API', [
        makeResult({ id: 'a1', title: 'Async Result', score: 1.0 }),
      ], 20);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 10 })
      );

      act(() => {
        result.current.setQuery('async test');
      });

      // Advance past debounce
      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      // Should be searching
      expect(result.current.isSearching).toBe(true);

      // Advance past async delay
      await act(async () => {
        vi.advanceTimersByTime(20);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].title).toBe('Async Result');
    });

    it('respects source priority when scores are equal', async () => {
      const lowPriority = makeSyncSource('low', 'Low', [
        makeResult({ id: 'l1', title: 'Low Priority', score: 0.5, category: 'Low' }),
      ], 0);
      const highPriority = makeSyncSource('high', 'High', [
        makeResult({ id: 'h1', title: 'High Priority', score: 0.5, category: 'High' }),
      ], 10);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [lowPriority, highPriority], debounceMs: 10 })
      );

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      expect(result.current.results[0].id).toBe('h1');
      expect(result.current.results[1].id).toBe('l1');
    });

    it('limits results to maxResults', async () => {
      const many = Array.from({ length: 30 }, (_, i) =>
        makeResult({ id: `r${i}`, title: `Result ${i}`, score: 1 - i * 0.01 })
      );
      const source = makeSyncSource('all', 'All', many);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 10, maxResults: 5 })
      );

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      expect(result.current.results).toHaveLength(5);
    });

    it('handles partial source failure gracefully', async () => {
      const goodSource = makeSyncSource('good', 'Good', [
        makeResult({ id: 'g1', title: 'Good Result', score: 0.8 }),
      ]);
      const badSource: SearchSource = {
        id: 'bad',
        label: 'Bad',
        search: vi.fn(() => { throw new Error('Source failed'); }),
      };

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [goodSource, badSource], debounceMs: 10 })
      );

      act(() => {
        result.current.setQuery('partial');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      // Should still have results from the good source
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].id).toBe('g1');
    });
  });

  // --------------------------------------------------------------------------
  // Debounce
  // --------------------------------------------------------------------------

  describe('Debounce', () => {
    it('does not search until debounce period elapses', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 200 })
      );

      act(() => {
        result.current.setQuery('hello');
      });

      // Advance less than debounce
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(source.search).not.toHaveBeenCalled();

      // Complete the debounce
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(source.search).toHaveBeenCalledWith('hello');
    });

    it('resets debounce timer on rapid query changes', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 100 })
      );

      // Type rapidly
      act(() => { result.current.setQuery('h'); });
      await act(async () => { vi.advanceTimersByTime(50); });
      act(() => { result.current.setQuery('he'); });
      await act(async () => { vi.advanceTimersByTime(50); });
      act(() => { result.current.setQuery('hel'); });
      await act(async () => { vi.advanceTimersByTime(50); });
      act(() => { result.current.setQuery('hello'); });

      // Advance past debounce from last input
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      // Should only have searched with the final query
      expect(source.search).toHaveBeenCalledTimes(1);
      expect(source.search).toHaveBeenCalledWith('hello');
    });
  });

  // --------------------------------------------------------------------------
  // Min Query Length
  // --------------------------------------------------------------------------

  describe('Min Query Length', () => {
    it('does not search when query is shorter than minQueryLength', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 10, minQueryLength: 3 })
      );

      act(() => {
        result.current.setQuery('ab');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      expect(source.search).not.toHaveBeenCalled();
      expect(result.current.results).toEqual([]);
    });

    it('searches when query meets minQueryLength', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 10, minQueryLength: 3 })
      );

      act(() => {
        result.current.setQuery('abc');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await waitFor(() => {
        expect(source.search).toHaveBeenCalledWith('abc');
      });
    });
  });

  // --------------------------------------------------------------------------
  // Category Grouping
  // --------------------------------------------------------------------------

  describe('Category Grouping', () => {
    it('groups results by category', async () => {
      const source1 = makeSyncSource('users', 'Users', [
        makeResult({ id: 'u1', title: 'Alice', score: 0.9, category: 'Users' }),
        makeResult({ id: 'u2', title: 'Bob', score: 0.8, category: 'Users' }),
      ]);
      const source2 = makeSyncSource('pages', 'Pages', [
        makeResult({ id: 'p1', title: 'Home', score: 0.7, category: 'Pages' }),
      ]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source1, source2], debounceMs: 10 })
      );

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      expect(result.current.groupedResults).toHaveLength(2);
      expect(result.current.groupedResults[0].category).toBe('Users');
      expect(result.current.groupedResults[0].results).toHaveLength(2);
      expect(result.current.groupedResults[1].category).toBe('Pages');
      expect(result.current.groupedResults[1].results).toHaveLength(1);
    });

    it('uses source label as category when result has no category', async () => {
      const source = makeSyncSource('cmds', 'Commands', [
        makeResult({ id: 'c1', title: 'Open', score: 0.9 }),
      ]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 10 })
      );

      act(() => {
        result.current.setQuery('open');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      expect(result.current.groupedResults[0].category).toBe('Commands');
    });
  });

  // --------------------------------------------------------------------------
  // Recent Searches
  // --------------------------------------------------------------------------

  describe('Recent Searches', () => {
    it('persists searches to localStorage', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({
          sources: [source],
          debounceMs: 10,
          storageKey: 'test-recent',
        })
      );

      act(() => {
        result.current.setQuery('first search');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      expect(result.current.recentSearches).toContain('first search');
      expect(storage.setItem).toHaveBeenCalledWith(
        'test-recent',
        expect.stringContaining('first search')
      );
    });

    it('puts most recent search first', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({
          sources: [source],
          debounceMs: 10,
          storageKey: 'test-order',
        })
      );

      // First search
      act(() => { result.current.setQuery('alpha'); });
      await act(async () => { vi.advanceTimersByTime(10); });
      await waitFor(() => expect(result.current.isSearching).toBe(false));

      // Second search
      act(() => { result.current.setQuery('beta'); });
      await act(async () => { vi.advanceTimersByTime(10); });
      await waitFor(() => expect(result.current.isSearching).toBe(false));

      expect(result.current.recentSearches[0]).toBe('beta');
      expect(result.current.recentSearches[1]).toBe('alpha');
    });

    it('removes duplicates from recent searches', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({
          sources: [source],
          debounceMs: 10,
          storageKey: 'test-dedup',
        })
      );

      // Search "alpha" twice
      act(() => { result.current.setQuery('alpha'); });
      await act(async () => { vi.advanceTimersByTime(10); });
      await waitFor(() => expect(result.current.isSearching).toBe(false));

      act(() => { result.current.setQuery('beta'); });
      await act(async () => { vi.advanceTimersByTime(10); });
      await waitFor(() => expect(result.current.isSearching).toBe(false));

      act(() => { result.current.setQuery('alpha'); });
      await act(async () => { vi.advanceTimersByTime(10); });
      await waitFor(() => expect(result.current.isSearching).toBe(false));

      // "alpha" should appear only once, at the front
      const alphaCount = result.current.recentSearches.filter((s) => s === 'alpha').length;
      expect(alphaCount).toBe(1);
      expect(result.current.recentSearches[0]).toBe('alpha');
    });

    it('clears recent searches', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({
          sources: [source],
          debounceMs: 10,
          storageKey: 'test-clear',
        })
      );

      act(() => { result.current.setQuery('hello'); });
      await act(async () => { vi.advanceTimersByTime(10); });
      await waitFor(() => expect(result.current.isSearching).toBe(false));

      expect(result.current.recentSearches.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearRecentSearches();
      });

      expect(result.current.recentSearches).toEqual([]);
      expect(storage.setItem).toHaveBeenCalledWith('test-clear', '[]');
    });
  });

  // --------------------------------------------------------------------------
  // Highlight Match
  // --------------------------------------------------------------------------

  describe('highlightMatch', () => {
    it('returns full text as non-highlighted when no query', () => {
      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [] })
      );

      const segments = result.current.highlightMatch('Hello World');
      expect(segments).toEqual([{ text: 'Hello World', highlighted: false }]);
    });

    it('returns full text as non-highlighted when query is below minQueryLength', () => {
      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [], minQueryLength: 3 })
      );

      act(() => {
        result.current.setQuery('ab');
      });

      const segments = result.current.highlightMatch('Alphabet');
      expect(segments).toEqual([{ text: 'Alphabet', highlighted: false }]);
    });

    it('highlights matching portions of text', async () => {
      const source = makeSyncSource('s', 'S', [makeResult()]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 10, minQueryLength: 2 })
      );

      act(() => {
        result.current.setQuery('llo');
      });

      const segments = result.current.highlightMatch('Hello World');
      expect(segments).toEqual([
        { text: 'He', highlighted: false },
        { text: 'llo', highlighted: true },
        { text: ' World', highlighted: false },
      ]);
    });

    it('handles case-insensitive matching', async () => {
      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [], minQueryLength: 2 })
      );

      act(() => {
        result.current.setQuery('he');
      });

      const segments = result.current.highlightMatch('Hello');
      expect(segments).toEqual([
        { text: 'He', highlighted: true },
        { text: 'llo', highlighted: false },
      ]);
    });

    it('returns non-highlighted when query is not found', async () => {
      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [], minQueryLength: 2 })
      );

      act(() => {
        result.current.setQuery('xyz');
      });

      const segments = result.current.highlightMatch('Hello World');
      expect(segments).toEqual([{ text: 'Hello World', highlighted: false }]);
    });

    it('handles special regex characters in query', async () => {
      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [], minQueryLength: 2 })
      );

      act(() => {
        result.current.setQuery('(test)');
      });

      const segments = result.current.highlightMatch('a (test) string');
      expect(segments).toEqual([
        { text: 'a ', highlighted: false },
        { text: '(test)', highlighted: true },
        { text: ' string', highlighted: false },
      ]);
    });
  });

  // --------------------------------------------------------------------------
  // Error State
  // --------------------------------------------------------------------------

  describe('Error State', () => {
    it('sets error when all sources fail', async () => {
      const failSource: SearchSource = {
        id: 'fail',
        label: 'Fail',
        search: vi.fn(() => { throw new Error('All broke'); }),
      };

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [failSource], debounceMs: 10 })
      );

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        vi.advanceTimersByTime(10);
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('All broke');
      expect(result.current.results).toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // Clearing Query
  // --------------------------------------------------------------------------

  describe('Clearing Query', () => {
    it('clears results when query is cleared', async () => {
      const source = makeSyncSource('s', 'S', [
        makeResult({ id: 'r1', title: 'Result', score: 1 }),
      ]);

      const { result } = renderHook(() =>
        useGlobalSearch({ sources: [source], debounceMs: 10 })
      );

      // Search first
      act(() => { result.current.setQuery('test'); });
      await act(async () => { vi.advanceTimersByTime(10); });
      await waitFor(() => expect(result.current.isSearching).toBe(false));
      expect(result.current.results).toHaveLength(1);

      // Clear query
      act(() => { result.current.setQuery(''); });

      // Results should be cleared immediately (no debounce needed)
      expect(result.current.results).toEqual([]);
    });
  });
});
