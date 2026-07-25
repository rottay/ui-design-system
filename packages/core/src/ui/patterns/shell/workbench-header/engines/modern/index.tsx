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

import React from 'react';
import type { WorkbenchHeaderProps, WorkbenchQuickAction } from '../../contracts';
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';

/* ------------------------------------------------------------------ */
/* Shared style constants                                              */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* QuickActionButton                                                   */
/* ------------------------------------------------------------------ */

/**
 * Renders a single quick action button with token-driven variant styling.
 * Primary uses filled background, danger uses error tokens, default is ghost/outlined.
 */
function QuickActionButton({ action }: { action: WorkbenchQuickAction }) {
  const variant = action.variant ?? 'default';

  return (
    <span
      data-part="action"
      data-variant={variant}
      style={{ display: 'contents' }}
    >
      <Button
        htmlType="button"
        size="sm"
        variant={variant}
        disabled={action.disabled}
        onClick={action.onClick}
        style={{ flexShrink: 0 }}
        icon={action.icon}
      >
        {action.label}
      </Button>
    </span>
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
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      data-part="tab"
      data-active={isActive ? 'true' : 'false'}
      style={{
        position: 'relative',
        minHeight: 'var(--ds-tabs-md-height)',
        padding: 'var(--ds-tabs-md-padding)',
        fontSize: 'var(--ds-tabs-md-font-size)',
        fontWeight: isActive
          ? 'var(--ds-tabs-item-font-weight-active)'
          : 'var(--ds-tabs-item-font-weight)',
        lineHeight: 'var(--ds-line-height-body)',
        cursor: 'pointer',
        transition: 'color var(--ds-motion-fast) var(--ds-motion-ease-out), background var(--ds-motion-fast) var(--ds-motion-ease-out), border-color var(--ds-motion-fast) var(--ds-motion-ease-out), box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out), transform var(--ds-motion-fast) var(--ds-motion-ease-out)',
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
  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
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
    eyebrow,
    icon,
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
    padding: 'var(--ds-workbench-header-padding)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-workbench-header-item-gap)' }}>
            {/* Avatar skeleton */}
            <SkeletonBlock
              width={40}
              height={40}
              style={{ '--ds-workbench-header-skeleton-radius': 'var(--ds-radius-full)', flexShrink: 0 } as React.CSSProperties}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2, 8px)' }}>
              <SkeletonBlock width={200} height={22} />
              <SkeletonBlock width={300} height={14} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--ds-workbench-header-action-gap)' }}>
            <SkeletonBlock
              width={80}
              height={34}
              style={{ '--ds-workbench-header-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
            />
            <SkeletonBlock
              width={80}
              height={34}
              style={{ '--ds-workbench-header-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
            />
          </div>
        </div>
        <SkeletonBlock
          width="100%"
          height={36}
          style={{ marginTop: 'var(--ds-workbench-header-section-gap)' }}
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
      data-has-icon={icon ? 'true' : 'false'}
      data-has-actions={quickActions && quickActions.length > 0 ? 'true' : 'false'}
      data-has-tabs={savedViews && savedViews.length > 0 ? 'true' : 'false'}
      style={containerStyle}
    >
      {/* ---- Header row: back + title + badge | quick actions ---- */}
      <div
        data-part="header-row"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--ds-workbench-header-section-gap)',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: title group */}
        <div
          data-part="lead"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-workbench-header-item-gap)',
            minWidth: 0,
            flex: 1,
          }}
        >
          {icon ? (
            <span data-part="header-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}

          {/* Title + subtitle column */}
          <div data-part="titles" style={{ minWidth: 0, flex: 1 }}>
            {eyebrow ? <div data-part="eyebrow">{eyebrow}</div> : null}
            <div
              data-part="title-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-workbench-header-item-gap)',
              }}
            >
              <h2
                data-part="title"
                style={{
                  margin: 0,
                  fontSize: 'var(--ds-font-size-xl)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  lineHeight: 'var(--ds-line-height-heading)',
                  letterSpacing: 'var(--ds-letter-spacing-heading)',
                  textWrap: 'balance',
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
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    lineHeight: 'var(--ds-line-height-body)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <StatusWarningIcon size={12} decorative />
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
                  fontSize: 'var(--ds-font-size-sm)',
                  lineHeight: 'var(--ds-line-height-body)',
                  textWrap: 'pretty',
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
              gap: 'var(--ds-workbench-header-action-gap)',
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
            gap: 'var(--ds-tabs-gap)',
            marginTop: 'var(--ds-workbench-header-section-gap)',
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
