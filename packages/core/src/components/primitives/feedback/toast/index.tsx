'use client';

/** Public Toast facade: engine routing, runtime API, and compound renderers. */
import type { ToastProps } from './contracts';
import { BaseToast } from './engines';
import { ToastContainer, UndoToast, AnimatedCheck } from './compound';

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
} from './contracts';

export {
  TOAST_DEFAULTS,
  TOAST_CONTAINER_DEFAULTS,
  TOAST_ANIMATION,
  POSITION_MAP,
  VARIANT_COLORS,
} from './contracts';

export { ToastContainer, UndoToast, AnimatedCheck } from './compound';
export type { ToastContainerProps, UndoToastProps, AnimatedCheckProps } from './compound';

export {
  ToastProvider,
  useToast,
  toast,
  injectToastStyles,
  TOAST_KEYFRAMES,
} from './runtime';

export type { ToastProviderProps, UseToastReturn } from './runtime';

const ToastComponent = BaseToast;

/** Engine-aware toast with its stack, undo, and completion compounds attached. */
export const Toast = Object.assign(ToastComponent, {
  Container: ToastContainer,
  Undo: UndoToast,
  Check: AnimatedCheck,
});
