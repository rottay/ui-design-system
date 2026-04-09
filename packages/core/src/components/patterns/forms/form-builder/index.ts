'use client';

/**
 * @fileoverview FormBuilder pattern - Rottay Design System
 * @description Engine-aware schema-driven form renderer with validation,
 * multi-layout support, and controlled/uncontrolled usage.
 *
 * @remarks
 * This pattern converts field definitions into DS primitives while keeping the
 * form contract stable across engines. It is intentionally higher-level than
 * `Form`, but lower-level than a full product surface.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { FormBuilderProps } from './FormBuilder.types';

export type { FormBuilderProps } from './FormBuilder.types';
export type { FieldDef } from '../../types';

/** Public form-builder entry point resolved through the engine factory. */
export const PatternFormBuilder = createEngineComponent<FormBuilderProps>(
  'PatternFormBuilder',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
