/**
 * The one law that keeps an authored radius reachable by `shape.radius-scale`.
 *
 * A radius literal emitted for a tenant lands in the tenant block, which is
 * unlayered and therefore outranks the foundation's
 * `calc(base * var(--ds-radius-scale, 1))` arithmetic. The dial then moves the
 * surface ramp while every corner the tenant authored stays pinned — measured
 * on BitHire, whose button and input held 9px at every dial position.
 *
 * Dividing by the scale the same compilation emits makes the product reproduce
 * the authored value at rest, so no resting pixel moves. The division is
 * expressed for the browser rather than evaluated here, exactly as the surface
 * ramp's `-base` operands are: one multiply-divide pass is exact for any scale
 * instead of correct only for the scales that divide evenly.
 *
 * Shared by every emitter that can write a radius, so the rule has one owner:
 * `chrome-variables` (authored chrome) and `appearance-posture` (the bounded
 * `buttonStyle` presets).
 */

/**
 * A corner radius, in either spelling that reaches a painted corner: the
 * `--ds-<family>-radius` suffix and the `--ds-radius-<family>` alias the
 * control families publish — `--ds-radius-input` is what BitHire's input
 * actually paints through, so a suffix-only match leaves it pinned.
 */
const RADIUS_CHANNEL = /-radius$|^--ds-radius-[a-z0-9-]+$/;

/**
 * Never folded into the dial: the dial itself, which is a ratio and would
 * become self-referential, and the `-base` operands the foundation already
 * multiplies by it, which would apply the scale twice.
 */
const NOT_A_RADIUS_LENGTH = /^--ds-radius-scale$|-base$/;

/**
 * One authored length, the only value shape that can be folded into the dial
 * product. Anything else — a `var()`, a `calc()`, a multi-corner shorthand, a
 * keyword — is left exactly as authored: it either already reads a dial-driven
 * token or is not a single length to multiply.
 */
const SINGLE_LENGTH =
  /^-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|%|ch|ex|vh|vw|vmin|vmax|pt|pc|cm|mm|in|q)?$/i;

/** Normalize an emitted scale to a positive multiplier; anything else is identity. */
export function resolveRadiusScale(radiusScale: string | number | undefined): number {
  const parsed = Number(radiusScale ?? 1);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/**
 * Express one authored radius as its own product with the dial, or return it
 * untouched when it is not a foldable literal.
 */
export function dialReachableRadius(
  authored: string,
  scale: number
): string {
  if (!SINGLE_LENGTH.test(authored.trim())) return authored;
  const operand = scale === 1 ? authored : `${authored} / ${scale}`;
  return `calc(${operand} * var(--ds-radius-scale, 1))`;
}

/**
 * Fold every radius channel in a composed variable map. Applied last, over the
 * finished map, so a radius added to any block above inherits the law without
 * a second edit.
 */
export function applyRadiusDial(
  vars: Record<string, string>,
  radiusScale: string | number | undefined
): void {
  const scale = resolveRadiusScale(radiusScale);
  for (const [channel, authored] of Object.entries(vars)) {
    if (!RADIUS_CHANNEL.test(channel)) continue;
    if (NOT_A_RADIUS_LENGTH.test(channel)) continue;
    vars[channel] = dialReachableRadius(authored, scale);
  }
}
