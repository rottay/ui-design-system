'use client';

/**
 * @fileoverview Rustic (Vanilla / CSS variables) engine for the FilterPanel pattern.
 * Uses zero third-party UI libraries -- native HTML with inline layout, and paint
 * (color/background/border, the native-select chevron, the reset/chip hover
 * states) driven by the unlayered rustic filter-panel skin referencing `--ds-*`
 * design-token CSS variables. Includes active filter chips (inline layout) and a
 * slide-down entrance animation for collapsible panels. Fully themeable through
 * CSS variable overrides without any build-time CSS framework.
 *
 * @example
 * <FilterPanel
 *   engine="rustic"
 *   filters={[
 *     { key: 'query', label: 'Search', type: 'text' },
 *     { key: 'date', label: 'Date', type: 'date' },
 *   ]}
 *   values={filterValues}
 *   onChange={setFilterValues}
 *   layout="inline"
 *   collapsible
 * />
 */

import React, { useState } from 'react';
import type { FilterPanelProps } from '../FilterPanel.types';
import type { FilterDef } from '../../../foundation/types';

const ROOT_CLASS_NAME = 'ds-pattern-filter-panel ds-engine-rustic';

// Shared layout for native inputs; paint lives in the rustic filter-panel skin.
const baseInput: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box' as const,
};

/**
 * Renders the appropriate native HTML form control for a given filter definition,
 * styled with token-backed style objects and `--ds-*` CSS variables.
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
          data-part="input"
          style={baseInput}
          placeholder={filter.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
        />
      );
    case 'select':
      return (
        <select
          data-part="select"
          style={{
            ...baseInput,
            paddingRight: 28,
          }}
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
          data-part="input"
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
            data-part="input"
            style={{ ...baseInput, flex: 1 }}
            value={range[0] ?? ''}
            onChange={(e) => onChange(filter.key, [e.target.value, range[1]])}
          />
          <span data-part="range-separator" style={{ fontSize: 12 }}>to</span>
          <input
            type="date"
            data-part="input"
            style={{ ...baseInput, flex: 1 }}
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
          data-part="input"
          style={baseInput}
          placeholder={filter.placeholder}
          value={(value as number | '') ?? ''}
          onChange={(e) =>
            onChange(filter.key, e.target.value === '' ? undefined : Number(e.target.value))
          }
        />
      );
    // Number range: empty strings coerce to undefined so consumers can
    // distinguish "no bound" from an explicit zero.
    case 'number-range': {
      const range = (value as [number | '', number | '']) ?? ['', ''];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            data-part="input"
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
          <span data-part="range-separator" style={{ fontSize: 12 }}>-</span>
          <input
            type="number"
            data-part="input"
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

// Easing and duration pulled from design-system personality tokens so each
// tenant's animation feel is preserved. The fallback values match a smooth
// deceleration curve and 300ms entrance, suitable for most brands.
const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

/**
 * Rustic FilterPanel.
 * Supports inline, stacked, and sidebar layouts with active filter chips,
 * collapsible sections, and animated transitions.
 *
 * Layout and behavior use inline styles and CSS custom properties; paint
 * (color, background, border, the native-select chevron, and the reset + chip
 * hover states) is driven by the unlayered rustic filter-panel skin
 * (`tokens/css/engines/rustic/skin/filter-panel.css`), keyed on the
 * `data-part`/`data-*` contract this file stamps.
 *
 * @param props - See {@link FilterPanelProps} for full prop documentation.
 * @returns A themeable, framework-free filter panel.
 */
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

  // Spread existing values and overwrite the changed key so the consumer
  // receives a complete snapshot on every change, not just the delta.
  const handleChange = (key: string, val: unknown) => {
    onChange({ ...values, [key]: val });
  };

  // Layout modes: inline = horizontal toolbar, stacked = vertical list,
  // sidebar = vertical with right border separator.
  const isInline = layout === 'inline';
  const isSidebar = layout === 'sidebar';

  // Base button layout for action buttons (Apply, Reset).
  const btnBase: React.CSSProperties = {
    padding: '6px 14px',
    fontSize: 13,
    cursor: 'pointer',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  };

  // Compute active filters for chip rendering. A filter is "active" when
  // its value is non-null, non-empty-string, and non-empty-array. This
  // avoids showing chips for cleared or default-state filters.
  const activeChipValues = Object.entries(values).filter(([, v]) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0));

  return (
    <div
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      data-part="root"
      data-sidebar={isSidebar ? 'true' : 'false'}
      style={{
        ...(isSidebar ? { paddingRight: 16 } : {}),
        ...style,
      }}
    >
      {(title || collapsible) && (
        <div data-part="header" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {collapsible && (
            <button
              data-part="collapse-toggle"
              style={{ ...btnBase, padding: '2px 8px', fontSize: 12, transition: `transform ${RUSTIC_DURATION} ${RUSTIC_EASING}` }}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? '+' : '-'}
            </button>
          )}
          {title && (
            <span data-part="title" style={{
              fontWeight: 'var(--ds-typography-heading-font-weight, 600)' as unknown as number,
              fontSize: 14,
              letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
            }}>
              {title}
            </span>
          )}
          {activeCount != null && activeCount > 0 && (
            <span
              data-part="active-count-badge"
              style={{
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

      {/* Active filter chips -- only shown in inline layout where horizontal
          space allows chip pills. Clicking a chip clears that filter value,
          providing a quick "remove one" affordance without opening dropdowns. */}
      {activeChipValues.length > 0 && isInline && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {activeChipValues.map(([key]) => {
            const filter = filters.find((f) => f.key === key);
            if (!filter) return null;
            return (
              <span
                key={key}
                data-part="filter-chip"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
                }}
                onClick={() => handleChange(key, undefined)}
              >
                {filter.label}
                <span data-part="filter-chip-remove" style={{ fontSize: 14, lineHeight: 1, marginLeft: 2 }}>x</span>
              </span>
            );
          })}
        </div>
      )}

      {loading && (
        <div data-part="loading-text" style={{ textAlign: 'center', padding: 16 }}>
          Loading...
        </div>
      )}

      {!loading && !(collapsible && collapsed) && (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: isInline ? 'row' : 'column',
              flexWrap: isInline ? 'wrap' : undefined,
              gap: isInline ? 16 : 12,
              alignItems: isInline ? 'flex-end' : undefined,
              animation: collapsible ? `ds-filter-slide-down ${RUSTIC_DURATION} ${RUSTIC_EASING}` : undefined,
            }}
          >
            {filters.map((filter) => (
              <div key={filter.key} data-part="field-row" style={{ minWidth: isInline ? 180 : undefined }}>
                <div
                  data-part="field-label"
                  style={{
                    marginBottom: 4,
                    fontWeight: 500,
                    fontSize: 13,
                    letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
                    textTransform: 'var(--ds-typography-label-transform, none)' as React.CSSProperties['textTransform'],
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
                <button data-part="apply-button" style={btnBase} onClick={() => onApply?.(values)}>
                  Apply
                </button>
              )}
              {showReset && (
                <button
                  data-part="reset-button"
                  style={btnBase}
                  onClick={onReset}
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
