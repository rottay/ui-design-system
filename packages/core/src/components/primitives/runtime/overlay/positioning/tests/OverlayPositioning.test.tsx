import React, { useState } from 'react';
import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import {
  OverlayPortalBoundary,
  overlayCapabilities,
  normalizeOverlayPlacement,
  OVERLAY_PLACEMENT_ALIASES,
  useOverlayPosition,
  type OverlayInlineSideResolution,
  type OverlayPlacement,
  type OverlayPlacementInput,
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
  /** `'ar'` drives the direction authority to RTL; omitted means LTR. */
  locale?: 'en' | 'ar';
  placement?: OverlayPlacementInput;
  /** Omitted means the frozen adopters' path: the runtime's physical default. */
  inlineSides?: OverlayInlineSideResolution;
  offset?: number;
  flip?: boolean;
  boundary?: 'viewport' | HTMLElement;
  anchorRect?: Partial<DOMRect>;
  overlayRect?: Partial<DOMRect>;
  onResult: (result: OverlayPositionResult, elements: { anchor: HTMLElement | null; overlay: HTMLElement | null }) => void;
}

function Harness({
  placement = 'top',
  inlineSides,
  offset,
  flip,
  boundary,
  anchorRect = { top: 100, left: 100, right: 140, bottom: 120, width: 40, height: 20 },
  overlayRect = { width: 100, height: 30 },
  onResult,
}: HarnessProps): React.ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [overlay, setOverlay] = useState<HTMLElement | null>(null);
  const result = useOverlayPosition({
    anchor,
    overlay,
    placement,
    offset,
    flip,
    boundary,
    ...(inlineSides === undefined ? {} : { inlineSides }),
  });
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
  const { locale, ...harnessProps } = props;
  const tree = (
    <Harness
      {...harnessProps}
      onResult={(result, elements) => {
        captured.result = result;
        captured.anchor = elements.anchor;
        captured.overlay = elements.overlay;
      }}
    />
  );
  const view = render(
    locale === undefined ? tree : <I18nProvider locale={locale}>{tree}</I18nProvider>,
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

  it('mirrors a logical side against the direction authority when the caller declares one', () => {
    // A centred anchor (40x20 at x 300..340) so neither side overflows and the
    // flip chain stays out of the measurement. Overlay 100 wide, offset 8.
    // LTR: inline-start is the physical left -> 300 - 8 - 100 = 192.
    // RTL: inline-start is the physical right -> 340 + 8 = 348.
    const centred = { top: 100, left: 300, right: 340, bottom: 120, width: 40, height: 20 };

    const ltr = renderHarness({
      placement: 'inline-start',
      inlineSides: 'logical',
      anchorRect: centred,
    });
    expect(ltr.captured.result?.style.left).toBe(192);
    cleanup();

    const rtl = renderHarness({
      placement: 'inline-start',
      inlineSides: 'logical',
      anchorRect: centred,
      locale: 'ar',
    });
    expect(rtl.captured.result?.style.left).toBe(348);
    cleanup();

    // The other side mirrors the other way, so the pair discriminates
    // direction rather than just naming an edge.
    const inlineEndLtr = renderHarness({
      placement: 'inline-end',
      inlineSides: 'logical',
      anchorRect: centred,
    });
    expect(inlineEndLtr.captured.result?.style.left).toBe(348);
    cleanup();

    const inlineEndRtl = renderHarness({
      placement: 'inline-end',
      inlineSides: 'logical',
      anchorRect: centred,
      locale: 'ar',
    });
    expect(inlineEndRtl.captured.result?.style.left).toBe(192);
  });

  it('keeps an undeclared request on the physical edge in BOTH directions (frozen default)', () => {
    // The frozen Classic/Rustic adopters call this hook with no `inlineSides`.
    // Under RTL the mirroring branch would put `inline-start` at 348; the
    // default must stay at 192, which is where every one of them has always
    // painted. Both spellings are checked, because an alias and its logical
    // name are the same request by the time the runtime sees them.
    const centred = { top: 100, left: 300, right: 340, bottom: 120, width: 40, height: 20 };

    for (const placement of ['inline-start', 'left'] as const) {
      const ltr = renderHarness({ placement, anchorRect: centred });
      expect(ltr.captured.result?.style.left).toBe(192);
      cleanup();

      const rtl = renderHarness({ placement, anchorRect: centred, locale: 'ar' });
      expect(rtl.captured.result?.style.left).toBe(192);
      cleanup();
    }

    for (const placement of ['inline-end', 'right'] as const) {
      const ltr = renderHarness({ placement, anchorRect: centred });
      expect(ltr.captured.result?.style.left).toBe(348);
      cleanup();

      const rtl = renderHarness({ placement, anchorRect: centred, locale: 'ar' });
      expect(rtl.captured.result?.style.left).toBe(348);
      cleanup();
    }
  });

  it('resolves an alias and its logical name identically under one resolution', () => {
    // The alias map is a SPELLING change. Whatever the resolution, `left` and
    // `inline-start` have to land on the same pixel, or the deprecation is
    // quietly a second geometry.
    const centred = { top: 100, left: 300, right: 340, bottom: 120, width: 40, height: 20 };
    const resolutions: readonly OverlayInlineSideResolution[] = ['physical', 'logical'];

    for (const inlineSides of resolutions) {
      for (const locale of ['en', 'ar'] as const) {
        for (const [alias, logical] of Object.entries(OVERLAY_PLACEMENT_ALIASES)) {
          const viaAlias = renderHarness({
            placement: alias as OverlayPlacementInput,
            inlineSides,
            locale,
            anchorRect: centred,
          });
          const aliasLeft = viaAlias.captured.result?.style.left;
          cleanup();

          const viaLogical = renderHarness({
            placement: logical,
            inlineSides,
            locale,
            anchorRect: centred,
          });
          expect(aliasLeft).toBe(viaLogical.captured.result?.style.left);
          cleanup();
        }
      }
    }
  });

  it('flips a physically resolved side on overflow exactly as it always did', () => {
    // Collision handling is downstream of the resolution: once the side is an
    // edge, the arithmetic is the physical arithmetic. An `inline-start` with no
    // room on the left flips right in BOTH directions under the default.
    const crowded = { top: 100, left: 20, right: 60, bottom: 120, width: 40, height: 20 };

    const ltr = renderHarness({ placement: 'inline-start', anchorRect: crowded });
    expect(ltr.captured.result?.style.left).toBe(68);
    cleanup();

    const rtl = renderHarness({ placement: 'inline-start', anchorRect: crowded, locale: 'ar' });
    expect(rtl.captured.result?.style.left).toBe(68);
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
      // No resolution declared: the physical family, margin included.
      marginBottom: 8,
    });
    expect(captured.result?.style.top).toBeUndefined();
    expect(captured.result?.style.left).toBeUndefined();
  });

  it('maps aligned and inline placements onto position-area spans', () => {
    forceAnchorBranch();
    const bottomStart = renderHarness({ placement: 'bottom-start', inlineSides: 'logical' });
    expect(bottomStart.captured.result?.style.positionArea).toBe('bottom span-right');
    expect(bottomStart.captured.result?.style.marginBlockStart).toBe(8);

    const inlineStartEnd = renderHarness({
      placement: 'inline-start-end',
      inlineSides: 'logical',
    });
    expect(inlineStartEnd.captured.result?.style.positionArea).toBe(
      'self-inline-start span-self-block-start',
    );
    expect(inlineStartEnd.captured.result?.style.positionTryFallbacks).toBe(
      'flip-inline, flip-block, flip-inline flip-block',
    );
    expect(inlineStartEnd.captured.result?.style.marginInlineEnd).toBe(8);
  });

  it('lowers every placement to one position-area keyword family, per resolution', () => {
    forceAnchorBranch();
    // A `position-area` value may not mix keyword families, and the offset
    // margin has to be spelled in the same family as the area it sits beside.
    // Under `'logical'` the inline placements are wholly `self-*`, so the
    // overlay's own writing mode resolves BOTH; under the physical default they
    // are wholly physical, so nothing consults a writing mode at all. The
    // block-axis placements are physical in both (`top span-right`).
    const logicalCases: ReadonlyArray<[OverlayPlacement, string]> = [
      ['top', 'top'],
      ['top-start', 'top span-right'],
      ['top-end', 'top span-left'],
      ['bottom', 'bottom'],
      ['bottom-start', 'bottom span-right'],
      ['bottom-end', 'bottom span-left'],
      ['inline-start', 'self-inline-start'],
      ['inline-start-start', 'self-inline-start span-self-block-end'],
      ['inline-start-end', 'self-inline-start span-self-block-start'],
      ['inline-end', 'self-inline-end'],
      ['inline-end-start', 'self-inline-end span-self-block-end'],
      ['inline-end-end', 'self-inline-end span-self-block-start'],
    ];
    for (const [placement, area] of logicalCases) {
      const rendered = renderHarness({ placement, inlineSides: 'logical' });
      expect(rendered.captured.result?.style.positionArea).toBe(area);
      cleanup();
    }

    // The physical table, value for value, is what this runtime emitted before
    // the logical vocabulary existed. It is the frozen engines' geometry.
    const physicalCases: ReadonlyArray<[OverlayPlacement, string]> = [
      ['top', 'top'],
      ['top-start', 'top span-right'],
      ['top-end', 'top span-left'],
      ['bottom', 'bottom'],
      ['bottom-start', 'bottom span-right'],
      ['bottom-end', 'bottom span-left'],
      ['inline-start', 'left'],
      ['inline-start-start', 'left span-bottom'],
      ['inline-start-end', 'left span-top'],
      ['inline-end', 'right'],
      ['inline-end-start', 'right span-bottom'],
      ['inline-end-end', 'right span-top'],
    ];
    for (const [placement, area] of physicalCases) {
      const rendered = renderHarness({ placement });
      expect(rendered.captured.result?.style.positionArea).toBe(area);
      cleanup();
    }
  });

  it('keeps the offset margin in the same keyword family as the area', () => {
    forceAnchorBranch();
    // A logical margin beside a physical `left` area is the defect this pair
    // exists to exclude: the area would pin the overlay left while the margin
    // resolved in the overlay's writing mode and put the gap on the far side
    // under RTL.
    const physical = renderHarness({ placement: 'inline-start' });
    expect(physical.captured.result?.style).toMatchObject({
      positionArea: 'left',
      marginRight: 8,
    });
    expect(physical.captured.result?.style.marginInlineEnd).toBeUndefined();
    cleanup();

    const logical = renderHarness({ placement: 'inline-start', inlineSides: 'logical' });
    expect(logical.captured.result?.style).toMatchObject({
      positionArea: 'self-inline-start',
      marginInlineEnd: 8,
    });
    expect(logical.captured.result?.style.marginRight).toBeUndefined();
  });

  it('accepts the deprecated physical placements through the documented alias map', () => {
    forceAnchorBranch();
    expect(Object.keys(OVERLAY_PLACEMENT_ALIASES)).toHaveLength(6);
    expect(OVERLAY_PLACEMENT_ALIASES).toEqual({
      left: 'inline-start',
      'left-start': 'inline-start-start',
      'left-end': 'inline-start-end',
      right: 'inline-end',
      'right-start': 'inline-end-start',
      'right-end': 'inline-end-end',
    });
    // Idempotent: a logical placement passes through unchanged.
    expect(normalizeOverlayPlacement('inline-end-start')).toBe('inline-end-start');

    const resolutions: readonly OverlayInlineSideResolution[] = ['physical', 'logical'];
    for (const inlineSides of resolutions) {
      for (const [legacy, logical] of Object.entries(OVERLAY_PLACEMENT_ALIASES)) {
        expect(normalizeOverlayPlacement(legacy as OverlayPlacementInput)).toBe(logical);
        const viaAlias = renderHarness({
          placement: legacy as OverlayPlacementInput,
          inlineSides,
        });
        const aliasArea = viaAlias.captured.result?.style.positionArea;
        const aliasMargins = {
          marginLeft: viaAlias.captured.result?.style.marginLeft,
          marginRight: viaAlias.captured.result?.style.marginRight,
          marginInlineStart: viaAlias.captured.result?.style.marginInlineStart,
          marginInlineEnd: viaAlias.captured.result?.style.marginInlineEnd,
        };
        cleanup();
        const viaLogical = renderHarness({ placement: logical, inlineSides });
        expect(aliasArea).toBe(viaLogical.captured.result?.style.positionArea);
        expect(aliasMargins).toEqual({
          marginLeft: viaLogical.captured.result?.style.marginLeft,
          marginRight: viaLogical.captured.result?.style.marginRight,
          marginInlineStart: viaLogical.captured.result?.style.marginInlineStart,
          marginInlineEnd: viaLogical.captured.result?.style.marginInlineEnd,
        });
        cleanup();
      }
    }
  });

  it('never consults the reading direction under the physical default', () => {
    forceAnchorBranch();
    // The anchor-css branch cannot be measured in this DOM, so the evidence is
    // the emitted value: a physical `position-area` plus a physical margin
    // names its edge outright, and an `ar` locale changes not one byte of it.
    const ltr = renderHarness({ placement: 'inline-start-end' });
    const rtl = renderHarness({ placement: 'inline-start-end', locale: 'ar' });

    expect(ltr.captured.result?.style.positionArea).toBe('left span-top');
    expect(rtl.captured.result?.style.positionArea).toBe('left span-top');
    expect(ltr.captured.result?.style.marginRight).toBe(8);
    expect(rtl.captured.result?.style.marginRight).toBe(8);
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
