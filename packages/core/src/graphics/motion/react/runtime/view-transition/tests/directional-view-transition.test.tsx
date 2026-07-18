import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  MODAL_PROMOTE_TRANSITION_NAME,
  RECORD_MORPH_TRANSITION_CLASS,
  TAB_PANEL_TRANSITION_CLASS,
  VIEW_TRANSITION_DIRECTION_ATTRIBUTE,
  directionFromIndexDelta,
  recordMorphStyle,
  startDirectionalViewTransition,
  tabPanelTransitionName,
  tabPanelTransitionStyle,
  useDirectionalViewTransition,
} from '..';
import { useReducedMotion } from '../../foundation/reduced-motion';
import { mockMatchMedia } from '@/tooling/testing/helpers/browser/match-media';

/** `document` widened so tests can install/remove the optional API method. */
// Omit the DOM lib's own non-optional declaration so the stub can be assigned
// AND deleted; an intersection would keep the lib signature and forbid both.
type MutableViewTransitionDocument = Omit<Document, 'startViewTransition'> & {
  startViewTransition?: (update: () => void | Promise<void>) => unknown;
};

const viewTransitionDocument = document as unknown as MutableViewTransitionDocument;

function directionAttribute(): string | null {
  return document.documentElement.getAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE);
}

/**
 * Stub native transition capturing the direction attribute AT UPDATE TIME --
 * the moment the CSS directional rules would resolve against the old
 * snapshot -- and exposing a controllable `finished` promise.
 */
function installNativeStartViewTransition(finished: Promise<void> = Promise.resolve()): {
  start: ReturnType<typeof vi.fn>;
  directionsSeen: (string | null)[];
} {
  const directionsSeen: (string | null)[] = [];
  const start = vi.fn((cb: () => void | Promise<void>) => {
    directionsSeen.push(directionAttribute());
    cb();
    return {
      finished,
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    };
  });
  viewTransitionDocument.startViewTransition = start;
  return { start, directionsSeen };
}

/** Flushes the cleanup scheduled on `handle.finished`. */
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  delete viewTransitionDocument.startViewTransition;
  document.documentElement.removeAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE);
  vi.restoreAllMocks();
});

describe('directionFromIndexDelta', () => {
  it('maps a positive delta to forward and a negative delta to backward', () => {
    expect(directionFromIndexDelta(0, 1)).toBe('forward');
    expect(directionFromIndexDelta(0, 5)).toBe('forward');
    expect(directionFromIndexDelta(3, 1)).toBe('backward');
  });

  it('resolves degenerate inputs to none (missing index, zero delta)', () => {
    expect(directionFromIndexDelta(1, 1)).toBe('none');
    expect(directionFromIndexDelta(-1, 2)).toBe('none');
    expect(directionFromIndexDelta(2, -1)).toBe('none');
  });
});

describe('panel and record style vocabulary', () => {
  it('derives a sanitized per-scope panel name with the shared panel class', () => {
    expect(tabPanelTransitionName('r1')).toBe('ds-vt-tab-panel-r1');
    expect(tabPanelTransitionName('a:b c')).toBe('ds-vt-tab-panel-a-b-c');

    const style = tabPanelTransitionStyle('r1') as Record<string, string>;
    expect(style.viewTransitionName).toBe('ds-vt-tab-panel-r1');
    expect(style.viewTransitionClass).toBe(TAB_PANEL_TRANSITION_CLASS);
  });

  it('derives the record morph style on the ds-vt-record-<key> convention', () => {
    const style = recordMorphStyle('42') as Record<string, string>;
    expect(style.viewTransitionName).toBe('ds-vt-record-42');
    expect(style.viewTransitionClass).toBe(RECORD_MORPH_TRANSITION_CLASS);
  });

  it('keeps the fixed modal promote name on the ds-vt namespace', () => {
    expect(MODAL_PROMOTE_TRANSITION_NAME).toBe('ds-vt-modal-promote');
  });
});

