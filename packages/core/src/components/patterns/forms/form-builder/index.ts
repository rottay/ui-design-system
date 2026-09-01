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

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { FormBuilderProps } from './contracts';

export type { FormBuilderProps } from './contracts';
export type { FieldDef } from '../../../../foundation/contracts/runtime/components/patterns/core';

/** Public form-builder entry point resolved through the engine factory. */
export const PatternFormBuilder = createEngineComponent<FormBuilderProps>(
  'PatternFormBuilder',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
