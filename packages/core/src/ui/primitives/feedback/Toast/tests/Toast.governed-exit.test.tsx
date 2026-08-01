/**
 * Toast modern engine — governed exit window (SC-2).
 *
 * The dismissal window is read from the toast's own computed style through
 * the shared presence-duration helper, never from a fixed JS constant. With
 * no stylesheet attached the computed reading declares nothing, so the window
 * collapses to the helper's buffer alone and the removal lands on it.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernToast from '../engines/modern';

/** Window the governed reading yields when no motion is declared. */
const BUFFER_MS = 50;

afterEach(() => {
  vi.useRealTimers();
});

describe('Modern Toast governed exit', () => {
  it('plays the exit before reporting onClose on the governed window', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <ModernToast description="Saved" closable visible duration={0} onClose={onClose} />
    );

    fireEvent.click(screen.getByLabelText('Close'));

    // The exit owns the window first -- dismissal is not a same-tick report.
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Saved')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(BUFFER_MS);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('unmounts on the governed window when the caller withdraws the toast', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    const { rerender } = render(
      <ModernToast description="Saved" closable visible duration={0} onClose={onClose} />
    );

    rerender(
      <ModernToast
        description="Saved"
        closable
        visible={false}
        duration={0}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Saved')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(BUFFER_MS);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('finalizes once when an in-flight exit is re-requested', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <ModernToast description="Saved" closable visible duration={0} onClose={onClose} />
    );

    const close = screen.getByLabelText('Close');
    fireEvent.click(close);
    fireEvent.click(close);

    act(() => {
      vi.advanceTimersByTime(BUFFER_MS);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
