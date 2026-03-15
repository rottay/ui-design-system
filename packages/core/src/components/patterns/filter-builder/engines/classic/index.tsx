'use client';

/**
 * FilterBuilder - Classic Engine (Ant Design)
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
} from '../../types';
import {
  isFilterGroup,
  getOperatorsForField,
  generateFilterId,
  OPERATOR_DEFINITIONS,
} from '../../types';

const { Text } = Typography;

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

function fromDayjsValue(value: Dayjs | null): string | undefined {
  return value ? value.format('YYYY-MM-DD') : undefined;
}

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

  const renderValueInput = (rule: FilterRule, fieldDef: FilterFieldDefinition) => {
    const opDef = OPERATOR_DEFINITIONS.find((o) => o.key === rule.operator);
    if (!opDef?.requiresValue) return null;

    const size = compact ? 'small' as const : 'middle' as const;

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
            onChange={(v) => handleValueChange(rule.id, v)}
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
      case 'select':
      case 'multiSelect':
        return (
          <Select
            size={size}
            mode={rule.operator === 'in' || rule.operator === 'notIn' || fieldDef.type === 'multiSelect' ? 'multiple' : undefined}
            placeholder={fieldDef.placeholder ?? 'Select...'}
            value={rule.value}
            onChange={(v) => handleValueChange(rule.id, v)}
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

  const renderRule = (rule: FilterRule, isFirst: boolean, parentLogic: 'and' | 'or') => {
    const fieldDef = fields.find((f) => f.key === rule.field);
    const operators = fieldDef ? getOperatorsForField(fieldDef) : [];
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

  const renderGroup = (group: FilterGroup, depth: number = 0) => {
    const isRoot = depth === 0;
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
