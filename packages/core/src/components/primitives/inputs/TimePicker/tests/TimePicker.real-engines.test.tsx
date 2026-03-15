import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';

import ClassicTimePicker, { TimePicker as ClassicTimePickerCompound } from '../engines/classic';
import ModernTimePicker, { TimePicker as ModernTimePickerCompound } from '../engines/modern';
import RusticTimePicker, { TimePicker as RusticTimePickerCompound } from '../engines/rustic';
import { renderWithEngine } from '../../../../../testing/helpers/engine-test-utils';

describe('TimePicker real engine coverage', () => {
  it('covers classic base and range picker branches', () => {
    const onOpenChange = vi.fn();

    render(
      <>
        <ClassicTimePicker
          value="09:30:00"
          format="HH:mm:ss"
          hourStep={2}
          minuteStep={15}
          secondStep={30}
          use12Hours
          showNow
          allowClear
          open
          status="warning"
          placeholder="Time value"
          popupClassName="classic-time-popup"
          popupStyle={{ border: '1px solid red' }}
          onOpenChange={onOpenChange}
        />
        <ClassicTimePickerCompound.RangePicker
          defaultValue={['08:00:00', '17:00:00']}
          separator="to"
          allowClear
          open
        />
      </>
    );
  });

  it('covers modern base and range picker branches', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <>
        <ModernTimePicker
          defaultValue="09:30:00"
          status="error"
          size="small"
          format="HH:mm:ss"
          onChange={onChange}
        />
        <ModernTimePickerCompound.RangePicker
          defaultValue={[new Date('2026-03-13T08:00:00.000Z'), new Date('2026-03-13T17:00:00.000Z')]}
          status="warning"
          separator="through"
          onChange={onChange}
        />
      </>
    );

    const baseInput = container.querySelector('input[type="time"]') as HTMLInputElement;
    fireEvent.change(baseInput, { target: { value: '10:45:00' } });

    const [start, end] = Array.from(container.querySelectorAll('input[type="time"]')) as HTMLInputElement[];
    fireEvent.change(start, { target: { value: '08:15:00' } });
    fireEvent.change(end, { target: { value: '17:30:00' } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('covers rustic public engine through base and range APIs', async () => {
    const onChange = vi.fn();

    const { container, rerender } = renderWithEngine(
      <RusticTimePicker
        defaultValue="09:30:00"
        format="HH:mm"
        onChange={onChange}
      />,
      'rustic'
    );

    const baseInput = container.querySelector('input[type="time"]') as HTMLInputElement;
    fireEvent.change(baseInput, { target: { value: '09:45' } });

    rerender(
      <RusticTimePickerCompound.RangePicker
        defaultValue={['08:00:00', '17:00:00']}
        onChange={onChange}
      />
    );

    const [start, end] = Array.from(container.querySelectorAll('input[type="time"]')) as HTMLInputElement[];
    fireEvent.change(start, { target: { value: '08:30:00' } });
    fireEvent.change(end, { target: { value: '17:15:00' } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
});
