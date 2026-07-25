'use client';

/**
 * @fileoverview NotificationSurface -- notification center with preferences.
 * @description Composes notification history list and preference management into
 * tabbed or sectioned layouts. The app owns notification data and preference
 * persistence; this surface standardizes the page structure.
 */

import React, { useMemo } from 'react';
import { Badge, Box, Button, Card, Flex, Stack, Switch, Tabs, Tag, Text } from '../../../../../primitives';
import type { SurfaceNotificationItem, NotificationPreference, NotificationSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface NotificationSurfaceProps {
  config: NotificationSurfaceConfig;
  loading?: boolean;
}

// Maps notification types to tag color tokens. 'info' and undefined both
// resolve to 'processing' (blue) because untyped notifications should feel
// neutral rather than alarming.
function notificationTypeColor(type?: SurfaceNotificationItem['type']): string {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'info':
    default:
      return 'processing';
  }
}

function NotificationList({
  notifications,
  onMarkRead,
  onDelete,
  emptyState,
}: {
  notifications: SurfaceNotificationItem[];
  onMarkRead?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  emptyState?: React.ReactNode;
}): React.ReactElement {
  if (notifications.length === 0) {
    return (
      <Card className="ds-notification__empty-card" variant="outlined">
        <Card.Body>
          {emptyState ?? (
            <SurfaceEmptyState
              title="No notifications"
              description="You are all caught up."
            />
          )}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Stack className="ds-notification__list" data-part="notification-list" spacing="sm">
      {/* Read notifications are dimmed (opacity 0.7) and lose the accent
          border. The left border on unread items provides a quick visual
          scan indicator without requiring a separate badge. */}
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`ds-notification__item ds-notification__item--${notification.read ? 'read' : 'unread'}`}
          variant="outlined"
          style={{
            opacity: notification.read ? 0.7 : 1,
          }}
        >
          <Card.Body>
            <Flex justify="between" align="start" gap={12}>
              <Flex gap={12} align="start" style={{ flex: 1 }}>
                {notification.icon && (
                  <Box className="ds-notification__icon" data-part="icon" style={{ flexShrink: 0, marginTop: 2 }}>{notification.icon}</Box>
                )}
                <Stack spacing="xs" style={{ flex: 1 }}>
                  <Flex gap={8} align="center">
                    <Text className="ds-notification__title" data-part="title" style={{ fontWeight: notification.read ? 400 : 600 }}>
                      {notification.title}
                    </Text>
                    {notification.type && (
                      <Tag color={notificationTypeColor(notification.type)} style={{ fontSize: 11 }}>
                        {notification.type}
                      </Tag>
                    )}
                  </Flex>
                  {notification.message && (
                    <Text className="ds-notification__muted-text" style={{ fontSize: 13 }}>
                      {notification.message}
                    </Text>
                  )}
                  <Text className="ds-notification__muted-text" style={{ fontSize: 12 }}>
                    {notification.timestamp}
                  </Text>
                </Stack>
              </Flex>
              <Flex gap={4}>
                {!notification.read && onMarkRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead([notification.id])}
                  >
                    <Text style={{ fontSize: 12 }}>Mark read</Text>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete([notification.id])}
                  >
                    <Text className="ds-notification__destructive-text" style={{ fontSize: 12 }}>Delete</Text>
                  </Button>
                )}
              </Flex>
            </Flex>
            {notification.action && (
              <Box className="ds-notification__item-action" data-part="item-action" style={{ marginTop: 8 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={notification.action.onClick}
                >
                  <Text>{notification.action.label}</Text>
                </Button>
              </Box>
            )}
          </Card.Body>
        </Card>
      ))}
    </Stack>
  );
}

