/**
 * @fileoverview useToast Hook - Rottay Design System
 * @description React hook for triggering and managing toasts.
 * Provides methods for showing, dismissing, and controlling toasts.
 *
 * @remarks
 * The useToast hook is the primary way to interact with the toast system
 * from within React components. It provides:
 * - Methods for showing toasts of different variants
 * - Methods for dismissing individual or all toasts
 * - Access to the current toast list
 * - Pause/resume control for individual toasts
 *
 * For use outside React components, use the standalone `toast` object.
 *
 * @example Basic Usage
 * ```tsx
 * import { useToast } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const { success, error, warning, info } = useToast();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       success('Saved!', 'Your changes have been saved.');
 *     } catch (err) {
 *       error('Error', 'Failed to save changes.');
 *     }
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 *
 * @example Advanced Usage
 * ```tsx
 * function AdvancedToasts() {
 *   const { show, dismiss, dismissAll, toasts } = useToast();
 *
 *   const showCustom = () => {
 *     const id = show({
 *       variant: 'info',
 *       title: 'Custom Toast',
 *       description: 'With action button',
 *       action: {
 *         label: 'Undo',
 *         onClick: () => console.log('Undo clicked'),
 *       },
 *       duration: 10000,
 *       showProgress: true,
 *     });
 *
 *     // Can dismiss later
 *     setTimeout(() => dismiss(id), 5000);
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={showCustom}>Custom Toast</button>
 *       <button onClick={dismissAll}>Dismiss All</button>
 *       <p>Active toasts: {toasts.length}</p>
 *     </>
 *   );
 * }
 * ```
 *
 * @see {@link ToastProvider} for context setup
 * @see {@link toast} for standalone usage outside React
 *
 * @module Toast/useToast
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import { useCallback } from 'react';
import type { ToastMethods, ToastOptions, ToastState } from '../../../../contracts';
import { useToastContext } from '..';
import { getToastMethods } from '../../method-registry';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';

// ============================================================================
// Hook Return Type
// ============================================================================

/**
 * Return type for the useToast hook.
 *
 * @description
 * Extends ToastMethods with additional utilities:
 * - Current toast list
 * - Pause/resume controls
 * - Remove method (for cleanup after animation)
 */
export interface UseToastReturn extends ToastMethods {
  /** All current toasts in the stack */
  toasts: ToastState[];
  /** Pause a specific toast's auto-dismiss timer */
  pause: (id: string) => void;
  /** Resume a specific toast's auto-dismiss timer */
  resume: (id: string) => void;
  /** Remove a toast from the stack (after exit animation) */
  remove: (id: string) => void;
}

// ============================================================================
// useToast Hook
// ============================================================================

/**
 * Hook to trigger and manage toasts.
 *
 * @description
 * Provides all toast methods plus additional utilities for advanced
 * toast management. Must be used within a ToastProvider.
 *
 * @remarks
 * Available methods:
 * - `show(options)` - Show a custom toast
 * - `success(title, description?, options?)` - Show success toast
 * - `error(title, description?, options?)` - Show error toast
 * - `warning(title, description?, options?)` - Show warning toast
 * - `info(title, description?, options?)` - Show info toast
 * - `dismiss(id)` - Dismiss a toast (triggers exit animation)
 * - `dismissAll()` - Dismiss all toasts
 * - `update(id, options)` - Update a toast's options
 * - `pause(id)` - Pause auto-dismiss
 * - `resume(id)` - Resume auto-dismiss
 * - `remove(id)` - Remove from stack immediately
 *
 * @returns {@link UseToastReturn} - Toast methods and utilities
 * @throws Error if used outside ToastProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { success, error, dismiss } = useToast();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       success('Saved!', 'Your changes have been saved.');
 *     } catch (err) {
 *       error('Error', 'Failed to save changes.');
 *     }
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useToast(): UseToastReturn {
  const { toasts, methods, dispatch } = useToastContext();

  /**
   * Pause a toast's auto-dismiss timer.
   * @param id - Toast ID to pause
   */
  const pause = useCallback(
    (id: string): void => {
      dispatch({ type: 'PAUSE', payload: id });
    },
    [dispatch]
  );

  /**
   * Resume a toast's auto-dismiss timer.
   * @param id - Toast ID to resume
   */
  const resume = useCallback(
    (id: string): void => {
      dispatch({ type: 'RESUME', payload: id });
    },
    [dispatch]
  );

  /**
   * Remove a toast from the stack immediately.
   * Use after exit animation completes.
   * @param id - Toast ID to remove
   */
  const remove = useCallback(
    (id: string): void => {
      dispatch({ type: 'REMOVE', payload: id });
    },
    [dispatch]
  );

  return {
    ...methods,
    toasts,
    pause,
    resume,
    remove,
  };
}

