'use client';

/**
 * @fileoverview `useFieldOverlay` -- the SINGLE overlay contract every family
 * with a panel adopts (the 9 overlay-bearing inputs plus modal, drawer, sheet,
 * the dialogs, popover, popconfirm, dropdown, context-menu, hover-card,
 * tooltip, tour, toast, notification and message).
 *
 * It composes the five runtime/overlay owners that were previously wired by
 * hand -- and inconsistently -- in every engine file:
 *
 *   `layer-stack`   z band + single Escape router + ref-counted scroll lock
 *   `positioning`   anchor-css / measured branch selection and pinning
 *   `portal`        container precedence (explicit > top-layer host > root)
 *   `portal-scope`  tenant/locale/`--ds-*` lineage re-stamped across the portal
 *   `positioning`   `OverlayPortalBoundary` for the nested-chain rule
 *
 * A family states WHAT its overlay is (`kind`, `surface`, `render`) and gets
 * the substrate; it never re-implements a `document.body.style.overflow`
 * hack, a private `createPortal`, a numeric `zIndex`, its own document
 * `keydown` listener, or its own outside-pointer dismiss.
 *
 * Two surfaces:
 * - `anchored` -- the panel pins to a trigger (dropdowns, popovers, tooltips).
 *   The positioning branch is resolved here and the render mode follows it:
 *   an `anchor-css` overlay is promoted into the browser top layer and must
 *   render INLINE; a `js` overlay renders through the portal.
 * - `viewport` -- the panel owns the viewport (modal, drawer, sheet, toast
 *   region). No anchor measurement; the layer style carries the z band.
 *
 * `render: 'inline'` is an explicit, declared mode for the two families whose
 * panel is in-tree BY DESIGN: Upload's preview scrim is a full-viewport child
 * of the field it belongs to, and Message's stack is skin-placed in-tree on
 * its own `--ds-z-message` tier. Both still join the shared stack, Escape
 * route and z band. It is not a second overlay mechanism.
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Portal } from '../portal';
import { PortalScope, usePortalScope, type PortalScopeSnapshot } from '../portal-scope';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
  type OverlayPlacement,
  type OverlayPositionStrategy,
} from '../positioning';
import {
  useOverlayLayer,
  type OverlayLayerKind,
  type OverlayLayerProps,
} from '../layer-stack';

/**
 * Measurement runs in the layout phase so a portaled panel never paints one
 * frame at the wrong size. `useLayoutEffect` does not run during SSR and
 * React warns when it is used in a server render, so the server path falls
 * back to `useEffect` -- which also does not run there, but warns about
 * nothing (the `runtime/overlay/portal` precedent).
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

/** The overlay families the kernel stacks; identical to the layer roster. */
export type FieldOverlayKind = OverlayLayerKind;

/**
 * `anchored` pins to a trigger element; `viewport` owns the viewport and
 * takes no anchor measurement.
 */
export type FieldOverlaySurface = 'anchored' | 'viewport';

/**
 * `auto` follows the positioning branch (top layer renders inline, measured
 * renders through the portal). `inline` is the declared mode for a panel that
 * is in-tree by design (Upload's field-child scrim, Message's skin-placed
 * stack).
 */
export type FieldOverlayRenderMode = 'auto' | 'inline';

/** Why the kernel asked the owning family to close. */
export type FieldOverlayDismissReason = 'escape' | 'outside-pointer';

