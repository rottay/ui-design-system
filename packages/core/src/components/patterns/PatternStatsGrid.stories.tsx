import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternStatsGrid } from './stats-grid';
import { createSurfaceStoryDecorator } from '../surfaces/common/story-helpers';

const meta: Meta<typeof PatternStatsGrid> = {
  title: 'Patterns/StatsGrid',
  component: PatternStatsGrid,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatternStatsGrid>;

export const ExecutiveMetrics: Story = {
  args: {
    stats: [
      { key: 'events', label: 'Events', value: 18, change: 12, changeType: 'increase' },
      { key: 'tickets', label: 'Tickets', value: '12.4k', change: 8, changeType: 'increase' },
      { key: 'conversion', label: 'Conversion', value: '7.8%', change: -1.4, changeType: 'decrease' },
      { key: 'noShows', label: 'No-shows', value: '4.2%', change: -0.6, changeType: 'decrease' },
    ],
    columns: 4,
    variant: 'outlined',
    animate: true,
  },
};
