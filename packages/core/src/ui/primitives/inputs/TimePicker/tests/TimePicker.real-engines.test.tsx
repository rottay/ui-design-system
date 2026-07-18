import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';

import ClassicTimePicker, { TimePicker as ClassicTimePickerCompound } from '../engines/classic';
import ModernTimePicker, { TimePicker as ModernTimePickerCompound } from '../engines/modern';
import RusticTimePicker, { TimePicker as RusticTimePickerCompound } from '../engines/rustic';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

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
    // The modern engine renders a read-only text trigger opening a portaled
    // hour/minute/second panel; selections happen via time-option buttons.
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

    const columns = () =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-part="time-column"]'));
    const optionsOf = (column: HTMLElement) =>
      Array.from(column.querySelectorAll<HTMLButtonElement>('button[data-part="time-option"]'));

    const triggers = Array.from(
      container.querySelectorAll<HTMLInputElement>('[data-part="trigger-input"]')
    );
    expect(triggers).toHaveLength(3);
    const [baseTrigger, rangeStart] = triggers;

    fireEvent.click(baseTrigger);
    expect(columns()).toHaveLength(3);
    fireEvent.click(optionsOf(columns()[0])[10]);
    expect(onChange).toHaveBeenLastCalledWith(expect.any(Date), '10:30:00');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.querySelector('.rottay-timepicker__panel')).toBeNull();

    fireEvent.click(rangeStart);
    fireEvent.click(optionsOf(columns()[1])[15]);

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith(
        [expect.any(Date), expect.any(Date)],
        [expect.any(String), expect.any(String)]
      );
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
