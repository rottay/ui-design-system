/**
 * @fileoverview Layout animation kernel -- the write half
 *
 * The only place the kernel calls `Element.animate()`. Keyframes are
 * compositor-only (transform, opacity, clip-path) for every path except the
 * `interpolate-size` size arm, which interpolates a keyword by design.
 */

/**
 * Replaces, rather than stacks, whatever is already animating on the node. The
 * interrupted animation is cancelled, never committed: `commitStyles()` would
 * write its pose onto the node as an inline transform that outlives every later
 * animation and overrides the consumer's own CSS transform for good.
 */
export function cancelInFlight(node: HTMLElement): void {
  for (const animation of node.getAnimations()) {
    animation.cancel();
  }
}

/**
 * Plays one keyframe list on a node and swallows the interruption rejection a
 * later `cancel()` produces, which is control flow here and not an error. The
 * fill is backwards and never forwards: a finished animation leaves no trace,
 * so the node rests on its own stylesheet state, CSS transform included.
 */
export function play(
  node: HTMLElement,
  keyframes: Keyframe[],
  durationMs: number,
  easing: string,
): Animation | null {
  if (durationMs <= 0) return null;
  const animation = node.animate(keyframes, {
    duration: durationMs,
    ...(easing ? { easing } : {}),
    fill: 'backwards',
  });
  animation.finished.catch(() => {});
  return animation;
}
