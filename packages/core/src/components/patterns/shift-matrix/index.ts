'use client';

/**
 * @fileoverview ShiftMatrix pattern -- engine-aware role x time x event grid
 * showing coverage gaps and availability overlay with quick-assign interaction.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { ShiftMatrixProps } from './ShiftMatrix.types';

export type {
  ShiftMatrixProps,
  ShiftTimeSlot,
  ShiftAssignment,
} from './ShiftMatrix.types';

/** Engine-resolved ShiftMatrix pattern component. */
export const PatternShiftMatrix = createEngineComponent<ShiftMatrixProps>(
  'PatternShiftMatrix',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/classic'),
    rustic: () => import('./engines/classic'),
  }
);
