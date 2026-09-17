'use client';

/**
 * @fileoverview Overlay positioning engine -- the sixth runtime/overlay owner
 * beside backdrop, dialog-attributes, focus-management, portal, and
 * layer-stack. ONE positioning contract, two branches:
 *
 * - `anchor-css`: CSS anchor positioning + the top layer. The hook stamps
 *   `anchor-name: --ds-anchor-<n>` on the anchor element; the returned style
 *   pins the overlay with `position-anchor`/`position-area` plus a
 *   `position-try-fallbacks` flip chain; the overlay element receives the
 *   `popover` attribute and is promoted via `showPopover()`. Top-layer
 *   rendering is immune to ancestor `overflow: hidden`/`transform`
 *   containing-block traps and needs no z-index escalation, so the portal
 *   runtime is BYPASSED in this branch: adopters render the overlay inline.
 *   `dialog-attributes` and `focus-management` compose unchanged on top.
 * - `js`: the shared measured implementation -- `getBoundingClientRect`,
 *   element ResizeObserver, layout-viewport resize/scroll and visual-viewport
 *   resize/scroll listeners. Adopters render the overlay through
 *   `runtime/overlay/portal`.
 *
 * Branch choice is `overlayCapabilities` (module-scope probe; tests override
 * it to force either branch) PLUS the nested-chain rule: an overlay instance
 * is fully top-layer OR fully portal -- never mixed within one open chain. A
 * child overlay under a portal-rendered parent must not promote to the top
 * layer (it would paint above later portal siblings that belong above it), so
 * portal-branch adopters wrap their portaled subtree in
 * `OverlayPortalBoundary` and the hook forces `js` whenever that depth flag
 * is set. Fully top-layer chains stack in promotion order and render no
 * boundary. The layer-stack owner coordinates z bands for the portal world;
 * this boundary is the seam between the two worlds.
 *
 * An element `boundary` is only expressible in the measured branch, so
 * passing one also forces `js`.
 *
 * PLACEMENT IS LOGICAL (WO-INV-01). The inline sides of `OverlayPlacement` are
 * `inline-start`/`inline-end`, never `left`/`right`: one request means the same
 * thing in both reading directions, and the paint mirrors by construction
 * rather than by a caller's arithmetic. The block sides keep `top`/`bottom`,
 * which no reading direction moves. Each branch honours it in its own
 * currency: `anchor-css` lowers to the `self-*` `position-area` family plus
 * logical offset margins, which CSS resolves against the overlay's own writing
 * mode; `js` resolves the side to a physical edge ONCE, because viewport
 * coordinates are physical by construction. Those are two different readings
 * of "the direction" -- the anchor subtree's declared `dir` versus the app
 * locale -- and a tree where they disagree would paint the SAME request on
 * opposite physical sides in the two branches, so the request carries the
 * direction it is resolved in (`OverlayPositionRequest.direction`, defaulting
 * to the locale) and every consumer of the resulting placement reads that one
 * value. The retired physical spellings survive as documented,
 * deprecated input aliases (see `OVERLAY_PLACEMENT_ALIASES`), so no caller and
 * no frozen engine breaks -- they simply resolve to the logical side.
 *
 * WHAT IS NOT LOGICAL HERE, and why: the `-start`/`-end` ALIGNMENT is the
 * cross axis of the side, and on the block-axis sides that cross axis is the
 * inline one. The adopting engines (Popover, HoverCard, Tooltip) mirror that
 * alignment themselves against the direction they resolve, and their skins key
 * on the physical spelling, so the alignment vocabulary stays physical and is
 * stated as such at every boundary rather than being half-migrated.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import type { TextDirection } from '@/foundation/i18n/kernel/contracts';
import { useOptionalDirection } from '@/infrastructure/runtime/i18n/composition/direction';

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

/**
 * The side an overlay takes relative to its anchor. The block axis keeps
 * `top`/`bottom` -- the reading direction never moves them -- while the inline
 * axis is LOGICAL (`inline-start`/`inline-end`), so one placement request
 * means the same thing in both reading directions and the paint mirrors by
 * construction instead of by a caller's arithmetic.
 */
export type OverlayPlacementSide = 'top' | 'bottom' | 'inline-start' | 'inline-end';

