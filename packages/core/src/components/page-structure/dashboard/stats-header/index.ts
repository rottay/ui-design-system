'use client';

/**
 * @fileoverview StatsHeader — page-structure-tier stat-card strip.
 * @description Engine-aware operational stat cards with counter
 * animations, sparkline dots, contextual insights, and gradient glow
 * accents.
 *
 * @remarks
 * StatsHeader renders 3-5 metric cards in a responsive horizontal row
 * and is meant to sit as page chrome above a data table or dashboard
 * section. Each card supports animated counters, change indicators,
 * sparkline dots, progress bars, and contextual insight lines. Lives in
 * `components/page-structure/` alongside the other header and toolbar families.
 *
 * The implementation is engine-agnostic because it composes DS
 * primitives (Box, Flex, Text) which themselves resolve through the
 * engine system.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { StatsHeaderProps } from './types';

export type { StatsHeaderProps, StatItem, AccentColor } from './types';

/** Public StatsHeader entry point resolved through the current engine. */
export const StatsHeader = createEngineComponent<StatsHeaderProps>(
  'StatsHeader',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
