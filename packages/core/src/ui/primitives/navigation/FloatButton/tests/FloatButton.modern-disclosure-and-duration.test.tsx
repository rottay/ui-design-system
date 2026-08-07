// The group trigger is a disclosure over a `role="group"` panel, never `aria-haspopup`,
// and `BackTop`'s `duration` must actually drive the journey.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackTop, Group } from '../engines/modern';
import FloatButton from '../engines/modern';

let frameQueue: FrameRequestCallback[] = [];
let clock = 0;

function advanceTo(ms: number): void {
  clock = ms;
  const due = frameQueue;
  frameQueue = [];
  due.forEach((cb) => cb(clock));
}

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

describe('FloatButton.Group modern: the disclosure names its own panel', () => {
  it('points aria-controls at the real panel element', () => {
    const { container } = render(
      <Group>
        <FloatButton tooltip="Edit" />
      </Group>,
    );

    const trigger = container.querySelector<HTMLElement>(
      "[data-part='trigger'][aria-expanded]",
    );
    const panel = container.querySelector<HTMLElement>("[data-part='panel']");
    expect(trigger).toBeTruthy();
    expect(panel).toBeTruthy();

    const controls = trigger?.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(panel?.id).toBe(controls);
    // The relation must resolve inside the document, not just match a string.
    expect(document.getElementById(controls as string)).toBe(panel);
  });

  it('stops promising menu semantics for a role="group" panel', () => {
    const { container } = render(
      <Group>
        <FloatButton tooltip="Edit" />
      </Group>,
    );

    const trigger = container.querySelector<HTMLElement>(
      "[data-part='trigger'][aria-expanded]",
    );
    const panel = container.querySelector<HTMLElement>("[data-part='panel']");
    expect(panel?.getAttribute('role')).toBe('group');
    expect(trigger?.getAttribute('aria-haspopup')).toBeNull();
    // The disclosure state itself is untouched.
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger as HTMLElement);
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
  });

  it('mints a distinct panel id per group instance', () => {
    const { container } = render(
      <>
        <Group>
          <FloatButton tooltip="A" />
        </Group>
        <Group>
          <FloatButton tooltip="B" />
        </Group>
      </>,
    );

    const controls = Array.from(
      container.querySelectorAll<HTMLElement>("[data-part='trigger'][aria-expanded]"),
    ).map((node) => node.getAttribute('aria-controls'));
    expect(controls).toHaveLength(2);
    expect(controls[0]).not.toBe(controls[1]);
  });
});

describe('FloatButton.BackTop modern: the duration axis drives the journey', () => {
  it('places two instances at different offsets at the same instant', () => {
    const fastHost = makeScrollHost(1000);
    const slowHost = makeScrollHost(1000);

    render(
      <>
        <BackTop target={() => fastHost} visibilityHeight={0} duration={400} />
        <BackTop target={() => slowHost} visibilityHeight={0} duration={2000} />
      </>,
    );

    const triggers = screen.getAllByRole('button');
    fireEvent.click(triggers[0]);
    fireEvent.click(triggers[1]);

    advanceTo(0);
    expect(fastHost.scrollTop).toBe(1000);
    expect(slowHost.scrollTop).toBe(1000);

    advanceTo(200);
    expect(fastHost.scrollTop).toBeLessThan(slowHost.scrollTop);
    expect(slowHost.scrollTop).toBeGreaterThan(0);
  });

  it('settles at the requested deadline', () => {
    const host = makeScrollHost(800);
    render(<BackTop target={() => host} visibilityHeight={0} duration={400} />);

    fireEvent.click(screen.getByRole('button'));
    advanceTo(0);
    advanceTo(100);
    expect(host.scrollTop).toBeGreaterThan(0);
    expect(host.scrollTop).toBeLessThan(800);

    advanceTo(400);
    expect(host.scrollTop).toBe(0);
  });
});
