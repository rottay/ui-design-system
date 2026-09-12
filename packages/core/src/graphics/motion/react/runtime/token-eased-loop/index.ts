'use client';

/**
 * @fileoverview useTokenEasedLoop - Rottay Design System
 *
 * Runs an infinite Web Animations loop on an element with its easing read from
 * a `--ds-motion-*` token at start, so ambient effects follow the tenant's
 * `motion.character` instead of a hard-coded curve. The caller owns the
 * reduced-motion decision through `enabled`: WAAPI loops are not reached by the
 * CSS reduced-motion kill switch.
 */

import { useEffect } from 'react';
import type { RefObject } from 'react';

export type MotionEasingToken = `--ds-motion-ease-${string}`;

export interface UseTokenEasedLoopOptions {
  /** Keyframes of one iteration. */
  keyframes: Keyframe[];
  /** Duration of one iteration, in milliseconds. */
  durationMs: number;
  /** The easing role the loop travels on. */
  easingToken: MotionEasingToken;
  /** False stops (or never starts) the loop. */
  enabled: boolean;
  /** @default 'alternate' */
  direction?: PlaybackDirection;
}

function startLoop(
  node: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
  easing: string
): Animation | undefined {
  if (easing) {
    try {
      return node.animate(keyframes, { ...options, easing });
    } catch {
      // An easing this browser cannot parse throws a TypeError; the loop still runs.
    }
  }
  return node.animate(keyframes, options);
}

export function useTokenEasedLoop<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { keyframes, durationMs, easingToken, enabled, direction = 'alternate' }: UseTokenEasedLoopOptions
): void {
  const keyframesSignature = JSON.stringify(keyframes);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof node.animate !== 'function' || !(durationMs > 0)) return;

    const easing = getComputedStyle(node).getPropertyValue(easingToken).trim();
    const animation = startLoop(
      node,
      JSON.parse(keyframesSignature) as Keyframe[],
      { duration: durationMs, iterations: Infinity, direction },
      easing
    );
    return () => animation?.cancel();
  }, [ref, enabled, durationMs, easingToken, direction, keyframesSignature]);
}
