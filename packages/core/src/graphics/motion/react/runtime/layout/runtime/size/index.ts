'use client';

/**
 * @fileoverview useSizeAnimation -- Rottay Design System
 *
 * Animates a node's own size across a re-render: a card that grows, a panel that
 * reveals. Two mechanisms, one contract. Where `interpolate-size:
 * allow-keywords` is supported the kernel interpolates the layout property to
 * the content keyword, which is the only kernel path that is not
 * compositor-only -- keyword interpolation is a layout animation by design.
 * Everywhere else, and whenever `sizeStrategy: 'measured'` forces it, the kernel
 * commits the new size and plays a compositor-only `scale` invert back to it.
 *
 * Usage is `useFlipLayout`'s: `measure()` synchronously before the state update
 * that changes the size, `register(key)` as the ref.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import type { ResolvedSizeStrategy, SizeResult, SizeStrategy } from '../../contracts';
import { LAYOUT_CHANNEL_DEFAULTS } from '../../kernel/channels';
import { useLayoutGroup } from '../../kernel/group';
import { readRects, readTiming } from '../../kernel/measure';
import { cancelInFlight, play } from '../../kernel/play';
import { useReducedMotion } from '../../../foundation/reduced-motion';

export interface UseSizeAnimationOptions {
  /** Channel NAME supplying the duration. Defaults to `--ds-motion-resize`. */
  durationVar?: string;
  /** Channel NAME supplying the easing. Defaults to `--ds-motion-ease-move`. */
  easingVar?: string;
  /** `'measured'` forces the FLIP fallback even where keyword interpolation is supported. */
  sizeStrategy?: SizeStrategy;
  /** Override the live `prefers-reduced-motion` reading (primarily for tests). */
  reducedMotion?: boolean;
}

/** Whether this environment can interpolate a size keyword. */
export function supportsKeywordSizeInterpolation(): boolean {
  return typeof CSS !== 'undefined'
    && typeof CSS.supports === 'function'
    && CSS.supports('interpolate-size', 'allow-keywords');
}

export function useSizeAnimation<K extends string = string>(
  options: UseSizeAnimationOptions = {},
): SizeResult<K> {
  const {
    durationVar = LAYOUT_CHANNEL_DEFAULTS.size.durationVar,
    easingVar = LAYOUT_CHANNEL_DEFAULTS.size.easingVar,
    sizeStrategy = 'auto',
    reducedMotion: reducedMotionOverride,
  } = options;
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionOverride ?? systemReducedMotion;
  const group = useLayoutGroup();

  const strategy = useMemo<ResolvedSizeStrategy>(
    () => (sizeStrategy === 'measured' || !supportsKeywordSizeInterpolation()
      ? 'measured'
      : 'interpolate-size'),
    [sizeStrategy],
  );

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

  useLayoutEffect(() => {
    const firstRects = firstRectsRef.current;
    firstRectsRef.current = null;
    if (!firstRects || reducedMotion) return;

    const lastRects = readRects(nodesRef.current);
    const channelRoot = group?.root() ?? nodesRef.current.values().next().value;
    if (!channelRoot) return;
    const { durationMs, easing } = readTiming(channelRoot, durationVar, easingVar);
    if (durationMs <= 0) return;

    const writes: Array<[HTMLElement, Keyframe[]]> = [];
    nodesRef.current.forEach((node, key) => {
      const first = firstRects.get(key);
      const last = lastRects.get(key);
      if (!first || !last) return;

      const widthChanged = first.width !== last.width;
      const heightChanged = first.height !== last.height;
      if (!widthChanged && !heightChanged) return;

      if (strategy === 'interpolate-size') {
        // `auto` is the endpoint keyword interpolation exists for.
        const from: Keyframe = {};
        const to: Keyframe = {};
        if (heightChanged) {
          from.blockSize = `${first.height}px`;
          to.blockSize = 'auto';
        }
        if (widthChanged) {
          from.inlineSize = `${first.width}px`;
          to.inlineSize = 'auto';
        }
        writes.push([node, [from, to]]);
        return;
      }

      const scaleX = last.width === 0 ? 1 : first.width / last.width;
      const scaleY = last.height === 0 ? 1 : first.height / last.height;
      writes.push([node, [{ transform: `scale(${scaleX}, ${scaleY})` }, { transform: 'none' }]]);
    });

    for (const [node, keyframes] of writes) {
      cancelInFlight(node);
      play(node, keyframes, durationMs, easing);
    }
  });

  return { register, measure, strategy };
}