// ============================================================================
// Standalone Toast Object
// ============================================================================

/**
 * Standalone toast object for use outside React components.
 *
 * @description
 * Provides toast methods that can be called from anywhere in your code,
 * including non-React files, API utilities, or event handlers.
 *
 * @remarks
 * **Important:** Requires ToastProvider to be mounted in your app.
 * If called before the provider mounts, a warning is logged and
 * the method returns null/void.
 *
 * @example Basic Usage
 * ```tsx
 * import { toast } from '@rottay/design-system';
 *
 * // In an API utility
 * async function fetchData() {
 *   try {
 *     const data = await fetch('/api/data');
 *     toast.success('Data loaded', 'Successfully fetched the data.');
 *     return data.json();
 *   } catch (error) {
 *     toast.error('Error', 'Failed to fetch data.');
 *     throw error;
 *   }
 * }
 * ```
 *
 * @example All Methods
 * ```tsx
 * // Show different variants
 * toast.success('Success', 'Operation completed');
 * toast.error('Error', 'Something went wrong');
 * toast.warning('Warning', 'Please check your input');
 * toast.info('Info', 'New features available');
 *
 * // Show custom toast
 * const id = toast.show({
 *   variant: 'primary',
 *   title: 'Custom',
 *   duration: 10000,
 * });
 *
 * // Dismiss toasts
 * toast.dismiss(id);      // Dismiss specific
 * toast.dismissAll();     // Dismiss all
 * ```
 */
export const toast = {
  /**
   * Show a custom toast with full options.
   * @param options - Toast configuration
  * @returns Toast ID or null if provider not mounted
  */
  show: (options: ToastOptions): string | null => {
    const methods = getToastMethods();
    if (!methods) {
      warnOnceInDev('toast:provider-missing', 'Toast: ToastProvider not mounted');
      return null;
    }
    return methods.show(options);
  },

  /**
   * Show a success toast.
   * @param title - Toast title
   * @param description - Optional description
   * @param options - Additional options
   * @returns Toast ID or null
   */
  success: (
    title: React.ReactNode,
    description?: React.ReactNode,
    options?: Partial<ToastOptions>
  ): string | null => {
    const methods = getToastMethods();
    if (!methods) {
      warnOnceInDev('toast:provider-missing', 'Toast: ToastProvider not mounted');
      return null;
    }
    return methods.success(title, description, options);
  },

  /**
   * Show an error toast.
   * @param title - Toast title
   * @param description - Optional description
   * @param options - Additional options
   * @returns Toast ID or null
   */
  error: (
    title: React.ReactNode,
    description?: React.ReactNode,
    options?: Partial<ToastOptions>
  ): string | null => {
    const methods = getToastMethods();
    if (!methods) {
      warnOnceInDev('toast:provider-missing', 'Toast: ToastProvider not mounted');
      return null;
    }
    return methods.error(title, description, options);
  },

  /**
   * Show a warning toast.
   * @param title - Toast title
   * @param description - Optional description
   * @param options - Additional options
   * @returns Toast ID or null
   */
  warning: (
    title: React.ReactNode,
    description?: React.ReactNode,
    options?: Partial<ToastOptions>
  ): string | null => {
    const methods = getToastMethods();
    if (!methods) {
      warnOnceInDev('toast:provider-missing', 'Toast: ToastProvider not mounted');
      return null;
    }
    return methods.warning(title, description, options);
  },

  /**
   * Show an info toast.
   * @param title - Toast title
   * @param description - Optional description
   * @param options - Additional options
   * @returns Toast ID or null
   */
  info: (
    title: React.ReactNode,
    description?: React.ReactNode,
    options?: Partial<ToastOptions>
  ): string | null => {
    const methods = getToastMethods();
    if (!methods) {
      warnOnceInDev('toast:provider-missing', 'Toast: ToastProvider not mounted');
      return null;
    }
    return methods.info(title, description, options);
  },

  /**
   * Dismiss a specific toast by ID.
   * @param id - Toast ID to dismiss
   */
  dismiss: (id: string): void => {
    const methods = getToastMethods();
    if (!methods) {
      warnOnceInDev('toast:provider-missing', 'Toast: ToastProvider not mounted');
      return;
    }
    methods.dismiss(id);
  },

  /**
   * Dismiss all active toasts.
   */
  dismissAll: (): void => {
    const methods = getToastMethods();
    if (!methods) {
      warnOnceInDev('toast:provider-missing', 'Toast: ToastProvider not mounted');
      return;
    }
    methods.dismissAll();
  },
};
