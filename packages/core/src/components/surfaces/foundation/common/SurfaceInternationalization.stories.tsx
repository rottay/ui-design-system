/**
 * @fileoverview Internationalization stories -- demonstrates surfaces rendered
 * with different locales and custom translation overrides.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ChatSurface, SearchSurface } from '../../';
import { Card, Stack, Text } from '../../../primitives';
import { SurfaceStoryProvider } from './story-helpers';

const meta: Meta = {
  title: 'Surfaces/Internationalization',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

function SearchExample(): React.ReactElement {
  const [query, setQuery] = useState('');

  return (
    <SearchSurface
      config={{
        visual: { layout: 'split', minQueryLength: 2, stackOnMobile: true },
        presentation: {
          chrome: { title: 'Search Surface', subtitle: 'Provider-level locale decides the copy, not the page.' },
          resultPreview: (result) => (
            <Card variant="outlined"><Card.Body><Text>{result.description}</Text></Card.Body></Card>
          ),
        },
        behavior: {
          query,
          onQueryChange: setQuery,
          results: [
            { id: '1', title: 'Main Venue', description: 'Operational workspace' },
            { id: '2', title: 'Backstage Access', description: 'Restricted logistics view' },
          ],
        },
      }}
    />
  );
}

function ChatExample(): React.ReactElement {
  const [draft, setDraft] = useState('');

  return (
    <ChatSurface
      config={{
        visual: { stackOnMobile: true },
        presentation: { chrome: { title: 'Ops Chat' } },
        behavior: {
          messages: [
            { id: '1', author: 'Ops', body: 'Scanner lane 2 is back online.' },
            { id: '2', author: 'Support', body: 'Copy confirmed.', align: 'end' },
          ],
          draft,
          onDraftChange: setDraft,
          onSend: () => undefined,
        },
      }}
    />
  );
}

export const SpanishCustomOverridesAndArabicRTL: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <SurfaceStoryProvider
        locale="es"
        customTranslations={{
          components: {
            surfaces: {
              chat: {
                send: 'Mandar ahora',
              },
            },
          },
        }}
        productProfile="events.organizer"
      >
        <Stack spacing="xl">
          <SearchExample />
          <ChatExample />
        </Stack>
      </SurfaceStoryProvider>

      <SurfaceStoryProvider locale="ar" productProfile="generic.default">
        <Stack spacing="xl">
          <SearchExample />
          <ChatExample />
        </Stack>
      </SurfaceStoryProvider>
    </div>
  ),
};
