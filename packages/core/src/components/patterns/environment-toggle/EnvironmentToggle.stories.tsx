import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternEnvironmentToggle } from '.';
import { createSurfaceStoryDecorator } from '../../surfaces/common/story-helpers';

const meta: Meta<typeof PatternEnvironmentToggle> = {
  title: 'Patterns/EnvironmentToggle',
  component: PatternEnvironmentToggle,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatternEnvironmentToggle>;

export const Default: Story = {
  args: {
    environments: [
      { id: 'test', name: 'Test', color: '#f59e0b', badge: 'TEST' },
      { id: 'live', name: 'Live', color: '#22c55e', badge: 'LIVE' },
    ],
    activeEnvironment: 'test',
    onChange: (envId) => console.log('Switch to:', envId),
    showBanner: true,
    productionId: 'live',
  },
};

export const ThreeEnvironments: Story = {
  args: {
    environments: [
      { id: 'dev', name: 'Development', color: '#3b82f6', badge: 'DEV' },
      { id: 'staging', name: 'Staging', color: '#f59e0b', badge: 'STG' },
      { id: 'prod', name: 'Production', color: '#22c55e' },
    ],
    activeEnvironment: 'dev',
    onChange: (envId) => console.log('Switch to:', envId),
    showBanner: true,
    productionId: 'prod',
    confirmProductionSwitch: 'You are about to switch to the production environment. All changes will affect real users and data.',
  },
};

export const PillsVariant: Story = {
  args: {
    ...Default.args,
    variant: 'pills',
  },
};

export const DropdownVariant: Story = {
  args: {
    ...ThreeEnvironments.args,
    variant: 'dropdown',
  },
};

export const CustomBannerMessage: Story = {
  args: {
    ...Default.args,
    bannerMessage: 'Sandbox mode - no real transactions will be processed',
  },
};

export const NoBanner: Story = {
  args: {
    ...Default.args,
    showBanner: false,
  },
};
