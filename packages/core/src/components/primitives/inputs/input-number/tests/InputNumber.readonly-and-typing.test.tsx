// `readOnly` must survive the APG key set (steppers go, the input stays focusable), and
// `precision` formats the COMMITTED value, never mid-keystroke under the caret.

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import ModernInputNumber from '../engines/modern';

describe('InputNumber modern readOnly + in-flight typing', () => {
  it('refuses every keyboard step while readOnly', () => {
    const onChange = vi.fn();
    const onStep = vi.fn();
    const { container } = render(
      <ModernInputNumber defaultValue={10} min={0} max={100} step={5} readOnly onChange={onChange} onStep={onStep} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;

    for (const key of ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']) {
      fireEvent.keyDown(input, { key });
    }

    expect(onChange).not.toHaveBeenCalled();
    expect(onStep).not.toHaveBeenCalled();
    expect(input.value).toBe('10');
  });

  it('still steps with the keyboard when not readOnly', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ModernInputNumber defaultValue={10} step={5} onChange={onChange} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('echoes exactly what was typed instead of reformatting under the caret', () => {
    const { container } = render(<ModernInputNumber precision={2} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '1' } });
    // The defect: `formatValue` turned this into "1.00" on the very next
    // render, so the next digit landed in the fraction.
    expect(input.value).toBe('1');

    fireEvent.change(input, { target: { value: '1.5' } });
    expect(input.value).toBe('1.5');
  });

  it('applies the declared precision on blur, once entry is over', () => {
    const { container } = render(<ModernInputNumber precision={2} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '1.5' } });
    fireEvent.blur(input);

    expect(input.value).toBe('1.50');
  });

  it('a stepped value supersedes the in-flight draft', () => {
    const { container } = render(<ModernInputNumber step={1} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '4' } });
    expect(input.value).toBe('4');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('5');
  });
});
