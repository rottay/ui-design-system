'use client';

/**
 * @fileoverview Optimistic Update Hook - Rottay Design System
 * @description React hook for performing optimistic UI updates with automatic
 * rollback on mutation failure. Designed to pair with useSurfaceQuery for
 * immediate feedback on user actions.
 *
 * @remarks
 * The `useOptimisticUpdate` hook shows an optimistic result immediately,
 * executes the actual mutation in the background, and automatically reverts
 * to the previous data if the mutation fails. A manual `rollback()` function
 * is also provided for imperative undo.
 *
 * @example Basic Usage
 * ```tsx
 * import { useOptimisticUpdate } from '@rottay/design-system';
 *
 * const { mutate, isPending, error, data } = useOptimisticUpdate({
 *   onMutate: async (task) => {
 *     const res = await fetch('/api/tasks', {
 *       method: 'PUT',
 *       body: JSON.stringify(task),
 *     });
 *     return res.json();
 *   },
 *   onError: (err, rollbackData) => {
 *     console.error('Failed, rolled back to:', rollbackData);
 *   },
 *   onSuccess: (data) => {
 *     console.log('Saved:', data);
 *   },
 * });
 *
 * // Apply optimistic update immediately
 * mutate({ ...task, status: 'done' });
 * ```
 *
 * @module System/Hooks/Data
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for the `useOptimisticUpdate` hook.
 */
export interface UseOptimisticUpdateOptions<T> {
  /**
   * Async mutation function. Receives the optimistic data and should return
   * the server-confirmed data on success. If it throws, the hook rolls back
   * to the previous value.
   */
  onMutate: (data: T) => Promise<T>;

  /**
   * Called when the mutation fails. Receives the error and the data that was
   * restored via rollback so the consumer can show a notification.
   */
  onError?: (error: Error, rollbackData: T) => void;

  /**
   * Called when the mutation succeeds. Receives the server-confirmed data.
   */
  onSuccess?: (data: T) => void;

  /**
   * Delay in milliseconds before the onError callback fires after a rollback.
   * Useful for showing a brief "reverting" state before surfacing the error toast.
   * @default 0
   */
  rollbackDelay?: number;
}

/**
 * Return type of the `useOptimisticUpdate` hook.
 */
export interface UseOptimisticUpdateReturn<T> {
  /**
   * Trigger an optimistic mutation. The `optimisticData` is applied immediately
   * to `data`, and the `onMutate` callback runs in the background.
   */
  mutate: (optimisticData: T) => Promise<T>;

  /** Whether a mutation is currently in flight. */
  isPending: boolean;

  /** The last error encountered, or null if the last mutation succeeded. */
  error: Error | null;

  /**
   * Manually revert to the data that existed before the last `mutate()` call.
   * This is a no-op if there is nothing to roll back to.
   */
  rollback: () => void;

  /** The current data value (optimistic or confirmed). */
  data: T | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Optimistic update hook with automatic rollback on failure.
 *
 * Shows an optimistic result immediately, calls `onMutate` in the background,
 * and reverts to the previous value if the mutation throws. A manual `rollback()`
 * function is also available for imperative undo.
 *
 * @param options - Hook configuration
 * @returns Mutation function, state, and rollback control
 *
 * @example
 * ```tsx
 * const { mutate, isPending, data } = useOptimisticUpdate({
 *   onMutate: async (item) => {
 *     const res = await api.updateItem(item);
 *     return res.data;
 *   },
 *   onError: (err) => toast.error(err.message),
 *   onSuccess: () => toast.success('Saved'),
 * });
 * ```
 */
export function useOptimisticUpdate<T>(
  options: UseOptimisticUpdateOptions<T>
): UseOptimisticUpdateReturn<T> {
  const { onMutate, onError, onSuccess, rollbackDelay = 0 } = options;

  // ---- State ----
  const [data, setData] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track the previous value for rollback
  const previousDataRef = useRef<T | null>(null);

  // Callback refs prevent the mutate() closure from going stale when the
  // consumer re-renders between mutate() call and async resolution. Without
  // these, a re-render could capture old onError/onSuccess closures that
  // reference outdated component state.
  const onMutateRef = useRef(onMutate);
  onMutateRef.current = onMutate;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  // Monotonically increasing ID so concurrent mutations resolve correctly.
  // If the user triggers mutate() twice quickly, only the latest mutation's
  // result is applied -- earlier ones are silently discarded.
  const mutationIdRef = useRef(0);

  // Ref to the rollback delay timer for cleanup
  const rollbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRollbackTimer = useCallback(() => {
    if (rollbackTimerRef.current !== null) {
      clearTimeout(rollbackTimerRef.current);
      rollbackTimerRef.current = null;
    }
  }, []);

  const rollback = useCallback(() => {
    if (previousDataRef.current !== null) {
      setData(previousDataRef.current);
    }
  }, []);

  const mutate = useCallback(
    async (optimisticData: T): Promise<T> => {
      // Save current data for potential rollback
      previousDataRef.current = data;

      // Apply optimistic update immediately
      setData(optimisticData);
      setIsPending(true);
      setError(null);
      clearRollbackTimer();

      const currentMutationId = ++mutationIdRef.current;

      try {
        const confirmedData = await onMutateRef.current(optimisticData);

        // Only apply if this is still the latest mutation
        if (currentMutationId === mutationIdRef.current) {
          setData(confirmedData);
          setIsPending(false);
          previousDataRef.current = null;
          onSuccessRef.current?.(confirmedData);
        }

        return confirmedData;
      } catch (err) {
        if (currentMutationId === mutationIdRef.current) {
          const mutationError = err instanceof Error ? err : new Error(String(err));
          setError(mutationError);
          setIsPending(false);

          // Roll back to previous data
          const rolledBackData = previousDataRef.current;
          if (rolledBackData !== null) {
            setData(rolledBackData);
          }

          // A rollback delay lets the UI briefly show the reverted state before
          // displaying an error toast, which feels more natural than an instant
          // flash-back + error appearing simultaneously.
          if (rollbackDelay > 0) {
            rollbackTimerRef.current = setTimeout(() => {
              rollbackTimerRef.current = null;
              onErrorRef.current?.(mutationError, rolledBackData as T);
            }, rollbackDelay);
          } else {
            onErrorRef.current?.(mutationError, rolledBackData as T);
          }

          throw mutationError;
        }

        throw err;
      }
    },
    [data, clearRollbackTimer, rollbackDelay]
  );

  return {
    mutate,
    isPending,
    error,
    rollback,
    data,
  };
}
