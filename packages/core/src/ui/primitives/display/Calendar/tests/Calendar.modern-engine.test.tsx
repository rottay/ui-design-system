import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CalendarModern from '../engines/modern';

function getDayButton(day: number): HTMLButtonElement {
  const match = screen
    .getAllByRole('gridcell')
    .find((node) => node.textContent?.trim().startsWith(String(day)));

  if (!(match instanceof HTMLButtonElement)) {
    throw new Error(`Missing day button ${day}`);
  }

  return match;
}

describe('Calendar modern engine', () => {
  it('supports date selection, mode switching, month selection, and custom cell renders', async () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    const onPanelChange = vi.fn();

    render(
      <CalendarModern
        defaultValue={new Date(2026, 2, 15)}
        fullscreen={false}
        onChange={onChange}
        onSelect={onSelect}
        onPanelChange={onPanelChange}
        dateCellRender={(date) => (date.getDate() === 15 ? <span>Milestone</span> : null)}
        monthCellRender={(date) => (date.getMonth() === 3 ? <span>Roadmap</span> : null)}
      />
    );

    expect(screen.getByText('Milestone')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /march 2026/i }));
    expect(onPanelChange).toHaveBeenCalledWith(expect.any(Date), 'month');

    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    expect(screen.getByText('Roadmap')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('gridcell', { name: 'April Roadmap' }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.any(Date));
      expect(onSelect).toHaveBeenCalledWith(expect.any(Date), { source: 'month' });
      expect(onPanelChange).toHaveBeenCalledWith(expect.any(Date), 'month');
    });

    fireEvent.click(getDayButton(15));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(expect.any(Date), { source: 'date' });
    });
  });

  it('disables invalid days and supports year / month navigation', () => {
    const onChange = vi.fn();

    render(
      <CalendarModern
        defaultValue={new Date(2026, 2, 15)}
        validRange={[new Date(2026, 2, 10), new Date(2026, 2, 20)]}
        disabledDate={(date) => date.getDate() === 12}
        onChange={onChange}
      />
    );

    expect(getDayButton(5)).toBeDisabled();
    expect(getDayButton(12)).toBeDisabled();
    expect(getDayButton(15)).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));

    fireEvent.click(getDayButton(5));
    expect(onChange).not.toHaveBeenCalled();
  });
});
