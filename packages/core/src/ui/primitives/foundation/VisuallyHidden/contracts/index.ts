import React from 'react';

/**
 * Contract for the engine-independent VisuallyHidden primitive.
 *
 * @description VisuallyHidden carries content intended only for assistive
 * technology (accessible names, live-region announcements, status text)
 * without any visual footprint. It exists so no family rebuilds the
 * screen-reader-only technique with local classes, supplier utilities or
 * inline clip geometry.
 */
export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** Rendered tag. Defaults to `span`. */
  as?: 'span' | 'div';
  /**
   * Reveal on focus: the content stays clipped until it (or a descendant)
   * receives keyboard focus — the skip-link pattern. Use for interactive
   * content that must become visible to keyboard users on focus.
   */
  focusable?: boolean;
  /** Content announced by assistive technology. */
  children?: React.ReactNode;
}
