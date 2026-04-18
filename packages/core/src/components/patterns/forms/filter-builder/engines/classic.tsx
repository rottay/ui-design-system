'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the FilterBuilder pattern.
 * Renders a recursive, composable filter tree inspired by tools like Airtable
 * and Notion. Each filter group can contain rules and/or nested groups with
 * AND/OR logic toggles. Uses Ant Design's Select, Input, DatePicker, and
 * Switch components for type-appropriate value inputs.
 *
 * @example
 * <FilterBuilder
 *   engine="classic"
 *   fields={[
 *     { key: 'name', label: 'Name', type: 'text' },
 *     { key: 'age', label: 'Age', type: 'number' },
 *   ]}
 *   value={filterGroup}
 *   onChange={setFilterGroup}
 * />
 */

import React, { useCallback } from 'react';
import { Button, Input, InputNumber, DatePicker, Select, Switch, Space, Spin, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import {
  PlusOutlined,
  DeleteOutlined,
  GroupOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type {
  FilterBuilderProps,
  FilterGroup,
  FilterRule,
  FilterFieldDefinition,
  FilterOperator,
  OperatorDefinition,
  CustomOperatorDefinition,
} from '../FilterBuilder.types';
import {
  isFilterGroup,
  getOperatorsForFieldWithCustom,
  generateFilterId,
  OPERATOR_DEFINITIONS,
  toOperatorDefinition,
} from '../FilterBuilder.types';

const { Text } = Typography;

/**
 * Converts an unknown value (string, Date, or existing Dayjs) into a Dayjs
 * instance for use with Ant Design's DatePicker, which requires Dayjs objects
 * rather than raw date strings.
 */
function toDayjsValue(value: unknown): Dayjs | null {
  if (!value) {
    return null;
  }

  if (dayjs.isDayjs(value)) {
    return value;
  }

  const parsed = dayjs(value as string | number | Date | Dayjs);
  return parsed.isValid() ? parsed : null;
}

/**
 * Converts a Dayjs back to an ISO date string for storage. We normalize to
 * YYYY-MM-DD so the consumer's data model stays serializable (no Dayjs objects
 * leaking into state or API payloads).
 */
function fromDayjsValue(value: Dayjs | null): string | undefined {
  return value ? value.format('YYYY-MM-DD') : undefined;
}

/**
 * Classic FilterBuilder using Ant Design form controls for each value type.
 * Manages a recursive filter tree (FilterGroup) via immutable updates.
 *
 * @param props - See {@link FilterBuilderProps} for full prop documentation.
 * @returns An interactive filter composer with AND/OR grouping and nesting.
 */
export default function ClassicFilterBuilder(props: FilterBuilderProps) {
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

  // Recursively walk the filter tree to find and update the target group.
  // Immutable updates at every level so React detects changes correctly.
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

  // New rules default to the first available field and its first valid
  // operator. Value starts as undefined so the input renders empty.
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

  // Toggle between AND / OR. Only two options because more complex logic
  // (e.g. XOR) would break the composable tree model. Users who need custom
  // logic can nest groups creatively (AND containing ORs, etc.).
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

  // When the field changes, reset operator and value because the valid
  // operator set differs by type (e.g. "contains" is invalid for numbers)
  // and the previous value may be the wrong shape (string vs number).
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

  // Clear the value when switching to an operator that doesn't need one
  // (e.g. "is empty"), but preserve it when the new operator still does.
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

  // Renders the appropriate Ant Design input control based on the field type
  // and operator. Some operators (isEmpty, isNotEmpty) need no value input at
  // all, while "between" needs a paired range of two inputs.
  // Custom operators with a renderValue function get priority.
  const renderValueInput = (rule: FilterRule, fieldDef: FilterFieldDefinition) => {
    const opDef = allOperatorDefs.find((o) => o.key === rule.operator);
    // Operators like "isEmpty" / "isNotEmpty" are unary -- no value needed.
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

    const size = compact ? 'small' as const : 'middle' as const;

    // Range operators ("between") require two inputs (from / to).
    if (opDef.requiresRange) {
      const rangeVal = Array.isArray(rule.value) ? rule.value : [undefined, undefined];
      if (fieldDef.type === 'number') {
        return (
          <Space size={4}>
            <InputNumber
              size={size}
              placeholder="From"
              value={rangeVal[0]}
              onChange={(v) => handleValueChange(rule.id, [v, rangeVal[1]])}
              style={{ width: 90 }}
            />
            <Text type="secondary">and</Text>
            <InputNumber
              size={size}
              placeholder="To"
              value={rangeVal[1]}
              onChange={(v) => handleValueChange(rule.id, [rangeVal[0], v])}
              style={{ width: 90 }}
            />
          </Space>
        );
      }
      return (
        <Space size={4}>
          <Input
            size={size}
            placeholder="From"
            value={rangeVal[0] ?? ''}
            onChange={(e) => handleValueChange(rule.id, [e.target.value, rangeVal[1]])}
            style={{ width: 100 }}
          />
          <Text type="secondary">and</Text>
          <Input
            size={size}
            placeholder="To"
            value={rangeVal[1] ?? ''}
            onChange={(e) => handleValueChange(rule.id, [rangeVal[0], e.target.value])}
            style={{ width: 100 }}
          />
        </Space>
      );
    }

    switch (fieldDef.type) {
      case 'number':
        return (
          <InputNumber
            size={size}
            placeholder={fieldDef.placeholder ?? 'Value'}
            value={rule.value}
            onChange={(v: unknown) => handleValueChange(rule.id, v)}
            style={{ width: 120 }}
          />
        );
      case 'date':
        return (
          <DatePicker
            size={size}
            value={toDayjsValue(rule.value)}
            onChange={(v) => handleValueChange(rule.id, fromDayjsValue(v))}
            style={{ width: 140 }}
          />
        );
      // Select / multiSelect: use Ant's "multiple" mode when the operator
      // implies a set comparison (in / notIn) or the field is inherently multi.
      case 'select':
      case 'multiSelect':
        return (
          <Select
            size={size}
            mode={rule.operator === 'in' || rule.operator === 'notIn' || fieldDef.type === 'multiSelect' ? 'multiple' : undefined}
            placeholder={fieldDef.placeholder ?? 'Select...'}
            value={rule.value}
            onChange={(v: unknown) => handleValueChange(rule.id, v)}
            options={fieldDef.options}
            style={{ minWidth: 140 }}
          />
        );
      case 'boolean':
        return (
          <Switch
            checked={rule.value === true}
            onChange={(checked) => handleValueChange(rule.id, checked)}
          />
        );
      default:
        return (
          <Input
            size={size}
            placeholder={fieldDef.placeholder ?? 'Value'}
            value={rule.value ?? ''}
            onChange={(e) => handleValueChange(rule.id, e.target.value)}
            style={{ width: 160 }}
          />
        );
    }
  };

  // Renders a single filter rule row: logic label, field selector, operator
  // selector, value input, and delete button -- all laid out in a horizontal strip.
  const renderRule = (rule: FilterRule, isFirst: boolean, parentLogic: 'and' | 'or') => {
    const fieldDef = fields.find((f) => f.key === rule.field);
    const operators = fieldDef ? getOperatorsForFieldWithCustom(fieldDef, customOperators) : [];
    const size = compact ? 'small' as const : 'middle' as const;

    return (
      <div
        key={rule.id}
        data-testid={`filter-rule-${rule.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: compact ? '4px 0' : '6px 0',
        }}
      >
        <div
          style={{
            width: 60,
            textAlign: 'center',
            fontSize: compact ? 11 : 12,
            color: 'var(--ds-color-text-muted)',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}
        >
          {isFirst ? 'Where' : parentLogic.toUpperCase()}
        </div>

        <Select
          size={size}
          value={rule.field}
          onChange={(v) => handleFieldChange(rule.id, v)}
          style={{ minWidth: 130 }}
          options={fields.map((f) => ({ label: f.label, value: f.key }))}
          data-testid={`field-select-${rule.id}`}
        />

        <Select
          size={size}
          value={rule.operator}
          onChange={(v) => handleOperatorChange(rule.id, v as FilterOperator)}
          style={{ minWidth: 140 }}
          options={operators.map((op) => ({ label: op.label, value: op.key }))}
          data-testid={`operator-select-${rule.id}`}
        />

        {fieldDef && renderValueInput(rule, fieldDef)}

        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveNode(rule.id)}
          danger
          aria-label="Remove rule"
        />
      </div>
    );
  };

  // Groups render recursively. The root group has no border/background so it
  // integrates cleanly into any container; nested groups get visual indentation.
  const renderGroup = (group: FilterGroup, depth: number = 0) => {
    const isRoot = depth === 0;
    // maxDepth-1 because the "Add group" button creates a child at depth+1.
    const canNest = allowGrouping && depth < maxDepth - 1;

    return (
      <div
        key={group.id}
        data-testid={`filter-group-${group.id}`}
        style={{
          borderLeft: isRoot ? 'none' : `3px solid var(--ds-color-primary-subtle, #d6e4ff)`,
          paddingLeft: isRoot ? 0 : 16,
          marginLeft: isRoot ? 0 : 8,
          marginBottom: isRoot ? 0 : 8,
          background: isRoot ? 'transparent' : 'var(--ds-color-bg-secondary, #fafafa)',
          borderRadius: isRoot ? 0 : 6,
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
            <Button
              size="small"
              type={group.logic === 'and' ? 'primary' : 'default'}
              onClick={() => handleToggleLogic(group.id)}
              data-testid={`logic-toggle-${group.id}`}
            >
              {group.logic.toUpperCase()}
            </Button>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveNode(group.id)}
              danger
              aria-label="Remove group"
            />
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
          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleAddRule(group.id)}
            data-testid={`add-rule-${group.id}`}
          >
            {addRuleLabel}
          </Button>
          {canNest && (
            <Button
              size="small"
              type="dashed"
              icon={<GroupOutlined />}
              onClick={() => handleAddGroup(group.id)}
              data-testid={`add-group-${group.id}`}
            >
              {addGroupLabel}
            </Button>
          )}
          {showAddFilter && isRoot && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button
                size="small"
                type="default"
                icon={<PlusOutlined />}
                onClick={() => setAddFilterOpen((prev) => !prev)}
                data-testid="add-filter-button"
              >
                {addFilterLabel}
              </Button>
              {addFilterOpen && (
                <div
                  data-testid="add-filter-dropdown"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    background: 'var(--ds-color-bg-elevated, #fff)',
                    border: '1px solid var(--ds-color-border, #d9d9d9)',
                    borderRadius: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
                      onClick={() => {
                        handleAddRule(group.id, f.key);
                        setAddFilterOpen(false);
                      }}
                      data-testid={`add-filter-field-${f.key}`}
                      style={{
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: compact ? 12 : 13,
                        color: 'var(--ds-color-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--ds-color-bg-secondary, #f5f5f5)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
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
            <Button
              size="small"
              type="text"
              icon={<ClearOutlined />}
              onClick={onClear}
              data-testid="clear-filters"
            >
              {clearLabel}
            </Button>
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
          ...style,
        }}
      >
        <Spin size="default" />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {renderGroup(value, 0)}
    </div>
  );
}
