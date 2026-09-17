/**
 * WO-INV-01 -- the frozen/Modern placement boundary.
 *
 * The logical placement vocabulary is resolved logically on the MODERN path
 * only. The frozen Rustic engines reach the shared positioning runtime by
 * calling `useOverlayPosition` themselves, and they declare no
 * `inlineSides`, so they take its physical default and keep the edge they have
 * always painted on -- in LTR and in RTL, in both positioning strategies.
 *
 * This file pins both halves of that chain, because either one alone is
 * re-breakable in silence:
 *
 *   1. WHAT THE FROZEN ENGINES ASK FOR. Their request carries the family's
 *      placement and no resolution. A future edit that made `useFieldOverlay`
 *      the shared door, or that defaulted the runtime to logical, would move
 *      frozen paint under RTL without touching a frozen file.
 *   2. WHERE THAT REQUEST LANDS. The same request, driven through the real
 *      runtime, resolves to the pre-migration physical edge under both
 *      reading directions.
 *
 * The three families here are the ones the audit named: Rustic HoverCard,
 * Popover and Popconfirm are the frozen engines whose inline placements reach
 * the shared runtime at all. Rustic ContextMenu (`bottom-start`), Dropdown
 * (block axis only) and Tour (`bottom`) place on the block axis, which no
 * reading direction moves.
 */
import React, { useState } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

type PositioningModule = typeof import('../../runtime/overlay/positioning');

interface CapturedRequest {
  placement: string;
  inlineSides?: string;
}

const useOverlayPositionSpy = vi.fn(
  (
    _args: unknown
  ): { strategy: string; style: Record<string, never>; anchorAttrs: Record<string, never> } => ({
    strategy: 'js',
    style: {},
    anchorAttrs: {},
  })
);

vi.mock('../../runtime/overlay/positioning', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useOverlayPosition: (args: unknown) => useOverlayPositionSpy(args),
  };
});

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import RusticHoverCard from '../hover-card/engines/rustic';
import RusticPopover from '../popover/engines/rustic';
import RusticPopconfirm from '../popconfirm/engines/rustic';
import ModernHoverCard from '../hover-card/engines/modern';

/**
 * The UNMOCKED runtime, so half 2 measures the real resolution rather than the
 * spy's stub. `importActual` bypasses the module mock above for this one
 * reference; the hook is still a hook, so it is exercised through a component.
 */
let realUseOverlayPosition: PositioningModule['useOverlayPosition'];
let overlayCapabilities: PositioningModule['overlayCapabilities'];
let originalCapabilities: { anchorPositioning: boolean; topLayer: boolean };

beforeAll(async () => {
  const actual = await vi.importActual<PositioningModule>('../../runtime/overlay/positioning');
  realUseOverlayPosition = actual.useOverlayPosition;
  overlayCapabilities = actual.overlayCapabilities;
  originalCapabilities = { ...overlayCapabilities };
});

afterEach(() => {
  cleanup();
  useOverlayPositionSpy.mockClear();
  Object.assign(overlayCapabilities, originalCapabilities);
});

function lastRequest(): CapturedRequest {
  const call = useOverlayPositionSpy.mock.calls.at(-1)?.[0] as CapturedRequest | undefined;
  expect(call).toBeDefined();
  return call as CapturedRequest;
}

// ---------------------------------------------------------------------------
// 1. What the frozen engines ask for
// ---------------------------------------------------------------------------

describe('frozen Rustic engines declare no inline-side resolution', () => {
  it('HoverCard passes the placement and takes the physical default', () => {
    render(<RusticHoverCard side="left" align="center" content="Card" trigger={<span>T</span>} />);

    const request = lastRequest();
    expect(request.placement).toBe('inline-start');
    expect(request.inlineSides).toBeUndefined();
  });

  it('Popover passes the placement and takes the physical default', () => {
    render(
      <RusticPopover placement="leftTop" content="Panel">
        <button type="button">T</button>
      </RusticPopover>
    );

    const request = lastRequest();
    expect(request.placement).toBe('inline-start-start');
    expect(request.inlineSides).toBeUndefined();
  });

  it('Popconfirm passes the placement and takes the physical default', () => {
    render(
      <RusticPopconfirm placement="rightBottom" title="Sure?">
        <button type="button">T</button>
      </RusticPopconfirm>
    );

    const request = lastRequest();
    expect(request.placement).toBe('inline-end-end');
    expect(request.inlineSides).toBeUndefined();
  });
});

