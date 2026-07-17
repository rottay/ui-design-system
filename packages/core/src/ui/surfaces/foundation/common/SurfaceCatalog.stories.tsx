/**
 * @fileoverview Surface catalog stories showing all surface components in a gallery.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AuthSurface,
  ChatSurface,
  CompareSurface,
  DashboardSurface,
  DetailFormSurface,
  EmptyStateSurface,
  MediaSurface,
  OnboardingSurface,
  OperationalSurface,
  SchedulerSurface,
  SearchSurface,
  SettingsSurface,
  WizardSurface,
} from '../..';
import { Badge, Box, Button, Card, Stack, Text } from '../../../primitives';
import { createPosterDataUri, createSurfaceStoryDecorator } from './story-helpers';

const meta: Meta = {
  title: 'Surfaces/Catalog',
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

export const SearchAndSettings: Story = {
  render: () => {
    const [query, setQuery] = useState('festival');
    const [settingsTab, setSettingsTab] = useState('general');

    return (
      <Stack spacing="xl">
        <SearchSurface
          config={{
            visual: { layout: 'split', minQueryLength: 2 },
            presentation: {
              chrome: { title: 'Global Search', subtitle: 'Surface-driven search shell' },
              placeholder: 'Search artists, venues, or tickets',
              resultPreview: (result) => (
                <Card variant="outlined">
                  <Card.Body>
                    <Stack spacing="sm">
                      <Text style={{ fontWeight: 700 }}>{result.title}</Text>
                      {result.description}
                    </Stack>
                  </Card.Body>
                </Card>
              ),
            },
            behavior: {
              query,
              onQueryChange: setQuery,
              results: [
                { id: '1', title: 'Festival opener', description: 'Main event with media-heavy detail.' },
                { id: '2', title: 'VIP package', description: 'Premium offer with controlled inventory.' },
              ],
              filters: [
                {
                  key: 'type',
                  label: 'Type',
                  type: 'select',
                  options: [
                    { label: 'Event', value: 'event' },
                    { label: 'Package', value: 'package' },
                  ],
                },
              ],
              filterValues: {},
              onFilterChange: () => undefined,
              resultActions: [{ id: 'open', label: 'Open result', variant: 'primary' }],
            },
          }}
        />

        <SettingsSurface
          config={{
            visual: { tabsType: 'line' },
            presentation: {
              chrome: { title: 'Workspace Settings' },
              intro: 'One shell, multiple settings domains.',
            },
            behavior: {
              tabs: [
                {
                  key: 'general',
                  label: 'General',
                  content: <Text>Branding, locale, and workspace defaults.</Text>,
                },
                {
                  key: 'permissions',
                  label: 'Permissions',
                  content: <Text>Role-based visibility and action rules.</Text>,
                },
              ],
              activeTab: settingsTab,
              onTabChange: setSettingsTab,
              actions: [{ id: 'save', label: 'Save changes', variant: 'primary' }],
            },
          }}
        />
      </Stack>
    );
  },
};

export const ContentAndOperations: Story = {
  render: () => {
    const [draft, setDraft] = useState('');

    return (
      <Stack spacing="xl">
        <DashboardSurface
          config={{
            visual: {},
            presentation: {
              chrome: { title: 'Organizer Dashboard' },
              sections: [
                {
                  key: 'ops',
                  title: 'Operations snapshot',
                  content: <Text>Dashboards still live comfortably beside newer surfaces.</Text>,
                },
              ],
            },
            behavior: {
              stats: [
                { key: 'events', label: 'Events', value: 18 },
                { key: 'attendance', label: 'Attendance', value: '12.4k' },
              ],
            },
          }}
        />

        <OperationalSurface
          config={{
            visual: {},
            presentation: {
              chrome: { title: 'Operational Center' },
              primaryPanel: <Text>Queue health and escalations.</Text>,
              queue: <Text>7 unresolved incidents</Text>,
            },
            behavior: {
              stats: [{ key: 'alerts', label: 'Alerts', value: 7 }],
              feed: {
                items: [
                  { key: 'f1', title: 'New check-in spike' },
                  { key: 'f2', title: 'Door B printer offline' },
                ],
                renderItem: (item) => <Text>{String(item.title)}</Text>,
              },
            },
          }}
        />

        <ChatSurface
          config={{
            visual: {},
            presentation: {
              chrome: { title: 'Operations Chat' },
              composerPlaceholder: 'Type a message',
            },
            behavior: {
              messages: [
                { id: '1', author: 'Ops', body: 'Need status on scanner lane 2.' },
                { id: '2', author: 'Support', body: 'Restart completed.', align: 'end' },
              ],
              draft,
              onDraftChange: setDraft,
              onSend: (value) => setDraft(`sent: ${value}`),
            },
          }}
        />
      </Stack>
    );
  },
};

export const FormsMediaAndScheduling: Story = {
  render: () => {
    const [wizardStep, setWizardStep] = useState(0);

    return (
      <Stack spacing="xl">
        <DetailFormSurface
          config={{
            visual: { layout: 'split', columns: 2 },
            presentation: {
              chrome: { title: 'Edit Event' },
              description: 'Surface-owned split edit layout.',
              summary: <Text>Live preview, warnings, and side metadata go here.</Text>,
            },
            behavior: {
              fields: [
                { name: 'name', label: 'Event name', type: 'text', required: true },
                { name: 'venue', label: 'Venue', type: 'text' },
              ],
              submitAction: {
                id: 'save-event',
                label: 'Save event',
                variant: 'primary',
                onClick: async () => undefined,
              },
            },
          }}
        />

        <WizardSurface
          config={{
            visual: { showProgress: true },
            presentation: { chrome: { title: 'Setup Flow' } },
            behavior: {
              currentStep: wizardStep,
              onStepChange: setWizardStep,
              steps: [
                { key: 'details', title: 'Details', fields: [{ name: 'title', label: 'Title', type: 'text' }] },
                { key: 'review', title: 'Review', content: <Text>Review configuration before launch.</Text> },
              ],
              submitAction: { id: 'launch', label: 'Launch workspace', variant: 'primary', onClick: async () => undefined },
            },
          }}
        />

        <MediaSurface
          config={{
            visual: { layout: 'detail', columns: 3 },
            presentation: {
              chrome: { title: 'Media Library' },
              renderDetails: (item) => <Text>{item.description}</Text>,
            },
            behavior: {
              items: [
                { id: 'm1', src: createPosterDataUri('Hero Shot'), title: 'Hero shot', description: 'Stage lighting setup' },
                { id: 'm2', src: createPosterDataUri('Crowd', '#f97316', '#ec4899'), title: 'Crowd', description: 'Audience angle' },
              ],
            },
          }}
        />

        <SchedulerSurface
          config={{
            visual: { defaultView: 'week' },
            presentation: { chrome: { title: 'Team Schedule' } },
            behavior: {
              events: [
                { id: 'e1', title: 'Crew call', start: new Date(), end: new Date() },
                { id: 'e2', title: 'Soundcheck', start: new Date(), end: new Date() },
              ],
            },
          }}
        />
      </Stack>
    );
  },
};

export const CompareAndOnboarding: Story = {
  render: () => (
    <Stack spacing="xl">
      <CompareSurface
        config={{
          visual: {},
          presentation: {
            chrome: { title: 'Edition Matrix' },
            intro: <Text>Compare packaging without hand-rolled pricing tables.</Text>,
          },
          behavior: {
            subjects: [
              { key: 'starter', label: 'Starter' },
              { key: 'enterprise', label: 'Enterprise', badge: <Badge>Best fit</Badge> },
            ],
            sections: [
              {
                key: 'surface-kit',
                title: 'Surface Coverage',
                rows: [
                  { key: 'surfaces', label: 'Surface catalog', values: { starter: 'Core', enterprise: 'Core + advanced' } },
                  { key: 'theming', label: 'Tenant theming', values: { starter: 'Basic tokens', enterprise: 'Full profile + overrides' } },
                ],
              },
            ],
          },
        }}
      />

      <OnboardingSurface
        config={{
          visual: { showProgress: true, stackOnMobile: true },
          presentation: {
            chrome: { title: 'Launch a New Workspace' },
            description: 'Guided setup is now a first-class surface instead of another custom flow.',
            hero: <Text>Explain why this product configuration matters before the team commits.</Text>,
            checklist: <Stack spacing="xs"><Text>1. Choose profile</Text><Text>2. Brand tenant</Text><Text>3. Configure surfaces</Text></Stack>,
          },
          behavior: {
            currentStep: 0,
            onStepChange: () => undefined,
            submitAction: { id: 'finish-setup', label: 'Finish setup', variant: 'primary', onClick: async () => undefined },
            steps: [
              { key: 'brand', title: 'Brand', fields: [{ name: 'tenantName', label: 'Tenant name', type: 'text' }] },
              { key: 'review', title: 'Review', content: <Text>Everything is ready for launch.</Text> },
            ],
          },
        }}
      />
    </Stack>
  ),
};

export const AuthAndEmptyStates: Story = {
  render: () => (
    <Stack spacing="xl">
      <AuthSurface
        config={{
          visual: { layout: 'split' },
          presentation: {
            title: 'Sign in to Evnto',
            subtitle: 'Use the new DS auth shell.',
            hero: <Stack spacing="sm"><Badge>Events Organizer</Badge><Text>Brand expression stays in the app or profile layer.</Text></Stack>,
            form: <Stack spacing="md"><Box>Email field</Box><Box>Password field</Box><Button variant="primary">Continue</Button></Stack>,
          },
          behavior: {},
        }}
      />

      <EmptyStateSurface
        config={{
          visual: {},
          presentation: {
            chrome: { title: 'No Data Yet' },
            title: 'Create your first workspace policy',
            description: 'Empty states now have a route-level shell instead of ad-hoc markup.',
          },
          behavior: {
            primaryAction: { id: 'create', label: 'Create policy', variant: 'primary' },
          },
        }}
      />
    </Stack>
  ),
};
