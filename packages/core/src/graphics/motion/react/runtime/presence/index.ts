'use client';

/**
 * @fileoverview usePresence - Rottay Design System
 *
 * Keeps a node mounted for the duration of its own CSS exit transition or
 * animation, so a component can be removed without visually popping out of
 * existence. Drives a `data-state="open" | "closed"` contract: CSS owns both
 * the enter AND exit visuals, this hook only owns *when React stops
 * rendering the node*.
 *
 * Usage contract: attach `ref` to the SPECIFIC element whose own
 * `transition`/`animation` should gate unmount (not an outer wrapper that
 * has no motion of its own -- `animationend`/`transitionend` only fire, and
 * are only accepted, when `event.target` is that exact node). If a
 * choreography spans multiple elements (e.g. a modal backdrop + panel),
 * keep their exit durations equal and ref the primary one; this hook does
 * not wait on more than one element.
 *
 * @example
 * ```tsx
 * const { shouldRender, dataState, ref } = usePresence(open);
 * if (!shouldRender) return null;
 * return <div ref={ref} data-state={dataState} className="fades-on-data-state" />;
 * ```
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../foundation/reduced-motion';
import type { MotionDataState } from '@/graphics/motion/foundation/contracts';

export interface UsePresenceOptions {
  /**
   * Override the live `prefers-reduced-motion` reading (primarily for
   * tests). When true, exit is instant: no wait for animationend/
   * transitionend.
   */
  reducedMotion?: boolean;
  /** Fires once, after the node has actually stopped rendering. */
  onExitComplete?: () => void;
}

export interface UsePresenceResult {
  /** Whether the caller should still render the node (true while present, and while its exit motion is still playing). */
  shouldRender: boolean;
  /** `'open'` while present; `'closed'` from the moment exit is requested. Drive CSS off this, not `present` directly. */
  dataState: MotionDataState;
  /** Ref callback -- attach to the node whose transition/animation gates unmount. */
  ref: (node: HTMLElement | null) => void;
}

/** Sum of the numeric ms/s duration(s) a CSS computed-style property carries, taking the MAX across a comma-separated multi-property list (e.g. `"0.2s, 0.2s"`). */
function maxDurationMs(value: string): number {
  if (!value) return 0;
  let max = 0;
  for (const part of value.split(',')) {
    const trimmed = part.trim();
    const num = Number.parseFloat(trimmed);
    if (Number.isNaN(num)) continue;
    const ms = trimmed.endsWith('ms') ? num : num * 1000;
    if (ms > max) max = ms;
  }
  return max;
}

/**
 * Keeps a node mounted until ITS OWN exit transition/animation completes.
 *
 * On `present: true -> false`, the node stays rendered (`shouldRender`
 * remains `true`) and `dataState` flips to `'closed'` so CSS can play an
 * exit visual. Once the node's `animationend`/`transitionend` fires (or, if
 * neither a transition nor an animation is actually declared for the closed
 * state, immediately), `shouldRender` flips to `false` and the caller
 * unmounts. A safety timeout (declared duration + 100ms) guards against an
 * end event that never fires. `prefers-reduced-motion` (or the
 * `reducedMotion` override) skips the wait entirely.
 */
export function usePresence(present: boolean, options: UsePresenceOptions = {}): UsePresenceResult {
  const [shouldRender, setShouldRender] = useState(present);
  const nodeRef = useRef<HTMLElement | null>(null);
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = options.reducedMotion ?? systemReducedMotion;
  const onExitCompleteRef = useRef(options.onExitComplete);
  onExitCompleteRef.current = options.onExitComplete;

  const setNode = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  useLayoutEffect(() => {
    if (present) {
      setShouldRender(true);
      return;
    }

    const node = nodeRef.current;
    const complete = () => {
      setShouldRender(false);
      onExitCompleteRef.current?.();
    };

    if (!node || reducedMotion) {
      complete();
      return;
    }

    const computed = getComputedStyle(node);
    const hasAnimation = computed.animationName !== 'none' && computed.animationName !== '';
    const transitionMs = maxDurationMs(computed.transitionDuration);
    const hasTransition = transitionMs > 0;

    if (!hasAnimation && !hasTransition) {
      complete();
      return;
    }

    let finished = false;
    const finish = (event?: Event) => {
      if (finished) return;
      // Ignore bubbled animationend/transitionend from descendants -- only
      // this node's own exit motion should gate unmount.
      if (event && event.target !== node) return;
      finished = true;
      node.removeEventListener('animationend', finish);
      node.removeEventListener('transitionend', finish);
      clearTimeout(safetyTimer);
      complete();
    };

    node.addEventListener('animationend', finish);
    node.addEventListener('transitionend', finish);

    const safetyMs = Math.max(
      maxDurationMs(computed.animationDuration) + maxDurationMs(computed.animationDelay),
      transitionMs + maxDurationMs(computed.transitionDelay),
    );
    const safetyTimer = setTimeout(() => finish(), safetyMs + 100);

    return () => {
      node.removeEventListener('animationend', finish);
      node.removeEventListener('transitionend', finish);
      clearTimeout(safetyTimer);
    };
  }, [present, reducedMotion]);

  return {
    shouldRender,
    dataState: present ? 'open' : 'closed',
    ref: setNode,
  };
}
