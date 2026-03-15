/**
 * @fileoverview Toast Utilities - Rottay Design System
 * @description Exports utility functions, hooks, and providers for the Toast system.
 *
 * @remarks
 * This module provides the complete Toast state management solution:
 * - **ToastProvider**: React context provider for toast state
 * - **useToast**: Hook for triggering toasts from components
 * - **toast**: Standalone object for triggering toasts outside React
 * - **Animations**: CSS keyframes and animation utilities
 *
 * @example Complete Toast Setup
 * ```tsx
 * import {
 *   ToastProvider,
 *   useToast,
 *   toast,
 *   Toast,
 * } from '@rottay/design-system';
 *
 * // 1. Wrap your app with ToastProvider
 * function App() {
 *   return (
 *     <ToastProvider position="top-right" duration={5000}>
 *       <MyApp />
 *       <Toast.Container />
 *     </ToastProvider>
 *   );
 * }
 *
 * // 2. Use the hook in components
 * function MyComponent() {
 *   const { success, error } = useToast();
 *   return <button onClick={() => success('Done!')}>Save</button>;
 * }
 *
 * // 3. Use standalone toast outside React
 * async function apiCall() {
 *   try {
 *     await fetch('/api/data');
 *     toast.success('Data fetched!');
 *   } catch {
 *     toast.error('Failed to fetch');
 *   }
 * }
 * ```
 *
 * @module Toast/Utils
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Provider Exports
// ============================================================================

/**
 * ToastProvider - Context provider for toast state management.
 * @see {@link ToastProviderProps} for configuration options
 */
export { ToastProvider, useToastContext } from './ToastProvider';

/**
 * Type definitions for the ToastProvider.
 */
export type {
  ToastProviderProps,
  ToastContextValue,
  ToastDispatchAction,
} from './ToastProvider';

// ============================================================================
// Hook Exports
// ============================================================================

/**
 * useToast - Hook for triggering and managing toasts.
 * @see {@link UseToastReturn} for available methods
 */
export { useToast, toast, setToastMethods, clearToastMethods, getToastMethods } from './useToast';

/**
 * Type definitions for the useToast hook.
 */
export type { UseToastReturn } from './useToast';

// ============================================================================
// Animation Exports
// ============================================================================

/**
 * Animation utilities for toast enter/exit transitions.
 * @see {@link TOAST_KEYFRAMES} for CSS keyframe definitions
 */
export {
  getAnimationName,
  getToastAnimationStyle,
  injectToastStyles,
  TOAST_KEYFRAMES,
} from './animations';
