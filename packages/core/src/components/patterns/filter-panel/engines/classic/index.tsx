'use client';

/**
 * FilterPanel - Classic Engine (Ant Design)
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
import type { FilterPanelProps } from '../../types';
import type { FilterDef } from '../../../types';

const { Panel } = Collapse;
const { Title } = Typography;

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

  const handleChange = (key: string, val: unknown) => {
    onChange({ ...values, [key]: val });
  };

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

  if (collapsible) {
    return (
      <div className={className} style={style}>
        <Collapse
          defaultActiveKey={defaultCollapsed ? [] : ['filters']}
          ghost
        >
          <Panel
            header={
              <Space>
                {title ?? 'Filters'}
                {activeCount != null && activeCount > 0 && (
                  <Badge count={activeCount} />
                )}
              </Space>
            }
            key="filters"
          >
            {filterContent}
          </Panel>
        </Collapse>
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
