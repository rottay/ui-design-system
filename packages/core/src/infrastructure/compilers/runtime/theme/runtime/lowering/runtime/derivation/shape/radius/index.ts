/**
 * @fileoverview The radius ramp: the four dial operands and the pill step.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/shape/radius
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { resolveRadiusScale } from "@/foundation/kernel/geometry/radius-dial";

/**
 * The ramp a theme states, expressed so `shape.radius-scale` moves it once.
 *
 * `themes/default.css` computes each step as `calc(var(--ds-radius-<step>-base)
 * * var(--ds-radius-scale, 1))`, so the operand is where an authored ramp
 * belongs: a flat `--ds-radius-md` at tenant scope replaces that calc entirely
 * and takes the step out of the dial's reach. The operand is normalized against
 * the VERTICAL baseline, never against the dial of the block being compiled --
 * a divisor that tracks the block's own dial reproduces the authored pixel at
 * every position, which is the cancellation this family exists to end.
 *
 * Written as explicit per-step assignments, not a loop: the typed graph both
 * parity gates share seeds identifier domains from initializers, so a `for…of`
 * binding degrades to a wildcard that resolves to no concrete channel.
 */
export function deriveRadiusRamp(
  bt: FlatTheme,
  radiusBaseline: string
): Record<string, string> {
  const vars: Record<string, string> = {};
  const borderRadius = bt.surfaces?.borderRadius;
  if (!borderRadius) return vars;
  const baseline = resolveRadiusScale(radiusBaseline);
  const operand = (authored: string) =>
    baseline === 1 ? authored : `calc(${authored} / ${baseline})`;
  if (borderRadius.sm) vars["--ds-radius-sm-base"] = operand(borderRadius.sm);
  if (borderRadius.md) vars["--ds-radius-md-base"] = operand(borderRadius.md);
  if (borderRadius.lg) vars["--ds-radius-lg-base"] = operand(borderRadius.lg);
  if (borderRadius.xl) vars["--ds-radius-xl-base"] = operand(borderRadius.xl);
  // `full` is a pill radius, outside the dial ramp (themes/default.css).
  if (borderRadius.full) vars["--ds-radius-full"] = borderRadius.full;
  return vars;
}
