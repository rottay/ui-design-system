import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ModernInputNumber from '../engines/modern';

/**
 * A fractional step must not surface IEEE-754 drift in the field. The value the
 * user reads and the value the consumer receives are the same contract, so both
 * are asserted.
 */
describe('InputNumber modern - fractional step precision', () => {
  it('keeps a 0.1 step readable instead of rendering 0.30000000000000004', async () => {
    const user = userEvent.setup();
    render(<ModernInputNumber defaultValue={0.1} step={0.1} />);

    const field = screen.getByRole('spinbutton') as HTMLInputElement;
    const increase = screen.getByRole('button', { name: 'Increase' });

    await user.click(increase);
    expect(field.value).toBe('0.2');

    await user.click(increase);
    // Raw arithmetic yields 0.30000000000000004 and the field renders it verbatim.
    expect(field.value).toBe('0.3');
  });

  it('reports the rounded value to onChange/onStep rather than the drifted sum', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onStep = vi.fn();
    render(
      <ModernInputNumber defaultValue={0.2} step={0.1} onChange={onChange} onStep={onStep} />,
    );

    await user.click(screen.getByRole('button', { name: 'Increase' }));

    expect(onChange).toHaveBeenCalledWith(0.3);
    expect(onStep).toHaveBeenCalledWith(0.3, expect.objectContaining({ type: 'up' }));
  });

  it('leaves integer stepping exact and invents no decimal tail', async () => {
    const user = userEvent.setup();
    render(<ModernInputNumber defaultValue={7} step={3} />);

    const field = screen.getByRole('spinbutton') as HTMLInputElement;
    await user.click(screen.getByRole('button', { name: 'Increase' }));

    expect(field.value).toBe('10');
  });

  it('keeps an exponential step exact instead of flattening it to zero', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModernInputNumber defaultValue={1e-7} step={1e-7} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase' }));

    // Reading 1e-7 as "zero decimals" would round the sum away entirely.
    expect(onChange).toHaveBeenCalledWith(2e-7);
  });

  it('keeps a negative-exponent step exact', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModernInputNumber defaultValue={1e-3} step={1e-3} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase' }));

    expect(onChange).toHaveBeenCalledWith(2e-3);
  });

  it('does not lose precision on a large positive-exponent value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModernInputNumber defaultValue={1e21} step={1e21} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase' }));

    expect(onChange).toHaveBeenCalledWith(2e21);
  });

  it('still honors an explicitly declared precision', async () => {
    const user = userEvent.setup();
    render(<ModernInputNumber defaultValue={1} step={0.125} precision={2} />);

    const field = screen.getByRole('spinbutton') as HTMLInputElement;
    await user.click(screen.getByRole('button', { name: 'Increase' }));

    expect(field.value).toBe('1.13');
  });
});
