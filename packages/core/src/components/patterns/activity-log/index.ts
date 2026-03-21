'use client';

/**
 * @fileoverview ActivityLog pattern -- engine-aware activity timeline with
 * filtering for entity-level action history. Displays a chronological list
 * of user actions with diff rendering, avatar, and action-type filtering.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { ActivityLogProps } from './ActivityLog.types';

export type { ActivityLogProps, Activity, ActivityFilter } from './ActivityLog.types';

/** Engine-resolved ActivityLog pattern component. */
export const PatternActivityLog = createEngineComponent<ActivityLogProps>(
  'PatternActivityLog',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
