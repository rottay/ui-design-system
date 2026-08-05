import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernSegmented from '../index';

/**
 * Selected-option reveal: the scrollport-local behaviour, its resize triggers,
 * and the invariants that keep it from touching anything it does not own.
 *
 * WHAT JSDOM CAN AND CANNOT PROVE, STATED UP FRONT. jsdom has no layout engine:
 * every `getBoundingClientRect` is zeros and `scrollLeft` is an inert property.
 * So this file SUPPLIES a layout — a declared model of option widths and a
 * scrollport, with rects computed as live functions of the current scroll
 * offset, so a reveal really does change what a subsequent measurement reads.
 *
 * That makes these assertions real tests of the reveal's ARITHMETIC, its
 * TRIGGERS and its BLAST RADIUS, and it makes them regression-proof. It does
 * NOT make them evidence about real browser layout, RTL scroll origin, or
 * fractional device pixels — that evidence belongs to the capture harness and
 * is not claimed here. The distinction matters: this round has repeatedly
 * caught instruments that returned green on a property they could not see, and
 * a jsdom test that quietly presented itself as geometric proof would be one.
 */

// ---------------------------------------------------------------------------
// Simulated layout
// ---------------------------------------------------------------------------

interface LayoutModel {
  widths: number[];
  viewWidth: number;
  direction: 'ltr' | 'rtl';
  rootLeft: number;
  borderLeft: number;
  borderRight: number;
}

let layout: LayoutModel;

/** Scroll offsets, and a log of every write, keyed by element. */
let scrollX: WeakMap<Element, number>;
let scrollY: WeakMap<Element, number>;
let scrollWrites: Array<{ element: Element; axis: 'x' | 'y'; value: number }>;

let realGetBoundingClientRect: typeof Element.prototype.getBoundingClientRect;
let realScrollLeft: PropertyDescriptor | undefined;
let realScrollTop: PropertyDescriptor | undefined;
let realScrollIntoView: unknown;
let realResizeObserver: unknown;

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
   * Fire the way a real ResizeObserver would: ONLY for elements this observer
   * actually observes. An unconditional fire would let a behavioural test pass
   * against an implementation that observes the wrong set — the callback would
   * arrive anyway and the reveal would recompute from live rects. Gating on the
   * observed set is what makes "which elements are observed" load-bearing in
   * the behaviour tests and not just in the structural one.
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

const makeRect = (left: number, right: number): DOMRect =>
  ({
    left,
    right,
    x: left,
    width: right - left,
    top: 0,
    bottom: 40,
    y: 0,
    height: 40,
    toJSON: () => ({}),
  }) as DOMRect;

function rootOf(element: Element): HTMLElement | null {
  if (element.getAttribute?.('role') === 'radiogroup') return element as HTMLElement;
  return element.closest?.('[role="radiogroup"]') ?? null;
}

/** Viewport-space left edge of option `index` at the current scroll offset. */
function optionLeft(root: HTMLElement, index: number): number {
  const { widths, viewWidth, direction, rootLeft, borderLeft } = layout;
  const before = widths.slice(0, index).reduce((total, width) => total + width, 0);
  const scroll = scrollX.get(root) ?? 0;

  if (direction === 'rtl') {
    // scrollLeft 0 means the content's END is flush with the view's end, and
    // the offsets run negative from there — the spec-compliant RTL model.
    const contentEnd = rootLeft + borderLeft + viewWidth;
    return contentEnd - (before + widths[index]) - scroll;
  }
  return rootLeft + borderLeft + before - scroll;
}

/** The visible content box of the scrollport, borders excluded. */
function viewBounds() {
  const start = layout.rootLeft + layout.borderLeft;
  return { start, end: start + layout.viewWidth };
}

function optionsOf(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-part="option"]'));
}

function installLayout() {
  realGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
    const root = rootOf(this);
    if (root === this) {
      const { rootLeft, borderLeft, borderRight, viewWidth } = layout;
      return makeRect(rootLeft, rootLeft + borderLeft + viewWidth + borderRight);
    }
    if (root && (this as HTMLElement).matches?.('[data-part="option"]')) {
      const index = optionsOf(root).indexOf(this as HTMLElement);
      if (index >= 0) {
        const left = optionLeft(root, index);
        return makeRect(left, left + layout.widths[index]);
      }
    }
    return realGetBoundingClientRect.call(this);
  };

  realScrollLeft = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');
  realScrollTop = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');

  Object.defineProperty(Element.prototype, 'scrollLeft', {
    configurable: true,
    get(this: Element) {
      return scrollX.get(this) ?? 0;
    },
    set(this: Element, value: number) {
      scrollWrites.push({ element: this, axis: 'x', value });
      scrollX.set(this, value);
    },
  });

  Object.defineProperty(Element.prototype, 'scrollTop', {
    configurable: true,
    get(this: Element) {
      return scrollY.get(this) ?? 0;
    },
    set(this: Element, value: number) {
      scrollWrites.push({ element: this, axis: 'y', value });
      scrollY.set(this, value);
    },
  });
}

