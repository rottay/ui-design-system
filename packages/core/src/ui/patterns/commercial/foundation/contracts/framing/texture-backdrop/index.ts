import type { ElementType, ReactNode } from "react";

/**
 * Whisper-contrast CSS-generated pattern (spec section 5): fine grain, a dot grid, diagonal
 * hatch, graph paper, or a halftone screen.
 */
export type TextureBackdropPattern = "grain" | "dots" | "hatch" | "graph" | "halftone";

export interface TextureBackdropProps {
  /** Which pattern paints the backdrop layer. */
  pattern: TextureBackdropPattern;
  /**
   * Backdrop layer opacity (0-1). Defaults to the shared whisper-contrast token
   * (`--ds-commercial-texture-opacity`, ~0.03 — spec section 5: "grain/noise overlays at 2-4%
   * opacity give large flat zones life").
   */
  opacity?: number;
  /** Content painted above the texture layer. */
  children?: ReactNode;
  /** Element to render as the backdrop container. Defaults to `div`. */
  as?: ElementType;
  /** Extra class names on the backdrop container. */
  className?: string;
}
