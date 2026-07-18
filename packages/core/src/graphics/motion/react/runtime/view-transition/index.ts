'use client';

/**
 * @fileoverview useViewTransition / startDsViewTransition - Rottay Design System
 *
 * A framework-agnostic wrapper around the browser View Transitions API. The DOM
 * mutation belongs to the caller (a router push, a state setter, a layout swap):
 * pass it as the `update` callback and this module runs it inside a native view
 * transition when one is available, or immediately otherwise.
 *
 * This module imports no routing or UI framework so it stays reusable across
 * every Rottay app. Callers wire their own navigation into `update`.
 *
 * @example
 * ```tsx
 * const runTransition = useViewTransition();
 * runTransition(() => router.push(href));
 * ```
 */

import { useCallback } from 'react';
import type { CSSProperties } from 'react';
import { getReducedMotionSnapshot } from '@/infrastructure/runtime/foundation/motion/runtime/browser/reduced-motion';
import { useReducedMotion } from '../foundation/reduced-motion';

/** A DOM update run inside (or in place of) a view transition. */
export type ViewTransitionUpdate = () => void | Promise<void>;

/** Options accepted by {@link startDsViewTransition}. */
export interface StartViewTransitionOptions {
  /**
   * Force the immediate, non-animated path even when the API is available.
   * Used to honor a reduced-motion decision made by the caller.
   */
  skipTransition?: boolean;
}

/**
 * Handle returned by {@link startDsViewTransition}. Mirrors the browser
 * `ViewTransition` surface so callers can await the same promises whether or
 * not a real transition ran.
 */
export interface DsViewTransitionHandle {
  /** Resolves once the transition animation completes (immediately when unsupported). */
  finished: Promise<void>;
  /** Resolves once the transition pseudo-elements are ready (immediately when unsupported). */
  ready: Promise<void>;
  /** Resolves once the update callback has run. */
  updateCallbackDone: Promise<void>;
  /** Skip the running animation. A no-op on the immediate path. */
  skipTransition: () => void;
}

/** The subset of the native `ViewTransition` object this module consumes. */
interface NativeViewTransition {
  finished: Promise<unknown>;
  ready: Promise<unknown>;
  updateCallbackDone: Promise<unknown>;
  skipTransition: () => void;
}

/**
 * `document`, with `startViewTransition` treated as possibly absent. The DOM lib
 * declares the method as always present; no shipping browser guarantees it, and
 * an interface that re-declares a `Document` member as optional does not
 * type-check. An intersection narrows the member without redeclaring the base.
 */
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: ViewTransitionUpdate) => NativeViewTransition;
};

/** True when the current environment reports a reduced-motion preference. */
function environmentPrefersReducedMotion(): boolean {
  return getReducedMotionSnapshot();
}

/**
 * Run `update` now and return a settled handle. The immediate path never throws
 * synchronously: a thrown update is surfaced through the returned promises so
 * callers observe failures the same way the native API reports them.
 */