describe('startDirectionalViewTransition', () => {
  it('runs the update immediately and never stamps the attribute when the API is absent', async () => {
    expect(viewTransitionDocument.startViewTransition).toBeUndefined();
    const update = vi.fn();

    const handle = startDirectionalViewTransition(update, { direction: 'forward' });

    expect(update).toHaveBeenCalledTimes(1);
    expect(directionAttribute()).toBeNull();
    await expect(handle.finished).resolves.toBeUndefined();
    expect(directionAttribute()).toBeNull();
  });

  it('stamps the direction on <html> for the transition lifetime, then removes it', async () => {
    const { start, directionsSeen } = installNativeStartViewTransition();
    const update = vi.fn();

    const handle = startDirectionalViewTransition(update, { direction: 'forward' });

    expect(start).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    // The attribute must be present when the browser resolves the pseudo-element styles.
    expect(directionsSeen).toEqual(['forward']);

    await handle.finished;
    await flushMicrotasks();
    expect(directionAttribute()).toBeNull();
  });

  it('stamps backward for a backward direction', async () => {
    const { directionsSeen } = installNativeStartViewTransition();

    const handle = startDirectionalViewTransition(vi.fn(), { direction: 'backward' });
    expect(directionsSeen).toEqual(['backward']);
    await handle.finished;
    await flushMicrotasks();
    expect(directionAttribute()).toBeNull();
  });

  it('delegates without an attribute for direction none', async () => {
    const { start, directionsSeen } = installNativeStartViewTransition();

    const handle = startDirectionalViewTransition(vi.fn(), { direction: 'none' });

    expect(start).toHaveBeenCalledTimes(1);
    expect(directionsSeen).toEqual([null]);
    await handle.finished;
    expect(directionAttribute()).toBeNull();
  });

  it('takes the immediate path (no attribute, no native call) under reduced motion', async () => {
    mockMatchMedia(1024, true);
    const { start } = installNativeStartViewTransition();
    const update = vi.fn();

    const handle = startDirectionalViewTransition(update, { direction: 'forward' });

    expect(start).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    expect(directionAttribute()).toBeNull();
    await expect(handle.finished).resolves.toBeUndefined();
  });

  it('honors an explicit skipTransition override', async () => {
    const { start } = installNativeStartViewTransition();
    const update = vi.fn();

    startDirectionalViewTransition(update, { direction: 'forward', skipTransition: true });

    expect(start).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    expect(directionAttribute()).toBeNull();
  });

  it('lets a superseding transition keep its direction when the first one settles later', async () => {
    let resolveFirst!: () => void;
    const firstFinished = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });
    installNativeStartViewTransition(firstFinished);

    startDirectionalViewTransition(vi.fn(), { direction: 'forward' });

    // Second transition supersedes the first before it settles, and is still
    // running when the first one's cleanup fires.
    let resolveSecond!: () => void;
    const secondFinished = new Promise<void>((resolve) => {
      resolveSecond = resolve;
    });
    installNativeStartViewTransition(secondFinished);
    const second = startDirectionalViewTransition(vi.fn(), { direction: 'backward' });

    resolveFirst();
    await flushMicrotasks();
    // The stale first cleanup must not strip the newer stamp.
    expect(directionAttribute()).toBe('backward');

    resolveSecond();
    await second.finished;
    await flushMicrotasks();
    expect(directionAttribute()).toBeNull();
  });
});

describe('useDirectionalViewTransition', () => {
  it('forces the immediate path once the reduced-motion preference resolves true', async () => {
    mockMatchMedia(1024, true);
    const { start } = installNativeStartViewTransition();

    const { result } = renderHook(() => ({
      prefersReducedMotion: useReducedMotion(),
      runTransition: useDirectionalViewTransition(),
    }));

    await waitFor(() => expect(result.current.prefersReducedMotion).toBe(true));

    const update = vi.fn();
    act(() => {
      result.current.runTransition(update, { direction: 'forward' });
    });

    expect(start).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    expect(directionAttribute()).toBeNull();
  });

  it('delegates to the native transition with the direction stamped once motion is allowed', async () => {
    mockMatchMedia(1024, false);
    const { start, directionsSeen } = installNativeStartViewTransition();

    const { result } = renderHook(() => ({
      prefersReducedMotion: useReducedMotion(),
      runTransition: useDirectionalViewTransition(),
    }));

    await waitFor(() => expect(result.current.prefersReducedMotion).toBe(false));

    const update = vi.fn();
    act(() => {
      result.current.runTransition(update, { direction: 'forward' });
    });

    expect(start).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(directionsSeen).toEqual(['forward']);
  });
});
