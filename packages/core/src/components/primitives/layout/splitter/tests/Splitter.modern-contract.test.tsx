/**
 * Splitter modern-engine contract tests (K3-C pass 1).
 *
 * The K3-C falsification proved three things about this family: (1) the
 * 25-line skin owned only the gutter's idle background while the drag
 * gesture painted NO feedback (no hover, no dragging state, no focus ring);
 * (2) the gutter was a plain mousedown div -- no role, no tab stop, no
 * keyboard resize, and mouse-only events meant touch drag never worked;
 * (3) the horizontal drag math measured `clientX - rect.left`, which is
 * wrong in RTL where the flex row lays panels out from the inline-end.
 *
 * These tests pin the new contract: separator ARIA + keyboard resize,
 * pointer-event drag (with fresh-size math), RTL-mirrored drag and keys,
 * pair-sum conservation, and the drained-utility anatomy the skin now owns.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import { Splitter, Panel } from '../engines/modern';

function renderSplitter(
  props: Record<string, unknown> = {},
  panelCount = 2
) {
  return render(
    <Splitter data-testid="splitter-root" {...props}>
      {Array.from({ length: panelCount }, (_, i) => (
        <Panel key={i}>
          <span>panel-{i}</span>
        </Panel>
      ))}
    </Splitter>
  );
}

function gutters(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[data-part="gutter"]'));
}

function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[data-part="panel"]'));
}

describe('Splitter modern contract: anatomy', () => {
  it('root carries the class pair and data-orientation, no structure utilities', () => {
    const { container } = renderSplitter();
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.className).toContain('ds-splitter');
    expect(root.className).toContain('ds-splitter--modern');
    expect(root.getAttribute('data-orientation')).toBe('horizontal');
    expect(root.className).not.toMatch(/flex|w-full|h-full/);
  });

  it('panel carries no overflow utility (skin-owned) and keeps the measured flex basis inline', () => {
    renderSplitter();
    const [first] = panels();
    expect(first.className).not.toMatch(/overflow-auto/);
    expect(first.style.getPropertyValue('--ds-splitter-panel-grow')).toBe('50');
  });

  it('gutter is a focusable separator with value aria, no utility classes', () => {
    renderSplitter();
    const [gutter] = gutters();
    expect(gutter.getAttribute('role')).toBe('separator');
    expect(gutter.tabIndex).toBe(0);
    expect(gutter.getAttribute('aria-orientation')).toBe('vertical');
    expect(gutter.getAttribute('aria-valuenow')).toBe('50');
    expect(gutter.getAttribute('aria-valuemin')).toBe('0');
    expect(gutter.getAttribute('aria-valuemax')).toBe('100');
    // Standalone render (no I18nProvider) falls back to the English string.
    expect(gutter.getAttribute('aria-label')).toBe('Resize panels');
    expect(gutter.className).not.toMatch(/w-2|h-2|cursor-|flex-shrink-0|transition-colors/);
  });

  it('vertical layout stamps horizontal separator orientation', () => {
    renderSplitter({ layout: 'vertical' });
    const [gutter] = gutters();
    expect(gutter.getAttribute('data-orientation')).toBe('vertical');
    expect(gutter.getAttribute('aria-orientation')).toBe('horizontal');
  });
});

describe('Splitter modern contract: keyboard resize', () => {
  it('ArrowRight/ArrowLeft step the pair by 2 and conserve the pair sum', () => {
    renderSplitter();
    const [gutter] = gutters();

    fireEvent.keyDown(gutter, { key: 'ArrowRight' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('52');
    expect(panels()[0].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('52');
    expect(panels()[1].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('48');

    fireEvent.keyDown(gutter, { key: 'ArrowLeft' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('50');
    fireEvent.keyDown(gutter, { key: 'ArrowLeft' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('48');
  });

  it('Home/End collapse to the pair edges without inflating the pair', () => {
    renderSplitter();
    const [gutter] = gutters();

    fireEvent.keyDown(gutter, { key: 'End' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('100');
    expect(panels()[0].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('100');
    expect(panels()[1].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('0');

    fireEvent.keyDown(gutter, { key: 'Home' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('0');
    expect(panels()[0].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('0');
    expect(panels()[1].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('100');
  });

  it('vertical layout uses ArrowDown/ArrowUp', () => {
    renderSplitter({ layout: 'vertical' });
    const [gutter] = gutters();
    fireEvent.keyDown(gutter, { key: 'ArrowDown' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('52');
    fireEvent.keyDown(gutter, { key: 'ArrowUp' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('50');
  });

  it('mirrors the arrow mapping in RTL', () => {
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <Splitter>
          <Panel>
            <span>panel-0</span>
          </Panel>
          <Panel>
            <span>panel-1</span>
          </Panel>
        </Splitter>
      </I18nProvider>
    );
    const [gutter] = gutters();
    // In RTL, ArrowLeft increases the leading panel (mirror of LTR ArrowRight).
    fireEvent.keyDown(gutter, { key: 'ArrowLeft' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('52');
    fireEvent.keyDown(gutter, { key: 'ArrowRight' });
    expect(gutter.getAttribute('aria-valuenow')).toBe('50');
  });
});

describe('Splitter modern contract: pointer drag', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement
    ) {
      if (this.getAttribute('data-part') === 'root') {
        return {
          top: 0,
          left: 0,
          right: 1000,
          bottom: 400,
          width: 1000,
          height: 400,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }
      return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('drags with pointer events and reports resize lifecycle callbacks', () => {
    const onResize = vi.fn();
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();
    renderSplitter({ onResize, onResizeStart, onResizeEnd });
    const [gutter] = gutters();

    fireEvent.pointerDown(gutter, { clientX: 500, clientY: 200 });
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(gutter.getAttribute('data-dragging')).toBe('true');
    // The gutter takes keyboard focus so the focus-ring contract holds after a pointer drag.
    expect(document.activeElement).toBe(gutter);

    fireEvent.pointerMove(document, { clientX: 600, clientY: 200 });
    expect(panels()[0].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('60');
    expect(panels()[1].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('40');
    expect(onResize).toHaveBeenCalled();

    // A second move uses FRESH sizes (the stale-closure bug class).
    fireEvent.pointerMove(document, { clientX: 700, clientY: 200 });
    expect(panels()[0].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('70');

    fireEvent.pointerUp(document);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(gutter.getAttribute('data-dragging')).toBe('false');
  });

  it('clamps the drag at the container edges, conserving the pair sum', () => {
    renderSplitter();
    const [gutter] = gutters();

    fireEvent.pointerDown(gutter, { clientX: 500, clientY: 200 });
    fireEvent.pointerMove(document, { clientX: 5000, clientY: 200 });
    expect(panels()[0].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('100');
    expect(panels()[1].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('0');

    fireEvent.pointerMove(document, { clientX: -500, clientY: 200 });
    expect(panels()[0].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('0');
    expect(panels()[1].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('100');
    fireEvent.pointerUp(document);
  });

  it('mirrors horizontal drag math in RTL (offset from the inline-end)', () => {
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <Splitter>
          <Panel>
            <span>panel-0</span>
          </Panel>
          <Panel>
            <span>panel-1</span>
          </Panel>
        </Splitter>
      </I18nProvider>
    );
    const [gutter] = gutters();
    fireEvent.pointerDown(gutter, { clientX: 500, clientY: 200 });
    // clientX 400 with rect.right 1000 -> offset 600 from the right -> 60%.
    fireEvent.pointerMove(document, { clientX: 400, clientY: 200 });
    expect(panels()[0].style.getPropertyValue('--ds-splitter-panel-grow')).toBe('60');
    fireEvent.pointerUp(document);
  });
});

type PanelLocks = ReadonlyArray<boolean | undefined>;

/** `undefined` omits `resizable` entirely, so the documented default is what runs. */
function lockedSplitter(
  locks: PanelLocks,
  sizes: ReadonlyArray<number> = locks.map(() => 100 / locks.length),
  props: Record<string, unknown> = {}
) {
  return (
    <Splitter {...props}>
      {locks.map((resizable, i) => (
        <Panel
          key={i}
          defaultSize={sizes[i]}
          {...(resizable === undefined ? {} : { resizable })}
        >
          <span>panel-{i}</span>
        </Panel>
      ))}
    </Splitter>
  );
}