/**
 * Side-align placement vocabulary (the Tooltip set): a side qualified by an
 * optional edge alignment; the bare side centers on the anchor. The trailing
 * segment is the ALIGNMENT (`-start`/`-end`), so `inline-start-end` reads
 * "on the inline-start side, aligned to the anchor's end edge".
 *
 * The alignment axis is deliberately NOT part of this migration: it is the
 * cross axis of the side, the adopting engines (Popover, HoverCard, Tooltip)
 * mirror it themselves against the resolved reading direction, and their skins
 * key on the physical spelling. Only the SIDE is logical here.
 */
export type OverlayPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'inline-start'
  | 'inline-start-start'
  | 'inline-start-end'
  | 'inline-end'
  | 'inline-end-start'
  | 'inline-end-end';

/**
 * The retired PHYSICAL spellings of the inline sides. Accepted on input and
 * mapped through {@link OVERLAY_PLACEMENT_ALIASES}; never produced.
 *
 * @deprecated Pass the logical spelling: `left` -> `inline-start`,
 * `right` -> `inline-end` (and the aligned forms alongside them). The physical
 * names are kept so callers that predate the logical vocabulary -- including
 * the frozen Classic/Rustic engines, which may not be edited -- keep
 * compiling and keep their LTR geometry unchanged. They resolve to the
 * logical side, so under `dir=rtl` they now mirror rather than staying on the
 * physical edge they name.
 */
export type LegacyPhysicalOverlayPlacement =
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/** What a caller may pass: the logical vocabulary, or a deprecated physical alias. */
export type OverlayPlacementInput = OverlayPlacement | LegacyPhysicalOverlayPlacement;

/**
 * The documented migration map. One entry per retired physical spelling; the
 * logical names map to themselves and are absent here on purpose, so the table
 * is exactly the deprecation surface and a test can assert its size.
 */
export const OVERLAY_PLACEMENT_ALIASES: Readonly<
  Record<LegacyPhysicalOverlayPlacement, OverlayPlacement>
> = Object.freeze({
  left: 'inline-start',
  'left-start': 'inline-start-start',
  'left-end': 'inline-start-end',
  right: 'inline-end',
  'right-start': 'inline-end-start',
  'right-end': 'inline-end-end',
});

/**
 * Normalizes a placement request to the logical vocabulary. Anything already
 * logical is returned unchanged, so the call is idempotent and safe to apply
 * at every boundary an adopter owns.
 */
export function normalizeOverlayPlacement(placement: OverlayPlacementInput): OverlayPlacement {
  return (
    (OVERLAY_PLACEMENT_ALIASES as Record<string, OverlayPlacement | undefined>)[placement]
    ?? (placement as OverlayPlacement)
  );
}

/**
 * The PHYSICAL spelling of a resolved placement, for the ONE channel that is
 * still physical: the `data-placement` attribute the Modern skins key on
 * (`[data-placement^='left']` lowers to a physical arrow edge and
 * transform-origin). The skin files are owned elsewhere, so the engines lower
 * here rather than stamping a logical name no selector matches.
 *
 * This is a presentation channel, not a positioning input: the geometry is
 * already decided by the logical placement when this runs, so the value is the
 * physical side that placement RESOLVED to in the given direction, which is
 * exactly what a physical skin selector needs.
 */
export function toPhysicalPlacementAttribute(
  placement: OverlayPlacement,
  direction: TextDirection,
): OverlayPlacementInput {
  const isRtl = direction === 'rtl';
  if (placement.startsWith('inline-start')) {
    return placement.replace('inline-start', isRtl ? 'right' : 'left') as OverlayPlacementInput;
  }
  if (placement.startsWith('inline-end')) {
    return placement.replace('inline-end', isRtl ? 'left' : 'right') as OverlayPlacementInput;
  }
  return placement;
}

export type OverlayPositionStrategy = 'anchor-css' | 'js';

