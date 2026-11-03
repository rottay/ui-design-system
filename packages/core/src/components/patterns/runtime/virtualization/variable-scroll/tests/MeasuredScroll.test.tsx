import { useEffect } from 'react';

import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMeasuredScroll } from '..';

describe('useMeasuredScroll', () => {
  it('computes total size from a numeric estimate', () => {
    const { result } = renderHook(() => useMeasuredScroll({ count: 100, estimateSize: 50 }));
    expect(result.current.totalSize).toBe(5000);
  });

  it('computes total size from a per-index estimate function', () => {
    // Alternating 40 / 60 -> average 50 across 10 rows = 500.
    const { result } = renderHook(() =>
      useMeasuredScroll({ count: 10, estimateSize: (i) => (i % 2 === 0 ? 40 : 60) }),
    );
    expect(result.current.totalSize).toBe(500);
  });

  it('windows to overscan around the top when the viewport is unmeasured', () => {
    // Without a mounted scroll element the viewport height is 0, so the window
    // collapses to the overscan band at the top: indices 0..overscan.
    const { result } = renderHook(() =>
      useMeasuredScroll({ count: 100, estimateSize: 50, overscan: 4 }),
    );
    const rows = result.current.virtualItems;
    expect(rows.map((r) => r.index)).toEqual([0, 1, 2, 3, 4]);
    expect(rows[0]).toMatchObject({ index: 0, start: 0, size: 50 });
    expect(rows[2]).toMatchObject({ index: 2, start: 100, size: 50 });
    expect(typeof rows[0].measureRef).toBe('function');
  });

  it('honors a custom overscan', () => {
    const { result } = renderHook(() =>
      useMeasuredScroll({ count: 100, estimateSize: 50, overscan: 1 }),
    );
    expect(result.current.virtualItems.map((r) => r.index)).toEqual([0, 1]);
  });

  it('keeps whole dataset rows for a fractional overscan at the top', () => {
    // Unscrolled, the start index clamps to 0, so only the end carries the fraction.
    const { result } = renderHook(() =>
      useMeasuredScroll({ count: 100, estimateSize: 50, overscan: 1.5 }),
    );
    const rows = result.current.virtualItems;
    expect(rows.map((r) => r.index)).toEqual([0, 1]);
    expect(rows[0]).toMatchObject({ index: 0, start: 0, size: 50 });
    expect(rows[1]).toMatchObject({ index: 1, start: 50, size: 50 });
  });

  it('returns no rows and zero size for an empty dataset', () => {
    const { result } = renderHook(() => useMeasuredScroll({ count: 0, estimateSize: 50 }));
    expect(result.current.virtualItems).toEqual([]);
    expect(result.current.totalSize).toBe(0);
  });

  it('never renders past the end of the dataset', () => {
    const { result } = renderHook(() =>
      useMeasuredScroll({ count: 3, estimateSize: 50, overscan: 10 }),
    );
    expect(result.current.virtualItems.map((r) => r.index)).toEqual([0, 1, 2]);
  });

  it('tracks the cumulative extent as count shrinks to zero and grows again', () => {
    // Row i is estimated at (i + 1) * 10px: 10, 20, 30, 40, 50.
    const estimateSize = (i: number) => (i + 1) * 10;
    const { result, rerender } = renderHook(
      ({ count }: { count: number }) => useMeasuredScroll({ count, estimateSize }),
      { initialProps: { count: 5 } },
    );
    expect(result.current.totalSize).toBe(150);

    rerender({ count: 2 });
    expect(result.current.totalSize).toBe(30);
    expect(result.current.virtualItems.map((r) => r.index)).toEqual([0, 1]);

    rerender({ count: 0 });
    expect(result.current.totalSize).toBe(0);
    expect(result.current.virtualItems).toEqual([]);

    rerender({ count: 4 });
    expect(result.current.totalSize).toBe(100);
    const rows = result.current.virtualItems;
    expect(rows.map((r) => r.index)).toEqual([0, 1, 2, 3]);
    expect(rows[3]).toMatchObject({ start: 60, size: 40 });
  });
});

