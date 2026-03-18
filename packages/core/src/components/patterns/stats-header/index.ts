'use client';

/**
 * @fileoverview StatsHeader pattern - Rottay Design System
 * @description Engine-aware operational stat cards with counter animations,
 * sparkline dots, contextual insights, and gradient glow accents.
 *
 * @remarks
 * StatsHeader renders 3-5 premium metric cards in a responsive horizontal
 * row. Ideal for operational dashboards above data tables. Each card
 * supports animated counters, change indicators, sparkline dots,
 * progress bars, and contextual insight lines.
 *
 * The implementation is engine-agnostic because it composes DS primitives
 * (Box, Flex, Text) which themselves resolve through the engine system.
 */

import { createEngineComponent } from '../../../engines/factory';
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
