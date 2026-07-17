'use client';

/**
 * @fileoverview Internal engine-aware Input export.
 *
 * Compound helpers such as `Input.Password` need to render the root input
 * without importing the public `Input` object itself, otherwise library builds
 * with `preserveModules` create circular chunks. This file keeps the base
 * engine component isolated from the public compound wrapper.
 */

import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import type { InputProps } from '../contracts';

export const BaseInput = createEngineComponent<InputProps>('Input', {
  classic: () => import('./classic'),
  modern: () => import('./modern'),
  rustic: () => import('./rustic'),
});
