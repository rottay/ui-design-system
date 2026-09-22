'use client';

/**
 * @fileoverview useFlipLayout -- Rottay Design System
 *
 * FLIP (First, Last, Invert, Play) layout motion for keyed elements whose
 * position/size changes across a re-render -- list reorder, kanban card moves, a
 * sliding tab indicator. Transform-only (translate + scale), driven by the Web
 * Animations API so it never touches a layout property (the compositor-only law
 * `scripts/check/engine/tokens/audit/index.mjs` enforces).
 *
 * Usage: call `measure()` synchronously, in the event handler, BEFORE the state
 * update that will move/reorder/resize the registered elements. On the next
 * paint this hook diffs each surviving element's new `getBoundingClientRect()`
 * against the snapshot and plays an inverted transform back to identity. An
 * element with no prior snapshot (newly appeared) is left alone -- that is
 * Presence's job, not FLIP's. An element present in the snapshot but no longer
 * registered (removed) is likewise left alone.
 *
 * Inside a `LayoutGroup`, one consumer's `measure()` arms every consumer in the
 * group, so siblings that move because of the same state change play on the same
 * commit instead of on whichever commit happens to reach them first.
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

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import type { ReflowResult } from '../../contracts';
import { LAYOUT_CHANNEL_DEFAULTS } from '../../kernel/channels';
import { useLayoutGroup } from '../../kernel/group';
import { readRects, readTiming } from '../../kernel/measure';
import { cancelInFlight, play } from '../../kernel/play';
import { useReducedMotion } from '../../../foundation/reduced-motion';

export interface UseFlipLayoutOptions {
  /** CSS custom property NAME (not a `var()` expression) supplying the play-back duration, resolved live from the group's computed style. */
  durationVar?: string;
  /** CSS custom property NAME supplying the easing, resolved live from the group's computed style. */
  easingVar?: string;
  /** Override the live `prefers-reduced-motion` reading (primarily for tests). */
  reducedMotion?: boolean;
}

export type UseFlipLayoutResult<K extends string = string> = ReflowResult<K>;

export function useFlipLayout<K extends string = string>(
  options: UseFlipLayoutOptions = {},
): UseFlipLayoutResult<K> {
  const {
    durationVar = LAYOUT_CHANNEL_DEFAULTS.reflow.durationVar,
    easingVar = LAYOUT_CHANNEL_DEFAULTS.reflow.easingVar,
    reducedMotion: reducedMotionOverride,
  } = options;
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionOverride ?? systemReducedMotion;
  const group = useLayoutGroup();

  const nodesRef = useRef(new Map<K, HTMLElement>());
  const firstRectsRef = useRef<Map<K, DOMRect> | null>(null);

  const register = useCallback(
    (key: K) => (node: HTMLElement | null) => {
      if (node) nodesRef.current.set(key, node);
      else nodesRef.current.delete(key);
    },
    [],
  );

  const snapshot = useCallback(() => {
    firstRectsRef.current = readRects(nodesRef.current);
  }, []);

  useEffect(() => group?.subscribe(snapshot), [group, snapshot]);

  const measure = useCallback(() => {
    if (group) group.armAll();
    else snapshot();
  }, [group, snapshot]);

  // No dependency array: runs after every commit, but is a no-op unless
  // measure() armed firstRectsRef during this render cycle. This is the "Play"
  // step firing on whichever render actually moved the DOM, without requiring
  // the caller to thread a version/generation counter through.
  useLayoutEffect(() => {
    const firstRects = firstRectsRef.current;
    firstRectsRef.current = null;
    if (!firstRects || reducedMotion) return;

    // READ pass: every rect, then the channels once from the group root (or the
    // first registered node when the consumer is standalone).
    const lastRects = readRects(nodesRef.current);
    const channelRoot = group?.root() ?? nodesRef.current.values().next().value;
    if (!channelRoot) return;
    const { durationMs, easing } = readTiming(channelRoot, durationVar, easingVar);
    if (durationMs <= 0) return;

    const inverts: Array<[HTMLElement, string]> = [];
    nodesRef.current.forEach((node, key) => {
      const first = firstRects.get(key);
      const last = lastRects.get(key);
      if (!first || !last) return; // newly-appeared item -- Presence's job, not FLIP's.

      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;
      const scaleX = last.width === 0 ? 1 : first.width / last.width;
      const scaleY = last.height === 0 ? 1 : first.height / last.height;
      if (deltaX === 0 && deltaY === 0 && scaleX === 1 && scaleY === 1) return; // didn't move.

      inverts.push([node, `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`]);
    });

    // WRITE pass: no rect or computed-style read happens past this line.
    for (const [node, transform] of inverts) {
      cancelInFlight(node);
      play(node, [{ transform }, { transform: 'none' }], durationMs, easing);
    }
  });

  return { register, measure };
}
