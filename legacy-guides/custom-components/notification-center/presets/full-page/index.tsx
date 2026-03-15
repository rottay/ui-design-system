'use client';

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { NotificationCenterProps, Notification } from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
} from '../../../helpers';

export default createPreset<NotificationCenterProps>((context: PresetContext<NotificationCenterProps>) => {
  const { primitives, props, tokens, engine } = context;
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
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

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

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotifications(newSelection);
  };

  const handleBulkRead = () => {
    selectedNotifications.forEach((id) => {
      onRead?.(id);
    });
    setSelectedNotifications(new Set());
  };

  const handleBulkDismiss = () => {
    selectedNotifications.forEach((id) => {
      onDismiss?.(id);
    });
    setSelectedNotifications(new Set());
  };

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        display: 'flex',
        height: '100%',
        ...style,
      }}
    >
      {/* Sidebar */}
      <Box
        style={{
          width: '240px',
          borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          padding: tokens.spacing[4],
          flexShrink: 0,
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[4],
          }}
        >
          {title}
        </Text>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          <button
            onClick={() => onCategoryChange?.('')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: tokens.spacing[2],
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              backgroundColor: !activeCategory ? tokens.colors.primaryScale[50] : 'transparent',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: !activeCategory ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (activeCategory) {
                e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
              }
              e.currentTarget.style.transform = tokens.motion.transform;
            }}
            onMouseLeave={(e) => {
              if (activeCategory) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span>All Notifications</span>
            {actualUnreadCount > 0 && (
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: !activeCategory ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
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
          </button>
          {categories?.map((category) => {
            const isActive = activeCategory === category.key;
            const categoryCount = notifications.filter(
              (n) => n.category === category.key && !n.read
            ).length;

            return (
              <button
                key={category.key}
                onClick={() => onCategoryChange?.(category.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: tokens.spacing[2],
                  padding: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  {category.icon}
                  <span>{category.label}</span>
                </Box>
                {categoryCount > 0 && (
                  <Box
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                      color: tokens.colors.common.white,
                      borderRadius: tokens.borderRadius.full,
                      minWidth: '20px',
                      height: '20px',
                      padding: `0 ${tokens.spacing[1]}`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                    }}
                  >
                    {categoryCount}
                  </Box>
                )}
              </button>
            );
          })}
        </Box>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: tokens.spacing[4],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
            {selectedNotifications.size > 0 && (
              <>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {selectedNotifications.size} selected
                </Text>
                <button
                  onClick={handleBulkRead}
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
                  Mark as read
                </button>
                <button
                  onClick={handleBulkDismiss}
                  style={{
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    backgroundColor: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.errorScale[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.colors.errorScale[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                  }}
                >
                  Dismiss
                </button>
              </>
            )}
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
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

        {/* Notifications List */}
        <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[4] }}>
          {filteredNotifications.length === 0 ? (
            <Box
              style={{
                padding: tokens.spacing[8],
                textAlign: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  color: tokens.colors.neutral[500],
                }}
              >
                {emptyMessage}
              </Text>
            </Box>
          ) : (
            <Box style={{ maxWidth: '900px', margin: '0 auto' }}>
              {filteredNotifications.map((notification) => {
                const isHovered = hoveredNotification === notification.id;
                const isSelected = selectedNotifications.has(notification.id);
                const typeColor = getTypeColor(notification.type);

                return (
                  <Box
                    key={notification.id}
                    onMouseEnter={() => setHoveredNotification(notification.id)}
                    onMouseLeave={() => setHoveredNotification(null)}
                    style={{
                      display: 'flex',
                      gap: tokens.spacing[4],
                      padding: tokens.spacing[4],
                      marginBottom: tokens.spacing[2],
                      backgroundColor: isSelected
                        ? tokens.colors.primaryScale[50]
                        : isHovered
                        ? tokens.colors.neutral[50]
                        : tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      borderRadius: tokens.borderRadius.lg,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(notification.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        marginTop: tokens.spacing[1],
                      }}
                    />

                    {/* Unread Indicator */}
                    <Box
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: notification.read ? 'transparent' : tokens.colors.primaryScale[500],
                        marginTop: tokens.spacing[2],
                        flexShrink: 0,
                      }}
                    />

                    {/* Icon */}
                    {notification.icon && (
                      <Box
                        style={{
                          width: '48px',
                          height: '48px',
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
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: notification.read
                            ? tokens.typography.fontWeight.normal
                            : tokens.typography.fontWeight.semibold,
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
                            marginBottom: tokens.spacing[2],
                          }}
                        >
                          {notification.description}
                        </Text>
                      )}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
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
                              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`,
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
                          width: '32px',
                          height: '32px',
                          borderRadius: tokens.borderRadius.md,
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: tokens.colors.neutral[500],
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xl,
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
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
});
