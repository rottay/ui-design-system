'use client';

/**
 * @fileoverview useSurfaceState -- Surface lifecycle state machine hook.
 *
 * @description Derives a unified lifecycle state from data, loading, error,
 * staleness, and connectivity inputs. Provides boolean convenience flags and
 * a `renderState` helper that returns the appropriate state UI for non-loaded
 * states (loading skeleton, empty state, error card, stale banner, offline
 * banner) while returning `null` for `loaded` and `idle` so the surface can
 * render its own content.
 *
 * The state machine intentionally does not own data fetching. It receives
 * pre-resolved values from the app layer (e.g., from React Query, SWR, or
 * plain `useEffect` fetches) and maps them to a consistent visual state.
 *
 * @see Wave 5, Section 3 -- Surface State Machine
 *
 * @example
 * ```tsx
 * const surfaceState = useSurfaceState({
 *   data: users,
 *   loading: isLoading,
 *   error: fetchError,
 *   isStale: isDataStale,
 *   onRetry: refetch,
 * });
 *
 * const stateUI = surfaceState.renderState({
 *   emptyTitle: 'No users found',
 *   emptyDescription: 'Create a user to get started.',
 *   emptyAction: { label: 'Create User', onClick: openCreateModal },
 * });
 *
 * // stateUI is non-null for loading/empty/error/stale/offline states
 * if (stateUI) return stateUI;
 *
 * // Render the surface content
 * return <ListSurface config={config} />;
 * ```
 */

import { type ReactNode, useMemo, useSyncExternalStore } from 'react';
import React from 'react';
import {
  SurfaceLoadingSkeleton,
  SurfaceEmptyStateCard,
  SurfaceErrorStateCard,
  SurfaceStaleBanner,
  SurfaceOfflineBanner,
} from '../states/surface-states';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Surface lifecycle states. */
export type SurfaceState =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'empty'
  | 'error'
  | 'stale'
  | 'refreshing'
  | 'offline';

/** Configuration for the render-state helper. */
export interface SurfaceStateRenderConfig {
  /** Custom skeleton to show while loading. Overrides the default shimmer rows. */
  loadingSkeleton?: ReactNode;
  /** Icon shown in the empty state card. */
  emptyIcon?: ReactNode;
  /** Title for the empty state card. */
  emptyTitle?: string;
  /** Description for the empty state card. */
  emptyDescription?: string;
  /** Call-to-action button in the empty state card. */
  emptyAction?: { label: string; onClick: () => void };
  /** Title for the error state card. */
  errorTitle?: string;
  /** Description for the error state card. */
  errorDescription?: string;
  /** Message shown in the stale data banner. */
  staleMessage?: string;
  /** Message shown in the offline banner. */
  offlineMessage?: string;
}

/** Options accepted by the `useSurfaceState` hook. */
export interface UseSurfaceStateOptions<T> {
  /** Data array (empty = empty state). */
  data: T[] | undefined | null;
  /** Loading flag. */
  loading?: boolean;
  /** Error object or message. */
  error?: unknown;
  /** Whether data is stale (e.g., cache expired). */
  isStale?: boolean;
  /** Retry function for error state. */
  onRetry?: () => void;
  /** Custom empty check (default: `data.length === 0`). */
  isEmpty?: (data: T[]) => boolean;
}

/** Return value of `useSurfaceState`. */
export interface UseSurfaceStateReturn<T> {
  /** Current lifecycle state. */
  state: SurfaceState;
  /** Data (empty array when data is unavailable). */
  data: T[];
  /** Error (only meaningful in error state). */
  error: unknown;
  /** Retry handler (from options). */
  retry: (() => void) | undefined;
  /** Whether data exists (even if stale). */
  hasData: boolean;
  /**
   * Render helper: returns the appropriate state UI for non-loaded states,
   * or `null` when the surface should render its own content (loaded/idle).
   */
  renderState: (overrides?: Partial<SurfaceStateRenderConfig>) => ReactNode | null;
}

// ---------------------------------------------------------------------------
// Online/offline external store (SSR-safe)
// ---------------------------------------------------------------------------

