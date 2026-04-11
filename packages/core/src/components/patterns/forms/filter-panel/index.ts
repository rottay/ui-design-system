'use client';

/**
 * @fileoverview FilterPanel pattern -- engine-aware configurable filter UI
 * with multiple filter types, layout modes, and collapsible sections.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { FilterPanelProps } from './FilterPanel.types';

export type { FilterPanelProps } from './FilterPanel.types';
export type { FilterDef } from '../../foundation/types';

export const PatternFilterPanel = createEngineComponent<FilterPanelProps>(
  'PatternFilterPanel',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
