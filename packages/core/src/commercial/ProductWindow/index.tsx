import type { ProductWindowProps } from "./ProductWindow.types";

import "./ProductWindow.css";

/**
 * ProductWindow — the sanctioned color exception (spec section 1).
 *
 * Every other commercial component is monochrome-only; ProductWindow is the ONE place a live
 * product or design-system demo keeps its real brand colors — framed and labeled as a window
 * into the product so the monochrome chrome makes that color pop. The frame, title bar,
 * affordance dots, and caption rendered here are all grayscale tokens; the content area sets no
 * color of its own, so whatever is passed as `children` shows through untouched.
 */
export function ProductWindow({
  children,
  label,
  caption,
  as: As = "figure",
  className,
}: ProductWindowProps): React.JSX.Element {
  const classes = ["rt-product-window", className].filter(Boolean).join(" ");

  return (
    <As className={classes}>
      <div className="rt-product-window__frame">
        <div className="rt-product-window__titlebar">
          <span className="rt-product-window__affordance" aria-hidden="true">
            •••
          </span>
          <span className="rt-product-window__label">{label}</span>
        </div>
        <div className="rt-product-window__content">{children}</div>
      </div>
      {caption != null && (
        <figcaption className="rt-product-window__caption">{caption}</figcaption>
      )}
    </As>
  );
}

export type { ProductWindowProps } from "./ProductWindow.types";
