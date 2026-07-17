import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { recordTransitionName, startDsViewTransition, useViewTransition } from '..';
import { useReducedMotion } from '../../foundation/reduced-motion';
import { mockMatchMedia } from '@/tooling/testing/helpers/browser/match-media';

/** `document` widened so tests can install/remove the optional API method. */
type MutableViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => unknown;
};

const viewTransitionDocument = document as MutableViewTransitionDocument;

/** A stub native transition whose `startViewTransition` runs `update` synchronously. */
function installNativeStartViewTransition(): ReturnType<typeof vi.fn> {
  const startViewTransition = vi.fn((cb: () => void | Promise<void>) => {
    cb();
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    };
  });
  viewTransitionDocument.startViewTransition = startViewTransition;
  return startViewTransition;
}

afterEach(() => {
  // happy-dom has no native startViewTransition; keep each case isolated by
  // removing any stub the previous case installed.
  delete viewTransitionDocument.startViewTransition;
  vi.restoreAllMocks();
});

describe('startDsViewTransition', () => {
  it('runs the update immediately and does not throw when startViewTransition is absent', async () => {
    expect(viewTransitionDocument.startViewTransition).toBeUndefined();

    const update = vi.fn();

    // The immediate path must be synchronous and non-throwing.
    let handle!: ReturnType<typeof startDsViewTransition>;
    expect(() => {
      handle = startDsViewTransition(update);
    }).not.toThrow();

    expect(update).toHaveBeenCalledTimes(1);
    await expect(handle.finished).resolves.toBeUndefined();
    await expect(handle.ready).resolves.toBeUndefined();
    await expect(handle.updateCallbackDone).resolves.toBeUndefined();
    // skipTransition is a no-op on the immediate path.
    expect(() => handle.skipTransition()).not.toThrow();
  });

  it('delegates to document.startViewTransition when it is present', async () => {
    const update = vi.fn();
    const nativeSkip = vi.fn();
    const nativeTransition = {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: nativeSkip,
    };
    const startViewTransition = vi.fn((cb: () => void | Promise<void>) => {
      cb();
      return nativeTransition;
    });
    viewTransitionDocument.startViewTransition = startViewTransition;

    const handle = startDsViewTransition(update);

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);

    handle.skipTransition();
    expect(nativeSkip).toHaveBeenCalledTimes(1);
    await expect(handle.finished).resolves.toBeUndefined();
  });

  it('takes the immediate path when the environment prefers reduced motion, even though startViewTransition is available', async () => {
    mockMatchMedia(1024, true);
    const startViewTransition = installNativeStartViewTransition();
    const update = vi.fn();

    const handle = startDsViewTransition(update);

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    await expect(handle.finished).resolves.toBeUndefined();
  });
});

describe('useViewTransition', () => {
  it('forces the immediate path once the reduced-motion preference resolves true', async () => {
    mockMatchMedia(1024, true);
    const startViewTransition = installNativeStartViewTransition();

    // Render both hooks together so the reduced-motion preference (an
    // observable value) can be awaited before invoking the transition
    // runner, instead of polling the side-effecting runner itself.
    const { result } = renderHook(() => ({
      prefersReducedMotion: useReducedMotion(),
      runTransition: useViewTransition(),
    }));

    await waitFor(() => expect(result.current.prefersReducedMotion).toBe(true));

    const update = vi.fn();
    act(() => {
      result.current.runTransition(update);
    });

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('delegates to the native transition once the reduced-motion preference resolves false', async () => {
    mockMatchMedia(1024, false);
    const startViewTransition = installNativeStartViewTransition();

    const { result } = renderHook(() => ({
      prefersReducedMotion: useReducedMotion(),
      runTransition: useViewTransition(),
    }));

    await waitFor(() => expect(result.current.prefersReducedMotion).toBe(false));

    const update = vi.fn();
    act(() => {
      result.current.runTransition(update);
    });

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('honors an explicit skipTransition override even when motion is not reduced', async () => {
    mockMatchMedia(1024, false);
    const startViewTransition = installNativeStartViewTransition();

    const { result } = renderHook(() => ({
      prefersReducedMotion: useReducedMotion(),
      runTransition: useViewTransition(),
    }));

    await waitFor(() => expect(result.current.prefersReducedMotion).toBe(false));

    const update = vi.fn();
    act(() => {
      result.current.runTransition(update, { skipTransition: true });
    });

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
  });
});

describe('recordTransitionName', () => {
  it('prefixes a simple key with the DS record-transition namespace', () => {
    expect(recordTransitionName('42')).toBe('ds-vt-record-42');
    expect(recordTransitionName('candidate-9f2a')).toBe('ds-vt-record-candidate-9f2a');
  });

  it('produces different names for different keys', () => {
    expect(recordTransitionName('1')).not.toBe(recordTransitionName('2'));
  });

  it('sanitizes characters that are not valid in a CSS custom-ident', () => {
    expect(recordTransitionName('a b/c.d:e')).toBe('ds-vt-record-a-b-c-d-e');
  });
});
