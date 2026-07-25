import React, { useState } from 'react';
import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OverlayPortalBoundary,
  overlayCapabilities,
  useOverlayPosition,
  type OverlayPlacement,
  type OverlayPositionResult,
} from '..';

const ORIGINAL_CAPABILITIES = { ...overlayCapabilities };
const ORIGINAL_VISUAL_VIEWPORT = Object.getOwnPropertyDescriptor(
  window,
  'visualViewport',
);

afterEach(() => {
  cleanup();
  Object.assign(overlayCapabilities, ORIGINAL_CAPABILITIES);
  if (ORIGINAL_VISUAL_VIEWPORT) {
    Object.defineProperty(window, 'visualViewport', ORIGINAL_VISUAL_VIEWPORT);
  } else {
    delete (window as unknown as { visualViewport?: VisualViewport })
      .visualViewport;
  }
});

function forceAnchorBranch(): void {
  Object.assign(overlayCapabilities, { anchorPositioning: true, topLayer: true });
}

function stubRect(rect: Partial<DOMRect>): () => DOMRect {
  const full = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect;
  return () => full;
}

interface HarnessProps {
  placement?: OverlayPlacement;
  offset?: number;
  flip?: boolean;
  boundary?: 'viewport' | HTMLElement;
  anchorRect?: Partial<DOMRect>;
  overlayRect?: Partial<DOMRect>;
  onResult: (result: OverlayPositionResult, elements: { anchor: HTMLElement | null; overlay: HTMLElement | null }) => void;
}

function Harness({
  placement = 'top',
  offset,
  flip,
  boundary,
  anchorRect = { top: 100, left: 100, right: 140, bottom: 120, width: 40, height: 20 },
  overlayRect = { width: 100, height: 30 },
  onResult,
}: HarnessProps): React.ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [overlay, setOverlay] = useState<HTMLElement | null>(null);
  const result = useOverlayPosition({ anchor, overlay, placement, offset, flip, boundary });
  onResult(result, { anchor, overlay });
  return (
    <div>
      <button
        type="button"
        ref={(node) => {
          if (node && node !== anchor) {
            node.getBoundingClientRect = stubRect(anchorRect);
            setAnchor(node);
          }
        }}
      >
        anchor
      </button>
      <div
        data-testid="overlay"
        ref={(node) => {
          if (node && node !== overlay) {
            node.getBoundingClientRect = stubRect(overlayRect);
            (node as HTMLElement & { showPopover: () => void }).showPopover = vi.fn();
            (node as HTMLElement & { hidePopover: () => void }).hidePopover = vi.fn();
            setOverlay(node);
          }
        }}
      />
    </div>
  );
}

function renderHarness(props: Omit<HarnessProps, 'onResult'> = {}) {
  const captured: {
    result: OverlayPositionResult | null;
    anchor: HTMLElement | null;
    overlay: HTMLElement | null;
  } = { result: null, anchor: null, overlay: null };
  const view = render(
    <Harness
      {...props}
      onResult={(result, elements) => {
        captured.result = result;
        captured.anchor = elements.anchor;
        captured.overlay = elements.overlay;
      }}
    />,
  );
  return { captured, view };
}

describe('useOverlayPosition - js branch (native in this DOM environment)', () => {
  it('measures, honors offset/placement math, and positions fixed', () => {
    const { captured } = renderHarness({ placement: 'top', offset: 8 });

    expect(captured.result?.strategy).toBe('js');
    expect(captured.result?.anchorAttrs).toEqual({});
    // anchor 40x20 at (100,100); overlay 100x30; top = 100 - 8 - 30 = 62,
    // left = 100 + 20 - 50 = 70.
    expect(captured.result?.style).toMatchObject({
      position: 'fixed',
      top: 62,
      left: 70,
    });
    expect(captured.result?.style.visibility).toBeUndefined();
  });

  it('flips to the opposite side when the preferred side overflows', () => {
    const { captured } = renderHarness({
      placement: 'top',
      anchorRect: { top: 4, left: 100, right: 140, bottom: 24, width: 40, height: 20 },
    });

    // 4 - 8 - 30 = -34 < margin, so the position flips below: 24 + 8 = 32.
    expect(captured.result?.style.top).toBe(32);
  });

  it('clamps instead of flipping when flip is disabled', () => {
    const { captured } = renderHarness({
      placement: 'top',
      flip: false,
      anchorRect: { top: 4, left: 100, right: 140, bottom: 24, width: 40, height: 20 },
    });

    // No flip: -34 clamps to the boundary margin.
    expect(captured.result?.style.top).toBe(8);
  });

  it('supports side-aligned placements (bottom-start tracks the anchor left edge)', () => {
    const { captured } = renderHarness({ placement: 'bottom-start' });

    expect(captured.result?.style).toMatchObject({ top: 128, left: 100 });
  });

  it('uses the offset visual viewport for diagonal flip and cross-axis shift', () => {
    const addEventListener = vi.fn();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        offsetTop: 50,
        offsetLeft: 100,
        width: 300,
        height: 200,
        addEventListener,
        removeEventListener: vi.fn(),
      } as unknown as VisualViewport,
    });

    const { captured } = renderHarness({
      placement: 'bottom',
      anchorRect: {
        top: 180,
        bottom: 200,
        left: 340,
        right: 380,
        width: 40,
        height: 20,
      },
      overlayRect: { width: 120, height: 80 },
    });

    // Bottom clips below the visible viewport, so it flips above. The
    // cross-axis center is then shifted inside offsetLeft + width.
    expect(captured.result?.style).toMatchObject({ top: 92, left: 272 });
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('does not flip into a side with more overflow when neither side fits', () => {
    const boundary = document.createElement('div');
    boundary.getBoundingClientRect = stubRect({
      top: 0,
      left: 0,
      right: 800,
      bottom: 800,
      width: 800,
      height: 800,
    });
    const { captured } = renderHarness({
      placement: 'top',
      boundary,
      anchorRect: {
        top: 650,
        bottom: 670,
        left: 100,
        right: 140,
        width: 40,
        height: 20,
      },
      overlayRect: { width: 100, height: 700 },
    });

    expect(captured.result?.style.top).toBe(8);
  });
});

