'use client';

/**
 * @fileoverview Modern engine for the FilterPanel pattern.
 * Renders a configurable panel of filter controls using pure DS token inline
 * styles (no DaisyUI, no Tailwind). Supports inline (toolbar), stacked, and
 * sidebar layouts, an optional collapsible header with smooth transition, an
 * active-filter count badge, and Apply/Reset action buttons.
 *
 * All styling uses CSS custom properties from the design system:
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
import type { FilterPanelProps } from '../FilterPanel.types';
import type { FilterDef } from '../../../foundation/types';
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
import ModernSwitch from '../../../../primitives/inputs/Switch/engines/modern';
import ModernCheckbox from '../../../../primitives/inputs/Checkbox/engines/modern';
import ModernSelect from '../../../../primitives/inputs/Select/engines/modern';

/* ---------------------------------------------------------------------------
 * Shared inline-style constants
 * ----------------------------------------------------------------------- */

const baseInputStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--ds-color-border)',
  borderRadius: 'var(--ds-radius-sm)',
  fontSize: 13,
  lineHeight: '20px',
  background: 'var(--ds-surface-inset)',
  color: 'inherit',
  width: '100%',
  boxSizing: 'border-box' as const,
  outline: 'none',
  transition: `border-color var(--ds-motion-fast) var(--ds-motion-ease-out),
               box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out)`,
};

const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'var(--ds-focus-ring-color)';
  e.currentTarget.style.boxShadow =
    '0 0 0 var(--ds-focus-ring-width) var(--ds-focus-ring-color)';
};

const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'var(--ds-color-border)';
  e.currentTarget.style.boxShadow = 'none';
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--ds-color-text-muted)',
  marginBottom: 4,
  lineHeight: '16px',
};

const inlineLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--ds-color-text-muted)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

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

