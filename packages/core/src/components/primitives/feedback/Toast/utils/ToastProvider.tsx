/**
 * @fileoverview ToastProvider - context provider for toast stack state management.
 * Uses a reducer pattern for predictable state transitions (ADD, DISMISS, PAUSE, etc.).
 * Preserves the legacy animation compatibility hook and exposes imperative methods via context.
 * Toast paint and keyframes come from the required public stylesheet.
 *
 * @example
 * ```tsx
 * <ToastProvider position="top-right" duration={5000} max={5}>
 *   <App />
 *   <Toast.Container />
 * </ToastProvider>
 * ```
 *
 * @module Toast/Provider
 * @category Feedback
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type { ToastState, ToastOptions, ToastMethods, ToastProviderConfig } from '../Toast.types';
import { TOAST_DEFAULTS, TOAST_CONTAINER_DEFAULTS } from '../Toast.types';
import { injectToastStyles } from './animations';
import { clearToastMethods, setToastMethods } from './useToast';

// ---------------------------------------------------------------------------
// ID Generation
// ---------------------------------------------------------------------------

/** Monotonic counter combined with timestamp for collision-free toast IDs. */
let toastIdCounter = 0;

/** @internal */
function generateToastId(): string {
  return `toast-${++toastIdCounter}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Action Types
// ---------------------------------------------------------------------------

/** Discriminated union of all actions the toast reducer can process. */
export type ToastDispatchAction =
  | { type: 'ADD'; payload: ToastState }
  | { type: 'UPDATE'; payload: { id: string; options: Partial<ToastOptions> } }
  | { type: 'DISMISS'; payload: string }
  | { type: 'DISMISS_ALL' }
  | { type: 'PAUSE'; payload: string }
  | { type: 'RESUME'; payload: string }
  | { type: 'REMOVE'; payload: string };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/** Pure reducer for toast state transitions. @internal */
function toastReducer(state: ToastState[], action: ToastDispatchAction): ToastState[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];

    case 'UPDATE':
      return state.map((toast) =>
        toast.id === action.payload.id
          ? {
              ...toast,
              options: { ...toast.options, ...action.payload.options },
            }
          : toast
      );

    case 'DISMISS':
      return state.map((toast) => (toast.id === action.payload ? { ...toast, visible: false } : toast));

    case 'DISMISS_ALL':
      return state.map((toast) => ({ ...toast, visible: false }));

    case 'PAUSE':
      return state.map((toast) => (toast.id === action.payload ? { ...toast, paused: true } : toast));

    case 'RESUME':
      return state.map((toast) => (toast.id === action.payload ? { ...toast, paused: false } : toast));

    case 'REMOVE':
      return state.filter((toast) => toast.id !== action.payload);

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context Types
// ---------------------------------------------------------------------------

/** Shape of the value provided by ToastProvider via React context. */
export interface ToastContextValue {
  /** Current array of all toasts */
  toasts: ToastState[];
  /** Resolved configuration with defaults applied */
  config: Required<ToastProviderConfig>;
  /** Dispatch function for state updates */
  dispatch: React.Dispatch<ToastDispatchAction>;
  /** Toast methods for showing/dismissing */
  methods: ToastMethods;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider Props
// ---------------------------------------------------------------------------
export interface ToastProviderProps extends Partial<ToastProviderConfig> {
  /** Child components that can access toast context */
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Toast Provider Component
// ---------------------------------------------------------------------------

/**
 * Manages the toast stack via reducer and exposes imperative methods through context.
 * Also registers methods globally so the standalone `toast()` helper works outside React.
 */
export function ToastProvider({
  children,
  position = TOAST_DEFAULTS.position,
  duration = TOAST_DEFAULTS.duration,
  max = TOAST_CONTAINER_DEFAULTS.max,
  gap = TOAST_CONTAINER_DEFAULTS.gap,
  pauseOnHover = TOAST_DEFAULTS.pauseOnHover,
  reverseOrder = TOAST_CONTAINER_DEFAULTS.reverseOrder,
}: ToastProviderProps): React.ReactElement {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  // Preserve the legacy no-op hook; CSS arrives through the public stylesheet.
  useEffect(() => {
    injectToastStyles();
  }, []);

  // Memoized config with all defaults applied
  const config = useMemo<Required<ToastProviderConfig>>(
    () => ({
      position,
      duration,
      max,
      gap,
      pauseOnHover,
      reverseOrder,
    }),
    [position, duration, max, gap, pauseOnHover, reverseOrder]
  );

  // -- Imperative methods exposed via context ----------------------------

  /** Enqueue a new toast and return its generated ID. */
  const show = useCallback(
    (options: ToastOptions): string => {
      const id = options.id || generateToastId();
      const toastState: ToastState = {
        id,
        visible: true,
        createdAt: Date.now(),
        paused: false,
        options: {
          ...options,
          id,
          duration: options.duration ?? duration,
        },
      };

      dispatch({ type: 'ADD', payload: toastState });
      return id;
    },
    [duration]
  );

  /** Shorthand: success variant. */
  const success = useCallback(
    (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>): string => {
      return show({
        ...options,
        title,
        description,
        variant: 'success',
      });
    },
    [show]
  );

  /** Shorthand: error variant. */
  const error = useCallback(
    (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>): string => {
      return show({
        ...options,
        title,
        description,
        variant: 'error',
      });
    },
    [show]
  );

  /** Shorthand: warning variant. */
  const warning = useCallback(
    (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>): string => {
      return show({
        ...options,
        title,
        description,
        variant: 'warning',
      });
    },
    [show]
  );

  /** Shorthand: info variant. */
  const info = useCallback(
    (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>): string => {
      return show({
        ...options,
        title,
        description,
        variant: 'info',
      });
    },
    [show]
  );

  /** Mark a toast as not-visible (triggers exit animation). */
  const dismiss = useCallback((id: string): void => {
    dispatch({ type: 'DISMISS', payload: id });
  }, []);

  /** Dismiss every toast in the stack. */
  const dismissAll = useCallback((): void => {
    dispatch({ type: 'DISMISS_ALL' });
  }, []);

  /** Merge new options into an existing toast (e.g. update progress). */
  const update = useCallback((id: string, options: Partial<ToastOptions>): void => {
    dispatch({ type: 'UPDATE', payload: { id, options } });
  }, []);

  // Bundle methods into a stable object for context consumers
  const methods = useMemo<ToastMethods>(
    () => ({
      show,
      success,
      error,
      warning,
      info,
      dismiss,
      dismissAll,
      update,
    }),
    [show, success, error, warning, info, dismiss, dismissAll, update]
  );

  // Register methods globally so the standalone `toast()` helper works
  // outside of React component trees.
  useEffect(() => {
    setToastMethods(methods);
    return () => {
      clearToastMethods();
    };
  }, [methods]);
  const contextValue = useMemo<ToastContextValue>(
    () => ({
      toasts,
      config,
      dispatch,
      methods,
    }),
    [toasts, config, methods]
  );

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
}

ToastProvider.displayName = 'ToastProvider';

// ---------------------------------------------------------------------------
// Context Hook
// ---------------------------------------------------------------------------

/** @internal Throws if called outside a ToastProvider tree. */
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
