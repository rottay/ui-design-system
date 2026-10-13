'use client';

import { useState } from 'react';
import {
  Box,
  PatternFilterBuilder,
} from '@rottay/design-system';

const FILTER_BUILDER_FIELDS = [
  { key: 'name', label: 'Event name', type: 'text', placeholder: 'Search events...' },
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
    ],
  },
];

const FILTER_BUILDER_INITIAL = {
  id: 'root',
  logic: 'and',
  rules: [
    { id: 'r1', field: 'status', operator: 'equals', value: 'published' },
    { id: 'r2', field: 'capacity', operator: 'gt', value: 200 },
  ],
};

export function FilterBuilderPreview() {
  const [value, setValue] = useState<any>(FILTER_BUILDER_INITIAL);

  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternFilterBuilder
        fields={FILTER_BUILDER_FIELDS as any}
        value={value}
        onChange={setValue}
        allowGrouping
        showClear
        onClear={() => setValue({ id: 'root', logic: 'and', rules: [] })}
      />
    </Box>
  );
}