export interface OverlayPositionRequest {
  /** Element the overlay positions against; null while unmounted. */
  anchor: HTMLElement | null;
  /** The positioned overlay element; null while closed/unmounted. */
  overlay: HTMLElement | null;
  /**
   * Logical placement. The deprecated physical spellings (`left`, `right` and
   * their aligned forms) are still accepted and normalized -- see
   * {@link OVERLAY_PLACEMENT_ALIASES}.
   */
  placement: OverlayPlacementInput;
  /** Gap in px between the anchor edge and the overlay. @default 8 */
  offset?: number;
  /** Flip to the opposite side when the preferred side overflows. @default true */
  flip?: boolean;
  /**
   * Overflow boundary for flip and shift. An element boundary is only
   * expressible in the measured branch, so passing one forces `js`.
   * @default 'viewport'
   */
  boundary?: 'viewport' | HTMLElement;
  /**
   * The reading direction THIS request is resolved in -- the one authority for
   * every consumer of the resulting placement.
   *
   * It exists because the two branches read direction from different places by
   * construction: `anchor-css` lowers to the `self-*` `position-area` family,
   * which CSS resolves against the OVERLAY ELEMENT's own writing mode (the
   * anchor subtree's declared `dir`), while `js` has to resolve the logical
   * side into viewport coordinates itself. Left to their defaults those two
   * answers can differ for one tree and one request -- an anchor inside a bare
   * `dir="rtl"` under an LTR app locale is the whole family of cases -- and the
   * same request then paints on opposite physical sides in the two branches.
   * An adopter that already resolves the anchor's direction (the portalled
   * panels: Tooltip, Popover, HoverCard) passes it here, so placement, paint
   * and every stamped attribute are computed against ONE direction.
   *
   * @default the active locale's direction (`useOptionalDirection()`)
   */
  direction?: TextDirection;
}

