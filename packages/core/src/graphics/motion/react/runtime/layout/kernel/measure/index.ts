/**
 * @fileoverview Layout animation kernel -- the read half
 *
 * Every DOM read the kernel performs lives here, and the play loops call it in
 * one batch BEFORE any write: twelve interleaved read/write cycles on a 12-card
 * grid reflow is the long task the motion budget exists to catch.
 */

/** A resolved animation window: milliseconds plus a computed easing value. */
export interface LayoutTiming {
  durationMs: number;
  easing: string;
}

/** Parses a computed-style time value (e.g. `"200ms"`, `"0.2s"`) to milliseconds. */
export function parseDurationMs(value: string): number {
  const trimmed = value.trim();
  const num = Number.parseFloat(trimmed);
  if (Number.isNaN(num)) return 0;
  return trimmed.endsWith('ms') ? num : num * 1000;
}

/** The MAX duration across a comma-separated computed list (`"0.2s, 0.4s"`). */
export function maxDurationMs(value: string): number {
  if (!value) return 0;
  let max = 0;
  for (const part of value.split(',')) {
    const ms = parseDurationMs(part);
    if (ms > max) max = ms;
  }
  return max;
}

/**
 * Reads the duration and easing channels ONCE, from the element that owns the
 * group. A channel with no resolved duration yields `0`, which every play loop
 * treats as "do not animate" -- the kernel never substitutes a literal.
 */
export function readTiming(root: Element, durationVar: string, easingVar: string): LayoutTiming {
  const computed = getComputedStyle(root);
  return {
    durationMs: parseDurationMs(computed.getPropertyValue(durationVar)),
    easing: computed.getPropertyValue(easingVar).trim(),
  };
}

/** Snapshots every registered element's box in one read pass. */
export function readRects<K>(nodes: Map<K, HTMLElement>): Map<K, DOMRect> {
  const rects = new Map<K, DOMRect>();
  nodes.forEach((node, key) => {
    rects.set(key, node.getBoundingClientRect());
  });
  return rects;
}

/**
 * The window a node's own declared exit motion needs, including delay. Zero
 * means the node declares no exit visual and may unmount immediately.
 */
export function readExitWindowMs(node: HTMLElement): number {
  const computed = getComputedStyle(node);
  const hasAnimation = computed.animationName !== 'none' && computed.animationName !== '';
  const transitionMs = maxDurationMs(computed.transitionDuration);
  if (!hasAnimation && transitionMs <= 0) return 0;
  return Math.max(
    maxDurationMs(computed.animationDuration) + maxDurationMs(computed.animationDelay),
    transitionMs + maxDurationMs(computed.transitionDelay),
  );
}
