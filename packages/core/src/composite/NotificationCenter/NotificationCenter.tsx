import React from 'react';
import { Dropdown, Badge, Button, Empty, Divider, theme } from 'antd';
import { Avatar } from '../../components/Display/Avatar';
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import type { NotificationCenterProps, Notification } from './types';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  showBadge = true,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  placement = 'bottomRight',
  trigger = ['click'],
  maxHeight = 500,
  emptyText = 'No notifications',
  className,
  style,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();

  // Calculate unread count if not provided
  const calculatedUnreadCount =
    unreadCount !== undefined
      ? unreadCount
      : notifications.filter((n) => !n.read).length;

  // Theme-specific icon button styles
  const getIconButtonStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        };
      case 'stripe':
      case 'vercel':
        return {
          width: 36,
          height: 36,
          borderRadius: 6,
          background: 'transparent',
          border: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        };
      case 'notion':
        return {
          width: 32,
          height: 32,
          borderRadius: 3,
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        };
      case 'linear':
        return {
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'rgba(0, 0, 0, 0.03)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        };
      case 'airbnb':
        return {
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'transparent',
          border: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        };
      default:
        return {
          width: 36,
          height: 36,
          borderRadius: 8,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        };
    }
  };

  // Theme-specific dropdown content styles
  const getDropdownContentStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          width: 380,
          background: '#282828',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        };
      case 'stripe':
        return {
          width: 400,
          background: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${token.colorBorder}`,
        };
      case 'notion':
        return {
          width: 360,
          background: '#FFFFFF',
          borderRadius: 3,
          boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 3px 6px, rgba(15, 15, 15, 0.4) 0px 9px 24px',
        };
      case 'linear':
        return {
          width: 420,
          background: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${token.colorBorder}`,
        };
      default:
        return {
          width: 380,
          background: token.colorBgElevated,
          borderRadius: 8,
          boxShadow: token.boxShadow,
        };
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} style={{ color: token.colorSuccess }} />;
      case 'warning':
        return <AlertTriangle size={20} style={{ color: token.colorWarning }} />;
      case 'error':
        return <XCircle size={20} style={{ color: token.colorError }} />;
      default:
        return <Info size={20} style={{ color: token.colorPrimary }} />;
    }
  };

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Dropdown content
  const dropdownContent = (
    <div style={getDropdownContentStyles()}>
      {/* Header */}
      <div
        style={{
          padding: template === 'linear' ? '20px 20px 16px' : '16px 16px 12px',
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: template === 'linear' ? 18 : template === 'notion' ? 15 : 16,
              fontWeight: template === 'spotify' || template === 'notion' ? 700 : 600,
            }}
          >
            Notifications
            {calculatedUnreadCount > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  color: token.colorTextSecondary,
                }}
              >
                ({calculatedUnreadCount} unread)
              </span>
            )}
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {onMarkAllAsRead && calculatedUnreadCount > 0 && (
              <Button
                type="text"
                size="small"
                icon={<Check size={14} />}
                onClick={onMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
            {onClearAll && notifications.length > 0 && (
              <Button
                type="text"
                size="small"
                icon={<Trash2 size={14} />}
                danger
                onClick={onClearAll}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 48 }}>
            <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <div
                onClick={() => onNotificationClick?.(notification)}
                style={{
                  padding: template === 'linear' ? '16px 20px' : '12px 16px',
                  cursor: 'pointer',
                  background: notification.read ? 'transparent' : token.colorBgTextActive,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (notification.read) {
                    e.currentTarget.style.background =
                      template === 'spotify'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : token.controlItemBgHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (notification.read) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {notification.avatar ? (
                    <Avatar src={notification.avatar} size={40} />
                  ) : (
                    <div>{getNotificationIcon(notification)}</div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: notification.read ? 400 : 600,
                        marginBottom: 4,
                      }}
                    >
                      {notification.title}
                    </div>

                    {notification.description && (
                      <div
                        style={{
                          fontSize: 13,
                          color: token.colorTextSecondary,
                          marginBottom: 6,
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.description}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: token.colorTextTertiary,
                        }}
                      >
                        {formatTimestamp(notification.timestamp)}
                      </span>

                      {notification.actionLabel && (
                        <>
                          <span style={{ color: token.colorTextTertiary }}>·</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.onAction?.();
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              padding: 0,
                              fontSize: 12,
                              color: token.colorPrimary,
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            {notification.actionLabel}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {!notification.read && onMarkAsRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 4,
                        cursor: 'pointer',
                        color: token.colorTextSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 4,
                      }}
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
              {index < notifications.length - 1 && (
                <Divider style={{ margin: 0 }} />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      placement={placement}
      trigger={trigger}
    >
      <div className={className} style={{ ...getIconButtonStyles(), ...style }}>
        <Badge count={showBadge ? calculatedUnreadCount : 0} size="small" offset={[2, -2]}>
          <Bell size={18} style={{ color: token.colorText }} />
        </Badge>
      </div>
    </Dropdown>
  );
};

NotificationCenter.displayName = 'NotificationCenter';
