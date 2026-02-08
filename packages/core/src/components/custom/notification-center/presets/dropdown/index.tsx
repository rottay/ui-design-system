'use client';

import {useState, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createFilterPillStyle,
  createHoverStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { NotificationCenterProps, Notification } from '../../core';

export default createPreset<NotificationCenterProps>((context: PresetContext<NotificationCenterProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const {
    notifications,
    onRead,
    onReadAll,
    onDismiss,
    unreadCount,
    title,
    emptyMessage,
    className,
    style,
  } = props;

  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);

  const actualUnreadCount = unreadCount !== undefined
    ? unreadCount
    : notifications.filter((n) => !n.read).length;

  const getTypeColor = (type?: Notification['type']) => {
    switch (type) {
      case 'success':
        return tokens.colors.successScale[500];
      case 'warning':
        return tokens.colors.warningScale[500];
      case 'error':
        return tokens.colors.errorScale[500];
      case 'info':
        return tokens.colors.infoScale[500];
      case 'mention':
        return tokens.colors.primaryScale[500];
      default:
        return tokens.colors.neutral[500];
    }
  };

  const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, { elevation: 'xl' }), [tokens]);

  return (
    <Box
      className={className}
      style={{
        ...surfaceStyle,
        width: '380px',
        maxHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: tokens.spacing[4],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          flexShrink: 0,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}
          >
            {title}
          </Text>
          {actualUnreadCount > 0 && (
            <Box
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.full,
                minWidth: '18px',
                height: '18px',
                padding: `0 ${tokens.spacing[1]}`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}
            >
              {actualUnreadCount}
            </Box>
          )}
        </Box>
        {actualUnreadCount > 0 && onReadAll && (
          <button
            onClick={onReadAll}
            style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.primaryScale[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50];
              e.currentTarget.style.transform = tokens.motion.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'none';
            }}
          >
            Mark all read
          </button>
        )}
      </Box>

      {/* Notifications List */}
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '400px',
        }}
      >
        {notifications.length === 0 ? (
          <Box
            style={{
              padding: tokens.spacing[8],
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              {emptyMessage}
            </Text>
          </Box>
        ) : (
          notifications.slice(0, 8).map((notification) => {
            const isHovered = hoveredNotification === notification.id;
            const typeColor = getTypeColor(notification.type);

            return (
              <Box
                key={notification.id}
                onMouseEnter={() => setHoveredNotification(notification.id)}
                onMouseLeave={() => setHoveredNotification(null)}
                onClick={() => {
                  if (!notification.read && onRead) {
                    onRead(notification.id);
                  }
                }}
                style={{
                  display: 'flex',
                  gap: tokens.spacing[2],
                  padding: tokens.spacing[2],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                  cursor: notification.read ? 'default' : 'pointer',
                  transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                }}
              >
                {/* Unread Indicator */}
                <Box
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: notification.read ? 'transparent' : tokens.colors.primaryScale[500],
                    marginTop: tokens.spacing[1],
                    flexShrink: 0,
                  }}
                />

                {/* Icon */}
                {notification.icon && (
                  <Box
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: `${typeColor}20`,
                      color: typeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                  >
                    {notification.icon}
                  </Box>
                )}

                {/* Content */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: notification.read ? tokens.typography.fontWeight.normal : tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[1],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {notification.title}
                  </Text>
                  {notification.description && (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {notification.description}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {notification.timestamp}
                  </Text>
                </Box>

                {/* Dismiss Button */}
                {isHovered && onDismiss && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notification.id);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: tokens.colors.neutral[500],
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.md,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.neutral[200];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    ×
                  </button>
                )}
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <Box
          style={{
            padding: tokens.spacing[2],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <button
            style={{
              width: '100%',
              padding: tokens.spacing[2],
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.primaryScale[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            View all notifications
          </button>
        </Box>
      )}
    </Box>
  );
});
