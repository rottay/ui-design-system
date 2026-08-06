/**
 * Modern Tabs reveal is scrollport-local.
 *
 * The engine used to reveal the active tab with `scrollIntoView({ block:
 * 'nearest', inline: 'nearest' })` inside a layout effect. `scrollIntoView`
 * walks the WHOLE ancestor chain, so a `<Tabs>` below the fold dragged the
 * DOCUMENT to itself on first paint and again on every `items` change — even
 * when the tablist did not overflow and had nothing to reveal.
 *
 * These tests assert the OBSERVABLE OUTCOME on both sides of that: the page
 * must not move, and an overflowing tablist must still reveal through its own
 * `scrollLeft`. jsdom has no layout engine, so the platform behaviour of
 * `scrollIntoView` (it moves ancestor scroll offsets) is modelled explicitly
 * and the geometry is stamped on the nodes; nothing here inspects whether a
 * particular method was called.
 */

import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import ModernTabs from '../engines/modern';

const ITEMS = [
  { key: 'a', label: 'Overview', children: <div>A</div> },
  { key: 'b', label: 'Activity', children: <div>B</div> },
  { key: 'c', label: 'Settings', children: <div>C</div> },
];

/** Documents the page offset a real `scrollIntoView` would produce. */
const YANK = 640;

const nativeScrollIntoView = Element.prototype.scrollIntoView;

beforeEach(() => {
  document.documentElement.scrollTop = 0;
  // Model the platform: a real scrollIntoView scrolls scrollable ANCESTORS,
  // including the document. jsdom leaves the method undefined.
  Element.prototype.scrollIntoView = function scrollIntoView(this: Element) {
    document.documentElement.scrollTop = YANK;
  };
});

afterEach(() => {
  if (nativeScrollIntoView) Element.prototype.scrollIntoView = nativeScrollIntoView;
  else delete (Element.prototype as Partial<Element>).scrollIntoView;
  document.documentElement.scrollTop = 0;
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

function withRect(element: HTMLElement, left: number, right: number): void {
  element.getBoundingClientRect = () =>
    ({ left, right, width: right - left, top: 0, bottom: 40, height: 40, x: left, y: 0 }) as DOMRect;
}

function sizeOf(element: HTMLElement, scrollWidth: number, clientWidth: number): void {
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
}

describe('Modern Tabs reveal does not move the page', () => {
  it('leaves the document scroll offset untouched on mount', () => {
    render(<ModernTabs items={ITEMS} defaultActiveKey="c" />);

    expect(document.documentElement.scrollTop).toBe(0);
  });

  it('leaves the document scroll offset untouched when items change', () => {
    const { rerender } = render(<ModernTabs items={ITEMS} defaultActiveKey="a" />);
    document.documentElement.scrollTop = 0;

    // A tab arriving from a data fetch re-runs the reveal effect.
    act(() => {
      rerender(
        <ModernTabs
          items={[...ITEMS, { key: 'd', label: 'Billing', children: <div>D</div> }]}
          defaultActiveKey="a"
        />
      );
    });

    expect(document.documentElement.scrollTop).toBe(0);
  });
});

describe('Modern Tabs reveal uses the tablist scrollport', () => {
  it('scrolls its own tablist to reveal an off-edge active tab', () => {
    const { container, rerender } = render(<ModernTabs items={ITEMS} activeKey="c" />);

    const list = container.querySelector<HTMLElement>('[data-part="tab-list"]')!;
    const active = container.querySelector<HTMLElement>('[data-part="tab-button"][data-selected="true"]')!;
    withScrollLeft(list);
    sizeOf(list, 420, 200);
    withRect(list, 0, 200);
    withRect(active, 300, 380);

    // New `items` identity re-runs the reveal effect against the stamped geometry.
    act(() => {
      rerender(<ModernTabs items={[...ITEMS]} activeKey="c" />);
    });

    // Minimum move: the tab's trailing edge lands flush on the view's.
    expect(list.scrollLeft).toBe(180);
    expect(document.documentElement.scrollTop).toBe(0);
  });

  it('does not scroll a tablist whose tabs already fit', () => {
    const { container, rerender } = render(<ModernTabs items={ITEMS} activeKey="c" />);

    const list = container.querySelector<HTMLElement>('[data-part="tab-list"]')!;
    const active = container.querySelector<HTMLElement>('[data-part="tab-button"][data-selected="true"]')!;
    withScrollLeft(list);
    sizeOf(list, 200, 200);
    withRect(list, 0, 200);
    withRect(active, 300, 380);

    act(() => {
      rerender(<ModernTabs items={[...ITEMS]} activeKey="c" />);
    });

    expect(list.scrollLeft).toBe(0);
    expect(document.documentElement.scrollTop).toBe(0);
  });
});
