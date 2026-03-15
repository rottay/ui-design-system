'use client';

/**
 * ActivityLog - Pattern Component
 *
 * Engine-aware activity timeline with filtering for entity-level action history.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { ActivityLogProps } from './ActivityLog.types';

export type { ActivityLogProps, Activity, ActivityFilter } from './ActivityLog.types';

export const PatternActivityLog = createEngineComponent<ActivityLogProps>(
  'PatternActivityLog',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
