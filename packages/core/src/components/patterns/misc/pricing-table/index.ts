'use client';

/**
 * @fileoverview PricingTable pattern - Rottay Design System
 * @description Engine-aware plan comparison grid with feature rows, highlighted
 * tiers, and CTA-ready plan cards.
 *
 * @remarks
 * This pattern packages the recurring SaaS pricing-table layout so apps can
 * swap engines or tenant theming without rewriting the comparison structure.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { PricingTableProps } from './PricingTable.types';

export type { PricingTableProps, PricingPlan, PricingFeature } from './PricingTable.types';

/** Public pricing table entry point resolved through the engine factory. */
export const PatternPricingTable = createEngineComponent<PricingTableProps>(
  'PatternPricingTable',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
