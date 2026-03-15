'use client';

/**
 * PageShell - Classic Engine (Ant Design)
 */

import React from 'react';
import { Breadcrumb, Button, Tabs, Space, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { PageShellProps } from '../PageShell.types';

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

  if (loading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: 48, ...style }}>
        <Spin />
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: maxWidth ?? undefined,
    margin: maxWidth ? '0 auto' : undefined,
    ...style,
  };

  return (
    <div className={`ds-pattern-page-shell ds-engine-classic ${className ?? ''}`} style={containerStyle}>
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

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: tabs ? 0 : 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: 1.3 }}>{title}</h1>
              {badge}
            </div>
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

      {(!tabs || tabs.length === 0) && children}
    </div>
  );
}
