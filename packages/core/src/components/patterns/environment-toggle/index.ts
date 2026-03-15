'use client';

/**
 * EnvironmentToggle - Pattern Component
 *
 * Engine-aware environment switcher (test/live toggle) with persistent banners
 * and production switch warnings. Follows the Stripe pattern.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { EnvironmentToggleProps } from './types';

export type { EnvironmentToggleProps, EnvironmentDef } from './types';

export const PatternEnvironmentToggle = createEngineComponent<EnvironmentToggleProps>(
  'PatternEnvironmentToggle',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
