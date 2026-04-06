import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box, Text } from '../primitives';
import { PatternStepWizard } from './step-wizard';
import { createSurfaceStoryDecorator } from '../surfaces/common/story-helpers';

const meta: Meta<typeof PatternStepWizard> = {
  title: 'Patterns/StepWizard',
  component: PatternStepWizard,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PatternStepWizard>;

export const EventLaunchWizard: Story = {
  args: {
    showProgress: true,
    steps: [
      {
        key: 'basics',
        title: 'Basics',
        description: 'Name, venue and date range',
        content: (
          <Box style={{ minHeight: 160 }}>
            <Text style={{ fontWeight: 700 }}>Step 1</Text>
            <Text>Capture the event identity and scheduling information.</Text>
          </Box>
        ),
      },
      {
        key: 'ticketing',
        title: 'Ticketing',
        description: 'Pricing, quota and release plan',
        content: (
          <Box style={{ minHeight: 160 }}>
            <Text style={{ fontWeight: 700 }}>Step 2</Text>
            <Text>Configure ticket tiers and on-sale windows.</Text>
          </Box>
        ),
      },
      {
        key: 'ops',
        title: 'Operations',
        description: 'Staffing, access and production',
        content: (
          <Box style={{ minHeight: 160 }}>
            <Text style={{ fontWeight: 700 }}>Step 3</Text>
            <Text>Assign crew, access rules and live operations defaults.</Text>
          </Box>
        ),
      },
    ],
    onComplete: () => undefined,
  },
};
