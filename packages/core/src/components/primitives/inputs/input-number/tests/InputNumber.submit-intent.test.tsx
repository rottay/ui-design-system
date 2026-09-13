import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernInputNumber from '../engines/modern';

describe('InputNumber keyboard under an IME', () => {
  it('neither commits nor steps while a candidate is composing', () => {
    const onPressEnter = vi.fn();
    const onStep = vi.fn();
    render(<ModernInputNumber aria-label="Quantity" defaultValue={2} onPressEnter={onPressEnter} onStep={onStep} />);
    const field = screen.getByRole('spinbutton', { name: 'Quantity' });
    fireEvent.keyDown(field, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(field, { key: 'ArrowUp', keyCode: 229 });
    expect(onPressEnter).not.toHaveBeenCalled();
    expect(onStep).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Enter' });
    fireEvent.keyDown(field, { key: 'ArrowUp' });
    expect(onPressEnter).toHaveBeenCalledTimes(1);
    expect(onStep).toHaveBeenCalledWith(3, { offset: 1, type: 'up' });
  });

  it('decides stepper hover and press through the interaction kernel', () => {
    render(<ModernInputNumber aria-label="Quantity" defaultValue={2} />);
    const increase = screen.getByRole('button', { name: 'Increase' });
    fireEvent.pointerEnter(increase);
    expect(increase.getAttribute('data-state')).toContain('hovered');
    fireEvent.pointerDown(increase);
    expect(increase.getAttribute('data-state')).toContain('pressed');
  });
});
