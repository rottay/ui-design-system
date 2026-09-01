// The placeholder reserves the BLOCK axis only (an inline freeze is self-referential),
// bottom mode re-expresses the container edge, and both boxes are observed directly.
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import ModernAffix from '../engines/modern';

function rect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    top: 0,
    bottom: 48,
    left: 16,
    right: 216,
    width: 200,
    height: 48,
    x: 16,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect;
}

/** Rects served per anatomy part so the placeholder and the bar can differ. */
let rects: Record<string, DOMRect>;
/** Every live ResizeObserver instance, so a test can drive an observation. */
let observers: Array<{ callback: ResizeObserverCallback; targets: Element[] }>;

beforeEach(() => {
  rects = {
    placeholder: rect({ top: 4, bottom: 52 }),
    root: rect({ top: 4, bottom: 52 }),
    container: rect({ top: 0, bottom: 500, height: 500 }),
  };
  observers = [];

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (callback: FrameRequestCallback) => {
      callback(1000);
      return 1;
    }
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function getRect(this: HTMLElement) {
      return rects[this.dataset.part ?? 'root'] ?? rects.root;
    }
  );

  class TrackedResizeObserver {
    private readonly entry: { callback: ResizeObserverCallback; targets: Element[] };
    constructor(callback: ResizeObserverCallback) {
      this.entry = { callback, targets: [] };
      observers.push(this.entry);
    }
    observe = (element: Element) => {
      this.entry.targets.push(element);
    };
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal('ResizeObserver', TrackedResizeObserver);

  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Affix modern reservation and container edge', () => {
  it('reserves the vacated flow on the BLOCK axis only, never freezing the inline size', async () => {
    // Already past the pin line, so the first measurement affixes.
    rects.placeholder = rect({ top: 0, bottom: 48 });
    rects.root = rect({ top: 0, bottom: 48 });

    render(
      <ModernAffix offsetTop={0} onChange={vi.fn()}>
        <span>Header</span>
      </ModernAffix>
    );

    const bar = (await screen.findByText('Header')).parentElement as HTMLDivElement;
    const placeholder = bar.parentElement as HTMLDivElement;

    await waitFor(() => expect(bar.style.position).toBe('fixed'));

    // The reservation exists on the block axis...
    expect(placeholder.dataset.part).toBe('placeholder');
    expect(placeholder.style.blockSize).toBe('48px');
    // ...and the inline axis is left to the flow. A frozen inline size is what
    // made the next measurement read its own output back.
    expect(placeholder.style.width).toBe('');
    expect(placeholder.style.inlineSize).toBe('');
  });

  it('re-expresses the bottom edge in viewport coordinates for an element scroll container', async () => {
    const container = document.createElement('div');
    container.dataset.part = 'container';
    document.body.appendChild(container);

    // The bar sits at the container's bottom edge, so bottom mode affixes.
    rects.placeholder = rect({ top: 460, bottom: 500, height: 40 });
    rects.root = rect({ top: 460, bottom: 500, height: 40 });

    render(
      <ModernAffix offsetBottom={10} target={() => container} onChange={vi.fn()}>
        <span>Actions</span>
      </ModernAffix>
    );

    const bar = (await screen.findByText('Actions')).parentElement as HTMLDivElement;
    await waitFor(() => expect(bar.style.position).toBe('fixed'));

    // The container's bottom is 400px above the viewport bottom (900 - 500),
    // so a 10px inset from the CONTAINER is 410px from the viewport.
    expect(bar.style.bottom).toBe('410px');

    container.remove();
  });

  it('keeps pinning to the window bottom when the scroll source IS the window', async () => {
    rects.placeholder = rect({ top: 860, bottom: 900, height: 40 });
    rects.root = rect({ top: 860, bottom: 900, height: 40 });

    render(
      <ModernAffix offsetBottom={10} onChange={vi.fn()}>
        <span>Window actions</span>
      </ModernAffix>
    );

    const bar = (await screen.findByText('Window actions'))
      .parentElement as HTMLDivElement;
    await waitFor(() => expect(bar.style.position).toBe('fixed'));

    expect(bar.style.bottom).toBe('10px');
  });

  it('re-measures when the observed column resizes without a window resize', async () => {
    const onChange = vi.fn();
    // Starts un-affixed: the bar's top is below the pin line.
    rects.placeholder = rect({ top: 120, bottom: 168 });
    rects.root = rect({ top: 120, bottom: 168 });

    render(
      <ModernAffix offsetTop={0} onChange={onChange}>
        <span>Column header</span>
      </ModernAffix>
    );

    const bar = (await screen.findByText('Column header'))
      .parentElement as HTMLDivElement;
    const placeholder = bar.parentElement as HTMLDivElement;

    // Un-affixed on mount: the bar's top is still below the pin line.
    expect(bar.style.position).toBe('');
    expect(onChange).not.toHaveBeenCalledWith(true);

    // Both measured boxes are observed: the placeholder carries the column's
    // inline size, the bar carries the block size that becomes the reservation.
    const observed = observers.flatMap((entry) => entry.targets);
    expect(observed).toContain(placeholder);
    expect(observed).toContain(bar);

    // A reflow above the bar moves it to the pin line. No scroll, no window
    // resize — only the observed boxes change.
    rects.placeholder = rect({ top: 0, bottom: 48 });
    rects.root = rect({ top: 0, bottom: 48 });
    for (const entry of observers) {
      entry.callback([], {} as ResizeObserver);
    }

    await waitFor(() => expect(bar.style.position).toBe('fixed'));
    expect(onChange).toHaveBeenLastCalledWith(true);
  });
});