/** Each gutter's posture as the user meets it: a tab-stop separator, an inert
 *  rail, or `mixed` when the DOM contradicts itself. */
function gutterPostures(): string[] {
  return gutters().map((gutter) => {
    const operable =
      gutter.getAttribute('role') === 'separator' &&
      gutter.tabIndex === 0 &&
      !gutter.hasAttribute('aria-hidden') &&
      gutter.getAttribute('data-resizable') === 'true';
    const locked =
      gutter.getAttribute('role') === null &&
      gutter.tabIndex === -1 &&
      gutter.getAttribute('aria-hidden') === 'true' &&
      gutter.getAttribute('data-resizable') === 'false';
    return operable ? 'operable' : locked ? 'locked' : 'mixed';
  });
}

function panelGrows(): string[] {
  return panels().map((panel) => panel.style.getPropertyValue('--ds-splitter-panel-grow'));
}

describe('Splitter modern contract: resizable={false} locks only its adjacent gutters', () => {
  it.each<{ name: string; locks: PanelLocks; expected: string[] }>([
    { name: 'three panels, resizable omitted everywhere', locks: [undefined, undefined, undefined], expected: ['operable', 'operable'] },
    { name: 'three panels, first locked', locks: [false, undefined, undefined], expected: ['locked', 'operable'] },
    { name: 'three panels, middle locked', locks: [undefined, false, undefined], expected: ['locked', 'locked'] },
    { name: 'three panels, last locked', locks: [undefined, undefined, false], expected: ['operable', 'locked'] },
    { name: 'three panels, explicit true around a locked middle', locks: [true, false, true], expected: ['locked', 'locked'] },
    { name: 'three panels, first and last locked', locks: [false, undefined, false], expected: ['locked', 'locked'] },
    { name: 'three panels, explicit true everywhere', locks: [true, true, true], expected: ['operable', 'operable'] },
    { name: 'four panels, first locked', locks: [false, undefined, undefined, undefined], expected: ['locked', 'operable', 'operable'] },
    { name: 'four panels, second locked beside explicit true', locks: [undefined, false, undefined, true], expected: ['locked', 'locked', 'operable'] },
    { name: 'four panels, last locked', locks: [true, undefined, undefined, false], expected: ['operable', 'operable', 'locked'] },
  ])('$name', ({ locks, expected }) => {
    render(lockedSplitter(locks));
    expect(gutterPostures()).toEqual(expected);
  });

  it('a locked gutter refuses keyboard and pointer resize while its operable neighbour still resizes', () => {
    const onResize = vi.fn();
    const onResizeStart = vi.fn();
    render(lockedSplitter([false, undefined, undefined], [30, 40, 30], { onResize, onResizeStart }));
    const [locked, free] = gutters();
    expect(panelGrows()).toEqual(['30', '40', '30']);

    fireEvent.keyDown(locked, { key: 'ArrowRight' });
    fireEvent.keyDown(locked, { key: 'End' });
    fireEvent.keyDown(locked, { key: 'Home' });
    expect(panelGrows()).toEqual(['30', '40', '30']);

    fireEvent.pointerDown(locked, { clientX: 300, clientY: 200 });
    expect(locked.getAttribute('data-dragging')).toBe('false');
    fireEvent.pointerMove(document, { clientX: 900, clientY: 200 });
    fireEvent.pointerUp(document);
    expect(panelGrows()).toEqual(['30', '40', '30']);
    expect(onResizeStart).not.toHaveBeenCalled();
    expect(onResize).not.toHaveBeenCalled();

    expect(free.getAttribute('aria-valuenow')).toBe('70');
    fireEvent.keyDown(free, { key: 'ArrowRight' });
    expect(free.getAttribute('aria-valuenow')).toBe('72');
    expect(panelGrows()).toEqual(['30', '42', '28']);
    expect(onResize).toHaveBeenLastCalledWith([30, 42, 28]);
  });

  it('follows resizable across rerenders, relocking and releasing the right gutters', () => {
    const sizes = [30, 40, 30];
    const { rerender } = render(lockedSplitter([undefined, undefined, undefined], sizes));
    expect(gutterPostures()).toEqual(['operable', 'operable']);

    rerender(lockedSplitter([undefined, false, undefined], sizes));
    expect(gutterPostures()).toEqual(['locked', 'locked']);

    rerender(lockedSplitter([undefined, undefined, false], sizes));
    expect(gutterPostures()).toEqual(['operable', 'locked']);

    rerender(lockedSplitter([false, undefined, undefined], sizes));
    expect(gutterPostures()).toEqual(['locked', 'operable']);
    fireEvent.keyDown(gutters()[0], { key: 'ArrowRight' });
    expect(panelGrows()).toEqual(['30', '40', '30']);

    rerender(lockedSplitter([undefined, undefined, undefined], sizes));
    expect(gutterPostures()).toEqual(['operable', 'operable']);
    fireEvent.keyDown(gutters()[0], { key: 'ArrowRight' });
    expect(gutters()[0].getAttribute('aria-valuenow')).toBe('32');
    expect(panelGrows()).toEqual(['32', '38', '30']);
  });
});
