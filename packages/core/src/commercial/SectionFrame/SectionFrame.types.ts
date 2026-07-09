import type { ElementType, ReactNode } from "react";

export interface SectionFrameProps {
  /** Section content. */
  children?: ReactNode;
  /**
   * Section index rendered as a mono `[01]` marker. A number is zero-padded to two digits;
   * a string is used verbatim.
   */
  index?: number | string;
  /** Section title, shown next to the index in the mono label rule. */
  title?: ReactNode;
  /** Optional right-aligned mono annotation in the label rule (e.g. a count or status). */
  meta?: ReactNode;
  /** Element to render as the section container. Defaults to `section`. */
  as?: ElementType;
  /** Extra class names on the section container. */
  className?: string;
  /**
   * Heading level for the title, so the document outline is correct (default `h2`). The
   * visual size is fixed by the mono-label style regardless of level.
   */
  headingLevel?: "h1" | "h2" | "h3" | "h4";
}
