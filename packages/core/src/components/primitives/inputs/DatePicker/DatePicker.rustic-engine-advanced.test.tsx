import React, { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithEngine } from '../../../../../testing/helpers/engine-test-utils';

describe('DatePicker rustic advanced coverage', () => {
  it('covers rustic picker variants, clear handling, disabled clear guards, and range updates', async () => {
    const { DatePicker } = await import('.');
    const handleChange = vi.fn();

    const yearRender = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <DatePicker
          engine="rustic"
          picker="year"
          defaultValue={new Date('2026-03-13T00:00:00.000Z')}
          status="warning"
          size="large"
          onChange={handleChange}
        />
      </Suspense>,
      'rustic'
    );

    const yearInput = await screen.findByRole('combobox', { name: 'Select date' });
    fireEvent.click(yearInput);
    expect(await screen.findByRole('dialog', { name: 'Year picker' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2027' }));
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '2027');

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(handleChange).toHaveBeenCalledWith(null, '');
    yearRender.unmount();

    const monthRender = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <DatePicker engine="rustic" picker="month" placeholder="Month value" disabled defaultValue="2026-03" />
      </Suspense>
      ,
      'rustic'
    );

    const monthInput = await screen.findByPlaceholderText('Month value');
    expect(monthInput).toBeDisabled();
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    monthRender.unmount();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <DatePicker.RangePicker
          engine="rustic"
          defaultValue={[new Date('2026-03-01T00:00:00.000Z'), new Date('2026-03-10T00:00:00.000Z')]}
          onChange={handleChange}
        />
      </Suspense>
      ,
      'rustic'
    );

    expect((await screen.findAllByRole('combobox')).length).toBeGreaterThanOrEqual(2);
    fireEvent.click(await screen.findByRole('button', { name: 'Clear dates' }));

    expect(handleChange).toHaveBeenCalledWith(null, ['', '']);
  }, 10000);

  it('covers controlled rustic values, week mode, and allowClear guards', async () => {
    const { DatePicker } = await import('.');
    const handleChange = vi.fn();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <DatePicker
          engine="rustic"
          picker="week"
          value="2026-W11"
          allowClear={false}
          placeholder="Week value"
          onChange={handleChange}
        />
      </Suspense>,
      'rustic'
    );

    const weekInput = await screen.findByPlaceholderText('Week value');
    fireEvent.click(weekInput);
    expect(await screen.findByRole('dialog', { name: 'Date picker' })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Today' }));

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });
  });

  it('covers rustic time mode, disabled dates, custom cells, and extra footer branches', async () => {
    const { DatePicker } = await import('.');
    const handleChange = vi.fn();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <DatePicker
          engine="rustic"
          defaultValue={new Date('2026-03-14T08:15:00.000Z')}
          placeholder="Rustic timed"
          showTime
          showNow
          renderExtraFooter={() => <span>Rustic footer</span>}
          cellRender={(current, info) => (
            <span data-testid={`rustic-cell-${current.getDate()}`}>{info.originNode}</span>
          )}
          disabledDate={(date: Date) => date.getDate() === 15}
          onChange={handleChange}
        />
      </Suspense>,
      'rustic'
    );

    const input = await screen.findByRole('combobox', { name: 'Rustic timed' });
    fireEvent.click(input);

    expect(await screen.findByRole('dialog', { name: 'Date picker' })).toBeInTheDocument();
    expect(screen.getByText('Rustic footer')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByTestId('rustic-cell-14')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Hour' }), {
      target: { value: '9' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Minute' }), {
      target: { value: '30' },
    });

    const disabledCell = screen.getByRole('gridcell', { name: '2026-03-15' });
    expect(disabledCell).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(disabledCell);

    fireEvent.click(screen.getByText('Now'));
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });
  });

  it('covers rustic month panel callbacks and year navigation branches', async () => {
    const { DatePicker } = await import('.');
    const handleChange = vi.fn();
    const handlePanelChange = vi.fn();

    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <DatePicker
          engine="rustic"
          picker="month"
          placeholder="Rustic month advanced"
          renderExtraFooter={() => <span>Month footer</span>}
          onChange={handleChange}
          onPanelChange={handlePanelChange}
        />
      </Suspense>,
      'rustic'
    );

    fireEvent.click(await screen.findByRole('combobox', { name: 'Rustic month advanced' }));
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
