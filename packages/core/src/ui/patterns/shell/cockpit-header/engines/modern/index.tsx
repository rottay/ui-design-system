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

import React, { useState, useEffect, useRef } from 'react';
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
        {label}
      </a>
    );
  }

  return (
    <span
      data-part="crumb"
      data-interactive="false"
      data-last={isLast ? 'true' : 'false'}
    >
      {label}
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
      {status.label}
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
  const headerRef = useRef<HTMLDivElement>(null);

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
      setIsCompact(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div
        className={`ds-pattern-cockpit-header ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading="true"
        style={style}
      >
        <div data-part="skeleton-stack">
          {/* Breadcrumb skeleton */}
          <div data-part="skeleton" data-size="crumb" />
          {/* Title row skeleton */}
          <div data-part="skeleton-row">
            <div data-part="skeleton-lead">
              <div
                data-part="skeleton"
                data-size="icon"
                style={{ '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)' } as React.CSSProperties}
              />
              <div data-part="skeleton-column">
                <div data-part="skeleton" data-size="title" />
                <div data-part="skeleton" data-size="subtitle" />
              </div>
            </div>
            {/* Action skeleton */}
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={headerRef}
      className={`ds-pattern-cockpit-header ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading="false"
      data-sticky={sticky ? 'true' : 'false'}
      data-compact={isCompact ? 'true' : 'false'}
      data-has-icon={icon ? 'true' : 'false'}
      data-has-actions={actions ? 'true' : 'false'}
      style={style}
    >
      {/* ---- Breadcrumb trail ---- */}
      {breadcrumbs && breadcrumbs.length > 0 && !isCompact && (
        <nav
          aria-label={breadcrumbLabel}
          data-part="breadcrumb"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`crumb-${idx}`}>
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
              </React.Fragment>
            );
          })}
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
              <h2 data-part="title">
                {title}
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
                {subtitle}
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
