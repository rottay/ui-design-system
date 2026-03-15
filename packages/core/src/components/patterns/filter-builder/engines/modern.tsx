'use client';

/**
 * FilterBuilder - Modern Engine (DaisyUI / Tailwind)
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

  const sizeClass = compact ? 'input-xs select-xs' : 'input-sm select-sm';

  const renderValueInput = (rule: FilterRule, fieldDef: FilterFieldDefinition) => {
    const opDef = OPERATOR_DEFINITIONS.find((o) => o.key === rule.operator);
    if (!opDef?.requiresValue) return null;

    if (opDef.requiresRange) {
      const rangeVal = Array.isArray(rule.value) ? rule.value : [undefined, undefined];
      return (
        <div className="flex items-center gap-1">
          <input
            type={fieldDef.type === 'number' ? 'number' : 'text'}
            className={`input input-bordered ${compact ? 'input-xs' : 'input-sm'} w-20`}
            placeholder="From"
            value={rangeVal[0] ?? ''}
            onChange={(e) =>
              handleValueChange(rule.id, [
                fieldDef.type === 'number' ? Number(e.target.value) : e.target.value,
                rangeVal[1],
              ])
            }
          />
          <span className="text-xs text-base-content/50">and</span>
          <input
            type={fieldDef.type === 'number' ? 'number' : 'text'}
            className={`input input-bordered ${compact ? 'input-xs' : 'input-sm'} w-20`}
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
            className={`input input-bordered ${compact ? 'input-xs' : 'input-sm'} w-28`}
            placeholder={fieldDef.placeholder ?? 'Value'}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, Number(e.target.value))}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            className={`input input-bordered ${compact ? 'input-xs' : 'input-sm'} w-36`}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, e.target.value)}
          />
        );
      case 'select':
      case 'multiSelect':
        return (
          <select
            className={`select select-bordered ${compact ? 'select-xs' : 'select-sm'} min-w-[120px]`}
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
            className="toggle toggle-sm toggle-primary"
            checked={rule.value === true}
            onChange={(e) => handleValueChange(rule.id, e.target.checked)}
          />
        );
      default:
        return (
          <input
            type="text"
            className={`input input-bordered ${compact ? 'input-xs' : 'input-sm'} w-40`}
            placeholder={fieldDef.placeholder ?? 'Value'}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, e.target.value)}
          />
        );
    }
  };

  const renderRule = (rule: FilterRule, isFirst: boolean, parentLogic: 'and' | 'or') => {
    const fieldDef = fields.find((f) => f.key === rule.field);
    const operators = fieldDef ? getOperatorsForField(fieldDef) : [];

    return (
      <div
        key={rule.id}
        data-testid={`filter-rule-${rule.id}`}
        className={`flex items-center gap-2 ${compact ? 'py-1' : 'py-1.5'}`}
      >
        <div className="w-14 text-center text-xs text-base-content/50 font-medium uppercase">
          {isFirst ? 'Where' : parentLogic.toUpperCase()}
        </div>

        <select
          className={`select select-bordered ${compact ? 'select-xs' : 'select-sm'} min-w-[120px]`}
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
          className={`select select-bordered ${compact ? 'select-xs' : 'select-sm'} min-w-[130px]`}
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
          className="btn btn-ghost btn-xs text-error"
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

  const renderGroup = (group: FilterGroup, depth: number = 0) => {
    const isRoot = depth === 0;
    const canNest = allowGrouping && depth < maxDepth - 1;

    return (
      <div
        key={group.id}
        data-testid={`filter-group-${group.id}`}
        className={
          isRoot
            ? ''
            : 'border-l-[3px] border-primary/30 pl-4 ml-2 mb-2 bg-base-200/50 rounded-r-lg py-2 pr-3'
        }
      >
        {!isRoot && (
          <div className="flex items-center justify-between mb-1">
            <button
              className={`btn btn-xs ${group.logic === 'and' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleToggleLogic(group.id)}
              data-testid={`logic-toggle-${group.id}`}
            >
              {group.logic.toUpperCase()}
            </button>
            <button
              className="btn btn-ghost btn-xs text-error"
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
            className="btn btn-ghost btn-xs border-dashed border-base-300"
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
              className="btn btn-ghost btn-xs border-dashed border-base-300"
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
              className="btn btn-ghost btn-xs text-base-content/50"
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
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {renderGroup(value, 0)}
    </div>
  );
}
