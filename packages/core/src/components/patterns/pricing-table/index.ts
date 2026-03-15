'use client';

/**
 * PricingTable - Pattern Component
 *
 * Engine-aware plan comparison grid with feature rows and highlighted plans.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { PricingTableProps } from './types';

export type { PricingTableProps, PricingPlan, PricingFeature } from './types';

export const PatternPricingTable = createEngineComponent<PricingTableProps>(
  'PatternPricingTable',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
