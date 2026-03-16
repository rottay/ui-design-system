'use client';

/**
 * @fileoverview EnvironmentToggle pattern -- engine-aware environment switcher
 * (test/live toggle) with persistent banners and production switch warnings.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { EnvironmentToggleProps } from './EnvironmentToggle.types';

export type { EnvironmentToggleProps, EnvironmentDef } from './EnvironmentToggle.types';

export const PatternEnvironmentToggle = createEngineComponent<EnvironmentToggleProps>(
  'PatternEnvironmentToggle',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
