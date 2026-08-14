import React from 'react';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ModernDatePicker from '../engines/modern';
import FormField from '../../FormField/engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

describe('DatePicker modern accessibility tree', () => {
  it('exposes calendar weeks as rows that own every gridcell', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernDatePicker
        defaultValue={new Date('2026-03-13T00:00:00.000Z')}
        placeholder="Pick a date"
      />,
      'modern'
    );

    await user.click(screen.getByRole('combobox'));

    const grid = screen.getByRole('grid');
    const rows = within(grid).getAllByRole('row');
    // 1 weekday header row + 6 week rows.
    expect(rows).toHaveLength(7);

    expect(within(rows[0]).getAllByRole('columnheader')).toHaveLength(7);

    const weekRows = rows.slice(1);
    weekRows.forEach((row) => {
      expect(within(row).getAllByRole('gridcell')).toHaveLength(7);
    });

    // No gridcell may sit outside a row.
    const cells = within(grid).getAllByRole('gridcell');
    expect(cells).toHaveLength(42);
    cells.forEach((cell) => {
      expect(cell.closest('[role="row"]')).not.toBeNull();
    });
  });

  it('lets an external FormField label own the trigger name', async () => {
    renderWithEngine(
      <FormField label="Date of birth" name="date-of-birth">
        <ModernDatePicker placeholder="Select date" />
      </FormField>,
      'modern'
    );

    const trigger = screen.getByRole('combobox', { name: 'Date of birth' });
    expect(trigger).not.toHaveAttribute('aria-label');
    expect(screen.queryByRole('combobox', { name: 'Select date' })).toBeNull();
  });

  it('keeps the placeholder as the last-resort name when no label exists', () => {
    renderWithEngine(<ModernDatePicker placeholder="Select date" />, 'modern');

    expect(screen.getByRole('combobox', { name: 'Select date' })).toBeInTheDocument();
  });

  it('keeps the roving tab stop reachable inside the new row wrappers', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernDatePicker defaultValue={new Date('2026-03-13T00:00:00.000Z')} />,
      'modern'
    );

    await user.click(screen.getByRole('combobox'));

    const tabbable = screen
      .getAllByRole('gridcell')
      .filter((cell) => cell.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);

    await act(async () => {
      tabbable[0].focus();
    });
    expect(document.activeElement).toBe(tabbable[0]);
  });
});

describe('Modern DatePicker date-only strings stay local', () => {
  // `new Date('2026-08-06')` is UTC midnight, which is Aug 5 in America/New_York.
  const localDay = (el: HTMLElement) =>
    el.querySelector('[role="gridcell"][aria-selected="true"]')?.textContent?.trim();

  it('uncontrolled defaultValue keeps the declared calendar day', async () => {
    const { container } = renderWithEngine(
      <ModernDatePicker open defaultValue="2026-08-06" />,
      'modern'
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-08-06');
    expect(localDay(container.ownerDocument.body)).toBe('6');
  });

  it('controlled value keeps the declared calendar day', async () => {
    const { container } = renderWithEngine(
      <ModernDatePicker open value="2026-08-06" onChange={() => {}} />,
      'modern'
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-08-06');
    expect(localDay(container.ownerDocument.body)).toBe('6');
  });
});

describe('Modern RangePicker date-only strings stay local', () => {
  const inputs = (c: HTMLElement) =>
    [...c.querySelectorAll('input')].map((i) => (i as HTMLInputElement).value);

  it('uncontrolled defaultValue keeps both declared calendar days', () => {
    const { container } = renderWithEngine(
      <ModernDatePicker.RangePicker defaultValue={['2026-08-06', '2026-08-09']} />,
      'modern'
    );
    expect(inputs(container)).toEqual(['2026-08-06', '2026-08-09']);
  });

  it('controlled value keeps both declared calendar days', () => {
    const { container } = renderWithEngine(
      <ModernDatePicker.RangePicker value={['2026-08-06', '2026-08-09']} onChange={() => {}} />,
      'modern'
    );
    expect(inputs(container)).toEqual(['2026-08-06', '2026-08-09']);
  });
});

describe('Modern DatePicker rejects impossible date-only strings', () => {
  const shownValue = (c: HTMLElement) => (c.querySelector('input') as HTMLInputElement).value;

  it('rejects month 13 instead of rolling into the next year', () => {
    const { container } = renderWithEngine(
      <ModernDatePicker defaultValue="2026-13-01" />,
      'modern'
    );
    expect(shownValue(container)).toBe('');
  });

  it('rejects day 00 and an impossible day-of-month', () => {
    const { container: a } = renderWithEngine(
      <ModernDatePicker defaultValue="2026-01-00" />,
      'modern'
    );
    expect(shownValue(a)).toBe('');

    const { container: b } = renderWithEngine(
      <ModernDatePicker defaultValue="2026-02-30" />,
      'modern'
    );
    expect(shownValue(b)).toBe('');
  });

  it('keeps a two-digit year in its own century instead of the 1900 window', () => {
    const { container } = renderWithEngine(
      <ModernDatePicker defaultValue="0099-08-06" />,
      'modern'
    );
    expect(shownValue(container)).toBe('0099-08-06');
  });
});
