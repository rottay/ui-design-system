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
 * Ownership (R2+R3): the engine stamps anatomy (`data-part`), state
 * (`data-active`, `data-variant`, `data-loading`) and the sanctioned skeleton
 * radius data channel; the modern skin
 * (`runtime/engines/modern/skin/workbench-header.css`) owns 100% of layout and
 * paint — typography included. Token-driven styling, zero DaisyUI dependency,
 * zero inline paint. Consistent visual family with CockpitHeader.
 *
 * @module Patterns/WorkbenchHeader/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React from 'react';
import type { WorkbenchHeaderProps, WorkbenchQuickAction } from '../../contracts';
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* ------------------------------------------------------------------ */
/* English accessibility floors (translatable via `components` ns)     */
/* ------------------------------------------------------------------ */

const SAVED_VIEWS_LABEL_KEY = 'workbenchHeader.savedViews';
const SAVED_VIEWS_LABEL_FALLBACK = 'Saved views';

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
    >
      <Button
        htmlType="button"
        size="sm"
        variant={variant}
        disabled={action.disabled}
        onClick={action.onClick}
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
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

/**
 * One skeleton block. `size` is the skin-owned geometry hook (`data-size`);
 * the optional inline style carries only the sanctioned radius
 * custom-property data channel.
 */
function SkeletonBlock(props: { size: string; style?: React.CSSProperties }) {
  return (
    <div
      data-part="skeleton"
      data-size={props.size}
      style={props.style}
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

  // Optional i18n: without an I18nProvider the hook returns null and the
  // English floor renders, byte-identical to the pre-i18n contract.
  const i18n = useOptionalTranslation('components');
  const savedViewsLabel =
    i18n?.tOr(SAVED_VIEWS_LABEL_KEY, SAVED_VIEWS_LABEL_FALLBACK) ?? SAVED_VIEWS_LABEL_FALLBACK;

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div
        className={`ds-pattern-workbench-header ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading="true"
        style={style}
      >
        <div data-part="skeleton-row">
          <div data-part="skeleton-lead">
            {/* Avatar skeleton */}
            <SkeletonBlock
              size="avatar"
              style={{ '--ds-workbench-header-skeleton-radius': 'var(--ds-radius-full)' } as React.CSSProperties}
            />
            <div data-part="skeleton-column">
              <SkeletonBlock size="title" />
              <SkeletonBlock size="subtitle" />
            </div>
          </div>
          <div data-part="skeleton-actions">
            <SkeletonBlock
              size="action"
              style={{ '--ds-workbench-header-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
            />
            <SkeletonBlock
              size="action"
              style={{ '--ds-workbench-header-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
            />
          </div>
        </div>
        <SkeletonBlock size="tabs" />
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
      style={style}
    >
      {/* ---- Header row: back + title + badge | quick actions ---- */}
      <div data-part="header-row">
        {/* Left: title group */}
        <div data-part="lead">
          {icon ? (
            <span data-part="header-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}

          {/* Title + subtitle column */}
          <div data-part="titles">
            {eyebrow ? <div data-part="eyebrow">{eyebrow}</div> : null}
            <div data-part="title-row">
              <h2 data-part="title">
                {title}
              </h2>

              {/* Exception count badge */}
              {exceptionCount != null && exceptionCount > 0 && (
                <span data-part="exception">
                  <StatusWarningIcon size={12} decorative />
                  {exceptionCount}
                </span>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p data-part="subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: quick action buttons */}
        {quickActions && quickActions.length > 0 && (
          <div data-part="actions">
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
          aria-label={savedViewsLabel}
          data-part="tabs"
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
