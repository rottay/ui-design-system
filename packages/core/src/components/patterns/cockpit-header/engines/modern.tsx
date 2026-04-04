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
/* Status pill color mapping (soft variant: bg -100, text -700)        */
/* ------------------------------------------------------------------ */

const STATUS_PILL_STYLES: Record<
  CockpitStatus['variant'],
  { background: string; color: string; borderColor: string }
> = {
  success: {
    background: 'var(--ds-color-success-100)',
    color: 'var(--ds-color-success-700)',
    borderColor: 'var(--ds-color-success-200)',
  },
  warning: {
    background: 'var(--ds-color-warning-100)',
    color: 'var(--ds-color-warning-700)',
    borderColor: 'var(--ds-color-warning-200)',
  },
  error: {
    background: 'var(--ds-color-error-100)',
    color: 'var(--ds-color-error-700)',
    borderColor: 'var(--ds-color-error-200)',
  },
  info: {
    background: 'var(--ds-color-info-100)',
    color: 'var(--ds-color-info-700)',
    borderColor: 'var(--ds-color-info-200)',
  },
  default: {
    background: 'var(--ds-color-neutral-100)',
    color: 'var(--ds-color-neutral-700)',
    borderColor: 'var(--ds-color-neutral-200)',
  },
};

/* ------------------------------------------------------------------ */
/* Shared style constants                                              */
/* ------------------------------------------------------------------ */

const TRANSITION_FAST =
  'var(--ds-motion-fast) var(--ds-motion-ease-out)';

const TRANSITION_NORMAL =
  '200ms var(--ds-motion-ease-out)';

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
  const [hovered, setHovered] = useState(false);

  if (href && !isLast) {
    return (
      <a
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          color: hovered
            ? 'var(--ds-color-text-secondary)'
            : 'var(--ds-color-text-muted)',
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
      style={{
        color: isLast
          ? 'var(--ds-color-text-secondary)'
          : 'var(--ds-color-text-muted)',
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
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const isHighlighted = hovered || focused;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-label="Go back"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        flexShrink: 0,
        border: `1px solid ${isHighlighted ? 'var(--ds-color-border)' : 'transparent'}`,
        borderRadius: 'var(--ds-radius-md)',
        background: isHighlighted
          ? 'var(--ds-color-neutral-50)'
          : 'transparent',
        color: isHighlighted
          ? 'var(--ds-color-text-primary)'
          : 'var(--ds-color-text-secondary)',
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
  const pillStyle = STATUS_PILL_STYLES[status.variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.5,
        borderRadius: 'var(--ds-radius-full)',
        background: pillStyle.background,
        color: pillStyle.color,
        border: `1px solid ${pillStyle.borderColor}`,
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
        style={{
          background: 'var(--ds-surface-card)',
          borderBottom: '1px solid var(--ds-color-border-subtle)',
          padding: '20px 24px',
          ...style,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Breadcrumb skeleton */}
          <div
            style={{
              width: 160,
              height: 12,
              borderRadius: 'var(--ds-radius-sm)',
              background: 'var(--ds-color-neutral-100)',
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
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--ds-radius-md)',
                  background: 'var(--ds-color-neutral-100)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    width: 260,
                    height: 24,
                    borderRadius: 'var(--ds-radius-sm)',
                    background: 'var(--ds-color-neutral-100)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    width: 180,
                    height: 14,
                    borderRadius: 'var(--ds-radius-sm)',
                    background: 'var(--ds-color-neutral-100)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
            {/* Action skeleton */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{
                  width: 80,
                  height: 34,
                  borderRadius: 'var(--ds-radius-md)',
                  background: 'var(--ds-color-neutral-100)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: 100,
                  height: 34,
                  borderRadius: 'var(--ds-radius-md)',
                  background: 'var(--ds-color-neutral-100)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
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
        ...(isCompact
          ? { boxShadow: 'var(--ds-elevation-2)' }
          : {}),
      }
    : {};

  return (
    <div
      ref={headerRef}
      className={`ds-pattern-cockpit-header ds-engine-modern ${className ?? ''}`}
      style={{
        background: 'var(--ds-surface-card)',
        borderBottom: '1px solid var(--ds-color-border-subtle)',
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
                    style={{
                      color: 'var(--ds-color-text-muted)',
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
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left cluster: back button + title group */}
        <div
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
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: isCompact ? 16 : 22,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: '-0.025em',
                  color: 'var(--ds-color-text-primary)',
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
                style={{
                  margin: '4px 0 0',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--ds-color-text-secondary)',
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
