'use client';

/**
 * FormBuilder - Pattern Component
 *
 * Engine-aware form builder with dynamic field rendering,
 * validation, multi-layout support (vertical, horizontal,
 * grid, steps), and controlled/uncontrolled modes.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { FormBuilderProps } from './FormBuilder.types';

export type { FormBuilderProps } from './FormBuilder.types';
export type { FieldDef } from '../types';

export const PatternFormBuilder = createEngineComponent<FormBuilderProps>(
  'PatternFormBuilder',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
