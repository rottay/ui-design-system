'use client';

/**
 * @fileoverview Modern engine for the FilterPanel pattern.
 * Renders a configurable panel of filter controls by COMPOSING public DS
 * primitives (Select / Input / InputNumber / Switch / Checkbox / Button /
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

import React, { useState } from 'react';
import type { FilterPanelProps } from '../../contracts';
import type { FilterDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
/* Option-icon heuristics route through the governed semantic-icon facade
   (generated roles) — never raw glyph imports or local SVG. */
import { ComplianceReviewIcon } from '@/graphics/icons/presentation/semantic/generated/roles/compliance-review';
import { EntityGroupIcon } from '@/graphics/icons/presentation/semantic/generated/roles/entity-group';
import { EntityOrganizationIcon } from '@/graphics/icons/presentation/semantic/generated/roles/entity-organization';
import { EntityPersonIcon } from '@/graphics/icons/presentation/semantic/generated/roles/entity-person';
import { LayoutHierarchyIcon } from '@/graphics/icons/presentation/semantic/generated/roles/layout-hierarchy';
import { LocationPlaceIcon } from '@/graphics/icons/presentation/semantic/generated/roles/location-place';
import { NavigationRouteIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-route';
import { OperationsTargetIcon } from '@/graphics/icons/presentation/semantic/generated/roles/operations-target';
import { SecurityProtectionIcon } from '@/graphics/icons/presentation/semantic/generated/roles/security-protection';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { StatusNeutralIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-neutral';
import { StatusPendingIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-pending';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { TimeScheduleIcon } from '@/graphics/icons/presentation/semantic/generated/roles/time-schedule';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import ModernSwitch from '../../../../../primitives/inputs/Switch/engines/modern';
import ModernCheckbox from '../../../../../primitives/inputs/Checkbox/engines/modern';
import ModernSelect from '../../../../../primitives/inputs/Select/engines/modern';
import ModernInput from '../../../../../primitives/inputs/Input/engines/modern';
import ModernInputNumber from '../../../../../primitives/inputs/InputNumber/engines/modern';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernBadge from '../../../../../primitives/display/Badge/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';

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
  min: string;
  max: string;
  selectPlaceholder: string;
}

type FilterOption = NonNullable<FilterDef['options']>[number];
type FilterOptionTone = NonNullable<FilterOption['tone']>;
type FilterIconComponent = typeof StatusNeutralIcon;

/** Maps the pattern's number-or-empty range vocabulary onto the composed
 *  InputNumber's `number | null` contract ('' and undefined both mean empty). */
function toNumberInputValue(value: unknown): number | null {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeFilterToken(value: unknown): string {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function inferOptionTone(filter: FilterDef, option: FilterOption): FilterOptionTone {
  if (option.tone) return option.tone;

  const token = `${normalizeFilterToken(filter.key)} ${normalizeFilterToken(filter.label)} ${normalizeFilterToken(option.value)} ${normalizeFilterToken(option.label)}`;

  if (/(cancel|cancelled|canceled|reject|rejected|failed|no hire|no show|blocked|closed)/.test(token)) return 'danger';
  if (/(needs|missing|gap|risk|urgent|overdue|pending|draft|unassigned|unscored|attention|paused)/.test(token)) return 'warning';
  if (/(ready|scored|completed|complete|active|accepted|approved|hired|published|attached|assigned|healthy|clear)/.test(token)) return 'success';
  if (/(scheduled|open|live|available|route|system design|technical|screen)/.test(token)) return 'primary';
  if (/(remote|hybrid|onsite|on site|market|location|source|channel)/.test(token)) return 'info';

  return 'neutral';
}

function inferOptionIcon(filter: FilterDef, option: FilterOption): FilterIconComponent {
  const token = `${normalizeFilterToken(filter.key)} ${normalizeFilterToken(filter.label)} ${normalizeFilterToken(option.value)} ${normalizeFilterToken(option.label)}`;

  if (/(cancel|reject|failed|blocked|closed|no hire|no show)/.test(token)) return StatusErrorIcon;
  if (/(needs|missing|gap|risk|urgent|overdue|unassigned|unscored|attention)/.test(token)) return StatusWarningIcon;
  if (/(ready|scored|completed|active|accepted|approved|hired|published|attached|assigned|clear)/.test(token)) return StatusSuccessIcon;
  if (/(score|evidence|debrief|readiness|review|decision)/.test(token)) return ComplianceReviewIcon;
  if (/(date|time|deadline|schedule|scheduled|clock|cadence|recent)/.test(token)) return TimeScheduleIcon;
  if (/(owner|interviewer|recruiter|team|squad|panel|candidate)/.test(token)) return EntityGroupIcon;
  if (/(person|user|requester|referrer|employee)/.test(token)) return EntityPersonIcon;
  if (/(job|role|position|department|business unit|client|company)/.test(token)) return EntityOrganizationIcon;
  if (/(location|market|remote|hybrid|onsite|on site)/.test(token)) return LocationPlaceIcon;
  if (/(route|meeting|link)/.test(token)) return NavigationRouteIcon;
  if (/(priority|target|fit|match|confidence)/.test(token)) return OperationsTargetIcon;
  if (/(status|stage|type|workflow|category)/.test(token)) return LayoutHierarchyIcon;
  if (/(sla|security|approval|compliance|guard)/.test(token)) return SecurityProtectionIcon;
  if (/(pending|draft|open|paused)/.test(token)) return StatusPendingIcon;

  return StatusNeutralIcon;
}

function renderOptionIcon(filter: FilterDef, option: FilterOption) {
  if (option.icon) return option.icon;

  const tone = inferOptionTone(filter, option);
  const Icon = inferOptionIcon(filter, option);

  return (
    <span
      aria-hidden
      className="ds-pattern-filter-panel__option-icon"
      data-part="option-icon-badge"
      data-tone={tone}
    >
      <Icon decorative size={13} />
    </span>
  );
}

function enrichFilterOption(filter: FilterDef, option: FilterOption) {
  return {
    value: option.value,
    label: option.label,
    disabled: option.disabled,
    icon: renderOptionIcon(filter, option),
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
            options={filter.options?.map((option) => enrichFilterOption(filter, option)) ?? []}
            allowClear
          />
        </div>
      );
    case 'multi-select':
      return (
        <div data-part="option-group">
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
        <ModernSwitch
          size="small"
          checked={!!value}
          onChange={(checked) => onChange(filter.key, checked)}
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
          />
        </div>
      );
    case 'date-range': {
      const range = (value as [string, string]) ?? ['', ''];
      return (
        <div data-part="range-group">
          <div data-part="input">
            <ModernInput
              size="sm"
              type="date"
              value={range[0] ?? ''}
              onChange={(val) => onChange(filter.key, [val, range[1]])}
            />
          </div>
          <span data-part="range-separator">{copy.rangeTo}</span>
          <div data-part="input">
            <ModernInput
              size="sm"
              type="date"
              value={range[1] ?? ''}
              onChange={(val) => onChange(filter.key, [range[0], val])}
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
          />
        </div>
      );
    case 'number-range': {
      const range = (value as [number | '', number | '']) ?? ['', ''];
      return (
        <div data-part="range-group">
          <div data-part="input">
            <ModernInputNumber
              size="sm"
              controls={false}
              placeholder={copy.min}
              value={toNumberInputValue(range[0])}
              onChange={(val) => onChange(filter.key, [val == null ? undefined : Number(val), range[1]])}
            />
          </div>
          <span data-part="range-separator">-</span>
          <div data-part="input">
            <ModernInputNumber
              size="sm"
              controls={false}
              placeholder={copy.max}
              value={toNumberInputValue(range[1])}
              onChange={(val) => onChange(filter.key, [range[0], val == null ? undefined : Number(val)])}
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
 * (`foundation/tokens/css/runtime/engines/modern/skin/filter-panel.css`).
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

  const handleChange = (key: string, val: unknown) => {
    onChange({ ...values, [key]: val });
  };

  const isInline = layout === 'inline';
  const isSidebar = layout === 'sidebar';
  const isCollapsed = collapsible && collapsed;

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
        <ModernSpinner size="sm" data-part="loading-spinner" />
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
      {(title || collapsible || (activeCount != null && activeCount > 0) || showReset) && (
        <div
          data-part="header"
          data-collapsed={isCollapsed ? 'true' : 'false'}
        >
          <div data-part="title-group">
            {collapsible && (
              <ModernButton
                variant="ghost"
                size="sm"
                data-part="collapse-toggle"
                data-collapsed={collapsed ? 'true' : 'false'}
                icon={<NavigationDownIcon decorative size={14} />}
                onClick={() => setCollapsed(!collapsed)}
                aria-expanded={!collapsed}
                aria-label={collapsed ? copy.expand : copy.collapse}
              />
            )}
            {title && (
              <span data-part="title">{title}</span>
            )}
            {activeCount != null && activeCount > 0 && (
              <ModernBadge
                count={activeCount}
                variant="primary"
                size="xs"
                data-part="active-count-badge"
              />
            )}
          </div>

          {/* Clear all -- ghost button, right-aligned in header */}
          {showReset && !isCollapsed && (
            <ModernButton
              variant="ghost"
              size="sm"
              data-part="reset-button"
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
      <div
        data-part="content"
        data-collapsed={isCollapsed ? 'true' : 'false'}
      >
        {filterContent}

        {/* Action buttons: Apply */}
        {showApply && (
          <div data-part="actions">
            <ModernButton
              variant="primary"
              size="sm"
              data-part="apply-button"
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