function restoreLayout() {
  Element.prototype.getBoundingClientRect = realGetBoundingClientRect;
  if (realScrollLeft) Object.defineProperty(Element.prototype, 'scrollLeft', realScrollLeft);
  else delete (Element.prototype as unknown as Record<string, unknown>).scrollLeft;
  if (realScrollTop) Object.defineProperty(Element.prototype, 'scrollTop', realScrollTop);
  else delete (Element.prototype as unknown as Record<string, unknown>).scrollTop;
}

beforeEach(() => {
  layout = {
    widths: [100, 100, 100],
    viewWidth: 240,
    direction: 'ltr',
    rootLeft: 0,
    borderLeft: 0,
    borderRight: 0,
  };
  scrollX = new WeakMap();
  scrollY = new WeakMap();
  scrollWrites = [];
  StubResizeObserver.instances = [];

  installLayout();

  const elementPrototype = Element.prototype as unknown as Record<string, unknown>;
  realScrollIntoView = elementPrototype.scrollIntoView;
  // jsdom does not implement scrollIntoView, so it is installed as a spy rather
  // than wrapped: the point is to prove it is never reached.
  elementPrototype.scrollIntoView = vi.fn();

  realResizeObserver = (globalThis as unknown as Record<string, unknown>).ResizeObserver;
  (globalThis as unknown as Record<string, unknown>).ResizeObserver = StubResizeObserver;
});

