'use client';

/**
 * @fileoverview Modern (DaisyUI / Tailwind) engine for the FilterBuilder pattern.
 * Renders a recursive, composable filter tree using DaisyUI input/select/toggle
 * classes with native HTML form elements. Nested groups get a left-border
 * accent and tinted background to communicate hierarchy visually.
 *
 * @example
 * <FilterBuilder
 *   engine="modern"
 *   fields={[
 *     { key: 'status', label: 'Status', type: 'select', options: statusOpts },
 *     { key: 'created', label: 'Created', type: 'date' },
 *   ]}
 *   value={filterGroup}
 *   onChange={setFilterGroup}
 *   allowGrouping
 * />
 */

import React, { useCallback } from 'react';
import type {
  FilterBuilderProps,
  FilterGroup,
  FilterRule,
  FilterFieldDefinition,
  FilterOperator,
} from '../FilterBuilder.types';
import {
  isFilterGroup,
  getOperatorsForField,
  generateFilterId,
  OPERATOR_DEFINITIONS,
} from '../FilterBuilder.types';

/**
 * Modern FilterBuilder using DaisyUI form controls for each value type.
 * Manages a recursive filter tree (FilterGroup) via immutable updates.
 *
 * @param props - See {@link FilterBuilderProps} for full prop documentation.
 * @returns A DaisyUI-styled interactive filter composer with AND/OR grouping.
 */
