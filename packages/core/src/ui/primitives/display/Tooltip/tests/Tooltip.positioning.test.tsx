import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernTooltip from '../engines/modern';
import {
  OverlayPortalBoundary,
  overlayCapabilities,
} from '../../../runtime/overlay/positioning';

const ORIGINAL_CAPABILITIES = { ...overlayCapabilities };

afterEach(() => {
  Object.assign(overlayCapabilities, ORIGINAL_CAPABILITIES);
  vi.restoreAllMocks();
});

describe('ModernTooltip positioning branches', () => {
  it('js branch: renders through the overlay portal and stamps the strategy', () => {
    render(
      <ModernTooltip content="Measured branch" visible>
        <button type="button">Action</button>
      </ModernTooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(tooltip.closest('[data-rottay-portal]')).not.toBeNull();
    expect(tooltip).toHaveAttribute('data-part', 'bubble');
    expect(tooltip).not.toHaveAttribute('popover');
  });

  it('anchor-css branch: renders inline in the top layer with anchor attributes', async () => {
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
      render(
        <ModernTooltip content="Top layer branch" visible>
          <button type="button">Action</button>
        </ModernTooltip>,
      );

      const tooltip = screen.getByRole('tooltip');
      // The measured geometry lands in a rAF callback; waitFor keeps those
      // state updates inside act() instead of warning after the test body.
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('data-ds-position-strategy', 'anchor-css');
      });
      // Portal is bypassed: the bubble stays inside the anchor wrapper.
      expect(tooltip.closest('[data-rottay-portal]')).toBeNull();
      const wrapper = tooltip.closest('[data-part="root"]') as HTMLElement;
      expect(wrapper).not.toBeNull();
      const anchorName = wrapper.getAttribute('data-ds-anchor');
      expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
      expect(wrapper.style.getPropertyValue('anchor-name')).toBe(anchorName);
      expect(tooltip.getAttribute('popover')).toBe('manual');
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
        <ModernTooltip content="Nested under a portal parent" visible>
          <button type="button">Action</button>
        </ModernTooltip>
      </OverlayPortalBoundary>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('data-ds-position-strategy', 'js');
    expect(tooltip.closest('[data-rottay-portal]')).not.toBeNull();
  });
});
