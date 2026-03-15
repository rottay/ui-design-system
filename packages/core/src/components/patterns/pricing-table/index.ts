'use client';

/**
 * PricingTable - Pattern Component
 *
 * Engine-aware plan comparison grid with feature rows and highlighted plans.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { PricingTableProps } from './PricingTable.types';

export type { PricingTableProps, PricingPlan, PricingFeature } from './PricingTable.types';

export const PatternPricingTable = createEngineComponent<PricingTableProps>(
  'PatternPricingTable',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
