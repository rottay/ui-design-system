import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernPopconfirm from '../engines/modern';
import RusticPopconfirm from '../engines/rustic';
import {
  OverlayPortalBoundary,
  overlayCapabilities,
} from '../../../runtime/overlay/positioning';

const ORIGINAL_CAPABILITIES = { ...overlayCapabilities };
const RUSTIC_SURFACE_SELECTOR = ".rottay-popconfirm--rustic[data-part='surface']";

afterEach(() => {
  Object.assign(overlayCapabilities, ORIGINAL_CAPABILITIES);
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
  vi.restoreAllMocks();
});

function forceAnchorBranch(): { showPopover: ReturnType<typeof vi.fn> } {
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

function modernSurfaceFor(titleText: string): HTMLElement {
  return screen.getByText(titleText).closest('[data-part="surface"]') as HTMLElement;
}

describe('ModernPopconfirm positioning branches', () => {
  it('js branch: stays in-tree (never portals) and stamps the strategy', () => {
    render(
      <ModernPopconfirm title="Delete item?" open>
        <button type="button">Delete</button>
      </ModernPopconfirm>,
    );

    const surface = modernSurfaceFor('Delete item?');
    expect(surface).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(surface).not.toHaveAttribute('popover');
    // Checkpoint contract P4 (OverlayBatch.contract.test.tsx): the modern
    // engine never portals -- the panel stays a descendant of the trigger.
    const trigger = surface.closest('[data-part="trigger"]');
    expect(trigger).not.toBeNull();
    expect(trigger?.contains(surface)).toBe(true);
  });

  it('anchor-css branch: promotes the panel via the popover API in place, with anchor attributes', () => {
    const { showPopover } = forceAnchorBranch();

    render(
      <ModernPopconfirm title="Delete item?" open>
        <button type="button">Delete</button>
      </ModernPopconfirm>,
    );

    const surface = modernSurfaceFor('Delete item?');
    expect(surface).toHaveAttribute('data-ds-position-strategy', 'anchor-css');
    // Still in-tree: the top layer promotes paint order, not DOM position.
    const trigger = surface.closest('[data-part="trigger"]') as HTMLElement;
    expect(trigger.contains(surface)).toBe(true);
    const anchorName = trigger.getAttribute('data-ds-anchor');
    expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
    expect(trigger.style.getPropertyValue('anchor-name')).toBe(anchorName);
    expect(surface.getAttribute('popover')).toBe('manual');
    expect(showPopover).toHaveBeenCalled();
  });

  it('nested-chain rule: an ancestor portal boundary forces the js branch', () => {
    forceAnchorBranch();

    render(
      <OverlayPortalBoundary>
        <ModernPopconfirm title="Delete item?" open>
          <button type="button">Delete</button>
        </ModernPopconfirm>
      </OverlayPortalBoundary>,
    );

    const surface = modernSurfaceFor('Delete item?');
    expect(surface).toHaveAttribute('data-ds-position-strategy', 'js');
  });
});

describe('RusticPopconfirm positioning branches', () => {
  it('js branch: renders through the overlay portal and stamps the strategy', () => {
    const { container } = render(
      <RusticPopconfirm title="Delete item?" open>
        <button type="button">Delete</button>
      </RusticPopconfirm>,
    );

    const surface = document.querySelector(RUSTIC_SURFACE_SELECTOR) as HTMLElement;
    expect(surface).not.toBeNull();
    expect(container.contains(surface)).toBe(false);
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
    expect(surface).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(surface).not.toHaveAttribute('popover');
  });

  it('anchor-css branch: promotes to the top layer while staying portaled, with anchor attributes', () => {
    const { showPopover } = forceAnchorBranch();

    const { container } = render(
      <RusticPopconfirm title="Delete item?" open>
        <button type="button">Delete</button>
      </RusticPopconfirm>,
    );

    const surface = document.querySelector(RUSTIC_SURFACE_SELECTOR) as HTMLElement;
    expect(surface).toHaveAttribute('data-ds-position-strategy', 'anchor-css');
    // Portal posture is preserved in BOTH branches (checkpoint contract P4:
    // Popconfirm rustic always portals) -- top-layer promotion is
    // DOM-position-agnostic, so portaling ahead of it costs nothing.
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
    expect(surface.getAttribute('popover')).toBe('manual');
    expect(showPopover).toHaveBeenCalled();

    const anchor = container.querySelector("[data-part='trigger']") as HTMLElement;
    const anchorName = anchor.getAttribute('data-ds-anchor');
    expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
    expect(anchor.style.getPropertyValue('anchor-name')).toBe(anchorName);
  });

  it('nested-chain rule: a portal-rendered ancestor forces the js branch', () => {
    forceAnchorBranch();

    render(
      <OverlayPortalBoundary>
        <RusticPopconfirm title="Delete item?" open>
          <button type="button">Delete</button>
        </RusticPopconfirm>
      </OverlayPortalBoundary>,
    );

    const surface = document.querySelector(RUSTIC_SURFACE_SELECTOR) as HTMLElement;
    expect(surface).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
  });
});
