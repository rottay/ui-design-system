/**
 * The active tab must stay reachable when geometry changes with NO render.
 *
 * The reveal layout effect is keyed on props, so it cannot see a container
 * shrinking or a preceding label growing when an async count lands — the
 * selection never moves, yet it gets pushed outside the scrollport. The engine
 * already observed the tablist and every tab, but its callback only refreshed
 * the overflow arrows: the arrows updated while the selected tab sat off-edge.
 */

import React from 'react';
import { act } from '@testing-library/react';
import { renderWithEngineContext } from '@tests/support/engine';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernTabs from '../engines/modern';

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, 'classic');

const ITEMS = [
  { key: 'a', label: 'Overview', children: <div>A</div> },
  { key: 'b', label: 'Activity', children: <div>B</div> },
  { key: 'c', label: 'Settings', children: <div>C</div> },
];

class StubResizeObserver {
  static instances: StubResizeObserver[] = [];
  observed: Element[] = [];

  constructor(private readonly callback: ResizeObserverCallback) {
    StubResizeObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  unobserve(element: Element) {
    this.observed = this.observed.filter((candidate) => candidate !== element);
  }

  disconnect() {
    this.observed = [];
  }

  /**
   * Fire the way a real observer would: only for elements actually observed, so
   * "which elements are observed" stays load-bearing in the behaviour cases.
   */
  fireFor(changed: Element[]) {
    if (!changed.some((element) => this.observed.includes(element))) return;
    this.callback([], this as unknown as ResizeObserver);
  }
}

const latestObserver = () => {
  const observer = StubResizeObserver.instances.at(-1);
  if (!observer) throw new Error('no ResizeObserver was constructed');
  return observer;
};

let realResizeObserver: unknown;
let realScrollIntoView: unknown;

beforeEach(() => {
  StubResizeObserver.instances = [];
  document.documentElement.scrollTop = 0;

  const globals = globalThis as unknown as Record<string, unknown>;
  realResizeObserver = globals.ResizeObserver;
  globals.ResizeObserver = StubResizeObserver;

  const elementPrototype = Element.prototype as unknown as Record<string, unknown>;
  realScrollIntoView = elementPrototype.scrollIntoView;
  // jsdom does not implement it; installed as a spy to prove it is never reached.
  elementPrototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  const globals = globalThis as unknown as Record<string, unknown>;
  if (realResizeObserver === undefined) delete globals.ResizeObserver;
  else globals.ResizeObserver = realResizeObserver;

  // Delete what was absent rather than assigning undefined back: a typeof guard
  // must see the same world the suite started in.
  const elementPrototype = Element.prototype as unknown as Record<string, unknown>;
  if (realScrollIntoView === undefined) delete elementPrototype.scrollIntoView;
  else elementPrototype.scrollIntoView = realScrollIntoView;

  document.documentElement.scrollTop = 0;
  vi.restoreAllMocks();
});

/** Give an element a real, writable scroll offset (jsdom's is inert). */
function withScrollLeft(element: HTMLElement): void {
  let value = 0;
  Object.defineProperty(element, 'scrollLeft', {
    configurable: true,
    get: () => value,
    set: (next: number) => {
      value = next;
    },
  });
}

/** Stub a rect that later cases can move without re-rendering. */
function withMovableRect(element: HTMLElement, initial: { left: number; right: number }) {
  const box = { ...initial };
  element.getBoundingClientRect = () =>
    ({
      left: box.left,
      right: box.right,
      width: box.right - box.left,
      x: box.left,
      top: 0,
      bottom: 40,
      y: 0,
      height: 40,
      toJSON: () => ({}),
    }) as DOMRect;
  return box;
}

function sizeOf(element: HTMLElement, scrollWidth: number, clientWidth: number): void {
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
}

/**
 * Mount with the active tab CONTAINED INSIDE the view, so the mount-time layout
 * effect writes nothing and any later movement is attributable to the observer.
 */
function mountContained() {
  const { container } = render(<ModernTabs items={ITEMS} activeKey="c" />);

  const list = container.querySelector<HTMLElement>('[data-part="tab-list"]')!;
  const active = container.querySelector<HTMLElement>(
    '[data-part="tab-button"][data-selected="true"]'
  )!;

  withScrollLeft(list);
  sizeOf(list, 420, 200);
  withMovableRect(list, { left: 0, right: 200 });
  const activeBox = withMovableRect(active, { left: 100, right: 180 });

  return { container, list, active, activeBox };
}

describe('Modern Tabs reveal answers geometry that changes without a render', () => {
  it('re-reveals the active tab when a preceding label pushes it off-edge', () => {
    const { list, active, activeBox } = mountContained();
    expect(list.scrollLeft).toBe(0);

    // An async count lands on an earlier tab and shifts this one out. No prop
    // changes, so nothing re-renders and the layout effect never re-runs.
    activeBox.left = 300;
    activeBox.right = 380;

    act(() => {
      latestObserver().fireFor([active]);
    });

    // Minimum move: the tab's trailing edge lands flush on the view's.
    expect(list.scrollLeft).toBe(180);
  });

  it('re-reveals when the scrollport itself shrinks', () => {
    const { list, activeBox } = mountContained();
    const listBox = withMovableRect(list, { left: 0, right: 200 });

    listBox.right = 140;
    activeBox.left = 100;
    activeBox.right = 180;

    act(() => {
      latestObserver().fireFor([list]);
    });

    expect(list.scrollLeft).toBe(40);
  });

  it('observes the tablist AND every tab, not just the tablist', () => {
    const { container, list } = mountContained();
    const tabs = Array.from(
      container.querySelectorAll<HTMLElement>('[data-part="tab-button"]')
    );

    const observed = latestObserver().observed;
    expect(observed).toContain(list);
    for (const tab of tabs) expect(observed).toContain(tab);
  });

  it('still leaves a non-overflowing tablist alone', () => {
    const { list, active, activeBox } = mountContained();
    // Content now fits: there is nothing to reveal, so any movement would be
    // pure side effect — the guard the old scrollIntoView call did not have.
    sizeOf(list, 200, 200);
    activeBox.left = 300;
    activeBox.right = 380;

    act(() => {
      latestObserver().fireFor([active]);
    });

    expect(list.scrollLeft).toBe(0);
  });

  it('moves nothing but the tablist, and never through scrollIntoView', () => {
    const { list, active, activeBox } = mountContained();
    activeBox.left = 300;
    activeBox.right = 380;

    act(() => {
      latestObserver().fireFor([active]);
    });

    expect(list.scrollLeft).toBe(180);
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.documentElement.scrollLeft).toBe(0);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('settles instead of oscillating when the observer fires repeatedly', () => {
    const { list, active, activeBox } = mountContained();
    activeBox.left = 300;
    activeBox.right = 380;

    act(() => {
      latestObserver().fireFor([active]);
    });
    // Model the platform: the reveal moved the scrollport, so the tab now sits
    // where the first delta put it.
    activeBox.left = 120;
    activeBox.right = 200;

    act(() => {
      latestObserver().fireFor([active]);
      latestObserver().fireFor([active]);
    });

    expect(list.scrollLeft).toBe(180);
  });
});
