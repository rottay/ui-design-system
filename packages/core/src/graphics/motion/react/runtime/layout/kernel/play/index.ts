/**
 * @fileoverview Layout animation kernel -- the write half
 *
 * The only place the kernel calls `Element.animate()`. Keyframes are
 * compositor-only (transform, opacity, clip-path) for every path except the
 * `interpolate-size` size arm, which interpolates a keyword by design.
 */

/**
 * Replaces, rather than stacks, whatever is already animating on the node: a
 * second reorder before the first settles bakes the mid-flight frame in with
 * `commitStyles()` so the new invert is computed against the visible position.
 */
export function cancelInFlight(node: HTMLElement): void {
  for (const animation of node.getAnimations()) {
    try {
      animation.commitStyles();
    } catch {
      // commitStyles() throws when the target is no longer rendered; cancel()
      // below still stops the animation safely either way.
    }
    animation.cancel();
  }
}

/**
 * Plays one keyframe list on a node and swallows the interruption rejection a
 * later `cancel()` produces, which is control flow here and not an error.
 */
export function play(
  node: HTMLElement,
  keyframes: Keyframe[],
  durationMs: number,
  easing: string,
  fill: FillMode = 'both',
): Animation | null {
  if (durationMs <= 0) return null;
  const animation = node.animate(keyframes, {
    duration: durationMs,
    ...(easing ? { easing } : {}),
    fill,
  });
  animation.finished.catch(() => {});
  return animation;
}
