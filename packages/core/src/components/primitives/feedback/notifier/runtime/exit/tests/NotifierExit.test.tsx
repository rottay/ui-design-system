/**
 * The notifier exit reports once, on its own signal or on the governed
 * fallback window, and a cancel before either lands withholds the report for
 * good: the obsolete window can never remove a surface that was re-armed.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NOTIFIER_EXIT_ANIMATION, useNotifierExit, type NotifierExit } from '..';

/** Window the governed reading yields when no motion is declared. */
const BUFFER_MS = 50;

afterEach(() => {
  vi.useRealTimers();
});

function Surface({ onExited, onReady }: { onExited: () => void; onReady: (exit: NotifierExit<HTMLDivElement>) => void }) {
  const exit = useNotifierExit<HTMLDivElement>(onExited);
  onReady(exit);
  return <div ref={exit.ref} data-testid="surface" data-open={exit.leaving ? 'false' : 'true'} onAnimationEnd={exit.onAnimationEnd} />;
}

function mount(onExited: () => void) {
  let exit!: NotifierExit<HTMLDivElement>;
  const view = render(<Surface onExited={onExited} onReady={(ready) => (exit = ready)} />);
  return { ...view, exit: () => exit, surface: () => screen.getByTestId('surface') };
}

describe('the exit reports once', () => {
  it('reports on the governed window when no animation ends first', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { exit, surface } = mount(onExited);

    act(() => exit().begin());
    expect(surface()).toHaveAttribute('data-open', 'false');
    act(() => void vi.advanceTimersByTime(BUFFER_MS - 1));
    expect(onExited).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('reports on its own animation end and not again on the window', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { exit, surface } = mount(onExited);

    act(() => exit().begin());
    fireEvent.animationEnd(surface(), { animationName: `${NOTIFIER_EXIT_ANIMATION}-toast` });
    expect(onExited).toHaveBeenCalledTimes(1);

    act(() => void vi.advanceTimersByTime(BUFFER_MS * 4));
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('ignores an animation end that is not the exit', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { exit, surface } = mount(onExited);

    act(() => exit().begin());
    fireEvent.animationEnd(surface(), { animationName: 'ds-notifier-enter' });
    expect(onExited).not.toHaveBeenCalled();
  });
});

describe('a cancel re-arms the surface and disowns the pending window', () => {
  it('withholds the report for good once cancelled before the window lands', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { exit, surface } = mount(onExited);

    act(() => exit().begin());
    act(() => void vi.advanceTimersByTime(20));
    act(() => exit().cancel());

    expect(surface()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(BUFFER_MS * 100));
    expect(onExited).not.toHaveBeenCalled();
  });

  it('ignores a late animation end of the cancelled exit', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { exit, surface } = mount(onExited);

    act(() => exit().begin());
    act(() => exit().cancel());
    fireEvent.animationEnd(surface(), { animationName: `${NOTIFIER_EXIT_ANIMATION}-toast` });

    expect(onExited).not.toHaveBeenCalled();
  });

  it('begins again after a cancel with a fresh window', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { exit, surface } = mount(onExited);

    act(() => exit().begin());
    act(() => void vi.advanceTimersByTime(20));
    act(() => exit().cancel());
    act(() => exit().begin());

    expect(surface()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS - 1));
    expect(onExited).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('drops the pending window with the surface on unmount', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { exit, unmount } = mount(onExited);

    act(() => exit().begin());
    unmount();
    act(() => void vi.advanceTimersByTime(BUFFER_MS * 4));

    expect(onExited).not.toHaveBeenCalled();
  });
});
