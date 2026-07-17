'use client';

/**
 * @fileoverview FilterPanel pattern -- engine-aware configurable filter UI
 * with multiple filter types, layout modes, and collapsible sections.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { FilterPanelProps } from './contracts';

export type { FilterPanelProps } from './contracts';
export type { FilterDef } from '../../../../foundation/contracts/runtime/components/patterns/core';

export const PatternFilterPanel = createEngineComponent<FilterPanelProps>(
  'PatternFilterPanel',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