export default function ModernFilterBuilder(props: FilterBuilderProps) {
  const {
    fields,
    value,
    onChange,
    maxDepth = 3,
    allowGrouping = true,
    addRuleLabel = 'Add rule',
    addGroupLabel = 'Add group',
    showClear,
    clearLabel = 'Clear all',
    onClear,
    compact,
    loading,
    className,
    style,
  } = props;

  // Immutable recursive tree update: walks from root to find the target group,
  // spreading at every level so React's reconciler detects the change.
  const updateGroup = useCallback(
    (
      root: FilterGroup,
      targetId: string,
      updater: (group: FilterGroup) => FilterGroup
    ): FilterGroup => {
      if (root.id === targetId) return updater(root);
      return {
        ...root,
        rules: root.rules.map((rule) => {
          if (isFilterGroup(rule)) {
            return updateGroup(rule, targetId, updater);
          }
          return rule;
        }),
      };
    },
    []
  );

  const updateRule = useCallback(
    (
      root: FilterGroup,
      ruleId: string,
      updater: (rule: FilterRule) => FilterRule
    ): FilterGroup => {
      return {
        ...root,
        rules: root.rules.map((rule) => {
          if (isFilterGroup(rule)) {
            return updateRule(rule, ruleId, updater);
          }
          if (rule.id === ruleId) return updater(rule);
          return rule;
        }),
      };
    },
    []
  );

  const removeNode = useCallback(
    (root: FilterGroup, nodeId: string): FilterGroup => {
      return {
        ...root,
        rules: root.rules
          .filter((rule) => rule.id !== nodeId)
          .map((rule) => {
            if (isFilterGroup(rule)) {
              return removeNode(rule, nodeId);
            }
            return rule;
          }),
      };
    },
    []
  );

  // New rules default to the first field and its first valid operator so the
  // row renders with sensible dropdowns pre-selected. Value starts undefined
  // to show the placeholder text in the input.
  const handleAddRule = useCallback(
    (groupId: string) => {
      const defaultField = fields[0];
      if (!defaultField) return;
      const ops = getOperatorsForField(defaultField);
      const newRule: FilterRule = {
        id: generateFilterId(),
        field: defaultField.key,
        operator: ops[0]?.key ?? 'equals',
        value: undefined,
      };
      onChange(
        updateGroup(value, groupId, (group) => ({
          ...group,
          rules: [...group.rules, newRule],
        }))
      );
    },
    [fields, value, onChange, updateGroup]
  );

  const handleAddGroup = useCallback(
    (parentGroupId: string) => {
      const newGroup: FilterGroup = {
        id: generateFilterId(),
        logic: 'and',
        rules: [],
      };
      onChange(
        updateGroup(value, parentGroupId, (group) => ({
          ...group,
          rules: [...group.rules, newGroup],
        }))
      );
    },
    [value, onChange, updateGroup]
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      onChange(removeNode(value, nodeId));
    },
    [value, onChange, removeNode]
  );

  // Binary toggle between AND / OR. Nested groups allow users to build
  // complex predicates (e.g. an OR group inside an AND group).
  const handleToggleLogic = useCallback(
    (groupId: string) => {
      onChange(
        updateGroup(value, groupId, (group) => ({
          ...group,
          logic: group.logic === 'and' ? 'or' : 'and',
        }))
      );
    },
    [value, onChange, updateGroup]
  );

  // Reset operator and value when the field type changes because the valid
  // operator set differs by type (e.g. "contains" is not valid for numbers)
  // and the previous value may be the wrong shape for the new type.
  const handleFieldChange = useCallback(
    (ruleId: string, fieldKey: string) => {
      const fieldDef = fields.find((f) => f.key === fieldKey);
      if (!fieldDef) return;
      const ops = getOperatorsForField(fieldDef);
      onChange(
        updateRule(value, ruleId, (rule) => ({
          ...rule,
          field: fieldKey,
          operator: ops[0]?.key ?? 'equals',
          value: undefined,
        }))
      );
    },
    [fields, value, onChange, updateRule]
  );

  // Clear the value when switching to a unary operator (e.g. "is empty")
  // so stale values are not accidentally sent to the consumer's query builder.
  const handleOperatorChange = useCallback(
    (ruleId: string, operator: FilterOperator) => {
      const opDef = OPERATOR_DEFINITIONS.find((o) => o.key === operator);
      onChange(
        updateRule(value, ruleId, (rule) => ({
          ...rule,
          operator,
          value: opDef?.requiresValue ? rule.value : undefined,
        }))
      );
    },
    [value, onChange, updateRule]
  );

  const handleValueChange = useCallback(
    (ruleId: string, newValue: any) => {
      onChange(
        updateRule(value, ruleId, (rule) => ({
          ...rule,
          value: newValue,
        }))
      );
    },
    [value, onChange, updateRule]
  );

  // DaisyUI size classes are chosen based on the compact prop to keep the
  // filter row visually tight in dense UIs like data-table toolbars.
  const sizeClass = compact ? 'input-xs select-xs' : 'input-sm select-sm';

  // Renders the appropriate native input for the field type. Uses native HTML
  // elements (input, select, checkbox) styled with DaisyUI classes rather
  // than Ant Design components, keeping the bundle lightweight.
  const renderValueInput = (rule: FilterRule, fieldDef: FilterFieldDefinition) => {
    const opDef = OPERATOR_DEFINITIONS.find((o) => o.key === rule.operator);
    // Unary operators (isEmpty, isNotEmpty) render no value input.
    if (!opDef?.requiresValue) return null;

    // Range operators ("between") require paired from/to inputs.
    if (opDef.requiresRange) {
      const rangeVal = Array.isArray(rule.value) ? rule.value : [undefined, undefined];
      return (
        <div className="flex items-center gap-1">
          <input
            type={fieldDef.type === 'number' ? 'number' : 'text'}
            style={{ padding: compact ? '2px 6px' : '4px 8px', fontSize: compact ? 12 : 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', width: 80 }}
            placeholder="From"
            value={rangeVal[0] ?? ''}
            onChange={(e) =>
              handleValueChange(rule.id, [
                fieldDef.type === 'number' ? Number(e.target.value) : e.target.value,
                rangeVal[1],
              ])
            }
          />
          <span className="text-xs" style={{ color: 'var(--ds-color-text-secondary)' }}>and</span>
          <input
            type={fieldDef.type === 'number' ? 'number' : 'text'}
            style={{ padding: compact ? '2px 6px' : '4px 8px', fontSize: compact ? 12 : 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', width: 80 }}
            placeholder="To"
            value={rangeVal[1] ?? ''}
            onChange={(e) =>
              handleValueChange(rule.id, [
                rangeVal[0],
                fieldDef.type === 'number' ? Number(e.target.value) : e.target.value,
              ])
            }
          />
        </div>
      );
    }

    switch (fieldDef.type) {
      case 'number':
        return (
          <input
            type="number"
            style={{ padding: compact ? '2px 6px' : '4px 8px', fontSize: compact ? 12 : 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', width: 112 }}
            placeholder={fieldDef.placeholder ?? 'Value'}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, Number(e.target.value))}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            style={{ padding: compact ? '2px 6px' : '4px 8px', fontSize: compact ? 12 : 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', width: 144 }}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, e.target.value)}
          />
        );
      case 'select':
      case 'multiSelect':
        return (
          <select
            style={{ padding: compact ? '2px 6px' : '4px 8px', fontSize: compact ? 12 : 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', minWidth: 120 }}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, e.target.value)}
          >
            <option value="" disabled>
              {fieldDef.placeholder ?? 'Select...'}
            </option>
            {fieldDef.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            style={{ width: 36, height: 18, cursor: 'pointer' }}
            checked={rule.value === true}
            onChange={(e) => handleValueChange(rule.id, e.target.checked)}
          />
        );
      default:
        return (
          <input
            type="text"
            style={{ padding: compact ? '2px 6px' : '4px 8px', fontSize: compact ? 12 : 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', width: 160 }}
            placeholder={fieldDef.placeholder ?? 'Value'}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, e.target.value)}
          />
        );
    }
  };

  // A single rule row: logic keyword, field dropdown, operator dropdown,
  // type-appropriate value input, and a delete button.
  const renderRule = (rule: FilterRule, isFirst: boolean, parentLogic: 'and' | 'or') => {
    const fieldDef = fields.find((f) => f.key === rule.field);
    const operators = fieldDef ? getOperatorsForField(fieldDef) : [];

    return (
      <div
        key={rule.id}
        data-testid={`filter-rule-${rule.id}`}
        className={`flex items-center gap-2 ${compact ? 'py-1' : 'py-1.5'}`}
      >
        <div className="w-14 text-center text-xs font-medium uppercase" style={{ color: 'var(--ds-color-text-secondary)' }}>
          {isFirst ? 'Where' : parentLogic.toUpperCase()}
        </div>

        <select
          style={{ padding: compact ? '2px 6px' : '4px 8px', fontSize: compact ? 12 : 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', minWidth: 120 }}
          value={rule.field}
          onChange={(e) => handleFieldChange(rule.id, e.target.value)}
          data-testid={`field-select-${rule.id}`}
        >
          {fields.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          style={{ padding: compact ? '2px 6px' : '4px 8px', fontSize: compact ? 12 : 13, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', background: 'transparent', color: 'inherit', minWidth: 130 }}
          value={rule.operator}
          onChange={(e) => handleOperatorChange(rule.id, e.target.value as FilterOperator)}
          data-testid={`operator-select-${rule.id}`}
        >
          {operators.map((op) => (
            <option key={op.key} value={op.key}>
              {op.label}
            </option>
          ))}
        </select>

        {fieldDef && renderValueInput(rule, fieldDef)}

        <button
          style={{ background: 'transparent', color: 'var(--ds-color-error)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => handleRemoveNode(rule.id)}
          aria-label="Remove rule"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    );
  };

  // Groups render recursively. The root group has no visual container so it
  // integrates cleanly into any parent layout; nested groups get a colored
  // left border and tinted background to show nesting hierarchy.
  const renderGroup = (group: FilterGroup, depth: number = 0) => {
    const isRoot = depth === 0;
    // maxDepth - 1 because "Add group" creates a child at depth + 1.
    const canNest = allowGrouping && depth < maxDepth - 1;

    return (
      <div
        key={group.id}
        data-testid={`filter-group-${group.id}`}
        className={
          isRoot
            ? ''
            : 'border-l-[3px] pl-4 ml-2 mb-2 rounded-r-lg py-2 pr-3'
        }
        style={isRoot ? undefined : { borderColor: 'color-mix(in srgb, var(--ds-color-primary) 30%, transparent)', background: 'var(--ds-surface-inset)' }}
      >
        {!isRoot && (
          <div className="flex items-center justify-between mb-1">
            <button
              style={group.logic === 'and'
                ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }
                : { background: 'transparent', color: 'var(--ds-color-text-primary)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-color-border)', cursor: 'pointer' }
              }
              onClick={() => handleToggleLogic(group.id)}
              data-testid={`logic-toggle-${group.id}`}
            >
              {group.logic.toUpperCase()}
            </button>
            <button
              style={{ background: 'transparent', color: 'var(--ds-color-error)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => handleRemoveNode(group.id)}
              aria-label="Remove group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}

        {group.rules.map((rule, index) =>
          isFilterGroup(rule)
            ? renderGroup(rule, depth + 1)
            : renderRule(rule, index === 0, group.logic)
        )}

        <div className="flex items-center gap-2 mt-2">
          <button
            style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: '1px dashed var(--ds-color-border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() => handleAddRule(group.id)}
            data-testid={`add-rule-${group.id}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {addRuleLabel}
          </button>
          {canNest && (
            <button
              style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: '1px dashed var(--ds-color-border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={() => handleAddGroup(group.id)}
              data-testid={`add-group-${group.id}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
                />
              </svg>
              {addGroupLabel}
            </button>
          )}
        </div>

        {isRoot && showClear && onClear && group.rules.length > 0 && (
          <div className="mt-3">
            <button
              style={{ background: 'transparent', color: 'var(--ds-color-text-secondary)', height: 24, padding: '0 8px', fontSize: 12, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }}
              onClick={onClear}
              data-testid="clear-filters"
            >
              {clearLabel}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[100px] ${className ?? ''}`}
        style={style}
      >
        <span style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid var(--ds-color-border)', borderTopColor: 'var(--ds-color-primary)', borderRadius: '50%', animation: 'ds-spin 0.6s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {renderGroup(value, 0)}
    </div>
  );
}
