'use client';

/**
 * @fileoverview LocaleSwitcher pattern -- engine-aware language switcher
 * dropdown with flag and label display options.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { LocaleSwitcherProps } from './LocaleSwitcher.types';

export type { LocaleSwitcherProps, LocaleDef } from './LocaleSwitcher.types';
export { DEFAULT_LOCALES } from './LocaleSwitcher.types';

export const PatternLocaleSwitcher = createEngineComponent<LocaleSwitcherProps>(
  'PatternLocaleSwitcher',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
