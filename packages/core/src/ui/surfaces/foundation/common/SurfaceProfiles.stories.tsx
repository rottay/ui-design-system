/**
 * @fileoverview Product profile stories -- shows how surfaces adapt visual
 * density, animation, and accent treatment per product profile.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { VisualizationSurface } from '../..';
import { AreaChart, LineChart, PatternStatsGrid } from '../../../patterns';
import { Stack, Text } from '../../../primitives';
import { SurfaceStoryProvider } from './story-helpers';

const meta: Meta = {
  title: 'Surfaces/Product Profiles',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const revenueSeries = [
  {
    name: 'Revenue',
    data: [
      { x: 'Mon', y: 24 },
      { x: 'Tue', y: 31 },
      { x: 'Wed', y: 28 },
      { x: 'Thu', y: 41 },
      { x: 'Fri', y: 46 },
    ],
  },
];

function VisualizationExample(): React.ReactElement {
  return (
    <VisualizationSurface
      config={{
        visual: { stackOnMobile: true },
        presentation: {
          chrome: { title: 'Weekly Trend', subtitle: 'The same surface reads a different profile personality.' },
          aside: <PatternStatsGrid stats={[{ key: 'active', label: 'Active', value: 1240 }, { key: 'new', label: 'New', value: 76 }]} columns={1} variant="glass" />,
        },
        behavior: {
          views: [
            { key: 'line', label: 'Line', content: <LineChart title="Throughput" series={revenueSeries} showArea /> },
            { key: 'area', label: 'Area', content: <AreaChart title="Momentum" series={revenueSeries} /> },
          ],
          stats: [
            { key: 'bookings', label: 'Bookings', value: 320 },
            { key: 'growth', label: 'Growth', value: '18%' },
          ],
        },
      }}
    />
  );
}

export const RecruitingVsEvents: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <SurfaceStoryProvider productProfile="recruiting.operator" tenantOverrides={{ branding: { companyName: 'BitHire', primaryColor: '#0a66c2', accentColor: '#22c55e' } }}>
        <Stack spacing="md">
          <Text style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recruiting.Operator</Text>
          <VisualizationExample />
        </Stack>
      </SurfaceStoryProvider>

      <SurfaceStoryProvider productProfile="events.organizer" tenantOverrides={{ branding: { companyName: 'Evnto', primaryColor: '#f97316', accentColor: '#ec4899' } }}>
        <Stack spacing="md">
          <Text style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Events.Organizer</Text>
          <VisualizationExample />
        </Stack>
      </SurfaceStoryProvider>
    </div>
  ),
};
