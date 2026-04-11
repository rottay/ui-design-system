'use client';

/**
 * @fileoverview Rustic (Vanilla / CSS variables) engine for the FilterPanel pattern.
 * Uses zero third-party UI libraries -- all styling is expressed through inline
 * styles referencing `--ds-*` design-token CSS variables. Includes active filter
 * chips (inline layout), a slide-down entrance animation for collapsible panels,
 * and hover effects via direct DOM style manipulation. Fully themeable through
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

// Shared base style for native inputs. All visual tokens reference --ds-*
// variables with fallbacks so the component works even with partial themes.
const baseInput: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
  borderRadius: 'var(--ds-radius-sm, 4px)',
  fontSize: 13,
  background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-input))',
  color: 'var(--ds-color-text-primary, var(--ds-color-text))',
  width: '100%',
  boxSizing: 'border-box' as const,
  outline: 'none',
};

/**
 * Renders the appropriate native HTML form control for a given filter definition,
 * styled entirely with inline styles and `--ds-*` CSS variables.
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
          <span style={{ fontSize: 12, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>to</span>
          <input
            type="date"
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
          <span style={{ fontSize: 12, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>-</span>
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

// Easing and duration pulled from design-system personality tokens so each
// tenant's animation feel is preserved. The fallback values match a smooth
// deceleration curve and 300ms entrance, suitable for most brands.
const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

/**
 * Rustic FilterPanel using only inline styles and `--ds-*` CSS variables.
 * Supports inline, stacked, and sidebar layouts with active filter chips,
 * collapsible sections, and animated transitions.
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

  // Base button style for action buttons (Apply, Reset).
  const btnBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 'var(--ds-radius-sm, 4px)',
    fontSize: 13,
    cursor: 'pointer',
    border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
    background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
    color: 'var(--ds-color-text-primary, var(--ds-color-text))',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  };

  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    background: 'var(--ds-color-primary)',
    color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
    border: 'none',
  };

  // Compute active filters for chip rendering. A filter is "active" when
  // its value is non-null, non-empty-string, and non-empty-array. This
  // avoids showing chips for cleared or default-state filters.
  const activeChipValues = Object.entries(values).filter(([, v]) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0));

  return (
    <div
      className={className}
      style={{
        ...(isSidebar ? { borderRight: '1px solid var(--ds-color-border-primary, var(--ds-color-border))', paddingRight: 16 } : {}),
        ...style,
      }}
    >
      {/* Injected keyframes for the collapsible slide-down animation.
          Defined inline because the rustic engine avoids external stylesheets
          and CSS-in-JS libraries entirely. */}
      <style>{`@keyframes ds-filter-slide-down { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {(title || collapsible) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {collapsible && (
            <button
              style={{ ...btnBase, padding: '2px 8px', fontSize: 12, transition: `transform ${RUSTIC_DURATION} ${RUSTIC_EASING}` }}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? '+' : '-'}
            </button>
          )}
          {title && (
            <span style={{
              fontWeight: 'var(--ds-typography-heading-font-weight, 600)' as unknown as number,
              fontSize: 14,
              letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
              color: 'var(--ds-color-text-primary, var(--ds-color-text))',
            }}>
              {title}
            </span>
          )}
          {activeCount != null && activeCount > 0 && (
            <span
              style={{
                background: 'var(--ds-color-primary)',
                color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
                borderRadius: 'var(--ds-badge-radius, 10px)',
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
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 'var(--ds-radius-full, 9999px)',
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'var(--ds-color-primary-50, var(--ds-color-bg-muted))',
                  color: 'var(--ds-color-primary-700, var(--ds-color-primary))',
                  border: '1px solid var(--ds-color-primary-200, var(--ds-color-border-primary))',
                  cursor: 'pointer',
                  transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
                }}
                onClick={() => handleChange(key, undefined)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                {filter.label}
                <span style={{ fontSize: 14, lineHeight: 1, marginLeft: 2 }}>x</span>
              </span>
            );
          })}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 16, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
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
              <div key={filter.key} style={{ minWidth: isInline ? 180 : undefined }}>
                <div
                  style={{
                    marginBottom: 4,
                    fontWeight: 500,
                    fontSize: 13,
                    letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
                    textTransform: 'var(--ds-typography-label-transform, none)' as React.CSSProperties['textTransform'],
                    color: 'var(--ds-color-text-primary, var(--ds-color-text))',
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
              {/* Reset button uses transparent styling at rest and
                  transitions to a primary tint on hover via direct DOM
                  manipulation because CSS :hover cannot conditionally
                  reference token variables in an inline-only engine. */}
              {showReset && (
                <button
                  style={{ ...btnBase, border: '1px solid transparent', background: 'transparent' }}
                  onClick={onReset}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = 'var(--ds-color-primary)';
                    el.style.background = 'var(--ds-color-primary-50, var(--ds-color-bg-muted))';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = 'var(--ds-color-text-primary, var(--ds-color-text))';
                    el.style.background = 'transparent';
                  }}
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
