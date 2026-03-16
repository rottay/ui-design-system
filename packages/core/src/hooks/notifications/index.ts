'use client';

/**
 * @fileoverview useNotificationPreferences Hook - Rottay Design System
 * @description React hook for managing notification preferences across
 * a matrix of categories and channels. Supports individual, row-level,
 * and column-level toggling with dirty tracking and batch save.
 *
 * @remarks
 * Features:
 * - Categories x Channels preference matrix management
 * - Individual toggle (single category-channel pair)
 * - Row toggle (all channels for a category)
 * - Column toggle (all categories for a channel)
 * - Dirty state tracking against initial values
 * - Async batch save with loading indicator
 * - Reset to initial state
 * - NotificationSurface integration via `notificationSurfaceProps`
 *
 * @example Basic usage
 * ```tsx
 * import { useNotificationPreferences } from '@rottay/design-system';
 *
 * const channels = [
 *   { id: 'email', label: 'Email' },
 *   { id: 'push', label: 'Push' },
 *   { id: 'sms', label: 'SMS' },
 * ];
 *
 * const categories = [
 *   {
 *     id: 'marketing',
 *     label: 'Marketing',
 *     channels: [
 *       { channelId: 'email', enabled: true },
 *       { channelId: 'push', enabled: false },
 *       { channelId: 'sms', enabled: false },
 *     ],
 *   },
 *   {
 *     id: 'security',
 *     label: 'Security Alerts',
 *     channels: [
 *       { channelId: 'email', enabled: true },
 *       { channelId: 'push', enabled: true },
 *       { channelId: 'sms', enabled: true },
 *     ],
 *   },
 * ];
 *
 * function NotificationSettings() {
 *   const prefs = useNotificationPreferences({
 *     channels,
 *     categories,
 *     onChange: (categoryId, channelId, enabled) => {
 *       console.log(`${categoryId}.${channelId} -> ${enabled}`);
 *     },
 *     onSave: async (preferences) => {
 *       await fetch('/api/notifications/preferences', {
 *         method: 'PUT',
 *         body: JSON.stringify(preferences),
 *       });
 *     },
 *   });
 *
 *   return (
 *     <Stack>
 *       {prefs.categories.map((cat) => (
 *         <Flex key={cat.id}>
 *           <Text>{cat.label}</Text>
 *           {cat.channels.map((ch) => (
 *             <Switch
 *               key={ch.channelId}
 *               checked={ch.enabled}
 *               onChange={() => prefs.toggle(cat.id, ch.channelId)}
 *             />
 *           ))}
 *         </Flex>
 *       ))}
 *       <Button onClick={prefs.save} disabled={!prefs.isDirty || prefs.isSaving}>
 *         {prefs.isSaving ? 'Saving...' : 'Save'}
 *       </Button>
 *       <Button onClick={prefs.reset} variant="ghost">Reset</Button>
 *     </Stack>
 *   );
 * }
 * ```
 *
 * @module System/Hooks/Notifications
 * @category System
 * @package @rottay/design-system
 */

