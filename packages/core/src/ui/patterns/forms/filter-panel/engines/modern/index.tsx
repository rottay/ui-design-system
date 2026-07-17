'use client';

/**
 * @fileoverview Modern engine for the FilterPanel pattern.
 * Renders a configurable panel of filter controls with inline layout and paint
 * driven by the unlayered modern filter-panel skin (no DaisyUI, no Tailwind).
 * Supports inline (toolbar), stacked, and sidebar layouts, an optional
 * collapsible header with smooth transition, an active-filter count badge, and
 * Apply/Reset action buttons.
 *
 * The skin consumes these design-system custom properties:
 * - Surfaces: --ds-surface-card, --ds-surface-highlight, --ds-surface-inset
 * - Borders: --ds-color-border
 * - Radius: --ds-radius-sm, --ds-radius-md
 * - Motion: --ds-motion-fast, --ds-motion-normal, --ds-motion-ease-out
 * - Focus: --ds-focus-ring-width, --ds-focus-ring-color
 * - Colors: --ds-color-primary, --ds-color-text, --ds-color-text-muted, --ds-color-error
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

import React, { useRef, useState } from 'react';
import type { FilterPanelProps } from '../../contracts';
import type { FilterDef } from '../../../../../../foundation/contracts/runtime/components/patterns/core';
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Layers3,
  MapPin,
  Route,
  ShieldCheck,
  Target,
  UserRound,
  UsersRound,
  XCircle,
} from 'lucide-react';
import ModernSwitch from '../../../../../primitives/inputs/Switch/engines/modern';
import ModernCheckbox from '../../../../../primitives/inputs/Checkbox/engines/modern';
import ModernSelect from '../../../../../primitives/inputs/Select/engines/modern';

/* ---------------------------------------------------------------------------
 * Shared inline-style constants
 * ----------------------------------------------------------------------- */

const baseInputStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: 13,
  lineHeight: '20px',
  width: '100%',
  boxSizing: 'border-box' as const,
  transition: `border-color var(--ds-motion-fast) var(--ds-motion-ease-out),
               box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out)`,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 4,
  lineHeight: '16px',
};

const inlineLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const ROOT_CLASS_NAME = 'ds-pattern-filter-panel ds-engine-modern';

type FilterOption = NonNullable<FilterDef['options']>[number];
type FilterOptionTone = NonNullable<FilterOption['tone']>;
type FilterIconComponent = React.ComponentType<{ size?: number; strokeWidth?: number }>;

function SlidersFallbackIcon({ size = 14, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21v-7" />
      <path d="M4 10V3" />
      <path d="M12 21v-9" />
      <path d="M12 8V3" />
      <path d="M20 21v-5" />
      <path d="M20 12V3" />
      <path d="M2 14h4" />
      <path d="M10 8h4" />
      <path d="M18 16h4" />
    </svg>
  );
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

  if (/(cancel|reject|failed|blocked|closed|no hire|no show)/.test(token)) return XCircle;
  if (/(needs|missing|gap|risk|urgent|overdue|unassigned|unscored|attention)/.test(token)) return AlertTriangle;
  if (/(ready|scored|completed|active|accepted|approved|hired|published|attached|assigned|clear)/.test(token)) return CheckCircle2;
  if (/(score|evidence|debrief|readiness|review|decision)/.test(token)) return ClipboardCheck;
  if (/(date|time|deadline|schedule|scheduled|clock|cadence|recent)/.test(token)) return CalendarClock;
  if (/(owner|interviewer|recruiter|team|squad|panel|candidate)/.test(token)) return UsersRound;
  if (/(person|user|requester|referrer|employee)/.test(token)) return UserRound;
  if (/(job|role|position|department|business unit|client|company)/.test(token)) return BriefcaseBusiness;
  if (/(location|market|remote|hybrid|onsite|on site)/.test(token)) return MapPin;
  if (/(route|meeting|link)/.test(token)) return Route;
  if (/(priority|target|fit|match|confidence)/.test(token)) return Target;
  if (/(status|stage|type|workflow|category)/.test(token)) return Layers3;
  if (/(sla|security|approval|compliance|guard)/.test(token)) return ShieldCheck;
  if (/(pending|draft|open|paused)/.test(token)) return Clock3;

  return CircleDot;
}