describe('useOverlayPosition - anchor-css branch (forced capabilities)', () => {
  it('serializes the anchor positioning styles and stamps the anchor', () => {
    forceAnchorBranch();
    const { captured } = renderHarness({ placement: 'top', offset: 8 });

    expect(captured.result?.strategy).toBe('anchor-css');
    const anchorName = captured.result?.anchorAttrs['data-ds-anchor'];
    expect(anchorName).toMatch(/^--ds-anchor-\d+$/);
    expect(captured.result?.style).toMatchObject({
      position: 'fixed',
      positionAnchor: anchorName,
      positionArea: 'top',
      positionTryFallbacks: 'flip-block, flip-inline, flip-block flip-inline',
      inset: 'auto',
      margin: 0,
      marginBottom: 8,
    });
    expect(captured.result?.style.top).toBeUndefined();
    expect(captured.result?.style.left).toBeUndefined();
  });

  it('maps aligned and horizontal placements onto position-area spans', () => {
    forceAnchorBranch();
    const bottomStart = renderHarness({ placement: 'bottom-start' });
    expect(bottomStart.captured.result?.style.positionArea).toBe('bottom span-right');
    expect(bottomStart.captured.result?.style.marginTop).toBe(8);

    const leftEnd = renderHarness({ placement: 'left-end' });
    expect(leftEnd.captured.result?.style.positionArea).toBe('left span-top');
    expect(leftEnd.captured.result?.style.positionTryFallbacks).toBe(
      'flip-inline, flip-block, flip-inline flip-block',
    );
    expect(leftEnd.captured.result?.style.marginRight).toBe(8);
  });

  it('omits the try-fallback chain when flip is disabled', () => {
    forceAnchorBranch();
    const { captured } = renderHarness({ placement: 'top', flip: false });

    expect(captured.result?.style.positionTryFallbacks).toBeUndefined();
  });

  it('promotes the overlay via the popover API and registers anchor-name imperatively', () => {
    forceAnchorBranch();
    const { captured } = renderHarness({});

    const overlay = captured.overlay as HTMLElement & { showPopover: ReturnType<typeof vi.fn> };
    expect(overlay.getAttribute('popover')).toBe('manual');
    expect(overlay.showPopover).toHaveBeenCalledTimes(1);
    expect(captured.anchor?.style.getPropertyValue('anchor-name')).toBe(
      captured.result?.anchorAttrs['data-ds-anchor'],
    );
  });

  it('demotes the overlay and releases the anchor on unmount', () => {
    forceAnchorBranch();
    const { captured, view } = renderHarness({});
    const overlay = captured.overlay as HTMLElement & { hidePopover: ReturnType<typeof vi.fn> };
    const anchor = captured.anchor as HTMLElement;

    view.unmount();

    expect(overlay.hidePopover).toHaveBeenCalledTimes(1);
    expect(overlay.hasAttribute('popover')).toBe(false);
    expect(anchor.style.getPropertyValue('anchor-name')).toBe('');
  });

  it('allocates deterministic, monotonic anchor names per instance', () => {
    forceAnchorBranch();
    const first = renderHarness({});
    const second = renderHarness({});

    const firstName = first.captured.result?.anchorAttrs['data-ds-anchor'] ?? '';
    const secondName = second.captured.result?.anchorAttrs['data-ds-anchor'] ?? '';
    const firstId = Number(firstName.replace('--ds-anchor-', ''));
    const secondId = Number(secondName.replace('--ds-anchor-', ''));
    expect(firstName).not.toBe(secondName);
    expect(secondId).toBeGreaterThan(firstId);
  });
});

describe('useOverlayPosition - strategy resolution rules', () => {
  it('forces js under an OverlayPortalBoundary even when anchor-capable', () => {
    forceAnchorBranch();
    const captured: { result: OverlayPositionResult | null } = { result: null };
    render(
      <OverlayPortalBoundary>
        <Harness
          onResult={(result) => {
            captured.result = result;
          }}
        />
      </OverlayPortalBoundary>,
    );

    expect(captured.result?.strategy).toBe('js');
    expect(captured.result?.anchorAttrs).toEqual({});
  });

  it('forces js for an element boundary even when anchor-capable', () => {
    forceAnchorBranch();
    const boundaryEl = document.createElement('div');
    boundaryEl.getBoundingClientRect = stubRect({
      top: 0,
      left: 0,
      right: 500,
      bottom: 500,
      width: 500,
      height: 500,
    });
    const { captured } = renderHarness({ boundary: boundaryEl });

    expect(captured.result?.strategy).toBe('js');
  });
});
