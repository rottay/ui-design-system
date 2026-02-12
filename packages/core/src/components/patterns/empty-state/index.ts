'use client';

/**
 * EmptyState - Pattern Component
 *
 * Engine-aware empty state component for displaying placeholder content.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { EmptyStateProps } from './types';

export type { EmptyStateProps } from './types';

export const PatternEmptyState = createEngineComponent<EmptyStateProps>(
  'PatternEmptyState',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