describe('the Modern door declares the logical resolution', () => {
  it('HoverCard reaches the runtime through useFieldOverlay with inlineSides logical', () => {
    // The other half of the boundary. `runtime/overlay/field-overlay` is the
    // only door a Modern engine takes to this runtime, and it is where the
    // logical vocabulary is declared -- once, for all of them. Without this
    // assertion the frozen pins above would also pass on a build where nobody
    // resolves logically at all.
    render(<ModernHoverCard open side="left" align="center" content="Card" trigger={<span>T</span>} />);

    const request = lastRequest();
    expect(request.placement).toBe('inline-start');
    expect(request.inlineSides).toBe('logical');
  });
});

// ---------------------------------------------------------------------------
// 2. Where that request lands, in the real runtime
// ---------------------------------------------------------------------------

/** A centred anchor, so neither side overflows and flip stays out of the measurement. */
const CENTRED_ANCHOR = {
  top: 100,
  left: 300,
  right: 340,
  bottom: 120,
  width: 40,
  height: 20,
} as const;
const OVERLAY_SIZE = { width: 100, height: 30 } as const;
/** anchor.left - offset - overlay.width = 300 - 8 - 100 */
const PHYSICAL_LEFT_EDGE = 192;
/** anchor.right + offset = 340 + 8 */
const PHYSICAL_RIGHT_EDGE = 348;

function stubRect(rect: Record<string, number>): () => DOMRect {
  return () =>
    ({
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
    }) as DOMRect;
}

function RealHarness({
  placement,
  onResult,
}: {
  placement: string;
  onResult: (result: { strategy: string; style: React.CSSProperties }) => void;
}): React.ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [overlay, setOverlay] = useState<HTMLElement | null>(null);
  // Exactly the frozen call shape: anchor, overlay, placement. No resolution.
  const result = realUseOverlayPosition({
    anchor,
    overlay,
    placement: placement as never,
  });
  onResult(result);
  return (
    <div>
      <button
        type="button"
        ref={(node) => {
          if (node && node !== anchor) {
            node.getBoundingClientRect = stubRect({ ...CENTRED_ANCHOR });
            setAnchor(node);
          }
        }}
      >
        anchor
      </button>
      <div
        ref={(node) => {
          if (node && node !== overlay) {
            node.getBoundingClientRect = stubRect({ ...OVERLAY_SIZE });
            (node as HTMLElement & { showPopover: () => void }).showPopover = vi.fn();
            (node as HTMLElement & { hidePopover: () => void }).hidePopover = vi.fn();
            setOverlay(node);
          }
        }}
      />
    </div>
  );
}

function resolveFrozen(placement: string, locale: 'en' | 'ar') {
  const captured: { strategy: string; style: React.CSSProperties } = {
    strategy: '',
    style: {},
  };
  render(
    <I18nProvider locale={locale}>
      <RealHarness
        placement={placement}
        onResult={(result) => {
          captured.strategy = result.strategy;
          captured.style = result.style;
        }}
      />
    </I18nProvider>
  );
  return captured;
}

describe('the frozen request resolves to its established physical edge', () => {
  it.each([
    ['inline-start', PHYSICAL_LEFT_EDGE],
    ['inline-start-start', PHYSICAL_LEFT_EDGE],
    ['inline-end-end', PHYSICAL_RIGHT_EDGE],
  ] as const)('%s lands on the same edge in LTR and RTL (measured branch)', (placement, edge) => {
    const ltr = resolveFrozen(placement, 'en');
    expect(ltr.strategy).toBe('js');
    expect(ltr.style.left).toBe(edge);
    cleanup();

    const rtl = resolveFrozen(placement, 'ar');
    expect(rtl.strategy).toBe('js');
    expect(rtl.style.left).toBe(edge);
  });

  it.each([
    ['inline-start', 'left', 'marginRight'],
    ['inline-start-start', 'left span-bottom', 'marginRight'],
    ['inline-end-end', 'right span-top', 'marginLeft'],
  ] as const)(
    '%s lowers to the physical position-area family in both directions (anchor-css branch)',
    (placement, area, marginKey) => {
      Object.assign(overlayCapabilities, { anchorPositioning: true, topLayer: true });

      for (const locale of ['en', 'ar'] as const) {
        const resolved = resolveFrozen(placement, locale);
        expect(resolved.strategy).toBe('anchor-css');
        expect(resolved.style.positionArea).toBe(area);
        expect(resolved.style[marginKey]).toBe(8);
        cleanup();
      }
    }
  );
});
