'use client';

/**
 * @fileoverview Modern engine for the WorkbenchHeader pattern.
 *
 * Premium entity header for detail/workbench pages. Renders:
 * - Entity identity: optional avatar + name (large, bold) + optional subtitle
 * - Status badge: clean pill with semantic color
 * - Action buttons: primary (Edit, Save) + secondary (Delete, Archive) with proper spacing
 * - Saved views: integrated tab strip with active underline highlight and the
 *   full APG tabs keyboard contract (roving tabindex, logical arrows with RTL
 *   mirroring, Home/End, automatic activation — page-shell idiom)
 * - Exception count badge with warning icon and a parametric accessible name
 *
 * Ownership (R2+R3): the engine stamps anatomy (`data-part`), posture
 * (`data-active`, `data-variant`, `data-loading`, `data-has-*`) and the shared
 * kernel's interaction state (`data-state`); the modern skin
 * (`runtime/engines/modern/skin/workbench-header/index.css`) owns 100% of layout and
 * paint — typography included. Token-driven styling, zero DaisyUI dependency,
 * zero inline paint. Consistent visual family with CockpitHeader.
 *
 * @module Patterns/WorkbenchHeader/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React from 'react';
import type { WorkbenchHeaderProps, WorkbenchQuickAction } from '../../contracts';
import Button from '../../../../../primitives/inputs/button/engines/modern';
import { AnatomySkeleton } from '../../../../../primitives/feedback/skeleton';
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { StatusWarningIcon } from '@/graphics/icons/semantic/generated/roles/status-warning';
import { useOptionalDirection, useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* ------------------------------------------------------------------ */
/* English accessibility floors (translatable via `components` ns)     */
/* ------------------------------------------------------------------ */

const SAVED_VIEWS_LABEL_KEY = 'workbenchHeader.savedViews';
const SAVED_VIEWS_LABEL_FALLBACK = 'Saved views';
const EXCEPTIONS_LABEL_KEY = 'workbenchHeader.exceptions';
const EXCEPTIONS_LABEL_FALLBACK = '{count} exceptions';
const LOADING_LABEL_KEY = 'workbenchHeader.loading';
const LOADING_LABEL_FALLBACK = 'Loading';

/* ------------------------------------------------------------------ */
/* QuickActionButton                                                   */
/* ------------------------------------------------------------------ */

/**
 * One quick action. The Button IS the `action` part: it paints itself from the
 * variant channels the skin states for this slot, and it decides its own hover,
 * press and keyboard ring. Nothing here wraps it to reach into it.
 */
