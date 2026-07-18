import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTimePicker, { TimePicker as ModernTimePickerCompound } from '../engines/modern';

// The modern engine renders a read-only text trigger (data-part="trigger-input")
// that opens a portaled hour/minute/second panel (.rottay-timepicker__panel) on
// click; paint is owned by the modern skin, so tests drive the data-part anatomy.

/** The portaled panel lives under document.body, outside the render container. */
const panel = () => document.querySelector('.rottay-timepicker__panel');
const columns = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-part="time-column"]'));
const optionsOf = (column: HTMLElement) =>
  Array.from(column.querySelectorAll<HTMLButtonElement>('button[data-part="time-option"]'));

describe('TimePicker modern advanced coverage', () => {
  it('covers time parsing, clear handling, disabled guards, and range updates', async () => {
    const handleChange = vi.fn();
    const { container, rerender } = render(
      <ModernTimePicker
        defaultValue="09:30:00"
        status="error"
        size="small"
        format="HH:mm:ss"
        onChange={handleChange}
      />
    );

    const trigger = container.querySelector('[data-part="trigger-input"]') as HTMLInputElement;
    expect(trigger).toHaveAttribute('readonly');
    expect(trigger).toHaveAttribute('data-status', 'error');
    expect(trigger).toHaveValue('09:30:00');
    expect(trigger.style.boxSizing).toBe('border-box');

    fireEvent.click(trigger);
    expect(panel()).not.toBeNull();
    // HH:mm:ss format shows hour, minute, and second columns.
    expect(columns()).toHaveLength(3);

    fireEvent.click(optionsOf(columns()[0])[10]);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '10:30:00');
    expect(trigger).toHaveValue('10:30:00');

    fireEvent.click(container.querySelector('[data-part="clear-button"]') as HTMLButtonElement);
    expect(handleChange).toHaveBeenCalledWith(null, '');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(panel()).toBeNull();

    rerender(
      <ModernTimePicker
        defaultValue="09:30"
        disabled
        format="HH:mm"
        placeholder="Meeting time"
      />
    );

    const disabledTrigger = container.querySelector('[data-part="trigger-input"]') as HTMLInputElement;
    expect(disabledTrigger).toBeDisabled();
    expect(container.querySelector('[data-part="clear-button"]')).toBeNull();
    fireEvent.click(disabledTrigger);
    expect(panel()).toBeNull();

    rerender(
      <ModernTimePickerCompound.RangePicker
        defaultValue={['08:00:00', '17:00:00']}
        status="warning"
        separator="through"
        onChange={handleChange}
      />
    );

    const rangeInputs = Array.from(
      container.querySelectorAll<HTMLInputElement>('[data-part="trigger-input"]')
    );
    expect(rangeInputs).toHaveLength(2);
    expect(rangeInputs[0]).toHaveAttribute('data-range-input', 'start');
    expect(rangeInputs[0]).toHaveAttribute('data-status', 'warning');
    expect(screen.getByText('through')).toBeInTheDocument();

    fireEvent.click(rangeInputs[0]);
    // Default HH:mm format: hour and minute columns only.
    expect(columns()).toHaveLength(2);
    fireEvent.click(optionsOf(columns()[1])[15]);
    expect(handleChange).toHaveBeenLastCalledWith(
      [expect.any(Date), expect.any(Date)],
      ['08:15', '17:00']
    );

    fireEvent.click(rangeInputs[1]);
    fireEvent.click(optionsOf(columns()[0])[18]);
    expect(handleChange).toHaveBeenLastCalledWith(
      [expect.any(Date), expect.any(Date)],
      ['08:15', '18:00']
    );
  });

  it('covers controlled values, invalid string parsing, and allowClear=false branches', () => {
    const handleChange = vi.fn();
    const { container, rerender } = render(
      <ModernTimePicker
        value="13:45"
        defaultValue="not-a-time"
        allowClear={false}
        format="HH:mm"
        onChange={handleChange}
      />
    );

    const trigger = container.querySelector('[data-part="trigger-input"]') as HTMLInputElement;
    expect(trigger).toHaveValue('13:45');
    expect(container.querySelector('[data-part="clear-button"]')).toBeNull();

    fireEvent.click(trigger);
    expect(columns()).toHaveLength(2);

    // Controlled: selection emits onChange but the displayed value stays pinned
    // to the value prop.
    fireEvent.click(optionsOf(columns()[1])[0]);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '13:00');
    expect(trigger).toHaveValue('13:45');

    rerender(<ModernTimePicker value="09:15:00" format="HH:mm:ss" />);
    expect(container.querySelector('[data-part="trigger-input"]')).toHaveValue('09:15:00');
  });
});
