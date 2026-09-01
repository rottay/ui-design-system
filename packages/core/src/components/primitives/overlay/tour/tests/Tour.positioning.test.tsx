import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernTour from '../engines/modern';
import RusticTour from '../engines/rustic';
import { overlayCapabilities } from '../../../runtime/overlay/positioning';

const ORIGINAL_CAPABILITIES = { ...overlayCapabilities };

function forceAnchorCapabilities(): { showPopover: ReturnType<typeof vi.fn> } {
  Object.assign(overlayCapabilities, { anchorPositioning: true, topLayer: true });
  const showPopover = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    writable: true,
    value: showPopover,
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
  return { showPopover };
}

afterEach(() => {
  Object.assign(overlayCapabilities, ORIGINAL_CAPABILITIES);
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
  vi.restoreAllMocks();
});

interface MutableRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function stubRect(element: HTMLElement, rect: MutableRect): void {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      ({
        x: rect.left,
        y: rect.top,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
        toJSON: () => ({}),
      }) as DOMRect,
  });
}

const MODERN_SURFACE = ".rottay-tour--modern [data-part='surface']";
const RUSTIC_SURFACE = ".rottay-tour--rustic [data-part='surface']";

function renderTour(
  Engine: typeof ModernTour,
  rect: MutableRect | null,
): { target: HTMLElement | null } {
  const steps = rect ? [{ target: '#tour-target', title: 'Step' }] : [{ title: 'Step' }];
  render(
    <div>
      {rect && (
        <div
          id="tour-target"
          ref={(node) => {
            if (node) stubRect(node, rect);
          }}
        >
          Target
        </div>
      )}
      <Engine open steps={steps} />
    </div>,
  );
  return { target: document.getElementById('tour-target') };
}

describe.each([
  ['modern', ModernTour, MODERN_SURFACE],
  ['rustic', RusticTour, RUSTIC_SURFACE],
] as const)('Tour %s engine positioning', (_engine, Engine, surfaceSelector) => {
  it('stays on the measured branch even when anchor capabilities exist, and never mutates the app-owned target', () => {
    const { showPopover } = forceAnchorCapabilities();
    const { target } = renderTour(Engine, { top: 40, left: 60, width: 180, height: 32 });

    const surface = document.querySelector(surfaceSelector) as HTMLElement;
    expect(surface).not.toBeNull();
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(surface.hasAttribute('popover')).toBe(false);
    expect(showPopover).not.toHaveBeenCalled();

    // Tour anchors to app-owned DOM it does not render: the target element
    // must come out untouched (no anchor-name registration, no anchor attrs).
    expect(target!.hasAttribute('data-ds-anchor')).toBe(false);
    expect(target!.style.getPropertyValue('anchor-name')).toBe('');
  });

  it('covers the target with the padded spotlight cutout and places the surface through the shared runtime', () => {
    renderTour(Engine, { top: 40, left: 60, width: 180, height: 32 });

    const spotlight = document.querySelector(
      `[data-part='root'] > [data-part='spotlight']`,
    ) as HTMLElement;
    expect(spotlight).not.toBeNull();
    expect(spotlight.style.top).toBe('32px');
    expect(spotlight.style.left).toBe('52px');
    expect(spotlight.style.width).toBe('196px');
    expect(spotlight.style.height).toBe('48px');

    const surface = document.querySelector(surfaceSelector) as HTMLElement;
    expect(surface.getAttribute('data-anchored')).toBe('true');
    // Measured branch, placement bottom, offset 16: top = target.bottom + 16.
    // The overlay has zero size under jsdom, so left = target center x.
    expect(surface.style.top).toBe('88px');
    expect(surface.style.left).toBe('150px');
    expect(surface.style.visibility).toBe('');
  });

  it('re-measures cutout and surface together on scroll', () => {
    const rect: MutableRect = { top: 40, left: 60, width: 180, height: 32 };
    renderTour(Engine, rect);

    rect.top = 140;
    fireEvent.scroll(document);

    const spotlight = document.querySelector(
      `[data-part='root'] > [data-part='spotlight']`,
    ) as HTMLElement;
    expect(spotlight.style.top).toBe('132px');

    const surface = document.querySelector(surfaceSelector) as HTMLElement;
    expect(surface.style.top).toBe('188px');
  });

  it('centers in the viewport when the step has no target', () => {
    renderTour(Engine, null);

    expect(document.querySelector(`[data-part='root'] > [data-part='spotlight']`)).toBeNull();

    const surface = document.querySelector(surfaceSelector) as HTMLElement;
    expect(surface.getAttribute('data-anchored')).toBe('false');
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(surface.style.position).toBe('fixed');
    expect(surface.style.top).toBe('50%');
    expect(surface.style.left).toBe('50%');
  });
});
