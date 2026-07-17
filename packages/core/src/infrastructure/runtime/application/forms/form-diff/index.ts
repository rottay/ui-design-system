'use client';

/**
 * @fileoverview Form Diff Hook - Rottay Design System
 * @description React hook for computing differences between original and current
 * form data, supporting deep comparison of nested objects and arrays, field
 * labels for user-friendly display, and field-level ignore lists.
 *
 * @remarks
 * The `useFormDiff` hook compares two snapshots of form data and produces a
 * structured diff describing what changed. Results are memoized and only
 * recalculated when the `original` or `current` values change.
 *
 * @example Basic Usage
 * ```tsx
 * import { useFormDiff } from '@rottay/design-system';
 *
 * function EditProfileForm({ saved, draft }) {
 *   const { diff, hasChanges, summary } = useFormDiff({
 *     original: saved,
 *     current: draft,
 *     fieldLabels: { firstName: 'First Name', lastName: 'Last Name' },
 *     ignore: ['updatedAt', 'id'],
 *   });
 *
 *   return (
 *     <Stack>
 *       {hasChanges && <Text variant="caption">{summary}</Text>}
 *       {diff.filter(d => d.type !== 'unchanged').map(d => (
 *         <Text key={d.field}>{d.label ?? d.field}: {String(d.oldValue)} -> {String(d.newValue)}</Text>
 *       ))}
 *     </Stack>
 *   );
 * }
 * ```
 *
 * @module System/Hooks/Form
 * @category System
 * @package @rottay/design-system
 */

import { useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * A single entry in the form diff result.
 */
export interface FormDiffEntry {
  /** Dot-notation field path (e.g. 'address.city') */
  field: string;
  /** Human-readable label if provided via `fieldLabels` */
  label?: string;
  /** The value in the original data */
  oldValue: any;
  /** The value in the current data */
  newValue: any;
  /** Type of change detected */
  type: 'added' | 'removed' | 'changed' | 'unchanged';
}

/**
 * Configuration options for the `useFormDiff` hook.
 */
export interface UseFormDiffOptions<T extends Record<string, any>> {
  /** The original (saved/initial) form data snapshot. */
  original: T;
  /** The current (in-progress) form data snapshot. */
  current: T;
  /**
   * Map of field paths to user-friendly labels.
   * Supports dot-notation keys (e.g. `{ 'address.city': 'City' }`).
   */
  fieldLabels?: Record<string, string>;
  /**
   * List of field paths to exclude from the diff.
   * Supports dot-notation (e.g. `['updatedAt', 'meta.version']`).
   */
  ignore?: string[];
}

/**
 * Return type of the `useFormDiff` hook.
 */
export interface UseFormDiffReturn {
  /** Full list of diff entries for all compared fields. */
  diff: FormDiffEntry[];
  /** Whether any field has a non-unchanged type. */
  hasChanges: boolean;
  /** List of field paths that changed (added, removed, or changed). */
  changedFields: string[];
  /** Number of fields that changed. */
  changedCount: number;
  /** Look up the diff entry for a specific field path. */
  getFieldDiff: (field: string) => FormDiffEntry | undefined;
  /** Human-readable summary string (e.g. "3 fields changed"). */
  summary: string;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Deep equality check for two values.
 * Handles primitives, arrays, plain objects, null, and undefined.
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (typeof a === 'object' && typeof b === 'object') {
    // Date comparison
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    if (a instanceof Date || b instanceof Date) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
}

/**
 * Check if a value is a plain object (not an array, Date, null, etc.).
 */
function isPlainObject(value: any): value is Record<string, any> {
  if (value == null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Date) return false;
  return true;
}

/**
 * Compute diff entries between two values at a given field path.
 * Recursively walks nested objects. Arrays are compared as atomic values
 * unless both sides contain objects, in which case element-level comparison
 * is performed.
 */
function computeDiff(
  original: any,
  current: any,
  prefix: string,
  ignoreSet: Set<string>,
  fieldLabels: Record<string, string>,
  entries: FormDiffEntry[],
): void {
  // Collect all keys from both sides
  const allKeys = new Set<string>();

  if (isPlainObject(original)) {
    for (const key of Object.keys(original)) allKeys.add(key);
  }
  if (isPlainObject(current)) {
    for (const key of Object.keys(current)) allKeys.add(key);
  }

  // If neither side is a plain object, compare as leaf values
  if (!isPlainObject(original) && !isPlainObject(current)) {
    if (ignoreSet.has(prefix)) return;

    const entry: FormDiffEntry = {
      field: prefix,
      label: fieldLabels[prefix],
      oldValue: original,
      newValue: current,
      type: 'unchanged',
    };

    if (original === undefined && current !== undefined) {
      entry.type = 'added';
    } else if (original !== undefined && current === undefined) {
      entry.type = 'removed';
    } else if (!deepEqual(original, current)) {
      entry.type = 'changed';
    }

    entries.push(entry);
    return;
  }

  // One side is an object, the other is not (or undefined)
  if (!isPlainObject(original) || !isPlainObject(current)) {
    if (ignoreSet.has(prefix)) return;

    const entry: FormDiffEntry = {
      field: prefix,
      label: fieldLabels[prefix],
      oldValue: original,
      newValue: current,
      type: 'unchanged',
    };

    if (original === undefined || original === null) {
      entry.type = 'added';
    } else if (current === undefined || current === null) {
      entry.type = 'removed';
    } else {
      entry.type = 'changed';
    }

    entries.push(entry);
    return;
  }

  // Both sides are plain objects - recurse into each key
  for (const key of allKeys) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;

    if (ignoreSet.has(fieldPath)) continue;

    const oldVal = original[key];
    const newVal = current[key];

    // If both values are plain objects, recurse
    if (isPlainObject(oldVal) && isPlainObject(newVal)) {
      computeDiff(oldVal, newVal, fieldPath, ignoreSet, fieldLabels, entries);
      continue;
    }

    // Leaf comparison (primitives, arrays, mixed types)
    const entry: FormDiffEntry = {
      field: fieldPath,
      label: fieldLabels[fieldPath],
      oldValue: oldVal,
      newValue: newVal,
      type: 'unchanged',
    };

    if (oldVal === undefined && newVal !== undefined) {
      entry.type = 'added';
    } else if (oldVal !== undefined && newVal === undefined) {
      entry.type = 'removed';
    } else if (!deepEqual(oldVal, newVal)) {
      entry.type = 'changed';
    }

    entries.push(entry);
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Form diff hook for comparing original and current form data.
 *
 * Computes a structured diff between two form data snapshots, supporting deep
 * comparison of nested objects, array comparison, field-level ignore lists, and
 * user-friendly field labels. All results are memoized and only recalculated
 * when `original` or `current` change.
 *
 * @param options - Hook configuration
 * @returns Diff entries, change metadata, and lookup utilities
 *
 * @example
 * ```tsx
 * const { diff, hasChanges, summary, getFieldDiff } = useFormDiff({
 *   original: savedProfile,
 *   current: editedProfile,
 *   fieldLabels: { firstName: 'First Name', 'address.city': 'City' },
 *   ignore: ['id', 'updatedAt'],
 * });
 * ```
 */
export function useFormDiff<T extends Record<string, any>>(
  options: UseFormDiffOptions<T>,
): UseFormDiffReturn {
  const { original, current, fieldLabels = {}, ignore = [] } = options;

  // Serialize to JSON for memo deps because React uses Object.is for dependency
  // comparison. Without serialization, every render would produce a new object
  // reference and recompute the diff even when the underlying data is identical.
  const originalSerialized = useMemo(() => {
    try {
      return JSON.stringify(original);
    } catch {
      return String(original);
    }
  }, [original]);

  const currentSerialized = useMemo(() => {
    try {
      return JSON.stringify(current);
    } catch {
      return String(current);
    }
  }, [current]);

  const diff = useMemo(() => {
    const ignoreSet = new Set(ignore);
    const entries: FormDiffEntry[] = [];

    computeDiff(original, current, '', ignoreSet, fieldLabels, entries);

    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalSerialized, currentSerialized, ignore.join(','), JSON.stringify(fieldLabels)]);

  const changedFields = useMemo(
    () => diff.filter((e) => e.type !== 'unchanged').map((e) => e.field),
    [diff],
  );

  const hasChanges = changedFields.length > 0;
  const changedCount = changedFields.length;

  const summary = useMemo(() => {
    if (changedCount === 0) return 'No changes';
    if (changedCount === 1) return '1 field changed';
    return `${changedCount} fields changed`;
  }, [changedCount]);

  // Pre-build a Map for O(1) field lookups. This avoids linear scanning when
  // components check individual fields (e.g., highlighting changed form inputs).
  const getFieldDiff = useMemo(() => {
    const map = new Map<string, FormDiffEntry>();
    for (const entry of diff) {
      map.set(entry.field, entry);
    }
    return (field: string): FormDiffEntry | undefined => map.get(field);
  }, [diff]);

  return {
    diff,
    hasChanges,
    changedFields,
    changedCount,
    getFieldDiff,
    summary,
  };
}
