import type { ElementType, ReactNode } from "react";

export interface ProductWindowProps {
  /**
   * The live product or design-system demo framed by the window. This is the sanctioned color
   * exception (spec section 1): whatever renders here keeps its real brand colors untouched —
   * the monochrome chrome around it is what makes that color pop.
   */
  children: ReactNode;
  /**
   * What product or surface this window looks into (e.g. "Dashboard — live view"). Real text
   * rendered in the mono title bar, not decorative ASCII.
   */
  label: ReactNode;
  /** A one-line story under the window: a `figcaption` under the default `figure` container,
   *  and a generic element when `as` overrides it, since `figcaption` needs a `figure` parent. */
  caption?: ReactNode;
  /** Element to render as the window container. Defaults to `figure`. */
  as?: ElementType;
  /** Extra class names on the window container. */
  className?: string;
}
