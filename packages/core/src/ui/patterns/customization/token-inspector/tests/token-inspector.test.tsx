/**
 * TokenInspector contracts (Lane E1).
 *
 * Each case fails against the pre-change overlay: the panel clamped against
 * hardcoded 380/400 extents (overflowing a 360px viewport), rendered an empty
 * `element-info` strip before the first hover, dropped tokens past the display
 * cap with no signal, and left the scrollable region unfocusable when pinned.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

import { TokenInspector } from '..';

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 400;

function activate(): void {
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'T', ctrlKey: true, shiftKey: true })
    );
  });
}

function hover(target: Element, clientX: number, clientY: number): void {
  act(() => {
    const event = new MouseEvent('mousemove', { bubbles: true, clientX, clientY });
    Object.defineProperty(event, 'target', { value: target, configurable: true });
    document.dispatchEvent(event);
  });
}

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true, writable: true });
}

describe('TokenInspector', () => {
  let rectSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setViewport(1440, 900);
    // jsdom has no layout: give every element the skin's panel box so the
    // clamp reads a real measurement.
    rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      width: PANEL_WIDTH,
      height: PANEL_HEIGHT,
      top: 0,
      left: 0,
      right: PANEL_WIDTH,
      bottom: PANEL_HEIGHT,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });

  afterEach(() => {
    rectSpy.mockRestore();
  });

  it('renders nothing until the toggle chord fires', () => {
    const { container } = render(<TokenInspector />);
    expect(container.querySelector('[data-part="panel"]')).toBeNull();
    activate();
    expect(container.querySelector('[data-part="panel"]')).not.toBeNull();
  });

  it('opens without an empty element-info strip and fills it on hover', () => {
    const { container } = render(<TokenInspector />);
    activate();
    expect(container.querySelector('[data-part="element-info"]')).toBeNull();

    const probe = document.createElement('div');
    document.body.appendChild(probe);
    hover(probe, 100, 100);

    const info = container.querySelector('[data-part="element-info"]');
    expect(info).not.toBeNull();
    expect(info?.textContent?.trim()).not.toBe('');
    probe.remove();
  });

  it('keeps the panel inside a 360px viewport (measured, not hardcoded, extents)', () => {
    setViewport(360, 760);
    const { container } = render(<TokenInspector />);
    activate();

    const probe = document.createElement('div');
    document.body.appendChild(probe);
    hover(probe, 300, 700);

    const panel = container.querySelector('[data-part="panel"]') as HTMLElement;
    const left = Number.parseFloat(panel.style.left);
    const top = Number.parseFloat(panel.style.top);

    expect(left).toBeGreaterThanOrEqual(0);
    expect(left + PANEL_WIDTH).toBeLessThanOrEqual(360);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top + PANEL_HEIGHT).toBeLessThanOrEqual(760);
    probe.remove();
  });

  it('reports the capped row count instead of dropping tokens silently', () => {
    const { container } = render(<TokenInspector />);
    activate();

    const probe = document.createElement('div');
    document.body.appendChild(probe);
    // Every sampled property returns a non-skipped value, so the collector
    // overshoots the display cap.
    const computedSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => 'rgb(1, 2, 3)',
    } as unknown as CSSStyleDeclaration);

    hover(probe, 100, 100);
    computedSpy.mockRestore();

    const rows = container.querySelectorAll('[data-part="token-row"]');
    expect(rows.length).toBe(20);

    const footer = container.querySelector('[data-part="footer"]') as HTMLElement;
    expect(footer.getAttribute('data-truncated')).toBe('true');
    expect(footer.textContent).not.toContain('{shown}');
    expect(footer.textContent).not.toContain('{total}');
    expect(footer.textContent).toContain('20');
    probe.remove();
  });

  it('marks the footer untruncated and omits the count when everything fits', () => {
    const { container } = render(<TokenInspector />);
    activate();
    const footer = container.querySelector('[data-part="footer"]') as HTMLElement;
    expect(footer.getAttribute('data-truncated')).toBe('false');
    expect(footer.textContent).toContain('Ctrl+Shift+T');
  });

  it('makes the scrollable panel keyboard-focusable only once pinned', () => {
    const { container } = render(<TokenInspector />);
    activate();
    const panel = () => container.querySelector('[data-part="panel"]') as HTMLElement;
    expect(panel().getAttribute('tabindex')).toBeNull();

    act(() => {
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(click, 'target', { value: document.body, configurable: true });
      document.dispatchEvent(click);
    });

    expect(panel().getAttribute('data-pinned')).toBe('true');
    expect(panel().getAttribute('tabindex')).toBe('0');
  });

  it('walks Escape back one level: unpin, then close', () => {
    const { container } = render(<TokenInspector />);
    activate();
    act(() => {
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(click, 'target', { value: document.body, configurable: true });
      document.dispatchEvent(click);
    });
    expect(container.querySelector('[data-pinned="true"]')).not.toBeNull();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(container.querySelector('[data-part="panel"]')).not.toBeNull();
    expect(container.querySelector('[data-pinned="false"]')).not.toBeNull();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(container.querySelector('[data-part="panel"]')).toBeNull();
  });
});
