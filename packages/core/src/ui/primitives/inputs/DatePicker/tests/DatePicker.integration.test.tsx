import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

describe('DatePicker integration', () => {
  it.each(['modern', 'rustic'] as const)(
    'changes values in the live %s engine',
    async (engine) => {
      const { DatePicker } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <DatePicker engine={engine} placeholder="Select date" onChange={onChange} />,
        engine
      );

      const input = await screen.findByPlaceholderText('Select date');
      fireEvent.click(input);
      fireEvent.click(await screen.findByRole('button', { name: 'Today' }));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(expect.any(Date), expect.any(String));
      });
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'clears selected values in the live %s engine',
    async (engine) => {
      const { DatePicker } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <DatePicker
          engine={engine}
          defaultValue={new Date('2026-03-13T00:00:00.000Z')}
          onChange={onChange}
        />,
        engine
      );

      fireEvent.click(await screen.findByRole('button'));
      expect(onChange).toHaveBeenCalledWith(null, '');
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'exposes RangePicker through the %s engine',
    async (engine) => {
      const { DatePicker } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <DatePicker.RangePicker
          engine={engine}
          placeholder={['Start date', 'End date']}
          onChange={onChange}
        />,
        engine
      );

      const start = await screen.findByPlaceholderText('Start date');
      fireEvent.click(start);
      fireEvent.click(await screen.findByRole('button', { name: 'Today' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Today' }));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    }
  );

  it.each(['week', 'month', 'year'] as const)(
    'renders picker mode %s in the rustic engine',
    async (picker) => {
      const { DatePicker } = await import('..');

      renderWithEngine(
        <DatePicker engine="rustic" picker={picker} placeholder={`Select ${picker}`} />,
        'rustic'
      );

      expect(await screen.findByPlaceholderText(`Select ${picker}`)).toBeInTheDocument();
    }
  );
});
