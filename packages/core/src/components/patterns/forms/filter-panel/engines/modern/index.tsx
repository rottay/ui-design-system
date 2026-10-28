'use client';

/**
 * @fileoverview Modern engine for the FilterPanel pattern.
 * Renders a configurable panel of filter controls by COMPOSING public DS
 * primitives (Select / Input / InputNumber / Toggle / Checkbox / Button /
 * Badge / Spinner) — the pattern never recreates an input, button, badge or
 * spinner with its own HTML/CSS. Layout geometry and the pattern's own paint
 * live in the unlayered modern filter-panel skin (no DaisyUI, no Tailwind),
 * keyed on the `data-part`/`data-*` contract this file stamps.
 *
 * The pattern is domain-agnostic: it ships zero business copy. Its own
 * labels (Apply / Clear all / collapse aria-labels / range separator /
 * range placeholders / select placeholder) resolve through the optional
 * `components` i18n channel with an English floor, and option descriptions
 * render only when the consumer supplies them.
 *
 * The skin consumes these design-system custom properties:
 * - Surfaces: --ds-surface-highlight
 * - Borders: --ds-color-border
 * - Radius: --ds-radius-sm
 * - Spacing: --ds-spacing-2, --ds-spacing-3, --ds-spacing-4
 * - Motion: --ds-motion-fast, --ds-motion-normal, --ds-motion-ease-out
 * - Colors: --ds-color-text, --ds-color-text-muted, --ds-color-error
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

import React, { useId, useState } from 'react';
import type { FilterPanelProps } from '../../contracts';
import type { FilterDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
import { StatusNeutralIcon } from '@/graphics/icons/semantic/generated/roles/status-neutral';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { NavigationDownIcon } from '@/graphics/icons/semantic/generated/roles/navigation-down';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import ModernToggle from '../../../../../primitives/inputs/toggle/engines/modern';
import ModernCheckbox from '../../../../../primitives/inputs/checkbox/engines/modern';
import ModernSelect from '../../../../../primitives/inputs/select/engines/modern';
import ModernInput from '../../../../../primitives/inputs/input/engines/modern';
import ModernInputNumber from '../../../../../primitives/inputs/input-number/engines/modern';
import ModernButton from '../../../../../primitives/inputs/button/engines/modern';
import ModernBadge from '../../../../../primitives/display/badge/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/spinner/engines/modern';

/* ---------------------------------------------------------------------------
 * Shared constants
 * ----------------------------------------------------------------------- */

const ROOT_CLASS_NAME = 'ds-pattern-filter-panel ds-engine-modern';

/** Own-copy channel resolved once per render (see the component). */
interface FilterPanelCopy {
  apply: string;
  clearAll: string;
  collapse: string;
  expand: string;
  rangeTo: string;
  rangeStart: string;
  rangeEnd: string;
  min: string;
  max: string;
  selectPlaceholder: string;
}

type FilterOption = NonNullable<FilterDef['options']>[number];

/** Maps the pattern's number-or-empty range vocabulary onto the composed
 *  InputNumber's `number | null` contract ('' and undefined both mean empty). */
function toNumberInputValue(value: unknown): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function renderOptionIcon(option: FilterOption) {
  if (option.icon) return option.icon;

  return (
    <span
      aria-hidden
      className="ds-pattern-filter-panel__option-icon"
      data-part="option-icon-badge"
      data-tone={option.tone ?? 'neutral'}
    >
      <StatusNeutralIcon decorative size={13} />
    </span>
  );
}

function enrichFilterOption(option: FilterOption) {
  return {
    value: option.value,
    label: option.label,
    disabled: option.disabled,
    icon: renderOptionIcon(option),
    // The pattern ships zero business copy: option descriptions render only
    // when the consumer supplies them.
    description: option.description,
  };
}

/* ---------------------------------------------------------------------------
 * Filter controls — every control is a composed public DS primitive. The
 * `data-part='input'` slot marks the control's geometry slot for the skin
 * (and the panel's anatomy contract); the primitive inside owns its chrome.
 * ----------------------------------------------------------------------- */

