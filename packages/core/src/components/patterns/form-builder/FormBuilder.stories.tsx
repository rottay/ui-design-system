import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../primitives';
import { PatternFormBuilder } from '.';
import { createSurfaceStoryDecorator } from '../../surfaces/common/story-helpers';

const meta: Meta<typeof PatternFormBuilder> = {
  title: 'Patterns/FormBuilder',
  component: PatternFormBuilder,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatternFormBuilder>;

export const EventSetup: Story = {
  args: {
    title: 'Create Event',
    description: 'High-level pattern for dynamic forms with DS field definitions.',
    layout: 'grid',
    columns: 2,
    fields: [
      { name: 'eventName', label: 'Event name', type: 'text', required: true, placeholder: 'Spring Summit' },
      {
        name: 'eventType',
        label: 'Event type',
        type: 'select',
        options: [
          { label: 'Conference', value: 'conference' },
          { label: 'Festival', value: 'festival' },
          { label: 'VIP Dinner', value: 'vip-dinner' },
        ],
      },
      { name: 'capacity', label: 'Capacity', type: 'number', placeholder: '500' },
      { name: 'notes', label: 'Operational notes', type: 'textarea', colSpan: 2, placeholder: 'Crew arrival, access, AV checks' },
    ],
    actions: <Button htmlType="submit">Save event</Button>,
    onSubmit: () => undefined,
  },
};
