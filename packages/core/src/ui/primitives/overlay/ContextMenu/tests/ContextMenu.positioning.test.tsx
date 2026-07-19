import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernContextMenu from '../engines/modern';
import RusticContextMenu from '../engines/rustic';
import type { ContextMenuItem } from '../contracts';
import {
  OverlayPortalBoundary,
  overlayCapabilities,
} from '../../../runtime/overlay/positioning';

const ORIGINAL_CAPABILITIES = { ...overlayCapabilities };

const ITEMS: ContextMenuItem[] = [
  { key: 'copy', label: 'Copy' },
  { key: 'delete', label: 'Delete', danger: true },
];

afterEach(() => {
  Object.assign(overlayCapabilities, ORIGINAL_CAPABILITIES);
  vi.restoreAllMocks();
});

/** Right-click the trigger container to open the menu. */
function openMenu(container: HTMLElement): void {
  const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
  fireEvent.contextMenu(trigger);
}

/** The positioned panel, wherever it renders (inline or portalled). */
function surface(): HTMLElement {
  const el = document.querySelector('[data-part="surface"]') as HTMLElement | null;
  if (!el) throw new Error('context menu surface not rendered');
  return el;
}

/** The zero-size pointer anchor, always rendered inline. */
function pointerAnchor(): HTMLElement {
  const el = document.querySelector('[data-part="pointer-anchor"]') as HTMLElement | null;
  if (!el) throw new Error('pointer anchor not rendered');
  return el;
}

/**
 * Force the anchor-css branch: advertise the capabilities and stub the popover
 * API on the prototype (happy-dom ships neither). Returns the showPopover spy.
 */
function forceAnchorBranch(): ReturnType<typeof vi.fn> {
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
  return showPopover;
}

function restorePopover(): void {
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
}

describe('ModernContextMenu positioning branches', () => {
  it('js branch: pins the inline panel with a measured strategy and no popover', () => {
    const { container } = render(
      <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
    );
    openMenu(container);

    const panel = surface();
    expect(panel).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(panel).not.toHaveAttribute('popover');
    // The modern skin scopes rules under the trigger, so the panel is never
    // portalled -- it stays a descendant of the trigger container.
    expect(panel.closest('[data-rottay-portal]')).toBeNull();
    expect(panel.closest('[data-part="trigger"]')).not.toBeNull();
  });

  it('anchor-css branch: promotes to the top layer against a pointer anchor', () => {
    const showPopover = forceAnchorBranch();
    try {
      const { container } = render(
        <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
      );
      openMenu(container);

      const panel = surface();
      expect(panel).toHaveAttribute('data-ds-position-strategy', 'anchor-css');
      expect(panel.getAttribute('popover')).toBe('manual');
      expect(showPopover).toHaveBeenCalled();
      // Popover keeps the DOM position, so the skin's trigger scope still holds.
      expect(panel.closest('[data-part="trigger"]')).not.toBeNull();

      const anchor = pointerAnchor();
      const anchorName = anchor.getAttribute('data-ds-anchor');
      expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
      expect(anchor.style.getPropertyValue('anchor-name')).toBe(anchorName);
    } finally {
      restorePopover();
    }
  });

  it('nested-chain rule: a portal-rendered ancestor forces the js branch', () => {
    Object.assign(overlayCapabilities, { anchorPositioning: true, topLayer: true });
    const { container } = render(
      <OverlayPortalBoundary>
        <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />
      </OverlayPortalBoundary>,
    );
    openMenu(container);

    const panel = surface();
    expect(panel).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(panel).not.toHaveAttribute('popover');
  });
});

describe('RusticContextMenu positioning branches', () => {
  it('js branch: renders through the overlay portal and stamps the strategy', () => {
    const { container } = render(
      <RusticContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
    );
    openMenu(container);

    const panel = surface();
    expect(panel).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(panel.closest('[data-rottay-portal]')).not.toBeNull();
    expect(panel).not.toHaveAttribute('popover');
  });

  it('anchor-css branch: renders inline in the top layer against a pointer anchor', () => {
    const showPopover = forceAnchorBranch();
    try {
      const { container } = render(
        <RusticContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
      );
      openMenu(container);

      const panel = surface();
      expect(panel).toHaveAttribute('data-ds-position-strategy', 'anchor-css');
      expect(panel.getAttribute('popover')).toBe('manual');
      expect(panel.closest('[data-rottay-portal]')).toBeNull();
      expect(showPopover).toHaveBeenCalled();

      const anchor = pointerAnchor();
      const anchorName = anchor.getAttribute('data-ds-anchor');
      expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
      expect(anchor.style.getPropertyValue('anchor-name')).toBe(anchorName);
    } finally {
      restorePopover();
    }
  });

  it('nested-chain rule: a portal-rendered ancestor forces the js branch', () => {
    Object.assign(overlayCapabilities, { anchorPositioning: true, topLayer: true });
    const { container } = render(
      <OverlayPortalBoundary>
        <RusticContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />
      </OverlayPortalBoundary>,
    );
    openMenu(container);

    const panel = surface();
    expect(panel).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(panel.closest('[data-rottay-portal]')).not.toBeNull();
  });
});
