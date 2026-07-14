'use client';

/**
 * @fileoverview Modern engine for the WorkbenchHeader pattern.
 *
 * Premium entity header for detail/workbench pages. Renders:
 * - Entity identity: optional avatar + name (large, bold) + optional subtitle
 * - Status badge: clean pill with semantic color
 * - Action buttons: primary (Edit, Save) + secondary (Delete, Archive) with proper spacing
 * - Back navigation: clean back arrow ghost button
 * - Saved views: integrated tab strip with active underline highlight
 * - Exception count badge with warning icon
 *
 * Token-driven styling, zero DaisyUI dependency. Consistent visual family
 * with CockpitHeader: same container treatment, typography scale, transitions,
 * and token usage.
 *
 * @module Patterns/WorkbenchHeader/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { WorkbenchHeaderProps, WorkbenchQuickAction } from '../WorkbenchHeader.types';

/* ------------------------------------------------------------------ */
/* Shared style constants                                              */
/* ------------------------------------------------------------------ */

const TRANSITION_FAST =
  'var(--ds-motion-fast) var(--ds-motion-ease-out)';

/* ------------------------------------------------------------------ */
/* QuickActionButton                                                   */
/* ------------------------------------------------------------------ */

/**
 * Renders a single quick action button with token-driven variant styling.
 * Primary uses filled background, danger uses error tokens, default is ghost/outlined.
 */
