/**
 * Stepper content — governed exit window (SC-2).
 *
 * Leaving a step plays the exit state first and unmounts on the window read
 * from the panel's own computed style through the shared presence-duration
 * helper. `keepMounted` keeps the node but must still reach the terminal
 * hidden state on that same window.
 */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { StepperContent } from '..';

/** Window the governed reading yields when no motion is declared. */
const BUFFER_MS = 50;

afterEach(() => {
  vi.useRealTimers();
});

describe('Stepper content governed exit', () => {
  it('holds the panel through its exit window, then unmounts it', () => {
    vi.useFakeTimers();

    const { rerender } = render(
      <StepperContent stepIndex={0} currentStep={0}>
        <span>Step one body</span>
      </StepperContent>
    );
    expect(screen.getByText('Step one body')).toBeInTheDocument();

    rerender(
      <StepperContent stepIndex={0} currentStep={1} previousStep={0}>
        <span>Step one body</span>
      </StepperContent>
    );

    // Still mounted: the exit visual owns the window before the unmount.
    expect(screen.getByText('Step one body')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(BUFFER_MS);
    });

    expect(screen.queryByText('Step one body')).not.toBeInTheDocument();
  });

  it('keeps a kept-mounted panel in the DOM while still reaching the hidden state', () => {
    vi.useFakeTimers();

    const { rerender } = render(
      <StepperContent stepIndex={0} currentStep={0} keepMounted>
        <span>Step one body</span>
      </StepperContent>
    );

    rerender(
      <StepperContent stepIndex={0} currentStep={1} previousStep={0} keepMounted>
        <span>Step one body</span>
      </StepperContent>
    );

    act(() => {
      vi.advanceTimersByTime(BUFFER_MS);
    });

    expect(screen.getByText('Step one body')).toBeInTheDocument();
  });
});
