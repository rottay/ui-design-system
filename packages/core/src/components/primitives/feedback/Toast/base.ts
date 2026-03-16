'use client';

/**
 * @fileoverview Internal engine-aware Toast export.
 *
 * `Toast.Container` renders individual toasts from inside the same primitive
 * package. Splitting the base engine component from the public `Toast` wrapper
 * avoids circular preserveModules chunks during library builds.
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { ToastProps } from './Toast.types';

export const BaseToast = createEngineComponent<ToastProps>('Toast', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
