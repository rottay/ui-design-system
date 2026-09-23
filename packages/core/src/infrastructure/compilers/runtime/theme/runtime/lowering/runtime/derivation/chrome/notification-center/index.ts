/**
 * @fileoverview The notification-center family: the coarse-pointer floor its
 * action chrome reads, emitted so every compiled artifact declares it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/notification-center
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own notification-center chrome outranks every relation stated here. */
export const notificationCenterChromeDeriver: FamilyDeriver = {
  family: "notification-center",
  rank: "derived",
  consumes: ["density"],
  produces: ["--ds-notification-center-touch-target"],
  derive: () => deriveNotificationCenterChannels(),
};

/**
 * The touch target reads the canonical physical-pixel floor, never a rem: the
 * fluid root makes `2.75rem` 41.25px on narrow coarse-pointer screens, and no
 * density posture may erode it.
 */
export function deriveNotificationCenterChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-notification-center-touch-target"] = "var(--ds-touch-target-min, 44px)";
  return vars;
}
