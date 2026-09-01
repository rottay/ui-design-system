import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { FilterDef } from '../contracts';
import ModernFilterPanel from '../engines/modern';

const FILTERS: FilterDef[] = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'live', label: 'Live' },
    ],
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'indoor', label: 'Indoor' },
    ],
  },
  { key: 'enabled', label: 'Enabled', type: 'boolean' },
  { key: 'eventDate', label: 'Event date', type: 'date' },
  { key: 'seats', label: 'Seats', type: 'number' },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
  { key: 'window', label: 'Window', type: 'date-range' },
];

describe('ModernFilterPanel control accessible names', () => {
  it('names every filter control after its visible field label', () => {
    render(
      <ModernFilterPanel filters={FILTERS} values={{}} onChange={vi.fn()} />
    );

    // The visible `field-label` span is not a <label> and binds nothing, so
    // the composed primitive must carry the name itself.
    expect(screen.getByLabelText('Query')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Enabled')).toBeInTheDocument();
    expect(screen.getByLabelText('Event date')).toBeInTheDocument();
    expect(screen.getByLabelText('Seats')).toBeInTheDocument();
  });

  it('names the multi-select and range composites as labelled groups', () => {
    render(
      <ModernFilterPanel filters={FILTERS} values={{}} onChange={vi.fn()} />
    );

    expect(screen.getByRole('group', { name: 'Tags' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Capacity' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Window' })).toBeInTheDocument();
  });

  it('gives each number-range bound its own standalone name', () => {
    render(
      <ModernFilterPanel filters={FILTERS} values={{}} onChange={vi.fn()} />
    );

    const range = screen.getByRole('group', { name: 'Capacity' });
    expect(screen.getByLabelText('Min')).toBeInTheDocument();
    expect(screen.getByLabelText('Max')).toBeInTheDocument();
    expect(range).toContainElement(screen.getByLabelText('Min'));
    expect(range).toContainElement(screen.getByLabelText('Max'));
  });
});
