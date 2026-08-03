import type {
  AsciiFrameProps,
  AsciiFrameVariant,
} from '../../../foundation/contracts/framing/ascii-frame';

import "./AsciiFrame.css";

const CORNERS: Record<AsciiFrameVariant, { tl: string; tr: string; bl: string; br: string }> = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘" }, // ┌ ┐ └ ┘
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝" }, // ╔ ╗ ╚ ╝
};

/**
 * Box-drawing corner-and-rule framing (spec section 3).
 *
 * Frames cards, callouts, and section labels in the commercial vocabulary. The corner glyphs
 * are decorative (`aria-hidden`) — the frame itself carries no information, so the framed
 * children are the sole content a screenreader encounters (ASCII is never the sole carrier).
 */
export function AsciiFrame({
  children,
  variant = "single",
  label,
  as: As = "div",
  className,
  "aria-label": ariaLabel,
}: AsciiFrameProps): React.JSX.Element {
  const corners = CORNERS[variant];
  const classes = ["rt-ascii-frame", className].filter(Boolean).join(" ");

  return (
    <As
      className={classes}
      data-variant={variant}
      aria-label={ariaLabel}
      role={ariaLabel != null ? "region" : undefined}
    >
      <span className="rt-ascii-frame__corner rt-ascii-frame__corner--tl" aria-hidden="true">
        {corners.tl}
      </span>
      <span className="rt-ascii-frame__corner rt-ascii-frame__corner--tr" aria-hidden="true">
        {corners.tr}
      </span>
      <span className="rt-ascii-frame__corner rt-ascii-frame__corner--bl" aria-hidden="true">
        {corners.bl}
      </span>
      <span className="rt-ascii-frame__corner rt-ascii-frame__corner--br" aria-hidden="true">
        {corners.br}
      </span>
      {label != null && <span className="rt-ascii-frame__label">{label}</span>}
      <div className="rt-ascii-frame__body">{children}</div>
    </As>
  );
}

export type {
  AsciiFrameProps,
  AsciiFrameVariant,
} from '../../../foundation/contracts/framing/ascii-frame';
