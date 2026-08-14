import type { ElementType } from "react";

import type { ProductWindowProps } from './contracts';

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
  // <figcaption> is only valid inside <figure>, so an `as` override must not
  // leave an orphaned caption element behind.
  const CaptionTag: ElementType = As === "figure" ? "figcaption" : "div";

  return (
    <As className={classes} data-part="root">
      <div className="rt-product-window__frame" data-part="frame">
        <div className="rt-product-window__titlebar" data-part="titlebar">
          <span className="rt-product-window__affordance" data-part="affordance" aria-hidden="true">
            •••
          </span>
          <span className="rt-product-window__label" data-part="label">
            {label}
          </span>
        </div>
        <div className="rt-product-window__content" data-part="content">
          {children}
        </div>
      </div>
      {caption != null && (
        <CaptionTag className="rt-product-window__caption" data-part="caption">
          {caption}
        </CaptionTag>
      )}
    </As>
  );
}

export type { ProductWindowProps } from './contracts';
