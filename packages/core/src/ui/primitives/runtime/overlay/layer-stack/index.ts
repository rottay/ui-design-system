'use client';

/**
 * @fileoverview Overlay layer-stack manager -- the fifth runtime/overlay owner
 * beside backdrop, dialog-attributes, focus-management, and portal.
 *
 * A single module-level registry coordinates every open overlay (modal, drawer,
 * sheet, popover, dropdown, hover, tooltip, toast) so that four cross-cutting
 * concerns are owned in ONE place instead of being re-implemented per engine:
 *
 * 1. Z-INDEX -- each kind resolves to a canonical `--ds-z-index-*` band token
 *    (this hook is the enforcement point for that namespace); a per-stack
 *    offset keeps later layers above earlier ones without leaving the band.
 * 2. ESCAPE -- exactly ONE document keydown listener (capture phase) routes
 *    Escape to the TOP-MOST blocking layer only, fixing nested-dialog Escape
 *    where several stacked listeners would otherwise all fire.
 * 3. SCROLL LOCK -- a refcount locks `document.body` overflow on the first
 *    blocking layer and unlocks on count-zero, replacing the per-engine
 *    overflow hacks scattered across Modal/Drawer/Sheet.
 * 4. FOCUS RESTORE -- the previously-focused element is captured on activation
 *    and restored on deactivation, LIFO across nested layers (delegating the
 *    actual focus move to the DOM, coordinated with the focus-management owner:
 *    adopters that already run a FocusTrap pass `restoreFocus: false`).
 *
 * The registry is module state read through `useSyncExternalStore`, so every
 * consuming layer re-renders when the stack changes and `isTop`/`zIndex` stay
 * current. `layerProps` carries `data-overlay-*` attributes that the W6 anchor
 * engine reuses for positioning.
 */

import { useCallback, useEffect, useId, useRef, useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

/** The overlay families the manager knows how to stack. */
export type OverlayLayerKind =
  | 'modal'
  | 'drawer'
  | 'sheet'
  | 'popover'
  | 'dropdown'
  | 'hover'
  | 'tooltip'
  | 'toast';

export interface UseOverlayLayerOptions {
  /** Which overlay family this layer belongs to (selects the z-index band). */
  kind: OverlayLayerKind;
  /**
   * Whether the layer is currently mounted/open. Registration gate: the layer
   * joins the stack while `true` and leaves when `false` or on unmount.
   * @default true
   */
  active?: boolean;
  /**
   * Blocking layer -- participates in scroll-lock refcount and owns Escape
   * routing when it is the top-most blocking layer. Defaults to `true` for
   * modal/drawer/sheet and `false` for the lightweight popover family.
   */
  modal?: boolean;
  /**
   * Lock body scroll while active. Defaults to the resolved `modal` value.
   * Pass `false` to keep a component's existing scroll handling.
   */
  lockScroll?: boolean;
  /**
   * Invoked when Escape is pressed and this layer is the top-most blocking
   * layer. Omit to let the component keep its own Escape handling.
   */
  onEscape?: () => void;
  /**
   * Restore focus to the previously-focused element when the layer
   * deactivates (LIFO). Defaults to the resolved `modal` value. Adopters that
   * already run a FocusTrap pass `false` to avoid a double restore.
   */
  restoreFocus?: boolean;
}

export interface OverlayLayerProps {
  'data-overlay-layer': string;
  'data-overlay-kind': OverlayLayerKind;
  /** Present (empty string) only while this layer is top-most. */
  'data-overlay-top'?: '';
  style: { zIndex: string };
}

export interface OverlayLayerHandle {
  /** Stable id for this layer instance. */
  layerId: string;
  /** Resolved z-index string: canonical band token plus stack offset. */
  zIndex: string;
  /** Whether this layer is the top-most active layer (reactive snapshot). */
  isTop: boolean;
  /**
   * Live top-most check, safe to call from an event handler after the last
   * render (reads the current registry rather than a rendered snapshot).
   */
  isTopMost: () => boolean;
  /** Spreadable attributes + z-index for the layer's root element. */
  layerProps: OverlayLayerProps;
}

// ---------------------------------------------------------------------------
// Kind -> canonical z-index band (the `--ds-z-index-*` namespace is authoritative)
// ---------------------------------------------------------------------------

const KIND_Z_BAND: Record<OverlayLayerKind, string> = {
  modal: '--ds-z-index-modal',
  drawer: '--ds-z-index-drawer',
  // Sheets slide from an edge like drawers and share the drawer tier.
  sheet: '--ds-z-index-drawer',
  popover: '--ds-z-index-popover',
  dropdown: '--ds-z-index-dropdown',
  // Hover cards sit at the popover tier.
  hover: '--ds-z-index-popover',
  tooltip: '--ds-z-index-tooltip',
  toast: '--ds-z-index-notification',
};

/** Kinds that block the page (scroll lock + Escape routing) unless overridden. */
const DEFAULT_MODAL_KINDS: ReadonlySet<OverlayLayerKind> = new Set([
  'modal',
  'drawer',
  'sheet',
]);

// ---------------------------------------------------------------------------
// Module-level stacking registry (shared across every consumer)
// ---------------------------------------------------------------------------

interface LayerRecord {
  id: string;
  kind: OverlayLayerKind;
  modal: boolean;
  lockScroll: boolean;
  /** Mutable ref so the document listener always sees the latest handler. */
  escapeRef: { current: (() => void) | undefined };
}

let layers: readonly LayerRecord[] = [];
const listeners = new Set<() => void>();
const EMPTY_LAYERS: readonly LayerRecord[] = [];

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): readonly LayerRecord[] {
  return layers;
}

