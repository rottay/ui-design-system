'use client';

/**
 * EmptyState - Pattern Component
 *
 * Engine-aware empty state component for displaying placeholder content.
 */

import { createEngineComponent } from '../../../engines/factory';
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
