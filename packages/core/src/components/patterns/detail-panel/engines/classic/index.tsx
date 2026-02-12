'use client';

/**
 * DetailPanel - Classic Engine (Ant Design)
 */

import React, { useState } from 'react';
import { Card, Tabs, Button, Breadcrumb, Space, Tag, Skeleton, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { DetailPanelProps } from '../../types';

export default function ClassicDetailPanel<T>(props: DetailPanelProps<T>) {
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
      <Card className={className} style={style}>
        <Skeleton active avatar paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
      </Card>
    );
  }

  const breadcrumbNode = breadcrumbs && breadcrumbs.length > 0 ? (
    <Breadcrumb
      style={{ marginBottom: 16 }}
      items={breadcrumbs.map((b) => ({
        title: b.href ? (
          <a href={b.href} onClick={b.onClick}>{b.label}</a>
        ) : (
          <span style={{ cursor: b.onClick ? 'pointer' : undefined }} onClick={b.onClick}>
            {b.label}
          </span>
        ),
      }))}
    />
  ) : null;

  const headerNode = (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        {onBack && (
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} />
        )}
        {avatar && <div style={{ flexShrink: 0 }}>{avatar}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{title}</span>
            {status && (
              <Tag color={status.color}>{status.label}</Tag>
            )}
          </div>
          {subtitle && (
            <div style={{ color: 'rgba(0,0,0,0.45)', marginTop: 4 }}>{subtitle}</div>
          )}
        </div>
      </div>
      {(actions || headerExtra) && (
        <Space>
          {headerExtra}
          {actions?.map((action) => (
            <Button
              key={action.key}
              type={action.variant === 'primary' ? 'primary' : action.variant === 'ghost' ? 'text' : 'default'}
              danger={action.variant === 'danger'}
              icon={action.icon}
              disabled={action.disabled}
              loading={action.loading}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      )}
    </div>
  );

  const tabsNode = tabs && tabs.length > 0 ? (
    <Tabs
      activeKey={activeTab}
      onChange={handleTabChange}
      items={tabs.map((tab) => ({
        key: tab.key,
        label: (
          <span>
            {tab.icon && <span style={{ marginRight: 6 }}>{tab.icon}</span>}
            {tab.label}
            {tab.badge != null && (
              <Tag style={{ marginLeft: 6 }}>{tab.badge}</Tag>
            )}
          </span>
        ),
        children: tab.content,
        disabled: tab.disabled,
      }))}
    />
  ) : null;

  const mainContent = (
    <div style={{ flex: 1, minWidth: 0 }}>
      {tabsNode}
    </div>
  );

  const sidebarNode = sidebar ? (
    <div style={{ width: sidebarWidth, flexShrink: 0 }}>
      <Card size="small">{sidebar}</Card>
    </div>
  ) : null;

  const bodyNode = sidebar ? (
    <div style={{ display: 'flex', gap: 16, marginTop: tabs ? 0 : 16 }}>
      {sidebarPosition === 'left' && sidebarNode}
      {mainContent}
      {sidebarPosition === 'right' && sidebarNode}
    </div>
  ) : (
    <div style={{ marginTop: tabs ? 0 : 16 }}>{tabsNode}</div>
  );

  return (
    <Card className={className} style={style}>
      {breadcrumbNode}
      {headerNode}
      <div style={{ marginTop: 16 }}>{bodyNode}</div>
      {footer && (
        <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          {footer}
        </div>
      )}
    </Card>
  );
}
