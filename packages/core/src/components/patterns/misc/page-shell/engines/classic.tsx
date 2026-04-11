'use client';

/**
 * @fileoverview PageShell -- Classic engine (Ant Design).
 * Standard page layout shell with breadcrumb navigation, back button,
 * title/subtitle header with optional badge and action buttons, and
 * tab-based content switching. Uses Ant Design's Breadcrumb, Tabs,
 * Button, and Spin components. Supports optional maxWidth constraint
 * for centered content layouts.
 *
 * @example
 * <ClassicPageShell
 *   title="Users"
 *   subtitle="Manage platform users"
 *   breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
 *   actions={<Button type="primary">Add User</Button>}
 * >
 *   <UserTable />
 * </ClassicPageShell>
 */

import React from 'react';
import { Breadcrumb, Button, Tabs, Space, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { PageShellProps } from '../PageShell.types';

/**
 * Classic (Ant Design) implementation of the PageShell pattern.
 * Provides breadcrumb navigation, title area with actions, and
 * optional tab-based content switching via Ant's Tabs component.
 *
 * @param props - See {@link PageShellProps} for the full prop contract.
 * @returns The rendered page shell layout.
 */
export default function ClassicPageShell(props: PageShellProps) {
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

  /* Short-circuit: show Ant Spin when data is still loading */
  if (loading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: 48, ...style }}>
        <Spin />
      </div>
    );
  }

  /* Apply maxWidth constraint and auto-center when a width limit is provided */
  const containerStyle: React.CSSProperties = {
    maxWidth: maxWidth ?? undefined,
    margin: maxWidth ? '0 auto' : undefined,
    ...style,
  };

  // Shell-grid: subtle background grid driven by premium chrome tokens.
  // --ds-shell-grid-size defaults to 0px (no grid) for tenants that don't set it.
  const gridBg = 'repeating-linear-gradient(0deg, var(--ds-shell-grid-line, transparent) 0 1px, transparent 1px var(--ds-shell-grid-size, 0px)), repeating-linear-gradient(90deg, var(--ds-shell-grid-line, transparent) 0 1px, transparent 1px var(--ds-shell-grid-size, 0px))';

  return (
    <div
      className={`ds-pattern-page-shell ds-engine-classic ${className ?? ''}`}
      style={{
        ...containerStyle,
        backgroundImage: gridBg,
        backgroundSize: `var(--ds-shell-grid-size, 0px) var(--ds-shell-grid-size, 0px)`,
        opacity: undefined, // container opacity stays at 1; grid opacity is visual only
      }}
    >
      {/* Breadcrumb navigation -- supports both href links and onClick handlers.
           When onClick is provided alongside href, we prevent default to use the handler. */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={breadcrumbs.map((bc) => ({
            title: bc.href ? (
              <a href={bc.href} onClick={bc.onClick ? (e) => { e.preventDefault(); bc.onClick!(); } : undefined}>
                {bc.label}
              </a>
            ) : bc.onClick ? (
              <a onClick={bc.onClick} style={{ cursor: 'pointer' }}>{bc.label}</a>
            ) : (
              bc.label
            ),
          }))}
        />
      )}

      {/* Header row: title/back on left, actions on right.
           Bottom margin is suppressed when tabs are present since Tabs adds its own spacing. */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: tabs ? 0 : 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back button uses Ant's text-type button for minimal visual weight */}
          {back && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={back.onClick}
              size="small"
            >
              {back.label}
            </Button>
          )}
          <div>
            {/* Title + optional badge inline. Badge is typically a status Tag. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: 1.3 }}>{title}</h1>
              {badge}
            </div>
            {/* Subtitle uses a triple-fallback color chain for maximum theme compatibility */}
            {subtitle && (
              <div
                style={{
                  color:
                    'var(--ds-page-shell-subtitle-color, var(--ds-color-text-secondary, var(--ds-color-neutral-600, rgba(0,0,0,0.45))))',
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {actions && <Space>{actions}</Space>}
      </div>

      {/* Tabs -- when present, tab content replaces children. First tab is active by default. */}
      {tabs && tabs.length > 0 && (
        <Tabs
          activeKey={activeTab ?? tabs[0].key}
          onChange={onTabChange}
          items={tabs.map((tab) => ({
            key: tab.key,
            label: tab.label,
            children: tab.content,
          }))}
          style={{ marginTop: 8 }}
        />
      )}

      {/* Render children only when no tabs are present */}
      {(!tabs || tabs.length === 0) && children}
    </div>
  );
}
