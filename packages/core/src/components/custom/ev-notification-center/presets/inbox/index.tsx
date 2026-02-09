'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { NotificationCenterProps, Notification } from '../../core';

// Mock data for standalone demo
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    category: 'orders',
    title: 'New Order Received',
    message: 'Order #12345 has been placed by John Smith. Total: $248.50',
    timestamp: new Date('2026-02-09T14:30:00'),
    read: false,
    priority: 'high',
  },
  {
    id: '2',
    category: 'schedule',
    title: 'Shift Starting Soon',
    message: 'Your shift at Downtown Location starts in 30 minutes',
    timestamp: new Date('2026-02-09T13:45:00'),
    read: false,
    priority: 'normal',
  },
  {
    id: '3',
    category: 'announcements',
    title: 'System Maintenance Scheduled',
    message: 'Platform will be offline on Feb 15, 2:00-4:00 AM for scheduled maintenance',
    timestamp: new Date('2026-02-09T10:00:00'),
    read: true,
    priority: 'normal',
  },
  {
    id: '4',
    category: 'alerts',
    title: 'Low Stock Alert',
    message: 'Product "Premium Coffee Beans" is running low. Only 5 units remaining.',
    timestamp: new Date('2026-02-09T09:15:00'),
    read: false,
    priority: 'high',
  },
  {
    id: '5',
    category: 'promotions',
    title: 'Flash Sale Active',
    message: 'Spring Sale is now live! Promote 20% off all beverages to customers.',
    timestamp: new Date('2026-02-09T08:00:00'),
    read: true,
    priority: 'normal',
  },
  {
    id: '6',
    category: 'orders',
    title: 'Order Cancelled',
    message: 'Order #12344 has been cancelled by the customer',
    timestamp: new Date('2026-02-08T18:20:00'),
    read: true,
    priority: 'normal',
  },
  {
    id: '7',
    category: 'schedule',
    title: 'Schedule Updated',
    message: 'Your schedule for next week has been updated. Please review.',
    timestamp: new Date('2026-02-08T16:00:00'),
    read: true,
    priority: 'low',
  },
  {
    id: '8',
    category: 'alerts',
    title: 'Payment Failed',
    message: 'Subscription payment failed. Please update your payment method.',
    timestamp: new Date('2026-02-08T12:30:00'),
    read: false,
    priority: 'high',
  },
  {
    id: '9',
    category: 'announcements',
    title: 'New Feature Available',
    message: 'Check out our new analytics dashboard in the Reports section!',
    timestamp: new Date('2026-02-07T14:00:00'),
    read: true,
    priority: 'low',
  },
  {
    id: '10',
    category: 'orders',
    title: 'Large Order Alert',
    message: 'Catering order for 50 people received. Estimated prep time: 2 hours.',
    timestamp: new Date('2026-02-07T11:15:00'),
    read: true,
    priority: 'normal',
  },
];