function QuickActionButton({ action }: { action: WorkbenchQuickAction }) {
  const variant = action.variant ?? 'default';

  return (
    <Button
      data-part="action"
      /* The tone is this header's decision, stated here and keyed by the skin.
         The closed prop domain is exactly the Button's own three, so the Button
         re-derives the identical attribute rather than a competing one. */
      data-variant={variant}
      htmlType="button"
      size="sm"
      variant={variant}
      disabled={action.disabled}
      onClick={action.onClick}
      icon={action.icon}
    >
      {action.label}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* SavedViewTab                                                        */
/* ------------------------------------------------------------------ */

/**
 * Individual saved-view tab button. Roving tabindex: only the active tab sits in
 * the Tab order (APG tabs). Hover, press and the keyboard ring are the shared
 * kernel's decision, read off `data-state`.
 */
function SavedViewTab({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  const interaction = useInteractionState();

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      {...interaction.handlers}
      {...partAttributes('tab', interaction.state)}
      data-active={isActive ? 'true' : 'false'}
    >
      {/* The label is the tab's only content, so it is also the shape the
          loading state stands in for. */}
      <bdi data-part="tab-label">{label}</bdi>
    </button>
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
 * - Avatar + title (large, bold) + optional subtitle
 * - Exception count badge with semantic error styling
 * - Primary + secondary quick action buttons
 * - Saved views tab strip with active underline indicator
 * - Loading state drawn from this header's own anatomy
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
  // The reading direction comes from the shared i18n authority, not a DOM
  // probe of a node's `dir` chain: the locale knows it on the server too, and a
  // probe re-derives from paint a fact the provider already holds.
  const direction = useOptionalDirection();

  const savedViewsLabel =
    i18n?.tOr(SAVED_VIEWS_LABEL_KEY, SAVED_VIEWS_LABEL_FALLBACK) ?? SAVED_VIEWS_LABEL_FALLBACK;
  const loadingLabel =
    i18n?.tOr(LOADING_LABEL_KEY, LOADING_LABEL_FALLBACK) ?? LOADING_LABEL_FALLBACK;
  // ONE parametric message for the exception badge's accessible name — never
  // a translated fragment concatenated with the count (i18n law).
  const exceptionsLabelFor = (count: number) =>
    i18n?.tOr(EXCEPTIONS_LABEL_KEY, EXCEPTIONS_LABEL_FALLBACK, { count }) ?? `${count} exceptions`;
  /* The visible count is a number, not a string: grouping separators and
     native digits belong to the active locale, not to the host default. */
  const formattedExceptionCount = (count: number) =>
    new Intl.NumberFormat(i18n?.locale).format(count);

  /* The card's own hover and press are the kernel's decision. Only the pointer
     handlers are wired: a descendant's focus bubbles to this element, and a card
     that reported itself keyboard-focused because a tab was would stamp a ring
     state no part of it owns. */
  const card = useInteractionState();

  /* ---- APG tabs keyboard contract for the saved-views strip: roving focus
          with automatic activation (page-shell idiom). Arrow keys are logical
          (RTL mirrors Left/Right); Home/End jump. ---- */
  const handleTabsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!savedViews || savedViews.length === 0) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const list = event.currentTarget;
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('[data-part="tab"]'));
    if (buttons.length === 0) return;
    const focusedIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const fromIndex =
      focusedIndex >= 0 ? focusedIndex : savedViews.findIndex((view) => view.id === activeViewId);
    let nextIndex = fromIndex;
    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = buttons.length - 1;
    } else {
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const logicalDelta = direction === 'rtl' ? -delta : delta;
      nextIndex = (fromIndex + logicalDelta + buttons.length) % buttons.length;
    }
    const target = buttons[nextIndex];
    if (!target) return;
    target.focus();
    const targetId = savedViews[nextIndex]?.id;
    if (targetId && targetId !== activeViewId) onViewChange?.(targetId);
  };

  const hasIcon = Boolean(icon);
  const hasActions = Boolean(quickActions && quickActions.length > 0);
  const hasTabs = Boolean(savedViews && savedViews.length > 0);

  const chrome = (
    <>
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
              {/* String titles also advertise their full text on hover: the
                  34ch measure + balanced wrap can still clip long names in
                  narrow containers (cockpit-header idiom). */}
              <h2 data-part="title" title={title}>
                {/* Caller-owned strings are bidi-isolated so a mixed-script
                    title cannot reorder the badge beside it. */}
                <bdi>{title}</bdi>
              </h2>

              {/* Exception count badge: the bare count is meaningless out of
                  context, so the pill names itself parametrically for AT. */}
              {exceptionCount != null && exceptionCount > 0 && (
                <span
                  data-part="exception"
                  /* ARIA prohibits aria-label on generic; role=img is what
                     makes the parametric name reach the accessibility tree. */
                  role="img"
                  aria-label={exceptionsLabelFor(exceptionCount)}
                >
                  <StatusWarningIcon size={12} decorative />
                  {formattedExceptionCount(exceptionCount)}
                </span>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p data-part="subtitle">
                <bdi>{subtitle}</bdi>
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
      {savedViews && savedViews.length > 0 && (
        <div
          role="tablist"
          aria-label={savedViewsLabel}
          data-part="tabs"
          onKeyDown={handleTabsKeyDown}
        >
          {savedViews.map((view) => {
            const isActive = view.id === activeViewId;
            return (
              <SavedViewTab
                key={view.id}
                label={view.label}
                isActive={isActive}
                onClick={onViewChange ? () => onViewChange(view.id) : undefined}
              />
            );
          })}
        </div>
      )}
    </>
  );

  /* The loading state is BUILT FROM THE ANATOMY: the shared renderer reads this
     header's own `data-part` tree and draws one bone per part, so the wait has the
     shape of the header the caller asked for and cannot drift from it. The root
     keeps the single announcement, so the skeleton is told not to add a second. */
  return (
    <div
      className={`ds-pattern-workbench-header ds-engine-modern ${className ?? ''}`}
      onPointerEnter={card.handlers.onPointerEnter}
      onPointerLeave={card.handlers.onPointerLeave}
      onPointerDown={card.handlers.onPointerDown}
      onPointerUp={card.handlers.onPointerUp}
      {...partAttributes('root', card.state)}
      data-loading={loading ? 'true' : 'false'}
      data-has-icon={hasIcon ? 'true' : 'false'}
      data-has-actions={hasActions ? 'true' : 'false'}
      data-has-tabs={hasTabs ? 'true' : 'false'}
      role={loading ? 'status' : undefined}
      aria-busy={loading ? true : undefined}
      aria-label={loading ? loadingLabel : undefined}
      style={style}
    >
      {loading ? <AnatomySkeleton busy={false}>{chrome}</AnatomySkeleton> : chrome}
    </div>
  );
}
