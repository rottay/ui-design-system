'use client';

/**
 * @fileoverview Rustic (Vanilla / CSS variables) engine for the DetailPanel pattern.
 * Renders an entity detail view using only inline styles with `--ds-*` design tokens,
 * making it framework-agnostic. Includes a header with avatar/title/status/actions,
 * tabbed content with an animated underline indicator, an optional sidebar, breadcrumbs,
 * and a footer. Hover/focus effects are applied via inline event handlers since there
 * is no CSS class system.
 *
 * @example
 * <RusticDetailPanel
 *   data={employee}
 *   title="Alex Rivera"
 *   subtitle="Product Manager"
 *   status={{ label: 'On Leave', color: '#f59e0b' }}
 *   tabs={[
 *     { key: 'profile', label: 'Profile', content: <ProfileCard /> },
 *     { key: 'reviews', label: 'Reviews', content: <ReviewList />, badge: 3 },
 *   ]}
 *   sidebar={<QuickInfo />}
 *   sidebarWidth={280}
 * />
 */

import React, { useState } from 'react';
import type { DetailPanelProps } from '../DetailPanel.types';

// Animation constants shared across all interactive elements in this engine.
// Uses a "back-out" easing for a slightly bouncy, organic feel.
const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

// ---------------------------------------------------------------------------
// Static style objects.
// All visual tokens reference --ds-* CSS custom properties so the component
// adapts to any design-system theme without class-based overrides.
// ---------------------------------------------------------------------------

