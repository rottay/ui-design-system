'use client';

/**
 * Live-update adapter for chart data. Buffers incoming points and commits them
 * on a coalesced schedule (one animation frame, or a `coalesceMs` timer) so a
 * burst of pushes causes a single render. A sliding window bounds the retained
 * data by count and/or age.
 *
 * A stream commit is a data change, not ambient motion: it schedules a frame
 * only while a push is pending and cancels it after the commit, so no continuous
 * loop runs and reduced-motion needs no branch here. Entrance animation is a
 * mount concern owned by the family; `hasStreamed` lets it suppress mount
 * animation once the first live commit has landed.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ChartStreamWindow {
  /** Retain at most this many of the most recent items. */
  readonly maxPoints?: number;
  /** Drop items older than this many milliseconds. Requires `getTimestamp`. */
  readonly maxAgeMs?: number;
}

export interface ChartStreamOptions<T> {
  /** `append` concatenates pushes; `replace` swaps the buffer for the latest push. */
  readonly mode: 'append' | 'replace';
  readonly window?: ChartStreamWindow;
  /**
   * Debounce window for commits. When omitted, commits coalesce on the next
   * animation frame; when set, they coalesce on a `coalesceMs` timer.
   */
  readonly coalesceMs?: number;
  /** Item timestamp accessor. Required for `window.maxAgeMs`; otherwise unused. */
  readonly getTimestamp?: (item: T) => number;
  /** Optional polite announcement text derived from the committed data. */
  readonly announce?: (data: readonly T[]) => string;
  /** Minimum interval between announcement recomputations. Defaults to 2000ms. */
  readonly announceThrottleMs?: number;
  /** Clock seam for windowing and announcement throttling. Defaults to `Date.now`. */
  readonly now?: () => number;
}

export interface ChartStreamState<T> {
  /** The committed, windowed data the chart renders. */
  readonly data: readonly T[];
  /** Buffer new items; the commit is coalesced. */
  readonly push: (items: T | readonly T[]) => void;
  /** Replace the buffer immediately, cancelling any pending commit. */
  readonly reset: (items: readonly T[]) => void;
  /** True once at least one push has committed. */
  readonly hasStreamed: boolean;
  /** Throttled polite announcement text ('' until the first announce). */
  readonly announcement: string;
}

const DEFAULT_ANNOUNCE_THROTTLE_MS = 2000;

function toArray<T>(items: T | readonly T[]): readonly T[] {
  return Array.isArray(items) ? items : [items as T];
}

/**
 * Pure windowing applied at every commit. `append` concatenates the incoming
 * items onto the current data; `replace` discards the current data. The result
 * is then bounded by age (when a timestamp accessor is supplied) and by count.
 */
export function applyStreamCommit<T>(
  current: readonly T[],
  incoming: readonly T[],
  options: {
    readonly mode: 'append' | 'replace';
    readonly window?: ChartStreamWindow;
    readonly getTimestamp?: (item: T) => number;
    readonly now: number;
  },
): readonly T[] {
  const merged = options.mode === 'append' ? [...current, ...incoming] : [...incoming];
  const window = options.window;
  if (!window) return merged;

  let next = merged;
  if (window.maxAgeMs !== undefined && options.getTimestamp) {
    const accessor = options.getTimestamp;
    const cutoff = options.now - window.maxAgeMs;
    next = next.filter((item) => {
      const timestamp = accessor(item);
      return !Number.isFinite(timestamp) || timestamp >= cutoff;
    });
  }
  if (window.maxPoints !== undefined && next.length > window.maxPoints) {
    next = next.slice(next.length - Math.max(0, window.maxPoints));
  }
  return next;
}

/**
 * Coalesced live-data hook. See the module header for the scheduling and
 * reduced-motion contract.
 */
export function useChartStream<T>(
  initial: readonly T[],
  options: ChartStreamOptions<T>,
): ChartStreamState<T> {
  const now = options.now ?? Date.now;
  const [data, setData] = useState<readonly T[]>(() => applyStreamCommit([], initial, {
    mode: 'replace',
    window: options.window,
    getTimestamp: options.getTimestamp,
    now: now(),
  }));
  const [hasStreamed, setHasStreamed] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const dataRef = useRef<readonly T[]>(data);
  dataRef.current = data;
  const pendingRef = useRef<T[]>([]);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnnounceRef = useRef<number>(Number.NEGATIVE_INFINITY);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const cancelSchedule = useCallback(() => {
    if (frameRef.current !== null) {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    frameRef.current = null;
    timerRef.current = null;
    const pending = pendingRef.current;
    if (pending.length === 0) return;
    pendingRef.current = [];

    const current = optionsRef.current;
    const clock = current.now ?? Date.now;
    const nextData = applyStreamCommit(dataRef.current, pending, {
      mode: current.mode,
      window: current.window,
      getTimestamp: current.getTimestamp,
      now: clock(),
    });
    dataRef.current = nextData;
    setData(nextData);
    setHasStreamed(true);

    if (current.announce) {
      const throttle = current.announceThrottleMs ?? DEFAULT_ANNOUNCE_THROTTLE_MS;
      const stamp = clock();
      if (stamp - lastAnnounceRef.current >= throttle) {
        lastAnnounceRef.current = stamp;
        setAnnouncement(current.announce(nextData));
      }
    }
  }, []);

  const schedule = useCallback(() => {
    if (frameRef.current !== null || timerRef.current !== null) return;
    const coalesceMs = optionsRef.current.coalesceMs;
    if (coalesceMs === undefined && typeof requestAnimationFrame === 'function') {
      frameRef.current = requestAnimationFrame(() => flush());
    } else {
      timerRef.current = setTimeout(() => flush(), Math.max(0, coalesceMs ?? 0));
    }
  }, [flush]);

  const push = useCallback((items: T | readonly T[]) => {
    const incoming = toArray(items);
    if (incoming.length === 0) return;
    pendingRef.current = [...pendingRef.current, ...incoming];
    schedule();
  }, [schedule]);

  const reset = useCallback((items: readonly T[]) => {
    cancelSchedule();
    pendingRef.current = [];
    const current = optionsRef.current;
    const clock = current.now ?? Date.now;
    const nextData = applyStreamCommit([], items, {
      mode: 'replace',
      window: current.window,
      getTimestamp: current.getTimestamp,
      now: clock(),
    });
    dataRef.current = nextData;
    setData(nextData);
  }, [cancelSchedule]);

  useEffect(() => cancelSchedule, [cancelSchedule]);

  return useMemo(
    () => ({ data, push, reset, hasStreamed, announcement }),
    [data, push, reset, hasStreamed, announcement],
  );
}