export interface UseFieldOverlayOptions {
  /** Overlay family -- selects the canonical `--ds-z-index-*` band. */
  kind: FieldOverlayKind;
  /** Whether the overlay is currently open. Drives every registration. */
  open: boolean;
  /** Trigger element the panel pins to (`anchored` surfaces). */
  anchor?: HTMLElement | null;
  /** @default 'anchored' when an `anchor` is supplied, otherwise 'viewport' */
  surface?: FieldOverlaySurface;
  /** @default 'auto' */
  render?: FieldOverlayRenderMode;
  /** Preferred side/alignment for an `anchored` surface. @default 'bottom-start' */
  placement?: OverlayPlacement;
  /** Gap in px between anchor edge and panel. @default 8 */
  offset?: number;
  /** Flip to the opposite side on overflow. @default true */
  flip?: boolean;
  /** Overflow boundary for the measured branch. @default 'viewport' */
  boundary?: 'viewport' | HTMLElement;
  /**
   * Tie the panel's inline size to the anchor's measured width. In-tree
   * panels get this for free from `inset-inline: 0`; a portaled panel has no
   * such relationship, so the kernel measures the anchor and keeps the value
   * current across resizes.
   *
   * - `match` -- exactly the anchor's width
   * - `min` -- at least the anchor's width, content may grow past it
   * - `auto` (default) -- the panel sizes itself
   */
  anchorWidth?: 'match' | 'min' | 'auto';
  /**
   * Blocking layer: owns Escape while top-most and joins the scroll-lock
   * refcount. Defaults to the layer-stack rule (modal/drawer/sheet block).
   */
  modal?: boolean;
  /** Ref-counted body scroll lock. Defaults to the resolved `modal`. */
  lockScroll?: boolean;
  /** LIFO focus restore on close. Defaults to the resolved `modal`. */
  restoreFocus?: boolean;
  /**
   * Explicit portal container (a `getPopupContainer`-style host). Honored
   * only when it is a real attached element; see `runtime/overlay/portal`.
   */
  container?: Element | null;
  /**
   * Close request from the shared Escape router or the shared outside-pointer
   * watcher. Supplying it opts the layer into both unless disabled below.
   */
  onDismiss?: (reason: FieldOverlayDismissReason) => void;
  /** @default true when `onDismiss` is supplied */
  dismissOnEscape?: boolean;
  /** @default false -- families opt in explicitly */
  dismissOnOutsidePointer?: boolean;
  /**
   * Panel element supplied by the adopter. Use it when the family already
   * keeps the element in its own state; the kernel then stops owning the ref
   * and `panelProps.ref` is a no-op passthrough.
   */
  panel?: HTMLElement | null;
  /**
   * Gate for anchor measurement, when it must differ from `open` (a family
   * that keeps measuring through its exit animation). @default `open`
   */
  measure?: boolean;
  /**
   * Extra elements that count as "inside" for the outside-pointer watcher
   * (a detached trigger, a secondary anchor). The anchor and the panel are
   * always inside.
   */
  dismissIgnore?: ReadonlyArray<HTMLElement | null | undefined>;
}

/** The layer's identifying attributes, without the band style. */
type OverlayLayerProps2 = Omit<OverlayLayerProps, 'style'>;

/** Props for the panel's root element. Spread them; do not reconstruct them. */
export interface FieldOverlayPanelProps extends OverlayLayerProps {
  ref: (element: HTMLElement | null) => void;
  style: CSSProperties & { zIndex: string };
}

export interface FieldOverlayHandle {
  /** Stable layer id (also `data-overlay-layer`). */
  layerId: string;
  /** Canonical band token expression; never a number. */
  zIndex: string;
  /** Reactive top-most flag. */
  isTop: boolean;
  /** Live top-most check, safe inside an event handler. */
  isTopMost: () => boolean;
  /** Resolved positioning branch (`viewport` surfaces report `js`). */
  strategy: OverlayPositionStrategy;
  /** Whether the panel must render inline (top layer or declared exception). */
  inline: boolean;
  /** Attributes for the trigger element (anchor-name handshake). */
  anchorProps: Record<string, string>;
  /**
   * Positioning keys ONLY (`position` and the resolved coordinates), without
   * the band. A family whose adjudicated contract keeps `z-index` on its own
   * instance channel -- so a caller's scalar never competes with the layer
   * manager -- composes this instead of `panelProps.style`.
   */
  positionStyle: CSSProperties;
  /** Everything the panel root needs: ref, layer data-attrs, position + z. */
  panelProps: FieldOverlayPanelProps;
  /**
   * The layer's `data-overlay-*` attributes alone, for a panel root that
   * already owns its ref and composes {@link positionStyle} itself.
   */
  layerProps: OverlayLayerProps2;
  /**
   * Stable ref setter for the panel element. Spread `panelProps` when the
   * panel root has no ref of its own; compose against THIS when it does (the
   * spread's `ref` would otherwise silently replace it).
   */
  setPanel: (element: HTMLElement | null) => void;
  /** Live panel element, once mounted. */
  panel: HTMLElement | null;
  /** Anchor's measured border-box width in px, or null before first measure. */
  anchorSize: number | null;
  /** Anchor lineage re-stamped across the portal boundary. */
  scope: PortalScopeSnapshot;
  /** @internal consumed by {@link FieldOverlayPanel}. */
  container: Element | null | undefined;
}

// ---------------------------------------------------------------------------
// Shared outside-pointer watcher
// ---------------------------------------------------------------------------

