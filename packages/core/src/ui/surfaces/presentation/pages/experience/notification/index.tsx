'use client';

/**
 * @fileoverview NotificationSurface -- notification center page with preferences.
 * @description Coordinates the notification feed and the delivery-preferences
 * panel into tabbed or sectioned page layouts. The app owns notification data
 * and preference persistence; this surface standardizes the page structure,
 * the state choreography (loading mirror skeleton, per-section empty states,
 * error with retry under live chrome) and the read/unread visual grammar.
 *
 * @remarks
 * Composition: PageShellSurface chrome + canonical primitives (Card, Tag,
 * Switch, Tabs, Badge, Pagination, Heading) + the shared surface state kits
 * (SurfaceEmptyState, SurfaceErrorState). The PT05 notification-center
 * PATTERN is deliberately NOT composed: it is a dropdown popover (trigger +
 * click-outside panel) while this surface is a full page with sections/tabs,
 * preferences and pagination. Its known debt (no `onUnread` in the contract,
 * trigger aria-label pinned without the live count, clear-all without
 * confirmation) is pattern-owned, cited here, and NOT resolved by this lane.
 *
 * States: `loading` renders a surface-owned mirror skeleton (feed item
 * blocks plus a preferences block under the same section headings, so the
 * swap to real content is paint-only -- the page-shell loading early-return
 * is intentionally not engaged, dashboard/chat idiom); `error`/`onRetry`
 * compose the shared `SurfaceErrorState` kit under the live page chrome
 * (component props, dashboard precedent -- the contract declares no error
 * axis, gap registered); empty feed and empty preferences are independent
 * per-section states via the shared empty kit. Unread items are communicated
 * by content weight plus the mark-read affordance, never by a decorative
 * accent rail. The feed carries NO live-region role on purpose: the contract
 * does not declare live-region semantics (owner directive: never infer
 * `role="alert"`/`status` without an explicit contract).
 */

import React, { useMemo } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Pagination,
  Stack,
  Switch,
  Tabs,
  Tag,
  Text,
} from '../../../../../primitives';
import type {
  SurfaceNotificationItem,
  NotificationPreference,
  NotificationSurfaceConfig,
} from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';
import { FadeIn, StaggerChildren } from '@/graphics/motion';

