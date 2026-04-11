import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTimePicker, { TimePicker as ModernTimePickerCompound } from '../engines/modern';

describe('TimePicker modern advanced coverage', () => {
  it('covers time parsing, clear handling, disabled guards, and range updates', async () => {
    const handleChange = vi.fn();
    const { container, rerender } = render(
      <ModernTimePicker
        defaultValue={new Date('2026-03-13T09:30:00.000Z')}
        status="error"
        size="small"
        format="HH:mm:ss"
        onChange={handleChange}
      />
    );

    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;
    expect(timeInput).toHaveAttribute('step', '1');
    expect(timeInput.className).toContain('input-sm');
    expect(timeInput.className).toContain('input-error');

    fireEvent.change(timeInput, { target: { value: '10:45:00' } });
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '10:45:00');

    fireEvent.click(container.querySelector('button') as HTMLButtonElement);
    expect(handleChange).toHaveBeenCalledWith(null, '');

    rerender(
      <ModernTimePicker
        defaultValue="09:30"
        disabled
        format="HH:mm"
        placeholder="Meeting time"
      />
    );

    expect(container.querySelector('input[type="time"]')).toHaveAttribute('step', '60');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(
      <ModernTimePickerCompound.RangePicker
        defaultValue={['08:00:00', '17:00:00']}
        status="warning"
        separator="through"
        onChange={handleChange}
      />
    );

    const [start, end] = Array.from(container.querySelectorAll('input[type="time"]')) as HTMLInputElement[];
    expect(start.className).toContain('input-warning');
    expect(screen.getByText('through')).toBeInTheDocument();

    fireEvent.change(start, { target: { value: '08:15:00' } });
    fireEvent.change(end, { target: { value: '17:30:00' } });

    await waitFor(() => {
      expect(handleChange.mock.calls.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('covers controlled values, invalid string parsing, and allowClear=false branches', () => {
    const handleChange = vi.fn();
    const { container, rerender } = render(
      <ModernTimePicker
        value={new Date('2026-03-13T13:45:00.000Z')}
        defaultValue="not-a-time"
        allowClear={false}
        format="HH:mm"
        onChange={handleChange}
      />
    );

    const input = container.querySelector('input[type="time"]') as HTMLInputElement;
    expect(input).toHaveAttribute('step', '60');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '14:00' } });
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '14:00');

    rerender(<ModernTimePicker value="09:15:00" format="HH:mm:ss" />);
    expect(container.querySelector('input[type="time"]')).toHaveValue('09:15:00');
  });
});
