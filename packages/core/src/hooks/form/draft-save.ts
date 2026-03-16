'use client';

/**
 * @fileoverview Draft Save Hook - Rottay Design System
 * @description React hook for persisting form draft state to localStorage with
 * TTL-based expiration, auto-restore on mount, and SSR safety.
 *
 * @remarks
 * The `useDraftSave` hook persists form state to `localStorage` under a given
 * key. On mount it checks for an existing (non-expired) draft and restores it
 * automatically. Drafts expire after a configurable TTL (default 24 hours).
 *
 * All `localStorage` access is guarded behind a `typeof window` check, making
 * the hook safe for server-side rendering environments.
 *
 * @example Basic Usage
 * ```tsx
 * import { useDraftSave } from '@rottay/design-system';
 *
 * function CreateEventForm() {
 *   const { data, setData, hasDraft, clearDraft, lastDraftAt } = useDraftSave({
 *     key: 'create-event-draft',
 *     initialData: { title: '', date: '', venue: '' },
 *     ttl: 12 * 60 * 60 * 1000, // 12 hours
 *   });
 *
 *   const handleSubmit = async () => {
 *     await api.createEvent(data);
 *     clearDraft();
 *   };
 *
 *   return (
 *     <Stack>
 *       {hasDraft && <Text variant="caption">Restored from draft</Text>}
 *       <Input
 *         value={data.title}
 *         onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
 *       />
 *       {lastDraftAt && (
 *         <Text variant="caption">Draft saved {lastDraftAt.toLocaleTimeString()}</Text>
 *       )}
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
 * Configuration options for the `useDraftSave` hook.
 */
export interface UseDraftSaveOptions<T> {
  /**
   * localStorage key under which the draft is stored.
   * Prefixed internally with `ds-draft:` to avoid collisions.
   */
  key: string;

  /** Initial data used when no draft exists or the draft has expired. */
  initialData: T;

  /**
   * Time-to-live in milliseconds before a stored draft expires.
   * Expired drafts are silently discarded on mount.
   * @default 86400000 (24 hours)
   */
  ttl?: number;
}

/**
 * Return type of the `useDraftSave` hook.
 */
export interface UseDraftSaveReturn<T> {
  /** The current data value (draft or initial). */
  data: T;

  /**
   * Update the data. Accepts either a new value or an updater function.
   * Each call persists the new value to localStorage.
   */
  setData: (dataOrUpdater: T | ((prev: T) => T)) => void;

  /** Whether a valid (non-expired) draft was found and restored on mount. */
  hasDraft: boolean;

  /** Manually restore the draft from localStorage (no-op if none exists). */
  restoreDraft: () => void;

  /** Remove the draft from localStorage and reset to initialData. */
  clearDraft: () => void;

  /** Timestamp of the last write to localStorage, or null if never written. */
  lastDraftAt: Date | null;
}

// ============================================================================
// Storage Utilities
// ============================================================================

interface StoredDraft<T> {
  data: T;
  savedAt: number; // Unix ms
}

const STORAGE_PREFIX = 'ds-draft:';

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Checks whether localStorage is available (SSR-safe).
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__ds_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a draft from localStorage. Returns null if missing, unparseable, or expired.
 */
function readDraft<T>(key: string, ttl: number): StoredDraft<T> | null {
  if (!isStorageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(getStorageKey(key));
    if (!raw) return null;

    const parsed: StoredDraft<T> = JSON.parse(raw);

    // Check TTL expiration
    const age = Date.now() - parsed.savedAt;
    if (age > ttl) {
      // Expired - clean up
      window.localStorage.removeItem(getStorageKey(key));
      return null;
    }

    return parsed;
  } catch {
    // Corrupted data - clean up
    try {
      window.localStorage.removeItem(getStorageKey(key));
    } catch {
      // Ignore cleanup failure
    }
    return null;
  }
}

/**
 * Write a draft to localStorage.
 */
function writeDraft<T>(key: string, data: T): number {
  if (!isStorageAvailable()) return Date.now();

  const savedAt = Date.now();
  const stored: StoredDraft<T> = { data, savedAt };

  try {
    window.localStorage.setItem(getStorageKey(key), JSON.stringify(stored));
  } catch {
    // Storage full or blocked - silently ignore
  }

  return savedAt;
}

/**
 * Remove a draft from localStorage.
 */
function removeDraft(key: string): void {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.removeItem(getStorageKey(key));
  } catch {
    // Ignore removal failure
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/** Default TTL: 24 hours */
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

/**
 * Draft persistence hook with localStorage and TTL expiration.
 *
 * Persists form data to `localStorage` under the given key. On mount, checks
 * for an existing draft and restores it if it has not expired. All storage
 * access is SSR-safe.
 *
 * @param options - Hook configuration
 * @returns Draft state, control functions, and metadata
 *
 * @example
 * ```tsx
 * const { data, setData, hasDraft, clearDraft } = useDraftSave({
 *   key: 'my-form',
 *   initialData: { title: '', description: '' },
 * });
 * ```
 */
export function useDraftSave<T>(options: UseDraftSaveOptions<T>): UseDraftSaveReturn<T> {
  const { key, initialData, ttl = DEFAULT_TTL } = options;

  // ---- State ----
  const [data, setDataState] = useState<T>(initialData);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastDraftAt, setLastDraftAt] = useState<Date | null>(null);

  // Keep stable refs
  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;

  // Track whether initial restore has occurred
  const restoredRef = useRef(false);

  // ---- Auto-restore on mount ----
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const stored = readDraft<T>(key, ttl);
    if (stored) {
      setDataState(stored.data);
      setHasDraft(true);
      setLastDraftAt(new Date(stored.savedAt));
    }
  }, [key, ttl]);

  // Persists to localStorage on every setData call. This is intentional: draft
  // saves should be as frequent as possible so the user never loses more than
  // a few keystrokes on an unexpected tab close or navigation.
  const setData = useCallback(
    (dataOrUpdater: T | ((prev: T) => T)) => {
      setDataState((prev) => {
        const next =
          typeof dataOrUpdater === 'function'
            ? (dataOrUpdater as (prev: T) => T)(prev)
            : dataOrUpdater;

        // Write happens inside the updater function so the persisted data
        // always matches what React committed to state.
        const savedAt = writeDraft(key, next);
        setLastDraftAt(new Date(savedAt));
        setHasDraft(true);

        return next;
      });
    },
    [key]
  );

  // ---- Restore draft manually ----
  const restoreDraft = useCallback(() => {
    const stored = readDraft<T>(key, ttl);
    if (stored) {
      setDataState(stored.data);
      setHasDraft(true);
      setLastDraftAt(new Date(stored.savedAt));
    }
  }, [key, ttl]);

  // ---- Clear draft ----
  const clearDraft = useCallback(() => {
    removeDraft(key);
    setDataState(initialDataRef.current);
    setHasDraft(false);
    setLastDraftAt(null);
  }, [key]);

  return {
    data,
    setData,
    hasDraft,
    restoreDraft,
    clearDraft,
    lastDraftAt,
  };
}
