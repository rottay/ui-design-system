import React, { act } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applyStreamCommit,
  useChartStream,
  type ChartStreamOptions,
  type ChartStreamState,
} from '..';

afterEach(cleanup);

interface Handle<T> {
  current: ChartStreamState<T> | null;
}

function Harness<T>({ initial, options, handle }: {
  initial: readonly T[];
  options: ChartStreamOptions<T>;
  handle: Handle<T>;
}): React.ReactElement {
  const stream = useChartStream(initial, options);
  handle.current = stream;
  return <div data-testid="s" data-len={stream.data.length} data-streamed={String(stream.hasStreamed)} />;
}

describe('applyStreamCommit windowing', () => {
  it('appends and replaces', () => {
    expect(applyStreamCommit([1, 2], [3], { mode: 'append', now: 0 })).toEqual([1, 2, 3]);
    expect(applyStreamCommit([1, 2], [3], { mode: 'replace', now: 0 })).toEqual([3]);
  });

  it('bounds by max points, keeping the most recent', () => {
    expect(applyStreamCommit([1, 2, 3], [4, 5], {
      mode: 'append',
      window: { maxPoints: 3 },
      now: 0,
    })).toEqual([3, 4, 5]);
  });

  it('drops items older than max age using the timestamp accessor', () => {
    const items = [{ t: 0 }, { t: 500 }, { t: 900 }];
    expect(applyStreamCommit<{ t: number }>([], items, {
      mode: 'append',
      window: { maxAgeMs: 600 },
      getTimestamp: (item) => item.t,
      now: 1000,
    })).toEqual([{ t: 500 }, { t: 900 }]);
  });

  it('is inert on max age without a timestamp accessor', () => {
    expect(applyStreamCommit([1, 2, 3], [], {
      mode: 'append',
      window: { maxAgeMs: 10 },
      now: 1000,
    })).toEqual([1, 2, 3]);
  });
});

describe('useChartStream initial windowing', () => {
  it('windows the initial data on mount', () => {
    const handle: Handle<number> = { current: null };
    render(<Harness initial={[1, 2, 3, 4]} options={{ mode: 'append', window: { maxPoints: 2 } }} handle={handle} />);
    expect(handle.current?.data).toEqual([3, 4]);
    expect(handle.current?.hasStreamed).toBe(false);
  });
});

describe('useChartStream coalesced commits on a timer', () => {
  it('collapses a burst of pushes into a single commit', () => {
    vi.useFakeTimers();
    try {
      const handle: Handle<number> = { current: null };
      render(<Harness initial={[1]} options={{ mode: 'append', coalesceMs: 50 }} handle={handle} />);
      act(() => {
        handle.current?.push(2);
        handle.current?.push([3, 4]);
      });
      // Buffered, not yet committed.
      expect(handle.current?.data).toEqual([1]);
      expect(handle.current?.hasStreamed).toBe(false);
      act(() => { vi.advanceTimersByTime(50); });
      expect(handle.current?.data).toEqual([1, 2, 3, 4]);
      expect(handle.current?.hasStreamed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('applies the window at commit time', () => {
    vi.useFakeTimers();
    try {
      const handle: Handle<number> = { current: null };
      render(<Harness initial={[1]} options={{ mode: 'append', coalesceMs: 10, window: { maxPoints: 2 } }} handle={handle} />);
      act(() => { handle.current?.push([2, 3]); });
      act(() => { vi.advanceTimersByTime(10); });
      expect(handle.current?.data).toEqual([2, 3]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reset replaces immediately and cancels the pending commit', () => {
    vi.useFakeTimers();
    try {
      const handle: Handle<number> = { current: null };
      render(<Harness initial={[1]} options={{ mode: 'append', coalesceMs: 50 }} handle={handle} />);
      act(() => { handle.current?.push(9); });
      act(() => { handle.current?.reset([7, 8]); });
      expect(handle.current?.data).toEqual([7, 8]);
      act(() => { vi.advanceTimersByTime(100); });
      // The pending 9 was cancelled by reset.
      expect(handle.current?.data).toEqual([7, 8]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('throttles announcements to the configured interval', () => {
    vi.useFakeTimers();
    try {
      let clock = 0;
      const handle: Handle<number> = { current: null };
      const options: ChartStreamOptions<number> = {
        mode: 'append',
        coalesceMs: 1,
        announce: (data) => `count ${data.length}`,
        announceThrottleMs: 1000,
        now: () => clock,
      };
      render(<Harness initial={[]} options={options} handle={handle} />);

      clock = 0;
      act(() => { handle.current?.push(1); });
      act(() => { vi.advanceTimersByTime(1); });
      expect(handle.current?.announcement).toBe('count 1');

      clock = 500;
      act(() => { handle.current?.push(2); });
      act(() => { vi.advanceTimersByTime(1); });
      // Within the throttle window: announcement is unchanged though data grew.
      expect(handle.current?.announcement).toBe('count 1');
      expect(handle.current?.data.length).toBe(2);

      clock = 1500;
      act(() => { handle.current?.push(3); });
      act(() => { vi.advanceTimersByTime(1); });
      expect(handle.current?.announcement).toBe('count 3');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('useChartStream frame coalescing and loop safety', () => {
  it('commits on an animation frame and schedules no ambient loop', async () => {
    const raf = vi.spyOn(globalThis, 'requestAnimationFrame');
    raf.mockClear();
    const handle: Handle<number> = { current: null };
    render(<Harness initial={[1]} options={{ mode: 'append' }} handle={handle} />);
    const before = raf.mock.calls.length;
    act(() => { handle.current?.push(2); });
    // One frame scheduled for the burst.
    expect(raf.mock.calls.length).toBe(before + 1);
    await act(async () => {
      await new Promise<void>((resolve) => { requestAnimationFrame(() => resolve()); });
    });
    expect(handle.current?.data).toEqual([1, 2]);
    // No further frame is scheduled once the buffer drains: no continuous loop.
    expect(raf.mock.calls.length).toBe(before + 2);
    raf.mockRestore();
  });
});
