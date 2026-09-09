/**
 * @fileoverview Typography sub-owner: the closed weight vocabulary and the
 * heading weight bias.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/weights
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

/** The four steps every family binds; 620-860 and the 100/200 band stay out. */
const WEIGHT_STEPS: Readonly<Record<string, string>> = {
  "--ds-font-weight-normal": "400",
  "--ds-font-weight-regular": "var(--ds-font-weight-normal)",
  "--ds-font-weight-medium": "500",
  "--ds-font-weight-semibold": "600",
  "--ds-font-weight-bold": "700",
  "--ds-font-weight-body": "var(--ds-font-weight-normal)",
};

/** Heading/display weight per bias step: lighter, normal, heavier. */
const HEADING_BIAS: Readonly<
  Record<
    NonNullable<NonNullable<BrandTheme["typography"]>["headingWeightBias"]>,
    { heading: string; display: string }
  >
> = {
  lighter: { heading: "500", display: "600" },
  normal: { heading: "600", display: "700" },
  heavier: { heading: "700", display: "800" },
};

/**
 * The weight ladder, and the one decision that moves it.
 *
 * `typography.headingWeightBias` is authorable on both transports and had no
 * channel at all: it reached personality objects and stopped there, so a theme
 * that asked for heavier headings got the same 600 as one that asked for
 * lighter. The bias resolves here, once, onto the two role weights the
 * heading and display surfaces already read.
 */
export function deriveTypeWeightChannels(
  bt: BrandTheme
): Record<string, string> {
  const vars: Record<string, string> = { ...WEIGHT_STEPS };
  const bias = HEADING_BIAS[bt.typography?.headingWeightBias ?? "normal"];
  vars["--ds-font-weight-heading"] = bias.heading;
  vars["--ds-font-weight-display"] = bias.display;
  return vars;
}
