'use client';

/**
 * @fileoverview SavedViewsBar pattern -- engine-aware tab bar for saving,
 * switching, and managing custom data views (Airtable/Linear style).
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { SavedViewsBarProps } from './contracts';

export type { SavedViewsBarProps, SavedView, SavedViewConfig, ViewMenuAction } from './contracts';

export const PatternSavedViewsBar = createEngineComponent<SavedViewsBarProps>(
  'PatternSavedViewsBar',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
