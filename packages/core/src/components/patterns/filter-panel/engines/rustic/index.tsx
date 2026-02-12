'use client';

/**
 * FilterPanel - Rustic Engine (Pure inline styles with --ds-* CSS vars)
 */

import React, { useState } from 'react';
import type { FilterPanelProps } from '../../types';
import type { FilterDef } from '../../../types';

const baseInput: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--ds-color-border, #d9d9d9)',
  borderRadius: 'var(--ds-radius-sm, 4px)',
  fontSize: 13,
  background: 'var(--ds-color-bg-input, #fff)',
  color: 'var(--ds-color-text, #1a1a1a)',
  width: '100%',
  boxSizing: 'border-box' as const,
  outline: 'none',
};

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
          style={baseInput}
          placeholder={filter.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
        />
      );
    case 'select':
      return (
        <select
          style={baseInput}
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {filter.options?.map((o) => {
            const checked = ((value as string[]) ?? []).includes(o.value);
            return (
              <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const arr = (value as string[]) ?? [];
                    const next = checked ? arr.filter((v) => v !== o.value) : [...arr, o.value];
                    onChange(filter.key, next);
                  }}
                />
                {o.label}
              </label>
            );
          })}
        </div>
      );
    case 'boolean':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(filter.key, e.target.checked)}
          />
          <span style={{ fontSize: 13 }}>Enabled</span>
        </label>
      );
    case 'date':
      return (
        <input
          type="date"
          style={baseInput}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
        />
      );
    case 'date-range': {
      const range = (value as [string, string]) ?? ['', ''];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="date"
            style={{ ...baseInput, flex: 1 }}
            value={range[0] ?? ''}
            onChange={(e) => onChange(filter.key, [e.target.value, range[1]])}
          />
          <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted, #888)' }}>to</span>
          <input
            type="date"
            style={{ ...baseInput, flex: 1 }}
            value={range[1] ?? ''}
            onChange={(e) => onChange(filter.key, [range[0], e.target.value])}
          />
        </div>
      );
    }
    case 'number-range': {
      const range = (value as [number | '', number | '']) ?? ['', ''];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            style={{ ...baseInput, flex: 1 }}
            placeholder="Min"
            value={range[0] ?? ''}
            onChange={(e) =>
              onChange(filter.key, [
                e.target.value === '' ? undefined : Number(e.target.value),
                range[1],
              ])
            }
          />
          <span style={{ fontSize: 12, color: 'var(--ds-color-text-muted, #888)' }}>-</span>
          <input
            type="number"
            style={{ ...baseInput, flex: 1 }}
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

export default function RusticFilterPanel(props: FilterPanelProps) {
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
  const isSidebar = layout === 'sidebar';

  const btnBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 'var(--ds-radius-sm, 4px)',
    fontSize: 13,
    cursor: 'pointer',
    border: '1px solid var(--ds-color-border, #d9d9d9)',
    background: 'var(--ds-color-bg, #fff)',
    color: 'var(--ds-color-text, #1a1a1a)',
  };

  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    background: 'var(--ds-color-primary, #1677ff)',
    color: '#fff',
    border: 'none',
  };

  return (
    <div
      className={className}
      style={{
        ...(isSidebar ? { borderRight: '1px solid var(--ds-color-border, #e5e5e5)', paddingRight: 16 } : {}),
        ...style,
      }}
    >
      {(title || collapsible) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {collapsible && (
            <button
              style={{ ...btnBase, padding: '2px 8px', fontSize: 12 }}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? '+' : '-'}
            </button>
          )}
          {title && (
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text, #1a1a1a)' }}>
              {title}
            </span>
          )}
          {activeCount != null && activeCount > 0 && (
            <span
              style={{
                background: 'var(--ds-color-primary, #1677ff)',
                color: '#fff',
                borderRadius: 10,
                padding: '1px 8px',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {activeCount}
            </span>
          )}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 16, color: 'var(--ds-color-text-muted, #888)' }}>
          Loading...
        </div>
      )}

      {!loading && !(collapsible && collapsed) && (
        <>
          <div
            style={{
              display: isInline ? 'flex' : 'flex',
              flexDirection: isInline ? 'row' : 'column',
              flexWrap: isInline ? 'wrap' : undefined,
              gap: isInline ? 16 : 12,
              alignItems: isInline ? 'flex-end' : undefined,
            }}
          >
            {filters.map((filter) => (
              <div key={filter.key} style={{ minWidth: isInline ? 180 : undefined }}>
                <div
                  style={{
                    marginBottom: 4,
                    fontWeight: 500,
                    fontSize: 13,
                    color: 'var(--ds-color-text, #1a1a1a)',
                  }}
                >
                  {filter.label}
                </div>
                {renderFilterControl(filter, values[filter.key], handleChange)}
              </div>
            ))}
          </div>
          {(showReset || showApply) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {showApply && (
                <button style={btnPrimary} onClick={() => onApply?.(values)}>
                  Apply
                </button>
              )}
              {showReset && (
                <button style={btnBase} onClick={onReset}>
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
