/**
 * Stepper.Step forwards the caller's props to the step root, where the kernel
 * also spreads its own handler bag. A spread REPLACES a colliding prop, so the
 * step composes both instead.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StepperStep } from '../compound/step';

/** The step's passthrough is typed as attributes only; a caller can still send a handler. */
const Step = StepperStep as unknown as React.ComponentType<Record<string, unknown>>;

function stepRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector('[data-part="item"]');
  if (!root) throw new Error('step root not rendered');
  return root as HTMLElement;
}

describe('Stepper.Step composes the caller handler with the kernel', () => {
  it('runs the caller onPointerDown and still stamps the kernel press', () => {
    const onPointerDown = vi.fn();
    const { container } = render(<Step title="Account" onPointerDown={onPointerDown} />);
    const root = stepRoot(container);

    fireEvent.pointerDown(root);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(root.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerUp(root);
    expect(root).not.toHaveAttribute('data-state');
  });

  it('runs the caller onFocus and still stamps the kernel focus', () => {
    const onFocus = vi.fn();
    const { container } = render(<Step title="Account" onFocus={onFocus} />);
    const root = stepRoot(container);

    fireEvent.focus(root);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(root.getAttribute('data-state')).toContain('focused');

    fireEvent.blur(root);
    expect(root).not.toHaveAttribute('data-state');
  });
});
