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
 * - `js`: the shared measured implementation -- `getBoundingClientRect` plus
 *   window resize/scroll (capture) listeners. Adopters render the overlay
 *   through `runtime/overlay/portal`.
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

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

/**
 * Side-align placement vocabulary (the Tooltip set): a side qualified by an
 * optional edge alignment; the bare side centers on the anchor.
 */
export type OverlayPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type OverlayPositionStrategy = 'anchor-css' | 'js';

export interface OverlayPositionRequest {
  /** Element the overlay positions against; null while unmounted. */
  anchor: HTMLElement | null;
  /** The positioned overlay element; null while closed/unmounted. */
  overlay: HTMLElement | null;
  placement: OverlayPlacement;
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

type PlacementSide = 'top' | 'bottom' | 'left' | 'right';
type PlacementAlign = 'center' | 'start' | 'end';

function parsePlacement(placement: OverlayPlacement): [PlacementSide, PlacementAlign] {
  const [side, align] = placement.split('-') as [PlacementSide, PlacementAlign | undefined];
  return [side, align ?? 'center'];
}

/**
 * `position-area` per placement. Bare sides use the single-keyword form: the
 * cross axis spans all three grid tracks, so the default toward-anchor
 * alignment anchor-centers the overlay WITHOUT false-triggering try
 * fallbacks when the overlay is wider than its anchor (a single-track center
 * region would overflow on every wide overlay). `-start`/`-end` span from
 * the anchor's near edge outward so the default alignment lines the edges
 * up.
 */
const POSITION_AREA: Record<OverlayPlacement, string> = {
  top: 'top',
  'top-start': 'top span-right',
  'top-end': 'top span-left',
  bottom: 'bottom',
  'bottom-start': 'bottom span-right',
  'bottom-end': 'bottom span-left',
  left: 'left',
  'left-start': 'left span-bottom',
  'left-end': 'left span-top',
  right: 'right',
  'right-start': 'right span-bottom',
  'right-end': 'right span-top',
};

/** Fallbacks flip the placement axis first, then alignment, then both. */
const FLIP_CHAIN: Record<PlacementSide, string> = {
  top: 'flip-block, flip-inline, flip-block flip-inline',
  bottom: 'flip-block, flip-inline, flip-block flip-inline',
  left: 'flip-inline, flip-block, flip-inline flip-block',
  right: 'flip-inline, flip-block, flip-inline flip-block',
};

/**
 * The anchor-facing margin carries the offset gap; try fallbacks mirror
 * margins in the flipped axis, so the gap survives a flip.
 */
function offsetMargins(side: PlacementSide, offset: number): CSSProperties {
  switch (side) {
    case 'top':
      return { marginBottom: offset };
    case 'bottom':
      return { marginTop: offset };
    case 'left':
      return { marginRight: offset };
    case 'right':
      return { marginLeft: offset };
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

function computeMeasuredPosition(
  anchorRect: DOMRect,
  overlayWidth: number,
  overlayHeight: number,
  placement: OverlayPlacement,
  offset: number,
  flip: boolean,
  bounds: BoundaryRect,
): MeasuredPosition {
  const [side, align] = parsePlacement(placement);
  let top: number;
  let left: number;

  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? anchorRect.top - offset - overlayHeight : anchorRect.bottom + offset;
    if (align === 'start') {
      left = anchorRect.left;
    } else if (align === 'end') {
      left = anchorRect.right - overlayWidth;
    } else {
      left = anchorRect.left + anchorRect.width / 2 - overlayWidth / 2;
    }

    if (flip) {
      if (side === 'top' && top < bounds.top + BOUNDARY_MARGIN) {
        top = anchorRect.bottom + offset;
      } else if (side === 'bottom' && top + overlayHeight > bounds.bottom - BOUNDARY_MARGIN) {
        top = anchorRect.top - offset - overlayHeight;
      }
    }
  } else {
    left = side === 'left' ? anchorRect.left - offset - overlayWidth : anchorRect.right + offset;
    if (align === 'start') {
      top = anchorRect.top;
    } else if (align === 'end') {
      top = anchorRect.bottom - overlayHeight;
    } else {
      top = anchorRect.top + anchorRect.height / 2 - overlayHeight / 2;
    }

    if (flip) {
      if (side === 'left' && left < bounds.left + BOUNDARY_MARGIN) {
        left = anchorRect.right + offset;
      } else if (side === 'right' && left + overlayWidth > bounds.right - BOUNDARY_MARGIN) {
        left = anchorRect.left - offset - overlayWidth;
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

/** Deterministic anchor-name allocator: a module counter, never Math.random. */
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
    placement,
    offset = DEFAULT_OFFSET,
    flip = true,
    boundary = 'viewport',
  } = request;

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
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [strategy, anchor, overlay, placement, offset, flip, boundary]);

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
