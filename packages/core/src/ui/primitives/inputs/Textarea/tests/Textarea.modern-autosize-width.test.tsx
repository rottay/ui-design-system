/**
 * autoSize measured only on value change, and the ResizeObserver that would
 * catch a width change was registered ONLY when `onResize` was supplied. With
 * `<Textarea autoSize />` alone the measured block-size therefore froze at the
 * first width forever, clipping the rewrapped text under `overflow-y: hidden`.
 *
 * The environment's shared ResizeObserver polyfill is an inert no-op, so this
 * suite substitutes a capturing stub and drives the callback by hand.
 */
import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernTextarea from '../engines/modern';

type Captured = { target: Element; cb: ResizeObserverCallback };

let observed: Captured[] = [];
let scrollHeightValue = 60;
let offsetWidthValue = 1200;
let originalScrollHeight: PropertyDescriptor | undefined;
let originalOffsetWidth: PropertyDescriptor | undefined;

beforeEach(() => {
  observed = [];
  scrollHeightValue = 60;
  offsetWidthValue = 1200;

  class CapturingResizeObserver {
    private readonly cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(target: Element) {
      observed.push({ target, cb: this.cb });
    }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', CapturingResizeObserver);

  originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeightValue,
  });
  originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => offsetWidthValue,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalScrollHeight) {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', originalScrollHeight);
  }
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  }
});

function renderAutoSize(props: Record<string, unknown> = {}) {
  const { container } = render(<ModernTextarea autoSize {...props} />);
  const el = container.querySelector('textarea');
  if (!(el instanceof HTMLTextAreaElement)) {
    throw new Error('Expected a textarea');
  }
  return el;
}

describe('Modern Textarea autoSize survives width changes', () => {
  it('observes the textarea when autoSize is on and no onResize is supplied', () => {
    const el = renderAutoSize();
    expect(observed.map((entry) => entry.target)).toContain(el);
  });

  it('re-measures on a width change instead of freezing the first block size', async () => {
    const el = renderAutoSize();
    expect(el.style.blockSize).toBe('60px');

    const entry = observed.find((candidate) => candidate.target === el);
    expect(entry).toBeDefined();

    // The container narrows: the same text rewraps taller.
    offsetWidthValue = 400;
    scrollHeightValue = 160;
    await act(async () => {
      entry?.cb([], {} as ResizeObserver);
    });

    expect(el.style.blockSize).toBe('160px');
  });

  it('ignores a height-only notification so measurement cannot loop', async () => {
    const el = renderAutoSize();
    const entry = observed.find((candidate) => candidate.target === el);

    // Width unchanged: a block-size echo of our own write must not re-measure.
    scrollHeightValue = 999;
    await act(async () => {
      entry?.cb([], {} as ResizeObserver);
    });

    expect(el.style.blockSize).toBe('60px');
  });

  it('still reports geometry through onResize when that callback is supplied', async () => {
    const onResize = vi.fn();
    const el = renderAutoSize({ onResize });
    const entry = observed.find((candidate) => candidate.target === el);

    await act(async () => {
      entry?.cb([], {} as ResizeObserver);
    });

    expect(onResize).toHaveBeenCalledWith(
      expect.objectContaining({ width: 1200 })
    );
  });
});
