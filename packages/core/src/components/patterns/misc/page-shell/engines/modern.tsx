'use client';

/**
 * @fileoverview PageShell -- Modern engine (token-driven).
 *
 * Clean page frame with optional breadcrumbs, title area, action buttons,
 * tab navigation, and content slot. All visuals use `--ds-*` CSS custom
 * properties. Zero DaisyUI dependency.
 *
 * Features:
 * - Breadcrumb trail with "/" separators, muted color, hover state
 * - Title area with strong heading (700 weight, negative tracking)
 * - Subtitle in secondary color
 * - Actions slot right-aligned with proper spacing
 * - Optional tab navigation with active indicator
 * - Back navigation button (ghost, token-driven)
 * - Transparent background (content cards provide their own)
 * - Optional bottom border separator
 *
 * @module Patterns/PageShell/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 *
 * @example
 * <ModernPageShell
 *   title="Users"
 *   subtitle="Manage platform users"
 *   breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
 *   actions={<Button>Add User</Button>}
 * >
 *   <UserTable />
 * </ModernPageShell>
 */

import React, { useState } from 'react';
import type { PageShellProps } from '../PageShell.types';

/* ------------------------------------------------------------------ */
/* Shared style constants                                              */
/* ------------------------------------------------------------------ */

const TRANSITION_FAST = 'var(--ds-motion-fast) var(--ds-motion-ease-out)';

/* ------------------------------------------------------------------ */
/* BreadcrumbLink                                                      */
/* ------------------------------------------------------------------ */

/**
 * Individual breadcrumb link/text with hover state for interactive items.
 */
