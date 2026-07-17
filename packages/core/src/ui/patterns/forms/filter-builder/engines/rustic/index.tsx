'use client';

/**
 * @fileoverview Rustic (Vanilla / CSS variables) engine for the FilterBuilder pattern.
 * Uses zero third-party UI libraries; authored engine classes and bounded
 * runtime layout styles reference `--ds-*` design-token CSS variables. Input and select
 * elements use native HTML controls styled with consistent token-based borders,
 * colors, and radii so the filter builder respects the active tenant theme.
 *
 * @example
 * <FilterBuilder
 *   engine="rustic"
 *   fields={[
 *     { key: 'amount', label: 'Amount', type: 'number' },
 *     { key: 'category', label: 'Category', type: 'select', options: catOpts },
 *   ]}
 *   value={filterGroup}
 *   onChange={setFilterGroup}
 *   compact
 * />
 */

import React, { useCallback } from 'react';
import type {
  FilterBuilderProps,
  FilterGroup,
  FilterRule,
  FilterFieldDefinition,
  FilterOperator,
  OperatorDefinition,
  CustomOperatorDefinition,
} from '../../contracts';
import {
  isFilterGroup,
  generateFilterId,
} from '../../runtime/tree';
import {
  getOperatorsForFieldWithCustom,
  OPERATOR_DEFINITIONS,
  toOperatorDefinition,
} from '../../runtime/operators';

/**
 * Rustic FilterBuilder using authored engine CSS plus bounded runtime layout styles.
 * Manages a recursive filter tree (FilterGroup) via immutable updates.
 *
 * @param props - See {@link FilterBuilderProps} for full prop documentation.
 * @returns A themeable, framework-free filter composer with AND/OR grouping.
 */
