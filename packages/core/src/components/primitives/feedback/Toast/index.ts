/**
 * Toast - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ToastProps } from './types';
import { ToastContainer } from './compound';

// Export types
export type {
  ToastProps,
  ToastVariant,
  ToastPosition,
  ToastAction,
  ToastProviderConfig,
  ToastOptions,
  ToastMethods,
  ToastState,
} from './types';

export {
  TOAST_DEFAULTS,
  TOAST_CONTAINER_DEFAULTS,
  TOAST_ANIMATION,
  POSITION_MAP,
  VARIANT_COLORS,
} from './types';

// Export compound components
export { ToastContainer } from './compound';
export type { ToastContainerProps } from './compound';

// Export base component
export { BaseToast } from './base';

// Export utilities
export {
  ToastProvider,
  useToast,
  toast,
  injectToastStyles,
  TOAST_KEYFRAMES,
} from './utils';

export type { ToastProviderProps, UseToastReturn } from './utils';

// Create engine-aware Toast component
const ToastComponent = createEngineComponent<ToastProps>('Toast', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

// Extend Toast with compound components
export const Toast = Object.assign(ToastComponent, {
  Container: ToastContainer,
});