function getServerSnapshot(): readonly LayerRecord[] {
  return EMPTY_LAYERS;
}

// ---------------------------------------------------------------------------
// Scroll-lock refcount
// ---------------------------------------------------------------------------

let scrollLockCount = 0;
let restoreBodyOverflow: string | null = null;

function acquireScrollLock(): void {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    restoreBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
}

function releaseScrollLock(): void {
  if (typeof document === 'undefined' || scrollLockCount === 0) return;
  scrollLockCount -= 1;
  if (scrollLockCount === 0) {
    document.body.style.overflow = restoreBodyOverflow ?? '';
    restoreBodyOverflow = null;
  }
}

// ---------------------------------------------------------------------------
// Single document Escape router (capture phase, top blocking layer only)
// ---------------------------------------------------------------------------

let escapeListenerActive = false;

function handleDocumentKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const layer = layers[i];
    if (!layer.modal) continue;
    // The top-most blocking layer owns the Escape slot. If it registered an
    // onEscape the router fires it and stops the event; otherwise the layer is
    // handling Escape itself, so the router stays inert but still blocks lower
    // layers from claiming the keystroke.
    if (layer.escapeRef.current) {
      event.preventDefault();
      event.stopImmediatePropagation();
      layer.escapeRef.current();
    }
    return;
  }
}

function ensureEscapeListener(): void {
  if (escapeListenerActive || typeof document === 'undefined') return;
  document.addEventListener('keydown', handleDocumentKeydown, true);
  escapeListenerActive = true;
}

function teardownEscapeListenerIfIdle(): void {
  if (!escapeListenerActive || typeof document === 'undefined') return;
  if (layers.length === 0) {
    document.removeEventListener('keydown', handleDocumentKeydown, true);
    escapeListenerActive = false;
  }
}

// ---------------------------------------------------------------------------
// Registry mutations
// ---------------------------------------------------------------------------

function registerLayer(record: LayerRecord): void {
  layers = [...layers, record];
  if (record.lockScroll) acquireScrollLock();
  ensureEscapeListener();
  emit();
}

function unregisterLayer(id: string): void {
  const record = layers.find((layer) => layer.id === id);
  if (!record) return;
  layers = layers.filter((layer) => layer.id !== id);
  if (record.lockScroll) releaseScrollLock();
  teardownEscapeListenerIfIdle();
  emit();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Registers an overlay in the shared stack and returns its resolved z-index,
 * top-most status, and spreadable layer attributes. See the file overview for
 * the four concerns this centralizes.
 *
 * @example
 * ```tsx
 * const { zIndex, isTopMost, layerProps } = useOverlayLayer({
 *   kind: 'modal',
 *   active: open,
 *   onEscape: onClose,
 * });
 * return <div {...layerProps}>...</div>;
 * ```
 */
export function useOverlayLayer(options: UseOverlayLayerOptions): OverlayLayerHandle {
  const {
    kind,
    active = true,
    modal = DEFAULT_MODAL_KINDS.has(kind),
    lockScroll,
    onEscape,
    restoreFocus,
  } = options;

  const reactId = useId();
  const layerId = `ds-overlay-${reactId}`;
  const shouldLockScroll = lockScroll ?? modal;
  const shouldRestoreFocus = restoreFocus ?? modal;

  // The module listener reads this ref, so a changing onEscape never forces a
  // re-registration.
  const escapeRef = useRef<(() => void) | undefined>(onEscape);
  escapeRef.current = onEscape;

  // Element focused just before this layer activated (for LIFO restore).
  const restoreTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    if (shouldRestoreFocus && typeof document !== 'undefined') {
      restoreTargetRef.current = document.activeElement as HTMLElement | null;
    }

    const record: LayerRecord = {
      id: layerId,
      kind,
      modal,
      lockScroll: shouldLockScroll,
      escapeRef,
    };
    registerLayer(record);

    return () => {
      unregisterLayer(layerId);
      if (shouldRestoreFocus) {
        const target = restoreTargetRef.current;
        restoreTargetRef.current = null;
        if (target && typeof target.focus === 'function') {
          // Defer so inner overlays finish unmounting first (LIFO restore).
          setTimeout(() => target.focus(), 0);
        }
      }
    };
  }, [active, layerId, kind, modal, shouldLockScroll, shouldRestoreFocus]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const index = snapshot.findIndex((layer) => layer.id === layerId);
  const isTop = index >= 0 && index === snapshot.length - 1;
  // Not-yet-registered layers (first paint before the effect runs) render at the
  // bare band; once registered the stack offset keeps siblings ordered.
  const position = index < 0 ? 0 : index;
  const band = KIND_Z_BAND[kind];
  const zIndex = position === 0 ? `var(${band})` : `calc(var(${band}) + ${position})`;

  const isTopMost = useCallback(
    () => layers.length > 0 && layers[layers.length - 1]?.id === layerId,
    [layerId],
  );

  const layerProps: OverlayLayerProps = {
    'data-overlay-layer': layerId,
    'data-overlay-kind': kind,
    ...(isTop ? { 'data-overlay-top': '' as const } : {}),
    style: { zIndex },
  };

  return { layerId, zIndex, isTop, isTopMost, layerProps };
}

/**
 * Test-only helper: the number of currently active layers. Not part of the
 * public runtime contract; exported for contract tests that assert registry
 * cleanup without reaching into module internals.
 * @internal
 */
export function getOverlayLayerCount(): number {
  return layers.length;
}
