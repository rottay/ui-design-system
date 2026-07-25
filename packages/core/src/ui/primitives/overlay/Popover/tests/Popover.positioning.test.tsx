import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernPopover from '../engines/modern';
import RusticPopover from '../engines/rustic';
import {
  OverlayPortalBoundary,
  overlayCapabilities,
} from '../../../runtime/overlay/positioning';

const ORIGINAL_CAPABILITIES = { ...overlayCapabilities };

function forceAnchorBranch(): { showPopover: ReturnType<typeof vi.fn>; hidePopover: ReturnType<typeof vi.fn> } {
  Object.assign(overlayCapabilities, { anchorPositioning: true, topLayer: true });
  const showPopover = vi.fn();
  const hidePopover = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    writable: true,
    value: showPopover,
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    writable: true,
    value: hidePopover,
  });
  return { showPopover, hidePopover };
}

afterEach(() => {
  Object.assign(overlayCapabilities, ORIGINAL_CAPABILITIES);
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
  vi.restoreAllMocks();
});

// Modern keeps a scope wrapper around its surface in both strategies; the
// measured branch projects that wrapper through the shared portal.
const MODERN_SURFACE_SELECTOR = ".rottay-popover--modern [data-part='surface']";
const RUSTIC_SURFACE_SELECTOR = ".rottay-popover--rustic[data-part='surface']";
const TRIGGER_SELECTOR = "[data-part='trigger']";

describe('ModernPopover positioning branches', () => {
  it('js branch: escapes clipping through the shared portal and stamps the strategy', () => {
    const { container } = render(
      <ModernPopover open content="Popover content" title="Popover title">
        <button type="button">Open</button>
      </ModernPopover>,
    );

    const surface = document.querySelector(MODERN_SURFACE_SELECTOR) as HTMLElement;
    expect(surface).not.toBeNull();
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(surface.hasAttribute('popover')).toBe(false);
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
    const trigger = container.querySelector(TRIGGER_SELECTOR) as HTMLElement;
    expect(trigger.contains(surface)).toBe(false);
  });

  it('anchor-css branch: promotes the panel via the popover API in place, with anchor attributes', () => {
    const { showPopover } = forceAnchorBranch();

    const { container } = render(
      <ModernPopover open content="Popover content" title="Popover title">
        <button type="button">Open</button>
      </ModernPopover>,
    );

    const surface = container.querySelector(MODERN_SURFACE_SELECTOR) as HTMLElement;
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('anchor-css');
    // Still in-tree: the top layer promotes paint order, not DOM position.
    expect(surface.closest('[data-rottay-portal]')).toBeNull();
    expect(surface.getAttribute('popover')).toBe('manual');
    expect(showPopover).toHaveBeenCalled();

    const trigger = container.querySelector(TRIGGER_SELECTOR) as HTMLElement;
    expect(trigger.contains(surface)).toBe(true);
    const anchorName = trigger.getAttribute('data-ds-anchor');
    expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
    expect(trigger.style.getPropertyValue('anchor-name')).toBe(anchorName);
  });

  it('nested-chain rule: a portal-rendered ancestor forces the js branch', () => {
    forceAnchorBranch();

    render(
      <OverlayPortalBoundary>
        <ModernPopover open content="Popover content">
          <button type="button">Open</button>
        </ModernPopover>
      </OverlayPortalBoundary>,
    );

    const surface = document.querySelector(MODERN_SURFACE_SELECTOR) as HTMLElement;
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(surface).not.toHaveAttribute('popover');
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
  });
});

describe('RusticPopover positioning branches', () => {
  it('js branch: renders through the overlay portal and stamps the strategy', () => {
    const { container } = render(
      <RusticPopover open content="Popover content" title="Popover title">
        <button type="button">Open</button>
      </RusticPopover>,
    );

    const surface = document.querySelector(RUSTIC_SURFACE_SELECTOR) as HTMLElement;
    expect(surface).not.toBeNull();
    expect(container.contains(surface)).toBe(false);
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(surface.hasAttribute('popover')).toBe(false);
  });

  it('anchor-css branch: promotes to the top layer while staying portaled, with anchor attributes', () => {
    const { showPopover } = forceAnchorBranch();

    const { container } = render(
      <RusticPopover open content="Popover content" title="Popover title">
        <button type="button">Open</button>
      </RusticPopover>,
    );

    const surface = document.querySelector(RUSTIC_SURFACE_SELECTOR) as HTMLElement;
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('anchor-css');
    // The top-layer branch still renders through the shared portal (rustic's
    // existing portal posture is preserved in both branches).
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
    expect(surface.getAttribute('popover')).toBe('manual');
    expect(showPopover).toHaveBeenCalled();

    const anchor = container.querySelector(TRIGGER_SELECTOR) as HTMLElement;
    const anchorName = anchor.getAttribute('data-ds-anchor');
    expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
    expect(anchor.style.getPropertyValue('anchor-name')).toBe(anchorName);
  });

  it('nested-chain rule: a portal-rendered ancestor forces the js branch', () => {
    forceAnchorBranch();

    render(
      <OverlayPortalBoundary>
        <RusticPopover open content="Popover content">
          <button type="button">Open</button>
        </RusticPopover>
      </OverlayPortalBoundary>,
    );

    const surface = document.querySelector(RUSTIC_SURFACE_SELECTOR) as HTMLElement;
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
  });
});