export interface OverlayPositionResult {
  strategy: OverlayPositionStrategy;
  /**
   * Positioning style for the overlay element. Compose it AFTER the
   * component's own surface styles so the positioning keys win.
   */
  style: CSSProperties;
  /**
   * Serializable attributes for the anchor element: `data-ds-anchor` carries
   * the allocated anchor-name in the anchor-css branch, empty in the js
   * branch. The `anchor-name` CSS registration itself is stamped
   * imperatively on the anchor element (a custom-ident cannot travel through
   * HTML attributes).
   */
  anchorAttrs: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Capability detection (module scope, test-forceable)
// ---------------------------------------------------------------------------

export interface OverlayCapabilities {
  /** CSS anchor positioning: `anchor-name` + `position-try-fallbacks`. */
  anchorPositioning: boolean;
  /** Top-layer promotion via the popover API (`showPopover`). */
  topLayer: boolean;
}

function detectOverlayCapabilities(): OverlayCapabilities {
  try {
    return {
      anchorPositioning:
        typeof CSS !== 'undefined' &&
        typeof CSS.supports === 'function' &&
        CSS.supports('anchor-name: --ds-anchor-probe') &&
        CSS.supports('position-try-fallbacks: flip-block'),
      topLayer:
        typeof HTMLElement !== 'undefined' &&
        typeof HTMLElement.prototype.showPopover === 'function',
    };
  } catch {
    return { anchorPositioning: false, topLayer: false };
  }
}

/**
 * Module-scope capability probe, evaluated once per session. Mutable on
 * purpose: tests assign fields to force either branch and must restore the
 * originals afterwards; production code only reads it.
 */
export const overlayCapabilities: OverlayCapabilities = detectOverlayCapabilities();

// ---------------------------------------------------------------------------
// Nested-chain depth flag
// ---------------------------------------------------------------------------

const OverlayPortalDepthContext = createContext(0);

/**
 * Marks a portal-rendered overlay subtree. Any `useOverlayPosition` call
 * under this boundary resolves `strategy: 'js'`, keeping a chain fully
 * portal once its root is portal-rendered. Top-layer parents render no
 * boundary: fully top-layer chains stack in promotion order.
 */
export function OverlayPortalBoundary({ children }: { children: ReactNode }): React.ReactElement {
  const depth = useContext(OverlayPortalDepthContext);
  return (
    <OverlayPortalDepthContext.Provider value={depth + 1}>
      {children}
    </OverlayPortalDepthContext.Provider>
  );
}

/** Depth of enclosing portal-rendered overlay subtrees (0 = top-layer eligible). */
export function useOverlayPortalDepth(): number {
  return useContext(OverlayPortalDepthContext);
}

// ---------------------------------------------------------------------------
// Placement mapping
// ---------------------------------------------------------------------------

const DEFAULT_OFFSET = 8;
/** Minimum clearance kept between the overlay and the boundary edge (js branch). */
const BOUNDARY_MARGIN = 8;

/**
 * Edge alignment along the side's CROSS axis; `center` is the bare side.
 * Physical on the inline axis by the adopting engines' contract -- see
 * {@link OverlayPlacement}.
 */
export type OverlayPlacementAlign = 'center' | 'start' | 'end';
type PlacementAlign = OverlayPlacementAlign;
/** The physical side the measured branch works in, once direction is resolved. */
type PhysicalSide = 'top' | 'bottom' | 'left' | 'right';

/**
 * Side + alignment per placement, as a TABLE rather than a split on `-`: the
 * logical sides contain the separator themselves (`inline-start-end` is the
 * `inline-start` side aligned to `end`), so a positional split would read
 * `inline` as the side and `start` as the alignment. The table is the only
 * parser, and it is exhaustive by its own type.
 */
const PLACEMENT_PARTS: Readonly<
  Record<OverlayPlacement, readonly [OverlayPlacementSide, PlacementAlign]>
> = Object.freeze({
  top: ['top', 'center'],
  'top-start': ['top', 'start'],
  'top-end': ['top', 'end'],
  bottom: ['bottom', 'center'],
  'bottom-start': ['bottom', 'start'],
  'bottom-end': ['bottom', 'end'],
  'inline-start': ['inline-start', 'center'],
  'inline-start-start': ['inline-start', 'start'],
  'inline-start-end': ['inline-start', 'end'],
  'inline-end': ['inline-end', 'center'],
  'inline-end-start': ['inline-end', 'start'],
  'inline-end-end': ['inline-end', 'end'],
});

function parsePlacement(placement: OverlayPlacement): readonly [OverlayPlacementSide, PlacementAlign] {
  return PLACEMENT_PARTS[placement];
}

/**
 * Public reader for the same table. Adopters must not split on `-`: a logical
 * side contains the separator, so `inline-start` would read as the side
 * `inline` aligned to `start`.
 */
export function parseOverlayPlacement(
  placement: OverlayPlacementInput,
): readonly [OverlayPlacementSide, OverlayPlacementAlign] {
  return PLACEMENT_PARTS[normalizeOverlayPlacement(placement)];
}

/**
 * The physical side a logical side resolves to. Only the MEASURED branch needs
 * this: it computes viewport coordinates, which are physical by construction.
 * The anchor-css branch never calls it -- CSS resolves the logical keywords
 * itself, against the overlay's own writing mode.
 */
function toPhysicalSide(side: OverlayPlacementSide, direction: TextDirection): PhysicalSide {
  if (side === 'top' || side === 'bottom') return side;
  const inlineStartIsLeft = direction !== 'rtl';
  if (side === 'inline-start') return inlineStartIsLeft ? 'left' : 'right';
  return inlineStartIsLeft ? 'right' : 'left';
}

/**
 * `position-area` per placement. Bare sides use the single-keyword form: the
 * cross axis spans all three grid tracks, so the default toward-anchor
 * alignment anchor-centers the overlay WITHOUT false-triggering try
 * fallbacks when the overlay is wider than its anchor (a single-track center
 * region would overflow on every wide overlay). `-start`/`-end` span from
 * the anchor's near edge outward so the default alignment lines the edges
 * up.
 *
 * WHY `self-*` FOR THE INLINE SIDES. `position-area` has three keyword
 * families and a value may not mix them. The plain logical keywords
 * (`inline-start`) resolve against the CONTAINING BLOCK's writing mode, which
 * for a top-layer popover is the initial containing block -- the ROOT
 * element's direction, not the anchor's. The `self-*` keywords resolve against
 * the overlay element's OWN writing mode, which it inherits from the anchor's
 * subtree (the top layer changes painting, not inheritance), and that is also
 * the mode `offsetMargins` below is resolved in. Measured in Chromium 1228:
 * with `dir="rtl"` on a wrapper rather than on `<html>`, `inline-start` left
 * the overlay on the physical left of its anchor while `self-inline-start`
 * mirrored it to the right and kept the gap anchor-facing. So the pair that
 * agrees in every nesting is `self-*` plus logical margins.
 *
 * The block-axis sides stay in the PHYSICAL family (`top`, `span-right`): the
 * reading direction never moves `top`/`bottom`, and the alignment axis of
 * those placements is owned by the adopting engines, which mirror it
 * themselves. One family per value, as the grammar requires.
 */
const POSITION_AREA: Record<OverlayPlacement, string> = {
  top: 'top',
  'top-start': 'top span-right',
  'top-end': 'top span-left',
  bottom: 'bottom',
  'bottom-start': 'bottom span-right',
  'bottom-end': 'bottom span-left',
  'inline-start': 'self-inline-start',
  'inline-start-start': 'self-inline-start span-self-block-end',
  'inline-start-end': 'self-inline-start span-self-block-start',
  'inline-end': 'self-inline-end',
  'inline-end-start': 'self-inline-end span-self-block-end',
  'inline-end-end': 'self-inline-end span-self-block-start',
};

/** Fallbacks flip the placement axis first, then alignment, then both. */
const FLIP_CHAIN: Record<OverlayPlacementSide, string> = {
  top: 'flip-block, flip-inline, flip-block flip-inline',
  bottom: 'flip-block, flip-inline, flip-block flip-inline',
  'inline-start': 'flip-inline, flip-block, flip-inline flip-block',
  'inline-end': 'flip-inline, flip-block, flip-inline flip-block',
};

/**
 * The anchor-facing margin carries the offset gap; try fallbacks mirror
 * margins in the flipped axis, so the gap survives a flip. Every spelling is
 * LOGICAL, resolved in the overlay's own writing mode -- the same mode the
 * `self-*` `position-area` keywords above resolve in, so the gap stays on the
 * anchor-facing edge under `dir=rtl` instead of jumping to the far side.
 */
function offsetMargins(side: OverlayPlacementSide, offset: number): CSSProperties {
  switch (side) {
    case 'top':
      return { marginBlockEnd: offset };
    case 'bottom':
      return { marginBlockStart: offset };
    case 'inline-start':
      return { marginInlineEnd: offset };
    case 'inline-end':
      return { marginInlineStart: offset };
  }
}

// ---------------------------------------------------------------------------
// Measured (js) branch geometry
// ---------------------------------------------------------------------------

interface BoundaryRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

function resolveBoundaryRect(boundary: 'viewport' | HTMLElement): BoundaryRect {
  if (boundary !== 'viewport') {
    const rect = boundary.getBoundingClientRect();
    return { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom };
  }
  // Fixed-position coordinates use the layout viewport, while the actually
  // visible region can be smaller and offset during pinch zoom or while a
  // mobile virtual keyboard is open. Prefer the visual viewport whenever the
  // browser exposes it so collision handling never places an overlay behind
  // chrome that the user cannot currently see.
  const visualViewport = window.visualViewport;
  if (visualViewport) {
    return {
      top: visualViewport.offsetTop,
      left: visualViewport.offsetLeft,
      right: visualViewport.offsetLeft + visualViewport.width,
      bottom: visualViewport.offsetTop + visualViewport.height,
    };
  }
  return {
    top: 0,
    left: 0,
    right: window.innerWidth || document.documentElement.clientWidth,
    bottom: window.innerHeight || document.documentElement.clientHeight,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

interface MeasuredPosition {
  top: number;
  left: number;
}

function overflowAmount(
  start: number,
  size: number,
  minimum: number,
  maximum: number,
): number {
  return Math.max(minimum - start, 0) + Math.max(start + size - maximum, 0);
}

function computeMeasuredPosition(
  anchorRect: DOMRect,
  overlayWidth: number,
  overlayHeight: number,
  placement: OverlayPlacement,
  direction: TextDirection,
  offset: number,
  flip: boolean,
  bounds: BoundaryRect,
): MeasuredPosition {
  const [logicalSide, align] = parsePlacement(placement);
  // Viewport coordinates are physical by construction, so the logical side is
  // resolved against the reading direction ONCE, here, and the collision
  // arithmetic below stays the physical arithmetic it always was.
  const side = toPhysicalSide(logicalSide, direction);
  let top: number;
  let left: number;

  if (side === 'top' || side === 'bottom') {
    const topPosition = anchorRect.top - offset - overlayHeight;
    const bottomPosition = anchorRect.bottom + offset;
    top = side === 'top' ? topPosition : bottomPosition;
    if (align === 'start') {
      left = anchorRect.left;
    } else if (align === 'end') {
      left = anchorRect.right - overlayWidth;
    } else {
      left = anchorRect.left + anchorRect.width / 2 - overlayWidth / 2;
    }

    if (flip) {
      const minimum = bounds.top + BOUNDARY_MARGIN;
      const maximum = bounds.bottom - BOUNDARY_MARGIN;
      const preferredOverflow = overflowAmount(top, overlayHeight, minimum, maximum);
      const opposite = side === 'top' ? bottomPosition : topPosition;
      const oppositeOverflow = overflowAmount(
        opposite,
        overlayHeight,
        minimum,
        maximum,
      );
      // Flip only when the preferred side clips and the opposite side is a
      // genuine improvement. This avoids a jarring diagonal jump into an even
      // smaller region when neither side can fully contain long content.
      if (preferredOverflow > 0 && oppositeOverflow < preferredOverflow) {
        top = opposite;
      }
    }
  } else {
    const leftPosition = anchorRect.left - offset - overlayWidth;
    const rightPosition = anchorRect.right + offset;
    left = side === 'left' ? leftPosition : rightPosition;
    if (align === 'start') {
      top = anchorRect.top;
    } else if (align === 'end') {
      top = anchorRect.bottom - overlayHeight;
    } else {
      top = anchorRect.top + anchorRect.height / 2 - overlayHeight / 2;
    }

    if (flip) {
      const minimum = bounds.left + BOUNDARY_MARGIN;
      const maximum = bounds.right - BOUNDARY_MARGIN;
      const preferredOverflow = overflowAmount(left, overlayWidth, minimum, maximum);
      const opposite = side === 'left' ? rightPosition : leftPosition;
      const oppositeOverflow = overflowAmount(
        opposite,
        overlayWidth,
        minimum,
        maximum,
      );
      if (preferredOverflow > 0 && oppositeOverflow < preferredOverflow) {
        left = opposite;
      }
    }
  }

  return {
    left: clamp(
      left,
      bounds.left + BOUNDARY_MARGIN,
      Math.max(bounds.left + BOUNDARY_MARGIN, bounds.right - overlayWidth - BOUNDARY_MARGIN),
    ),
    top: clamp(
      top,
      bounds.top + BOUNDARY_MARGIN,
      Math.max(bounds.top + BOUNDARY_MARGIN, bounds.bottom - overlayHeight - BOUNDARY_MARGIN),
    ),
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/** Deterministic anchor-name allocator: a module counter, never a die roll. */
let overlayInstanceCounter = 0;

/** Stable empty attrs for the js branch (no anchor registration to expose). */
const EMPTY_ANCHOR_ATTRS: Record<string, string> = Object.freeze({});

/**
 * Resolves the positioning strategy for one overlay instance and keeps the
 * overlay pinned to its anchor. Pass the live elements (null while closed);
 * element presence drives activation, so components that keep the overlay
 * mounted while closed must pass `overlay: null` in that state.
 *
 * @example
 * ```tsx
 * const { strategy, style, anchorAttrs } = useOverlayPosition({
 *   anchor: triggerEl, overlay: open ? panelEl : null, placement: 'bottom-start',
 * });
 * // strategy === 'anchor-css': render the panel inline (top layer).
 * // strategy === 'js': render the panel through runtime/overlay/portal.
 * ```
 */
export function useOverlayPosition(request: OverlayPositionRequest): OverlayPositionResult {
  const {
    anchor,
    overlay,
    placement: requestedPlacement,
    offset = DEFAULT_OFFSET,
    flip = true,
    boundary = 'viewport',
    direction: requestedDirection,
  } = request;

  const placement = normalizeOverlayPlacement(requestedPlacement);
  // ONE direction per request. The app locale is the default answer; an
  // adopter that resolves the anchor's own direction -- which is what the
  // anchor-css branch's `self-*` keywords resolve against -- overrides it, so
  // both branches place against the same authority instead of two.
  const localeDirection = useOptionalDirection();
  const direction = requestedDirection ?? localeDirection;

  const portalDepth = useOverlayPortalDepth();
  const boundaryElement = boundary === 'viewport' ? null : boundary;
  const strategy: OverlayPositionStrategy =
    overlayCapabilities.anchorPositioning &&
    overlayCapabilities.topLayer &&
    portalDepth === 0 &&
    boundaryElement === null
      ? 'anchor-css'
      : 'js';

  const instanceIdRef = useRef(0);
  if (instanceIdRef.current === 0) {
    overlayInstanceCounter += 1;
    instanceIdRef.current = overlayInstanceCounter;
  }
  const anchorName = `--ds-anchor-${instanceIdRef.current}`;

  // anchor-css: the anchor element carries the anchor-name registration for
  // as long as the branch is active.
  useEffect(() => {
    if (strategy !== 'anchor-css' || !anchor) return undefined;
    anchor.style.setProperty('anchor-name', anchorName);
    return () => {
      anchor.style.removeProperty('anchor-name');
    };
  }, [strategy, anchor, anchorName]);

  // anchor-css: top-layer promotion for the overlay element's lifetime.
  // `manual` keeps light-dismiss with the owning component; the layer-stack
  // Escape router stays authoritative for the portal world.
  useEffect(() => {
    if (strategy !== 'anchor-css' || !overlay) return undefined;
    overlay.setAttribute('popover', 'manual');
    try {
      overlay.showPopover?.();
    } catch {
      // Already promoted or not connected; the positioning styles still apply.
    }
    return () => {
      try {
        overlay.hidePopover?.();
      } catch {
        // Already hidden or disconnected.
      }
      overlay.removeAttribute('popover');
    };
  }, [strategy, overlay]);

  // js: measured position, kept current across resize and (capture) scroll.
  const [measured, setMeasured] = useState<MeasuredPosition | null>(null);

  useLayoutEffect(() => {
    if (strategy !== 'js' || !anchor || !overlay || typeof window === 'undefined') {
      setMeasured(null);
      return undefined;
    }

    const update = (): void => {
      const anchorRect = anchor.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      const next = computeMeasuredPosition(
        anchorRect,
        overlayRect.width,
        overlayRect.height,
        placement,
        direction,
        offset,
        flip,
        resolveBoundaryRect(boundary),
      );
      setMeasured((prev) =>
        prev && prev.top === next.top && prev.left === next.left ? prev : next,
      );
    };

    update();
    // One extra frame: the overlay's first layout can change its size.
    const frame = window.requestAnimationFrame(update);
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    resizeObserver?.observe(anchor);
    resizeObserver?.observe(overlay);
    const visualViewport = window.visualViewport;
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    visualViewport?.addEventListener('resize', update);
    visualViewport?.addEventListener('scroll', update);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      visualViewport?.removeEventListener('resize', update);
      visualViewport?.removeEventListener('scroll', update);
    };
  }, [strategy, anchor, overlay, placement, direction, offset, flip, boundary]);

  const style = useMemo<CSSProperties>(() => {
    if (strategy === 'anchor-css') {
      const [side] = parsePlacement(placement);
      return {
        position: 'fixed',
        positionAnchor: anchorName,
        positionArea: POSITION_AREA[placement],
        ...(flip ? { positionTryFallbacks: FLIP_CHAIN[side] } : {}),
        // UA [popover] rules declare `inset: 0; margin: auto`, which would
        // center-fill the position-area region; auto insets plus a zero base
        // margin leave only the offset gap.
        inset: 'auto',
        margin: 0,
        ...offsetMargins(side, offset),
      };
    }
    return {
      position: 'fixed',
      top: measured?.top ?? 0,
      left: measured?.left ?? 0,
      // Hidden until the first measurement so the overlay never paints at 0,0.
      ...(measured ? {} : { visibility: 'hidden' as const }),
    };
  }, [strategy, placement, anchorName, flip, offset, measured]);

  const anchorAttrs = useMemo<Record<string, string>>(() => {
    if (strategy !== 'anchor-css') return EMPTY_ANCHOR_ATTRS;
    return { 'data-ds-anchor': anchorName };
  }, [strategy, anchorName]);

  return { strategy, style, anchorAttrs };
}