const ROOT_CLASS_NAME = 'ds-pattern-filter-builder ds-engine-rustic';

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
    customOperators,
    showAddFilter,
    addFilterLabel = 'Add filter',
  } = props;

  // Build a merged operator definitions list (built-in + custom) once.
  const allOperatorDefs: OperatorDefinition[] = React.useMemo(() => {
    if (!customOperators?.length) return OPERATOR_DEFINITIONS;
    return [...OPERATOR_DEFINITIONS, ...customOperators.map(toOperatorDefinition)];
  }, [customOperators]);

  // Lookup map for custom operators that provide a custom value renderer.
  const customRenderMap = React.useMemo(() => {
    const map = new Map<string, NonNullable<CustomOperatorDefinition['renderValue']>>();
    if (customOperators) {
      for (const co of customOperators) {
        if (co.renderValue) map.set(co.key, co.renderValue);
      }
    }
    return map;
  }, [customOperators]);

  // State for the "Add Filter" field selector dropdown.
  const [addFilterOpen, setAddFilterOpen] = React.useState(false);

  // Recursive immutable update: returns a new tree with only the target
  // group mutated, preserving referential identity of all other nodes.
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
    (groupId: string, fieldKey?: string) => {
      const defaultField = fieldKey
        ? fields.find((f) => f.key === fieldKey) ?? fields[0]
        : fields[0];
      if (!defaultField) return;
      const ops = getOperatorsForFieldWithCustom(defaultField, customOperators);
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
    [fields, value, onChange, updateGroup, customOperators]
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

  // Changing the field type invalidates the current operator and value
  // because different types support different operator sets (e.g. "contains"
  // is only valid for text). Reset both to safe defaults.
  const handleFieldChange = useCallback(
    (ruleId: string, fieldKey: string) => {
      const fieldDef = fields.find((f) => f.key === fieldKey);
      if (!fieldDef) return;
      const ops = getOperatorsForFieldWithCustom(fieldDef, customOperators);
      onChange(
        updateRule(value, ruleId, (rule) => ({
          ...rule,
          field: fieldKey,
          operator: ops[0]?.key ?? 'equals',
          value: undefined,
        }))
      );
    },
    [fields, value, onChange, updateRule, customOperators]
  );

  // Clear value when switching to a unary operator (isEmpty/isNotEmpty)
  // so stale values don't leak into the consumer's query.
  const handleOperatorChange = useCallback(
    (ruleId: string, operator: FilterOperator) => {
      const opDef = allOperatorDefs.find((o) => o.key === operator);
      onChange(
        updateRule(value, ruleId, (rule) => ({
          ...rule,
          operator,
          value: opDef?.requiresValue ? rule.value : undefined,
        }))
      );
    },
    [value, onChange, updateRule, allOperatorDefs]
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

  // Shared base sizing for native inputs. Every painted channel (border, radius,
  // outline, background, colour) is keyed from the skin off `data-part`; only the
  // compact-dependent metrics still have to reach the element inline.
  const inputStyle: React.CSSProperties = {
    padding: compact ? '3px 6px' : '5px 8px',
    fontSize: compact ? 12 : 13,
  };

  // Selects inherit the input sizing but add a pointer cursor and restore
  // native appearance so the browser renders its dropdown chevron.
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'auto' as any,
  };

  // Action buttons (add rule / add group / add filter). The dashed border that
  // keeps add-rule/add-group subordinate to the filter rows -- and the SOLID one
  // the add-filter trigger overrode it with -- are both keyed per part in the skin.
  const smallBtnStyle: React.CSSProperties = {
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: compact ? 11 : 12,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  // Renders the value input matching the field type. Native HTML form elements
  // are used (no UI library) so the rustic engine has zero external dependencies.
  // Custom operators with a renderValue function get priority.
  const renderValueInput = (rule: FilterRule, fieldDef: FilterFieldDefinition) => {
    const opDef = allOperatorDefs.find((o) => o.key === rule.operator);
    // Unary operators (isEmpty/isNotEmpty) need no value input.
    if (!opDef?.requiresValue) return null;

    // Custom operator with a custom value renderer takes priority.
    const customRenderer = customRenderMap.get(rule.operator);
    if (customRenderer) {
      return customRenderer(
        rule.value,
        (v: unknown) => handleValueChange(rule.id, v),
        fieldDef
      );
    }

    // "between" operator renders paired from/to inputs.
    if (opDef.requiresRange) {
      const rangeVal = Array.isArray(rule.value) ? rule.value : [undefined, undefined];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            data-part="value-input"
            data-field-type={fieldDef.type}
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
            data-part="range-separator"
            style={{
              fontSize: 11,
            }}
          >
            and
          </span>
          <input
            data-part="value-input"
            data-field-type={fieldDef.type}
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
            data-part="value-input"
            data-field-type="number"
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
            data-part="value-input"
            data-field-type="date"
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
            data-part="value-input"
            data-field-type={fieldDef.type}
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
            data-part="boolean-label"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            <input
              data-part="value-input"
              data-field-type="boolean"
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
            data-part="value-input"
            data-field-type={fieldDef.type}
            type="text"
            style={{ ...inputStyle, width: 150 }}
            placeholder={fieldDef.placeholder ?? 'Value'}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, e.target.value)}
          />
        );
    }
  };

  // Single rule row: logic label ("Where" for first rule, "AND"/"OR" for
  // subsequent), field select, operator select, value input, and delete button.
  const renderRule = (rule: FilterRule, isFirst: boolean, parentLogic: 'and' | 'or') => {
    const fieldDef = fields.find((f) => f.key === rule.field);
    const operators = fieldDef ? getOperatorsForFieldWithCustom(fieldDef, customOperators) : [];

    return (
      <div
        key={rule.id}
        data-testid={`filter-rule-${rule.id}`}
        data-part="rule"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: compact ? '3px 0' : '5px 0',
        }}
      >
        <div
          data-part="rule-logic-label"
          style={{
            width: 56,
            textAlign: 'center',
            fontSize: compact ? 10 : 11,
            fontWeight: 500,
            textTransform: 'uppercase',
          }}
        >
          {isFirst ? 'Where' : parentLogic.toUpperCase()}
        </div>

        <select
          data-part="field-select"
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
          data-part="operator-select"
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
          data-part="remove-button"
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 14,
            padding: 0,
          }}
        >
          &#x2715;
        </button>
      </div>
    );
  };

  // Groups render recursively. Root has no chrome; nested groups get a
  // primary-tinted left border and muted background to show hierarchy depth.
  const renderGroup = (group: FilterGroup, depth: number = 0) => {
    const isRoot = depth === 0;
    // maxDepth - 1 because "Add group" creates a child at depth + 1.
    const canNest = allowGrouping && depth < maxDepth - 1;

    return (
      <div
        key={group.id}
        data-testid={`filter-group-${group.id}`}
        data-part="group"
        data-root={isRoot || undefined}
        style={{
          paddingLeft: isRoot ? 0 : 16,
          marginLeft: isRoot ? 0 : 8,
          marginBottom: isRoot ? 0 : 8,
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
            {/* AND uses a filled primary button to emphasize the stricter
                conjunction; OR uses an outlined style to suggest the looser
                disjunction. This visual weight difference helps users quickly
                scan nested group logic. */}
            <button
              onClick={() => handleToggleLogic(group.id)}
              data-testid={`logic-toggle-${group.id}`}
              data-part="logic-toggle"
              data-logic={group.logic}
              style={{
                padding: '3px 12px',
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
              data-part="remove-button"
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 14,
                padding: 0,
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
            data-part="add-rule-button"
            style={smallBtnStyle}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
            {addRuleLabel}
          </button>
          {canNest && (
            <button
              onClick={() => handleAddGroup(group.id)}
              data-testid={`add-group-${group.id}`}
              data-part="add-group-button"
              style={smallBtnStyle}
            >
              <span style={{ fontSize: 12, lineHeight: 1 }}>&#9633;</span>
              {addGroupLabel}
            </button>
          )}
          {showAddFilter && isRoot && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setAddFilterOpen((prev) => !prev)}
                data-testid="add-filter-button"
                data-part="add-filter-trigger"
                data-open={addFilterOpen}
                style={smallBtnStyle}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                {addFilterLabel}
              </button>
              {addFilterOpen && (
                <div
                  data-testid="add-filter-dropdown"
                  data-part="add-filter-dropdown"
                  data-open="true"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    zIndex: 10,
                    minWidth: 180,
                    maxHeight: 260,
                    overflowY: 'auto',
                    padding: '4px 0',
                  }}
                >
                  {fields.map((f) => (
                    <div
                      key={f.key}
                      data-part="add-filter-option"
                      onClick={() => {
                        handleAddRule(group.id, f.key);
                        setAddFilterOpen(false);
                      }}
                      data-testid={`add-filter-field-${f.key}`}
                      style={{
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: compact ? 12 : 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {f.icon && <span>{f.icon}</span>}
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {isRoot && showClear && onClear && group.rules.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={onClear}
              data-testid="clear-filters"
              data-part="clear-button"
              style={{
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 12,
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
        data-part="root"
        data-loading="true"
        className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 100,
          fontSize: 13,
          ...style,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div data-part="root" className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={style}>
      {renderGroup(value, 0)}
    </div>
  );
}
