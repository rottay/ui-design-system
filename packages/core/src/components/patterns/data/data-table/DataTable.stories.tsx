import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, Text } from '../../../primitives';
import { PatternDataTable } from '.';
import { createSurfaceStoryDecorator } from '../../../surfaces/common/story-helpers';

const meta: Meta<typeof PatternDataTable> = {
  title: 'Patterns/DataTable',
  component: PatternDataTable,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PatternDataTable>;

const data = [
  { id: 'evt-1', name: 'Spring Summit', venue: 'Brooklyn Hall', attendance: 1240 },
  { id: 'evt-2', name: 'Night Market', venue: 'Pier 3', attendance: 860 },
  { id: 'evt-3', name: 'VIP Dinner', venue: 'Harbor Club', attendance: 320 },
];

export const Default: Story = {
  args: {
    data,
    rowKey: 'id',
    compact: true,
    bordered: true,
    hoverable: true,
    columns: [
      { key: 'name', header: 'Event', accessorKey: 'name' },
      { key: 'venue', header: 'Venue', accessorKey: 'venue' },
      { key: 'attendance', header: 'Attendance', accessorKey: 'attendance', align: 'right' },
    ],
    toolbar: (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ fontWeight: 700 }}>Upcoming events</Text>
        <Button size="sm">Export</Button>
      </div>
    ),
  },
};
