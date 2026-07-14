import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box, Text } from '../../../primitives';
import { PatternFilterBuilder } from '.';
import type { FilterGroup, FilterFieldDefinition } from '.';
import { createSurfaceStoryDecorator } from '../../../surfaces/foundation/common/story-helpers';

const meta: Meta<typeof PatternFilterBuilder> = {
  title: 'Patterns/FilterBuilder',
  component: PatternFilterBuilder,
  decorators: [createSurfaceStoryDecorator({ productProfile: 'events.organizer', engine: 'rustic' })],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PatternFilterBuilder>;

const eventFields: FilterFieldDefinition[] = [
  { key: 'name', label: 'Event Name', type: 'text', placeholder: 'Search events...' },
  { key: 'capacity', label: 'Capacity', type: 'number', placeholder: 'Enter number' },
  { key: 'date', label: 'Date', type: 'date' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
      { label: 'Sold Out', value: 'sold_out' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'Music', value: 'music' },
      { label: 'Conference', value: 'conference' },
      { label: 'Workshop', value: 'workshop' },
      { label: 'Party', value: 'party' },
    ],
  },
  { key: 'featured', label: 'Featured', type: 'boolean' },
];

const initialFilter: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'r1', field: 'status', operator: 'equals', value: 'published' },
    { id: 'r2', field: 'capacity', operator: 'gt', value: 100 },
    {
      id: 'g1',
      logic: 'or',
      rules: [
        { id: 'r3', field: 'category', operator: 'equals', value: 'music' },
        { id: 'r4', field: 'category', operator: 'equals', value: 'party' },
      ],
    },
  ],
};

function FilterBuilderInteractive() {
  const [filter, setFilter] = useState<FilterGroup>(initialFilter);

  return (
    <Box style={{ width: 800 }}>
      <PatternFilterBuilder
        fields={eventFields}
        value={filter}
        onChange={setFilter}
        maxDepth={3}
        allowGrouping
        showClear
        onClear={() =>
          setFilter({ id: 'root', logic: 'and', rules: [] })
        }
      />
      <Box
        style={{
          marginTop: 24,
          padding: 16,
          background: 'var(--ds-color-bg-secondary, #f5f5f5)',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          maxHeight: 300,
          overflow: 'auto',
        }}
      >
        <Text style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
          Filter State (JSON):
        </Text>
        {JSON.stringify(filter, null, 2)}
      </Box>
    </Box>
  );
}

export const Interactive: Story = {
  render: () => <FilterBuilderInteractive />,
};

const emptyFilter: FilterGroup = {
  id: 'root',
  logic: 'and',
  rules: [],
};

export const Empty: Story = {
  args: {
    fields: eventFields,
    value: emptyFilter,
    onChange: () => undefined,
    allowGrouping: true,
  },
};

export const NoGrouping: Story = {
  args: {
    fields: eventFields,
    value: {
      id: 'root',
      logic: 'and',
      rules: [
        { id: 'r1', field: 'name', operator: 'contains', value: 'concert' },
      ],
    },
    onChange: () => undefined,
    allowGrouping: false,
  },
};

export const Compact: Story = {
  args: {
    fields: eventFields,
    value: initialFilter,
    onChange: () => undefined,
    compact: true,
    allowGrouping: true,
  },
};

export const Loading: Story = {
  args: {
    fields: eventFields,
    value: emptyFilter,
    onChange: () => undefined,
    loading: true,
  },
};
