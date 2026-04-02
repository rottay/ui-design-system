'use client';

/**
 * @fileoverview Modern (DaisyUI / Tailwind) engine for the CockpitHeader pattern.
 *
 * Renders a rich detail-page header inside a DaisyUI card with:
 * - Breadcrumb trail (DaisyUI breadcrumbs component)
 * - Back navigation button (ghost variant)
 * - Title + status badge cluster
 * - Subtitle text
 * - Action toolbar on the right
 * - Optional sticky compact mode on scroll
 *
 * All colors use `--ds-*` CSS custom properties. Transitions use
 * `--ds-duration-*` and `--ds-ease-*` tokens. Interactive elements
 * include proper hover/focus states.
 *
 * @module Patterns/CockpitHeader/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React, { useState, useEffect, useRef } from 'react';
import type { CockpitHeaderProps, CockpitStatus } from '../CockpitHeader.types';

/**
 * Maps a CockpitStatus variant to the corresponding DaisyUI badge class.
 */
const STATUS_BADGE_CLASSES: Record<CockpitStatus['variant'], string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  default: 'badge-neutral',
};

/**
 * Modern (DaisyUI) CockpitHeader engine.
 *
 * Renders a full header card with breadcrumb trail, title row with status
 * badges, action buttons, and optional sticky compact mode. Uses DaisyUI
 * utility classes for structure and `--ds-*` CSS custom properties for
 * theming consistency.
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
  const [backHovered, setBackHovered] = useState(false);
  const [backFocused, setBackFocused] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      setIsCompact(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={`card bg-base-100 shadow-sm ${className ?? ''}`}
        style={style}
      >
        <div className="card-body">
          <div className="flex flex-col gap-3 animate-pulse">
            <div
              className="rounded"
              style={{
                width: 160,
                height: 12,
                background: 'var(--ds-color-bg-secondary)',
              }}
            />
            <div
              className="rounded"
              style={{
                width: 260,
                height: 28,
                background: 'var(--ds-color-bg-secondary)',
              }}
            />
            <div
              className="rounded"
              style={{
                width: 180,
                height: 14,
                background: 'var(--ds-color-bg-secondary)',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const stickyStyles: React.CSSProperties = sticky
    ? {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: `padding var(--ds-duration-normal, 200ms) var(--ds-ease-out, ease-out), box-shadow var(--ds-duration-normal, 200ms) var(--ds-ease-out, ease-out)`,
        ...(isCompact
          ? {
              boxShadow: `0 2px 8px color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)`,
            }
          : {}),
      }
    : {};

  return (
    <div
      ref={headerRef}
      className={`card bg-base-100 shadow-sm ds-pattern-cockpit-header ds-engine-modern ${className ?? ''}`}
      style={{
        border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
        ...stickyStyles,
        ...style,
      }}
    >
      <div
        className="card-body"
        style={{
          padding: isCompact ? '12px 24px' : '20px 24px',
          transition: `padding var(--ds-duration-normal, 200ms) var(--ds-ease-out, ease-out)`,
        }}
      >
        {/* Breadcrumb trail */}
        {breadcrumbs && breadcrumbs.length > 0 && !isCompact && (
          <div className="breadcrumbs text-sm p-0 mb-3">
            <ul>
              {breadcrumbs.map((crumb, idx) => (
                <li key={`crumb-${idx}`}>
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      style={{
                        color: 'var(--ds-color-primary)',
                        fontWeight: 500,
                        transition: `color var(--ds-duration-fast, 150ms) var(--ds-ease-out, ease-out)`,
                      }}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      style={{
                        color: 'var(--ds-color-text-muted)',
                        fontWeight: 500,
                      }}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main row: back + title + status | actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Left cluster: back button + title group */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {onBack && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square flex-shrink-0"
                onClick={onBack}
                onMouseEnter={() => setBackHovered(true)}
                onMouseLeave={() => setBackHovered(false)}
                onFocus={() => setBackFocused(true)}
                onBlur={() => setBackFocused(false)}
                aria-label="Go back"
                style={{
                  color: backHovered || backFocused
                    ? 'var(--ds-color-text-primary)'
                    : 'var(--ds-color-text-secondary)',
                  transition: `color var(--ds-duration-fast, 150ms) var(--ds-ease-out, ease-out), background var(--ds-duration-fast, 150ms) var(--ds-ease-out, ease-out)`,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </button>
            )}

            {/* Title + subtitle column */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="font-bold truncate"
                  style={{
                    fontSize: isCompact ? 16 : 22,
                    lineHeight: 1.3,
                    color: 'var(--ds-color-text-primary)',
                    transition: `font-size var(--ds-duration-normal, 200ms) var(--ds-ease-out, ease-out)`,
                  }}
                >
                  {title}
                </h2>
                {/* Status badges */}
                {status && status.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {status.map((s, idx) => (
                      <span
                        key={`status-${idx}`}
                        className={`badge badge-sm ${STATUS_BADGE_CLASSES[s.variant]}`}
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {subtitle && !isCompact && (
                <p
                  className="text-sm mt-1 truncate"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    lineHeight: 1.4,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Action toolbar */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
