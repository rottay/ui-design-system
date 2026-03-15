'use client';

/**
 * FilterBuilder - Pattern Component
 *
 * Advanced nested AND/OR filter composition with visual grouping.
 * Inspired by Airtable's filter builder pattern.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { FilterBuilderProps } from './FilterBuilder.types';

export type {
  FilterBuilderProps,
  FilterRule,
  FilterGroup,
  FilterFieldDefinition,
  FilterFieldType,
  FilterOperator,
  OperatorDefinition,
} from './FilterBuilder.types';

export {
  isFilterGroup,
  isFilterRule,
  generateFilterId,
  getOperatorsForField,
  OPERATOR_DEFINITIONS,
  DEFAULT_OPERATORS_BY_TYPE,
} from './FilterBuilder.types';

export const PatternFilterBuilder = createEngineComponent<FilterBuilderProps>(
  'PatternFilterBuilder',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
