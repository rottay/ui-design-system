'use client';

/**
 * @fileoverview PageShell -- Rustic engine (Vanilla / CSS variables).
 * Standard page layout shell using only inline styles with --ds-*
 * design tokens. No CSS framework dependency. Features a custom
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
import type { PageShellProps } from '../PageShell.types';

/**
 * Rustic (Vanilla CSS) implementation of the PageShell pattern.
 * All styling uses inline CSSProperties with --ds-* token fallbacks.
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
      <div className={className} style={{ textAlign: 'center', padding: 48, color: 'var(--ds-color-text-muted)', ...containerStyle }}>
        Loading...
      </div>
    );
  }

  /* Default to first tab when no explicit activeTab provided */
  const activeTabKey = activeTab ?? tabs?.[0]?.key;

  /** Breadcrumb link style -- primary color with no underline */
  const linkStyle: CSSProperties = {
    color: 'var(--ds-color-primary)',
    textDecoration: 'none',
    cursor: 'pointer',
    fontSize: 'var(--ds-font-size-sm, 14px)',
  };

  /** Breadcrumb separator "/" between crumb items */
  const separatorStyle: CSSProperties = {
    margin: '0 8px',
    color: 'var(--ds-color-text-muted)',
    fontSize: 'var(--ds-font-size-sm, 14px)',
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Custom breadcrumb nav: flex-wrap handles overflow on narrow screens.
           Clickable crumbs get primary link color; terminal crumbs are muted. */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav style={{ marginBottom: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {breadcrumbs.map((bc, i) => (
            <React.Fragment key={i}>
              {/* "/" separator between items; omitted before the first crumb */}
              {i > 0 && <span style={separatorStyle}>/</span>}
              {bc.href || bc.onClick ? (
                <a
                  href={bc.href ?? '#'}
                  onClick={bc.onClick ? (e) => { e.preventDefault(); bc.onClick!(); } : undefined}
                  style={linkStyle}
                >
                  {bc.label}
                </a>
              ) : (
                <span style={{ fontSize: 'var(--ds-font-size-sm, 14px)', color: 'var(--ds-color-text-muted)' }}>
                  {bc.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header row: back + title on left, action buttons on right */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back button uses HTML arrow entity (&#8592;) to avoid icon library dependency */}
          {back && (
            <button
              onClick={back.onClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ds-color-text-secondary)',
                fontSize: 'var(--ds-font-size-sm, 14px)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 'var(--ds-radius-sm, 4px)',
              }}
            >
              &#8592; {back.label}
            </button>
          )}
          <div>
            {/* Title + badge inline; lineHeight 1.3 prevents badge vertical misalignment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: 'var(--ds-color-text)', lineHeight: 1.3 }}>
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: 'var(--ds-font-size-sm, 14px)', color: 'var(--ds-color-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
      </div>

      {/* Tab bar -- active tab highlighted with primary-colored 2px bottom border */}
      {tabs && tabs.length > 0 && (
        <div>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--ds-color-neutral-200)', marginBottom: 24, gap: 0 }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTabKey === tab.key ? '2px solid var(--ds-color-primary)' : '2px solid transparent',
                  color: activeTabKey === tab.key ? 'var(--ds-color-primary)' : 'var(--ds-color-text-secondary)',
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
