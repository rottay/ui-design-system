/**
 * Toast - Provider Component
 * Manages toast stack state and provides context
 */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import type {
  ToastState,
  ToastOptions,
  ToastMethods,
  ToastProviderConfig,
} from '../types';
import { TOAST_DEFAULTS, TOAST_CONTAINER_DEFAULTS } from '../types';
import { injectToastStyles } from './animations';

// Generate unique ID
let toastIdCounter = 0;
function generateToastId(): string {
  return `toast-${++toastIdCounter}-${Date.now()}`;
}

// Action types
export type ToastDispatchAction =
  | { type: 'ADD'; payload: ToastState }
  | { type: 'UPDATE'; payload: { id: string; options: Partial<ToastOptions> } }
  | { type: 'DISMISS'; payload: string }
  | { type: 'DISMISS_ALL' }
  | { type: 'PAUSE'; payload: string }
  | { type: 'RESUME'; payload: string }
  | { type: 'REMOVE'; payload: string };

// Reducer
function toastReducer(state: ToastState[], action: ToastDispatchAction): ToastState[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];

    case 'UPDATE':
      return state.map((toast) =>
        toast.id === action.payload.id
          ? { ...toast, options: { ...toast.options, ...action.payload.options } }
          : toast
      );

    case 'DISMISS':
      return state.map((toast) =>
        toast.id === action.payload ? { ...toast, visible: false } : toast
      );

    case 'DISMISS_ALL':
      return state.map((toast) => ({ ...toast, visible: false }));

    case 'PAUSE':
      return state.map((toast) =>
        toast.id === action.payload ? { ...toast, paused: true } : toast
      );

    case 'RESUME':
      return state.map((toast) =>
        toast.id === action.payload ? { ...toast, paused: false } : toast
      );

    case 'REMOVE':
      return state.filter((toast) => toast.id !== action.payload);

    default:
      return state;
  }
}

// Context
export interface ToastContextValue {
  toasts: ToastState[];
  config: Required<ToastProviderConfig>;
  dispatch: React.Dispatch<ToastDispatchAction>;
  methods: ToastMethods;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Provider Props
export interface ToastProviderProps extends Partial<ToastProviderConfig> {
  children: ReactNode;
}

/**
 * Toast Provider - Manages toast stack and provides context
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

  // Inject animation styles
  useEffect(() => {
    injectToastStyles();
  }, []);

  // Config object
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

  // Toast methods
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

  const success = useCallback(
    (
      title: ReactNode,
      description?: ReactNode,
      options?: Partial<ToastOptions>
    ): string => {
      return show({
        ...options,
        title,
        description,
        variant: 'success',
      });
    },
    [show]
  );

  const error = useCallback(
    (
      title: ReactNode,
      description?: ReactNode,
      options?: Partial<ToastOptions>
    ): string => {
      return show({
        ...options,
        title,
        description,
        variant: 'error',
      });
    },
    [show]
  );

  const warning = useCallback(
    (
      title: ReactNode,
      description?: ReactNode,
      options?: Partial<ToastOptions>
    ): string => {
      return show({
        ...options,
        title,
        description,
        variant: 'warning',
      });
    },
    [show]
  );

  const info = useCallback(
    (
      title: ReactNode,
      description?: ReactNode,
      options?: Partial<ToastOptions>
    ): string => {
      return show({
        ...options,
        title,
        description,
        variant: 'info',
      });
    },
    [show]
  );

  const dismiss = useCallback((id: string): void => {
    dispatch({ type: 'DISMISS', payload: id });
  }, []);

  const dismissAll = useCallback((): void => {
    dispatch({ type: 'DISMISS_ALL' });
  }, []);

  const update = useCallback(
    (id: string, options: Partial<ToastOptions>): void => {
      dispatch({ type: 'UPDATE', payload: { id, options } });
    },
    []
  );

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

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      toasts,
      config,
      dispatch,
      methods,
    }),
    [toasts, config, methods]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

ToastProvider.displayName = 'ToastProvider';

/**
 * Hook to access toast context
 * @internal
 */
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
