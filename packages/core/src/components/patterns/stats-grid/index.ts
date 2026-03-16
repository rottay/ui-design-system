'use client';

/**
 * @fileoverview StatsGrid pattern - Rottay Design System
 * @description Engine-aware metrics grid with optional sparklines, animated
 * values, and per-stat rendering controls.
 *
 * @remarks
 * The pattern packages a common dashboard composition: repeated statistics
 * cards that should still respect tenant personality and motion rules.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { StatsGridProps } from './StatsGrid.types';

export type { StatsGridProps } from './StatsGrid.types';

/** Public stats grid entry point resolved through the current engine. */
export const PatternStatsGrid = createEngineComponent<StatsGridProps>(
  'PatternStatsGrid',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
