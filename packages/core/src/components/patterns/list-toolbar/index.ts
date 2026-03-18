'use client';

/**
 * @fileoverview ListToolbar pattern -- engine-aware two-row toolbar for data
 * tables with search, filter pills, density control, view mode toggle, and
 * settings dropdown.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { ListToolbarProps } from './ListToolbar.types';

export type { ListToolbarProps, FilterPillConfig, DensityKey, ViewMode } from './ListToolbar.types';

export const PatternListToolbar = createEngineComponent<ListToolbarProps>(
  'PatternListToolbar',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);

/** Convenience alias without the Pattern prefix. */
export const ListToolbar = PatternListToolbar;
