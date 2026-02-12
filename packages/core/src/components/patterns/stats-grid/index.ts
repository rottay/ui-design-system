'use client';

/**
 * StatsGrid - Pattern Component
 *
 * Engine-aware stats grid with sparklines, animated values,
 * variant styles, and custom stat rendering.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { StatsGridProps } from './types';

export type { StatsGridProps } from './types';

export const PatternStatsGrid = createEngineComponent<StatsGridProps>(
  'PatternStatsGrid',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
