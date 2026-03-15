'use client';

/**
 * @fileoverview Global Search Hook - Rottay Design System
 * @description React hook for searching across multiple data sources with
 * debouncing, fuzzy matching, category grouping, and recent-search persistence.
 *
 * @remarks
 * The `useGlobalSearch` hook aggregates results from multiple `SearchSource`
 * providers, each of which can be synchronous or asynchronous. Features:
 *
 * - **Multiple sources** - Search across entities, pages, commands, etc.
 * - **Debounced query** - Configurable debounce prevents excessive calls
 * - **Fuzzy matching** - Built-in relevance scoring (0-1)
 * - **Category grouping** - Results are pre-grouped by source label
 * - **Recent searches** - Persisted in localStorage with a configurable key
 * - **Text highlight** - `highlightMatch` splits text into highlighted/plain segments
 * - **Min query length** - Short queries are ignored to avoid noise
 *
 * @example Basic usage
 * ```tsx
 * import { useGlobalSearch } from '@rottay/design-system';
 *
 * const { query, setQuery, groupedResults, isSearching } = useGlobalSearch({
 *   sources: [
 *     {
 *       id: 'users',
 *       label: 'Users',
 *       search: (q) => userIndex.search(q),
 *     },
 *     {
 *       id: 'pages',
 *       label: 'Pages',
 *       search: async (q) => {
 *         const res = await fetch(`/api/search/pages?q=${q}`);
 *         return res.json();
 *       },
 *       priority: 10,
 *     },
 *   ],
 *   debounceMs: 250,
 * });
 * ```
 *
 * @module System/Hooks/Search
 * @category System
 * @package @rottay/design-system
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * A single search result returned by a `SearchSource`.
 */
export interface SearchResult<T = any> {
  /** Unique identifier for the result. */
  id: string;
  /** Primary display text. */
  title: string;
  /** Optional secondary text. */
  description?: string;
  /** Category label (defaults to the source's `label`). */
  category?: string;
  /** Optional icon element. */
  icon?: ReactNode;
  /** The underlying data entity. */
  data: T;
  /** Relevance score from 0 (no match) to 1 (perfect match). */
  score: number;
}

/**
 * A search source that the hook queries.
 */
export interface SearchSource<T = any> {
  /** Unique source identifier. */
  id: string;
  /** Human-readable category name shown in grouped results. */
  label: string;
  /**
   * Search function. Can return results synchronously or as a promise.
   * Each result should include a `score` for relevance ranking.
   */
  search: (query: string) => SearchResult<T>[] | Promise<SearchResult<T>[]>;
  /**
   * Higher priority sources appear first when scores are equal.
   * @default 0
   */
  priority?: number;
}

/**
 * Configuration options for the `useGlobalSearch` hook.
 */
export interface UseGlobalSearchOptions<T = any> {
  /** Array of search sources to query. */
  sources: SearchSource<T>[];

  /**
   * Debounce delay in milliseconds.
   * @default 300
   */
  debounceMs?: number;

  /**
   * Maximum number of results to return across all sources.
   * @default 20
   */
  maxResults?: number;

  /**
   * Minimum query length before searching starts.
   * @default 2
   */
  minQueryLength?: number;

  /**
   * localStorage key for persisting recent searches.
   * @default 'ds-recent-searches'
   */
  storageKey?: string;

  /**
   * Maximum number of recent searches to persist.
   * @default 10
   */
  maxRecentSearches?: number;
}

/**
 * A group of results sharing the same category.
 */
export interface SearchResultGroup<T = any> {
  category: string;
  results: SearchResult<T>[];
}

/**
 * A text segment used for match highlighting.
 */
export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Return type of the `useGlobalSearch` hook.
 */
export interface UseGlobalSearchReturn<T = any> {
  /** Current query string. */
  query: string;
  /** Update the search query. */
  setQuery: (query: string) => void;
  /** Flat list of results sorted by relevance. */
  results: SearchResult<T>[];
  /** Whether any source is currently being queried. */
  isSearching: boolean;
  /** The last error encountered, or `null`. */
  error: Error | null;
  /** Results grouped by category. */
  groupedResults: SearchResultGroup<T>[];
  /** Previously executed search queries. */
  recentSearches: string[];
  /** Clear all recent searches from localStorage. */
  clearRecentSearches: () => void;
  /**
   * Split `text` into segments where portions matching the current query
   * are marked `highlighted: true`.
   */
  highlightMatch: (text: string) => HighlightSegment[];
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Read recent searches from localStorage (SSR-safe).
 */
function loadRecentSearches(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist recent searches to localStorage (SSR-safe).
 */
function saveRecentSearches(key: string, searches: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(searches));
  } catch {
    // localStorage may be full or disabled -- silently ignore
  }
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Global search hook with multi-source aggregation, debouncing, and
 * category grouping.
 *
 * Queries all configured `sources` whenever the debounced query changes,
 * merges and sorts results by relevance score, groups them by category,
 * and persists recent searches in localStorage.
 *
 * @param options - Hook configuration
 * @returns Query state, results, grouping, and highlight helpers
 *
 * @example
 * ```tsx
 * const {
 *   query, setQuery, groupedResults, highlightMatch, isSearching,
 * } = useGlobalSearch({
 *   sources: [usersSource, pagesSource],
 *   debounceMs: 200,
 *   maxResults: 30,
 * });
 * ```
 */
export function useGlobalSearch<T = any>(
  options: UseGlobalSearchOptions<T>
): UseGlobalSearchReturn<T> {
  const {
    sources,
    debounceMs = 300,
    maxResults = 20,
    minQueryLength = 2,
    storageKey = 'ds-recent-searches',
    maxRecentSearches = 10,
  } = options;

  // ---- State ----
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult<T>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadRecentSearches(storageKey)
  );

