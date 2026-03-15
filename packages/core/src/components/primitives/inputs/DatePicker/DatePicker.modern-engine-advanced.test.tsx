import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernDatePicker, { DatePicker as ModernDatePickerCompound } from './engines/modern';
import { renderWithEngine } from '../../../../../testing/helpers/engine-test-utils';

describe('DatePicker modern advanced coverage', () => {
  it('covers year picker selection and clear handling', async () => {
    const handleChange = vi.fn();
    renderWithEngine(
      <ModernDatePicker
        defaultValue={new Date('2026-03-13T00:00:00.000Z')}
        placeholder="Modern advanced"
        picker="year"
        status="warning"
        size="large"
        onChange={handleChange}
      />,
      'modern'
    );

    const yearInput = screen.getByRole('combobox', { name: 'Modern advanced' });
    expect(yearInput.className).toContain('input-lg');
    expect(yearInput.className).toContain('input-warning');

    fireEvent.click(yearInput);
    expect(screen.getByRole('button', { name: 'Previous decade' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next decade' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '2027' }));
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '2027');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(handleChange).toHaveBeenCalledWith(null, '');
  });

  it('covers disabled month picker guard rails', () => {
    const monthRender = renderWithEngine(
      <ModernDatePicker
        picker="month"
        disabled
        placeholder="Month value"
      />,
      'modern'
    );

    expect(screen.getByRole('combobox', { name: 'Month value' })).toBeDisabled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    monthRender.unmount();
  });

  it('covers range picker status, custom separator, and clear handling', () => {
    const handleChange = vi.fn();
    renderWithEngine(
      <ModernDatePickerCompound.RangePicker
        defaultValue={[
          new Date('2026-03-01T00:00:00.000Z'),
          new Date('2026-03-10T00:00:00.000Z'),
        ]}
        status="error"
        separator="through"
        onChange={handleChange}
      />,
      'modern'
    );

    const [start] = screen.getAllByRole('combobox');
    expect(start.className).toContain('input-error');
    expect(screen.getByText('through')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear dates' }));
    expect(handleChange).toHaveBeenCalledWith(null, ['', '']);
  });

  it('covers controlled week values, allowClear guards, size mapping, and default date fallback', async () => {
    const handleChange = vi.fn();
    const { rerender } = renderWithEngine(
      <ModernDatePicker
        value="2026-W11"
        picker="week"
        placeholder="Week picker"
        allowClear={false}
        size="small"
        status="error"
        onChange={handleChange}
      />,
      'modern'
    );

    const weekInput = await screen.findByPlaceholderText('Week picker');
    expect(weekInput.className).toContain('input-sm');
    expect(weekInput.className).toContain('input-error');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    fireEvent.click(weekInput);
    fireEvent.click(await screen.findByRole('button', { name: 'Today' }));
    expect(handleChange).toHaveBeenCalled();

    rerender(<ModernDatePicker picker="date" defaultValue="2026-03-14" placeholder="Date fallback" />);
    expect(await screen.findByPlaceholderText('Date fallback')).toBeInTheDocument();
  });

  it('covers time mode, disabled dates, custom cell render, keyboard selection, and extra footer', async () => {
    const handleChange = vi.fn();

    renderWithEngine(
      <ModernDatePicker
        defaultValue={new Date('2026-03-14T08:15:00.000Z')}
        placeholder="Timed picker"
        showTime
        showNow
        renderExtraFooter={() => <span>Extra footer</span>}
        cellRender={(current, info) => (
          <span data-testid={`cell-${current.getDate()}`}>{info.originNode}</span>
        )}
        disabledDate={(date) => date.getDate() === 15}
        onChange={handleChange}
      />,
      'modern'
    );

    const input = screen.getByRole('combobox', { name: 'Timed picker' });
    fireEvent.click(input);

    expect(await screen.findByRole('dialog', { name: 'Date picker' })).toBeInTheDocument();
    expect(screen.getByText('Extra footer')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByTestId('cell-14')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Hour' }), {
      target: { value: '9' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Minute' }), {
      target: { value: '30' },
    });

    const disabledCell = screen.getByRole('gridcell', { name: '2026-03-15' });
    expect(disabledCell).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(disabledCell);

    const grid = screen.getByRole('grid', { name: 'Calendar dates' });
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    fireEvent.keyDown(grid, { key: 'Enter' });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Now'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('covers month panel navigation, custom footer, and panel change callbacks', async () => {
    const handleChange = vi.fn();
    const handlePanelChange = vi.fn();

    renderWithEngine(
      <ModernDatePicker
        picker="month"
        placeholder="Month advanced"
        renderExtraFooter={() => <span>Month footer</span>}
        onChange={handleChange}
        onPanelChange={handlePanelChange}
      />,
      'modern'
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Month advanced' }));
    expect(await screen.findByText('Month footer')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apr' }));

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(expect.any(Date), expect.stringContaining('April'));
    });
    expect(handlePanelChange).toHaveBeenCalledWith(expect.any(Date), 'month');
  });
});