afterEach(() => {
  restoreLayout();

  // DELETE what was absent, restore what was present. Assigning `undefined`
  // back would leave an own property whose value is undefined, which is not the
  // same environment as one where the property never existed: a `'x' in obj`
  // check or a typeof-guarded feature test would then see a different world
  // than the one the suite started in, and leak that across files.
  const elementPrototype = Element.prototype as unknown as Record<string, unknown>;
  if (realScrollIntoView === undefined) delete elementPrototype.scrollIntoView;
  else elementPrototype.scrollIntoView = realScrollIntoView;

  const globals = globalThis as unknown as Record<string, unknown>;
  if (realResizeObserver === undefined) delete globals.ResizeObserver;
  else globals.ResizeObserver = realResizeObserver;

  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Assertions shared by every case
// ---------------------------------------------------------------------------

const radio = (name: string) => screen.getByRole('radio', { name });
const groupRoot = () => screen.getByRole('radiogroup');

/** The reveal's whole contract in one assertion: the option is inside the view. */
function expectSelectedContained() {
  const root = groupRoot();
  const selected = root.querySelector<HTMLElement>('[data-part="option"][aria-checked="true"]');
  expect(selected).not.toBeNull();

  const rect = selected!.getBoundingClientRect();
  const { start, end } = viewBounds();
  expect(rect.left).toBeGreaterThanOrEqual(start);
  expect(rect.right).toBeLessThanOrEqual(end);
}

/**
 * Blast radius. The reveal may write ONE property on ONE element; everything
 * else in the document must be untouched. Asserting this structurally is
 * stronger than checking a handful of named ancestors, because it also fails
 * for an ancestor the test never thought to name.
 */
function expectNothingElseScrolled(root: HTMLElement) {
  const foreign = scrollWrites.filter((write) => write.element !== root);
  expect(foreign).toEqual([]);

  const vertical = scrollWrites.filter((write) => write.axis === 'y');
  expect(vertical).toEqual([]);

  expect(document.documentElement.scrollLeft).toBe(0);
  expect(document.documentElement.scrollTop).toBe(0);
  expect(document.body.scrollLeft).toBe(0);
  expect(document.body.scrollTop).toBe(0);

  expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
}

// ---------------------------------------------------------------------------

describe('Modern Segmented reveal', () => {
  it('reveals a selection that mounts outside the scrollport', () => {
    // 3 x 100 of content in a 240 view: the third option starts at 200 and ends
    // at 300, so 60px of it is past the edge before anything scrolls.
    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="C" />);

    expect(groupRoot().scrollLeft).toBe(60);
    expectSelectedContained();
    expectNothingElseScrolled(groupRoot());
  });

  it('leaves the scrollport alone when the selection is already visible', () => {
    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="A" />);

    expect(scrollWrites).toEqual([]);
    expectSelectedContained();
  });

  it('does nothing at all when there is no selection', () => {
    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} />);

    expect(scrollWrites).toEqual([]);
    expectNothingElseScrolled(groupRoot());
  });

  it('reveals as arrow navigation moves the selection in uncontrolled mode', () => {
    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="A" />);
    expect(groupRoot().scrollLeft).toBe(0);

    fireEvent.keyDown(radio('A'), { key: 'ArrowRight' });
    expect(groupRoot().scrollLeft).toBe(0); // B spans 100..200, still inside.
    expectSelectedContained();

    fireEvent.keyDown(radio('B'), { key: 'ArrowRight' });
    expect(groupRoot().scrollLeft).toBe(60);
    expectSelectedContained();
    expectNothingElseScrolled(groupRoot());
  });

  it('reveals a controlled value change that moves no focus', () => {
    // This is the case native focus-scroll cannot cover: nothing is focused, so
    // there is no focus event for the platform to react to.
    const { rerender } = render(
      <ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} value="A" />
    );
    expect(groupRoot().scrollLeft).toBe(0);
    const focusedBefore = document.activeElement;

    rerender(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} value="C" />);

    expect(groupRoot().scrollLeft).toBe(60);
    expect(document.activeElement).toBe(focusedBefore);
    expectSelectedContained();
    expectNothingElseScrolled(groupRoot());
  });

  it('reveals in RTL, where the scroll origin is negative', () => {
    layout.direction = 'rtl';

    render(
      <div dir="rtl">
        <ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="C" />
      </div>
    );

    // Under the spec-compliant RTL model the offsets run from -(max) to 0, so
    // the correct reveal is NEGATIVE. An implementation that assumed a 0..max
    // origin would compute +60 here and drive the option further off-edge.
    expect(groupRoot().scrollLeft).toBe(-60);
    expectSelectedContained();
    expectNothingElseScrolled(groupRoot());
  });

  it('measures against the content box, not the border box', () => {
    layout.borderLeft = 2;
    layout.borderRight = 2;

    render(
      <ModernSegmented
        ariaLabel="Stage"
        options={['A', 'B', 'C']}
        defaultValue="C"
        style={{ border: '2px solid' }}
      />
    );

    // Content view is 2..242 and the option ends at 302, so the delta is 60.
    // Measuring the border box would put the view end at 244 and yield 58,
    // leaving the option two pixels under the border.
    expect(groupRoot().scrollLeft).toBe(60);
    expectSelectedContained();
  });

  it('shows an oversized option from its LOGICAL start in LTR', () => {
    // 400px of label in a 240px view: no offset contains it, so the reveal has
    // to choose an edge. LTR reads left-to-right, so the left edge wins.
    layout.widths = [100, 400];

    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B']} defaultValue="B" />);

    expect(groupRoot().scrollLeft).toBe(100);
    const selected = radio('B').getBoundingClientRect();
    expect(selected.left).toBe(viewBounds().start);
  });

  it('shows an oversized option from its LOGICAL start in RTL', () => {
    // The same arrangement mirrored. The logical start is the physical RIGHT,
    // so the option's right edge lands flush and the delta is negative. An
    // implementation that aligns the physical left unconditionally would land
    // this at the opposite edge and show the tail of the label.
    layout.direction = 'rtl';
    layout.widths = [100, 400];

    render(
      <div dir="rtl">
        <ModernSegmented ariaLabel="Stage" options={['A', 'B']} defaultValue="B" />
      </div>
    );

    expect(groupRoot().scrollLeft).toBe(-100);
    const selected = radio('B').getBoundingClientRect();
    expect(selected.right).toBe(viewBounds().end);
  });

  it('re-reveals when an ancestor flips direction on a live tree', () => {
    // The locale-switch case. Same value, same options, same sizes — so neither
    // a dependency list nor a ResizeObserver has anything to react to — but the
    // scroll origin and every physical placement have just inverted. A test that
    // sets RTL before mount cannot see this; the flip has to happen live.
    layout.widths = [100, 400];

    const tree = (dir: 'ltr' | 'rtl') => (
      <div dir={dir}>
        <ModernSegmented ariaLabel="Stage" options={['A', 'B']} defaultValue="B" />
      </div>
    );

    const { rerender } = render(tree('ltr'));
    expect(groupRoot().scrollLeft).toBe(100);

    layout.direction = 'rtl';
    rerender(tree('rtl'));

    expect(groupRoot().scrollLeft).toBe(-100);
    expect(radio('B').getBoundingClientRect().right).toBe(viewBounds().end);
  });

  it('observes the scrollport and EVERY option, not only the selected one', () => {
    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="C" />);

    const root = groupRoot();
    const observed = latestObserver().observed;
    expect(observed).toContain(root);
    for (const option of optionsOf(root)) {
      expect(observed).toContain(option);
    }
  });

  it('re-reveals when a PRECEDING SIBLING grows and pushes the selection out', () => {
    // The case that observing only root + selected cannot catch: a resize
    // observer reports SIZE, never POSITION, and here neither the root nor the
    // selected option changes size — a sibling does, and the selection is
    // carried off the edge by it.
    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="C" />);
    const root = groupRoot();
    expect(root.scrollLeft).toBe(60);

    layout.widths[0] = 200;
    // Only the FIRST option resized. Under an implementation that observes just
    // the root and the selected option, no callback arrives at all.
    act(() => latestObserver().fireFor([optionsOf(root)[0]]));

    expect(root.scrollLeft).toBe(160);
    expectSelectedContained();
    expectNothingElseScrolled(root);
  });

  it('re-reveals when the scrollport itself shrinks', () => {
    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="C" />);
    const root = groupRoot();
    expect(root.scrollLeft).toBe(60);

    layout.viewWidth = 140;
    act(() => latestObserver().fireFor([root]));

    expect(root.scrollLeft).toBe(160);
    expectSelectedContained();
  });

  it('settles instead of oscillating when resize fires repeatedly', () => {
    render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="C" />);
    const root = groupRoot();

    const writesBefore = scrollWrites.length;
    act(() => {
      latestObserver().fireFor([root]);
      latestObserver().fireFor([root]);
      latestObserver().fireFor([root]);
    });

    // Already contained, so a settled reveal writes nothing further.
    expect(scrollWrites.length).toBe(writesBefore);
    expect(root.scrollLeft).toBe(60);
  });

  it('survives without ResizeObserver instead of throwing', () => {
    delete (globalThis as unknown as Record<string, unknown>).ResizeObserver;

    expect(() =>
      render(<ModernSegmented ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="C" />)
    ).not.toThrow();
    expect(groupRoot().scrollLeft).toBe(60);
  });
});

