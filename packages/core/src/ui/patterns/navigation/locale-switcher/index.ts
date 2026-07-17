'use client';

/**
 * @fileoverview LocaleSwitcher pattern -- engine-aware language switcher
 * dropdown with flag and label display options.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { LocaleSwitcherProps } from './contracts';

export type { LocaleSwitcherProps, LocaleDef } from './contracts';
export { DEFAULT_LOCALES } from './runtime/default-locales';

export const PatternLocaleSwitcher = createEngineComponent<LocaleSwitcherProps>(
  'PatternLocaleSwitcher',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
