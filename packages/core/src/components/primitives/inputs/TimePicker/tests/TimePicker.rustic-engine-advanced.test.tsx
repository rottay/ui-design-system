import React, { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('TimePicker rustic advanced coverage', () => {
  it('covers rustic parsing branches, clear handling, disabled clear guards, and range updates', async () => {
    const { TimePicker } = await import('.');
    const handleChange = vi.fn();

    const { container, rerender } = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <TimePicker
          engine="rustic"
          defaultValue="09:30:00"
          status="error"
          size="small"
          format="HH:mm:ss"
          onChange={handleChange}
        />
      </Suspense>,
      'rustic'
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="time"]')).toBeTruthy();
    });

    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement | null;
    expect(timeInput).toHaveAttribute('type', 'time');
    expect(timeInput).toHaveAttribute('step', '1');
    fireEvent.focus(timeInput!);
    fireEvent.blur(timeInput!);

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(handleChange).toHaveBeenCalledWith(null, '');

    rerender(
      <Suspense fallback={<div>Loading…</div>}>
        <TimePicker
          engine="rustic"
          defaultValue={new Date('2026-03-13T09:30:00.000Z')}
          disabled
          format="HH:mm"
          placeholder="Meeting time"
        />
      </Suspense>
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="time"]')).toBeTruthy();
    });

    const disabledInput = container.querySelector('input[type="time"]') as HTMLInputElement | null;
    expect(disabledInput).toHaveAttribute('step', '60');
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();

    rerender(
      <Suspense fallback={<div>Loading…</div>}>
        <TimePicker.RangePicker
          engine="rustic"
          defaultValue={['08:00:00', '17:00:00']}
          onChange={handleChange}
        />
      </Suspense>
    );

    await waitFor(() => {
      expect(container.querySelectorAll('input[type="time"]').length).toBeGreaterThanOrEqual(2);
    });

    const [start, end] = Array.from(container.querySelectorAll('input[type="time"]')) as HTMLInputElement[];
    fireEvent.focus(start);
    fireEvent.blur(start);
    fireEvent.focus(end);
    fireEvent.blur(end);
    fireEvent.change(start, { target: { value: '08:15:00' } });
    fireEvent.change(end, { target: { value: '17:30:00' } });

    await waitFor(() => {
      expect(handleChange.mock.calls.length).toBeGreaterThanOrEqual(3);
    });
  }, 10000);

  it('covers controlled rustic values, invalid string parsing, and allowClear guards', async () => {
    const { TimePicker } = await import('.');
    const handleChange = vi.fn();

    const { container } = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <TimePicker
          engine="rustic"
          value={new Date('2026-03-13T13:45:00.000Z')}
          defaultValue="not-a-time"
          allowClear={false}
          format="HH:mm"
          onChange={handleChange}
        />
      </Suspense>,
      'rustic'
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="time"]')).toBeTruthy();
    });

    const input = container.querySelector('input[type="time"]') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '14:00' } });
    fireEvent.blur(input);

    expect(input).toHaveAttribute('step', '60');
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    expect(handleChange).toHaveBeenCalled();
  });
});
