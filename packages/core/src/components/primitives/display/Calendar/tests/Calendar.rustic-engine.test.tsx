import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CalendarRustic from '../engines/rustic';

function getDayCell(day: number): HTMLButtonElement {
  const cell = screen
    .getAllByRole('gridcell')
    .find((node) => node.textContent?.trim().startsWith(String(day)));

  if (!(cell instanceof HTMLButtonElement)) {
    throw new Error(`Missing day cell ${day}`);
  }

  return cell;
}

describe('Calendar rustic engine', () => {
  it('supports month and year navigation, month selection, and custom render hooks', async () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    const onPanelChange = vi.fn();

    render(
      <CalendarRustic
        defaultValue={new Date(2024, 0, 15)}
        fullscreen={false}
        onChange={onChange}
        onSelect={onSelect}
        onPanelChange={onPanelChange}
        dateCellRender={(date) => (date.getDate() === 15 ? <span>Milestone</span> : null)}
        monthCellRender={(date) => (date.getMonth() === 2 ? <span>Launch</span> : null)}
      />
    );

    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('S');
    expect(screen.getByText('Milestone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /january 2024/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(screen.getByRole('button', { name: /december 2023/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByRole('button', { name: /january 2024/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    expect(onPanelChange).toHaveBeenCalledWith(expect.any(Date), 'year');
    expect(screen.getByText('Launch')).toBeInTheDocument();

    const march = screen.getByText('March').closest('button');
    expect(march).toBeTruthy();
    fireEvent.click(march as HTMLButtonElement);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.any(Date));
      expect(onSelect).toHaveBeenCalledWith(expect.any(Date), { source: 'month' });
      expect(onPanelChange).toHaveBeenCalledWith(expect.any(Date), 'month');
    });
  });

  it('disables invalid dates and only emits events for enabled selections', async () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();

    render(
      <CalendarRustic
        defaultValue={new Date(2024, 0, 15)}
        validRange={[new Date(2024, 0, 10), new Date(2024, 0, 20)]}
        disabledDate={(date) => date.getDate() === 12}
        onChange={onChange}
        onSelect={onSelect}
      />
    );

    const outOfRange = getDayCell(5);
    const disabled = getDayCell(12);
    const enabled = getDayCell(15);

    expect(outOfRange).toBeDisabled();
    expect(disabled).toBeDisabled();
    expect(enabled).not.toBeDisabled();

    fireEvent.click(outOfRange);
    fireEvent.click(disabled);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(enabled);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(expect.any(Date), { source: 'date' });
    });
  });

  it('covers fullscreen headers, controlled year view, and hover branches for navigation and month cells', async () => {
    render(
      <CalendarRustic
        value={new Date(2024, 6, 1)}
        mode="year"
        fullscreen
        monthCellRender={(date) => (date.getMonth() === 6 ? <span>Peak</span> : null)}
      />
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();

    const previousYear = screen.getByRole('button', { name: /previous year/i });
    fireEvent.mouseEnter(previousYear);
    fireEvent.mouseLeave(previousYear);

    const nextYear = screen.getByRole('button', { name: /next year/i });
    fireEvent.mouseEnter(nextYear);
    fireEvent.mouseLeave(nextYear);

    const july = screen.getByText('July').closest('button') as HTMLButtonElement;
    fireEvent.mouseEnter(july);
    fireEvent.mouseLeave(july);
    expect(screen.getByText('Peak')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /july 2024/i }));
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sun');
  });
});