/** Press events that open the outside-dismiss window, most specific first. */
const PRESS_EVENTS = ['pointerdown', 'mousedown'] as const;

/**
 * Set the first time a real `pointerdown` reaches the kernel. From then on the
 * compatibility `mousedown` the UA dispatches for the SAME press is ignored,
 * so one press is one dismissal. Until then `mousedown` is the only press
 * signal available and is honored.
 */
let documentEmitsPointerEvents = false;

/**
 * One outside-press watcher per open layer that asked for it, in the CAPTURE
 * phase so a panel that stops propagation cannot swallow the dismissal, and
 * gated on `isTopMost` so a nested panel dismisses alone.
 *
 * Both `pointerdown` and `mousedown` are observed: pointer events carry pen
 * and touch, and a compatibility `mousedown` is all some dispatchers emit. A
 * real browser fires both for one press, so the first one handled closes the
 * window for the rest of that interaction.
 */
function useOutsidePointerDismiss(
  active: boolean,
  isTopMost: () => boolean,
  insideElements: ReadonlyArray<HTMLElement | null | undefined>,
  onDismiss: (() => void) | undefined,
): void {
  // Read through a ref so a changing element set never resizes the dependency
  // array (React rejects that) and never re-subscribes the listener.
  const insideRef = useRef(insideElements);
  insideRef.current = insideElements;

  useEffect(() => {
    if (!active || !onDismiss || typeof document === 'undefined') return undefined;

    const handler = (event: Event): void => {
      if (event.type === 'pointerdown') documentEmitsPointerEvents = true;
      else if (documentEmitsPointerEvents) return;
      if (!isTopMost()) return;
      const target = event.target as Node | null;
      if (!target) return;
      for (const element of insideRef.current) {
        if (element && element.contains(target)) return;
      }
      onDismiss();
    };

    for (const name of PRESS_EVENTS) document.addEventListener(name, handler, true);
    return () => {
      for (const name of PRESS_EVENTS) document.removeEventListener(name, handler, true);
    };
  }, [active, onDismiss, isTopMost]);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const EMPTY_ANCHOR_PROPS: Record<string, string> = Object.freeze({});
const NO_IGNORE: ReadonlyArray<HTMLElement | null | undefined> = Object.freeze([]);
const NOOP_REF = (): void => {};
const NO_POSITION: CSSProperties = {};

/**
 * The one overlay contract. Returns the substrate for a panel; the family
 * supplies only its own content and open-state semantics.
 *
 * @example
 * ```tsx
 * const overlay = useFieldOverlay({
 *   kind: 'dropdown', open, anchor: triggerEl,
 *   placement: 'bottom-start', onDismiss: close, dismissOnOutsidePointer: true,
 * });
 * return (
 *   <div ref={setTriggerEl} {...overlay.anchorProps}>
 *     {trigger}
 *     {open && (
 *       <FieldOverlayPanel overlay={overlay}>
 *         <div {...overlay.panelProps} data-part="dropdown">{items}</div>
 *       </FieldOverlayPanel>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useFieldOverlay(options: UseFieldOverlayOptions): FieldOverlayHandle {
  const {
    kind,
    open,
    anchor = null,
    surface = anchor === null ? 'viewport' : 'anchored',
    render = 'auto',
    placement = 'bottom-start',
    offset,
    flip,
    boundary,
    modal,
    lockScroll,
    restoreFocus,
    container,
    panel: externalPanel,
    measure,
    anchorWidth = 'auto',
    onDismiss,
    dismissOnEscape = onDismiss !== undefined,
    dismissOnOutsidePointer = false,
    dismissIgnore = NO_IGNORE,
  } = options;

  const [ownPanel, setOwnPanel] = useState<HTMLElement | null>(null);
  const panel = externalPanel === undefined ? ownPanel : externalPanel;
  const setPanel = externalPanel === undefined ? setOwnPanel : NOOP_REF;

  const handleEscape = useCallback(() => {
    onDismiss?.('escape');
  }, [onDismiss]);

  const { layerId, zIndex, isTop, isTopMost, layerProps } = useOverlayLayer({
    kind,
    active: open,
    ...(modal === undefined ? {} : { modal }),
    ...(lockScroll === undefined ? {} : { lockScroll }),
    ...(restoreFocus === undefined ? {} : { restoreFocus }),
    ...(dismissOnEscape && onDismiss ? { onEscape: handleEscape } : {}),
  });

  const anchored = surface === 'anchored';

  // Anchor width, kept current: a portaled panel has no `inset-inline: 0`
  // relationship with its trigger, so the width has to be measured.
  const [anchorSize, setAnchorSize] = useState<number | null>(null);
  const tracksAnchorWidth = anchored && anchorWidth !== 'auto';

  useIsomorphicLayoutEffect(() => {
    if (!tracksAnchorWidth || !anchor || typeof window === 'undefined') {
      setAnchorSize(null);
      return undefined;
    }
    const read = (): void => {
      const width = anchor.getBoundingClientRect().width;
      setAnchorSize((previous) => (previous === width ? previous : width));
    };
    read();
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(read);
    observer?.observe(anchor);
    window.addEventListener('resize', read);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', read);
    };
  }, [tracksAnchorWidth, anchor]);

  const measuring = measure ?? open;

  const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
    anchor: anchored ? anchor : null,
    overlay: anchored && measuring ? panel : null,
    placement,
    ...(offset === undefined ? {} : { offset }),
    ...(flip === undefined ? {} : { flip }),
    ...(boundary === undefined ? {} : { boundary }),
  });

  const scope = usePortalScope(anchor);

  const handleOutsidePointer = useCallback(() => {
    onDismiss?.('outside-pointer');
  }, [onDismiss]);

  const insideElements = useMemo(
    () => [anchor, panel, ...dismissIgnore],
    [anchor, panel, dismissIgnore],
  );

  useOutsidePointerDismiss(
    open && dismissOnOutsidePointer,
    isTopMost,
    insideElements,
    dismissOnOutsidePointer && onDismiss ? handleOutsidePointer : undefined,
  );

  // Top-layer overlays MUST render inline: promotion happens on the element
  // itself and a portaled node would leave the anchor's containing block.
  const inline = render === 'inline' || (anchored && strategy === 'anchor-css');

  // Built as plain literals, not memos: the returned bags are spread straight
  // onto DOM elements, so their identity is never a render input, and a
  // transparent expression is what lets the inline-paint census verify from
  // source that this hook emits positioning and a band -- never paint.
  const { style: bandStyle, ...layerAttrs } = layerProps;

  const panelStyle: CSSProperties & { zIndex: string } = {
    // Position first so a family's own surface styles cannot silently
    // outrank the band: the z-index key is written last and wins.
    ...(anchored ? positionStyle : null),
    ...(anchorSize === null || anchorWidth === 'auto'
      ? null
      : anchorWidth === 'match'
        ? { inlineSize: anchorSize }
        : { minInlineSize: anchorSize }),
    zIndex: bandStyle.zIndex,
  };

  const panelProps: FieldOverlayPanelProps = {
    ...layerAttrs,
    ref: setPanel,
    style: panelStyle,
  };

  return {
    layerId,
    zIndex,
    positionStyle: anchored ? positionStyle : NO_POSITION,
    layerProps: layerAttrs,
    isTop,
    isTopMost,
    strategy,
    inline,
    anchorProps: anchored ? anchorAttrs : EMPTY_ANCHOR_PROPS,
    panelProps,
    setPanel,
    panel,
    anchorSize,
    scope,
    container,
  };
}

// ---------------------------------------------------------------------------
// Panel host
// ---------------------------------------------------------------------------

export interface FieldOverlayPanelProps_ {
  /** Handle returned by {@link useFieldOverlay}. */
  overlay: FieldOverlayHandle;
  children: ReactNode;
}

/**
 * Renders a panel where its resolved mode says it belongs: inline for the top
 * layer and for the declared in-tree-by-design modes, otherwise through the
 * shared portal with the nested-chain boundary and the anchor's tenant/locale
 * lineage re-stamped around it.
 *
 * This is the only place a FAMILY-AUTHORED panel crosses the portal boundary.
 * Page-blocking and instance-channel families (modal, sheet, dropdown, tour,
 * popover, tooltip) render their own subtree through the kernel's `Portal`
 * directly, so they cross it without passing through this component.
 */
export function FieldOverlayPanel({
  overlay,
  children,
}: FieldOverlayPanelProps_): ReactElement | null {
  if (overlay.inline) return <>{children}</>;

  return (
    <Portal container={overlay.container ?? null}>
      <OverlayPortalBoundary>
        <PortalScope snapshot={overlay.scope}>{children}</PortalScope>
      </OverlayPortalBoundary>
    </Portal>
  );
}

FieldOverlayPanel.displayName = 'FieldOverlayPanel';
