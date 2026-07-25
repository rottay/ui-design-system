'use client';

/**
 * @fileoverview Modern engine for the CockpitHeader pattern.
 *
 * Renders a premium command-center style header for dashboards and detail
 * pages. All visuals use `--ds-*` CSS custom properties. Zero DaisyUI
 * dependency.
 *
 * Features:
 * - Breadcrumb trail with "/" separators, muted color, current item darker
 * - Back navigation button (ghost, token-driven)
 * - Title (700 weight, 22px, tight tracking) + status pill chips
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

/* ------------------------------------------------------------------ */
/* Shared style constants                                              */
/* ------------------------------------------------------------------ */

const TRANSITION_FAST =
  'var(--ds-motion-fast) var(--ds-motion-ease-out)';

const TRANSITION_NORMAL =
  'var(--ds-motion-normal) var(--ds-motion-ease-out)';

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
        style={{
          fontWeight: 500,
          textDecoration: 'none',
          transition: `color ${TRANSITION_FAST}`,
          cursor: 'pointer',
        }}
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
      style={{
        fontWeight: isLast ? 600 : 500,
      }}
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
function BackButton({ onClick, ariaLabel }: { onClick: () => void; ariaLabel?: string }) {
  return (
    <span data-part="back" style={{ display: 'contents' }}>
      <Button
        htmlType="button"
        variant="ghost"
        size="sm"
        shape="circle"
        onClick={onClick}
        aria-label={ariaLabel ?? 'Go back'}
        style={{ flexShrink: 0 }}
        icon={(
          <NavigationBackIcon size={15} decorative />
        )}
      >
        <span className="ds-sr-only">{ariaLabel ?? 'Go back'}</span>
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: 'var(--ds-badge-padding-y, 2px) var(--ds-badge-padding-x, 0.375rem)',
        fontSize: 'var(--ds-font-size-xs)',
        fontWeight: 'var(--ds-font-weight-semibold)',
        lineHeight: 'var(--ds-line-height-body)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}
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
 * property. Supports sticky compact mode on scroll.
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
        style={{
          padding: 'var(--ds-cockpit-header-padding)',
          ...style,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-cockpit-header-item-gap)' }}>
          {/* Breadcrumb skeleton */}
          <div
            data-part="skeleton"
            style={{
              width: 160,
              height: 12,
              animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
            }}
          />
          {/* Title row skeleton */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--ds-cockpit-header-section-gap)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-cockpit-header-item-gap)' }}>
              <div
                data-part="skeleton"
                style={{
                  width: 34,
                  height: 34,
                  '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)',
                  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                } as React.CSSProperties}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2, 8px)' }}>
                <div
                  data-part="skeleton"
                  style={{
                    width: 260,
                    height: 24,
                    animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  data-part="skeleton"
                  style={{
                    width: 180,
                    height: 14,
                    animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
            {/* Action skeleton */}
            <div style={{ display: 'flex', gap: 'var(--ds-cockpit-header-action-gap)' }}>
              <div
                data-part="skeleton"
                style={{
                  width: 80,
                  height: 34,
                  '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)',
                  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                } as React.CSSProperties}
              />
              <div
                data-part="skeleton"
                style={{
                  width: 100,
                  height: 34,
                  '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)',
                  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Sticky behavior ---- */
  const stickyStyles: React.CSSProperties = sticky
    ? {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: `padding ${TRANSITION_NORMAL}, box-shadow ${TRANSITION_NORMAL}`,
      }
    : {};

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
      style={{
        padding: isCompact ? 'var(--ds-cockpit-header-padding-compact)' : 'var(--ds-cockpit-header-padding)',
        transition: `padding ${TRANSITION_NORMAL}`,
        ...stickyStyles,
        ...style,
      }}
    >
      {/* ---- Breadcrumb trail ---- */}
      {breadcrumbs && breadcrumbs.length > 0 && !isCompact && (
        <nav
          aria-label="Breadcrumb"
          data-part="breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2, 8px)',
            marginBottom: 'var(--ds-cockpit-header-item-gap)',
            fontSize: 'var(--ds-font-size-sm)',
            lineHeight: 'var(--ds-line-height-body)',
          }}
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`crumb-${idx}`}>
                {idx > 0 && (
                  <span
                    data-part="separator"
                    style={{
                      userSelect: 'none',
                      fontSize: 12,
                      opacity: 0.7,
                    }}
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
      <div
        data-part="main-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ds-cockpit-header-section-gap)',
        }}
      >
        {/* Left cluster: back button + title group */}
        <div
          data-part="lead"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-cockpit-header-item-gap)',
            minWidth: 0,
            flex: 1,
          }}
        >
          {onBack && <BackButton onClick={onBack} ariaLabel={backAriaLabel} />}

          {icon ? (
            <span data-part="header-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}

          {/* Title + subtitle column */}
          <div data-part="titles" style={{ minWidth: 0, flex: 1 }}>
            {eyebrow && !isCompact ? <div data-part="eyebrow">{eyebrow}</div> : null}
            <div
              data-part="title-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-cockpit-header-item-gap)',
                flexWrap: 'wrap',
              }}
            >
              <h2
                data-part="title"
                style={{
                  margin: 0,
                  fontSize: isCompact ? 'var(--ds-font-size-lg)' : 'var(--ds-font-size-2xl)',
                  fontWeight: 'var(--ds-font-weight-bold)',
                  lineHeight: 'var(--ds-line-height-heading)',
                  letterSpacing: 'var(--ds-letter-spacing-heading)',
                  textWrap: 'balance',
                  transition: `font-size ${TRANSITION_NORMAL}`,
                }}
              >
                {title}
              </h2>

              {/* Status pills */}
              {status && status.length > 0 && (
                <div
                  data-part="status-list"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2, 8px)',
                  }}
                >
                  {status.map((s, idx) => (
                    <StatusPill key={`status-${idx}`} status={s} />
                  ))}
                </div>
              )}
            </div>

            {/* Subtitle / metadata row */}
            {subtitle && !isCompact && (
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

        {/* Action toolbar */}
        {actions && (
          <div
            data-part="actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-cockpit-header-action-gap)',
              flexShrink: 0,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
