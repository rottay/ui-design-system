'use client';

/**
 * @fileoverview FilterBuilder pattern - Rottay Design System
 * @description Engine-aware nested filter composer with grouped AND/OR logic.
 *
 * @remarks
 * This pattern sits one layer above primitives: it coordinates operator
 * selection, field-specific editors, and recursive group structure while
 * leaving visual implementation details to the active engine.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { FilterBuilderProps } from './contracts';

export type {
  FilterBuilderProps,
  FilterRule,
  FilterGroup,
  FilterFieldDefinition,
  FilterFieldType,
  FilterOperator,
  BuiltInFilterOperator,
  OperatorDefinition,
  CustomOperatorDefinition,
} from './contracts';

export {
  isFilterGroup,
  isFilterRule,
  generateFilterId,
} from './runtime/tree';

export {
  getOperatorsForField,
  getOperatorsForFieldWithCustom,
  toOperatorDefinition,
  mergeOperatorsByType,
  OPERATOR_DEFINITIONS,
  DEFAULT_OPERATORS_BY_TYPE,
} from './runtime/operators';

/** Public FilterBuilder entry point resolved through the engine factory. */
export const PatternFilterBuilder = createEngineComponent<FilterBuilderProps>(
  'PatternFilterBuilder',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
