'use client';

/**
 * @fileoverview useTokenEasedLoop - Rottay Design System
 *
 * Runs an infinite Web Animations loop on an element with its easing read from
 * a `--ds-motion-*` token, so ambient effects follow the tenant's
 * `motion.character` instead of a hard-coded curve. The easing is re-read after
 * every commit and on provider paint-attribute changes, and a running loop
 * retimes in place when the character changes. The caller owns the
 * reduced-motion decision through `enabled`: WAAPI loops are not reached by the
 * CSS reduced-motion kill switch.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { PROVIDER_PAINT_ATTRIBUTE_FILTER } from '@/infrastructure/runtime/dom/runtime/css-color-resolution';

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

interface RunningLoop {
  readonly node: HTMLElement;
  readonly animation: Animation;
  easing: string;
}

function readEasing(node: HTMLElement, easingToken: MotionEasingToken): string {
  return getComputedStyle(node).getPropertyValue(easingToken).trim();
}

function startLoop(
  node: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
  easing: string
): Animation {
  if (easing) {
    try {
      return node.animate(keyframes, { ...options, easing });
    } catch {
      // An easing this browser cannot parse throws a TypeError; the loop still runs.
    }
  }
  return node.animate(keyframes, options);
}

function followEasing(loop: RunningLoop, easingToken: MotionEasingToken): void {
  const easing = readEasing(loop.node, easingToken);
  if (easing === loop.easing) return;
  loop.easing = easing;
  const effect = loop.animation.effect;
  if (!effect) return;
  try {
    effect.updateTiming({ easing: easing || 'linear' });
  } catch {
    effect.updateTiming({ easing: 'linear' });
  }
}

export function useTokenEasedLoop<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { keyframes, durationMs, easingToken, enabled, direction = 'alternate' }: UseTokenEasedLoopOptions
): void {
  const keyframesSignature = JSON.stringify(keyframes);
  const loopRef = useRef<RunningLoop | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof node.animate !== 'function' || !(durationMs > 0)) return;

    const easing = readEasing(node, easingToken);
    const loop: RunningLoop = {
      node,
      easing,
      animation: startLoop(
        node,
        JSON.parse(keyframesSignature) as Keyframe[],
        { duration: durationMs, iterations: Infinity, direction },
        easing
      ),
    };
    loopRef.current = loop;

    const observer =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => followEasing(loop, easingToken));
    for (let owner: HTMLElement | null = node; owner && observer; owner = owner.parentElement) {
      observer.observe(owner, { attributes: true, attributeFilter: [...PROVIDER_PAINT_ATTRIBUTE_FILTER] });
    }

    return () => {
      observer?.disconnect();
      if (loopRef.current === loop) loopRef.current = null;
      loop.animation.cancel();
    };
  }, [ref, enabled, durationMs, easingToken, direction, keyframesSignature]);

  useLayoutEffect(() => {
    if (loopRef.current) followEasing(loopRef.current, easingToken);
  });
}
