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
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

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
        minHeight: 'var(--ds-tabs-md-height)',
        padding: 'var(--ds-tabs-md-padding)',
        fontSize: 'var(--ds-tabs-md-font-size)',
        fontWeight: isActive
          ? 'var(--ds-tabs-item-font-weight-active)'
          : 'var(--ds-tabs-item-font-weight)',
        lineHeight: 'var(--ds-line-height-body)',
        cursor: 'pointer',
        transition: `color ${TRANSITION_FAST}, background ${TRANSITION_FAST}, border-color ${TRANSITION_FAST}, box-shadow ${TRANSITION_FAST}, transform ${TRANSITION_FAST}`,
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
  ariaLabel,
  onClick,
}: {
  label?: string;
  ariaLabel?: string;
  onClick: () => void;
}) {
  return (
    <span
      data-part="back"
      data-has-label={label ? 'true' : 'false'}
      style={{ display: 'contents' }}
    >
      <Button
        htmlType="button"
        variant="ghost"
        size="sm"
        shape={label ? 'default' : 'circle'}
        onClick={onClick}
        aria-label={ariaLabel ?? label ?? 'Back'}
        style={{ flexShrink: 0 }}
        icon={(
          <NavigationBackIcon size={15} decorative />
        )}
      >
        {label ?? <span className="ds-sr-only">{ariaLabel ?? 'Back'}</span>}
      </Button>
    </span>
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
    eyebrow,
    icon,
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
          padding: 'var(--ds-page-shell-header-padding)',
          maxWidth: maxWidth ?? undefined,
          margin: maxWidth ? '0 auto' : undefined,
          ...style,
        }}
      >
        <div className="ds-pattern-page-shell__loading-skeleton" data-part="skeleton-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-page-shell-item-gap)' }}>
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
              gap: 'var(--ds-page-shell-section-gap)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2, 8px)' }}>
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
            <div style={{ display: 'flex', gap: 'var(--ds-page-shell-action-gap)' }}>
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
          data-has-actions={actions ? 'true' : 'false'}
          data-has-tabs={tabs && tabs.length > 0 ? 'true' : 'false'}
          data-has-rich-content={headerContent ? 'true' : 'false'}
          style={{
            padding: 'var(--ds-page-shell-header-padding)',
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
              gap: 'var(--ds-spacing-2, 8px)',
              marginBottom: 'var(--ds-spacing-3, 12px)',
              fontSize: 'var(--ds-font-size-sm)',
              lineHeight: 'var(--ds-line-height-body)',
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
                      <NavigationForwardIcon size={11} decorative />
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
            gap: 'var(--ds-page-shell-section-gap)',
            flexWrap: 'wrap',
          }}
        >
          {/* Left cluster: back button + title group */}
          <div
            data-part="lead"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-page-shell-item-gap)',
              minWidth: 0,
              flex: 1,
            }}
          >
            {back && (
              <BackButton label={back.label} ariaLabel={back.ariaLabel} onClick={back.onClick} />
            )}

            {icon ? (
              <span data-part="header-icon" aria-hidden="true">
                {icon}
              </span>
            ) : null}

            {/* Title + badge + subtitle */}
            <div data-part="titles" style={{ minWidth: 0, flex: 1 }}>
              {eyebrow ? (
                <div data-part="eyebrow">{eyebrow}</div>
              ) : null}
              <div
                data-part="title-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-page-shell-item-gap)',
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
                    fontWeight: 'var(--ds-font-weight-bold)',
                    lineHeight: 'var(--ds-line-height-display)',
                    letterSpacing: 'var(--ds-letter-spacing-display)',
                    textWrap: 'balance',
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
                    fontSize: 'var(--ds-font-size-md)',
                    lineHeight: 'var(--ds-line-height-body)',
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
                gap: 'var(--ds-page-shell-action-gap)',
                flexShrink: 0,
              }}
            >
              {actions}
            </div>
          )}
        </div>

        {headerContent && (
          <div data-part="header-content" style={{ marginTop: 'var(--ds-page-shell-section-gap)' }}>
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
              gap: 'var(--ds-tabs-gap)',
              marginTop: 'var(--ds-page-shell-section-gap)',
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
              marginTop: 'var(--ds-page-shell-section-gap)',
            }}
          />
        )}
        </div>
      )}

      {/* ---- Content area ---- */}
      <div data-part="content" style={{ padding: 'var(--ds-page-shell-content-padding)' }}>
        {tabs && tabs.length > 0
          ? tabs.find((t) => t.key === activeTabKey)?.content
          : children}
      </div>
    </div>
  );
}