describe('useMeasuredScroll visible range in a scrolled viewport', () => {
  // Rows are 10, 20, ..., 80px tall: tops at 0, 10, 30, 60, 100, 150, 210, 280.
  const estimateRowSize = (index: number) => (index + 1) * 10;

  function ScrolledRows({ overscan = 0 }: { overscan?: number }) {
    const { scrollRef, onScroll, totalSize, virtualItems } = useMeasuredScroll({
      count: 8,
      estimateSize: estimateRowSize,
      overscan,
    });
    return (
      <div ref={scrollRef} onScroll={onScroll} data-testid="viewport">
        <div style={{ height: totalSize }}>
          {virtualItems.map((item) => (
            <div
              key={item.index}
              data-testid="row"
              data-index={item.index}
              data-start={item.start}
              data-size={item.size}
            />
          ))}
        </div>
      </div>
    );
  }

  // happy-dom has no layout, so the scroll offset and viewport height are set on
  // the element before the real scroll event reaches the hook's onScroll handler.
  function scrollViewport(scrollTop: number, clientHeight: number): void {
    const viewport = screen.getByTestId('viewport');
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: scrollTop });
    Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: clientHeight });
    fireEvent.scroll(viewport);
  }

  function renderedRows(): Array<{ index: number; start: number }> {
    return screen.queryAllByTestId('row').map((row) => ({
      index: Number(row.getAttribute('data-index')),
      start: Number(row.getAttribute('data-start')),
    }));
  }

  function renderedGeometry(): Array<{ index: number; start: number; size: number }> {
    return screen.queryAllByTestId('row').map((row) => ({
      index: Number(row.getAttribute('data-index')),
      start: Number(row.getAttribute('data-start')),
      size: Number(row.getAttribute('data-size')),
    }));
  }

  it('stops before a row whose top edge equals the viewport bottom', () => {
    render(<ScrolledRows />);
    // scrollTop 35 sits inside row 2; bottom 35 + 65 = 100 is exactly row 4's top.
    scrollViewport(35, 65);
    expect(renderedRows()).toEqual([
      { index: 2, start: 30 },
      { index: 3, start: 60 },
    ]);

    // One more pixel crosses row 4's top edge, so row 4 becomes visible.
    scrollViewport(35, 66);
    expect(renderedRows().map((row) => row.index)).toEqual([2, 3, 4]);
  });

  it('scans several non-uniform rows to the strict bottom boundary', () => {
    render(<ScrolledRows />);
    // scrollTop 100 is row 4's top; bottom 100 + 180 = 280 is exactly row 7's top.
    scrollViewport(100, 180);
    expect(renderedRows()).toEqual([
      { index: 4, start: 100 },
      { index: 5, start: 150 },
      { index: 6, start: 210 },
    ]);

    scrollViewport(100, 181);
    expect(renderedRows().map((row) => row.index)).toEqual([4, 5, 6, 7]);
  });

  it('emits no row at a fractional index when a fractional overscan is subtracted', () => {
    render(<ScrolledRows overscan={1.5} />);
    // Unscrolled, the start clamps to 0: whole rows 0 and 1 render.
    expect(renderedGeometry()).toEqual([
      { index: 0, start: 0, size: 10 },
      { index: 1, start: 10, size: 20 },
    ]);

    // scrollTop 35 starts in row 2, so the start index is 2 - 1.5 = 0.5 and every
    // candidate index (0.5, 1.5) is fractional: no dataset row, so nothing renders.
    scrollViewport(35, 65);
    expect(renderedGeometry()).toEqual([]);

    // scrollTop 15 starts in row 1, which clamps the start back to 0: whole rows return.
    scrollViewport(15, 20);
    expect(renderedGeometry()).toEqual([
      { index: 0, start: 0, size: 10 },
      { index: 1, start: 10, size: 20 },
      { index: 2, start: 30, size: 30 },
      { index: 3, start: 60, size: 40 },
    ]);
  });
});

