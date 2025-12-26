/**
 * Toast - useToast Hook
 * Provides toast methods for triggering toasts
 */

'use client';

import { useCallback } from 'react';
import type { ToastMethods, ToastOptions, ToastState } from '../types';
import { useToastContext } from './ToastProvider';

/**
 * Extended toast methods with additional utilities
 */
export interface UseToastReturn extends ToastMethods {
  /** All current toasts */
  toasts: ToastState[];
  /** Pause a specific toast */
  pause: (id: string) => void;
  /** Resume a specific toast */
  resume: (id: string) => void;
  /** Remove a toast from the stack (after exit animation) */
  remove: (id: string) => void;
}

/**
 * Hook to trigger and manage toasts
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

  const pause = useCallback(
    (id: string): void => {
      dispatch({ type: 'PAUSE', payload: id });
    },
    [dispatch]
  );

  const resume = useCallback(
    (id: string): void => {
      dispatch({ type: 'RESUME', payload: id });
    },
    [dispatch]
  );

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

/**
 * Standalone toast function for use outside React components
 * Requires ToastProvider to be mounted
 */
let toastMethods: ToastMethods | null = null;

export function setToastMethods(methods: ToastMethods): void {
  toastMethods = methods;
}

export function getToastMethods(): ToastMethods | null {
  return toastMethods;
}

/**
 * Create a standalone toast (for use outside React)
 * Note: This requires ToastProvider to be mounted and connected
 */
export const toast = {
  show: (options: ToastOptions): string | null => {
    if (!toastMethods) {
      console.warn('Toast: ToastProvider not mounted');
      return null;
    }
    return toastMethods.show(options);
  },
  success: (
    title: React.ReactNode,
    description?: React.ReactNode,
    options?: Partial<ToastOptions>
  ): string | null => {
    if (!toastMethods) {
      console.warn('Toast: ToastProvider not mounted');
      return null;
    }
    return toastMethods.success(title, description, options);
  },
  error: (
    title: React.ReactNode,
    description?: React.ReactNode,
    options?: Partial<ToastOptions>
  ): string | null => {
    if (!toastMethods) {
      console.warn('Toast: ToastProvider not mounted');
      return null;
    }
    return toastMethods.error(title, description, options);
  },
  warning: (
    title: React.ReactNode,
    description?: React.ReactNode,
    options?: Partial<ToastOptions>
  ): string | null => {
    if (!toastMethods) {
      console.warn('Toast: ToastProvider not mounted');
      return null;
    }
    return toastMethods.warning(title, description, options);
  },
  info: (
    title: React.ReactNode,
    description?: React.ReactNode,
    options?: Partial<ToastOptions>
  ): string | null => {
    if (!toastMethods) {
      console.warn('Toast: ToastProvider not mounted');
      return null;
    }
    return toastMethods.info(title, description, options);
  },
  dismiss: (id: string): void => {
    if (!toastMethods) {
      console.warn('Toast: ToastProvider not mounted');
      return;
    }
    toastMethods.dismiss(id);
  },
  dismissAll: (): void => {
    if (!toastMethods) {
      console.warn('Toast: ToastProvider not mounted');
      return;
    }
    toastMethods.dismissAll();
  },
};
