'use client';

/**
 * @fileoverview Modern (DaisyUI / Tailwind) engine for the FilterPanel pattern.
 * Renders a flat list of filter controls using DaisyUI-styled native HTML form
 * elements. Supports inline (toolbar), stacked, and sidebar layouts, an
 * optional collapsible header, and Apply/Reset action buttons.
 *
 * @example
 * <FilterPanel
 *   engine="modern"
 *   filters={[
 *     { key: 'search', label: 'Search', type: 'text' },
 *     { key: 'active', label: 'Active only', type: 'boolean' },
 *   ]}
 *   values={filterValues}
 *   onChange={setFilterValues}
 *   layout="inline"
 *   showApply
 * />
 */

import React, { useState } from 'react';
import type { FilterPanelProps } from '../FilterPanel.types';
import type { FilterDef } from '../../types';

/**
 * Renders the appropriate DaisyUI-styled native HTML form control for a given
 * filter definition. Uses input, select, and checkbox elements with DaisyUI
 * utility classes to keep the bundle free of heavy UI-library dependencies.
 */
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
    // Multi-select renders individual checkboxes because DaisyUI has no
    // built-in multi-select widget. This also gives better UX on mobile
    // where native multi-select elements are difficult to use.
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
                    // Toggle: add if unchecked, remove if checked.
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
    case 'number':
      return (
        <input
          type="number"
          className="input input-bordered input-sm w-full"
          placeholder={filter.placeholder}
          value={(value as number | '') ?? ''}
          onChange={(e) =>
            onChange(filter.key, e.target.value === '' ? undefined : Number(e.target.value))
          }
        />
      );
    // Number range: coerce empty strings to undefined so the consumer's
    // query builder can distinguish "no bound" from zero.
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

/**
 * Modern FilterPanel using DaisyUI-styled native HTML form controls.
 * Supports inline, stacked, and sidebar layouts with optional collapse.
 *
 * @param props - See {@link FilterPanelProps} for full prop documentation.
 * @returns A DaisyUI-styled filter panel with configurable layout.
 */
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

  // Spread existing values and overwrite the changed key so the consumer
  // always receives the full values snapshot, not just the delta.
  const handleChange = (key: string, val: unknown) => {
    onChange({ ...values, [key]: val });
  };

  // Layout modes: inline = horizontal toolbar, stacked = vertical list,
  // sidebar = vertical with a right border separator.
  const isInline = layout === 'inline';
  const isSidebar = layout === 'sidebar';

  const filterContent = (
    // Inline layout uses items-end alignment so labels and inputs of
    // different heights share a consistent bottom baseline.
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

      {/* Hide filter content when collapsed or loading. The guard
          `!(collapsible && collapsed)` ensures non-collapsible panels
          always show their content regardless of the collapsed state. */}
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
