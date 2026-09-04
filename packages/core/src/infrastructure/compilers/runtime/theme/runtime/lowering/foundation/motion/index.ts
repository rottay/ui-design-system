/**
 * @fileoverview Motion channel writer, including generated spring physics.
 *
 * @module Compilers/Theme/Lowering/Foundation/motion
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { springLinearEasingGentle } from "@/infrastructure/compilers/kernel/foundation/motion/spring-easing";
import { isSpringEligible } from "../personality";

/**
 * The closed motion vocabulary (design-language §2.6): three durations and two
 * easing families, expressed as tokens. `instant` (hover/focus/toggle/pill),
 * `calm` (page/tab transitions, entrance fades, tooltips), and `deliberate`
 * (panel open/resize, sheets, modals) are the ONLY sanctioned durations —
 * app-side raw ms literals are gate-banned in favor of these. The `standard`
 * ease drives everything; `exit` drives dismissals. The three steps are a fixed
 * closed set (120/200/320ms), except that `calm` tracks the theme's own
 * `entranceDuration` so the transition speed a BrandTheme authors for its
 * entrances is the same value tabs and tooltips animate at (design-language §2.6
 * notes calm "matches BITHIRE_PROFILE.transitionSpeed: '200ms'").
 */
export function setMotionVariables(
  vars: Record<string, string>,
  bt: BrandTheme
): void {
  const calmMs = bt.motion?.entranceDuration ?? 200;
  vars["--ds-motion-instant"] = "120ms";
  vars["--ds-motion-calm"] = `${calmMs}ms`;
  vars["--ds-motion-deliberate"] = "320ms";
  vars["--ds-motion-feedback"] =
    "calc(var(--ds-motion-instant) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-reveal"] =
    "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-disclosure"] =
    "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-resize"] =
    "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-rearrange"] =
    "calc(var(--ds-motion-deliberate) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-attention"] =
    "calc(var(--ds-motion-deliberate) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-ease-standard"] = "cubic-bezier(0.2, 0, 0, 1)";
  vars["--ds-ease-exit"] = "cubic-bezier(0.4, 0, 1, 1)";
  vars["--ds-motion-ease-enter"] = "cubic-bezier(0.16, 1, 0.3, 1)";
  vars["--ds-motion-ease-exit"] = "var(--ds-ease-exit)";
  vars["--ds-motion-ease-move"] = "var(--ds-ease-standard)";

  // `--ds-motion-spring-gentle` has no consumer in the static generator's
  // tokenOverrideVariables() (unlike `--ds-motion-spring`, routed through
  // brandThemeToTokenOverrides above), so it is emitted directly as a
  // compiled CSS variable here. It only appears in this compiled block's
  // light-theme selector, but still resolves correctly for dark-themed
  // elements: the generator's dark selector block never redeclares this
  // property, and CSS custom properties fall back to a less-specific rule
  // on a per-property basis when a more-specific rule for the same element
  // omits that property entirely.
  if (isSpringEligible(bt)) {
    vars["--ds-motion-spring-gentle"] = springLinearEasingGentle(
      bt.motion!.springTension!,
      bt.motion!.springFriction!
    );
  }
}
