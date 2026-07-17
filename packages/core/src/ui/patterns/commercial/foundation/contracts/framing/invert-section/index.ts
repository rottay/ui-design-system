import type { ElementType, ReactNode } from "react";

/** Which side of the inversion boundary an `InvertSection` paints: full-black or full-white. */
export type InvertSectionSurface = "ink" | "paper";

export interface InvertSectionProps {
  /**
   * Which surface this section paints. `ink` is the full-black surface (light foreground);
   * `paper` is the full-white surface (dark foreground) — spec section 1: "full-black sections
   * alternate with full-white ones".
   */
  surface: InvertSectionSurface;
  /** Section content. */
  children: ReactNode;
  /** Element to render as the section container. Defaults to `section`. */
  as?: ElementType;
  /** Extra class names on the section container. */
  className?: string;
}