function runImmediately(update: ViewTransitionUpdate): DsViewTransitionHandle {
  let settled: Promise<void>;
  try {
    settled = Promise.resolve(update()).then(() => undefined);
  } catch (error) {
    settled = Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
  // The handle is optional for callers that fire-and-forget, so a rejection
  // here must not surface as an unhandled rejection. Anyone awaiting `finished`
  // still receives the error.
  void settled.catch(() => undefined);
  return {
    finished: settled,
    ready: settled,
    updateCallbackDone: settled,
    skipTransition: () => undefined,
  };
}

/**
 * Start a view transition for `update`, or run it immediately when the API is
 * unavailable, `skipTransition` is set, or the environment prefers reduced
 * motion.
 *
 * @param update - The DOM mutation to run inside the transition.
 * @param options - {@link StartViewTransitionOptions}.
 * @returns A {@link DsViewTransitionHandle} that resolves whether or not a
 * native transition ran.
 */
export function startDsViewTransition(
  update: ViewTransitionUpdate,
  options?: StartViewTransitionOptions
): DsViewTransitionHandle {
  const doc = typeof document !== 'undefined' ? (document as ViewTransitionDocument) : undefined;
  const start = doc?.startViewTransition;

  if (
    !doc ||
    typeof start !== 'function' ||
    options?.skipTransition ||
    environmentPrefersReducedMotion()
  ) {
    return runImmediately(update);
  }

  const transition = start.call(doc, update);
  return {
    finished: Promise.resolve(transition.finished).then(() => undefined),
    ready: Promise.resolve(transition.ready).then(() => undefined),
    updateCallbackDone: Promise.resolve(transition.updateCallbackDone).then(() => undefined),
    skipTransition: () => transition.skipTransition(),
  };
}

/**
 * React hook returning a stable {@link startDsViewTransition} caller that also
 * honors the live `prefers-reduced-motion` state via {@link useReducedMotion}.
 * The returned function keeps a stable identity while the preference is
 * unchanged, so it is safe to pass through effect and callback dependency
 * arrays.
 *
 * @returns A function that starts a view transition (or the immediate fallback).
 */
export function useViewTransition(): (
  update: ViewTransitionUpdate,
  options?: StartViewTransitionOptions
) => DsViewTransitionHandle {
  const prefersReducedMotion = useReducedMotion();
  return useCallback(
    (update: ViewTransitionUpdate, options?: StartViewTransitionOptions) =>
      startDsViewTransition(update, {
        ...options,
        skipTransition: options?.skipTransition || prefersReducedMotion,
      }),
    [prefersReducedMotion]
  );
}

/** Prefix shared by every record-derived `view-transition-name`. */
const RECORD_TRANSITION_NAME_PREFIX = 'ds-vt-record-';

/**
 * `view-transition-name` accepts a CSS `<custom-ident>`, which excludes most
 * punctuation. Record keys are expected to already be simple ids/slugs/UUIDs,
 * but any other character is replaced with `-` so the composed name is always
 * syntactically valid: an invalid custom-ident is dropped silently by the
 * CSSOM, which would otherwise turn into an unpaired (and undebuggable) seam
 * instead of a visibly missing one.
 */
function sanitizeTransitionNameSegment(key: string): string {
  return key.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
}

/**
 * Derives the `view-transition-name` a surface assigns to the element
 * representing one record, so two surfaces displaying the same record (e.g.
 * a list card and its detail page) can declare the identical name and let
 * the browser morph between them instead of cross-fading the page root.
 * Both sides must resolve the SAME `key` for the same record for a pairing
 * to occur -- a name only one side declares is an inert seam, not a morph.
 *
 * @param key - A stable per-record identifier (e.g. a resolved row key).
 * @returns A `view-transition-name`-safe string, unique per `key`.
 */
export function recordTransitionName(key: string): string {
  return `${RECORD_TRANSITION_NAME_PREFIX}${sanitizeTransitionNameSegment(key)}`;
}

/* ==========================================================================
   View Transitions v2 -- direction-aware choreography
   CSS lives in foundation/tokens/css/foundation/animations/transitions.css
   (the "VIEW TRANSITIONS V2" section); this module owns the runtime side:
   the direction attribute stamped on <html> and the shared name/class
   vocabulary the CSS keys on.
   ========================================================================== */

/**
 * Direction of a panel switch relative to reading order. `forward` means the
 * user moved to a later panel (new content enters from the end side, old
 * content exits toward the start side); `backward` is the mirror; `none`
 * requests the directionless crossfade.
 */
export type ViewTransitionDirection = 'forward' | 'backward' | 'none';

/**
 * Attribute stamped on `document.documentElement` for the lifetime of one
 * directional view transition. The transitions.css directional rules select
 * on it; it is removed once the transition settles so page-level transitions
 * started by other code never inherit a stale direction.
 */
export const VIEW_TRANSITION_DIRECTION_ATTRIBUTE = 'data-ds-vt-direction';

/**
 * `view-transition-class` shared by every DS panel that swaps content in
 * place (tab panels, workspace view-mode containers). The CSS targets
 * `::view-transition-old/new(*.ds-vt-tab-panel)`, so per-instance unique
 * names all share one choreography. Requires `view-transition-class` support;
 * browsers without it fall back to the default named-group crossfade.
 */
export const TAB_PANEL_TRANSITION_CLASS = 'ds-vt-tab-panel';

/**
 * `view-transition-class` for record-shaped morphs (card -> detail, row ->
 * detail). Pair with {@link recordTransitionName}: the name pairs the two
 * elements, the class gives every record morph the same timing envelope.
 */
export const RECORD_MORPH_TRANSITION_CLASS = 'ds-vt-record';

/**
 * The name both sides of a modal -> full-page promote declare. The modal
 * panel (via the Modal `style` prop, which the engines spread onto the
 * panel element) and the destination page region declare this same
 * `view-transition-name`, and the promoting navigation runs through
 * {@link startDsViewTransition}; the browser then morphs the panel into the
 * page region. Only one promote can be in flight at a time -- the name is
 * fixed, and duplicate active names would make the browser skip the
 * transition (the navigation itself still completes).
 */
export const MODAL_PROMOTE_TRANSITION_NAME = 'ds-vt-modal-promote';

/** Prefix shared by every panel-scoped `view-transition-name`. */
const TAB_PANEL_TRANSITION_NAME_PREFIX = 'ds-vt-tab-panel-';

/**
 * Derives the per-instance `view-transition-name` for a content panel that
 * swaps in place. `scope` must be unique per mounted instance (a `useId`
 * value) -- two live elements sharing one name make the browser skip the
 * whole transition.
 */
export function tabPanelTransitionName(scope: string): string {
  return `${TAB_PANEL_TRANSITION_NAME_PREFIX}${sanitizeTransitionNameSegment(scope)}`;
}

/**
 * React style props with the view-transition members that are newer than the
 * bundled CSS typings. Browsers without `view-transition-class` ignore the
 * property (the panel then falls back to the default crossfade).
 */
type ViewTransitionStyle = CSSProperties & {
  viewTransitionName?: string;
  viewTransitionClass?: string;
};

/**
 * Style object a panel element declares so tab-switch transitions animate it
 * as its own group (directional slide via {@link TAB_PANEL_TRANSITION_CLASS})
 * instead of riding the root crossfade.
 */
export function tabPanelTransitionStyle(scope: string): CSSProperties {
  const style: ViewTransitionStyle = {
    viewTransitionName: tabPanelTransitionName(scope),
    viewTransitionClass: TAB_PANEL_TRANSITION_CLASS,
  };
  return style;
}

/**
 * Style object a record-shaped element (kanban card, list row, detail body)
 * declares so navigating between two surfaces showing the same record morphs
 * the element instead of cross-fading the page. Both surfaces must resolve
 * the SAME `key` for the pairing to occur (see {@link recordTransitionName}).
 */
export function recordMorphStyle(key: string): CSSProperties {
  const style: ViewTransitionStyle = {
    viewTransitionName: recordTransitionName(key),
    viewTransitionClass: RECORD_MORPH_TRANSITION_CLASS,
  };
  return style;
}

/**
 * Maps an index delta to a {@link ViewTransitionDirection}. A missing index
 * (`< 0`, e.g. the key was not found) or a zero delta resolves to `none`, so
 * degenerate inputs produce the safe directionless crossfade rather than a
 * misleading slide.
 */
export function directionFromIndexDelta(
  previousIndex: number,
  nextIndex: number
): ViewTransitionDirection {
  if (previousIndex < 0 || nextIndex < 0 || previousIndex === nextIndex) return 'none';
  return nextIndex > previousIndex ? 'forward' : 'backward';
}

/** Options accepted by {@link startDirectionalViewTransition}. */
export interface StartDirectionalViewTransitionOptions extends StartViewTransitionOptions {
  /** Slide direction for panels carrying {@link TAB_PANEL_TRANSITION_CLASS}. @default 'none' */
  direction?: ViewTransitionDirection;
}

/**
 * Monotonic stamp of the most recent direction write. Only one native view
 * transition runs at a time, but a second start can supersede a still-running
 * first; the sequence guarantees only the LAST writer's cleanup restores the
 * attribute, even when both writes carried the same direction value.
 */
let directionStampSequence = 0;

/**
 * Start a view transition with a direction stamped on `<html>` for its
 * duration, so the transitions.css directional panel rules apply. On the
 * immediate path (API missing, `skipTransition`, reduced motion) this
 * delegates straight to {@link startDsViewTransition}: the update runs
 * instantly, and the attribute is never written -- reduced motion resolves to
 * a plain state swap with no intermediate frames.
 */
export function startDirectionalViewTransition(
  update: ViewTransitionUpdate,
  options?: StartDirectionalViewTransitionOptions
): DsViewTransitionHandle {
  const doc = typeof document !== 'undefined' ? (document as ViewTransitionDocument) : undefined;
  const direction = options?.direction ?? 'none';
  const canAnimate =
    !!doc &&
    typeof doc.startViewTransition === 'function' &&
    !options?.skipTransition &&
    !environmentPrefersReducedMotion();

  if (!canAnimate || direction === 'none') {
    return startDsViewTransition(update, options);
  }

  const rootElement = doc.documentElement;
  const stamp = ++directionStampSequence;
  rootElement.setAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE, direction);

  const handle = startDsViewTransition(update, options);
  const clear = () => {
    if (stamp === directionStampSequence) {
      rootElement.removeAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE);
    }
  };
  void handle.finished.then(clear, clear);
  return handle;
}

/**
 * React hook returning a stable {@link startDirectionalViewTransition} caller
 * that also honors the live provider-aware motion preference (a
 * `MotionProvider reducedMotion` override, not just the OS media query).
 */
export function useDirectionalViewTransition(): (
  update: ViewTransitionUpdate,
  options?: StartDirectionalViewTransitionOptions
) => DsViewTransitionHandle {
  const prefersReducedMotion = useReducedMotion();
  return useCallback(
    (update: ViewTransitionUpdate, options?: StartDirectionalViewTransitionOptions) =>
      startDirectionalViewTransition(update, {
        ...options,
        skipTransition: options?.skipTransition || prefersReducedMotion,
      }),
    [prefersReducedMotion]
  );
}
