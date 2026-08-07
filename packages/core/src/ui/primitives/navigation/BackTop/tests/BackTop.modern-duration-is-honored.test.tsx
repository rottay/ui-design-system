// `duration` must be causal: two instances differing only in `duration` sit at different
// points of the same journey, and each settles at its own deadline.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackTop } from '../engines/modern';

/** Manual frame pump: rAF callbacks run only when the test advances time. */
let frameQueue: FrameRequestCallback[] = [];
let clock = 0;

function pumpFrame(): void {
  const due = frameQueue;
  frameQueue = [];
  due.forEach((cb) => cb(clock));
}

function advanceTo(ms: number): void {
  clock = ms;
  pumpFrame();
}

// A scroll container whose `scrollTop` is really writable: jsdom's own is a no-op
// that always reads 0.
function makeScrollHost(initialTop: number): HTMLDivElement {
  const host = document.createElement('div');
  Object.defineProperty(host, 'scrollTop', {
    configurable: true,
    writable: true,
    value: initialTop,
  });
  document.body.appendChild(host);
  return host;
}

beforeEach(() => {
  frameQueue = [];
  clock = 0;
  vi.stubGlobal('requestAnimationFrame', ((cb: FrameRequestCallback) => {
    frameQueue.push(cb);
    return frameQueue.length;
  }) as typeof requestAnimationFrame);
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  vi.stubGlobal(
    'matchMedia',
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia,
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('BackTop modern: the duration axis drives the journey', () => {
  it('places two instances at different offsets at the same instant', () => {
    const fastHost = makeScrollHost(1000);
    const slowHost = makeScrollHost(1000);

    render(
      <>
        <BackTop target={() => fastHost} visibilityHeight={0} duration={400} data-testid="fast" />
        <BackTop target={() => slowHost} visibilityHeight={0} duration={2000} data-testid="slow" />
      </>,
    );

    const [fastTrigger, slowTrigger] = screen.getAllByRole('button', { name: 'Back to top' });
    fireEvent.click(fastTrigger);
    fireEvent.click(slowTrigger);

    // t = 0: both queued, neither has travelled.
    advanceTo(0);
    expect(fastHost.scrollTop).toBe(1000);
    expect(slowHost.scrollTop).toBe(1000);

    // t = 200ms is half of the fast journey and a tenth of the slow one, so
    // the SAME instant must find them at materially different offsets.
    advanceTo(200);
    expect(fastHost.scrollTop).toBeLessThan(slowHost.scrollTop);
    expect(slowHost.scrollTop).toBeGreaterThan(0);
  });

  it('settles exactly at the requested deadline, not the user agent cadence', () => {
    const host = makeScrollHost(800);
    render(<BackTop target={() => host} visibilityHeight={0} duration={400} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));

    advanceTo(0);
    advanceTo(100);
    // A quarter into the journey the reader is still visibly travelling.
    expect(host.scrollTop).toBeGreaterThan(0);
    expect(host.scrollTop).toBeLessThan(800);

    advanceTo(400);
    expect(host.scrollTop).toBe(0);
  });

  it('abandons the journey when the reader takes the scroll back', () => {
    const host = makeScrollHost(1000);
    render(<BackTop target={() => host} visibilityHeight={0} duration={1000} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    advanceTo(0);
    advanceTo(200);
    const engineOffset = host.scrollTop;
    expect(engineOffset).toBeGreaterThan(0);

    // The reader scrolls by hand mid-journey.
    host.scrollTop = engineOffset + 300;
    advanceTo(400);
    // The engine yielded: the reader's offset survives untouched.
    expect(host.scrollTop).toBe(engineOffset + 300);
  });
});