import { type ReactNode, useState, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * A notification delivery channel (e.g. email, push, SMS).
 */
export interface NotificationChannel {
  /** Unique identifier for this channel. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional description shown in settings UI. */
  description?: string;
  /** Optional icon element. */
  icon?: ReactNode;
}

/**
 * A notification category with per-channel enabled/disabled state.
 */
export interface NotificationCategory {
  /** Unique identifier for this category. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional description shown in settings UI. */
  description?: string;
  /** Per-channel preference state for this category. */
  channels: {
    channelId: string;
    enabled: boolean;
  }[];
}

/**
 * Configuration options for the `useNotificationPreferences` hook.
 */
export interface UseNotificationPreferencesOptions {
  /** Available notification channels. */
  channels: NotificationChannel[];
  /** Initial category preferences with per-channel state. */
  categories: NotificationCategory[];
  /** Called whenever a single preference toggles. */
  onChange?: (categoryId: string, channelId: string, enabled: boolean) => void;
  /** Async callback to persist all preferences. */
  onSave?: (preferences: NotificationCategory[]) => Promise<void>;
}

/**
 * Return type of the `useNotificationPreferences` hook.
 */
export interface UseNotificationPreferencesReturn {
  /** Current category preferences (reactive). */
  categories: NotificationCategory[];
  /** Available channels (pass-through from options). */
  channels: NotificationChannel[];
  /** Toggle a specific channel for a specific category. */
  toggle: (categoryId: string, channelId: string) => void;
  /** Enable or disable all channels for a category. */
  toggleAll: (categoryId: string, enabled: boolean) => void;
  /** Enable or disable a channel across all categories. */
  toggleChannel: (channelId: string, enabled: boolean) => void;
  /** Whether the current state differs from the initial state. */
  isDirty: boolean;
  /** Persist current preferences via onSave. */
  save: () => Promise<void>;
  /** Whether a save operation is in progress. */
  isSaving: boolean;
  /** Reset preferences to initial state. */
  reset: () => void;
  /** Props ready for NotificationSurface integration. */
  notificationSurfaceProps: {
    preferences: { id: string; categoryId: string; channelId: string; enabled: boolean }[];
    onPreferenceChange: (id: string, enabled: boolean) => void;
  };
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Deep clone categories to avoid mutation.
 */
function cloneCategories(categories: NotificationCategory[]): NotificationCategory[] {
  return categories.map((cat) => ({
    ...cat,
    channels: cat.channels.map((ch) => ({ ...ch })),
  }));
}

/**
 * Compare two category arrays for equality.
 */
function categoriesEqual(
  a: NotificationCategory[],
  b: NotificationCategory[]
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const catA = a[i];
    const catB = b[i];
    if (catA.id !== catB.id) return false;
    if (catA.channels.length !== catB.channels.length) return false;
    for (let j = 0; j < catA.channels.length; j++) {
      if (
        catA.channels[j].channelId !== catB.channels[j].channelId ||
        catA.channels[j].enabled !== catB.channels[j].enabled
      ) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Build a composite ID for NotificationSurface integration.
 */
function buildPreferenceId(categoryId: string, channelId: string): string {
  return `${categoryId}::${channelId}`;
}

/**
 * Parse a composite ID back into categoryId and channelId.
 */
function parsePreferenceId(id: string): { categoryId: string; channelId: string } {
  const separatorIndex = id.indexOf('::');
  if (separatorIndex === -1) {
    return { categoryId: id, channelId: '' };
  }
  return {
    categoryId: id.slice(0, separatorIndex),
    channelId: id.slice(separatorIndex + 2),
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * React hook for managing notification preferences across categories and channels.
 *
 * Provides a complete preference matrix manager with individual, row, and column
 * level toggles. Tracks dirty state against the initial values and supports
 * async batch save with loading indicator.
 *
 * @param options - Hook configuration
 * @returns Preference state, mutation functions, and NotificationSurface integration props
 */
export function useNotificationPreferences(
  options: UseNotificationPreferencesOptions
): UseNotificationPreferencesReturn {
  const { channels, categories: initialCategories, onChange, onSave } = options;

  // ---- State ----
  // Lazy initializer with cloneCategories ensures we never mutate the
  // caller's original array, which would cause subtle bugs if the caller
  // shares the array with other components.
  const [categories, setCategories] = useState<NotificationCategory[]>(
    () => cloneCategories(initialCategories)
  );
  const [isSaving, setIsSaving] = useState(false);

  // initialCategoriesRef tracks the "clean" state for dirty detection.
  // Updated on every render so that if the parent changes initialCategories
  // (e.g. after a save), the dirty flag resets correctly.
  const initialCategoriesRef = useRef<NotificationCategory[]>(initialCategories);
  initialCategoriesRef.current = initialCategories;

  // Callback refs prevent toggle/toggleAll/toggleChannel from having
  // onChange/onSave in their dep arrays, keeping them stable across renders.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // ---- Dirty check ----
  // Computed on every render (not memoized) because the deep comparison
  // is O(categories * channels) which is typically < 100 items.
  const isDirty = !categoriesEqual(categories, initialCategoriesRef.current);

  // ---- Toggle a single channel for a category ----
  // Dependency-free (stable identity) because it reads callbacks from refs
  // and uses the functional updater to access current state.
  const toggle = useCallback((categoryId: string, channelId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          channels: cat.channels.map((ch) => {
            if (ch.channelId !== channelId) return ch;
            const newEnabled = !ch.enabled;
            // Fire onChange synchronously so the consumer can react
            // (e.g. show a toast) before the next render.
            onChangeRef.current?.(categoryId, channelId, newEnabled);
            return { ...ch, enabled: newEnabled };
          }),
        };
      })
    );
  }, []);

  // ---- Toggle all channels for a category ----
  const toggleAll = useCallback((categoryId: string, enabled: boolean) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          channels: cat.channels.map((ch) => {
            if (ch.enabled !== enabled) {
              onChangeRef.current?.(categoryId, ch.channelId, enabled);
            }
            return { ...ch, enabled };
          }),
        };
      })
    );
  }, []);

  // ---- Toggle a channel across all categories ----
  const toggleChannel = useCallback((channelId: string, enabled: boolean) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        channels: cat.channels.map((ch) => {
          if (ch.channelId !== channelId) return ch;
          if (ch.enabled !== enabled) {
            onChangeRef.current?.(cat.id, channelId, enabled);
          }
          return { ...ch, enabled };
        }),
      }))
    );
  }, []);

  // ---- Save ----
  const save = useCallback(async () => {
    const saveFn = onSaveRef.current;
    if (!saveFn) return;

    setIsSaving(true);
    try {
      await saveFn(categories);
    } finally {
      setIsSaving(false);
    }
  }, [categories]);

  // ---- Reset ----
  const reset = useCallback(() => {
    setCategories(cloneCategories(initialCategoriesRef.current));
  }, []);

  // ---- NotificationSurface integration ----
  // Flattens the category x channel matrix into a flat list of preference
  // objects keyed by a composite "categoryId::channelId" ID. This shape
  // matches what NotificationSurface expects, so consumers can spread
  // these props directly without manual mapping.
  const notificationSurfaceProps = {
    preferences: categories.flatMap((cat) =>
      cat.channels.map((ch) => ({
        id: buildPreferenceId(cat.id, ch.channelId),
        categoryId: cat.id,
        channelId: ch.channelId,
        enabled: ch.enabled,
      }))
    ),
    onPreferenceChange: (id: string, enabled: boolean) => {
      // Reverse the composite ID back into category + channel, then
      // apply the same state update logic as the toggle() function.
      const { categoryId, channelId } = parsePreferenceId(id);
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            channels: cat.channels.map((ch) => {
              if (ch.channelId !== channelId) return ch;
              onChangeRef.current?.(categoryId, channelId, enabled);
              return { ...ch, enabled };
            }),
          };
        })
      );
    },
  };

  return {
    categories,
    channels,
    toggle,
    toggleAll,
    toggleChannel,
    isDirty,
    save,
    isSaving,
    reset,
    notificationSurfaceProps,
  };
}
