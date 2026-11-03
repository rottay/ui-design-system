import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTimePicker, { TimePicker as ModernTimePickerCompound } from '../engines/modern';

// The modern engine renders a read-only text trigger (data-part="trigger-input")
// that opens a portaled hour/minute/second panel (.ds-time-picker-panel) on
// click; paint is owned by the modern skin, so tests drive the data-part anatomy.

/** The portaled panel lives under document.body, outside the render container. */
const panel = () => document.querySelector('.ds-time-picker-panel');
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
        size="sm"
        format="HH:mm:ss"
        onChange={handleChange}
      />
    );

    const trigger = container.querySelector('[data-part="trigger-input"]') as HTMLInputElement;
    expect(trigger).toHaveAttribute('readonly');
    expect(trigger).toHaveAttribute('data-status', 'error');
    expect(trigger).toHaveValue('09:30:00');
    expect(trigger.getAttribute('style')).toBeNull();

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
    // Contract default HH:mm:ss format: hour, minute, and second columns.
    expect(columns()).toHaveLength(3);
    fireEvent.click(optionsOf(columns()[1])[15]);
    expect(handleChange).toHaveBeenLastCalledWith(
      [expect.any(Date), expect.any(Date)],
      ['08:15:00', '17:00:00']
    );

    fireEvent.click(rangeInputs[1]);
    fireEvent.click(optionsOf(columns()[0])[18]);
    expect(handleChange).toHaveBeenLastCalledWith(
      [expect.any(Date), expect.any(Date)],
      ['08:15:00', '18:00:00']
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

const CENTRED_INSTANT = { block: 'center', behavior: 'instant' };

/** Spies the DOM scroll API before the panel mounts; `optionScrolls()` lists, in
    call order, the time-option cells it scrolled and the options each call passed. */
const spyOptionScrolls = () => {
  const spy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {});
  const optionScrolls = () =>
    spy.mock.calls.flatMap(([options], call) => {
      const target = spy.mock.contexts[call];
      return target instanceof HTMLElement && target.matches('[data-part="time-option"]')
        ? [{ target, options }]
        : [];
    });
  return { optionScrolls, restore: () => spy.mockRestore() };
};