describe('Modern Segmented forwarded ref', () => {
  it('honours React 19 callback-ref cleanup instead of discarding it', () => {
    // React 19 calls a callback ref's RETURNED cleanup on detach instead of
    // re-invoking the callback with null. A wrapper that throws that return
    // value away leaves the consumer holding a detached node forever.
    const received: Array<HTMLDivElement | null> = [];
    const cleanup = vi.fn();
    const callbackRef: React.RefCallback<HTMLDivElement> = (node) => {
      received.push(node);
      return cleanup;
    };

    const { unmount } = render(
      <ModernSegmented ref={callbackRef} ariaLabel="Stage" options={['A', 'B']} defaultValue="A" />
    );

    expect(received).toHaveLength(1);
    expect(received[0]).toBeInstanceOf(HTMLElement);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
    // Cleanup is the detach protocol here, so the null call must NOT also fire.
    expect(received).toHaveLength(1);
  });

  it('detaches a callback ref that returns no cleanup', () => {
    const received: Array<HTMLDivElement | null> = [];
    const callbackRef: React.RefCallback<HTMLDivElement> = (node) => {
      received.push(node);
    };

    const { unmount } = render(
      <ModernSegmented ref={callbackRef} ariaLabel="Stage" options={['A', 'B']} defaultValue="A" />
    );
    expect(received[0]).toBeInstanceOf(HTMLElement);

    unmount();

    // No cleanup was supplied, so the wrapper must null the consumer itself.
    expect(received.at(-1)).toBeNull();
  });

  it('clears an object ref on unmount', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { unmount } = render(
      <ModernSegmented ref={ref} ariaLabel="Stage" options={['A', 'B']} defaultValue="A" />
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
    unmount();
    expect(ref.current).toBeNull();
  });

  it('reveals through a forwarded ref as it does without one', () => {
    // The ref wrapper and the internal ref share one node; a wrapper that
    // forgot the internal assignment would silently disable the reveal.
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ModernSegmented ref={ref} ariaLabel="Stage" options={['A', 'B', 'C']} defaultValue="C" />
    );

    expect(ref.current).toBe(groupRoot());
    expect(groupRoot().scrollLeft).toBe(60);
  });
});
