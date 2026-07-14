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
import type { CockpitHeaderProps, CockpitStatus } from '../CockpitHeader.types';

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
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      data-part="back"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        flexShrink: 0,
        cursor: 'pointer',
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}`,
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
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.5,
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
    title,
    subtitle,
    breadcrumbs,
    status,
    actions,
    sticky = false,
    onBack,
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
          padding: '20px 24px',
          ...style,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Breadcrumb skeleton */}
          <div
            data-part="skeleton"
            style={{
              width: 160,
              height: 12,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          {/* Title row skeleton */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                data-part="skeleton"
                style={{
                  width: 34,
                  height: 34,
                  '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                } as React.CSSProperties}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  data-part="skeleton"
                  style={{
                    width: 260,
                    height: 24,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  data-part="skeleton"
                  style={{
                    width: 180,
                    height: 14,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
            {/* Action skeleton */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                data-part="skeleton"
                style={{
                  width: 80,
                  height: 34,
                  '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                } as React.CSSProperties}
              />
              <div
                data-part="skeleton"
                style={{
                  width: 100,
                  height: 34,
                  '--ds-cockpit-header-skeleton-radius': 'var(--ds-radius-md)',
                  animation: 'pulse 1.5s ease-in-out infinite',
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
      style={{
        padding: isCompact ? '12px 24px' : '20px 24px',
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
            gap: 6,
            marginBottom: 14,
            fontSize: 13,
            lineHeight: 1.4,
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
                    /
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
          gap: 16,
        }}
      >
        {/* Left cluster: back button + title group */}
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
          {onBack && <BackButton onClick={onBack} />}

          {/* Title + subtitle column */}
          <div data-part="titles" style={{ minWidth: 0, flex: 1 }}>
            <div
              data-part="title-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <h2
                data-part="title"
                style={{
                  margin: 0,
                  fontSize: isCompact ? 16 : 22,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: '-0.025em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
                    gap: 6,
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
                  fontSize: 13,
                  lineHeight: 1.5,
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

        {/* Action toolbar */}
        {actions && (
          <div
            data-part="actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
