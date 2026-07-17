/** Runtime values and operations separated from the public type contract. */

import type {
  CustomOperatorDefinition,
  FilterFieldDefinition,
  FilterFieldType,
  FilterOperator,
  OperatorDefinition,
} from '../../contracts';

/**
 * Converts a `CustomOperatorDefinition` into an `OperatorDefinition` that
 * can be used alongside the built-in operator registry in dropdowns and
 * value-input visibility logic.
 */
export function toOperatorDefinition(custom: CustomOperatorDefinition): OperatorDefinition {
  return {
    key: custom.key,
    label: custom.label,
    requiresValue: custom.valueCount > 0,
    requiresRange: custom.valueCount === 2,
  };
}

/**
 * Merges custom operators into the `DEFAULT_OPERATORS_BY_TYPE` map for a
 * given set of custom operator definitions. Returns a new map where each
 * field type's operator list is extended with the custom operators that
 * declare compatibility with that type.
 *
 * The original `DEFAULT_OPERATORS_BY_TYPE` is never mutated.
 *
 * @param customOperators - Custom operator definitions to merge.
 * @returns A merged copy of the default operators map.
 */
export function mergeOperatorsByType(
  customOperators: CustomOperatorDefinition[]
): Record<FilterFieldType, FilterOperator[]> {
  const merged = { ...DEFAULT_OPERATORS_BY_TYPE };
  for (const fieldType of Object.keys(merged) as FilterFieldType[]) {
    merged[fieldType] = [...merged[fieldType]];
  }
  for (const custom of customOperators) {
    for (const fieldType of custom.fieldTypes) {
      if (merged[fieldType]) {
        merged[fieldType].push(custom.key);
      }
    }
  }
  return merged;
}

/**
 * Returns the list of `OperatorDefinition` objects available for a given
 * field, including any custom operators. Checks the field's custom
 * `operators` array first, then falls back to the (optionally merged)
 * default operator map.
 *
 * @param field - The field definition to get operators for.
 * @param customOperators - Optional custom operator definitions to include.
 * @returns Filtered array of operator definitions.
 */
export function getOperatorsForFieldWithCustom(
  field: FilterFieldDefinition,
  customOperators?: CustomOperatorDefinition[]
): OperatorDefinition[] {
  const allDefs: OperatorDefinition[] = [...OPERATOR_DEFINITIONS];
  if (customOperators) {
    for (const custom of customOperators) {
      allDefs.push(toOperatorDefinition(custom));
    }
  }
  const operatorMap = customOperators
    ? mergeOperatorsByType(customOperators)
    : DEFAULT_OPERATORS_BY_TYPE;
  const allowedKeys = field.operators ?? operatorMap[field.type];
  return allDefs.filter((op) => allowedKeys.includes(op.key));
}

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
 * Default operator sets for each field type. When a `FilterFieldDefinition`
 * does not specify custom `operators`, this map is used to determine which
 * operators appear in the dropdown.
 *
 * - `text` fields get string-oriented operators (contains, startsWith, etc.)
 * - `number` fields get comparison operators (gt, gte, lt, lte, between)
 * - `date` fields get a subset of comparison operators
 * - `select` fields get equality and set-membership operators
 * - `multiSelect` fields only get set-membership operators
 * - `boolean` fields only get equality operators
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
 * Returns the list of `OperatorDefinition` objects available for a given
 * field. Checks the field's custom `operators` array first, then falls back
 * to `DEFAULT_OPERATORS_BY_TYPE`.
 *
 * @param field - The field definition to get operators for.
 * @returns Filtered array of operator definitions.
 */
export function getOperatorsForField(field: FilterFieldDefinition): OperatorDefinition[] {
  const allowedKeys = field.operators ?? DEFAULT_OPERATORS_BY_TYPE[field.type];
  return OPERATOR_DEFINITIONS.filter((op) => allowedKeys.includes(op.key));
}
