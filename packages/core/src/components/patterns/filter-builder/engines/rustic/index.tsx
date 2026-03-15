'use client';

/**
 * FilterBuilder - Rustic Engine (Inline styles with CSS variables)
 */

import React, { useCallback } from 'react';
import type {
  FilterBuilderProps,
  FilterGroup,
  FilterRule,
  FilterFieldDefinition,
  FilterOperator,
} from '../../types';
import {
  isFilterGroup,
  getOperatorsForField,
  generateFilterId,
  OPERATOR_DEFINITIONS,
} from '../../types';

export default function RusticFilterBuilder(props: FilterBuilderProps) {
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

  const inputStyle: React.CSSProperties = {
    padding: compact ? '3px 6px' : '5px 8px',
    fontSize: compact ? 12 : 13,
    border: '1px solid var(--ds-color-border, #d0d0d0)',
    borderRadius: 4,
    outline: 'none',
    background: 'var(--ds-color-background, #fff)',
    color: 'var(--ds-color-text, #1a1a1a)',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'auto' as any,
  };

  const smallBtnStyle: React.CSSProperties = {
    padding: '4px 10px',
    border: '1px dashed var(--ds-color-border, #d0d0d0)',
    borderRadius: 4,
    background: 'transparent',
    cursor: 'pointer',
    fontSize: compact ? 11 : 12,
    color: 'var(--ds-color-text-muted, #888)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const renderValueInput = (rule: FilterRule, fieldDef: FilterFieldDefinition) => {
    const opDef = OPERATOR_DEFINITIONS.find((o) => o.key === rule.operator);
    if (!opDef?.requiresValue) return null;

    if (opDef.requiresRange) {
      const rangeVal = Array.isArray(rule.value) ? rule.value : [undefined, undefined];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type={fieldDef.type === 'number' ? 'number' : 'text'}
            style={{ ...inputStyle, width: 80 }}
            placeholder="From"
            value={rangeVal[0] ?? ''}
            onChange={(e) =>
              handleValueChange(rule.id, [
                fieldDef.type === 'number' ? Number(e.target.value) : e.target.value,
                rangeVal[1],
              ])
            }
          />
          <span
            style={{
              fontSize: 11,
              color: 'var(--ds-color-text-muted, #999)',
            }}
          >
            and
          </span>
          <input
            type={fieldDef.type === 'number' ? 'number' : 'text'}
            style={{ ...inputStyle, width: 80 }}
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
            style={{ ...inputStyle, width: 100 }}
            placeholder={fieldDef.placeholder ?? 'Value'}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, Number(e.target.value))}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            style={{ ...inputStyle, width: 140 }}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, e.target.value)}
          />
        );
      case 'select':
      case 'multiSelect':
        return (
          <select
            style={{ ...selectStyle, minWidth: 120 }}
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
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--ds-color-text, #1a1a1a)',
            }}
          >
            <input
              type="checkbox"
              checked={rule.value === true}
              onChange={(e) => handleValueChange(rule.id, e.target.checked)}
            />
            {rule.value ? 'True' : 'False'}
          </label>
        );
      default:
        return (
          <input
            type="text"
            style={{ ...inputStyle, width: 150 }}
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: compact ? '3px 0' : '5px 0',
        }}
      >
        <div
          style={{
            width: 56,
            textAlign: 'center',
            fontSize: compact ? 10 : 11,
            color: 'var(--ds-color-text-muted, #999)',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}
        >
          {isFirst ? 'Where' : parentLogic.toUpperCase()}
        </div>

        <select
          style={{ ...selectStyle, minWidth: 120 }}
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
          style={{ ...selectStyle, minWidth: 130 }}
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
          onClick={() => handleRemoveNode(rule.id)}
          aria-label="Remove rule"
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--ds-color-danger, #ef4444)',
            fontSize: 14,
            padding: 0,
            borderRadius: 3,
          }}
        >
          &#x2715;
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
        style={{
          borderLeft: isRoot
            ? 'none'
            : '3px solid var(--ds-color-primary-subtle, #dbeafe)',
          paddingLeft: isRoot ? 0 : 16,
          marginLeft: isRoot ? 0 : 8,
          marginBottom: isRoot ? 0 : 8,
          background: isRoot
            ? 'transparent'
            : 'var(--ds-color-surface, #fafafa)',
          borderRadius: isRoot ? 0 : 4,
          padding: isRoot ? 0 : '8px 12px 8px 16px',
        }}
      >
        {!isRoot && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <button
              onClick={() => handleToggleLogic(group.id)}
              data-testid={`logic-toggle-${group.id}`}
              style={{
                padding: '3px 12px',
                border:
                  group.logic === 'and'
                    ? '1px solid var(--ds-color-primary, #3b82f6)'
                    : '1px solid var(--ds-color-border, #d0d0d0)',
                borderRadius: 4,
                background:
                  group.logic === 'and'
                    ? 'var(--ds-color-primary, #3b82f6)'
                    : 'transparent',
                color:
                  group.logic === 'and'
                    ? 'var(--ds-color-text-on-primary, #fff)'
                    : 'var(--ds-color-text, #1a1a1a)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {group.logic.toUpperCase()}
            </button>
            <button
              onClick={() => handleRemoveNode(group.id)}
              aria-label="Remove group"
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--ds-color-danger, #ef4444)',
                fontSize: 14,
                padding: 0,
                borderRadius: 3,
              }}
            >
              &#x2715;
            </button>
          </div>
        )}

        {group.rules.map((rule, index) =>
          isFilterGroup(rule)
            ? renderGroup(rule, depth + 1)
            : renderRule(rule, index === 0, group.logic)
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          <button
            onClick={() => handleAddRule(group.id)}
            data-testid={`add-rule-${group.id}`}
            style={smallBtnStyle}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
            {addRuleLabel}
          </button>
          {canNest && (
            <button
              onClick={() => handleAddGroup(group.id)}
              data-testid={`add-group-${group.id}`}
              style={smallBtnStyle}
            >
              <span style={{ fontSize: 12, lineHeight: 1 }}>&#9633;</span>
              {addGroupLabel}
            </button>
          )}
        </div>

        {isRoot && showClear && onClear && group.rules.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={onClear}
              data-testid="clear-filters"
              style={{
                padding: '4px 8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--ds-color-text-muted, #888)',
              }}
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
        className={className}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 100,
          color: 'var(--ds-color-text-muted)',
          fontSize: 13,
          ...style,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {renderGroup(value, 0)}
    </div>
  );
}