describe('useMeasuredScroll scrollToIndex on a mounted scroll element', () => {
  // Rows are 10, 20, ..., 80px tall: tops at 0, 10, 30, 60, 100, 150, 210, 280; total 360.
  const estimateRowSize = (index: number) => (index + 1) * 10;

  type ScrollToIndex = (index: number) => void;
  type ScrollTargetProps = { count: number; onApi: (scrollToIndex: ScrollToIndex) => void };

  function ScrollTarget({ count, onApi }: ScrollTargetProps) {
    const { scrollRef, onScroll, totalSize, scrollToIndex } = useMeasuredScroll({
      count,
      estimateSize: estimateRowSize,
    });
    useEffect(() => {
      onApi(scrollToIndex);
    }, [onApi, scrollToIndex]);
    return (
      <div ref={scrollRef} onScroll={onScroll} data-testid="scroll-target">
        <div style={{ height: totalSize }} />
      </div>
    );
  }

  // happy-dom has no layout; an own writable scrollTop records the hook's assignment
  // exactly, without clamping or a scroll event.
  function mountScrollTarget(count: number) {
    const api: { scrollToIndex: ScrollToIndex } = { scrollToIndex: () => undefined };
    const onApi = (scrollToIndex: ScrollToIndex) => {
      api.scrollToIndex = scrollToIndex;
    };
    const view = render(<ScrollTarget count={count} onApi={onApi} />);
    const viewport = screen.getByTestId('scroll-target');
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, writable: true, value: 0 });
    return {
      api,
      viewport,
      rerender: (next: number) => view.rerender(<ScrollTarget count={next} onApi={onApi} />),
      unmount: view.unmount,
    };
  }

  it('scrolls to the top offset of the requested non-uniform row', () => {
    const { api, viewport } = mountScrollTarget(8);

    // Row 3's top is 60: not row 2's top (30), its own bottom at row 4's top (100), 0 or 360.
    api.scrollToIndex(3);
    expect(viewport.scrollTop).toBe(60);

    // The last row's top is 280, not the total size 360.
    api.scrollToIndex(7);
    expect(viewport.scrollTop).toBe(280);

    api.scrollToIndex(0);
    expect(viewport.scrollTop).toBe(0);

    api.scrollToIndex(1);
    expect(viewport.scrollTop).toBe(10);
  });

  it('clamps out-of-range indices to the first and last rows of the current count', () => {
    const { api, viewport, rerender } = mountScrollTarget(8);

    api.scrollToIndex(3);
    expect(viewport.scrollTop).toBe(60);
    api.scrollToIndex(-5);
    expect(viewport.scrollTop).toBe(0);

    api.scrollToIndex(99);
    expect(viewport.scrollTop).toBe(280);
    api.scrollToIndex(Number.NEGATIVE_INFINITY);
    expect(viewport.scrollTop).toBe(0);
    api.scrollToIndex(Number.POSITIVE_INFINITY);
    expect(viewport.scrollTop).toBe(280);

    // After the dataset shrinks to three rows, the last row is row 2 at 30.
    rerender(3);
    api.scrollToIndex(99);
    expect(viewport.scrollTop).toBe(30);
  });

  it('falls back to offset 0 for a fractional or NaN index', () => {
    const { api, viewport } = mountScrollTarget(8);

    // A fractional index names no dataset row, so it has no offset.
    api.scrollToIndex(3);
    expect(viewport.scrollTop).toBe(60);
    api.scrollToIndex(2.5);
    expect(viewport.scrollTop).toBe(0);

    api.scrollToIndex(3);
    expect(viewport.scrollTop).toBe(60);
    api.scrollToIndex(Number.NaN);
    expect(viewport.scrollTop).toBe(0);
  });

  it('scrolls to 0 for an empty dataset', () => {
    const { api, viewport } = mountScrollTarget(0);

    viewport.scrollTop = 40;
    api.scrollToIndex(0);
    expect(viewport.scrollTop).toBe(0);

    viewport.scrollTop = 40;
    api.scrollToIndex(5);
    expect(viewport.scrollTop).toBe(0);
  });

  it('does nothing without a mounted scroll element', () => {
    const { result } = renderHook(() =>
      useMeasuredScroll({ count: 8, estimateSize: estimateRowSize }),
    );
    expect(() => result.current.scrollToIndex(3)).not.toThrow();

    const { api, viewport, unmount } = mountScrollTarget(8);
    api.scrollToIndex(3);
    expect(viewport.scrollTop).toBe(60);

    // Unmounting detaches the scroll ref, so a retained callback leaves the old element alone.
    unmount();
    api.scrollToIndex(5);
    expect(viewport.scrollTop).toBe(60);
  });
});
