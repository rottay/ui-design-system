import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ModernTimePicker from '../engines/modern';
import FormField from '../../FormField/engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

describe('TimePicker modern accessibility tree', () => {
  it('conveys the selected time through aria-selected options', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernTimePicker defaultValue="09:30:00" format="HH:mm" placeholder="Pick a time" />,
      'modern'
    );

    await user.click(screen.getByRole('combobox'));

    const columns = screen.getAllByRole('listbox');
    expect(columns).toHaveLength(2);

    const selected = columns.map((column) =>
      // Exactly one option per column carries the selected state.
      screen
        .getAllByRole('option')
        .filter((opt) => opt.parentElement === column && opt.getAttribute('aria-selected') === 'true')
    );
    expect(selected[0]).toHaveLength(1);
    expect(selected[0][0]).toHaveTextContent('09');
    expect(selected[1]).toHaveLength(1);
    expect(selected[1][0]).toHaveTextContent('30');

    const unselected = screen
      .getAllByRole('option')
      .filter((opt) => opt.getAttribute('aria-selected') === 'false');
    expect(unselected.length).toBeGreaterThan(0);
  });

  it('lets an external FormField label own the trigger name', async () => {
    renderWithEngine(
      <FormField label="Start time" name="start-time">
        <ModernTimePicker placeholder="Select time" />
      </FormField>,
      'modern'
    );

    const trigger = screen.getByRole('combobox', { name: 'Start time' });
    expect(trigger).not.toHaveAttribute('aria-label');
    expect(screen.queryByRole('combobox', { name: 'Select time' })).toBeNull();
  });

  it('keeps the placeholder as the last-resort name when no label exists', () => {
    renderWithEngine(<ModernTimePicker placeholder="Select time" />, 'modern');

    expect(screen.getByRole('combobox', { name: 'Select time' })).toBeInTheDocument();
  });
});