function subscribeOnline(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getServerOnlineSnapshot(): boolean {
  // On the server we always assume online.
  return true;
}

// ---------------------------------------------------------------------------
// State derivation
// ---------------------------------------------------------------------------

function deriveState<T>(
  data: T[] | undefined | null,
  loading: boolean,
  error: unknown,
  isStale: boolean,
  isOffline: boolean,
  isEmpty: ((data: T[]) => boolean) | undefined,
): SurfaceState {
  // Offline takes precedence only when there is no data to show.
  if (isOffline && (!data || data.length === 0)) {
    return 'offline';
  }

  // Error state (only when there is no data to fall back to).
  if (error && (!data || data.length === 0)) {
    return 'error';
  }

  // Initial loading (no data yet).
  if (loading && (!data || data.length === 0)) {
    return 'loading';
  }

  // Background refresh (loading while data is already available).
  if (loading && data && data.length > 0) {
    return 'refreshing';
  }

  // Data arrived but is empty.
  if (data) {
    const dataEmpty = isEmpty ? isEmpty(data) : data.length === 0;
    if (dataEmpty) {
      return 'empty';
    }
  }

  // Data is stale.
  if (isStale && data && data.length > 0) {
    return 'stale';
  }

  // Data loaded and non-empty.
  if (data && data.length > 0) {
    return 'loaded';
  }

  // Nothing happened yet.
  return 'idle';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Surface lifecycle state machine hook.
 *
 * Derives a single `SurfaceState` from the provided data, loading, error,
 * staleness, and connectivity inputs. Returns convenience boolean flags and
 * a `renderState` helper that produces consistent state UI.
 *
 * **State transitions:**
 * ```
 * idle      -> loading     (fetch starts, no data)
 * loading   -> loaded      (data arrives, non-empty)
 * loading   -> empty       (data arrives, empty)
 * loading   -> error       (fetch fails, no data)
 * loaded    -> stale       (isStale flag set)
 * loaded    -> refreshing  (loading while data visible)
 * stale     -> refreshing  (loading triggered)
 * refreshing-> loaded      (refresh succeeds)
 * refreshing-> error       (refresh fails, data still visible -> stays refreshing)
 * any       -> offline     (navigator.onLine false, no data)
 * ```
 */
export function useSurfaceState<T>(
  options: UseSurfaceStateOptions<T>,
): UseSurfaceStateReturn<T> {
  const {
    data: rawData,
    loading = false,
    error,
    isStale = false,
    onRetry,
    isEmpty: isEmptyFn,
  } = options;

  // SSR-safe online/offline detection.
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );

  const state = useMemo(
    () => deriveState(rawData, loading, error, isStale, !isOnline, isEmptyFn),
    [rawData, loading, error, isStale, isOnline, isEmptyFn],
  );

  const data: T[] = useMemo(() => rawData ?? [], [rawData]);

  const hasData = data.length > 0;

  const renderState = useMemo(() => {
    return (overrides?: Partial<SurfaceStateRenderConfig>): ReactNode | null => {
      switch (state) {
        case 'loading':
          if (overrides?.loadingSkeleton) {
            return overrides.loadingSkeleton;
          }
          return React.createElement(SurfaceLoadingSkeleton, {
            rows: 6,
            showHeader: true,
          });

        case 'empty':
          return React.createElement(SurfaceEmptyStateCard, {
            icon: overrides?.emptyIcon,
            title: overrides?.emptyTitle,
            description: overrides?.emptyDescription,
            action: overrides?.emptyAction,
          });

        case 'error':
          return React.createElement(SurfaceErrorStateCard, {
            error,
            title: overrides?.errorTitle,
            description: overrides?.errorDescription,
            onRetry,
          });

        case 'stale':
          return React.createElement(SurfaceStaleBanner, {
            message: overrides?.staleMessage,
            onRefresh: onRetry,
            refreshing: false,
          });

        case 'refreshing':
          // Data is still visible during refresh. Return a stale banner
          // indicating the refresh is in progress so the surface can
          // render it above its content.
          return React.createElement(SurfaceStaleBanner, {
            message: overrides?.staleMessage,
            onRefresh: onRetry,
            refreshing: true,
          });

        case 'offline':
          return React.createElement(SurfaceOfflineBanner, {
            message: overrides?.offlineMessage,
            showCachedNotice: hasData,
          });

        case 'loaded':
        case 'idle':
        default:
          return null;
      }
    };
  }, [state, error, onRetry, hasData]);

  return {
    state,
    data,
    error,
    retry: onRetry,
    hasData,
    renderState,
  };
}
