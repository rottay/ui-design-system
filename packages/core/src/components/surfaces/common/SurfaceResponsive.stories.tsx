/**
 * @fileoverview Responsive layout stories -- demonstrates surfaces at mobile,
 * tablet, and desktop breakpoints with stacking and sidebar collapse behavior.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AuthSurface, SearchSurface, SidebarSurface } from '../';
import { Badge, Box, Stack, Text } from '../../primitives';
import { StoryViewport, SurfaceStoryProvider } from './story-helpers';

const meta: Meta = {
  title: 'Surfaces/Responsive',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

function ResponsiveSearchExample(): React.ReactElement {
  const [query, setQuery] = useState('festival');

  return (
    <SearchSurface
      config={{
        visual: { layout: 'split', minQueryLength: 2, resultMinWidth: 240, stackOnMobile: true, stackOnTablet: true },
        presentation: { chrome: { title: 'Responsive Search' } },
        behavior: {
          query,
          onQueryChange: setQuery,
          results: [
            { id: '1', title: 'Main Festival', description: 'Hero event card' },
            { id: '2', title: 'VIP Tables', description: 'Upsell package' },
            { id: '3', title: 'Soundcheck', description: 'Operational activity' },
          ],
        },
      }}
    />
  );
}

function ResponsiveSidebarExample(): React.ReactElement {
  return (
    <SidebarSurface
      config={{
        visual: { collapsible: true, stackOnMobile: true, stackOnTablet: true },
        presentation: {
          header: <Text style={{ fontWeight: 700 }}>Workspace</Text>,
          sidebar: <Stack spacing="sm"><Text>Dashboard</Text><Text>Events</Text><Text>Staff</Text></Stack>,
          content: <Box style={{ minHeight: 180 }}>Main content panel</Box>,
          aside: <Box>Live summary rail</Box>,
        },
        behavior: { toggleLabel: 'Collapse navigation' },
      }}
    />
  );
}

function ResponsiveAuthExample(): React.ReactElement {
  return (
    <AuthSurface
      config={{
        visual: { layout: 'split', stackOnMobile: true, stackOnTablet: true },
        presentation: {
          title: 'Sign in to Evnto',
          subtitle: 'The hero must survive the stacked breakpoint.',
          form: <Box style={{ minHeight: 180 }}>Auth form fields</Box>,
          hero: <Stack spacing="sm"><Badge>Events</Badge><Text>Brand storytelling stays visible even when the shell collapses.</Text></Stack>,
        },
        behavior: {},
      }}
    />
  );
}

export const MobileTabletDesktop: Story = {
  render: () => (
    <SurfaceStoryProvider productProfile="events.organizer">
      <Stack spacing="xl">
        <StoryViewport label="Mobile - 375px" width={375}><ResponsiveSearchExample /></StoryViewport>
        <StoryViewport label="Tablet - 768px" width={768}><ResponsiveSidebarExample /></StoryViewport>
        <StoryViewport label="Desktop - 1280px" width={1280}><ResponsiveAuthExample /></StoryViewport>
      </Stack>
    </SurfaceStoryProvider>
  ),
};
