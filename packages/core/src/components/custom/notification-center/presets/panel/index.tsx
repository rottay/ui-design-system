'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { NotificationCenterProps, Notification } from '../../core';

export default createPreset<NotificationCenterProps>((context: PresetContext<NotificationCenterProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const {
    notifications,
    categories,
    activeCategory,
    onCategoryChange,
    onRead,
    onReadAll,
    onDismiss,
    onClearAll,
    unreadCount,
    title,
    emptyMessage,
    className,
    style,
  } = props;

  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);

  const filteredNotifications = activeCategory
    ? notifications.filter((n) => n.category === activeCategory)
    : notifications;

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

  return (
    <Box className={className} style={style}>
      {/* Header */}
      <Box
        style={{
          boxShadow: tokens.shadows.md,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: tokens.spacing[4],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
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
                minWidth: '20px',
                height: '20px',
                padding: `0 ${tokens.spacing[1]}`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}
            >
              {actualUnreadCount}
            </Box>
          )}
        </Box>
        <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
          {actualUnreadCount > 0 && onReadAll && (
            <button
              onClick={onReadAll}
              style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                backgroundColor: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[900],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.common.white;
              }}
            >
              Mark all read
            </button>
          )}
          {onClearAll && notifications.length > 0 && (
            <button
              onClick={onClearAll}
              style={{
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                backgroundColor: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.common.white;
              }}
            >
              Clear all
            </button>
          )}
        </Box>
      </Box>

      {/* Category Filters */}
      {categories && categories.length > 0 && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[1],
            padding: tokens.spacing[4],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => onCategoryChange?.('')}
            style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${!activeCategory ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300]}`,
              backgroundColor: !activeCategory ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: !activeCategory ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              whiteSpace: 'nowrap',
            }}
          >
            All
          </button>
          {categories.map((category) => {
            const isActive = activeCategory === category.key;
            return (
              <button
                key={category.key}
                onClick={() => onCategoryChange?.(category.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300]}`,
                  backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {category.icon}
                {category.label}
              </button>
            );
          })}
        </Box>
      )}

      {/* Notifications List */}
      <Box
        style={{
          maxHeight: '600px',
          overflowY: 'auto',
        }}
      >
        {filteredNotifications.length === 0 ? (
          <Box
            style={{
              padding: tokens.spacing[8],
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[500],
              }}
            >
              {emptyMessage}
            </Text>
          </Box>
        ) : (
          filteredNotifications.map((notification) => {
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
                  padding: tokens.spacing[4],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                  cursor: notification.read ? 'default' : 'pointer',
                  transition: `background-color ${tokens.motion.hover}`,
                }}
              >
                {/* Unread Indicator */}
                <Box
                  style={{
                    width: '8px',
                    height: '8px',
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
                      width: '40px',
                      height: '40px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: `${typeColor}20`,
                      color: typeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
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
                    }}
                  >
                    {notification.title}
                  </Text>
                  {notification.description && (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {notification.description}
                    </Text>
                  )}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {notification.timestamp}
                    </Text>
                    {notification.actionLabel && notification.onAction && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.onAction?.();
                        }}
                        style={{
                          padding: 0,
                          border: 'none',
                          backgroundColor: 'transparent',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.primaryScale[600],
                          cursor: 'pointer',
                          transition: `color ${tokens.motion.hover}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = tokens.colors.primaryScale[700];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = tokens.colors.primaryScale[600];
                        }}
                      >
                        {notification.actionLabel}
                      </button>
                    )}
                  </Box>
                </Box>

                {/* Dismiss Button */}
                {isHovered && onDismiss && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notification.id);
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: tokens.borderRadius.md,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: tokens.colors.neutral[500],
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.lg,
                      transition: `all ${tokens.motion.hover}`,
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
    </Box>
  );
});
