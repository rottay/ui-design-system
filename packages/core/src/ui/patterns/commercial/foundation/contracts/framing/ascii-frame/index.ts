import type { ElementType, ReactNode } from "react";

/** Emphasis level: `single` box-drawing, or `double` for the highest-emphasis frames. */
export type AsciiFrameVariant = "single" | "double";

export interface AsciiFrameProps {
  /** Framed content. */
  children?: ReactNode;
  /**
   * Emphasis. `single` uses `┌ ─ ┐ │ └ ┘` corner-and-rule framing; `double` uses `╔ ═ ╗`
   * and is reserved for the highest-emphasis frames (spec section 3).
   */
  variant?: AsciiFrameVariant;
  /**
   * Optional mono label seated in the top rule (e.g. a title or part number). Purely a
   * caption of the framed content; it is real text, not decorative ASCII.
   */
  label?: ReactNode;
  /** Element to render as the frame container. Defaults to `div`. */
  as?: ElementType;
  /** Extra class names on the frame container. */
  className?: string;
  /** Accessible label for the frame region when it groups meaningful content. */
  "aria-label"?: string;
}
