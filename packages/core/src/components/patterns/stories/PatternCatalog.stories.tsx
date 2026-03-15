import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box, Button, Card, Stack, Text } from '../../primitives';
import { PatternDataTable } from '../data-table';
import { PatternFormBuilder } from '../form-builder';
import { PatternStatsGrid } from '../stats-grid';
import { BarChart, LineChart } from '../charts';
import { createSurfaceStoryDecorator } from '../../surfaces/stories/story-helpers';

const meta: Meta = {
  title: 'Patterns/Catalog',
  decorators: [
    createSurfaceStoryDecorator({
      productProfile: 'events.organizer',
      engine: 'rustic',
      locale: 'en',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const tableData = [
  { id: 'evt-1', name: 'Spring Summit', venue: 'Brooklyn Hall', attendance: 1240 },
  { id: 'evt-2', name: 'Night Market', venue: 'Pier 3', attendance: 860 },
  { id: 'evt-3', name: 'VIP Dinner', venue: 'Harbor Club', attendance: 320 },
];

export const CorePatterns: Story = {
  render: () => (
    <Stack spacing="xl">
      <PatternStatsGrid
        stats={[
          { key: 'events', label: 'Events', value: 18, change: 12, changeType: 'increase' },
          { key: 'tickets', label: 'Tickets', value: '12.4k', change: 8, changeType: 'increase' },
          { key: 'conversion', label: 'Conversion', value: '7.8%', change: -1.4, changeType: 'decrease' },
        ]}
        columns={3}
        variant="outlined"
      />

      <Card variant="outlined">
        <Card.Body>
          <Stack spacing="lg">
            <Text style={{ fontWeight: 700 }}>PatternDataTable</Text>
            <PatternDataTable
              data={tableData}
              rowKey="id"
              columns={[
                { key: 'name', header: 'Event', accessorKey: 'name' },
                { key: 'venue', header: 'Venue', accessorKey: 'venue' },
                { key: 'attendance', header: 'Attendance', accessorKey: 'attendance', align: 'right' },
              ]}
              compact
              bordered
              hoverable
              toolbar={
                <Box style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <Text style={{ fontWeight: 600 }}>Operations table shell</Text>
                  <Button size="sm">Export</Button>
                </Box>
              }
            />
          </Stack>
        </Card.Body>
      </Card>

      <Card variant="outlined">
        <Card.Body>
          <PatternFormBuilder
            title="PatternFormBuilder"
            description="Dynamic field rendering with the same DS tokens and providers."
            layout="grid"
            columns={2}
            fields={[
              { name: 'eventName', label: 'Event name', type: 'text', required: true, placeholder: 'Enter event name' },
              {
                name: 'eventType',
                label: 'Event type',
                type: 'select',
                options: [
                  { label: 'Conference', value: 'conference' },
                  { label: 'Festival', value: 'festival' },
                ],
              },
              { name: 'capacity', label: 'Capacity', type: 'number', placeholder: '500' },
              { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Operational notes' },
            ]}
            actions={<Button htmlType="submit">Create event</Button>}
            onSubmit={() => undefined}
          />
        </Card.Body>
      </Card>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card variant="outlined">
          <Card.Body>
            <LineChart
              title="LineChart"
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
              title="BarChart"
              data={[
                { label: 'VIP', value: 180 },
                { label: 'GA', value: 420 },
                { label: 'Sponsors', value: 72 },
              ]}
              height={280}
            />
          </Card.Body>
        </Card>
      </div>
    </Stack>
  ),
};
