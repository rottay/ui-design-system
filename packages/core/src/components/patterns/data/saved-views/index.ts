'use client';

/**
 * @fileoverview SavedViewsBar pattern -- engine-aware tab bar for saving,
 * switching, and managing custom data views (Airtable/Linear style).
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { SavedViewsBarProps } from './SavedViews.types';

export type { SavedViewsBarProps, SavedView, SavedViewConfig, ViewMenuAction } from './SavedViews.types';

export const PatternSavedViewsBar = createEngineComponent<SavedViewsBarProps>(
  'PatternSavedViewsBar',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
