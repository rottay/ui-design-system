import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModernInputNumber from '../engines/modern';
import RusticInputNumber from '../engines/rustic';

describe('InputNumber real engine coverage', () => {
  it('covers modern stepping, clamping, formatting, affixes, addons, and keyboard branches', async () => {
    const handleChange = vi.fn();
    const handleStep = vi.fn();
    const handleEnter = vi.fn();

    const { rerender } = render(
      <ModernInputNumber
        defaultValue={1.25}
        min={0}
        max={2}
        step="0.5"
        precision={1}
        status="error"
        prefix="$"
        suffix="kg"
        addonBefore="~"
        addonAfter="units"
        placeholder="Quantity"
        onChange={handleChange}
        onStep={handleStep}
        onPressEnter={handleEnter}
      />
    );

    const input = screen.getByRole('spinbutton');

    expect(screen.getByText('~')).toBeInTheDocument();
    expect(screen.getByText('units')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();

    fireEvent.click(screen.getByText('▲'));
    fireEvent.click(screen.getByText('▲'));
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: '' } });

    await waitFor(() => {
      expect(handleStep).toHaveBeenCalled();
    });

    expect(handleChange).toHaveBeenCalledWith(1.8);
    expect(handleChange).toHaveBeenCalledWith(2);
    expect(handleChange).toHaveBeenCalledWith(1.5);
    expect(handleChange).toHaveBeenCalledWith(null);
    expect(handleEnter).toHaveBeenCalledTimes(1);

    rerender(
      <ModernInputNumber
        value={5}
        readOnly
        controls={false}
        placeholder="Locked"
      />
    );

    expect(screen.getByRole('spinbutton')).toHaveValue(5);
    expect(screen.queryByText('▲')).not.toBeInTheDocument();
    expect(screen.queryByText('▼')).not.toBeInTheDocument();
  });

  it('covers rustic controlled, parsing, focus, and disabled/readOnly guard branches', async () => {
    const handleChange = vi.fn();
    const handleStep = vi.fn();

    const { rerender } = render(
      <RusticInputNumber
        defaultValue={4}
        min={0}
        max={10}
        step={2}
        status="warning"
        prefix="$"
        placeholder="Rustic amount"
        onChange={handleChange}
        onStep={handleStep}
      />
    );

    const input = screen.getByRole('spinbutton');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '-' } });
    fireEvent.change(input, { target: { value: '7.5' } });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(handleStep).toHaveBeenCalledWith(9.5, { offset: 2, type: 'up' });
    });

    expect(handleChange).toHaveBeenCalledWith(null);
    expect(handleChange).toHaveBeenCalledWith(7.5);

    rerender(
      <RusticInputNumber
        value={3}
        readOnly
        addonBefore="A"
        addonAfter="B"
        suffix="%"
        controls={false}
      />
    );

    expect(screen.getByRole('spinbutton')).toHaveValue(3);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();

    rerender(<RusticInputNumber defaultValue={1} disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });
});
