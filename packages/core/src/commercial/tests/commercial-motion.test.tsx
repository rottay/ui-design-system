import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useReveal } from '../_internal/motion';

type ChangeListener = (event: MediaQueryListEvent) => void;

function createReducedMotionController(initial: boolean) {
  let matches = initial;
  const listeners = new Set<ChangeListener>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn((_type: string, listener: ChangeListener) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: ChangeListener) => listeners.delete(listener)),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  return {
    matchMedia: vi.fn(() => mediaQuery),
    emit(next: boolean) {
      matches = next;
      const event = { matches: next, media: mediaQuery.media } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function RevealProbe(): React.ReactElement {
  const { ref, revealed, animate } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-testid="reveal"
      data-visible={revealed ? 'true' : 'false'}
    >
      {`${revealed}:${animate}:final content`}
    </div>
  );
}

let originalMatchMedia: typeof window.matchMedia;
let originalIntersectionObserver: typeof window.IntersectionObserver;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  originalIntersectionObserver = window.IntersectionObserver;
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  window.IntersectionObserver = originalIntersectionObserver;
  vi.restoreAllMocks();
});

describe('commercial motion authority', () => {
  it('keeps SSR/hydrated content static when a non-reduced preference resolves later', async () => {
    const controller = createReducedMotionController(false);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;
    const intersectionObserver = vi.fn();
    window.IntersectionObserver = intersectionObserver as unknown as typeof IntersectionObserver;

    const html = renderToString(<RevealProbe />);
    expect(html).toContain('data-visible="true"');
    expect(html).toContain('true:false:final content');

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(container, <RevealProbe />);
    });

    expect(container.textContent).toBe('true:false:final content');
    expect(intersectionObserver).not.toHaveBeenCalled();
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).toLowerCase().includes('hydration')),
    ).toBe(false);

    await act(async () => root?.unmount());
    container.remove();
  });

  it('waits for intersection on a client mount and never restarts after a live reduced flip', () => {
    const controller = createReducedMotionController(false);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;
    let observerCallback: IntersectionObserverCallback | undefined;
    const disconnect = vi.fn();
    window.IntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback;
      return {
        disconnect,
        observe: vi.fn(),
        unobserve: vi.fn(),
        takeRecords: vi.fn(() => []),
        root: null,
        rootMargin: '0px',
        thresholds: [0.35],
      } as IntersectionObserver;
    }) as unknown as typeof IntersectionObserver;

    render(<RevealProbe />);
    expect(screen.getByTestId('reveal')).toHaveTextContent('false:false');

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByTestId('reveal')).toHaveTextContent('true:true');

    act(() => controller.emit(true));
    expect(screen.getByTestId('reveal')).toHaveTextContent('true:false');

    act(() => controller.emit(false));
    expect(screen.getByTestId('reveal')).toHaveTextContent('true:false');
  });
});
