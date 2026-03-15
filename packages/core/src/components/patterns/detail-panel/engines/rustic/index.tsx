'use client';

/**
 * DetailPanel - Rustic Engine (Vanilla HTML/CSS with --ds-* vars)
 */

import React, { useState } from 'react';
import type { DetailPanelProps, DetailAction } from '../../types';

const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    color: 'var(--ds-color-neutral-900)',
    background: 'var(--ds-color-neutral-0, #fff)',
    border: '1px solid var(--ds-color-neutral-200)',
    borderRadius: 'var(--ds-radius-lg)',
    padding: 'var(--ds-card-body-padding, 1.5rem)',
    boxShadow: 'var(--ds-card-shadow, none)',
  } as React.CSSProperties,
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: 'var(--ds-font-size-sm)',
    color: 'var(--ds-color-neutral-500)',
    marginBottom: '1rem',
  } as React.CSSProperties,
  breadcrumbLink: {
    color: 'var(--ds-color-primary-600)',
    textDecoration: 'none',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    fontSize: 'inherit',
  } as React.CSSProperties,
  breadcrumbSeparator: {
    margin: '0 0.25rem',
    color: 'var(--ds-color-neutral-400)',
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
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    color: 'var(--ds-color-neutral-600)',
    fontSize: '1.25rem',
    lineHeight: 1,
    borderRadius: 'var(--ds-radius-sm)',
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
    color: 'var(--ds-color-neutral-500)',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  badge: (color?: string) => ({
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: 'var(--ds-radius-full, 9999px)',
    fontSize: 'var(--ds-font-size-xs)',
    fontWeight: 500,
    background: color ?? 'var(--ds-color-neutral-200)',
    color: color ? 'var(--ds-color-text-on-primary)' : 'var(--ds-color-neutral-700)',
  } as React.CSSProperties),
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  } as React.CSSProperties,
  btn: (variant: DetailAction['variant']) => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.375rem 0.75rem',
      borderRadius: 'var(--ds-radius-md)',
      fontSize: 'var(--ds-font-size-sm)',
      fontWeight: 500,
      cursor: 'pointer',
      border: '1px solid var(--ds-color-neutral-300)',
      background: 'var(--ds-color-neutral-0, #fff)',
      color: 'var(--ds-color-neutral-700)',
      transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
    };
    if (variant === 'primary') {
      base.background = 'var(--ds-color-primary-600)';
      base.color = 'var(--ds-color-text-on-primary)';
      base.borderColor = 'var(--ds-color-primary-600)';
    } else if (variant === 'danger') {
      base.background = 'var(--ds-color-error-600, #dc2626)';
      base.color = 'var(--ds-color-text-on-primary)';
      base.borderColor = 'var(--ds-color-error-600, #dc2626)';
    } else if (variant === 'ghost') {
      base.border = '1px solid transparent';
      base.background = 'transparent';
    }
    return base;
  },
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
    background: 'var(--ds-color-neutral-50)',
    borderRadius: 'var(--ds-radius-md)',
    padding: '1rem',
    border: '1px solid var(--ds-color-neutral-200)',
  } as React.CSSProperties),
  tabsNav: {
    display: 'flex',
    borderBottom: '2px solid var(--ds-color-neutral-200)',
    marginBottom: '1rem',
    gap: 0,
  } as React.CSSProperties,
  tab: (active: boolean, disabled?: boolean) => ({
    padding: '0.5rem 1rem',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: active ? 'var(--ds-typography-heading-font-weight, 600)' : 400,
    letterSpacing: active ? 'var(--ds-typography-heading-letter-spacing, normal)' : 'normal',
    color: disabled
      ? 'var(--ds-color-neutral-400)'
      : active
        ? 'var(--ds-color-primary-600)'
        : 'var(--ds-color-neutral-600)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--ds-color-primary-600)' : '2px solid transparent',
    marginBottom: '-2px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: `color ${RUSTIC_DURATION} ${RUSTIC_EASING}, border-color ${RUSTIC_DURATION} ${RUSTIC_EASING}, font-weight ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties),
  tabBadge: {
    display: 'inline-block',
    padding: '0 0.375rem',
    borderRadius: 'var(--ds-radius-full, 9999px)',
    fontSize: 'var(--ds-font-size-xs)',
    background: 'var(--ds-color-neutral-200)',
    color: 'var(--ds-color-neutral-600)',
    lineHeight: '1.4',
  } as React.CSSProperties,
  footer: {
    marginTop: 'var(--ds-card-body-padding, 1rem)',
    paddingTop: 'var(--ds-card-body-padding, 1rem)',
    borderTop: '1px var(--ds-divider-style, solid) var(--ds-divider-color, var(--ds-color-neutral-200))',
  } as React.CSSProperties,
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-200)',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

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

  const [internalActiveTab, setInternalActiveTab] = useState<string>(tabs?.[0]?.key ?? '');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (key: string) => {
    if (!controlledActiveTab) setInternalActiveTab(key);
    onTabChange?.(key);
  };

  if (loading) {
    return (
      <div className={className} style={{ ...s.container, ...style }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={s.skeleton('3rem', '3rem')} />
          <div style={{ flex: 1 }}>
            <div style={s.skeleton('40%', '1.25rem')} />
            <div style={{ ...s.skeleton('25%', '0.875rem'), marginTop: '0.5rem' }} />
          </div>
        </div>
        <div style={{ ...s.skeleton('100%', '2rem'), marginTop: '1.5rem' }} />
        <div style={{ ...s.skeleton('100%', '10rem'), marginTop: '0.75rem' }} />
      </div>
    );
  }

  const activeTabObj = tabs?.find((t) => t.key === activeTab);

  const sidebarNode = sidebar ? (
    <div style={s.sidebar(sidebarWidth)}>{sidebar}</div>
  ) : null;

  const mainNode = (
    <div style={s.main}>
      {tabs && tabs.length > 0 && (
        <>
          <div style={s.tabsNav}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                style={s.tab(activeTab === tab.key, tab.disabled)}
                onClick={() => !tab.disabled && handleTabChange(tab.key)}
              >
                {tab.icon}
                {tab.label}
                {tab.badge != null && <span style={s.tabBadge}>{tab.badge}</span>}
              </button>
            ))}
          </div>
          <div>{activeTabObj?.content}</div>
        </>
      )}
    </div>
  );

  return (
    <div className={className} style={{ ...s.container, ...style }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={s.breadcrumbs}>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={s.breadcrumbSeparator}>/</span>}
              {b.href || b.onClick ? (
                <a href={b.href ?? '#'} style={s.breadcrumbLink} onClick={b.onClick}>{b.label}</a>
              ) : (
                <span>{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          {onBack && (
            <button style={s.backBtn} onClick={onBack} aria-label="Back">
              &#8592;
            </button>
          )}
          {avatar && <div style={{ flexShrink: 0 }}>{avatar}</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.titleRow}>
              <h2 style={s.title}>{title}</h2>
              {status && <span style={s.badge(status.color)}>{status.label}</span>}
            </div>
            {subtitle && <div style={s.subtitle}>{subtitle}</div>}
          </div>
        </div>
        {(actions || headerExtra) && (
          <div style={s.actions}>
            {headerExtra}
            {actions?.map((a) => (
              <button
                key={a.key}
                style={{
                  ...s.btn(a.variant),
                  opacity: a.disabled ? 0.5 : 1,
                  cursor: a.disabled ? 'not-allowed' : 'pointer',
                }}
                disabled={a.disabled || a.loading}
                onClick={a.onClick}
                onMouseEnter={(e) => {
                  if (!a.disabled && (a.variant === 'ghost' || !a.variant)) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = 'var(--ds-color-primary-600)';
                    el.style.background = 'var(--ds-color-primary-50, rgba(99,102,241,0.06))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!a.disabled && (a.variant === 'ghost' || !a.variant)) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = a.variant === 'ghost' ? 'var(--ds-color-neutral-700)' : '';
                    el.style.background = a.variant === 'ghost' ? 'transparent' : '';
                  }
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 2px var(--ds-color-bg-primary, #fff), 0 0 0 4px var(--ds-color-primary-400, #818cf8)';
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {a.icon}
                {a.loading ? 'Loading...' : a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{
        ...s.body,
        flexDirection: sidebarPosition === 'left' ? 'row-reverse' : 'row',
      }}>
        {mainNode}
        {sidebarNode}
      </div>

      {/* Footer */}
      {footer && <div style={s.footer}>{footer}</div>}
    </div>
  );
}
