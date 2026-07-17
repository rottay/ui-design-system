'use client';

/**
 * @fileoverview ShiftMatrix pattern -- engine-aware role x time x event grid
 * showing coverage gaps and availability overlay with quick-assign interaction.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ShiftMatrixProps } from './contracts';

export type {
  ShiftMatrixProps,
  ShiftTimeSlot,
  ShiftAssignment,
} from './contracts';

/**
 * @engine classic-only
 * @category domain-kit (staffing)
 * This pattern is domain-specific and ships only with the classic engine.
 * Modern engine parity is not planned. Consider moving to components/kits/
 * when the kit infrastructure is established.
 */
export const PatternShiftMatrix = createEngineComponent<ShiftMatrixProps>(
  'PatternShiftMatrix',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/classic'),
    rustic: () => import('./engines/classic'),
  }
);
