'use client';

/**
 * NotificationCenter - Classic Engine (Ant Design)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Badge, Button, Popover, List, Tag, Empty, Space } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { NotificationCenterProps, Notification } from '../../types';

const typeIcons: Record<string, React.ReactNode> = {
  info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  warning: <WarningOutlined style={{ color: '#faad14' }} />,
  error: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
};

const typeColors: Record<string, string> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ClassicNotificationCenter(props: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    onRead,
    onReadAll,
    onClear,
    onClearAll,
    trigger,
    open: controlledOpen,
    onOpenChange,
    emptyMessage = 'No notifications',
    maxVisible = 10,
    loading,
    className,
    style,
  } = props;

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const displayCount = unreadCount ?? notifications.filter(n => !n.read).length;
  const visibleNotifications = notifications.slice(0, maxVisible);

  const content = (
    <div style={{ width: 360, maxHeight: 420, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
        <Space size="small">
          {onReadAll && displayCount > 0 && (
            <Button type="link" size="small" onClick={() => { onReadAll(); }}>
              Mark all read
            </Button>
          )}
          {onClearAll && notifications.length > 0 && (
            <Button type="link" size="small" onClick={() => { onClearAll(); }}>
              Clear all
            </Button>
          )}
        </Space>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visibleNotifications.length === 0 ? (
          <Empty description={emptyMessage} style={{ padding: 32 }} />
        ) : (
          <List
            dataSource={visibleNotifications}
            renderItem={(item: Notification) => (
              <List.Item
                key={item.id}
                style={{
                  padding: '10px 12px',
                  background: item.read ? undefined : 'rgba(24, 144, 255, 0.04)',
                  cursor: 'pointer',
                }}
                onClick={() => onRead?.(item.id)}
                actions={onClear ? [
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={(e) => { e.stopPropagation(); onClear(item.id); }}
                  />,
                ] : undefined}
              >
                <List.Item.Meta
                  avatar={item.icon || typeIcons[item.type]}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: item.read ? 400 : 600 }}>{item.title}</span>
                      {!item.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1890ff' }} />}
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>
                        {item.message}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>
                          {formatTimestamp(item.timestamp)}
                        </span>
                        {item.action && (
                          <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); item.action!.onClick(); }}>
                            {item.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className={`ds-pattern-notification-center ds-engine-classic ${className ?? ''}`} style={style}>
      <Popover
        content={content}
        trigger="click"
        open={isOpen}
        onOpenChange={handleOpenChange}
        placement="bottomRight"
        arrow={false}
        styles={{ body: { padding: 0 } }}
      >
        {trigger || (
          <Badge count={displayCount} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 20 }} />}
              aria-label="Notifications"
              data-testid="notification-trigger"
            />
          </Badge>
        )}
      </Popover>
    </div>
  );
}
