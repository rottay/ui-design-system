'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the DetailPanel pattern.
 * Renders an entity detail view inside an Ant Design Card with a header
 * (avatar, title, status badge, action buttons), tabbed content via Ant Tabs,
 * an optional sidebar (left or right), breadcrumb navigation, and a footer.
 * Supports both controlled and uncontrolled tab state.
 *
 * @example
 * <ClassicDetailPanel
 *   data={user}
 *   title="Jane Doe"
 *   subtitle="Senior Engineer"
 *   status={{ label: 'Active', color: 'green' }}
 *   tabs={[
 *     { key: 'overview', label: 'Overview', content: <UserOverview /> },
 *     { key: 'activity', label: 'Activity', content: <ActivityLog />, badge: 12 },
 *   ]}
 *   actions={[{ key: 'edit', label: 'Edit', variant: 'primary', onClick: openEditor }]}
 *   onBack={() => router.back()}
 * />
 */

import React, { useState } from 'react';
import { Card, Tabs, Button, Breadcrumb, Space, Tag, Skeleton, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { DetailPanelProps } from '../../contracts';

/**
 * Classic (Ant Design) DetailPanel engine.
 *
 * Tab state can be controlled (via activeTab + onTabChange) or uncontrolled
 * (internal state, first tab selected by default). The sidebar is rendered
 * inside a nested Card for visual grouping.
 *
 * @typeParam T - Shape of the entity data object being displayed.
 * @param props - {@link DetailPanelProps} -- data, header info, tabs, sidebar, and actions.
 * @returns The detail view wrapped in an Ant Design Card.
 */
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

  // Uncontrolled tab state: defaults to the first tab's key. When the consumer
  // provides controlledActiveTab, internalActiveTab is ignored.
  const [internalActiveTab, setInternalActiveTab] = useState<string>(tabs?.[0]?.key ?? '');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  // Only update internal state when uncontrolled. Always notify the parent so
  // controlled consumers can sync their own state.
  const handleTabChange = (key: string) => {
    if (!controlledActiveTab) setInternalActiveTab(key);
    onTabChange?.(key);
  };

  // Loading skeleton: shows avatar + paragraph placeholders to approximate
  // the final layout before data arrives.
  if (loading) {
    return (
      <Card className={className} style={style}>
        <Skeleton active avatar paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
      </Card>
    );
  }

  // Breadcrumb node: items with href render as <a>, items with onClick render as
  // a clickable <span>, and plain items render as static text.
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

  // Header: left side has back button + avatar + title/status; right side has action buttons.
  // Action variant mapping: 'primary' -> Ant primary, 'ghost' -> text, 'danger' -> default+danger.
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
      {/* Action buttons and headerExtra are right-aligned. The variant prop maps to
          Ant Design's Button type/danger props. */}
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

  // Tabs node: each tab label optionally includes an icon (prepended) and a badge
  // (appended via Ant Tag). Tab content is rendered by Ant Tabs in a children slot.
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

  // minWidth:0 on the main content prevents flex children from overflowing
  // when tab content contains elements wider than the available space.
  const mainContent = (
    <div style={{ flex: 1, minWidth: 0 }}>
      {tabsNode}
    </div>
  );

  // Sidebar is wrapped in a compact Ant Card for visual separation from main content.
  const sidebarNode = sidebar ? (
    <div style={{ width: sidebarWidth, flexShrink: 0 }}>
      <Card size="small">{sidebar}</Card>
    </div>
  ) : null;

  // Layout: when a sidebar is present, main + sidebar are arranged in a flex row.
  // sidebarPosition controls which side it appears on. Without a sidebar, tabs
  // span the full width.
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
        <div style={{ marginTop: 16, borderTop: '1px solid var(--ds-color-border-subtle)', paddingTop: 16 }}>
          {footer}
        </div>
      )}
    </Card>
  );
}
