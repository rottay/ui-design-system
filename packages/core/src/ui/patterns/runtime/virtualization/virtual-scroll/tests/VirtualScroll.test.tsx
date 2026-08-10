/** A stale scroll offset must not leave a virtualized list with an empty slice. */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useVirtualScroll } from '..';

function fireScroll(onScroll: (e: React.UIEvent<HTMLDivElement>) => void, scrollTop: number) {
  onScroll({ currentTarget: { scrollTop } } as unknown as React.UIEvent<HTMLDivElement>);
}

describe('useVirtualScroll', () => {
  it('computes the visible window from scroll position', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: 1000, rowHeight: 50, containerHeight: 500, overscan: 2 }),
    );
    expect(result.current.startIndex).toBe(0);
    expect(result.current.totalHeight).toBe(50000);
  });

  it('does not go blank when totalItems shrinks while scrolled far down', () => {
    const { result, rerender } = renderHook(
      ({ totalItems }: { totalItems: number }) =>
        useVirtualScroll({ totalItems, rowHeight: 50, containerHeight: 500, overscan: 2 }),
      { initialProps: { totalItems: 1000 } },
    );

    // Scroll near the bottom of the original 1000-row list.
    act(() => {
      fireScroll(result.current.onScroll, 49000);
    });
    expect(result.current.startIndex).toBeGreaterThan(900);

    // The dataset shrinks (e.g. a live filter) with no scroll event to
    // reset scrollTop -- the hook's internal scroll state is untouched.
    rerender({ totalItems: 10 });

    // The visible slice must remain valid after totalItems shrinks.
    expect(result.current.startIndex).toBeLessThanOrEqual(result.current.endIndex);
    expect(result.current.endIndex).toBeLessThanOrEqual(10);
    expect(result.current.startIndex).toBeLessThan(10);
  });

  it('never lets startIndex exceed endIndex for a scrollTop past the scrollable height', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: 5, rowHeight: 50, containerHeight: 500, overscan: 1 }),
    );

    // totalHeight is only 250px; this scrollTop is far beyond it (e.g. a
    // stale value carried over from a taller previous render).
    act(() => {
      fireScroll(result.current.onScroll, 100000);
    });

    expect(result.current.startIndex).toBeLessThanOrEqual(result.current.endIndex);
    expect(result.current.endIndex).toBeLessThanOrEqual(5);
  });

  it('renders nothing for an empty dataset without going negative', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalItems: 0, rowHeight: 50, containerHeight: 500 }),
    );
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
    expect(result.current.totalHeight).toBe(0);
  });
});
