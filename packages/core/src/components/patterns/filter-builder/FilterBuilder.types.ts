/**
 * FilterBuilder - Pattern Component Types
 *
 * Advanced filter builder with nested AND/OR groups,
 * inspired by Airtable's filter composition UI.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

/**
 * Operators available for filter rules.
 */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty';

/**
 * A single filter rule (leaf node in the filter tree).
 */
export interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * A filter group containing rules and/or nested groups (branch node).
 */
export interface FilterGroup {
  id: string;
  logic: 'and' | 'or';
  rules: (FilterRule | FilterGroup)[];
}

/**
 * Type guard to check if a filter node is a group.
 */
export function isFilterGroup(
  node: FilterRule | FilterGroup
): node is FilterGroup {
  return 'logic' in node && 'rules' in node;
}

/**
 * Type guard to check if a filter node is a rule.
 */
export function isFilterRule(
  node: FilterRule | FilterGroup
): node is FilterRule {
  return 'field' in node && 'operator' in node;
}

/**
 * Field type determines which operators and value inputs are available.
 */
export type FilterFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiSelect'
  | 'boolean';

/**
 * Definition for a filterable field.
 */
export interface FilterFieldDefinition {
  /** Unique key matching the data field */
  key: string;
  /** Display label */
  label: string;
  /** Field type determines available operators and value input */
  type: FilterFieldType;
  /** Custom operators to allow (overrides defaults for this type) */
  operators?: FilterOperator[];
  /** Options for select / multiSelect fields */
  options?: { label: string; value: any }[];
  /** Custom icon for the field selector */
  icon?: ReactNode;
  /** Placeholder for value input */
  placeholder?: string;
}

/**
 * Operator metadata for display purposes.
 */
export interface OperatorDefinition {
  key: FilterOperator;
  label: string;
  /** Whether this operator requires a value input */
  requiresValue: boolean;
  /** Whether this operator requires two values (for 'between') */
  requiresRange: boolean;
}

/**
 * Default operator definitions.
 */
export const OPERATOR_DEFINITIONS: OperatorDefinition[] = [
  { key: 'equals', label: 'equals', requiresValue: true, requiresRange: false },
  { key: 'notEquals', label: 'does not equal', requiresValue: true, requiresRange: false },
  { key: 'contains', label: 'contains', requiresValue: true, requiresRange: false },
  { key: 'notContains', label: 'does not contain', requiresValue: true, requiresRange: false },
  { key: 'startsWith', label: 'starts with', requiresValue: true, requiresRange: false },
  { key: 'endsWith', label: 'ends with', requiresValue: true, requiresRange: false },
  { key: 'gt', label: 'greater than', requiresValue: true, requiresRange: false },
  { key: 'gte', label: 'greater or equal', requiresValue: true, requiresRange: false },
  { key: 'lt', label: 'less than', requiresValue: true, requiresRange: false },
  { key: 'lte', label: 'less or equal', requiresValue: true, requiresRange: false },
  { key: 'between', label: 'is between', requiresValue: true, requiresRange: true },
  { key: 'in', label: 'is any of', requiresValue: true, requiresRange: false },
  { key: 'notIn', label: 'is none of', requiresValue: true, requiresRange: false },
  { key: 'isEmpty', label: 'is empty', requiresValue: false, requiresRange: false },
  { key: 'isNotEmpty', label: 'is not empty', requiresValue: false, requiresRange: false },
];

/**
 * Default operators per field type.
 */
export const DEFAULT_OPERATORS_BY_TYPE: Record<FilterFieldType, FilterOperator[]> = {
  text: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  number: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between', 'isEmpty', 'isNotEmpty'],
  date: ['equals', 'notEquals', 'gt', 'lt', 'between', 'isEmpty', 'isNotEmpty'],
  select: ['equals', 'notEquals', 'in', 'notIn', 'isEmpty', 'isNotEmpty'],
  multiSelect: ['in', 'notIn', 'isEmpty', 'isNotEmpty'],
  boolean: ['equals', 'notEquals'],
};

/**
 * Utility to get available operators for a field.
 */
export function getOperatorsForField(field: FilterFieldDefinition): OperatorDefinition[] {
  const allowedKeys = field.operators ?? DEFAULT_OPERATORS_BY_TYPE[field.type];
  return OPERATOR_DEFINITIONS.filter((op) => allowedKeys.includes(op.key));
}

/**
 * Utility to generate a unique ID for filter nodes.
 */
export function generateFilterId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Props for the FilterBuilder pattern component.
 */
export interface FilterBuilderProps extends PatternBaseProps {
  /** Available field definitions */
  fields: FilterFieldDefinition[];
  /** Current filter group value */
  value: FilterGroup;
  /** Called when the filter changes */
  onChange: (value: FilterGroup) => void;
  /** Maximum nesting depth (default: 3) */
  maxDepth?: number;
  /** Whether to allow group nesting (default: true) */
  allowGrouping?: boolean;
  /** Label for the "Add rule" button */
  addRuleLabel?: string;
  /** Label for the "Add group" button */
  addGroupLabel?: string;
  /** Whether to show a clear all button */
  showClear?: boolean;
  /** Label for the clear button */
  clearLabel?: string;
  /** Called when the clear button is clicked */
  onClear?: () => void;
  /** Compact mode reduces padding and font sizes */
  compact?: boolean;
}