function BreadcrumbItem({
  label,
  href,
  onClick,
  isLast,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const isInteractive = !isLast && (href || onClick);

  if (isInteractive) {
    return (
      <a
        href={href ?? '#'}
        onClick={
          onClick
            ? (e: React.MouseEvent) => {
                e.preventDefault();
                onClick();
              }
            : undefined
        }
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
/* TabButton                                                           */
/* ------------------------------------------------------------------ */

/**
 * Tab button with token-driven active indicator and hover state.
 */
function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        lineHeight: 1.4,
        color: isActive
          ? 'var(--ds-color-primary)'
          : hovered
            ? 'var(--ds-color-text-primary)'
            : 'var(--ds-color-text-muted)',
        background:
          hovered && !isActive
            ? 'var(--ds-color-neutral-50)'
            : 'transparent',
        border: 'none',
        borderBottom: isActive
          ? '2px solid var(--ds-color-primary)'
          : '2px solid transparent',
        marginBottom: -1,
        cursor: 'pointer',
        borderRadius: 0,
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}`,
      }}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* BackButton                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ghost back navigation button with token-driven hover state.
 */
function BackButton({
  label,
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
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
      aria-label={label ? `Go back to ${label}` : 'Go back'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: label ? '6px 12px 6px 8px' : '6px',
        border: 'none',
        borderRadius: 'var(--ds-radius-md)',
        background: isHighlighted
          ? 'var(--ds-color-neutral-100)'
          : 'transparent',
        color: isHighlighted
          ? 'var(--ds-color-text-primary)'
          : 'var(--ds-color-text-secondary)',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.4,
        cursor: 'pointer',
        flexShrink: 0,
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}`,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        style={{ width: 16, height: 16, flexShrink: 0 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

/**
 * Modern PageShell engine.
 *
 * Token-driven page frame for all application pages. No DaisyUI classes --
 * every color, radius, and spacing value references a `--ds-*` CSS custom
 * property.
 *
 * @param props - {@link PageShellProps}
 * @returns The rendered page shell layout.
 */
export default function ModernPageShell(props: PageShellProps) {
  const {
    title,
    hideHeader = false,
    subtitle,
    headerContent,
    breadcrumbs,
    actions,
    tabs,
    activeTab,
    onTabChange,
    children,
    back,
    badge,
    maxWidth,
    loading,
    className,
    style,
  } = props;

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div
        className={`ds-pattern-page-shell ds-pattern-page-shell--loading ds-engine-modern ${className ?? ''}`}
        style={{
          padding: '24px 24px 0',
          maxWidth: maxWidth ?? undefined,
          margin: maxWidth ? '0 auto' : undefined,
          ...style,
        }}
      >
        <div className="ds-pattern-page-shell__loading-skeleton" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Breadcrumb skeleton */}
          <div
            style={{
              width: 180,
              height: 12,
              borderRadius: 'var(--ds-radius-sm)',
              background: 'var(--ds-color-neutral-100)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          {/* Title skeleton */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  width: 280,
                  height: 28,
                  borderRadius: 'var(--ds-radius-sm)',
                  background: 'var(--ds-color-neutral-100)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: 200,
                  height: 14,
                  borderRadius: 'var(--ds-radius-sm)',
                  background: 'var(--ds-color-neutral-100)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{
                  width: 80,
                  height: 32,
                  borderRadius: 'var(--ds-radius-md)',
                  background: 'var(--ds-color-neutral-100)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: 100,
                  height: 32,
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

  /* Default to the first tab when no activeTab is explicitly set */
  const activeTabKey = activeTab ?? tabs?.[0]?.key;

  // Shell-grid: subtle background grid driven by premium chrome tokens.
  // --ds-shell-grid-size defaults to 0px (no grid) for tenants that don't set it.
  const gridBg = 'repeating-linear-gradient(0deg, var(--ds-shell-grid-line, transparent) 0 1px, transparent 1px var(--ds-shell-grid-size, 0px)), repeating-linear-gradient(90deg, var(--ds-shell-grid-line, transparent) 0 1px, transparent 1px var(--ds-shell-grid-size, 0px))';

  return (
    <div
      className={`ds-pattern-page-shell ds-engine-modern ${className ?? ''}`}
      style={{
        maxWidth: maxWidth ?? undefined,
        margin: maxWidth ? '0 auto' : undefined,
        backgroundImage: gridBg,
        backgroundSize: `var(--ds-shell-grid-size, 0px) var(--ds-shell-grid-size, 0px)`,
        ...style,
      }}
    >
      {/* ---- Page header area ---- */}
      {!hideHeader && (
        <div
          style={{
            padding: '20px 24px 0',
          }}
        >
        {/* ---- Breadcrumb trail ---- */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {breadcrumbs.map((bc, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`crumb-${idx}`}>
                  {idx > 0 && (
                    <span
                      style={{
                        color: 'var(--ds-color-text-muted)',
                        userSelect: 'none',
                        fontSize: 12,
                      }}
                      aria-hidden="true"
                    >
                      /
                    </span>
                  )}
                  <BreadcrumbItem
                    label={bc.label}
                    href={bc.href}
                    onClick={bc.onClick}
                    isLast={isLast}
                  />
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* ---- Header row: back + title group | actions ---- */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
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
            {back && (
              <BackButton label={back.label} onClick={back.onClick} />
            )}

            {/* Title + badge + subtitle */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-0.025em',
                    color: 'var(--ds-color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </h1>
                {badge}
              </div>
              {subtitle && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'var(--ds-color-text-secondary)',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
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

        {headerContent && (
          <div style={{ marginTop: 18 }}>
            {headerContent}
          </div>
        )}

        {/* ---- Bottom border separator ---- */}
        {(tabs && tabs.length > 0) ? (
          /* Tab strip acts as the separator */
          <div
            role="tablist"
            aria-label="Page tabs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              marginTop: 16,
              borderBottom: '1px solid var(--ds-color-border-subtle)',
            }}
          >
            {tabs.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                isActive={activeTabKey === tab.key}
                onClick={() => onTabChange?.(tab.key)}
              />
            ))}
          </div>
        ) : (
          /* Subtle separator when no tabs */
          <div
            style={{
              marginTop: 16,
              borderBottom: '1px solid var(--ds-color-border-subtle)',
            }}
          />
        )}
        </div>
      )}

      {/* ---- Content area ---- */}
      <div style={{ padding: '16px 24px 24px' }}>
        {tabs && tabs.length > 0
          ? tabs.find((t) => t.key === activeTabKey)?.content
          : children}
      </div>
    </div>
  );
}
