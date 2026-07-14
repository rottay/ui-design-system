import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternWorkspaceSwitcher } from '.';
import { createSurfaceStoryDecorator } from '../../../surfaces/foundation/common/story-helpers';

const meta: Meta<typeof PatternWorkspaceSwitcher> = {
  title: 'Patterns/WorkspaceSwitcher',
  component: PatternWorkspaceSwitcher,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatternWorkspaceSwitcher>;

export const Default: Story = {
  args: {
    workspaces: [
      { id: 'ws-1', name: 'Acme Corporation', role: 'Admin', plan: 'enterprise', unreadCount: 5, online: 23 },
      { id: 'ws-2', name: 'Beta Startup', role: 'Member', plan: 'pro', unreadCount: 0, online: 8 },
      { id: 'ws-3', name: 'Gamma Agency', role: 'Owner', plan: 'free', unreadCount: 12, online: 3 },
    ],
    activeWorkspaceId: 'ws-1',
    onSwitch: (id) => console.log('Switch to:', id),
    onCreate: () => console.log('Create workspace'),
    onSettings: (id) => console.log('Settings for:', id),
    currentUser: { name: 'Daniel Avila', email: 'daniel@rottay.com' },
    position: 'sidebar',
  },
};

export const HeaderPosition: Story = {
  args: {
    ...Default.args,
    position: 'header',
  },
};

export const WithoutCreateButton: Story = {
  args: {
    ...Default.args,
    showCreateButton: false,
  },
};

export const MinimalWorkspaces: Story = {
  args: {
    workspaces: [
      { id: 'ws-1', name: 'Personal', plan: 'free' },
      { id: 'ws-2', name: 'Work', plan: 'pro' },
    ],
    activeWorkspaceId: 'ws-1',
    onSwitch: (id) => console.log('Switch to:', id),
    position: 'sidebar',
  },
};
