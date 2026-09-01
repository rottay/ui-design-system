import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernHoverCard from '../engines/modern';
import RusticHoverCard from '../engines/rustic';
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

const MODERN_SURFACE_SELECTOR = ".rottay-hover-card--modern [data-part='surface']";
const RUSTIC_SURFACE_SELECTOR = ".rottay-hover-card--rustic[data-part='surface']";
const TRIGGER_SELECTOR = "[data-part='trigger']";

describe('ModernHoverCard positioning branches', () => {
  it('js branch: renders in-tree and stamps the strategy', () => {
    const { container } = render(
      <ModernHoverCard open content="Card content" trigger={<button type="button">Trigger</button>} />,
    );

    const surface = container.querySelector(MODERN_SURFACE_SELECTOR) as HTMLElement;
    expect(surface).not.toBeNull();
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(surface.hasAttribute('popover')).toBe(false);
    // Modern never portals, in either branch (checkpoint contract P4).
    expect(surface.closest('[data-rottay-portal]')).toBeNull();
  });

  it('anchor-css branch: promotes to the top layer in-tree with anchor attributes', () => {
    const { showPopover } = forceAnchorBranch();

    const { container } = render(
      <ModernHoverCard open content="Card content" trigger={<button type="button">Trigger</button>} />,
    );

    const surface = container.querySelector(MODERN_SURFACE_SELECTOR) as HTMLElement;
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('anchor-css');
    expect(surface.closest('[data-rottay-portal]')).toBeNull();
    expect(surface.getAttribute('popover')).toBe('manual');
    expect(showPopover).toHaveBeenCalled();

    const anchor = container.querySelector(TRIGGER_SELECTOR) as HTMLElement;
    const anchorName = anchor.getAttribute('data-ds-anchor');
    expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
    expect(anchor.style.getPropertyValue('anchor-name')).toBe(anchorName);
  });
});

describe('RusticHoverCard positioning branches', () => {
  it('js branch: renders through the overlay portal and stamps the strategy', () => {
    const { container } = render(
      <RusticHoverCard open content="Card content" trigger={<button type="button">Trigger</button>} />,
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
      <RusticHoverCard open content="Card content" trigger={<button type="button">Trigger</button>} />,
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
        <RusticHoverCard open content="Card content" trigger={<button type="button">Trigger</button>} />
      </OverlayPortalBoundary>,
    );

    const surface = document.querySelector(RUSTIC_SURFACE_SELECTOR) as HTMLElement;
    expect(surface.getAttribute('data-ds-position-strategy')).toBe('js');
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
  });
});
