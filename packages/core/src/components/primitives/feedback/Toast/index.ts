/**
 * Toast - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ToastProps } from './types';

export {
  type ToastProps,
  type ToastVariant,
  type ToastPosition,
  type ToastProviderProps,
  type UseToastReturn,
  TOAST_DEFAULTS,
} from './types';

export { BaseToast } from './base';

export const Toast = createEngineComponent<ToastProps>('Toast', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
