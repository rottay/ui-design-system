'use client';

/**
 * NotificationSurface
 *
 * Notification center with notification history list and preference management.
 * Supports tabbed and sectioned layouts. The surface standardizes how
 * notification pages look and feel while the app owns the actual notification
 * data and preference persistence.
 */

import React, { useMemo } from 'react';
import { Badge, Box, Button, Card, Flex, Stack, Switch, Tabs, Tag, Text } from '../../primitives';
import type { SurfaceNotificationItem, NotificationPreference, NotificationSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { SurfaceEmptyState } from '../states';

export interface NotificationSurfaceProps {
  config: NotificationSurfaceConfig;
  loading?: boolean;
}

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
      <Card variant="outlined">
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
    <Stack spacing="sm">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          variant="outlined"
          style={{
            opacity: notification.read ? 0.7 : 1,
            borderLeft: notification.read
              ? undefined
              : '3px solid var(--ds-color-primary)',
          }}
        >
          <Card.Body>
            <Flex justify="between" align="start" gap={12}>
              <Flex gap={12} align="start" style={{ flex: 1 }}>
                {notification.icon && (
                  <Box style={{ flexShrink: 0, marginTop: 2 }}>{notification.icon}</Box>
                )}
                <Stack spacing="xs" style={{ flex: 1 }}>
                  <Flex gap={8} align="center">
                    <Text style={{ fontWeight: notification.read ? 400 : 600 }}>
                      {notification.title}
                    </Text>
                    {notification.type && (
                      <Tag color={notificationTypeColor(notification.type)} style={{ fontSize: 11 }}>
                        {notification.type}
                      </Tag>
                    )}
                  </Flex>
                  {notification.message && (
                    <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
                      {notification.message}
                    </Text>
                  )}
                  <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
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
                    <Text style={{ fontSize: 12, color: 'var(--ds-color-error-500)' }}>Delete</Text>
                  </Button>
                )}
              </Flex>
            </Flex>
            {notification.action && (
              <Box style={{ marginTop: 8 }}>
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
    <Stack spacing="lg">
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
                      <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
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
  const unreadCount = config.behavior.notifications.filter((n) => !n.read).length;

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
    <Stack spacing="xl">
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
