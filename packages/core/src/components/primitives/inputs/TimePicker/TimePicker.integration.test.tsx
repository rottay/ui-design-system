import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

describe('TimePicker integration', () => {
  it.each(['modern', 'rustic'] as const)(
    'changes values in the live %s engine',
    async (engine) => {
      const { TimePicker } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <TimePicker engine={engine} placeholder="Select time" onChange={onChange} />,
        engine
      );

      const input = await screen.findByPlaceholderText('Select time');
      fireEvent.change(input, { target: { value: '09:30:00' } });

      expect(onChange).toHaveBeenCalledWith(expect.any(Date), '09:30:00');
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'clears selected values in the live %s engine',
    async (engine) => {
      const { TimePicker } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <TimePicker
          engine={engine}
          defaultValue="09:30:00"
          allowClear
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
      const { TimePicker } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <TimePicker.RangePicker
          engine={engine}
          placeholder={['Start time', 'End time']}
          onChange={onChange}
        />,
        engine
      );

      const start = await screen.findByPlaceholderText('Start time');
      const end = await screen.findByPlaceholderText('End time');

      fireEvent.change(start, { target: { value: '08:00:00' } });
      fireEvent.change(end, { target: { value: '17:00:00' } });

      expect(onChange).toHaveBeenCalled();
    }
  );

  it('respects the no-seconds format in the rustic engine', async () => {
    const { TimePicker } = await import('.');

    renderWithEngine(
      <TimePicker engine="rustic" placeholder="Meeting time" format="HH:mm" />,
      'rustic'
    );

    const input = await screen.findByPlaceholderText('Meeting time');
    expect(input).toHaveAttribute('step', '60');
  });
});
