'use client';

/**
 * SavedViewsBar - Pattern Component
 *
 * Tab bar for saving, switching, and managing custom data views.
 * Inspired by Airtable/Linear view management patterns.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { SavedViewsBarProps } from './types';

export type { SavedViewsBarProps, SavedView, SavedViewConfig, ViewMenuAction } from './types';

export const PatternSavedViewsBar = createEngineComponent<SavedViewsBarProps>(
  'PatternSavedViewsBar',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
