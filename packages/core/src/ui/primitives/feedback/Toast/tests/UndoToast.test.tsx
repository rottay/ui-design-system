/**
 * UndoToast timer orchestration tests (WO-CRA-02).
 *
 * `UndoToast` owns a single window timer (see `compound/UndoToast/index.tsx`)
 * that must: fire `onClose` after `duration`; on `pauseOnHover`, pause and
 * resume with the REMAINING time rather than a fresh window; and clear
 * itself on unmount so a stale timer can never fire late. None of this had a
 * test before.
 *
 * `BaseToast` (the lazy, engine-routed primitive UndoToast renders) is
 * mocked here so these tests exercise ONLY UndoToast's own timer logic, not
 * the async engine-loading/Suspense machinery -- that lets `vi.useFakeTimers`
 * be active from the very first render, which real `setTimeout` calls
 * scheduled before fake timers are installed would not respect. The mock
 * mirrors the one real-engine contract UndoToast depends on: it calls
 * `onClose` when the `visible` prop transitions from true to false (each
 * real engine does this itself, after its own exit animation).
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('../engines', () => ({
  BaseToast: ({ title, description, action, onClose, closable, visible }: any) => {
    const wasVisible = React.useRef(visible);
    React.useEffect(() => {
      if (wasVisible.current && !visible) {
        onClose?.();
      }
      wasVisible.current = visible;
    });

    if (!visible) return null;

    return (
      <div role="alert">
        {title && <span>{title}</span>}
        {description && <span>{description}</span>}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              if (action.closeOnClick !== false) onClose?.();
            }}
          >
            {action.label}
          </button>
        )}
        {closable && (
          <button aria-label="Close" onClick={() => onClose?.()}>
            Close
          </button>
        )}
      </div>
    );
  },
}));

import { UndoToast } from '../compound/UndoToast';

describe('UndoToast timer orchestration', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('elapses and calls onClose after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const onUndo = vi.fn();

    render(<UndoToast title="Item deleted" onUndo={onUndo} onClose={onClose} duration={5000} />);

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('calls onUndo and clears the timer when Undo is clicked before the window elapses', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const onUndo = vi.fn();

    render(<UndoToast title="Item deleted" onUndo={onUndo} onClose={onClose} duration={5000} />);

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    // The window timer was cleared by the Undo click, so onClose must not
    // fire later from the original schedule.
    expect(onClose).toHaveBeenCalledTimes(1); // once, from the action's own closeOnClick
  });

  it('pauses on hover and resumes with the remaining time, not a fresh window', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <UndoToast title="Item deleted" onUndo={vi.fn()} onClose={onClose} duration={5000} pauseOnHover />
    );

    const alert = screen.getByRole('alert');
    // UndoToast's hover handlers live on the wrapper div one level above the
    // BaseToast root (the alert).
    const wrapper = alert.parentElement as HTMLElement;

    // Let 3000ms elapse, leaving ~2000ms remaining.
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    fireEvent.mouseEnter(wrapper);

    // While paused, even a much longer advance must not fire the dismiss.
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseLeave(wrapper);

    // If the implementation restarted with a FRESH 5000ms window, 2000ms
    // would not be enough. It only elapses if the ~2000ms REMAINING window
    // was correctly resumed.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clears the window timer on unmount so onClose never fires late', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    const { unmount } = render(
      <UndoToast title="Item deleted" onUndo={vi.fn()} onClose={onClose} duration={5000} />
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