  // Stable refs to avoid stale closures
  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;

  const searchIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Debounced query setter ----
  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery);
    },
    []
  );

  // ---- Perform search ----
  const performSearch = useCallback(
    async (searchQuery: string) => {
      const currentSearchId = ++searchIdRef.current;

      if (searchQuery.length < minQueryLength) {
        setResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        // Query all sources in parallel
        const sourceResults = await Promise.allSettled(
          sourcesRef.current.map(async (source) => {
            const rawResults = await source.search(searchQuery);
            // Tag each result with the source category if not already set
            return rawResults.map((r) => ({
              ...r,
              category: r.category ?? source.label,
              _sourcePriority: source.priority ?? 0,
            }));
          })
        );

        // Abort if a newer search has started
        if (currentSearchId !== searchIdRef.current) return;

        // Collect fulfilled results, log rejected ones
        const allResults: (SearchResult<T> & { _sourcePriority: number })[] = [];
        let lastError: Error | null = null;

        for (const outcome of sourceResults) {
          if (outcome.status === 'fulfilled') {
            allResults.push(...outcome.value);
          } else {
            lastError =
              outcome.reason instanceof Error
                ? outcome.reason
                : new Error(String(outcome.reason));
          }
        }

        // Sort by score descending, then source priority descending
        allResults.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return b._sourcePriority - a._sourcePriority;
        });

        // Trim to maxResults and strip internal field
        const trimmed: SearchResult<T>[] = allResults
          .slice(0, maxResults)
          .map(({ _sourcePriority, ...rest }) => rest as SearchResult<T>);

        setResults(trimmed);

        // If some sources failed but we still have results, surface the error
        // alongside partial results
        if (lastError && allResults.length === 0) {
          setError(lastError);
        } else {
          setError(null);
        }

        // Persist to recent searches
        setRecentSearches((prev) => {
          const filtered = prev.filter((s) => s !== searchQuery);
          const next = [searchQuery, ...filtered].slice(0, maxRecentSearches);
          saveRecentSearches(storageKey, next);
          return next;
        });
      } catch (err) {
        if (currentSearchId !== searchIdRef.current) return;
        const searchError =
          err instanceof Error ? err : new Error(String(err));
        setError(searchError);
        setResults([]);
      } finally {
        if (currentSearchId === searchIdRef.current) {
          setIsSearching(false);
        }
      }
    },
    [minQueryLength, maxResults, maxRecentSearches, storageKey]
  );

  // ---- Debounced effect ----
  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length < minQueryLength) {
      setResults([]);
      setIsSearching(false);
      setError(null);
      return;
    }

    setIsSearching(true);

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      performSearch(query);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [query, debounceMs, minQueryLength, performSearch]);

  // ---- Grouped results ----
  const groupedResults = useMemo<SearchResultGroup<T>[]>(() => {
    const groupMap = new Map<string, SearchResult<T>[]>();

    for (const result of results) {
      const category = result.category ?? 'Other';
      const group = groupMap.get(category);
      if (group) {
        group.push(result);
      } else {
        groupMap.set(category, [result]);
      }
    }

    return Array.from(groupMap.entries()).map(([category, groupResults]) => ({
      category,
      results: groupResults,
    }));
  }, [results]);

  // ---- Recent searches ----
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    saveRecentSearches(storageKey, []);
  }, [storageKey]);

  // ---- Highlight helper ----
  const highlightMatch = useCallback(
    (text: string): HighlightSegment[] => {
      if (!query || query.length < minQueryLength) {
        return [{ text, highlighted: false }];
      }

      const escaped = escapeRegex(query);
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = text.split(regex);

      if (parts.length === 1) {
        return [{ text, highlighted: false }];
      }

      return parts
        .filter((part) => part.length > 0)
        .map((part) => ({
          text: part,
          highlighted: part.toLowerCase() === query.toLowerCase(),
        }));
    },
    [query, minQueryLength]
  );

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    groupedResults,
    recentSearches,
    clearRecentSearches,
    highlightMatch,
  };
}
