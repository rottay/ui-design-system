'use client';

/**
 * @fileoverview Toast - brief, auto-dismissing notification with provider/hook pattern.
 * Includes ToastProvider (state), useToast hook (imperative API), and Toast.Container
 * (render target). Supports variants, actions, pause-on-hover, and positioning.
 * Uses BaseToast internally (not createEngineComponent) with engine-specific styles.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 *   <Toast.Container position="top-right" />
 * </ToastProvider>
 *
 * // Inside any descendant:
 * const { success, error } = useToast();
 * success('Saved!', 'Your changes have been applied.');
 * ```
 *
 * @module Toast
 * @category Feedback
 */

import type { ToastProps } from './Toast.types';
import { BaseToast } from './base';
import { ToastContainer, UndoToast } from './compound';

export type {
  ToastProps,
  ToastVariant,
  ToastPosition,
  ToastCountdownVariant,
  ToastAction,
  ToastProviderConfig,
  ToastOptions,
  ToastMethods,
  ToastState,
} from './Toast.types';

export {
  TOAST_DEFAULTS,
  TOAST_CONTAINER_DEFAULTS,
  TOAST_ANIMATION,
  POSITION_MAP,
  VARIANT_COLORS,
} from './Toast.types';

export { ToastContainer, UndoToast } from './compound';
export type { ToastContainerProps, UndoToastProps } from './compound';

export {
  ToastProvider,
  useToast,
  toast,
  injectToastStyles,
  TOAST_KEYFRAMES,
} from './utils';

export type { ToastProviderProps, UseToastReturn } from './utils';

// BaseToast is already engine-aware internally; alias for clarity.
const ToastComponent = BaseToast;

/**
 * Toast component with Container compound sub-component.
 * Auto-dismiss, pause-on-hover, progress bar, action buttons, ARIA-compliant.
 */
export const Toast = Object.assign(ToastComponent, {
  // Attach the stack renderer -- consumers place <Toast.Container /> once in the tree.
  /** Positioned container that renders and animates the toast stack. */
  Container: ToastContainer,
  /** Undo-window recipe: countdown affordance + Undo action, reduced-motion safe. */
  Undo: UndoToast,
});
