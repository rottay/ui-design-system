import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('antd', () => ({
  Calendar: (props: any) => (
    <div data-testid="ant-calendar">
      <div data-testid="value-year">
        {props.value?.year?.() ?? 'none'}
      </div>
      <div data-testid="default-year">
        {props.defaultValue?.year?.() ?? 'none'}
      </div>
      <div data-testid="valid-range">
        {props.validRange?.map((value: any) => value.format('YYYY-MM-DD')).join('..') ?? 'none'}
      </div>
      <div data-testid="disabled-probe">
        {String(props.disabledDate?.(dayjs('2026-03-11')))}
      </div>
      <div data-testid="cell-render">
        {props.cellRender?.(dayjs('2026-03-12'), {
          originNode: <span>origin</span>,
          today: dayjs('2026-03-13'),
          type: 'date',
        })}
      </div>
      <div data-testid="full-cell-render">
        {props.fullCellRender?.(dayjs('2026-03-14'), {
          originNode: <span>origin</span>,
          today: dayjs('2026-03-13'),
          type: 'month',
        })}
      </div>
      <div data-testid="header-render">
        {props.headerRender?.({
          value: dayjs('2026-03-01'),
          type: 'month',
          onChange: props.onChange,
          onTypeChange: props.onPanelChange,
        })}
      </div>
      <button type="button" onClick={() => props.onPanelChange?.(dayjs('2026-03-15'), 'year')}>
        Trigger panel change
      </button>
      <button type="button" onClick={() => props.onChange?.(dayjs('2026-03-16'))}>
        Trigger change
      </button>
      <button
        type="button"
        onClick={() => props.onSelect?.(dayjs('2026-03-17'), { source: 'date' })}
      >
        Trigger select
      </button>
    </div>
  ),
}));

import CalendarClassic from './engines/classic';

describe('Calendar classic engine', () => {
  it('normalizes date-based props and callback payloads around the Ant calendar wrapper', () => {
    const onPanelChange = vi.fn();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    const headerOnChange = vi.fn();
    const headerOnTypeChange = vi.fn();

    render(
      <CalendarClassic
        value={new Date(2026, 2, 10)}
        defaultValue={new Date(2026, 2, 9)}
        validRange={[
          new Date(2026, 2, 1),
          new Date(2026, 2, 31),
        ]}
        disabledDate={(date) => date.getDate() === 11}
        cellRender={(date, info) => (
          <span>{`${date.getDate()}-${info.today.getDate()}-${info.type}`}</span>
        )}
        fullCellRender={(date, info) => (
          <span>{`${date.getDate()}-${info.today.getDate()}-${info.type}`}</span>
        )}
        headerRender={({ value, type, onChange: onHeaderChange, onTypeChange }) => (
          <div>
            <span>{`${value.getFullYear()}-${type}`}</span>
            <button type="button" onClick={() => onHeaderChange(new Date('2026-04-02T00:00:00.000Z'))}>
              Header change
            </button>
            <button type="button" onClick={() => onTypeChange('year')}>
              Header type
            </button>
          </div>
        )}
        onPanelChange={onPanelChange}
        onChange={onChange}
        onSelect={onSelect}
      />
    );

    expect(screen.getByTestId('value-year')).toHaveTextContent('2026');
    expect(screen.getByTestId('default-year')).toHaveTextContent('2026');
    expect(screen.getByTestId('valid-range')).toHaveTextContent('2026-03-01..2026-03-31');
    expect(screen.getByTestId('disabled-probe')).toHaveTextContent('true');
    expect(screen.getByTestId('cell-render')).toHaveTextContent('12-13-date');
    expect(screen.getByTestId('full-cell-render')).toHaveTextContent('14-13-month');
    expect(screen.getByTestId('header-render')).toHaveTextContent('2026-month');

    fireEvent.click(screen.getByRole('button', { name: 'Trigger panel change' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger change' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger select' }));

    const [panelDate, panelMode] = onPanelChange.mock.calls[0];
    const [changedDate] = onChange.mock.calls[0];
    const [selectedDate, selectedInfo] = onSelect.mock.calls[0];

    expect(panelMode).toBe('year');
    expect(panelDate).toBeInstanceOf(Date);
    expect(panelDate.getFullYear()).toBe(2026);
    expect(panelDate.getMonth()).toBe(2);
    expect(panelDate.getDate()).toBe(15);

    expect(changedDate).toBeInstanceOf(Date);
    expect(changedDate.getFullYear()).toBe(2026);
    expect(changedDate.getMonth()).toBe(2);
    expect(changedDate.getDate()).toBe(16);

    expect(selectedDate).toBeInstanceOf(Date);
    expect(selectedDate.getFullYear()).toBe(2026);
    expect(selectedDate.getMonth()).toBe(2);
    expect(selectedDate.getDate()).toBe(17);
    expect(selectedInfo).toEqual({ source: 'date' });
  });
});
