/**
 * MOT-04: useStreamingText.startTyping must not run a per-character rAF
 * typewriter under reduced motion -- it delivers the final text immediately
 * (final-first, matching the CountUp law).
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { MotionProvider } from '@/infrastructure/runtime/motion';

import { useStreamingText } from '../index';

function reducedWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
  return <MotionProvider reducedMotion>{children}</MotionProvider>;
}

describe('useStreamingText under reduced motion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('startTyping sets the full text immediately with no animation frame', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
    const onComplete = vi.fn();
    const { result } = renderHook(() => useStreamingText({ onComplete }), {
      wrapper: reducedWrapper,
    });

    act(() => {
      result.current.startTyping('Full response text');
    });

    expect(result.current.text).toBe('Full response text');
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.isComplete).toBe(true);
    expect(onComplete).toHaveBeenCalledWith('Full response text');
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('startTyping still animates per-frame when motion is not reduced', async () => {
    const { result } = renderHook(() => useStreamingText({ typingSpeed: 1 }), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MotionProvider>{children}</MotionProvider>
      ),
    });

    act(() => {
      result.current.startTyping('abc');
    });

    // The first frame has not fired synchronously: text is still empty.
    expect(result.current.text).toBe('');
    expect(result.current.isStreaming).toBe(true);

    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    });

    expect(result.current.text.length).toBeGreaterThan(0);
  });
});
