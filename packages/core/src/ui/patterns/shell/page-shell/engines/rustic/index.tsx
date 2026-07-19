'use client';

/**
 * @fileoverview PageShell -- Rustic engine (Vanilla / CSS variables).
 * Standard page layout shell using authored engine CSS and bounded runtime
 * layout values backed by --ds-* design tokens. No UI-framework dependency. Features a custom
 * breadcrumb nav with "/" separators, back button with HTML arrow
 * entity, title/subtitle header with actions, and a tab bar built
 * from native buttons with active-state border highlighting.
 *
 * @example
 * <RusticPageShell
 *   title="Users"
 *   subtitle="Manage platform users"
 *   breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
 * >
 *   <UserTable />
 * </RusticPageShell>
 */

import React, { type CSSProperties } from 'react';
import type { PageShellProps } from '../../contracts';

/**
 * Rustic (Vanilla CSS) implementation of the PageShell pattern.
 * Styling combines authored engine CSS with bounded runtime layout values.
 * Builds its own breadcrumb, back button, tab bar, and title area.
 *
 * @param props - See {@link PageShellProps} for the full prop contract.
 * @returns The rendered page shell layout.
 */
export default function RusticPageShell(props: PageShellProps) {
  const {
    title,
    subtitle,
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

  /* Optional maxWidth constrains and centers the shell for readable content widths */
  const containerStyle: CSSProperties = {
    maxWidth: maxWidth ?? undefined,
    margin: maxWidth ? '0 auto' : undefined,
    ...style,
  };

  /* Plain text loading indicator using muted color token */
  if (loading) {
    return (
      <div
        className={`ds-pattern-page-shell ds-engine-rustic ${className ?? ''}`}
        data-part="root"
        data-loading="true"
        style={{ textAlign: 'center', padding: 48, ...containerStyle }}
      >
        Loading...
      </div>
    );
  }

  /* Default to first tab when no explicit activeTab provided */
  const activeTabKey = activeTab ?? tabs?.[0]?.key;

  /** Breadcrumb link style -- primary color with no underline */
  const linkStyle: CSSProperties = {
    textDecoration: 'none',
    cursor: 'pointer',
    fontSize: 'var(--ds-font-size-sm, 14px)',
  };

  /** Breadcrumb separator "/" between crumb items */
  const separatorStyle: CSSProperties = {
    margin: '0 8px',
    fontSize: 'var(--ds-font-size-sm, 14px)',
  };

  return (
    <div
      className={`ds-pattern-page-shell ds-engine-rustic ${className ?? ''}`}
      data-part="root"
      data-loading="false"
      style={containerStyle}
    >
      {/* Custom breadcrumb nav: flex-wrap handles overflow on narrow screens.
           Clickable crumbs get primary link color; terminal crumbs are muted. */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav data-part="breadcrumb" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {breadcrumbs.map((bc, i) => (
            <React.Fragment key={i}>
              {/* "/" separator between items; omitted before the first crumb */}
              {i > 0 && <span data-part="separator" style={separatorStyle}>/</span>}
              {bc.href || bc.onClick ? (
                <a
                  href={bc.href ?? '#'}
                  onClick={bc.onClick ? (e) => { e.preventDefault(); bc.onClick!(); } : undefined}
                  data-part="crumb"
                  data-interactive="true"
                  style={linkStyle}
                >
                  {bc.label}
                </a>
              ) : (
                <span
                  data-part="crumb"
                  data-interactive="false"
                  style={{ fontSize: 'var(--ds-font-size-sm, 14px)' }}
                >
                  {bc.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header row: back + title on left, action buttons on right */}
      <div data-part="header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div data-part="lead" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back button uses HTML arrow entity (&#8592;) to avoid icon library dependency */}
          {back && (
            <button
              onClick={back.onClick}
              data-part="back"
              style={{
                cursor: 'pointer',
                fontSize: 'var(--ds-font-size-sm, 14px)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
              }}
            >
              &#8592; {back.label}
            </button>
          )}
          <div data-part="titles">
            {/* Title + badge inline; lineHeight 1.3 prevents badge vertical misalignment */}
            <div data-part="title-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* W6-A cqi proof consumer: see the modern engine's title style for the
                  fluid-ramp rationale (resolves against the page-shell root container). */}
              <h1 data-part="title" style={{ margin: 0, fontSize: 'var(--ds-font-size-fluid-2xl, 1.5rem)', fontWeight: 600, lineHeight: 1.3 }}>
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p data-part="subtitle" style={{ margin: '4px 0 0', fontSize: 'var(--ds-font-size-sm, 14px)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div data-part="actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
      </div>

      {/* Tab bar -- active tab highlighted with primary-colored 2px bottom border */}
      {tabs && tabs.length > 0 && (
        <div>
          <div data-part="tabs" style={{ display: 'flex', marginBottom: 24, gap: 0 }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                data-part="tab"
                data-active={activeTabKey === tab.key ? 'true' : 'false'}
                style={{
                  padding: '8px 16px',
                  fontWeight: activeTabKey === tab.key ? 600 : 400,
                  fontSize: 'var(--ds-font-size-sm, 14px)',
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {tabs.find((t) => t.key === activeTabKey)?.content}
        </div>
      )}

      {/* Children render only when no tabs are present */}
      {(!tabs || tabs.length === 0) && children}
    </div>
  );
}
