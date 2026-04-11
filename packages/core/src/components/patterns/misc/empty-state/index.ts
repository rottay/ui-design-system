'use client';

/**
 * @fileoverview EmptyState pattern -- engine-aware placeholder component
 * for empty lists, pages, or search results with icon, actions, and sizing.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { EmptyStateProps } from './EmptyState.types';

export type { EmptyStateProps } from './EmptyState.types';

export const PatternEmptyState = createEngineComponent<EmptyStateProps>(
  'PatternEmptyState',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
