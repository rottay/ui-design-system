'use client';

/**
 * @fileoverview Internal engine-aware Toast export.
 *
 * `Toast.Container` renders individual toasts from inside the same primitive
 * package. Splitting the base engine component from the public `Toast` wrapper
 * avoids circular preserveModules chunks during library builds.
 */

import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import type { ToastProps } from '../contracts';

export const BaseToast = createEngineComponent<ToastProps>('Toast', {
  classic: () => import('./classic'),
  modern: () => import('./modern'),
  rustic: () => import('./rustic'),
});
