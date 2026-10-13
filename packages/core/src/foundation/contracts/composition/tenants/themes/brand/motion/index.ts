import type { TenantMotionDial } from "../../../../../runtime/motion";

/**
 * Motion block of the flat theme view: it types `FlatTheme.motion`, and
 * `DEFAULT_MOTION_SHAPE` in `themes/iso` states its whole shape. The four
 * governed fields are `intensity`, `durationScale`, `ambient` and
 * `character`. The open-ended fields (`entrance`, `entranceDuration`,
 * `hoverLift`, `hoverScale`, `useSpring`, `springTension`, `springFriction`,
 * `pulseSpeed`, `skeletonStyle`, `staggerDelay`, `staggerMax`,
 * `countUpEnabled`) stay admitted: the theme-document schema admits and lowers
 * them so stored theme documents keep resolving. No bundled preset authors
 * them: the evnto experience baseline is authored against
 * `AnimationPersonalityTokens`. Runtime choreography resolves through the
 * vertical MotionProfile plus the bounded TenantMotionDial; DB tenants must not
 * author springs, bounce, keyframes or loop topology.
 */
export interface BrandMotion {
  intensity?: number;
  /** Bounded duration multiplier shared with the tenant motion dial. */
  durationScale?: number;
  /** Behavioral motion policy; intentionally emits no CSS custom property. */
  ambient?: TenantMotionDial["ambient"];
  /**
   * Kit row 23: the SHAPE of motion, orthogonal to the speed dial above.
   *
   * `motion.dial` decides how long a transition takes; this decides what curve
   * it travels and how far a surface moves getting there. Reaches the easing
   * and entrance-offset roles, never a duration -- so a tenant can ask for
   * mechanical motion without also asking for fast motion.
   *
   * One of the four GOVERNED fields on this otherwise open-ended interface
   * (see `intensity`, `durationScale` and `ambient`): bounded, closed, and
   * admissible on both transports. Absent -> `organic`, the engine's own eases.
   */
  character?: "mechanical" | "organic" | "playful";
  entrance?: "none" | "fade" | "slideUp" | "spring" | "bounce";
  entranceDuration?: number;
  hoverLift?: number;
  hoverScale?: number;
  useSpring?: boolean;
  springTension?: number;
  springFriction?: number;
  pulseSpeed?: "none" | "slow" | "normal" | "fast";
  skeletonStyle?: "pulse" | "shimmer" | "wave";
  staggerDelay?: number;
  staggerMax?: number;
  countUpEnabled?: boolean;
}
