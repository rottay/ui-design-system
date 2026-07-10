'use client';

/**
 * @fileoverview useFlipLayout - Rottay Design System
 *
 * FLIP (First, Last, Invert, Play) layout motion for keyed elements whose
 * position/size changes across a re-render -- list reorder, kanban card
 * moves, a sliding tab indicator. Transform-only (translate + scale), driven
 * by the Web Animations API so it never touches a layout property (the
 * compositor-only law `scripts/engine-token-audit.mjs` enforces).
 *
 * Usage: call `measure()` synchronously, in the event handler, BEFORE the
 * state update that will move/reorder/resize the registered elements. On
 * the next paint this hook diffs each surviving element's new
 * `getBoundingClientRect()` against the snapshot and plays an inverted
 * transform back to identity. An element with no prior snapshot (newly
 * appeared) is left alone -- that is Presence's job, not FLIP's. An element
 * present in the snapshot but no longer registered (removed) is likewise
 * left alone.
 *
 * @example
 * ```tsx
 * const { register, measure } = useFlipLayout<string>();
 *
 * function handleReorder(next: Item[]) {
 *   measure();
 *   setItems(next);
 * }
 *
 * items.map((item) => <li key={item.id} ref={register(item.id)}>{item.label}</li>)
 * ```
 */

import { useCallback, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from '../use-reduced-motion';

export interface UseFlipLayoutOptions {
  /** CSS custom property NAME (not a `var()` expression) supplying the play-back duration, resolved live from each node's computed style. */
  durationVar?: string;
  /** CSS custom property NAME supplying the easing, resolved live from each node's computed style. */
  easingVar?: string;
  /** Override the live `prefers-reduced-motion` reading (primarily for tests). */
  reducedMotion?: boolean;
}

export interface UseFlipLayoutResult<K extends string = string> {
  /** Ref callback for a keyed item. */
  register: (key: K) => (node: HTMLElement | null) => void;
  /** Snapshot every currently-registered element's rect. Call synchronously before the layout-changing state update. */
  measure: () => void;
}

const DEFAULT_DURATION_VAR = '--ds-motion-normal';
const DEFAULT_EASING_VAR = '--ds-motion-ease-out';

/** Parses a computed-style time value (e.g. `"200ms"`, `"0.2s"`) to milliseconds. */
function parseDurationMs(value: string): number {
  const trimmed = value.trim();
  const num = Number.parseFloat(trimmed);
  if (Number.isNaN(num)) return 0;
  return trimmed.endsWith('ms') ? num : num * 1000;
}

export function useFlipLayout<K extends string = string>(
  options: UseFlipLayoutOptions = {},
): UseFlipLayoutResult<K> {
  const { durationVar = DEFAULT_DURATION_VAR, easingVar = DEFAULT_EASING_VAR, reducedMotion: reducedMotionOverride } =
    options;
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionOverride ?? systemReducedMotion;

  const nodesRef = useRef(new Map<K, HTMLElement>());
  const firstRectsRef = useRef<Map<K, DOMRect> | null>(null);

  const register = useCallback(
    (key: K) => (node: HTMLElement | null) => {
      if (node) nodesRef.current.set(key, node);
      else nodesRef.current.delete(key);
    },
    [],
  );

  const measure = useCallback(() => {
    const rects = new Map<K, DOMRect>();
    nodesRef.current.forEach((node, key) => {
      rects.set(key, node.getBoundingClientRect());
    });
    firstRectsRef.current = rects;
  }, []);

  // No dependency array: runs after every commit, but is a no-op unless
  // measure() armed firstRectsRef during this render cycle. This is the
  // "Play" step firing on whichever render actually moved the DOM, without
  // requiring the caller to thread a version/generation counter through.
  useLayoutEffect(() => {
    const firstRects = firstRectsRef.current;
    firstRectsRef.current = null;
    if (!firstRects || reducedMotion) return;

    nodesRef.current.forEach((node, key) => {
      const first = firstRects.get(key);
      if (!first) return; // newly-appeared item -- Presence's job, not FLIP's.

      const last = node.getBoundingClientRect();
      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;
      const scaleX = last.width === 0 ? 1 : first.width / last.width;
      const scaleY = last.height === 0 ? 1 : first.height / last.height;

      if (deltaX === 0 && deltaY === 0 && scaleX === 1 && scaleY === 1) return; // didn't move.

      const computed = getComputedStyle(node);
      const durationMs = parseDurationMs(computed.getPropertyValue(durationVar));
      const easing = computed.getPropertyValue(easingVar).trim() || 'ease';
      if (durationMs <= 0) return;

      // Interruptibility: a FLIP already in flight on this node (a second
      // reorder before the first settles) is replaced, not stacked.
      // commitStyles() bakes the current mid-flight frame into the node's
      // style before cancel() removes the effect, so the resting state the
      // NEW animation's "invert" keyframe below is computed against (via the
      // getBoundingClientRect() calls above, which read the CURRENT
      // committed/animated position) is accurate -- no visual snap.
      for (const anim of node.getAnimations()) {
        try {
          anim.commitStyles();
        } catch {
          // commitStyles() can throw (e.g. target no longer rendered) --
          // cancel() below still stops the animation safely either way.
        }
        anim.cancel();
      }

      node
        .animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})` },
            { transform: 'none' },
          ],
          { duration: durationMs, easing, fill: 'both' },
        )
        .finished.catch(() => {
          // A subsequent interruption rejects the previous animation's
          // `finished` promise -- an expected control-flow signal here, not
          // an application error.
        });
    });
  });

  return { register, measure };
}
