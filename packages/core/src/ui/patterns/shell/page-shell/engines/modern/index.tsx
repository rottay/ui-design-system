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

import React from 'react';
import type { PageShellProps } from '../../contracts';

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
  const isInteractive = !isLast && (href || onClick);

  if (isInteractive) {
    return (
      <a
        href={href ?? '#'}
        data-part="crumb"
        data-interactive="true"
        data-last="false"
        onClick={
          onClick
            ? (e: React.MouseEvent) => {
                e.preventDefault();
                onClick();
              }
            : undefined
        }
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
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        lineHeight: 1.4,
        marginBottom: -1,
        cursor: 'pointer',
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
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ? `Go back to ${label}` : 'Go back'}
      data-part="back"
      data-has-label={label ? 'true' : 'false'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: label ? '6px 12px 6px 8px' : '6px',
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
        data-part="root"
        data-loading="true"
        style={{
          padding: '24px 24px 0',
          maxWidth: maxWidth ?? undefined,
          margin: maxWidth ? '0 auto' : undefined,
          ...style,
        }}
      >
        <div className="ds-pattern-page-shell__loading-skeleton" data-part="skeleton-group" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Breadcrumb skeleton */}
          <div
            data-part="skeleton"
            style={{
              width: 180,
              height: 12,
              animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
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
                data-part="skeleton"
                style={{
                  // In-flow skeleton: 280px exceeds the content box a 360px
                  // viewport offers, so it is bounded rather than pinned.
                  width: '100%',
                  maxWidth: 280,
                  height: 28,
                  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                data-part="skeleton"
                style={{
                  width: 200,
                  height: 14,
                  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                data-part="skeleton"
                style={{
                  width: 80,
                  height: 32,
                  '--ds-page-shell-skeleton-radius': 'var(--ds-radius-md)',
                  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                } as React.CSSProperties}
              />
              <div
                data-part="skeleton"
                style={{
                  width: 100,
                  height: 32,
                  '--ds-page-shell-skeleton-radius': 'var(--ds-radius-md)',
                  animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Default to the first tab when no activeTab is explicitly set */
  const activeTabKey = activeTab ?? tabs?.[0]?.key;

  return (
    <div
      className={`ds-pattern-page-shell ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading="false"
      style={{
        maxWidth: maxWidth ?? undefined,
        margin: maxWidth ? '0 auto' : undefined,
        ...style,
      }}
    >
      {/* ---- Page header area ---- */}
      {!hideHeader && (
        <div
          data-part="header"
          style={{
            padding: '20px 24px 0',
          }}
        >
        {/* ---- Breadcrumb trail ---- */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            data-part="breadcrumb"
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
                      data-part="separator"
                      style={{
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
          data-part="header-row"
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
            data-part="lead"
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
                <h1
                  data-part="title"
                  style={{
                    margin: 0,
                    // W6-A cqi proof consumer: the fluid ramp only resolves against a
                    // `container-type` ancestor (the page-shell root, declared in the
                    // engine skin). At full container width this equals the prior
                    // static 24px exactly; it steps down toward 20px as the shell is
                    // squeezed by a sibling rail/chat panel.
                    fontSize: 'var(--ds-font-size-fluid-2xl, 1.5rem)',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-0.025em',
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
                  data-part="subtitle"
                  style={{
                    margin: '4px 0 0',
                    fontSize: 14,
                    lineHeight: 1.5,
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

        {headerContent && (
          <div data-part="header-content" style={{ marginTop: 18 }}>
            {headerContent}
          </div>
        )}

        {/* ---- Bottom border separator ---- */}
        {(tabs && tabs.length > 0) ? (
          /* Tab strip acts as the separator */
          <div
            role="tablist"
            aria-label="Page tabs"
            data-part="tabs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              marginTop: 16,
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
            data-part="rule"
            style={{
              marginTop: 16,
            }}
          />
        )}
        </div>
      )}

      {/* ---- Content area ---- */}
      <div data-part="content" style={{ padding: '16px 24px 24px' }}>
        {tabs && tabs.length > 0
          ? tabs.find((t) => t.key === activeTabKey)?.content
          : children}
      </div>
    </div>
  );
}
