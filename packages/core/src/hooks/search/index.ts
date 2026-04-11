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
 * @status active (designed for CommandPalette search)
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
  // Lazy initializer reads from localStorage once on mount. SSR returns []
  // because loadRecentSearches guards against missing `window`.
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadRecentSearches(storageKey)
  );

  // Sources ref avoids adding the sources array to effect/callback deps,
  // which would retrigger searches on every render (sources is usually a
  // new array literal each time).
  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;

  // Monotonic search ID for stale-response protection (same pattern as
  // useSurfaceQuery's fetchIdRef).
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
        // Query all sources in parallel using Promise.allSettled so that
        // one failing source doesn't prevent results from other sources
        // from appearing. This is critical for UX -- users still see
        // partial results even if one backend is down.
        const sourceResults = await Promise.allSettled(
          sourcesRef.current.map(async (source) => {
            const rawResults = await source.search(searchQuery);
            // Tag each result with its source's category and priority so
            // the merge/sort step can rank across sources.
            return rawResults.map((r) => ({
              ...r,
              category: r.category ?? source.label,
              _sourcePriority: source.priority ?? 0,
            }));
          })
        );

        // Guard: discard results if a newer search was triggered while
        // these sources were being queried.
        if (currentSearchId !== searchIdRef.current) return;

        // Merge fulfilled results; track the last error for partial-failure
        // reporting.
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

        // Primary sort by relevance score (higher = better match),
        // secondary sort by source priority (higher = more important source).
        allResults.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return b._sourcePriority - a._sourcePriority;
        });

        // Strip the internal _sourcePriority field before exposing results.
        const trimmed: SearchResult<T>[] = allResults
          .slice(0, maxResults)
          .map(({ _sourcePriority, ...rest }) => rest as SearchResult<T>);

        setResults(trimmed);

        // Only surface errors when ALL sources failed. Partial results with
        // one failing source is a degraded-but-acceptable state.
        if (lastError && allResults.length === 0) {
          setError(lastError);
        } else {
          setError(null);
        }

        // Persist to recent searches: deduplicate first, then prepend the
        // new query, and cap at maxRecentSearches.
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
  // This effect bridges the controlled `query` state with the async
  // performSearch function. setIsSearching(true) is called immediately
  // (before the debounce) so the UI can show a loading indicator as soon
  // as the user types, rather than waiting for the debounce to expire.
  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    // Short queries are cleared immediately without debounce.
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
  // Memoized because grouping creates new arrays, and downstream
  // components (e.g. command palette sections) use referential equality
  // checks for render optimization.
  const groupedResults = useMemo<SearchResultGroup<T>[]>(() => {
    // Map preserves insertion order, so groups appear in the same order
    // as the first result from each category in the sorted results list.
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
  // Splits text into segments for rendering with highlighted matches.
  // Uses a capturing group in the regex so that `String.split` preserves
  // the matched portions alongside the non-matched portions.
  const highlightMatch = useCallback(
    (text: string): HighlightSegment[] => {
      if (!query || query.length < minQueryLength) {
        return [{ text, highlighted: false }];
      }

      // Escape special regex chars in the query to prevent ReDoS or
      // unexpected behavior when the query contains characters like ., *, etc.
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
