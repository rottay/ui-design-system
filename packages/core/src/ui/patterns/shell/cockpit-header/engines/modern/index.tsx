'use client';

/**
 * @fileoverview Modern engine for the CockpitHeader pattern.
 *
 * Renders a premium command-center style header for dashboards and detail
 * pages. The engine stamps anatomy (`data-part`), state (`data-compact`,
 * `data-sticky`, `data-loading`, `data-variant`) and the sanctioned skeleton
 * radius data channel; the modern skin
 * (`runtime/engines/modern/skin/cockpit-header.css`) owns 100% of layout and
 * paint — typography included. Zero DaisyUI dependency, zero inline paint.
 *
 * Features:
 * - Breadcrumb trail with "/" separators, muted color, current item darker
 * - Back navigation button (ghost, token-driven, translated aria-label)
 * - Title + status pill chips
 * - Subtitle / metadata row below title
 * - Action toolbar right-aligned with primary/ghost treatment
 * - Optional sticky compact mode on scroll with elevation
 * - Card-style background to differentiate from page content
 * - Loading skeleton with pulse animation
 *
 * @module Patterns/CockpitHeader/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React, { useState, useEffect } from 'react';
import type { CockpitHeaderProps, CockpitStatus } from '../../contracts';
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/* ------------------------------------------------------------------ */
/* English accessibility floors (translatable via `components` ns)     */
/* ------------------------------------------------------------------ */

const BACK_LABEL_KEY = 'cockpitHeader.back';
const BACK_LABEL_FALLBACK = 'Go back';
const BREADCRUMB_LABEL_KEY = 'cockpitHeader.breadcrumb';
const BREADCRUMB_LABEL_FALLBACK = 'Breadcrumb';

/* Hysteresis band for the compact posture: a single threshold flipped the
   whole title block on and off around one scroll pixel. */
const COMPACT_ENTER_OFFSET = 60;
const COMPACT_EXIT_OFFSET = 40;

/* ------------------------------------------------------------------ */
/* BreadcrumbLink                                                      */
/* ------------------------------------------------------------------ */

/**
 * Individual breadcrumb with hover state for interactive items.
 */
