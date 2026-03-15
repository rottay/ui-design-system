/**
 * @fileoverview Toast Provider Component - Rottay Design System
 * @description React context provider for managing toast stack state.
 * Provides toast methods to all descendant components via context.
 *
 * @remarks
 * The ToastProvider is the core state management component for the toast system.
 * It uses a reducer pattern for predictable state updates and provides:
 * - Toast stack state management
 * - Configuration for default toast behavior
 * - Methods for showing, dismissing, and updating toasts
 * - Automatic injection of animation styles
 *
 * @example Basic Setup
 * ```tsx
 * import { ToastProvider, Toast, useToast } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <MyApp />
 *       <Toast.Container />
 *     </ToastProvider>
 *   );
 * }
 * ```
 *
 * @example With Configuration
 * ```tsx
 * <ToastProvider
 *   position="bottom-center"
 *   duration={3000}
 *   max={3}
 *   gap={12}
 *   pauseOnHover={true}
 * >
 *   <App />
 *   <Toast.Container />
 * </ToastProvider>
 * ```
 *
 * @see {@link useToast} for accessing toast methods in components
 * @see {@link Toast.Container} for rendering the toast stack
 *
 * @module Toast/Provider
 * @category Feedback
 * @package @rottay/design-system
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
} from '../Toast.types';
import { TOAST_DEFAULTS, TOAST_CONTAINER_DEFAULTS } from '../Toast.types';
import { injectToastStyles } from './animations';
import { clearToastMethods, setToastMethods } from './useToast';

// ============================================================================
// ID Generation
// ============================================================================

/** Counter for generating unique toast IDs */
let toastIdCounter = 0;

/**
 * Generates a unique ID for a toast.
 *
 * @returns Unique toast ID string
 *
 * @internal
 */
function generateToastId(): string {
  return `toast-${++toastIdCounter}-${Date.now()}`;
}

// ============================================================================
// Action Types
// ============================================================================

/**
 * Dispatch action types for the toast reducer.
 *
 * @description
 * Defines all possible actions that can modify toast state:
 * - ADD: Add a new toast to the stack
 * - UPDATE: Update an existing toast's options
 * - DISMISS: Mark a toast as not visible (triggers exit animation)
 * - DISMISS_ALL: Dismiss all toasts
 * - PAUSE: Pause auto-dismiss for a toast
 * - RESUME: Resume auto-dismiss for a toast
 * - REMOVE: Remove a toast from the stack entirely
 */
export type ToastDispatchAction =
  | { type: 'ADD'; payload: ToastState }
  | { type: 'UPDATE'; payload: { id: string; options: Partial<ToastOptions> } }
  | { type: 'DISMISS'; payload: string }
  | { type: 'DISMISS_ALL' }
  | { type: 'PAUSE'; payload: string }
  | { type: 'RESUME'; payload: string }
  | { type: 'REMOVE'; payload: string };

// ============================================================================
// Reducer
// ============================================================================

/**
 * Toast state reducer.
 *
 * @description
 * Pure function that handles all toast state transitions.
 * Each action type maps to a specific state transformation.
 *
 * @param state - Current toast state array
 * @param action - Dispatch action to apply
 * @returns New toast state array
 *
 * @internal
 */
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

// ============================================================================
// Context Types
// ============================================================================

/**
 * Toast context value interface.
 *
 * @description
 * The shape of the value provided by ToastProvider via context.
 */
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

/** Toast context with null initial value */
const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

/**
 * Props for the ToastProvider component.
 *
 * @description
 * Extends ToastProviderConfig with children prop.
 * All configuration props are optional with sensible defaults.
 */
export interface ToastProviderProps extends Partial<ToastProviderConfig> {
  /** Child components that can access toast context */
  children: ReactNode;
}

// ============================================================================
// Toast Provider Component
// ============================================================================

/**
 * ToastProvider - Context provider for toast state management.
 *
 * @description
 * Manages the toast stack state and provides methods for showing,
 * dismissing, and updating toasts. Must wrap any components that
 * need access to the toast system.
 *
 * @remarks
 * Features:
 * - Configurable default position and duration
 * - Maximum toast limit
 * - Pause on hover support
 * - Automatic animation style injection
 * - Optimized re-renders with useMemo
 *
 * @param props - {@link ToastProviderProps}
 * @returns Provider component with toast context
 *
 * @example
 * ```tsx
 * <ToastProvider
 *   position="top-right"
 *   duration={5000}
 *   max={5}
 *   pauseOnHover={true}
 * >
 *   <App />
 *   <Toast.Container />
 * </ToastProvider>
 * ```
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

  // ========================================================================
  // Animation Styles Injection
  // ========================================================================

  /**
   * Effect to inject CSS animation keyframes on mount.
   */
  useEffect(() => {
    injectToastStyles();
  }, []);

  // ========================================================================
  // Configuration Memoization
  // ========================================================================

  /**
   * Memoized configuration object with all defaults applied.
   */
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

  // ========================================================================
  // Toast Methods
  // ========================================================================

  /**
   * Shows a new toast with the provided options.
   * @param options - Toast configuration options
   * @returns The generated toast ID
   */
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

  /**
   * Shows a success toast.
   * @param title - Toast title
   * @param description - Optional description
   * @param options - Additional options
   * @returns The generated toast ID
   */
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

  /**
   * Shows an error toast.
   * @param title - Toast title
   * @param description - Optional description
   * @param options - Additional options
   * @returns The generated toast ID
   */
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

  /**
   * Shows a warning toast.
   * @param title - Toast title
   * @param description - Optional description
   * @param options - Additional options
   * @returns The generated toast ID
   */
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

  /**
   * Shows an info toast.
   * @param title - Toast title
   * @param description - Optional description
   * @param options - Additional options
   * @returns The generated toast ID
   */
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

  /**
   * Dismisses a toast by ID (triggers exit animation).
   * @param id - Toast ID to dismiss
   */
  const dismiss = useCallback((id: string): void => {
    dispatch({ type: 'DISMISS', payload: id });
  }, []);

  /**
   * Dismisses all toasts.
   */
  const dismissAll = useCallback((): void => {
    dispatch({ type: 'DISMISS_ALL' });
  }, []);

  /**
   * Updates an existing toast's options.
   * @param id - Toast ID to update
   * @param options - New options to merge
   */
  const update = useCallback(
    (id: string, options: Partial<ToastOptions>): void => {
      dispatch({ type: 'UPDATE', payload: { id, options } });
    },
    []
  );

  // ========================================================================
  // Methods Memoization
  // ========================================================================

  /**
   * Memoized methods object for stable reference.
   */
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

  useEffect(() => {
    setToastMethods(methods);

    return () => {
      clearToastMethods();
    };
  }, [methods]);

  // ========================================================================
  // Context Value Memoization
  // ========================================================================

  /**
   * Memoized context value for stable reference.
   */
  const contextValue = useMemo<ToastContextValue>(
    () => ({
      toasts,
      config,
      dispatch,
      methods,
    }),
    [toasts, config, methods]
  );

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

ToastProvider.displayName = 'ToastProvider';

// ============================================================================
// Context Hook
// ============================================================================

/**
 * Hook to access toast context.
 *
 * @description
 * Internal hook for accessing the toast context. Throws an error
 * if used outside of a ToastProvider.
 *
 * @returns Toast context value
 * @throws Error if used outside ToastProvider
 *
 * @internal
 */
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
