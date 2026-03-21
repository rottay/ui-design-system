import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClassicDatePicker, { DatePicker as ClassicDatePickerCompound } from './engines/classic';
import ModernDatePicker, { DatePicker as ModernDatePickerCompound } from './engines/modern';
import RusticDatePicker, { DatePicker as RusticDatePickerCompound } from './engines/rustic';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

describe('DatePicker real engine coverage', () => {
  it('covers classic base and range picker branches', () => {
    const onOpenChange = vi.fn();

    render(
      <>
        <ClassicDatePicker
          value={new Date('2026-03-13T00:00:00.000Z')}
          picker="year"
          allowClear
          showToday
          showNow
          open
          status="warning"
          placeholder="Year value"
          popupClassName="classic-popup"
          popupStyle={{ border: '1px solid red' }}
          onOpenChange={onOpenChange}
          disabledDate={(date) => date.getFullYear() < 2026}
        />
        <ClassicDatePickerCompound.RangePicker
          defaultValue={[new Date('2026-03-01T00:00:00.000Z'), new Date('2026-03-10T00:00:00.000Z')]}
          separator="to"
          allowClear
          open
        />
      </>
    );

    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(2);
  });

  it('covers modern base and range picker branches', async () => {
    const onChange = vi.fn();

    renderWithEngine(
      <>
        <ModernDatePicker
          placeholder="Modern date"
          status="error"
          size="large"
          onChange={onChange}
        />
        <ModernDatePickerCompound.RangePicker
          defaultValue={[new Date('2026-03-01T00:00:00.000Z'), new Date('2026-03-10T00:00:00.000Z')]}
          status="warning"
          separator="through"
          onChange={onChange}
        />
      </>,
      'modern'
    );

    fireEvent.click(await screen.findByPlaceholderText('Modern date'));
    fireEvent.click(await screen.findByRole('button', { name: 'Today' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Clear dates' }));

    await waitFor(() => {
      expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('covers rustic public engine through base and range APIs', async () => {
    const onChange = vi.fn();

    const { unmount } = renderWithEngine(
      <RusticDatePicker
        picker="week"
        placeholder="Rustic week"
        onChange={onChange}
      />,
      'rustic'
    );

    fireEvent.click(await screen.findByPlaceholderText('Rustic week'));
    fireEvent.click(await screen.findByRole('button', { name: 'Today' }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    unmount();

    renderWithEngine(
      <RusticDatePickerCompound.RangePicker
        defaultValue={[new Date('2026-03-01T00:00:00.000Z'), new Date('2026-03-10T00:00:00.000Z')]}
        onChange={onChange}
      />
      ,
      'rustic'
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Clear dates' }));

    await waitFor(() => {
      expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
