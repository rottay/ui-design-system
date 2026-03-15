import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternNotificationCenter } from '../notification-center';
import { createSurfaceStoryDecorator } from '../../surfaces/stories/story-helpers';

const meta: Meta<typeof PatternNotificationCenter> = {
  title: 'Patterns/NotificationCenter',
  component: PatternNotificationCenter,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatternNotificationCenter>;

export const Default: Story = {
  args: {
    notifications: [
      { id: '1', title: 'New comment', message: 'Alice commented on your post', type: 'info', read: false, timestamp: new Date().toISOString() },
      { id: '2', title: 'Payment received', message: 'Invoice #1234 has been paid', type: 'success', read: false, timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: '3', title: 'Storage warning', message: 'You have used 90% of your storage', type: 'warning', read: true, timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: '4', title: 'Build failed', message: 'CI pipeline failed on main branch', type: 'error', read: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    onRead: (id) => console.log('Read:', id),
    onReadAll: () => console.log('Read all'),
    onClear: (id) => console.log('Clear:', id),
    onClearAll: () => console.log('Clear all'),
  },
};
