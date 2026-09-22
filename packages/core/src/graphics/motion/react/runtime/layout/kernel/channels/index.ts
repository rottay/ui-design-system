/**
 * @fileoverview Layout animation kernel -- per-kind channel defaults
 *
 * A move is `--ds-motion-rearrange` + `--ds-motion-ease-move`; a size change is
 * `--ds-motion-resize` + the same move curve. Both duration channels multiply by
 * `--ds-motion-duration-scale` and the curve resolves through
 * `--ds-ease-standard`, so the tenant dial and `motion.character` arrive in the
 * channel and the kernel needs no JS branch for either.
 */

/** The channel pair each timed kind reads unless a call site names another. */
export const LAYOUT_CHANNEL_DEFAULTS = Object.freeze({
  reflow: Object.freeze({
    durationVar: '--ds-motion-rearrange',
    easingVar: '--ds-motion-ease-move',
  }),
  size: Object.freeze({
    durationVar: '--ds-motion-resize',
    easingVar: '--ds-motion-ease-move',
  }),
  shared: Object.freeze({
    durationVar: '--ds-motion-rearrange',
    easingVar: '--ds-motion-ease-move',
  }),
});
