/**
 * useDeferredPending Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeferredPending } from '../deferred-pending';

describe('useDeferredPending', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('Initial State', () => {
    it('shows neither indicator when not pending', () => {
      const { result } = renderHook(({ p }) => useDeferredPending(p), {
        initialProps: { p: false },
      });

      expect(result.current.showSpinner).toBe(false);
      expect(result.current.showSkeleton).toBe(false);
    });

    it('shows nothing immediately when pending starts', () => {
      const { result } = renderHook(({ p }) => useDeferredPending(p), {
        initialProps: { p: true },
      });

      expect(result.current.showSpinner).toBe(false);
      expect(result.current.showSkeleton).toBe(false);
    });
  });

  describe('Threshold Gating', () => {
    it('shows no spinner before the spinner delay', () => {
      const { result } = renderHook(({ p }) => useDeferredPending(p), {
        initialProps: { p: true },
      });

      act(() => {
        vi.advanceTimersByTime(149);
      });

      expect(result.current.showSpinner).toBe(false);
      expect(result.current.showSkeleton).toBe(false);
    });

    it('shows a spinner once the spinner delay elapses', () => {
      const { result } = renderHook(({ p }) => useDeferredPending(p), {
        initialProps: { p: true },
      });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.showSpinner).toBe(true);
      expect(result.current.showSkeleton).toBe(false);
    });

    it('shows a skeleton (not a spinner) once the longer threshold elapses', () => {
      const { result } = renderHook(({ p }) => useDeferredPending(p), {
        initialProps: { p: true },
      });

      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(result.current.showSpinner).toBe(true);

      act(() => {
        vi.advanceTimersByTime(350); // total 500ms
      });

      expect(result.current.showSkeleton).toBe(true);
      expect(result.current.showSpinner).toBe(false);
    });

    it('honors custom thresholds', () => {
      const { result } = renderHook(
        ({ p }) => useDeferredPending(p, { spinnerDelay: 50, skeletonAfter: 100 }),
        { initialProps: { p: true } },
      );

      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(result.current.showSpinner).toBe(true);

      act(() => {
        vi.advanceTimersByTime(50); // total 100ms
      });
      expect(result.current.showSkeleton).toBe(true);
    });
  });

  describe('Resetting', () => {
    it('clears both indicators when pending ends', () => {
      const { result, rerender } = renderHook(({ p }) => useDeferredPending(p), {
        initialProps: { p: true },
      });

      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(result.current.showSkeleton).toBe(true);

      act(() => {
        rerender({ p: false });
      });

      expect(result.current.showSpinner).toBe(false);
      expect(result.current.showSkeleton).toBe(false);
    });

    it('does not escalate after pending ends before the delay', () => {
      const { result, rerender } = renderHook(({ p }) => useDeferredPending(p), {
        initialProps: { p: true },
      });

      act(() => {
        vi.advanceTimersByTime(100);
        rerender({ p: false });
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.showSpinner).toBe(false);
      expect(result.current.showSkeleton).toBe(false);
    });
  });

  describe('Reduced Motion', () => {
    it('suppresses the skeleton escalation but keeps the spinner delay', () => {
      // Stub matchMedia so the reduced-motion query matches. useMediaQuery reads
      // window.matchMedia; the spinner delay must still gate the sub-150ms flash.
      vi.stubGlobal(
        'matchMedia',
        (query: string) => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }),
      );

      const { result } = renderHook(({ p }) => useDeferredPending(p), {
        initialProps: { p: true },
      });

      act(() => {
        vi.advanceTimersByTime(149);
      });
      expect(result.current.showSpinner).toBe(false);

      act(() => {
        vi.advanceTimersByTime(1); // 150ms — spinner is allowed
      });
      expect(result.current.showSpinner).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1000); // well past skeletonAfter
      });
      expect(result.current.showSkeleton).toBe(false);
      expect(result.current.showSpinner).toBe(true);
    });
  });
});