describe('TimePicker modern mount scroll', () => {
  it('scrolls each selected 24h option into view once on mount, centred and instant', () => {
    const { optionScrolls, restore } = spyOptionScrolls();
    try {
      render(<ModernTimePicker defaultValue="14:25:40" format="HH:mm:ss" />);
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      const [hourColumn, minuteColumn, secondColumn] = columns();
      const scrolls = optionScrolls();
      expect(scrolls).toHaveLength(3);
      expect(scrolls[0].target).toBe(optionsOf(hourColumn)[14]);
      expect(scrolls[1].target).toBe(optionsOf(minuteColumn)[25]);
      expect(scrolls[2].target).toBe(optionsOf(secondColumn)[40]);
      expect(scrolls.map(({ target }) => target.textContent)).toEqual(['14', '25', '40']);
      for (const { target, options } of scrolls) {
        expect(target).toHaveAttribute('aria-selected', 'true');
        expect(options).toEqual(CENTRED_INSTANT);
      }

      // Mount-only: a later selection re-renders the open panel without scrolling again.
      fireEvent.click(optionsOf(minuteColumn)[50]);
      expect(trigger).toHaveValue('14:50:40');
      expect(optionScrolls()).toHaveLength(3);
    } finally {
      restore();
    }
  });

  it('scrolls the 12h display hour and the PM meridiem cell', () => {
    const { optionScrolls, restore } = spyOptionScrolls();
    try {
      render(<ModernTimePicker defaultValue="21:05" format="hh:mm" use12Hours />);
      fireEvent.click(screen.getByRole('combobox'));

      expect(columns()).toHaveLength(3);
      const [hourColumn, minuteColumn, meridiemColumn] = columns();
      expect(meridiemColumn).toHaveAttribute('data-column', 'meridiem');
      const scrolls = optionScrolls();
      expect(scrolls).toHaveLength(3);
      expect(scrolls[0].target).toBe(optionsOf(hourColumn)[8]);
      expect(scrolls[1].target).toBe(optionsOf(minuteColumn)[5]);
      expect(scrolls[2].target).toBe(optionsOf(meridiemColumn)[1]);
      expect(scrolls.slice(0, 2).map(({ target }) => target.textContent)).toEqual(['09', '05']);
      for (const { target, options } of scrolls) {
        expect(target).toHaveAttribute('aria-selected', 'true');
        expect(options).toEqual(CENTRED_INSTANT);
      }
    } finally {
      restore();
    }
  });

  it('scrolls midnight to the last 12h hour cell and the AM meridiem cell', () => {
    const { optionScrolls, restore } = spyOptionScrolls();
    try {
      render(<ModernTimePicker defaultValue="00:40" format="hh:mm" use12Hours />);
      fireEvent.click(screen.getByRole('combobox'));

      const [hourColumn, minuteColumn, meridiemColumn] = columns();
      expect(optionsOf(hourColumn)).toHaveLength(12);
      const scrolls = optionScrolls();
      expect(scrolls).toHaveLength(3);
      expect(scrolls[0].target).toBe(optionsOf(hourColumn)[11]);
      expect(scrolls[0].target.textContent).toBe('12');
      expect(scrolls[1].target).toBe(optionsOf(minuteColumn)[40]);
      expect(scrolls[2].target).toBe(optionsOf(meridiemColumn)[0]);
      for (const { target, options } of scrolls) {
        expect(target).toHaveAttribute('aria-selected', 'true');
        expect(options).toEqual(CENTRED_INSTANT);
      }
    } finally {
      restore();
    }
  });

  it('scrolls nothing in a column whose selected value is not one of its options', () => {
    const { optionScrolls, restore } = spyOptionScrolls();
    try {
      render(
        <ModernTimePicker
          defaultValue="10:20:30"
          format="HH:mm:ss"
          minuteStep={15}
          hideDisabledOptions
          disabledTime={() => ({ disabledHours: () => [10] })}
        />
      );
      fireEvent.click(screen.getByRole('combobox'));

      // Hour 10 is hidden and minute 20 is off the 15-minute step: no selected cell in either.
      const [hourColumn, minuteColumn, secondColumn] = columns();
      expect(optionsOf(hourColumn)).toHaveLength(23);
      expect(hourColumn.querySelector('[aria-selected="true"]')).toBeNull();
      expect(optionsOf(minuteColumn).map((option) => option.textContent)).toEqual(['00', '15', '30', '45']);
      expect(minuteColumn.querySelector('[aria-selected="true"]')).toBeNull();

      const scrolls = optionScrolls();
      expect(scrolls).toHaveLength(1);
      expect(scrolls[0].target).toBe(optionsOf(secondColumn)[30]);
      expect(scrolls[0].options).toEqual(CENTRED_INSTANT);
    } finally {
      restore();
    }
  });

  it('skips an absent hour column and the seconds column outside a seconds format', () => {
    const { optionScrolls, restore } = spyOptionScrolls();
    try {
      render(<ModernTimePicker defaultValue="07:45" format="HH:mm" showHour={false} />);
      fireEvent.click(screen.getByRole('combobox'));

      expect(columns()).toHaveLength(1);
      const [minuteColumn] = columns();
      const scrolls = optionScrolls();
      expect(scrolls).toHaveLength(1);
      expect(scrolls[0].target).toBe(optionsOf(minuteColumn)[45]);
      expect(scrolls[0].target.textContent).toBe('45');
    } finally {
      restore();
    }
  });

  it('scrolls the first cell of every column when no time is set', () => {
    const { optionScrolls, restore } = spyOptionScrolls();
    try {
      render(<ModernTimePicker format="HH:mm:ss" />);
      fireEvent.click(screen.getByRole('combobox'));

      const timeColumns = columns();
      expect(timeColumns).toHaveLength(3);
      const scrolls = optionScrolls();
      expect(scrolls).toHaveLength(3);
      timeColumns.forEach((column, index) => {
        expect(scrolls[index].target).toBe(optionsOf(column)[0]);
        expect(scrolls[index].options).toEqual(CENTRED_INSTANT);
      });
    } finally {
      restore();
    }
  });
});
