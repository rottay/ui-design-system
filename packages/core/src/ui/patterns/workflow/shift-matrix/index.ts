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
 * @category domain-kit (staffing)
 * Ships a real modern engine (token-driven, native table anatomy with sticky
 * axes); classic and rustic continue to resolve to the shared classic
 * implementation.
 */
export const PatternShiftMatrix = createEngineComponent<ShiftMatrixProps>(
  'PatternShiftMatrix',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/classic'),
  }
);
