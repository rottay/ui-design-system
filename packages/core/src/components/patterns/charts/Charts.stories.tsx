import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '../../primitives';
import { BarChart, LineChart, PieChart } from '.';
import { createSurfaceStoryDecorator } from '../../surfaces/common/story-helpers';

const meta: Meta = {
  title: 'Patterns/Charts',
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const RevenueAndMix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <Card variant="outlined">
        <Card.Body>
          <LineChart
            title="Revenue trend"
            series={[
              {
                name: 'Revenue',
                data: [
                  { x: 'Mon', y: 14 },
                  { x: 'Tue', y: 18 },
                  { x: 'Wed', y: 12 },
                  { x: 'Thu', y: 21 },
                  { x: 'Fri', y: 26 },
                ],
              },
            ]}
            showArea
            height={280}
          />
        </Card.Body>
      </Card>

      <Card variant="outlined">
        <Card.Body>
          <BarChart
            title="Ticket tiers"
            data={[
              { label: 'VIP', value: 180 },
              { label: 'GA', value: 420 },
              { label: 'Sponsors', value: 72 },
            ]}
            height={280}
          />
        </Card.Body>
      </Card>

      <Card variant="outlined">
        <Card.Body>
          <PieChart
            title="Acquisition mix"
            data={[
              { label: 'Email', value: 34 },
              { label: 'Paid social', value: 28 },
              { label: 'Affiliates', value: 18 },
              { label: 'Organic', value: 20 },
            ]}
            height={280}
          />
        </Card.Body>
      </Card>
    </div>
  ),
};
