import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatternActivityLog } from './activity-log';
import { createSurfaceStoryDecorator } from '../surfaces/common/story-helpers';

const meta: Meta<typeof PatternActivityLog> = {
  title: 'Patterns/ActivityLog',
  component: PatternActivityLog,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PatternActivityLog>;

export const Default: Story = {
  args: {
    activities: [
      { id: '1', user: { name: 'Alice Johnson' }, action: 'created', timestamp: new Date().toISOString(), entityType: 'Invoice', entityId: 'INV-001' },
      { id: '2', user: { name: 'Bob Smith' }, action: 'updated', timestamp: new Date(Date.now() - 1800000).toISOString(), entityType: 'Invoice', entityId: 'INV-001', diff: { status: { from: 'draft', to: 'sent' } } },
      { id: '3', user: { name: 'Alice Johnson' }, action: 'viewed', timestamp: new Date(Date.now() - 7200000).toISOString(), entityType: 'Invoice', entityId: 'INV-001' },
      { id: '4', user: { name: 'Charlie Brown' }, action: 'deleted', timestamp: new Date(Date.now() - 86400000).toISOString(), entityType: 'Attachment', entityId: 'att-5' },
    ],
    actionTypes: ['created', 'updated', 'deleted', 'viewed'],
    users: [{ name: 'Alice Johnson' }, { name: 'Bob Smith' }, { name: 'Charlie Brown' }],
    onFilterChange: (f) => console.log('Filters:', f),
  },
};
