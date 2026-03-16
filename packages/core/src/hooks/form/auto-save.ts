'use client';

/**
 * @fileoverview Auto-Save Hook - Rottay Design System
 * @description React hook for debounced automatic saving of form data with
 * status tracking, deep equality checks, and force-save capability.
 *
 * @remarks
 * The `useAutoSave` hook watches a reactive data object for changes and
 * persists it via the provided `onSave` callback after a configurable debounce
 * period. It skips unnecessary saves when the data has not changed (deep
 * equality comparison) and exposes a status indicator for UI feedback.
 *
 * @example Basic Usage
 * ```tsx
 * import { useAutoSave } from '@rottay/design-system';
 *
 * function NoteEditor() {
 *   const [note, setNote] = useState({ title: '', body: '' });
 *
 *   const { status, lastSavedAt, isDirty } = useAutoSave({
 *     data: note,
 *     onSave: async (data) => {
 *       await fetch('/api/notes', {
 *         method: 'PUT',
 *         body: JSON.stringify(data),
 *       });
 *     },
 *     debounceMs: 2000,
 *   });
 *
 *   return (
 *     <Stack>
 *       <Input value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} />
 *       <Text variant="caption">
 *         {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : ''}
 *       </Text>
 *     </Stack>
 *   );
 * }
 * ```
 *
 * @module System/Hooks/Form
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Auto-save status indicator.
 * - `idle` - No changes detected since last save (or initial mount)
 * - `saving` - A save operation is currently in progress
 * - `saved` - The last save completed successfully
 * - `error` - The last save failed
 */
export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Configuration options for the `useAutoSave` hook.
 */
export interface UseAutoSaveOptions<T> {
  /** The reactive data to watch for changes. */
  data: T;

  /** Async callback invoked to persist the data. */
  onSave: (data: T) => Promise<void>;

  /**
   * Debounce interval in milliseconds. The save fires this many ms after the
   * last data change. Set to 0 to save on every change immediately.
   * @default 1500
   */
  debounceMs?: number;

  /**
   * Whether auto-save is enabled. When false, no automatic saves occur.
   * The `save()` function can still be called manually.
   * @default true
   */
  enabled?: boolean;

  /** Called when the save operation fails. */
  onError?: (error: Error) => void;
}

/**
 * Return type of the `useAutoSave` hook.
 */
export interface UseAutoSaveReturn {
  /** Current save status for UI indicators. */
  status: AutoSaveStatus;

  /** Timestamp of the last successful save, or null if never saved. */
  lastSavedAt: Date | null;

  /** Force an immediate save, bypassing the debounce timer. */
  save: () => Promise<void>;

  /** Whether the current data differs from the last saved snapshot. */
  isDirty: boolean;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Simple deep equality check using JSON serialization.
 * Sufficient for plain data objects, arrays, and primitives.
 */
// JSON.stringify comparison is intentionally simple here. The auto-save hook
// only needs to detect "has the form data changed?" -- not produce a diff.
// For complex objects with circular references or class instances, consumers
// should pre-serialize before passing data to the hook.
function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Debounced auto-save hook with status tracking.
 *
 * Watches the `data` value for changes and automatically calls `onSave` after
 * the configured debounce period. Skips saves when data is unchanged (deep
 * equality). Exposes a `save()` function for forced immediate persistence and
 * an `isDirty` flag for discard/unsaved-changes warnings.
 *
 * @param options - Hook configuration
 * @returns Save status, timestamp, and control functions
 *
 * @example
 * ```tsx
 * const { status, isDirty, save } = useAutoSave({
 *   data: formValues,
 *   onSave: async (values) => api.saveDraft(values),
 *   debounceMs: 2000,
 * });
 * ```
 */
export function useAutoSave<T>(options: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const { data, onSave, debounceMs = 1500, enabled = true, onError } = options;

  // ---- State ----
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Stable refs for callbacks
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Track last saved data snapshot for deep equality
  const lastSavedDataRef = useRef<T>(data);

  // Track current data for the save function
  const currentDataRef = useRef<T>(data);
  currentDataRef.current = data;

  // Debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prevent saves after unmount
  const mountedRef = useRef(true);

  // Guard against concurrent saves. Two debounced saves could overlap if the
  // onSave callback takes longer than the debounce interval. Without this lock,
  // the second save could snapshot stale data or cause race conditions.
  const savingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // ---- Core save function ----
  const executeSave = useCallback(async () => {
    if (savingRef.current) return;

    const dataToSave = currentDataRef.current;

    // Skip if data hasn't changed since the last successful save. The
    // lastSavedAt null check allows the very first save to proceed even
    // when the data matches the initial value.
    if (deepEqual(dataToSave, lastSavedDataRef.current) && lastSavedAt !== null) {
      setIsDirty(false);
      return;
    }

    savingRef.current = true;
    if (mountedRef.current) setStatus('saving');

    try {
      await onSaveRef.current(dataToSave);

      if (mountedRef.current) {
        lastSavedDataRef.current = dataToSave;
        setStatus('saved');
        setLastSavedAt(new Date());
        setIsDirty(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        const saveError = err instanceof Error ? err : new Error(String(err));
        setStatus('error');
        onErrorRef.current?.(saveError);
      }
    } finally {
      savingRef.current = false;
    }
  }, [lastSavedAt]);

  // ---- Force save (public API) ----
  const save = useCallback(async () => {
    // Clear any pending debounce
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    await executeSave();
  }, [executeSave]);

  // ---- Watch data changes and debounce ----
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Check if data actually changed
    const changed = !deepEqual(data, lastSavedDataRef.current);
    setIsDirty(changed);

    if (!changed || !enabled) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      executeSave();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [data, enabled, debounceMs, executeSave]);

  return {
    status,
    lastSavedAt,
    save,
    isDirty,
  };
}
