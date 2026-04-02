'use client';

/**
 * @fileoverview ShiftMatrix pattern -- engine-aware role x time x event grid
 * showing coverage gaps and availability overlay with quick-assign interaction.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { ShiftMatrixProps } from './ShiftMatrix.types';

export type {
  ShiftMatrixProps,
  ShiftTimeSlot,
  ShiftAssignment,
} from './ShiftMatrix.types';

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
