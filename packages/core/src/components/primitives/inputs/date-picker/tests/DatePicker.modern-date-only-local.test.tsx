import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import ModernDatePicker from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

/**
 * A bare `YYYY-MM-DD` is UTC midnight by ECMAScript spec, so `new Date(s)`
 * renders the PREVIOUS day for every consumer west of Greenwich. The engine
 * parses date-only strings in the local zone instead.
 */
describe('Modern DatePicker date-only value parsing', () => {
  it('shows the same calendar day the caller wrote, not the UTC-shifted one', () => {
    renderWithEngine(<ModernDatePicker value="2026-03-14" format="YYYY-MM-DD" />, 'modern');

    expect(screen.getByRole('combobox')).toHaveValue('2026-03-14');
  });

  it('parses a date-only defaultValue in the local zone', () => {
    renderWithEngine(<ModernDatePicker defaultValue="2026-01-01" format="YYYY-MM-DD" />, 'modern');

    expect(screen.getByRole('combobox')).toHaveValue('2026-01-01');
  });

  it('leaves a value that carries an explicit time untouched', () => {
    renderWithEngine(<ModernDatePicker value="2026-03-14T23:30:00" format="YYYY-MM-DD" />, 'modern');

    expect(screen.getByRole('combobox')).toHaveValue('2026-03-14');
  });

  it('rejects a rolled-over calendar date instead of silently normalizing it', () => {
    renderWithEngine(<ModernDatePicker value="2026-02-31" format="YYYY-MM-DD" placeholder="Pick a date" />, 'modern');

    expect(screen.getByRole('combobox')).toHaveValue('');
  });
});

describe('Modern DatePicker accessible name ownership', () => {
  it('yields the name to an external label when the caller supplies an id', () => {
    renderWithEngine(
      <>
        <label htmlFor="start-date">Start date</label>
        <ModernDatePicker id="start-date" placeholder="Select date" />
      </>,
      'modern'
    );

    expect(screen.getByRole('combobox', { name: 'Start date' })).toBeInTheDocument();
  });

  it('falls back to the placeholder only when no id can be labelled', () => {
    renderWithEngine(<ModernDatePicker placeholder="Select date" />, 'modern');

    expect(screen.getByRole('combobox', { name: 'Select date' })).toBeInTheDocument();
  });
});
