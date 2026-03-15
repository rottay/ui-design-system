import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternUserProfileCard } from './user-profile-card';
import { createSurfaceStoryDecorator } from '../surfaces/stories/story-helpers';

const meta: Meta<typeof PatternUserProfileCard> = {
  title: 'Patterns/UserProfileCard',
  component: PatternUserProfileCard,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatternUserProfileCard>;

export const Full: Story = {
  args: {
    user: {
      name: 'Alice Johnson',
      role: 'Senior Engineer',
      email: 'alice@company.com',
      department: 'Platform',
      status: 'active',
    },
    actions: [
      { key: 'message', label: 'Message', onClick: () => console.log('Message'), variant: 'primary' },
      { key: 'profile', label: 'View Profile', onClick: () => console.log('Profile') },
    ],
    size: 'md',
    variant: 'full',
    online: true,
  },
};

export const Compact: Story = {
  args: {
    ...Full.args,
    variant: 'compact',
  },
};
