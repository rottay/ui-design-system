import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RusticInputNumber from '../engines/rustic';

describe('RusticInputNumber engine', () => {
  it('covers addons, affixes, stepping, precision, keyboard, and clamp logic', async () => {
    const handleChange = vi.fn();
    const handleStep = vi.fn();
    const handleEnter = vi.fn();

    render(
      <RusticInputNumber
        defaultValue={0.5}
        min={0}
        max={1}
        step="0.25"
        precision={2}
        prefix="$"
        suffix="kg"
        addonBefore="~"
        addonAfter="units"
        onChange={handleChange}
        onStep={handleStep}
        onPressEnter={handleEnter}
        placeholder="Quantity"
      />
    );

    const input = screen.getByRole('spinbutton');

    expect(screen.getByText('~')).toBeInTheDocument();
    expect(screen.getByText('units')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(handleStep).toHaveBeenCalled();
    });

    expect(handleChange).toHaveBeenCalledWith(0.75);
    expect(handleChange).toHaveBeenCalledWith(1);
    expect(handleEnter).toHaveBeenCalledTimes(1);
  });

  it('covers readonly, disabled, controls=false, and manual typing branches', () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <RusticInputNumber
        defaultValue={4}
        controls={false}
        status="warning"
        onChange={handleChange}
      />
    );

    expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '6' } });
    expect(handleChange).toHaveBeenCalledWith(6);

    rerender(<RusticInputNumber defaultValue={4} readOnly onChange={handleChange} />);
    expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();

    rerender(<RusticInputNumber defaultValue={4} disabled onChange={handleChange} />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
  });
});
