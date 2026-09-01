'use client';

/**
 * @fileoverview EmptyState pattern -- engine-aware placeholder component
 * for empty lists, pages, or search results with icon, actions, and sizing.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { EmptyStateProps } from './contracts';

export type { EmptyStateProps } from './contracts';

export const PatternEmptyState = createEngineComponent<EmptyStateProps>(
  'PatternEmptyState',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
