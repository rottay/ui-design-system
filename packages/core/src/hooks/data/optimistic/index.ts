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

// ============================================================================
// Optimistic list reconciliation (thin recipe over useOptimisticUpdate)
// ============================================================================

/**
 * Configuration options for the `useOptimisticList` recipe.
 */
export interface UseOptimisticListOptions<T> {
  /**
   * Stable identity extractor. Used to reconcile a server-confirmed row back
   * into the list and to locate a row for removal. Must be domain-agnostic
   * (e.g. `(row) => row.id`).
   */
  getKey: (item: T) => string | number;

  /** Initial list contents. @default [] */
  initialItems?: T[];

  /**
   * Delay in milliseconds before `onError` fires (and the list reverts) after a
   * failed operation. Forwarded to the underlying `useOptimisticUpdate`.
   * @default 0
   */
  rollbackDelay?: number;

  /**
   * Called after the list rolls back on failure. Receives the error and the
   * restored list snapshot.
   */
  onError?: (error: Error, restored: T[]) => void;

  /**
   * Called after a confirmed operation reconciles into the list. Receives the
   * server-confirmed row.
   */
  onSuccess?: (confirmed: T) => void;
}

/**
 * Return type of the `useOptimisticList` recipe.
 */
export interface UseOptimisticListReturn<T> {
  /** Current list (optimistic or confirmed). */
  items: T[];

  /** Replace the list imperatively (e.g. after an external refetch). */
  setItems: (items: T[]) => void;

  /**
   * Optimistically upsert `optimisticItem` (replace by key or append), run
   * `mutate`, then reconcile the server-confirmed row into the list. On failure
   * the list reverts to its pre-operation snapshot (after `rollbackDelay`).
   * Resolves with the confirmed row; rejects if `mutate` throws.
   */
  upsert: (optimisticItem: T, mutate: (item: T) => Promise<T>) => Promise<T>;

  /**
   * Optimistically remove `item`, run `mutate`, and keep it removed on success.
   * On failure the list reverts to its pre-operation snapshot.
   */
  remove: (item: T, mutate: (item: T) => Promise<unknown>) => Promise<void>;

  /** Whether an operation is in flight. */
  isPending: boolean;

  /** The last operation error, or null. */
  error: Error | null;
}

/**
 * Replace `item` in `list` by key, or append it when absent.
 */
function upsertByKey<T>(
  list: T[],
  item: T,
  getKey: (item: T) => string | number,
): T[] {
  const key = getKey(item);
  const index = list.findIndex((existing) => getKey(existing) === key);
  if (index === -1) {
    return [...list, item];
  }
  const next = list.slice();
  next[index] = item;
  return next;
}

/**
 * Domain-agnostic optimistic row/list reconciliation over `useOptimisticUpdate`.
 *
 * Applies an optimistic row change to a local list immediately, runs the caller's
 * per-row mutation, reconciles the confirmed row on success, and rolls the whole
 * list back to its pre-operation snapshot on failure — inheriting the single-flight
 * guard and `rollbackDelay` timing of `useOptimisticUpdate`. Because it inherits
 * that single-flight behavior, concurrent operations resolve latest-wins; drive
 * genuinely independent row mutations from separate instances if needed.
 *
 * This recipe carries no product semantics: it only knows how to key, upsert, and
 * remove rows. Apps bind it to their own action-result envelope and copy.
 *
 * @param options - Recipe configuration
 * @returns The list plus `upsert` / `remove` operations and mutation state
 *
 * @example
 * ```tsx
 * const { items, upsert, remove } = useOptimisticList<Row>({
 *   getKey: (row) => row.id,
 *   initialItems: rows,
 *   rollbackDelay: 400,
 *   onError: (err) => toast.error(err.message),
 * });
 *
 * // Optimistically mark a row done, reconcile the server row on confirm:
 * upsert({ ...row, status: 'done' }, (r) => api.updateRow(r));
 * ```
 */
export function useOptimisticList<T>(
  options: UseOptimisticListOptions<T>,
): UseOptimisticListReturn<T> {
  const { getKey, initialItems = [], rollbackDelay, onError, onSuccess } = options;

  const [items, setItems] = useState<T[]>(initialItems);

  // Latest values captured in refs so the single engine's config callbacks and
  // the imperative operations always read current state without re-arming.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const getKeyRef = useRef(getKey);
  getKeyRef.current = getKey;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  // Snapshot of the list captured immediately before an optimistic write, and
  // restored verbatim if the operation fails.
  const snapshotRef = useRef<T[] | null>(null);

  // Kind of the in-flight operation so the confirm step reconciles correctly:
  // an 'upsert' folds the confirmed row back in, a 'remove' keeps it gone.
  const opKindRef = useRef<'upsert' | 'remove' | null>(null);

  // Per-call server function, injected via a ref so a single engine instance
  // serves every operation.
  const serverCallRef = useRef<(row: T) => Promise<T>>(() =>
    Promise.reject(new Error('useOptimisticList: no operation in flight')),
  );

  const engine = useOptimisticUpdate<T>({
    onMutate: (row) => serverCallRef.current(row),
    rollbackDelay,
    onSuccess: (confirmed) => {
      if (opKindRef.current === 'upsert') {
        setItems((current) => upsertByKey(current, confirmed, getKeyRef.current));
      }
      snapshotRef.current = null;
      opKindRef.current = null;
      onSuccessRef.current?.(confirmed);
    },
    onError: (error) => {
      const restored = snapshotRef.current ?? itemsRef.current;
      if (snapshotRef.current !== null) {
        setItems(snapshotRef.current);
      }
      snapshotRef.current = null;
      opKindRef.current = null;
      onErrorRef.current?.(error, restored);
    },
  });

  // engine.mutate identity changes whenever its confirmed data changes; keep it
  // in a ref so the operations below stay referentially stable.
  const mutateRef = useRef(engine.mutate);
  mutateRef.current = engine.mutate;

  const upsert = useCallback(
    (optimisticItem: T, mutate: (item: T) => Promise<T>): Promise<T> => {
      snapshotRef.current = itemsRef.current;
      opKindRef.current = 'upsert';
      serverCallRef.current = mutate;
      setItems((current) => upsertByKey(current, optimisticItem, getKeyRef.current));
      return mutateRef.current(optimisticItem);
    },
    [],
  );

  const remove = useCallback(
    async (item: T, mutate: (item: T) => Promise<unknown>): Promise<void> => {
      snapshotRef.current = itemsRef.current;
      opKindRef.current = 'remove';
      // The engine reconciles a T on success; echo the removed row so the list
      // stays without it rather than folding anything back in.
      serverCallRef.current = (row) => Promise.resolve(mutate(row)).then(() => row);
      const key = getKeyRef.current(item);
      setItems((current) => current.filter((existing) => getKeyRef.current(existing) !== key));
      await mutateRef.current(item);
    },
    [],
  );

  return {
    items,
    setItems,
    upsert,
    remove,
    isPending: engine.isPending,
    error: engine.error,
  };
}
