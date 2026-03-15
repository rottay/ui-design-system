'use client';

/**
 * FilterPanel - Pattern Component
 *
 * Configurable filter panel with support for multiple filter types,
 * layouts (inline, stacked, sidebar), and collapsible sections.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { FilterPanelProps } from './FilterPanel.types';

export type { FilterPanelProps } from './FilterPanel.types';
export type { FilterDef } from '../types';

export const PatternFilterPanel = createEngineComponent<FilterPanelProps>(
  'PatternFilterPanel',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
