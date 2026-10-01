/**
 * @fileoverview The radius rest: the vertical's own dial position, published.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/shape/rest
 * @category Compilers
 * @package @rottay/design-system
 */

/**
 * The constant `--ds-radius-scale-normalized` divides the dial by.
 *
 * `themes/default.css` computes `calc(var(--ds-radius-scale, 1) /
 * var(--ds-radius-scale-rest, 1))` once at `:root`, so a skin corner authored at
 * the vertical's resting pixel paints that pixel at rest in every vertical and
 * moves by the tenant's ratio -- the same semantics `dialReachableRadius` gives
 * the compiler's own chrome. The value IS the radius baseline, never the dial:
 * a static compile resolves it from the vertical, and a tenant block carries the
 * vertical's answer (`TenantFacts.verticalRadiusBaseline`), so a tenant artifact
 * restates the vertical's number and its delta never names the rest. Not a
 * tenant-settable decision, so it has no catalog row and stays out of
 * `shape.radius-scale.produces`.
 */
export function deriveRadiusRest(radiusBaseline: string): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-radius-scale-rest"] = radiusBaseline;
  return vars;
}
