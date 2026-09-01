/** @fileoverview NotificationSurface tests -- history list, preferences, and mark-read. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NotificationSurface } from '..';
import type { NotificationSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<NotificationSurfaceConfig>): NotificationSurfaceConfig {
  return {
    visual: {
      layout: 'sections',
    },
    presentation: {
      chrome: {
        title: 'Notifications',
      },
    },
    behavior: {
      notifications: [
        {
          id: 'n1',
          title: 'New deployment',
          message: 'Version 2.4.0 deployed successfully',
          timestamp: '2 hours ago',
          read: false,
          type: 'success',
        },
        {
          id: 'n2',
          title: 'Payment failed',
          message: 'Monthly subscription payment was declined',
          timestamp: '1 day ago',
          read: true,
          type: 'error',
        },
      ],
      preferences: [
        {
          id: 'p1',
          label: 'Email notifications',
          description: 'Receive email for important updates',
          channel: 'email',
          enabled: true,
          category: 'General',
        },
        {
          id: 'p2',
          label: 'Push notifications',
          description: 'Browser push for real-time alerts',
          channel: 'push',
          enabled: false,
          category: 'General',
        },
      ],
      onMarkRead: vi.fn(),
      onMarkAllRead: vi.fn(),
      onDelete: vi.fn(),
      onPreferenceChange: vi.fn(),
    },
    ...overrides,
  };
}

describe('NotificationSurface', () => {
  it('renders notifications and preferences', async () => {
    renderSurface(<NotificationSurface config={buildConfig()} />);

    expect(await screen.findByText('New deployment')).toBeInTheDocument();
    expect(screen.getAllByText('Notifications').length).toBeGreaterThan(0);
    expect(screen.getByText('New deployment')).toBeInTheDocument();
    expect(screen.getByText('Version 2.4.0 deployed successfully')).toBeInTheDocument();
    expect(screen.getByText('Payment failed')).toBeInTheDocument();
    expect(screen.getByText('Email notifications')).toBeInTheDocument();
    expect(screen.getByText('Push notifications')).toBeInTheDocument();
  });

  it('calls onMarkAllRead when mark all read button is clicked', async () => {
    const config = buildConfig();

    renderSurface(<NotificationSurface config={config} />);

    const markAllButton = await screen.findByText('Mark all read').then((node) => node.closest('button'));
    if (!markAllButton) throw new Error('Mark all read button not found');
    fireEvent.click(markAllButton);
    expect(config.behavior.onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no notifications', async () => {
    const config = buildConfig({
      behavior: {
        ...buildConfig().behavior,
        notifications: [],
      },
    });

    renderSurface(<NotificationSurface config={config} />);

    expect(await screen.findByText('No notifications')).toBeInTheDocument();
  });
});