function renderFilterControl(
  filter: FilterDef,
  value: unknown,
  onChange: (key: string, val: unknown) => void,
  copy: FilterPanelCopy,
) {
  switch (filter.type) {
    case 'text':
      return (
        <div data-part="input">
          <ModernInput
            size="sm"
            type="text"
            placeholder={filter.placeholder}
            value={(value as string) ?? ''}
            onChange={(val) => onChange(filter.key, val)}
            aria-label={filter.label}
          />
        </div>
      );
    case 'select':
      return (
        /* The input slot marks the select's geometry for the skin (inline
           width drained from the old inline `style`). */
        <div data-part="input">
          <ModernSelect
            size="sm"
            forceCustomDropdown
            placeholder={filter.placeholder ?? copy.selectPlaceholder}
            value={(value as string) ?? undefined}
            onChange={(val) => onChange(filter.key, val || undefined)}
            options={filter.options?.map((option) => enrichFilterOption(option)) ?? []}
            allowClear
            aria-label={filter.label}
          />
        </div>
      );
    case 'multi-select':
      return (
        <div data-part="option-group" role="group" aria-label={filter.label}>
          {filter.options?.map((o) => {
            const checked = ((value as string[]) ?? []).includes(o.value);
            return (
              <ModernCheckbox
                key={o.value}
                size="sm"
                checked={checked}
                label={o.label}
                onChange={() => {
                  const arr = (value as string[]) ?? [];
                  const next = checked
                    ? arr.filter((v) => v !== o.value)
                    : [...arr, o.value];
                  onChange(filter.key, next);
                }}
              />
            );
          })}
        </div>
      );
    case 'boolean':
      return (
        <ModernToggle
          size="sm"
          checked={!!value}
          onChange={(checked) => onChange(filter.key, checked)}
          aria-label={filter.label}
        />
      );
    case 'date':
      return (
        <div data-part="input">
          <ModernInput
            size="sm"
            type="date"
            value={(value as string) ?? ''}
            onChange={(val) => onChange(filter.key, val)}
            aria-label={filter.label}
          />
        </div>
      );
    case 'date-range': {
      const range = (value as [string, string]) ?? ['', ''];
      return (
        /* The group carries the field name; each bound carries its own
           standalone label — two unnamed date inputs were indistinguishable. */
        <div data-part="range-group" role="group" aria-label={filter.label}>
          <div data-part="input">
            <ModernInput
              size="sm"
              type="date"
              value={range[0] ?? ''}
              onChange={(val) => onChange(filter.key, [val, range[1]])}
              aria-label={copy.rangeStart}
            />
          </div>
          <span data-part="range-separator">{copy.rangeTo}</span>
          <div data-part="input">
            <ModernInput
              size="sm"
              type="date"
              value={range[1] ?? ''}
              onChange={(val) => onChange(filter.key, [range[0], val])}
              aria-label={copy.rangeEnd}
            />
          </div>
        </div>
      );
    }
    case 'number':
      return (
        <div data-part="input">
          <ModernInputNumber
            size="sm"
            controls={false}
            placeholder={filter.placeholder}
            value={toNumberInputValue(value)}
            onChange={(val) => onChange(filter.key, val == null ? undefined : Number(val))}
            aria-label={filter.label}
          />
        </div>
      );
    case 'number-range': {
      const range = (value as [number | '', number | '']) ?? ['', ''];
      return (
        /* The group carries the field name; each bound carries its own
           standalone label — never a concatenation of translated fragments. */
        <div data-part="range-group" role="group" aria-label={filter.label}>
          <div data-part="input">
            <ModernInputNumber
              size="sm"
              controls={false}
              placeholder={copy.min}
              value={toNumberInputValue(range[0])}
              onChange={(val) => onChange(filter.key, [val == null ? undefined : Number(val), range[1]])}
              aria-label={copy.min}
            />
          </div>
          {/* The separator is read aloud between the bounds, so it rides the
              i18n channel like the date range's — never a bare hyphen. */}
          <span data-part="range-separator">{copy.rangeTo}</span>
          <div data-part="input">
            <ModernInputNumber
              size="sm"
              controls={false}
              placeholder={copy.max}
              value={toNumberInputValue(range[1])}
              onChange={(val) => onChange(filter.key, [range[0], val == null ? undefined : Number(val)])}
              aria-label={copy.max}
            />
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

/* ---------------------------------------------------------------------------
 * ModernFilterPanel
 * ----------------------------------------------------------------------- */

/**
 * Modern FilterPanel.
 * Supports inline, stacked, and sidebar layouts with optional collapse,
 * active filter count badge, and clear-all / apply buttons.
 *
 * Behavior and the `data-part`/`data-*` contract live here; ALL geometry and
 * paint live in the unlayered modern filter-panel skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/filter-panel/index.css`).
 * Interactive chrome (inputs, buttons, badge, spinner) is composed from the
 * public DS primitives, which own their own skins and state contracts.
 *
 * @param props - See {@link FilterPanelProps} for full prop documentation.
 * @returns A filter panel composed of DS primitives with configurable layout.
 */
export default function ModernFilterPanel(props: FilterPanelProps) {
  // Optional channel with an English floor: the panel renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string): string => i18n?.tOr(key, floor) ?? floor;
  const copy: FilterPanelCopy = {
    apply: tOr('filter_panel.apply', 'Apply'),
    clearAll: tOr('filter_panel.clear_all', 'Clear all'),
    collapse: tOr('filter_panel.collapse', 'Collapse filters'),
    expand: tOr('filter_panel.expand', 'Expand filters'),
    rangeTo: tOr('filter_panel.range_to', 'to'),
    rangeStart: tOr('filter_panel.range_start', 'From'),
    rangeEnd: tOr('filter_panel.range_end', 'To'),
    min: tOr('filter_panel.min', 'Min'),
    max: tOr('filter_panel.max', 'Max'),
    selectPlaceholder: tOr('filter_panel.select_placeholder', 'Select...'),
  };

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
  const contentId = `${useId()}content`;

  const handleChange = (key: string, val: unknown) => {
    onChange({ ...values, [key]: val });
  };

  const isInline = layout === 'inline';
  const isSidebar = layout === 'sidebar';
  const isCollapsed = collapsible && collapsed;
  // `showReset`/`showApply` only paint when their handler exists; a
  // handler-less control would swallow every click.
  const canReset = showReset && !!onReset;
  const canApply = showApply && !!onApply;

  /* -- Filter content area (geometry is skin-owned, keyed on data-layout) -- */
  const filterContent = (
    <div data-part="fields" data-layout={isInline ? 'inline' : 'stacked'}>
      {filters.map((filter) => (
        <div key={filter.key} data-part="field-row">
          <span data-part="field-label">{filter.label}</span>
          <div data-part="field-control">
            {renderFilterControl(filter, values[filter.key], handleChange, copy)}
          </div>
        </div>
      ))}
    </div>
  );

  /* -- Loading state: the composed Spinner primitive owns ring and cadence -- */
  if (loading) {
    return (
      <div
        className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="true"
        style={style}
      >
        <ModernSpinner size="sm" />
      </div>
    );
  }

  return (
    <div
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      data-part="root"
      data-sidebar={isSidebar ? 'true' : 'false'}
      style={style}
    >
      {/* Header: title, collapse toggle, active count badge, clear all */}
      {(title || collapsible || (activeCount != null && activeCount > 0) || canReset) && (
        <div
          data-part="header"
          data-collapsed={isCollapsed ? 'true' : 'false'}
        >
          <div data-part="title-group">
            {collapsible && (
              <ModernButton
                variant="ghost"
                size="sm"
                className="ds-pattern-filter-panel__collapse-toggle"
                data-collapsed={collapsed ? 'true' : 'false'}
                icon={<NavigationDownIcon decorative size={14} />}
                onClick={() => setCollapsed(!collapsed)}
                aria-expanded={!collapsed}
                aria-controls={contentId}
                aria-label={collapsed ? copy.expand : copy.collapse}
              />
            )}
            {title && (
              <span data-part="title">{title}</span>
            )}
            {activeCount != null && activeCount > 0 && (
              /* A bare numeral announced as "6" with no subject; the count
                 needs its own name to mean anything out of visual context. */
              <ModernBadge
                count={activeCount}
                variant="primary"
                size="xs"
                aria-label={tOr('filter_panel.active_count', 'Active filters')}
              />
            )}
          </div>

          {/* Clear all -- ghost button, right-aligned in header */}
          {canReset && !isCollapsed && (
            <ModernButton
              variant="ghost"
              size="sm"
              className="ds-pattern-filter-panel__reset-button"
              icon={<ActionCloseIcon decorative size={12} />}
              onClick={onReset}
            >
              {copy.clearAll}
            </ModernButton>
          )}
        </div>
      )}

      {/* Collapsible content area: the skin owns the max-block-size/opacity
          transition keyed on data-collapsed. */}
      {/* A zero-height clip is paint only: every collapsed filter stayed in the
          tab order and in the AT tree. `inert` removes both at the source. */}
      <div
        id={contentId}
        data-part="content"
        data-collapsed={isCollapsed ? 'true' : 'false'}
        inert={isCollapsed}
        aria-hidden={isCollapsed ? 'true' : undefined}
      >
        {filterContent}

        {/* Action buttons: Apply */}
        {canApply && (
          <div data-part="actions">
            <ModernButton
              variant="primary"
              size="sm"
              className="ds-pattern-filter-panel__apply-button"
              onClick={() => onApply?.(values)}
            >
              {copy.apply}
            </ModernButton>
          </div>
        )}
      </div>
    </div>
  );
}
