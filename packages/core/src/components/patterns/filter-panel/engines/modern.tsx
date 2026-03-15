'use client';

/**
 * FilterPanel - Modern Engine (DaisyUI / Tailwind)
 */

import React, { useState } from 'react';
import type { FilterPanelProps } from '../FilterPanel.types';
import type { FilterDef } from '../../types';

function renderFilterControl(
  filter: FilterDef,
  value: unknown,
  onChange: (key: string, val: unknown) => void,
) {
  switch (filter.type) {
    case 'text':
      return (
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          placeholder={filter.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
        />
      );
    case 'select':
      return (
        <select
          className="select select-bordered select-sm w-full"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value || undefined)}
        >
          <option value="">{filter.placeholder ?? 'Select...'}</option>
          {filter.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case 'multi-select':
      return (
        <div className="flex flex-wrap gap-2">
          {filter.options?.map((o) => {
            const checked = ((value as string[]) ?? []).includes(o.value);
            return (
              <label key={o.value} className="label cursor-pointer gap-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={checked}
                  onChange={() => {
                    const arr = ((value as string[]) ?? []);
                    const next = checked
                      ? arr.filter((v) => v !== o.value)
                      : [...arr, o.value];
                    onChange(filter.key, next);
                  }}
                />
                <span className="label-text text-sm">{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          className="toggle toggle-sm"
          checked={!!value}
          onChange={(e) => onChange(filter.key, e.target.checked)}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          className="input input-bordered input-sm w-full"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
        />
      );
    case 'date-range': {
      const range = (value as [string, string]) ?? ['', ''];
      return (
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="input input-bordered input-sm flex-1"
            value={range[0] ?? ''}
            onChange={(e) => onChange(filter.key, [e.target.value, range[1]])}
          />
          <span className="text-xs">to</span>
          <input
            type="date"
            className="input input-bordered input-sm flex-1"
            value={range[1] ?? ''}
            onChange={(e) => onChange(filter.key, [range[0], e.target.value])}
          />
        </div>
      );
    }
    case 'number-range': {
      const range = (value as [number | '', number | '']) ?? ['', ''];
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input input-bordered input-sm flex-1"
            placeholder="Min"
            value={range[0] ?? ''}
            onChange={(e) =>
              onChange(filter.key, [
                e.target.value === '' ? undefined : Number(e.target.value),
                range[1],
              ])
            }
          />
          <span className="text-xs">-</span>
          <input
            type="number"
            className="input input-bordered input-sm flex-1"
            placeholder="Max"
            value={range[1] ?? ''}
            onChange={(e) =>
              onChange(filter.key, [
                range[0],
                e.target.value === '' ? undefined : Number(e.target.value),
              ])
            }
          />
        </div>
      );
    }
    default:
      return null;
  }
}

export default function ModernFilterPanel(props: FilterPanelProps) {
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
    className = '',
    style,
    loading = false,
  } = props;

  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleChange = (key: string, val: unknown) => {
    onChange({ ...values, [key]: val });
  };

  const isInline = layout === 'inline';
  const isSidebar = layout === 'sidebar';

  const filterContent = (
    <div className={isInline ? 'flex flex-wrap gap-4 items-end' : 'flex flex-col gap-4'}>
      {filters.map((filter) => (
        <div key={filter.key} className={isInline ? 'min-w-[180px]' : ''}>
          <label className="label py-0">
            <span className="label-text text-sm font-medium">{filter.label}</span>
          </label>
          {renderFilterControl(filter, values[filter.key], handleChange)}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`${isSidebar ? 'border-r border-base-300 pr-4' : ''} ${className}`}
      style={style}
    >
      {(title || collapsible) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {collapsible && (
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? '+' : '-'}
              </button>
            )}
            {title && (
              <span className="font-semibold text-sm">{title}</span>
            )}
            {activeCount != null && activeCount > 0 && (
              <span className="badge badge-primary badge-sm">{activeCount}</span>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-sm" />
        </div>
      )}

      {!loading && !(collapsible && collapsed) && (
        <>
          {filterContent}
          {(showReset || showApply) && (
            <div className="flex gap-2 mt-3">
              {showApply && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onApply?.(values)}
                >
                  Apply
                </button>
              )}
              {showReset && (
                <button className="btn btn-ghost btn-sm" onClick={onReset}>
                  Reset
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