function PreferencesPanel({
  preferences,
  onPreferenceChange,
}: {
  preferences: NotificationPreference[];
  onPreferenceChange?: (id: string, enabled: boolean) => void;
}): React.ReactElement {
  // Group preferences by category so the UI can render section headers.
  // Uncategorized preferences default to "General" to avoid orphaned items.
  const grouped = useMemo(() => {
    const groups: Record<string, NotificationPreference[]> = {};
    for (const pref of preferences) {
      const category = pref.category ?? 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push(pref);
    }
    return groups;
  }, [preferences]);

  if (preferences.length === 0) {
    return (
      <SurfaceEmptyState
        title="No preferences"
        description="No notification preferences are available."
      />
    );
  }

  return (
    <Stack className="ds-notification__preferences" data-part="preferences" spacing="lg">
      {Object.entries(grouped).map(([category, prefs]) => (
        <Card key={category} variant="outlined">
          <Card.Body>
            <Stack spacing="md">
              <Text style={{ fontSize: 16, fontWeight: 600 }}>{category}</Text>
              {prefs.map((pref) => (
                <Flex key={pref.id} justify="between" align="center" style={{ padding: '4px 0' }}>
                  <Stack spacing="xs">
                    <Flex gap={8} align="center">
                      <Text style={{ fontWeight: 500 }}>{pref.label}</Text>
                      <Tag color="default" style={{ fontSize: 11 }}>{pref.channel}</Tag>
                    </Flex>
                    {pref.description && (
                      <Text className="ds-notification__muted-text" style={{ fontSize: 13 }}>
                        {pref.description}
                      </Text>
                    )}
                  </Stack>
                  <Switch
                    checked={pref.enabled}
                    onChange={(checked) => onPreferenceChange?.(pref.id, checked)}
                  />
                </Flex>
              ))}
            </Stack>
          </Card.Body>
        </Card>
      ))}
    </Stack>
  );
}

export function NotificationSurface({
  config,
  loading = false,
}: NotificationSurfaceProps): React.ReactElement {
  const useTabs = config.visual.layout === 'tabs';
  // Unread count is computed here because it drives both the "mark all read"
  // button visibility and the badge on the notifications tab label.
  const unreadCount = config.behavior.notifications.filter((n) => !n.read).length;

  // "Mark all read" only appears when there are unread items AND the app
  // provides the handler. This prevents confusing no-op buttons.
  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {unreadCount > 0 && config.behavior.onMarkAllRead && (
        <Button variant="secondary" size="sm" onClick={config.behavior.onMarkAllRead}>
          <Text>Mark all read</Text>
        </Button>
      )}
    </Flex>
  );

  const notificationsContent = (
    <NotificationList
      notifications={config.behavior.notifications}
      onMarkRead={config.behavior.onMarkRead}
      onDelete={config.behavior.onDelete}
      emptyState={config.presentation.emptyState}
    />
  );

  const preferencesContent = (
    <PreferencesPanel
      preferences={config.behavior.preferences}
      onPreferenceChange={config.behavior.onPreferenceChange}
    />
  );

  const content = useTabs ? (
    <Tabs
      className={`ds-surface ds-notification ds-notification--tabs${loading ? ' ds-notification--loading' : ''}`}
      items={[
        {
          key: 'notifications',
          label: (
            <Flex gap={6} align="center">
              <Text>Notifications</Text>
              {unreadCount > 0 && <Badge count={unreadCount} />}
            </Flex>
          ),
          children: notificationsContent,
        },
        {
          key: 'preferences',
          label: 'Preferences',
          children: preferencesContent,
        },
      ]}
    />
  ) : (
    <Stack
      className="ds-surface ds-notification ds-notification--sections"
      data-part="root"
      data-layout="sections"
      data-loading={loading ? 'true' : 'false'}
      spacing="xl"
    >
      <Stack spacing="md">
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Notifications</Text>
        {notificationsContent}
      </Stack>
      <Stack spacing="md">
        <Text style={{ fontSize: 18, fontWeight: 600 }}>Preferences</Text>
        {preferencesContent}
      </Stack>
    </Stack>
  );

  return (
    <PageShellSurface
      chrome={config.presentation.chrome}
      actions={actionsNode}
      loading={loading}
    >
      {content}
    </PageShellSurface>
  );
}
