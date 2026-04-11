/** @fileoverview NotificationSurface Storybook stories. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotificationSurface } from '.';
import { createSurfaceStoryDecorator } from '../common/story-helpers';

const meta: Meta<typeof NotificationSurface> = {
  title: 'Surfaces/NotificationSurface',
  component: NotificationSurface,
  decorators: [
    createSurfaceStoryDecorator({
      productProfile: 'events.organizer',
      engine: 'rustic',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Notification center with notification history list and preference management. ' +
          'Supports tabbed and sectioned layouts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationSurface>;

const sampleNotifications = [
  { id: 'n1', title: 'New team member joined', message: 'Bob Smith has joined the Platform Engineering team.', timestamp: '2 minutes ago', read: false, type: 'info' as const },
  { id: 'n2', title: 'Deployment successful', message: 'Production deployment v2.4.1 completed successfully.', timestamp: '15 minutes ago', read: false, type: 'success' as const, action: { label: 'View Deployment', onClick: () => console.log('View deployment') } },
  { id: 'n3', title: 'Storage quota warning', message: 'Your workspace is using 92% of available storage.', timestamp: '1 hour ago', read: false, type: 'warning' as const },
  { id: 'n4', title: 'CI pipeline failed', message: 'Build #1847 failed on branch feature/auth-refactor.', timestamp: '3 hours ago', read: true, type: 'error' as const },
  { id: 'n5', title: 'Invoice generated', message: 'Invoice #INV-2026-0043 has been generated and sent.', timestamp: 'Yesterday', read: true, type: 'info' as const },
];

const samplePreferences = [
  { id: 'p1', label: 'New comments', description: 'Get notified when someone comments on your posts', channel: 'email' as const, enabled: true, category: 'Activity' },
  { id: 'p2', label: 'Mentions', description: 'When someone mentions you in a comment or post', channel: 'push' as const, enabled: true, category: 'Activity' },
  { id: 'p3', label: 'Task assignments', description: 'When a task is assigned to you', channel: 'in-app' as const, enabled: true, category: 'Activity' },
  { id: 'p4', label: 'Deployment status', description: 'Updates on CI/CD pipeline runs', channel: 'email' as const, enabled: false, category: 'System' },
  { id: 'p5', label: 'Security alerts', description: 'Login attempts and suspicious activity', channel: 'push' as const, enabled: true, category: 'System' },
  { id: 'p6', label: 'Billing updates', description: 'Invoice and payment notifications', channel: 'email' as const, enabled: true, category: 'Billing' },
  { id: 'p7', label: 'Product updates', description: 'New feature announcements', channel: 'email' as const, enabled: false, category: 'Marketing' },
];

export const Default: Story = {
  args: {
    config: {
      visual: { layout: 'sections' },
      presentation: {
        chrome: { title: 'Notifications', subtitle: 'Stay up to date with your workspace' },
      },
      behavior: {
        notifications: sampleNotifications,
        preferences: samplePreferences,
        onMarkRead: (ids) => console.log('Mark read:', ids),
        onMarkAllRead: () => console.log('Mark all read'),
        onDelete: (ids) => console.log('Delete:', ids),
        onPreferenceChange: (id, enabled) => console.log('Preference:', id, enabled),
      },
    },
  },
};

export const TabbedLayout: Story = {
  args: {
    config: {
      visual: { layout: 'tabs' },
      presentation: { chrome: { title: 'Notifications' } },
      behavior: {
        notifications: sampleNotifications,
        preferences: samplePreferences,
        onMarkRead: (ids) => console.log('Mark read:', ids),
        onMarkAllRead: () => console.log('Mark all read'),
        onDelete: (ids) => console.log('Delete:', ids),
        onPreferenceChange: (id, enabled) => console.log('Preference:', id, enabled),
      },
    },
  },
};

export const Empty: Story = {
  args: {
    config: {
      visual: { layout: 'sections' },
      presentation: { chrome: { title: 'Notifications' } },
      behavior: {
        notifications: [],
        preferences: samplePreferences,
        onPreferenceChange: (id, enabled) => console.log('Preference:', id, enabled),
      },
    },
  },
};

export const AllRead: Story = {
  args: {
    config: {
      visual: { layout: 'sections' },
      presentation: { chrome: { title: 'Notifications', subtitle: 'All caught up' } },
      behavior: {
        notifications: sampleNotifications.map((n) => ({ ...n, read: true })),
        preferences: samplePreferences,
        onDelete: (ids) => console.log('Delete:', ids),
        onPreferenceChange: (id, enabled) => console.log('Preference:', id, enabled),
      },
    },
  },
};