function QuickActionButton({ action }: { action: WorkbenchQuickAction }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const variant = action.variant ?? 'default';
  const isInteractive = hovered || focused;

  const variantStyles: Record<
    string,
    { base: React.CSSProperties; hover: React.CSSProperties }
  > = {
    primary: {
      base: {
        background: 'var(--ds-color-primary)',
        color: 'var(--ds-color-text-on-primary)',
        border: '1px solid var(--ds-color-primary)',
        boxShadow: 'var(--ds-elevation-1)',
      },
      hover: {
        background: 'var(--ds-color-primary-600)',
        borderColor: 'var(--ds-color-primary-600)',
        boxShadow: 'var(--ds-elevation-2)',
      },
    },
    danger: {
      base: {
        background: 'transparent',
        color: 'var(--ds-color-error-600)',
        border: '1px solid var(--ds-color-error-200)',
      },
      hover: {
        background: 'var(--ds-color-error-50)',
        borderColor: 'var(--ds-color-error-300)',
      },
    },
    default: {
      base: {
        background: 'transparent',
        color: 'var(--ds-color-text-secondary)',
        border: '1px solid var(--ds-color-border)',
      },
      hover: {
        background: 'var(--ds-color-neutral-50)',
        color: 'var(--ds-color-text-primary)',
        borderColor: 'var(--ds-color-neutral-300)',
      },
    },
  };

  const vs = variantStyles[variant] ?? variantStyles.default;

  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={action.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-part="action"
      data-variant={variant}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.4,
        borderRadius: 'var(--ds-radius-md)',
        cursor: action.disabled ? 'not-allowed' : 'pointer',
        opacity: action.disabled ? 0.5 : 1,
        outline: 'none',
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}, box-shadow ${TRANSITION_FAST}`,
        ...vs.base,
        ...(isInteractive && !action.disabled ? vs.hover : {}),
      }}
    >
      {action.icon && (
        <span style={{ display: 'inline-flex', fontSize: 14, flexShrink: 0 }}>
          {action.icon}
        </span>
      )}
      {action.label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* BackButton                                                          */
/* ------------------------------------------------------------------ */

/**
 * Clean back navigation button with ghost styling and hover state.
 */
function BackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isInteractive = hovered || focused;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-label="Go back"
      data-part="back"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        flexShrink: 0,
        border: 'none',
        borderRadius: 'var(--ds-radius-sm)',
        background: isInteractive
          ? 'var(--ds-color-neutral-100)'
          : 'transparent',
        color: isInteractive
          ? 'var(--ds-color-text-primary)'
          : 'var(--ds-color-text-secondary)',
        cursor: 'pointer',
        outline: 'none',
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}`,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        style={{ width: 16, height: 16 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* SavedViewTab                                                        */
/* ------------------------------------------------------------------ */

/**
 * Individual saved-view tab button with hover and active indicator.
 */
function SavedViewTab({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isInteractive = (hovered || focused) && !isActive;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-part="tab"
      data-active={isActive ? 'true' : 'false'}
      style={{
        position: 'relative',
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        lineHeight: 1.4,
        color: isActive
          ? 'var(--ds-color-primary)'
          : isInteractive
            ? 'var(--ds-color-text-primary)'
            : 'var(--ds-color-text-muted)',
        background: isInteractive
          ? 'var(--ds-color-neutral-50)'
          : 'transparent',
        border: 'none',
        borderBottom: isActive
          ? '2px solid var(--ds-color-primary)'
          : '2px solid transparent',
        marginBottom: -1,
        cursor: 'pointer',
        outline: 'none',
        borderRadius: 0,
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}`,
      }}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

const PULSE_STYLE: React.CSSProperties = {
  borderRadius: 'var(--ds-radius-sm)',
  background: 'var(--ds-color-neutral-100)',
  animation: 'pulse 1.5s ease-in-out infinite',
};

function SkeletonBlock(props: { width: number | string; height: number; style?: React.CSSProperties }) {
  return (
    <div
      data-part="skeleton"
      style={{
        width: props.width,
        height: props.height,
        ...PULSE_STYLE,
        ...props.style,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

/**
 * Modern WorkbenchHeader engine.
 *
 * Premium entity header for detail/workbench pages. Token-driven, zero
 * DaisyUI dependency. Consistent visual family with CockpitHeader.
 *
 * Features:
 * - Optional back navigation button
 * - Avatar + title (large, bold) + optional subtitle
 * - Exception count badge with semantic error styling
 * - Primary + secondary quick action buttons
 * - Saved views tab strip with active underline indicator
 * - Loading skeleton with premium pulse animation
 *
 * @param props - {@link WorkbenchHeaderProps}
 * @returns The rendered workbench header.
 */
export default function ModernWorkbenchHeader(props: WorkbenchHeaderProps) {
  const {
    title,
    subtitle,
    exceptionCount,
    quickActions,
    savedViews,
    activeViewId,
    onViewChange,
    loading,
    className,
    style,
  } = props;

  /* ---- Container styles ---- */
  const containerStyle: React.CSSProperties = {
    background: 'var(--ds-surface-card)',
    borderBottom: '1px solid var(--ds-color-border)',
    padding: '20px 24px',
    ...style,
  };

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div
        className={`ds-pattern-workbench-header ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading="true"
        style={containerStyle}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Avatar skeleton */}
            <SkeletonBlock
              width={40}
              height={40}
              style={{ borderRadius: 'var(--ds-radius-full)', flexShrink: 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SkeletonBlock width={200} height={22} />
              <SkeletonBlock width={300} height={14} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <SkeletonBlock
              width={80}
              height={34}
              style={{ borderRadius: 'var(--ds-radius-md)' }}
            />
            <SkeletonBlock
              width={80}
              height={34}
              style={{ borderRadius: 'var(--ds-radius-md)' }}
            />
          </div>
        </div>
        <SkeletonBlock
          width="100%"
          height={36}
          style={{ marginTop: 16 }}
        />
      </div>
    );
  }

  /* ---- Main render ---- */
  return (
    <div
      className={`ds-pattern-workbench-header ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading="false"
      style={containerStyle}
    >
      {/* ---- Header row: back + title + badge | quick actions ---- */}
      <div
        data-part="header-row"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {/* Left: title group */}
        <div
          data-part="lead"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 0,
            flex: 1,
          }}
        >
          {/* Title + subtitle column */}
          <div data-part="titles" style={{ minWidth: 0, flex: 1 }}>
            <div
              data-part="title-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <h2
                data-part="title"
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em',
                  color: 'var(--ds-color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </h2>

              {/* Exception count badge */}
              {exceptionCount != null && exceptionCount > 0 && (
                <span
                  data-part="exception"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.5,
                    borderRadius: 'var(--ds-radius-full)',
                    background: 'var(--ds-color-error-100)',
                    color: 'var(--ds-color-error-700)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ width: 12, height: 12, flexShrink: 0 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {exceptionCount}
                </span>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p
                data-part="subtitle"
                style={{
                  margin: '4px 0 0',
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: 'var(--ds-color-text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: quick action buttons */}
        {quickActions && quickActions.length > 0 && (
          <div
            data-part="actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            {quickActions.map((action, idx) => (
              <QuickActionButton key={`qa-${idx}`} action={action} />
            ))}
          </div>
        )}
      </div>

      {/* ---- Saved views tab strip ---- */}
      {savedViews && savedViews.length > 0 && onViewChange && (
        <div
          role="tablist"
          aria-label="Saved views"
          data-part="tabs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            marginTop: 16,
            borderBottom: '1px solid var(--ds-color-border)',
          }}
        >
          {savedViews.map((view) => {
            const isActive = view.id === activeViewId;
            return (
              <SavedViewTab
                key={view.id}
                label={view.label}
                isActive={isActive}
                onClick={() => onViewChange(view.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
