import { renderHook } from '@testing-library/react';
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
});
