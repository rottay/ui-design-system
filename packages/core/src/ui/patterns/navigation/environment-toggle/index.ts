'use client';

/**
 * @fileoverview EnvironmentToggle pattern -- engine-aware environment switcher
 * (test/live toggle) with persistent banners and production switch warnings.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { EnvironmentToggleProps } from './contracts';

export type { EnvironmentToggleProps, EnvironmentDef } from './contracts';

export const PatternEnvironmentToggle = createEngineComponent<EnvironmentToggleProps>(
  'PatternEnvironmentToggle',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
