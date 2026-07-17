import type { ElementType, ReactNode } from "react";

export interface CropMarksProps {
  /**
   * The framed content — the sole content of this component. The four corner ticks are
   * decorative chrome, not content.
   */
  children: ReactNode;
  /** Element to render as the wrapper. Defaults to `div`. */
  as?: ElementType;
  /** Extra class names on the wrapper. */
  className?: string;
}
