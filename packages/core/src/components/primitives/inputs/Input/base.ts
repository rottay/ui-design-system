'use client';

/**
 * @fileoverview Internal engine-aware Input export.
 *
 * Compound helpers such as `Input.Password` need to render the root input
 * without importing the public `Input` object itself, otherwise library builds
 * with `preserveModules` create circular chunks. This file keeps the base
 * engine component isolated from the public compound wrapper.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { InputProps } from './Input.types';

export const BaseInput = createEngineComponent<InputProps>('Input', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