export const NotificationCenterInbox = createPreset<NotificationCenterProps>({
  name: 'NotificationCenter.Inbox',
  render: (ctx: PresetContext<NotificationCenterProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const notifications = props.notifications || MOCK_NOTIFICATIONS;

    const getCategoryColor = (category: Notification['category']) => {
      switch (category) {
        case 'orders':
          return tokens.colors.primaryScale;
        case 'schedule':
          return tokens.colors.infoScale;
        case 'announcements':
          return tokens.colors.secondaryScale;
        case 'alerts':
          return tokens.colors.errorScale;
        case 'promotions':
          return tokens.colors.successScale;
        default:
          return tokens.colors.primaryScale;
      }
    };

    const getCategoryIcon = (category: Notification['category']) => {
      switch (category) {
        case 'orders':
          return '🛍️';
        case 'schedule':
          return '📅';
        case 'announcements':
          return '📢';
        case 'alerts':
          return '⚠️';
        case 'promotions':
          return '🎁';
        default:
          return '🔔';
      }
    };

    const formatTimestamp = (date: Date) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
        }).format(date);
      }
    };

    const categories: Notification['category'][] = [
      'orders',
      'schedule',
      'announcements',
      'alerts',
      'promotions',
    ];

    const getUnreadCount = (category?: Notification['category']) => {
      return notifications.filter((n) => !n.read && (!category || n.category === category)).length;
    };

    const totalUnread = getUnreadCount();

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
        }}
      >
        {/* Header */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[700],
                }}
              >
                Notifications
              </Text>
              {totalUnread > 0 && (
                <Box
                  style={{
                    ...createBadgeStyle(tokens, 'error'),
                    minWidth: '24px',
                    height: '24px',
                    borderRadius: tokens.borderRadius.full,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.bold,
                    }}
                  >
                    {totalUnread}
                  </Text>
                </Box>
              )}
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Stay updated with important events and messages
            </Text>
          </Box>
          {totalUnread > 0 && (
            <Box
              style={{
                ...createCardStyle(tokens),
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                backgroundColor: tokens.colors.primaryScale[50],
                borderColor: tokens.colors.primaryScale[200],
                cursor: 'pointer',
                ...createHoverStyle(tokens),
              }}
              onClick={() => notifications.filter(n => !n.read).forEach(n => props.onMarkRead?.(n.id))}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.primaryScale[700],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                ✓ Mark All Read
              </Text>
            </Box>
          )}
        </Box>

        {/* Category Tabs */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            flexWrap: 'wrap',
          }}
        >
          <Box
            style={{
              ...createFilterPillStyle(tokens, { active: true }),
              cursor: 'pointer',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              All ({notifications.length})
            </Text>
          </Box>
          {categories.map((category) => {
            const count = notifications.filter((n) => n.category === category).length;
            const unread = getUnreadCount(category);
            const categoryColor = getCategoryColor(category);

            return (
              <Box
                key={category}
                style={{
                  ...createFilterPillStyle(tokens, { active: false }),
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                  {getCategoryIcon(category)}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    textTransform: 'capitalize',
                  }}
                >
                  {category} ({count})
                </Text>
                {unread > 0 && (
                  <Box
                    style={{
                      ...createStatusDotStyle(tokens, categoryColor[500]),
                      width: '8px',
                      height: '8px',
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Notification List */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2],
            overflowY: 'auto',
          }}
        >
          {notifications.map((notification) => {
            const categoryColor = getCategoryColor(notification.category);
            const isUnread = !notification.read;

            return (
              <Box
                key={notification.id}
                style={{
                  ...createCardStyle(tokens),
                  padding: tokens.spacing[4],
                  display: 'flex',
                  gap: tokens.spacing[3],
                  cursor: 'pointer',
                  backgroundColor: isUnread
                    ? categoryColor[50]
                    : tokens.colors.neutral[100],
                  borderColor: isUnread ? categoryColor[200] : tokens.colors.neutral[200],
                  ...createHoverStyle(tokens),
                }}
                onClick={() => props.onNotificationClick?.(notification.id)}
              >
                {/* Category Icon */}
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: categoryColor[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.xl }}>
                    {getCategoryIcon(notification.category)}
                  </Text>
                </Box>

                {/* Content */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: tokens.spacing[3],
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[700],
                          }}
                        >
                          {notification.title}
                        </Text>
                        {isUnread && (
                          <Box
                            style={{
                              ...createStatusDotStyle(tokens, categoryColor[500]),
                              width: '8px',
                              height: '8px',
                            }}
                          />
                        )}
                      </Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[500],
                          marginTop: tokens.spacing[1],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {notification.message}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                      {notification.priority === 'high' && (
                        <Box
                          style={{
                            marginTop: tokens.spacing[1],
                            ...createStatusDotStyle(tokens, tokens.colors.errorScale[500]),
                            width: '6px',
                            height: '6px',
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Footer */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      marginTop: tokens.spacing[2],
                    }}
                  >
                    <Box
                      style={{
                        ...createBadgeStyle(tokens, notification.category === 'orders' ? 'primary' : notification.category === 'schedule' ? 'info' : notification.category === 'announcements' ? 'secondary' : notification.category === 'alerts' ? 'error' : 'success'),
                        fontSize: tokens.typography.fontSize.xs,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          textTransform: 'capitalize',
                        }}
                      >
                        {notification.category}
                      </Text>
                    </Box>
                    {notification.priority !== 'normal' && (
                      <Box
                        style={{
                          ...createBadgeStyle(
                            tokens,
                            notification.priority === 'high'
                              ? 'error'
                              : 'secondary'
                          ),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            textTransform: 'capitalize',
                          }}
                        >
                          {notification.priority}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
