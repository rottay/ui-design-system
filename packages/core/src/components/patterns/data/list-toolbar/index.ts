'use client';

/**
 * @fileoverview ListToolbar pattern -- engine-aware two-row toolbar for data
 * tables with search, filter pills, density control, view mode toggle, and
 * settings dropdown.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ListToolbarProps } from './contracts';

export type { ListToolbarProps, FilterPillConfig, DensityKey, ViewMode } from './contracts';

export const PatternListToolbar = createEngineComponent<ListToolbarProps>(
  'PatternListToolbar',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    // Rustic is frozen and ships no implementation for this pattern; the
    // declared absence refuses by name at resolution, with no module loaded.
    rustic: null,
  }
);

/** Convenience alias without the Pattern prefix. */
export const ListToolbar = PatternListToolbar;
