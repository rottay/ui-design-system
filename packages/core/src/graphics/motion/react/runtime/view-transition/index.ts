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