function BreadcrumbLink({
  label,
  href,
  isLast,
}: {
  label: string;
  href?: string;
  isLast: boolean;
}) {
  if (href && !isLast) {
    return (
      <a
        href={href}
        data-part="crumb"
        data-interactive="true"
        data-last="false"
      >
        {/* Caller labels are bidi-isolated: a Hebrew crumb must not reorder
            the chevrons or the Latin crumbs around it. */}
        <bdi>{label}</bdi>
      </a>
    );
  }

  return (
    <span
      data-part="crumb"
      data-interactive="false"
      data-last={isLast ? 'true' : 'false'}
      /* The terminal crumb is the current page: announce it (APG breadcrumb). */
      aria-current={isLast ? 'page' : undefined}
    >
      <bdi>{label}</bdi>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* BackButton                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ghost back navigation button with token-driven hover/focus state.
 */
function BackButton({ onClick, ariaLabel }: { onClick: () => void; ariaLabel: string }) {
  return (
    <span data-part="back">
      <Button
        htmlType="button"
        variant="ghost"
        size="sm"
        shape="circle"
        onClick={onClick}
        aria-label={ariaLabel}
        icon={(
          <NavigationBackIcon size={15} decorative />
        )}
      >
        <span className="ds-sr-only">{ariaLabel}</span>
      </Button>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* StatusPill                                                           */
/* ------------------------------------------------------------------ */

/**
 * Renders a single status pill badge with semantic coloring.
 */
function StatusPill({ status }: { status: CockpitStatus }) {
  return (
    <span
      data-part="status"
      data-variant={status.variant}
    >
      <bdi>{status.label}</bdi>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

/**
 * Modern CockpitHeader engine.
 *
 * Token-driven header for detail pages and dashboards. No DaisyUI classes --
 * every color, radius, and elevation value references a `--ds-*` CSS custom
 * property in the skin. Supports sticky compact mode on scroll.
 *
 * @param props - {@link CockpitHeaderProps}
 * @returns The rendered cockpit header.
 */
export default function ModernCockpitHeader(props: CockpitHeaderProps) {
  const {
    eyebrow,
    icon,
    title,
    subtitle,
    breadcrumbs,
    status,
    actions,
    sticky = false,
    onBack,
    backAriaLabel,
    loading,
    className,
    style,
  } = props;

  const [isCompact, setIsCompact] = useState(false);

  // Optional i18n: without an I18nProvider the hook returns null and the
  // English floors render, byte-identical to the pre-i18n contract. Explicit
  // props always win.
  const i18n = useOptionalTranslation('components');
  const backLabel =
    backAriaLabel ?? i18n?.tOr(BACK_LABEL_KEY, BACK_LABEL_FALLBACK) ?? BACK_LABEL_FALLBACK;
  const breadcrumbLabel =
    i18n?.tOr(BREADCRUMB_LABEL_KEY, BREADCRUMB_LABEL_FALLBACK) ?? BREADCRUMB_LABEL_FALLBACK;

  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      /* Asymmetric thresholds: once compact the header holds that posture to a
   lower offset, so a boundary scroll cannot thrash the swap. */
      setIsCompact((current) =>
        window.scrollY > (current ? COMPACT_EXIT_OFFSET : COMPACT_ENTER_OFFSET),
      );
    };
    /* Mounting into an already-scrolled document must not paint the resting
       posture until the next scroll event (page-shell idiom). */
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  /* ---- Loading skeleton: mirrors the anatomy the caller actually requested
          (page-shell idiom), so a title-only header does not reserve a
          breadcrumb/icon/subtitle/action footprint it will never fill and then
          collapse on hydrate. ---- */
  if (loading) {
    return (
      <div
        className={`ds-pattern-cockpit-header ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading="true"
        /* The position posture is part of the anatomy: without these the sticky
           header un-stuck itself while loading and jumped when the content arrived. */
        data-sticky={sticky ? 'true' : 'false'}
        data-compact={isCompact ? 'true' : 'false'}
        data-has-icon={icon ? 'true' : 'false'}
        data-has-actions={actions ? 'true' : 'false'}
        aria-busy="true"
        style={style}
      >
        <div data-part="skeleton-stack">
          {/* Breadcrumb skeleton */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <div data-part="skeleton" data-size="crumb" />
          ) : null}
          {/* Title row skeleton */}
          <div data-part="skeleton-row">
            <div data-part="skeleton-lead">
              {icon ? (
                <div
                  data-part="skeleton"
                  data-size="icon"
                  style={{ '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
                />
              ) : null}
              <div data-part="skeleton-column">
                {eyebrow ? <div data-part="skeleton" data-size="crumb" /> : null}
                <div data-part="skeleton" data-size="title" />
                {subtitle ? <div data-part="skeleton" data-size="subtitle" /> : null}
              </div>
            </div>
            {/* Action skeleton */}
            {actions ? (
              <div data-part="skeleton-actions">
                <div
                  data-part="skeleton"
                  data-size="action"
                  style={{ '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
                />
                <div
                  data-part="skeleton"
                  data-size="action"
                  style={{ '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-cockpit-header ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading="false"
      data-sticky={sticky ? 'true' : 'false'}
      data-compact={isCompact ? 'true' : 'false'}
      data-has-icon={icon ? 'true' : 'false'}
      data-has-actions={actions ? 'true' : 'false'}
      style={style}
    >
      {/* ---- Breadcrumb trail. It survives the compact posture: scrolling is
              not a dismissal, and unmounting the only links in the header
              dropped keyboard focus to the body mid-scroll. ---- */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label={breadcrumbLabel}
          data-part="breadcrumb"
          /* The trail is a horizontally scrollable region with a hidden scrollbar:
             without a tab stop its overflowed tail (the terminal crumb is not a link) */
          tabIndex={0}
        >
          {/* APG breadcrumb is an ordered list; the explicit role survives the
              `list-style: none` that strips list semantics in WebKit. */}
          <ol data-part="crumb-list" role="list">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li data-part="crumb-item" key={`crumb-${idx}`}>
                  {idx > 0 && (
                    <span
                      data-part="separator"
                      aria-hidden="true"
                    >
                      <NavigationForwardIcon size={11} decorative />
                    </span>
                  )}
                  <BreadcrumbLink
                    label={crumb.label}
                    href={crumb.href}
                    isLast={isLast}
                  />
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* ---- Main row: back + title + status | actions ---- */}
      <div data-part="main-row">
        {/* Left cluster: back button + title group */}
        <div data-part="lead">
          {onBack && <BackButton onClick={onBack} ariaLabel={backLabel} />}

          {icon ? (
            <span data-part="header-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}

          {/* Title + subtitle column */}
          <div data-part="titles">
            {eyebrow && !isCompact ? <div data-part="eyebrow">{eyebrow}</div> : null}
            <div data-part="title-row">
              {/* String titles also advertise their full text on hover: the
                  34ch measure + balanced wrap can still clip long names in
                  narrow containers. */}
              <h2
                data-part="title"
                title={typeof title === 'string' ? title : undefined}
              >
                <bdi>{title}</bdi>
              </h2>

              {/* Status pills */}
              {status && status.length > 0 && (
                <div data-part="status-list">
                  {status.map((s, idx) => (
                    <StatusPill key={`status-${idx}`} status={s} />
                  ))}
                </div>
              )}
            </div>

            {/* Subtitle / metadata row */}
            {subtitle && !isCompact && (
              <p data-part="subtitle">
                <bdi>{subtitle}</bdi>
              </p>
            )}
          </div>
        </div>

        {/* Action toolbar */}
        {actions && (
          <div data-part="actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
