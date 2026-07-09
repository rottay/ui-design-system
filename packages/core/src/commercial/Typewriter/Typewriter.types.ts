import type { ElementType } from "react";

/** Reveal behavior: `type` for left-to-right character reveal, `decode` for a Matrix-style settle. */
export type TypewriterMode = "type" | "decode";

export interface TypewriterProps {
  /**
   * The real text to reveal. Always rendered in full — screenreaders get the complete value
   * via a visually-hidden span regardless of animation progress (spec section 3 accessibility
   * law: animated/ASCII content is never the sole carrier of information).
   */
  text: string;
  /**
   * Reveal behavior (spec section 3). `type` reveals characters left-to-right; `decode`
   * cycles random mono glyphs that settle to the real character, one settle per character,
   * left to right, Matrix-style. Defaults to `"type"`.
   */
  mode?: TypewriterMode;
  /** Milliseconds per character. Defaults to `28`. */
  speed?: number;
  /** Element to render as the reveal container. Defaults to `span`. */
  as?: ElementType;
  /** Extra class names on the container. */
  className?: string;
}
