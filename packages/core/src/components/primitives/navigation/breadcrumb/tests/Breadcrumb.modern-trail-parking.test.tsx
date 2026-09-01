// The root is an `overflow-x: auto` scrollport, so the parked position is the reader's only
// affordance: never re-park on unrelated renders, and do park when clipping starts.
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import ModernBreadcrumb from '../engines/modern';
import type { BreadcrumbItem } from '../contracts';

const ITEMS: BreadcrumbItem[] = [
  { key: 'root', label: 'Root', href: '/' },
  { key: 'team', label: 'Team', href: '/team' },
  { key: 'project', label: 'Project', href: '/team/project' },
  { key: 'current', label: 'Current' },
];

/** Every live ResizeObserver, so a test can drive an observation. */
let observers: Array<{ callback: ResizeObserverCallback; targets: Element[] }>;

/** Makes `root` a 200px window over 500px of trail. */
function makeClipped(root: HTMLElement, scrollWidth = 500, clientWidth = 200): void {
  Object.defineProperty(root, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(root, 'clientWidth', { configurable: true, value: clientWidth });
}

beforeEach(() => {
  observers = [];
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
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderTrail(overflowConfig?: { maxVisible: number }) {
  // Fresh array + object literals every render, exactly as a call site writes
  // them. Nothing about the TRAIL changes between renders.
  const view = render(
    <ModernBreadcrumb
      items={ITEMS.map((item) => ({ ...item }))}
      {...(overflowConfig ? { overflow: { ...overflowConfig } } : {})}
    />
  );
  const root = view.container.querySelector("[data-part='root']") as HTMLElement;
  return {
    root,
    rerender: () =>
      view.rerender(
        <ModernBreadcrumb
          items={ITEMS.map((item) => ({ ...item }))}
          {...(overflowConfig ? { overflow: { ...overflowConfig } } : {})}
        />
      ),
  };
}

describe('Breadcrumb modern trail parking', () => {
  it('leaves the reader where they scrolled when the parent re-renders', () => {
    const { root, rerender } = renderTrail({ maxVisible: 10 });
    makeClipped(root);

    // The reader scrolls back toward the root crumb.
    root.scrollLeft = 0;
    root.dispatchEvent(new Event('scroll'));

    // An unrelated parent render with fresh inline props.
    rerender();

    expect(root.scrollLeft).toBe(0);
  });

  it('re-parks at the current location when the trail starts clipping later', () => {
    const { root } = renderTrail();

    // Mount saw a trail that fit, so nothing was parked.
    expect(root.scrollLeft).toBe(0);
    expect(observers.flatMap((entry) => entry.targets)).toContain(root);

    // A rotation narrows the window; no scroll event announces it.
    makeClipped(root);
    for (const entry of observers) entry.callback([], {} as ResizeObserver);

    expect(root.scrollLeft).toBe(300);
  });

  it('does not re-park a reader who has already scrolled away', () => {
    const { root } = renderTrail();
    makeClipped(root);

    root.scrollLeft = 40;
    root.dispatchEvent(new Event('scroll'));

    for (const entry of observers) entry.callback([], {} as ResizeObserver);

    expect(root.scrollLeft).toBe(40);
  });

  it('parks toward the negative end under RTL declared in markup', () => {
    const { container } = render(
      <div dir="rtl">
        <ModernBreadcrumb items={ITEMS} />
      </div>
    );
    const root = container.querySelector("[data-part='root']") as HTMLElement;
    makeClipped(root);

    for (const entry of observers) entry.callback([], {} as ResizeObserver);

    // Spec RTL scroll model: the inline end is the most negative offset.
    expect(root.scrollLeft).toBe(-300);
  });
});
