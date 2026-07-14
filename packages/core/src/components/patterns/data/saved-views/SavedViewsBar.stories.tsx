import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box, Text } from '../../../primitives';
import { PatternSavedViewsBar } from '.';
import type { SavedView } from '.';
import { createSurfaceStoryDecorator } from '../../../surfaces/foundation/common/story-helpers';

const meta: Meta<typeof PatternSavedViewsBar> = {
  title: 'Patterns/SavedViewsBar',
  component: PatternSavedViewsBar,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PatternSavedViewsBar>;

const defaultViews: SavedView[] = [
  {
    id: 'all',
    name: 'All Events',
    isDefault: true,
    config: { layout: 'table' },
  },
  {
    id: 'upcoming',
    name: 'Upcoming',
    config: {
      filters: { status: 'upcoming' },
      sort: [{ field: 'date', direction: 'asc' }],
      layout: 'table',
    },
  },
  {
    id: 'board',
    name: 'Status Board',
    config: { layout: 'board', groupBy: 'status' },
  },
  {
    id: 'calendar',
    name: 'Calendar',
    config: { layout: 'calendar' },
  },
];

function SavedViewsBarInteractive() {
  const [views, setViews] = useState<SavedView[]>(defaultViews);
  const [activeViewId, setActiveViewId] = useState('all');

  return (
    <Box style={{ width: 700 }}>
      <PatternSavedViewsBar
        views={views}
        activeViewId={activeViewId}
        onViewSelect={setActiveViewId}
        onViewSave={(view) => {
          setViews((prev) => prev.map((v) => (v.id === view.id ? view : v)));
        }}
        onViewDelete={(viewId) => {
          setViews((prev) => prev.filter((v) => v.id !== viewId));
          if (activeViewId === viewId) setActiveViewId(views[0]?.id ?? '');
        }}
        onViewRename={(viewId, name) => {
          setViews((prev) =>
            prev.map((v) => (v.id === viewId ? { ...v, name } : v))
          );
        }}
        onViewCreate={(view) => {
          const newView: SavedView = { ...view, id: `view-${Date.now()}` };
          setViews((prev) => [...prev, newView]);
          setActiveViewId(newView.id);
        }}
        onViewDuplicate={(viewId) => {
          const original = views.find((v) => v.id === viewId);
          if (original) {
            const dup: SavedView = {
              ...original,
              id: `view-${Date.now()}`,
              name: `${original.name} (copy)`,
              isDefault: false,
            };
            setViews((prev) => [...prev, dup]);
          }
        }}
        onViewReorder={(ids) => {
          const reordered = ids
            .map((id) => views.find((v) => v.id === id))
            .filter(Boolean) as SavedView[];
          setViews(reordered);
        }}
        allowCreate
        allowDelete
        allowRename
      />
      <Box style={{ padding: 24 }}>
        <Text>
          Active view: <strong>{views.find((v) => v.id === activeViewId)?.name ?? 'none'}</strong>
        </Text>
      </Box>
    </Box>
  );
}

export const Interactive: Story = {
  render: () => <SavedViewsBarInteractive />,
};

export const ReadOnly: Story = {
  args: {
    views: defaultViews,
    activeViewId: 'upcoming',
    onViewSelect: () => undefined,
    onViewSave: () => undefined,
    onViewDelete: () => undefined,
    onViewRename: () => undefined,
    onViewCreate: () => undefined,
    allowCreate: false,
    allowDelete: false,
    allowRename: false,
  },
};

export const Loading: Story = {
  args: {
    views: [],
    activeViewId: undefined,
    onViewSelect: () => undefined,
    onViewSave: () => undefined,
    onViewDelete: () => undefined,
    onViewRename: () => undefined,
    onViewCreate: () => undefined,
    loading: true,
  },
};
