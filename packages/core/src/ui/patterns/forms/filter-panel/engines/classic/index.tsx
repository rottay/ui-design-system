'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the FilterPanel pattern.
 * Renders a flat list of filter controls (text, select, multi-select, boolean,
 * date, date-range, number-range) using Ant Design form components. Supports
 * inline and stacked layouts, optional collapsible wrapper via Ant Collapse,
 * and Apply/Reset action buttons.
 *
 * @example
 * <FilterPanel
 *   engine="classic"
 *   filters={[
 *     { key: 'name', label: 'Name', type: 'text', placeholder: 'Search...' },
 *     { key: 'role', label: 'Role', type: 'select', options: roleOpts },
 *   ]}
 *   values={filterValues}
 *   onChange={setFilterValues}
 *   showReset
 * />
 */

import React, { useState } from 'react';
import {
  Input,
  Select,
  Checkbox,
  Switch,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Collapse,
  Typography,
  Badge,
  Spin,
} from 'antd';
import type { FilterPanelProps } from '../../contracts';
import type { FilterDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';

const { Title } = Typography;

/**
 * Renders the appropriate Ant Design form control for a given filter definition.
 * Each filter type maps to a specific Ant component (Input, Select, Switch, etc.)
 * to provide a type-safe, accessible editing experience.
 */
function renderFilterControl(
  filter: FilterDef,
  value: unknown,
  onChange: (key: string, val: unknown) => void,
) {
  switch (filter.type) {
    case 'text':
      return (
        <Input
          placeholder={filter.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
          allowClear
        />
      );
    case 'select':
      return (
        <Select
          placeholder={filter.placeholder}
          value={value as string | undefined}
          onChange={(val) => onChange(filter.key, val)}
          options={filter.options}
          allowClear
          style={{ width: '100%' }}
        />
      );
    case 'multi-select':
      return (
        <Checkbox.Group
          value={(value as string[]) ?? []}
          onChange={(vals) => onChange(filter.key, vals)}
          options={filter.options?.map((o) => ({ label: o.label, value: o.value }))}
        />
      );
    case 'boolean':
      return (
        <Switch
          checked={!!value}
          onChange={(checked) => onChange(filter.key, checked)}
        />
      );
    case 'date':
      return (
        <DatePicker
          placeholder={filter.placeholder}
          value={value as any}
          onChange={(date) => onChange(filter.key, date)}
          style={{ width: '100%' }}
        />
      );
    case 'date-range':
      return (
        <DatePicker.RangePicker
          value={value as any}
          onChange={(dates) => onChange(filter.key, dates)}
          style={{ width: '100%' }}
        />
      );
    case 'number':
      return (
        <InputNumber
          placeholder={filter.placeholder}
          value={value as number | undefined}
          onChange={(v) => onChange(filter.key, v)}
          style={{ width: '100%' }}
        />
      );
    case 'number-range': {
      const range = (value as [number | undefined, number | undefined]) ?? [undefined, undefined];
      return (
        <Space>
          <InputNumber
            placeholder="Min"
            value={range[0]}
            onChange={(v) => onChange(filter.key, [v, range[1]])}
          />
          <span>-</span>
          <InputNumber
            placeholder="Max"
            value={range[1]}
            onChange={(v) => onChange(filter.key, [range[0], v])}
          />
        </Space>
      );
    }
    default:
      return null;
  }
}

/**
 * Classic FilterPanel using Ant Design form components.
 * Provides inline, stacked, or collapsible layouts with optional Apply/Reset buttons.
 *
 * @param props - See {@link FilterPanelProps} for full prop documentation.
 * @returns A configurable filter panel with Ant Design controls.
 */
export default function ClassicFilterPanel(props: FilterPanelProps) {
  const {
    filters,
    values,
    onChange,
    onReset,
    layout = 'stacked',
    collapsible = false,
    defaultCollapsed = false,
    title,
    showReset = false,
    showApply = false,
    onApply,
    activeCount,
    className,
    style,
    loading = false,
  } = props;

  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Spread existing values and overwrite the changed key so the consumer
  // receives a complete snapshot on every change (not just the delta).
  const handleChange = (key: string, val: unknown) => {
    onChange({ ...values, [key]: val });
  };

  // Inline layout arranges filters horizontally with flex-wrap, suitable for
  // toolbar-style filter bars. Stacked (default) uses vertical block flow.
  const isInline = layout === 'inline';

  const filterContent = (
    <Spin spinning={loading}>
      <div
        style={{
          display: isInline ? 'flex' : 'block',
          flexWrap: isInline ? 'wrap' : undefined,
          gap: isInline ? 16 : undefined,
        }}
      >
        {filters.map((filter) => (
          <div
            key={filter.key}
            style={{
              marginBottom: isInline ? 0 : 16,
              minWidth: isInline ? 180 : undefined,
            }}
          >
            <div style={{ marginBottom: 4, fontWeight: 500, fontSize: 13 }}>
              {filter.label}
            </div>
            {renderFilterControl(filter, values[filter.key], handleChange)}
          </div>
        ))}
      </div>
      {(showReset || showApply) && (
        <Space style={{ marginTop: 12 }}>
          {showApply && (
            <Button type="primary" onClick={() => onApply?.(values)}>
              Apply
            </Button>
          )}
          {showReset && (
            <Button onClick={onReset}>Reset</Button>
          )}
        </Space>
      )}
    </Spin>
  );

  // When collapsible, wrap the filter content in Ant's Collapse with ghost
  // mode (no background/border) so it blends into the parent container.
  if (collapsible) {
    return (
      <div className={className} style={style}>
        <Collapse
          defaultActiveKey={defaultCollapsed ? [] : ['filters']}
          ghost
          items={[
            {
              key: 'filters',
              label: (
              <Space>
                {title ?? 'Filters'}
                {activeCount != null && activeCount > 0 && (
                  <Badge count={activeCount} />
                )}
              </Space>
              ),
              children: filterContent,
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {title && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
          {activeCount != null && activeCount > 0 && (
            <Badge count={activeCount} />
          )}
        </div>
      )}
      {filterContent}
    </div>
  );
}
