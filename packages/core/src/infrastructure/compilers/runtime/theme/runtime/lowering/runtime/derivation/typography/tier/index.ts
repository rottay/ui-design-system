/**
 * @fileoverview The tier ramp: the leading and tracking a heading tier renders,
 * as channels rather than as literals inside the engine. The roles own what is
 * invariant per role; the tier owns the ramp, and this is where a decision can
 * reach it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/tier
 * @category Compilers
 * @package @rottay/design-system
 */

/**
 * The ramp the modern engine has always painted, one channel per tier and
 * facet. Written out rather than looped: a computed key is invisible to the
 * producer census, which would report every name here as read-without-producer.
 */
export function deriveTypeTierChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-type-tier-xs-line-height"] = "1.4";
  vars["--ds-type-tier-sm-line-height"] = "1.3";
  vars["--ds-type-tier-md-line-height"] = "1.25";
  vars["--ds-type-tier-lg-line-height"] = "1.2";
  vars["--ds-type-tier-xl-line-height"] = "1.15";
  vars["--ds-type-tier-2xl-line-height"] = "1.1";
  vars["--ds-type-tier-3xl-line-height"] = "1.1";
  vars["--ds-type-tier-xs-letter-spacing"] = "0";
  vars["--ds-type-tier-sm-letter-spacing"] = "0";
  vars["--ds-type-tier-md-letter-spacing"] = "-0.01em";
  vars["--ds-type-tier-lg-letter-spacing"] = "-0.015em";
  vars["--ds-type-tier-xl-letter-spacing"] = "-0.02em";
  vars["--ds-type-tier-2xl-letter-spacing"] = "-0.025em";
  vars["--ds-type-tier-3xl-letter-spacing"] = "-0.025em";
  return vars;
}