function inferOptionDescription(filter: FilterDef, option: FilterOption): React.ReactNode {
  if (option.description) return option.description;

  const key = normalizeFilterToken(filter.key);
  const label = normalizeFilterToken(filter.label);
  const value = normalizeFilterToken(option.value);
  const optionLabel = normalizeFilterToken(option.label);
  const token = `${key} ${label} ${value} ${optionLabel}`;

  if (/system design/.test(token)) return 'Architecture loops and senior technical calibration.';
  if (/(technical|coding|engineering)/.test(token)) return 'Hands-on technical signal and reviewer alignment.';
  if (/(behavioral|culture|cultural|values)/.test(token)) return 'People, collaboration, and role-fit signal.';
  if (/(screen|screening|intro)/.test(token)) return 'Early qualification and next-step readiness.';
  if (/(final round|onsite|on site|panel)/.test(token)) return 'Late-stage panel coverage and decision evidence.';
  if (/(remote|hybrid|onsite|on site|market|location)/.test(token)) return 'Location and work-mode slice for routing decisions.';
  if (/(linkedin|referral|agency|job board|direct|website|source|channel)/.test(token)) return 'Origin channel for quality and attribution analysis.';
  if (/(urgent|critical|high priority|priority)/.test(token)) return 'Escalated demand that should surface before routine work.';
  if (/(draft|not live|unpublished)/.test(token)) return 'Needs setup before it can drive candidate movement.';
  if (/(published|live|open)/.test(token)) return 'Visible demand that can create candidate movement.';
  if (/(paused|closed|archived|inactive)/.test(token)) return 'Removed from active operating flow.';
  if (/(accepted|approved|hired|completed|complete)/.test(token)) return 'Completed path with usable downstream evidence.';
  if (/(declined|rejected|cancelled|canceled|failed)/.test(token)) return 'Closed out with no forward movement expected.';
  if (/(missing|gap|risk|overdue|blocked|needs attention)/.test(token)) return 'Needs owner action before the queue is healthy.';
  if (/(assigned|attached|mapped|covered)/.test(token)) return 'Ownership and handoff are visible.';
  if (/(unassigned|unattached|no owner)/.test(token)) return 'No accountable owner is visible yet.';
  if (key.includes('type') || label.includes('type')) return 'Filter by loop, record, or operating type.';
  if (key.includes('score') || label.includes('score')) {
    if (/unscored|needs/.test(token)) return 'Needs evidence before review.';
    if (/scored|ready|complete/.test(token)) return 'Has reviewable signal.';
    return 'Score and evidence posture.';
  }
  if (key.includes('readiness') || label.includes('readiness')) return 'Show records by action readiness.';
  if (key.includes('route') || label.includes('route')) return 'Meeting link or location handoff state.';
  if (key.includes('owner') || label.includes('owner') || key.includes('panel') || label.includes('panel')) {
    return 'Accountability and coverage state.';
  }
  if (key.includes('debrief') || label.includes('debrief') || key.includes('decision') || label.includes('decision')) {
    return 'Decision workspace and follow-up state.';
  }
  if (key.includes('status') || label.includes('status') || key.includes('stage') || label.includes('stage')) {
    return 'Current lifecycle state.';
  }
  if (key.includes('priority') || label.includes('priority')) return 'Operating urgency and escalation level.';
  if (key.includes('source') || label.includes('source') || key.includes('channel') || label.includes('channel')) {
    return 'Origin channel or intake source.';
  }
  if (key.includes('location') || key.includes('market') || label.includes('location') || label.includes('market')) {
    return 'Market, location, or work-mode slice.';
  }
  if (/system design|technical|behavioral|culture|screen|panel/.test(token)) {
    return 'Interview format for reviewer alignment.';
  }

  return `Only records matching ${filter.label.toLowerCase()}.`;
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
      style={{
        width: 22,
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={13} strokeWidth={2.2} />
    </span>
  );
}

function enrichFilterOption(filter: FilterDef, option: FilterOption) {
  return {
    value: option.value,
    label: option.label,
    disabled: option.disabled,
    icon: renderOptionIcon(filter, option),
    description: inferOptionDescription(filter, option),
  };
}

/* ---------------------------------------------------------------------------
 * Filter controls
 * ----------------------------------------------------------------------- */

/**
 * Renders the appropriate native HTML form control for a given filter
 * definition, styled with pure DS token inline styles.
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
          style={baseInputStyle}
          placeholder={filter.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}        />
      );
    case 'select':
      return (
        <ModernSelect
          size="sm"
          forceCustomDropdown
          placeholder={filter.placeholder ?? 'Select...'}
          value={(value as string) ?? undefined}
          onChange={(val) => onChange(filter.key, val || undefined)}
          options={filter.options?.map((option) => enrichFilterOption(filter, option)) ?? []}
          allowClear
          style={{ width: '100%' }}
        />
      );
    case 'multi-select':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
        <input
          type="date"
          data-part="input"
          style={baseInputStyle}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}        />
      );
    case 'date-range': {
      const range = (value as [string, string]) ?? ['', ''];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="date"
            data-part="input"
            style={{ ...baseInputStyle, flex: 1 }}
            value={range[0] ?? ''}
            onChange={(e) => onChange(filter.key, [e.target.value, range[1]])}          />
          <span
            data-part="range-separator"
            style={{
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            to
          </span>
          <input
            type="date"
            data-part="input"
            style={{ ...baseInputStyle, flex: 1 }}
            value={range[1] ?? ''}
            onChange={(e) => onChange(filter.key, [range[0], e.target.value])}          />
        </div>
      );
    }
    case 'number':
      return (
        <input
          type="number"
          data-part="input"
          style={baseInputStyle}
          placeholder={filter.placeholder}
          value={(value as number | '') ?? ''}
          onChange={(e) =>
            onChange(
              filter.key,
              e.target.value === '' ? undefined : Number(e.target.value),
            )
          }        />
      );
    case 'number-range': {
      const range = (value as [number | '', number | '']) ?? ['', ''];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            data-part="input"
            style={{ ...baseInputStyle, flex: 1 }}
            placeholder="Min"
            value={range[0] ?? ''}
            onChange={(e) =>
              onChange(filter.key, [
                e.target.value === '' ? undefined : Number(e.target.value),
                range[1],
              ])
            }          />
          <span
            data-part="range-separator"
            style={{
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            -
          </span>
          <input
            type="number"
            data-part="input"
            style={{ ...baseInputStyle, flex: 1 }}
            placeholder="Max"
            value={range[1] ?? ''}
            onChange={(e) =>
              onChange(filter.key, [
                range[0],
                e.target.value === '' ? undefined : Number(e.target.value),
              ])
            }          />
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
 * Layout and behavior use inline styles and CSS custom properties; paint
 * (color, background, border, box-shadow, and the input focus + reset hover
 * states) is driven by the unlayered modern filter-panel skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/filter-panel.css`), keyed on the
 * `data-part`/`data-*` contract this file stamps.
 *
 * @param props - See {@link FilterPanelProps} for full prop documentation.
 * @returns A DS-token-styled filter panel with configurable layout.
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
  const contentRef = useRef<HTMLDivElement>(null);

  const handleChange = (key: string, val: unknown) => {
    onChange({ ...values, [key]: val });
  };

  const isInline = layout === 'inline';
  const isSidebar = layout === 'sidebar';

  /* -- Filter content area -- */
  const filterContent = (
    <div
      style={
        isInline
          ? {
              display: 'flex',
              flexWrap: 'var(--ds-filter-panel-inline-wrap, wrap)' as React.CSSProperties['flexWrap'],
              gap: 10,
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
              overflow: 'visible',
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }
      }
    >
      {filters.map((filter) => (
        <div
          key={filter.key}
          data-part="field-row"
          style={
            isInline
              ? {
                  flex: 'var(--ds-filter-panel-inline-flex, 1 1 268px)',
                  minWidth: 'var(--ds-filter-panel-inline-min-width, 196px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  position: 'relative',
                  zIndex: 1,
                }
              : undefined
          }
        >
          <span data-part="field-label" style={isInline ? inlineLabelStyle : labelStyle}>{filter.label}</span>
          <div
            style={
              isInline
                ? {
                    flex: '1 1 var(--ds-filter-panel-inline-control-width, 0px)',
                    minWidth: 0,
                  }
                : undefined
            }
          >
            {renderFilterControl(filter, values[filter.key], handleChange)}
          </div>
        </div>
      ))}
    </div>
  );

  /* -- Loading spinner -- */
  if (loading) {
    return (
      <div
        className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
        data-part="root"
        data-loading="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 0',
          ...style,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          data-part="loading-spinner"
          style={{
            animation: 'ds-filter-spin 1s linear infinite',
          }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray="60 30"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  /* -- Root container -- */
  const rootStyle: React.CSSProperties = {
    ...(isSidebar
      ? {
          paddingRight: 16,
        }
      : {}),
    ...style,
  };

  return (
    <div
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      data-part="root"
      data-sidebar={isSidebar ? 'true' : 'false'}
      style={rootStyle}
    >
      {/* Header: title, collapse toggle, active count badge, clear all */}
      {(title || collapsible || (activeCount != null && activeCount > 0) || showReset) && (
        <div
          data-part="header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: !(collapsible && collapsed) ? 12 : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {collapsible && (
              <button
                type="button"
                data-part="collapse-toggle"
                data-collapsed={collapsed ? 'true' : 'false'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  padding: 0,
                  cursor: 'pointer',
                  transition: `transform var(--ds-motion-fast) var(--ds-motion-ease-out),
                               background var(--ds-motion-fast) var(--ds-motion-ease-out)`,
                }}
                onClick={() => setCollapsed(!collapsed)}
                aria-expanded={!collapsed}
                aria-label={collapsed ? 'Expand filters' : 'Collapse filters'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            )}
            {title && (
              <span
                data-part="title"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {title}
              </span>
            )}
            {activeCount != null && activeCount > 0 && (
              <span
                data-part="active-count-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 18,
                  height: 18,
                  padding: '0 5px',
                  fontSize: 11,
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {activeCount}
              </span>
            )}
          </div>

          {/* Clear all -- ghost button, right-aligned in header */}
          {showReset && !(collapsible && collapsed) && (
            <button
              type="button"
              data-part="reset-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: `color var(--ds-motion-fast) var(--ds-motion-ease-out),
                             background var(--ds-motion-fast) var(--ds-motion-ease-out)`,
              }}
              onClick={onReset}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Collapsible content area with smooth height transition */}
      <div
        ref={contentRef}
        data-part="content"
        style={{
          overflow: 'hidden',
          transition: `max-height var(--ds-motion-normal) var(--ds-motion-ease-out),
                       opacity var(--ds-motion-normal) var(--ds-motion-ease-out)`,
          maxHeight: collapsible && collapsed ? 0 : 2000,
          opacity: collapsible && collapsed ? 0 : 1,
        }}
      >
        {filterContent}

        {/* Action buttons: Apply */}
        {showApply && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 12,
            }}
          >
            <button
              type="button"
              data-part="apply-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: `opacity var(--ds-motion-fast) var(--ds-motion-ease-out)`,
              }}
              onClick={() => onApply?.(values)}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
