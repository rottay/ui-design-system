import type { InvertSectionProps } from "./InvertSection.types";

import "./InvertSection.css";

/**
 * InvertSection — full-black / full-white inversion boundary (spec section 1).
 *
 * "Full-black sections alternate with full-white ones; crossing a section boundary must feel
 * deliberate." This component paints a full-bleed surface — background from
 * `--ds-commercial-bg`, text from `--ds-commercial-fg` — both reassigned locally from the
 * `surface` prop, mirroring the same ink/paper token pairing `commercial-ramp.css` defines once
 * for `.ds-commercial[data-surface="paper"]`, so an `InvertSection` is a self-contained
 * inversion boundary wherever it is placed. A top hairline marks the crossing explicitly.
 * Purely presentational and server-safe — the crossing reads through color and framing, never
 * motion.
 */
export function InvertSection({
  children,
  surface,
  as: As = "section",
  className,
}: InvertSectionProps): React.JSX.Element {
  const classes = ["rt-invert-section", className].filter(Boolean).join(" ");

  return (
    <As className={classes} data-surface={surface}>
      {children}
    </As>
  );
}

export type { InvertSectionProps, InvertSectionSurface } from "./InvertSection.types";
