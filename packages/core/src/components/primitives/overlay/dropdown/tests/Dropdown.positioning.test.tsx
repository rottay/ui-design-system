import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dropdown as RusticDropdown } from '../engines/rustic';
import {
  OverlayPortalBoundary,
  overlayCapabilities,
} from '../../../runtime/overlay/positioning';

const ORIGINAL_CAPABILITIES = { ...overlayCapabilities };

const MENU = {
  items: [
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete', danger: true },
  ],
};

afterEach(() => {
  cleanup();
  Object.assign(overlayCapabilities, ORIGINAL_CAPABILITIES);
  vi.restoreAllMocks();
});

describe('Rustic Dropdown positioning branches', () => {
  it('js branch: renders through the overlay portal and stamps the strategy', () => {
    render(
      <RusticDropdown open menu={MENU}>
        <button type="button">Actions</button>
      </RusticDropdown>,
    );

    const menuEl = screen.getByRole('menu');
    expect(menuEl).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(menuEl.closest('[data-rottay-portal]')).not.toBeNull();
    expect(menuEl).toHaveAttribute('data-part', 'surface');
    expect(menuEl).not.toHaveAttribute('popover');
  });

  it('anchor-css branch: renders inline in the top layer with anchor attributes', () => {
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

    try {
      const { container } = render(
        <RusticDropdown open menu={MENU}>
          <button type="button">Actions</button>
        </RusticDropdown>,
      );

      const menuEl = screen.getByRole('menu');
      expect(menuEl).toHaveAttribute('data-ds-position-strategy', 'anchor-css');
      // Portal is bypassed: the menu renders inline (top layer), not portalled.
      expect(menuEl.closest('[data-rottay-portal]')).toBeNull();

      const anchor = container.querySelector('[data-part="trigger"]') as HTMLElement;
      expect(anchor).not.toBeNull();
      const anchorName = anchor.getAttribute('data-ds-anchor');
      expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
      expect(anchor.style.getPropertyValue('anchor-name')).toBe(anchorName);
      expect(menuEl.getAttribute('popover')).toBe('manual');
      expect(showPopover).toHaveBeenCalled();
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
      delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
    }
  });

  it('nested-chain rule: a portal-rendered ancestor forces the js branch', () => {
    Object.assign(overlayCapabilities, { anchorPositioning: true, topLayer: true });

    render(
      <OverlayPortalBoundary>
        <RusticDropdown open menu={MENU}>
          <button type="button">Actions</button>
        </RusticDropdown>
      </OverlayPortalBoundary>,
    );

    const menuEl = screen.getByRole('menu');
    expect(menuEl).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(menuEl.closest('[data-rottay-portal]')).not.toBeNull();
  });
});