const OPTION_TONE_STYLES: Record<FilterOptionTone, { color: string; bg: string; border: string }> = {
  neutral: {
    color: 'var(--ds-color-text-secondary)',
    bg: 'color-mix(in srgb, var(--ds-color-bg-primary) 64%, transparent)',
    border: 'color-mix(in srgb, var(--ds-color-border-secondary) 82%, transparent)',
  },
  primary: {
    color: 'var(--ds-color-primary)',
    bg: 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)',
    border: 'color-mix(in srgb, var(--ds-color-primary) 24%, transparent)',
  },
  success: {
    color: 'var(--ds-color-success)',
    bg: 'color-mix(in srgb, var(--ds-color-success) 10%, transparent)',
    border: 'color-mix(in srgb, var(--ds-color-success) 24%, transparent)',
  },
  warning: {
    color: 'var(--ds-color-warning)',
    bg: 'color-mix(in srgb, var(--ds-color-warning) 12%, transparent)',
    border: 'color-mix(in srgb, var(--ds-color-warning) 28%, transparent)',
  },
  danger: {
    color: 'var(--ds-color-error)',
    bg: 'color-mix(in srgb, var(--ds-color-error) 10%, transparent)',
    border: 'color-mix(in srgb, var(--ds-color-error) 24%, transparent)',
  },
  info: {
    color: 'var(--ds-color-info, var(--ds-color-primary))',
    bg: 'color-mix(in srgb, var(--ds-color-info, var(--ds-color-primary)) 10%, transparent)',
    border: 'color-mix(in srgb, var(--ds-color-info, var(--ds-color-primary)) 24%, transparent)',
  },
};

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
  const toneStyle = OPTION_TONE_STYLES[tone];
  const Icon = inferOptionIcon(filter, option);

  return (
    <span
      aria-hidden
      style={{
        width: 22,
        height: 22,
        borderRadius: 8,
        border: `1px solid ${toneStyle.border}`,
        background: toneStyle.bg,
        color: toneStyle.color,
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
          style={baseInputStyle}
          placeholder={filter.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
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
          style={baseInputStyle}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      );
    case 'date-range': {
      const range = (value as [string, string]) ?? ['', ''];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="date"
            style={{ ...baseInputStyle, flex: 1 }}
            value={range[0] ?? ''}
            onChange={(e) => onChange(filter.key, [e.target.value, range[1]])}
            onFocus={focusHandler}
            onBlur={blurHandler}
          />
          <span
            style={{
              fontSize: 12,
              color: 'var(--ds-color-text-muted)',
              flexShrink: 0,
            }}
          >
            to
          </span>
          <input
            type="date"
            style={{ ...baseInputStyle, flex: 1 }}
            value={range[1] ?? ''}
            onChange={(e) => onChange(filter.key, [range[0], e.target.value])}
            onFocus={focusHandler}
            onBlur={blurHandler}
          />
        </div>
      );
    }
    case 'number':
      return (
        <input
          type="number"
          style={baseInputStyle}
          placeholder={filter.placeholder}
          value={(value as number | '') ?? ''}
          onChange={(e) =>
            onChange(
              filter.key,
              e.target.value === '' ? undefined : Number(e.target.value),
            )
          }
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      );
    case 'number-range': {
      const range = (value as [number | '', number | '']) ?? ['', ''];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            style={{ ...baseInputStyle, flex: 1 }}
            placeholder="Min"
            value={range[0] ?? ''}
            onChange={(e) =>
              onChange(filter.key, [
                e.target.value === '' ? undefined : Number(e.target.value),
                range[1],
              ])
            }
            onFocus={focusHandler}
            onBlur={blurHandler}
          />
          <span
            style={{
              fontSize: 12,
              color: 'var(--ds-color-text-muted)',
              flexShrink: 0,
            }}
          >
            -
          </span>
          <input
            type="number"
            style={{ ...baseInputStyle, flex: 1 }}
            placeholder="Max"
            value={range[1] ?? ''}
            onChange={(e) =>
              onChange(filter.key, [
                range[0],
                e.target.value === '' ? undefined : Number(e.target.value),
              ])
            }
            onFocus={focusHandler}
            onBlur={blurHandler}
          />
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
 * Modern FilterPanel using pure DS token inline styles.
 * Supports inline, stacked, and sidebar layouts with optional collapse,
 * active filter count badge, and clear-all / apply buttons.
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
          <span style={isInline ? inlineLabelStyle : labelStyle}>{filter.label}</span>
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
        className={className}
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
          style={{
            animation: 'ds-filter-spin 1s linear infinite',
            color: 'var(--ds-color-primary)',
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
        <style>{`@keyframes ds-filter-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* -- Root container -- */
  const rootStyle: React.CSSProperties = {
    ...(isSidebar
      ? {
          borderRight: '1px solid var(--ds-color-border)',
          paddingRight: 16,
        }
      : {}),
    ...style,
  };

  return (
    <div className={className} style={rootStyle}>
      {/* Header: title, collapse toggle, active count badge, clear all */}
      {(title || collapsible || (activeCount != null && activeCount > 0) || showReset) && (
        <div
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
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 'var(--ds-radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--ds-color-text-muted)',
                  transition: `transform var(--ds-motion-fast) var(--ds-motion-ease-out),
                               background var(--ds-motion-fast) var(--ds-motion-ease-out)`,
                  transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
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
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--ds-color-text)',
                }}
              >
                {title}
              </span>
            )}
            {activeCount != null && activeCount > 0 && (
              <span
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
                  borderRadius: 9,
                  background: 'var(--ds-color-primary)',
                  color: 'var(--ds-color-primary-foreground)',
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                fontSize: 12,
                fontWeight: 500,
                border: 'none',
                background: 'transparent',
                borderRadius: 'var(--ds-radius-sm)',
                cursor: 'pointer',
                color: 'var(--ds-color-text-muted)',
                transition: `color var(--ds-motion-fast) var(--ds-motion-ease-out),
                             background var(--ds-motion-fast) var(--ds-motion-ease-out)`,
              }}
              onClick={onReset}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--ds-color-error)';
                e.currentTarget.style.background = 'var(--ds-surface-highlight)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--ds-color-text-muted)';
                e.currentTarget.style.background = 'transparent';
              }}
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                borderRadius: 'var(--ds-radius-sm)',
                background: 'var(--ds-color-primary)',
                color: 'var(--ds-color-primary-foreground)',
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