const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    padding: 'var(--ds-card-body-padding, 1.25rem)',
  } as React.CSSProperties,
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: 'var(--ds-font-size-sm)',
    marginBottom: '1rem',
  } as React.CSSProperties,
  breadcrumbLink: {
    textDecoration: 'none',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit',
    fontSize: 'inherit',
  } as React.CSSProperties,
  breadcrumbSeparator: {
    margin: '0 0.25rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties,
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  backBtn: {
    cursor: 'pointer',
    padding: '0.25rem',
    fontSize: '1.25rem',
    lineHeight: 1,
    transition: `color ${RUSTIC_DURATION} ${RUSTIC_EASING}, background ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties,
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  title: {
    fontSize: 'var(--ds-font-size-xl)',
    fontWeight: 'var(--ds-typography-heading-font-weight, 600)' as unknown as number,
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, normal)',
    margin: 0,
    lineHeight: 1.3,
  } as React.CSSProperties,
  subtitle: {
    fontSize: 'var(--ds-font-size-sm)',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  } as React.CSSProperties,
  // Button layout shared by all variants; the per-variant chrome, hover tint,
  // and focus ring live in the rustic detail-panel skin keyed on data-variant.
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties,
  body: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  main: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  sidebar: (width: number | string) => ({
    width: typeof width === 'number' ? `${width}px` : width,
    flexShrink: 0,
    padding: '1rem',
  } as React.CSSProperties),
  tabsNav: {
    display: 'flex',
    marginBottom: '1rem',
    gap: 0,
  } as React.CSSProperties,
  // Tab layout factory. marginBottom:-2px offsets the skin's bottom border so it
  // overlaps the nav's bottom border, creating the "selected tab" underline
  // effect; the active/disabled color and underline live in the skin.
  tab: (active: boolean, disabled?: boolean) => ({
    padding: '0.5rem 1rem',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: active ? 'var(--ds-typography-heading-font-weight, 600)' : 400,
    letterSpacing: active ? 'var(--ds-typography-heading-letter-spacing, normal)' : 'normal',
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginBottom: '-2px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: `color ${RUSTIC_DURATION} ${RUSTIC_EASING}, border-color ${RUSTIC_DURATION} ${RUSTIC_EASING}, font-weight ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties),
  tabBadge: {
    display: 'inline-block',
    padding: '0 0.375rem',
    fontSize: 'var(--ds-font-size-xs)',
    lineHeight: '1.4',
  } as React.CSSProperties,
  footer: {
    marginTop: 'var(--ds-card-body-padding, 1.25rem)',
    paddingTop: 'var(--ds-card-body-padding, 1.25rem)',
  } as React.CSSProperties,
  // Skeleton factory: pulsing placeholder at given dimensions, used in loading
  // state; the radius and pulse background live in the skin.
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    animation: 'ds-detail-panel-pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

/**
 * Rustic (Vanilla) DetailPanel engine.
 *
 * Uses inline styles exclusively, referencing `--ds-*` CSS custom properties for
 * theming. Hover and focus effects are applied via inline event handlers since
 * there is no class-based CSS. Tab state can be controlled or uncontrolled.
 *
 * @typeParam T - Shape of the entity data object being displayed.
 * @param props - {@link DetailPanelProps} -- data, header info, tabs, sidebar, and actions.
 * @returns The detail view as a styled container div.
 */
export default function RusticDetailPanel<T>(props: DetailPanelProps<T>) {
  const {
    data,
    title,
    subtitle,
    avatar,
    status,
    tabs,
    activeTab: controlledActiveTab,
    onTabChange,
    actions,
    sidebar,
    sidebarPosition = 'right',
    sidebarWidth = 300,
    onBack,
    headerExtra,
    footer,
    breadcrumbs,
    loading,
    className,
    style,
  } = props;

  // Uncontrolled tab state: defaults to first tab. Ignored when consumer provides activeTab.
  const [internalActiveTab, setInternalActiveTab] = useState<string>(tabs?.[0]?.key ?? '');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  // Update internal state only in uncontrolled mode; always notify parent via onTabChange.
  const handleTabChange = (key: string) => {
    if (!controlledActiveTab) setInternalActiveTab(key);
    onTabChange?.(key);
  };

  // Skeleton loading state. The ds-detail-panel-pulse keyframes the skeleton
  // animation references live in the rustic detail-panel skin.
  if (loading) {
    return (
      <div
        className={`ds-pattern-detail-panel ds-engine-rustic ${className ?? ''}`}
        data-part="root"
        data-loading="true"
        style={{ ...s.container, ...style }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div data-part="skeleton-avatar" style={s.skeleton('3rem', '3rem')} />
          <div style={{ flex: 1 }}>
            <div data-part="skeleton-title" style={s.skeleton('40%', '1.25rem')} />
            <div data-part="skeleton-subtitle" style={{ ...s.skeleton('25%', '0.875rem'), marginTop: '0.5rem' }} />
          </div>
        </div>
        <div data-part="skeleton-tabs" style={{ ...s.skeleton('100%', '2rem'), marginTop: '1.5rem' }} />
        <div data-part="skeleton-content" style={{ ...s.skeleton('100%', '10rem'), marginTop: '0.75rem' }} />
      </div>
    );
  }

  // Resolve active tab object for rendering its content below the tab nav.
  const activeTabObj = tabs?.find((t) => t.key === activeTab);

  // Sidebar wrapped in a bordered panel. Width can be a number (px) or CSS string.
  const sidebarNode = sidebar ? (
    <div data-part="sidebar" style={s.sidebar(sidebarWidth)}>{sidebar}</div>
  ) : null;

  const mainNode = (
    <div style={s.main}>
      {tabs && tabs.length > 0 && (
        <>
          <div data-part="tab-list" style={s.tabsNav}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                data-part="tab-button"
                data-active={activeTab === tab.key ? 'true' : 'false'}
                data-disabled={tab.disabled ? 'true' : 'false'}
                style={s.tab(activeTab === tab.key, tab.disabled)}
                onClick={() => !tab.disabled && handleTabChange(tab.key)}
              >
                {tab.icon}
                {tab.label}
                {tab.badge != null && <span data-part="tab-badge" style={s.tabBadge}>{tab.badge}</span>}
              </button>
            ))}
          </div>
          <div data-part="tab-panel">{activeTabObj?.content}</div>
        </>
      )}
    </div>
  );

  return (
    <div
      className={`ds-pattern-detail-panel ds-engine-rustic ${className ?? ''}`}
      data-part="root"
      style={{ ...s.container, ...style }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div data-part="breadcrumbs" style={s.breadcrumbs}>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span data-part="breadcrumb-separator" style={s.breadcrumbSeparator}>/</span>}
              {b.href || b.onClick ? (
                <a href={b.href ?? '#'} data-part="breadcrumb-link" style={s.breadcrumbLink} onClick={b.onClick}>{b.label}</a>
              ) : (
                <span>{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header */}
      <div data-part="header" style={s.header}>
        <div style={s.headerLeft}>
          {onBack && (
            <button data-part="back-button" style={s.backBtn} onClick={onBack} aria-label="Back">
              &#8592;
            </button>
          )}
          {avatar && <div style={{ flexShrink: 0 }}>{avatar}</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.titleRow}>
              <h2 data-part="title" style={s.title}>{title}</h2>
              {status && (
                <span
                  data-part="status-badge"
                  style={
                    status.color
                      ? ({
                          '--ds-detail-panel-status-bg': status.color,
                          '--ds-detail-panel-status-fg': 'var(--ds-color-text-on-primary)',
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  {status.label}
                </span>
              )}
            </div>
            {subtitle && <div data-part="subtitle" style={s.subtitle}>{subtitle}</div>}
          </div>
        </div>
        {(actions || headerExtra) && (
          <div style={s.actions}>
            {headerExtra}
            {/* Action buttons. The per-variant chrome, the ghost/default hover tint
                (primary/danger excluded), and the double-ring focus indicator live in
                the rustic detail-panel skin keyed on data-variant. */}
            {actions?.map((a) => (
              <button
                key={a.key}
                data-part="action-button"
                data-variant={a.variant ?? 'default'}
                data-loading={a.loading ? 'true' : 'false'}
                style={{
                  ...s.btn,
                  opacity: a.disabled ? 0.5 : 1,
                  cursor: a.disabled ? 'not-allowed' : 'pointer',
                }}
                disabled={a.disabled || a.loading}
                onClick={a.onClick}
              >
                {a.icon}
                {a.loading ? 'Loading...' : a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body -- flex-direction reversal places the sidebar visually on the left
          while keeping the DOM order (main first) for screen readers. */}
      <div style={{
        ...s.body,
        flexDirection: sidebarPosition === 'left' ? 'row-reverse' : 'row',
      }}>
        {mainNode}
        {sidebarNode}
      </div>

      {/* Footer */}
      {footer && <div data-part="footer" style={s.footer}>{footer}</div>}
    </div>
  );
}
