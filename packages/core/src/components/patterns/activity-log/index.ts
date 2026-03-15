'use client';

/**
 * ActivityLog - Pattern Component
 *
 * Engine-aware activity timeline with filtering for entity-level action history.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { ActivityLogProps } from './types';

export type { ActivityLogProps, Activity, ActivityFilter } from './types';

export const PatternActivityLog = createEngineComponent<ActivityLogProps>(
  'PatternActivityLog',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
