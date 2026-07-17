'use client';

/**
 * @fileoverview Classic engine for the NotificationCenter pattern, powered by Ant Design.
 * Renders a bell-icon trigger with an unread badge, opening an Ant Popover that
 * contains a scrollable List of notifications. Supports controlled and uncontrolled
 * open state, read/clear per-item and bulk actions, and a custom trigger element.
 *
 * Relies on Ant's Popover for positioning and List for virtualizable item layout.
 *
 * @example
 * <ClassicNotificationCenter
 *   notifications={[{ id: '1', title: 'Deployed', message: 'v2.3.0 is live', type: 'success', read: false, timestamp: new Date().toISOString() }]}
 *   onRead={(id) => markRead(id)}
 *   onReadAll={() => markAllRead()}
 * />
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
import type { NotificationCenterProps, Notification } from '../../contracts';

// Default icons per notification type using Ant's outlined icon set.
// Each icon is colored via the design system's semantic color tokens so they
// adapt when the theme changes without any code modifications.
const typeIcons: Record<string, React.ReactNode> = {
  info: <InfoCircleOutlined style={{ color: 'var(--ds-color-info)' }} />,
  success: <CheckCircleOutlined style={{ color: 'var(--ds-color-success)' }} />,
  warning: <WarningOutlined style={{ color: 'var(--ds-color-warning)' }} />,
  error: <CloseCircleOutlined style={{ color: 'var(--ds-color-error)' }} />,
};

// Ant Tag color strings mapped from notification types. Used only when
// rendering type indicators via Tag components (currently unused in the
// default layout but available if consumers extend the item renderer).
const typeColors: Record<string, string> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
};

// Progressive degradation from relative ("3m ago") to calendar ("Mar 5")
// keeps recent notifications scannable while older ones stay unambiguous.
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

/**
 * Classic (Ant Design) engine for the NotificationCenter pattern.
 *
 * Uses Ant's Popover as the dropdown container and List for notification items.
 * Supports both controlled (`open` / `onOpenChange`) and uncontrolled modes.
 * The bell trigger renders an Ant Badge with the unread count.
 *
 * @param props - {@link NotificationCenterProps}
 * @returns A bell-icon trigger with a popover notification list.
 */
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

  // Controlled/uncontrolled open state pattern: when `controlledOpen` is
  // provided, internal state is ignored and the parent drives visibility.
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  // Prefer the explicit unreadCount prop (server-authoritative) over client-side
  // counting, since the notification array may be paginated or incomplete.
  const displayCount = unreadCount ?? notifications.filter(n => !n.read).length;
  // Limit the rendered list to avoid performance issues with very large backlogs.
  const visibleNotifications = notifications.slice(0, maxVisible);

  // The popover content is built as a flex column: fixed header on top,
  // scrollable list body below. Max height is capped to prevent the popover
  // from growing taller than the viewport on long notification lists.
  const content = (
    <div style={{ width: 360, maxHeight: 420, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header with bulk actions. "Mark all read" only shows when there are
          unread items; "Clear all" only shows when there are items at all. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--ds-color-border-secondary, var(--ds-color-neutral-200, #e5e7eb))' }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ds-color-text-primary, var(--ds-color-neutral-900, #171717))' }}>Notifications</span>
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

      {/* Scrollable notification list. Uses Ant List for consistent item spacing.
          Unread items get a tinted background via the DS token, falling back to
          the primary-50 shade when the notification-center-specific token is unset. */}
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
                  background: item.read
                    ? undefined
                    : 'var(--ds-notification-center-unread-bg, var(--ds-color-primary-50))',
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
                      {!item.read && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--ds-notification-center-unread-dot, var(--ds-color-primary-500))',
                          }}
                        />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--ds-notification-center-message-color, var(--ds-color-text-secondary))',
                          marginBottom: 4,
                        }}
                      >
                        {item.message}
                      </div>
                      {/* Footer row: relative timestamp on the left, optional
                          action button on the right. stopPropagation on the action
                          prevents it from also triggering the row-level onRead. */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--ds-notification-center-timestamp-color, var(--ds-color-text-tertiary))',
                          }}
                        >
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

  // Popover is positioned bottom-right with no arrow to match typical app-bar
  // dropdown patterns. The body padding is zeroed because the content already
  // manages its own internal padding.
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
        {/* When a custom trigger is provided, it replaces the default bell.
            The Badge wraps the default trigger to overlay the unread count. */}
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