export interface NotificationSurfaceProps {
  config: NotificationSurfaceConfig;
  loading?: boolean;
  /** Load failure of the feed/preferences payload; renders the shared error kit under the live page chrome. */
  error?: unknown;
  /** Retry handler wired to the error state's retry action. */
  onRetry?: () => void | Promise<void>;
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

/**
 * Feed mirror skeleton: three item blocks at descending heights keep the
 * item-card rhythm of the loaded list, so the swap to real content is a pure
 * paint change, never a layout shift. Geometry and pulse live in the
 * notification skin; blocks are decorative (`aria-hidden`) while the surface
 * root carries `aria-busy`.
 */
function NotificationFeedSkeleton(): React.ReactElement {
  return (
    <Stack spacing="sm" data-part="feed-skeleton" aria-hidden="true">
      <Box data-part="notification-skeleton-item" data-size="lg" />
      <Box data-part="notification-skeleton-item" data-size="md" />
      <Box data-part="notification-skeleton-item" data-size="sm" />
    </Stack>
  );
}

/** Preferences mirror skeleton: one grouped-frame block (switch rows). */
function NotificationPreferencesSkeleton(): React.ReactElement {
  return <Box data-part="notification-skeleton-preferences" aria-hidden="true" />;
}

function NotificationList({
  notifications,
  onMarkRead,
  onDelete,
  emptyState,
  animateEntrance,
  staggerDelay,
  entranceDuration,
}: {
  notifications: SurfaceNotificationItem[];
  onMarkRead?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  emptyState?: React.ReactNode;
  animateEntrance: boolean;
  staggerDelay: number;
  entranceDuration: number;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();

  if (notifications.length === 0) {
    return (
      <Card className="ds-notification__empty-card" variant="outlined">
        <Card.Body>
          {emptyState ?? (
            <SurfaceEmptyState
              title={tSurfaceOr('notification.empty_title', 'No notifications')}
              description={tSurfaceOr(
                'notification.empty_description',
                'You are all caught up.'
              )}
            />
          )}
        </Card.Body>
      </Card>
    );
  }

  const items = notifications.map((notification) => (
    <Card
      key={notification.id}
      className={`ds-notification__item ds-notification__item--${notification.read ? 'read' : 'unread'}`}
      data-read={notification.read ? 'true' : 'false'}
      variant="outlined"
    >
      <Card.Body>
        <Flex justify="between" align="start" gap={12} wrap="wrap">
          <Flex
            className="ds-notification__item-main"
            data-part="item-main"
            gap={12}
            align="start"
            flex={1}
          >
            {notification.icon && (
              <Box className="ds-notification__icon" data-part="icon">
                {notification.icon}
              </Box>
            )}
            <Stack spacing="xs">
              <Flex gap={8} align="center" wrap="wrap">
                {/* Read/unread is communicated by content weight plus the
                    mark-read affordance, never by a decorative edge rail. */}
                <Text
                  className="ds-notification__title"
                  data-part="title"
                  weight={notification.read ? 'normal' : 'semibold'}
                >
                  {notification.title}
                </Text>
                {notification.type && (
                  <Tag color={notificationTypeColor(notification.type)} size="xs">
                    {notification.type}
                  </Tag>
                )}
              </Flex>
              {notification.message && (
                <Text className="ds-notification__muted-text" color="muted" size="sm">
                  {notification.message}
                </Text>
              )}
              <Text className="ds-notification__muted-text" color="muted" size="xs">
                {notification.timestamp}
              </Text>
            </Stack>
          </Flex>
          <Flex gap={4} wrap="wrap" justify="end">
            {!notification.read && onMarkRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkRead([notification.id])}
              >
                {tSurfaceOr('notification.mark_read', 'Mark read')}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete([notification.id])}
              >
                {/* Pinned hook (`destructive-text[data-part='root']`); the
                    error ink now travels through Typography's own `color`
                    channel instead of a surface-owned color rule. */}
                <Text className="ds-notification__destructive-text" color="error">
                  {tSurfaceOr('notification.delete', 'Delete')}
                </Text>
              </Button>
            )}
          </Flex>
        </Flex>
        {notification.action && (
          <Box className="ds-notification__item-action" data-part="item-action">
            <Button
              variant="secondary"
              size="sm"
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </Button>
          </Box>
        )}
      </Card.Body>
    </Card>
  ));

  return (
    <Stack className="ds-notification__list" data-part="notification-list" spacing="sm">
      {/* Feed items reveal as a coordinated group when the product profile
          enables entrance motion; reduced/calm contexts render final state. */}
      {animateEntrance ? (
        <StaggerChildren staggerDelayMs={staggerDelay} durationMs={entranceDuration}>
          {items}
        </StaggerChildren>
      ) : (
        items
      )}
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
  const { tSurfaceOr } = useSurfaceTranslations();

  // Group preferences by category so the UI can render section headers.
  // Uncategorized preferences fall back to a governed default label to avoid
  // orphaned items.
  const defaultCategory = tSurfaceOr('notification.preferences_default_category', 'General');
  const grouped = useMemo(() => {
    const groups: Record<string, NotificationPreference[]> = {};
    for (const pref of preferences) {
      const category = pref.category ?? defaultCategory;
      if (!groups[category]) groups[category] = [];
      groups[category].push(pref);
    }
    return groups;
  }, [preferences, defaultCategory]);

  if (preferences.length === 0) {
    return (
      <SurfaceEmptyState
        title={tSurfaceOr('notification.preferences_empty_title', 'No preferences')}
        description={tSurfaceOr(
          'notification.preferences_empty_description',
          'No notification preferences are available.'
        )}
      />
    );
  }

  return (
    <Stack className="ds-notification__preferences" data-part="preferences" spacing="lg">
      {Object.entries(grouped).map(([category, prefs]) => (
        <Card
          key={category}
          className="ds-notification__preference-group"
          variant="outlined"
        >
          <Card.Body>
            <Stack spacing="md">
              <Text size="lg" weight="semibold">
                {category}
              </Text>
              {prefs.map((pref) => {
                // Native label association gives the Switch its accessible
                // name (the primitive forwards `id` to the input) and makes
                // the whole label text clickable. Whitespace is normalized so
                // app-provided ids stay valid HTML id tokens.
                const switchId = `ds-notification-pref-${pref.id.replace(/\s+/g, '-')}`;
                return (
                  <Flex
                    key={pref.id}
                    className="ds-notification__preference-row"
                    data-part="preference-row"
                    justify="between"
                    align="center"
                    gap={12}
                  >
                    <Stack spacing="xs">
                      <Flex gap={8} align="center" wrap="wrap">
                        <Text as="label" htmlFor={switchId} weight="medium">
                          {pref.label}
                        </Text>
                        <Tag color="default" size="xs">
                          {pref.channel}
                        </Tag>
                      </Flex>
                      {pref.description && (
                        <Text className="ds-notification__muted-text" color="muted" size="sm">
                          {pref.description}
                        </Text>
                      )}
                    </Stack>
                    <Switch
                      id={switchId}
                      checked={pref.enabled}
                      onChange={(checked) => onPreferenceChange?.(pref.id, checked)}
                    />
                  </Flex>
                );
              })}
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
  error,
  onRetry,
}: NotificationSurfaceProps): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout();
  const resolvedMobile = isMobile && hasResolvedViewport;
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const useTabs = config.visual.layout === 'tabs';
  // Unread count is computed here because it drives both the "mark all read"
  // button visibility and the badge on the notifications tab label.
  const unreadCount = config.behavior.notifications.filter((n) => !n.read).length;
  const pagination = config.behavior.pagination;

  // "Mark all read" only appears when there are unread items AND the app
  // provides the handler. This prevents confusing no-op buttons.
  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {unreadCount > 0 && config.behavior.onMarkAllRead && (
        <Button variant="secondary" size="sm" onClick={config.behavior.onMarkAllRead}>
          {tSurfaceOr('notification.mark_all_read', 'Mark all read')}
        </Button>
      )}
    </Flex>
  );

  // Error state renders under the live page chrome so header actions stay
  // usable, mirroring the dashboard/chat idiom.
  if (error) {
    return (
      <PageShellSurface chrome={config.presentation.chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const notificationsContent = (
    <Stack spacing="md">
      {loading ? (
        <NotificationFeedSkeleton />
      ) : (
        <NotificationList
          notifications={config.behavior.notifications}
          onMarkRead={config.behavior.onMarkRead}
          onDelete={config.behavior.onDelete}
          emptyState={config.presentation.emptyState}
          animateEntrance={profileDefaults.animateEntrance}
          staggerDelay={profileDefaults.staggerDelay}
          entranceDuration={profileDefaults.entranceDuration}
        />
      )}
      {/* Contract-declared feed pagination (previously ignored by the engine).
          The canonical primitive renders the paged mode; the `incremental`
          load mode has no visualization yet (registered gap, not invented). */}
      {!loading && pagination && pagination.loadMode !== 'incremental' && (
        <Flex className="ds-notification__pagination" data-part="pagination" justify="end">
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            size="sm"
            showTotal
            showSizeChanger={Boolean(pagination.pageSizeOptions?.length)}
            onChange={pagination.onChange}
          />
        </Flex>
      )}
    </Stack>
  );

  const preferencesContent = loading ? (
    <NotificationPreferencesSkeleton />
  ) : (
    <PreferencesPanel
      preferences={config.behavior.preferences}
      onPreferenceChange={config.behavior.onPreferenceChange}
    />
  );

  const content = useTabs ? (
    <Stack
      className={`ds-surface ds-notification ds-notification--tabs${loading ? ' ds-notification--loading' : ''}`}
      data-part="root"
      data-layout="tabs"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading ? 'true' : undefined}
      spacing={sectionSpacing}
    >
      <Tabs
        className="ds-notification__tabs"
        items={[
          {
            key: 'notifications',
            label: (
              <Flex gap={6} align="center">
                <Text>{tSurfaceOr('notification.notifications_section', 'Notifications')}</Text>
                {unreadCount > 0 && <Badge count={unreadCount} />}
              </Flex>
            ),
            children: notificationsContent,
          },
          {
            key: 'preferences',
            label: tSurfaceOr('notification.preferences_section', 'Preferences'),
            children: preferencesContent,
          },
        ]}
      />
    </Stack>
  ) : (
    <Stack
      className="ds-surface ds-notification ds-notification--sections"
      data-part="root"
      data-layout="sections"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading ? 'true' : undefined}
      spacing={sectionSpacing}
    >
      <Stack spacing="md">
        <Heading level="h2" size="xl" weight="semibold">
          {tSurfaceOr('notification.notifications_section', 'Notifications')}
        </Heading>
        {notificationsContent}
      </Stack>
      <Stack spacing="md">
        <Heading level="h2" size="xl" weight="semibold">
          {tSurfaceOr('notification.preferences_section', 'Preferences')}
        </Heading>
        {preferencesContent}
      </Stack>
    </Stack>
  );

  return (
    /* The shell's loading early-return is intentionally not engaged: the
       surface owns a mirror skeleton that preserves the feed/preferences
       anatomy (dashboard/chat idiom), so the page chrome and section headings
       stay live and the swap to real content is paint-only. */
    <PageShellSurface chrome={config.presentation.chrome} actions={actionsNode} loading={false}>
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>{content}</FadeIn>
        ) : (
          content
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
