import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { PatternFormBuilder } from '.';
import { STABLE_ENGINES, renderWithEngine } from '../../../_internal/testing/helpers/engine-test-utils';

describe('PatternFormBuilder integration', () => {
  it.each(STABLE_ENGINES)('renders the live pattern through the %s engine', async (engine) => {
    renderWithEngine(
      <PatternFormBuilder
        title="Create Event"
        description="Operational event form"
        layout="grid"
        columns={2}
        fields={[
          { name: 'eventName', label: 'Event name', type: 'text', required: true },
          {
            name: 'eventType',
            label: 'Event type',
            type: 'select',
            options: [
              { label: 'Conference', value: 'conference' },
              { label: 'Festival', value: 'festival' },
            ],
          },
          { name: 'capacity', label: 'Capacity', type: 'number' },
        ]}
        actions={<button type="submit">Create event</button>}
        onSubmit={() => undefined}
      />,
      engine
    );

    expect(await screen.findByText('Create Event', {}, { timeout: 30_000 })).toBeInTheDocument();
    expect(await screen.findByText('Event name', {}, { timeout: 30_000 })).toBeInTheDocument();
    expect(await screen.findByText('Event type', {}, { timeout: 30_000 })).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /create event/i }, { timeout: 30_000 })
    ).toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('submits collected values through the %s engine', async (engine) => {
    const onSubmit = vi.fn();

    renderWithEngine(
      <PatternFormBuilder
        layout="vertical"
        fields={[{ name: 'eventName', label: 'Event name', type: 'text', required: true }]}
        actions={<button type="submit">Save</button>}
        onSubmit={onSubmit}
      />,
      engine
    );

    fireEvent.change(await screen.findByRole('textbox'), {
      target: { value: 'Launch party' },
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'Launch party',
      })
    );
  });
});
