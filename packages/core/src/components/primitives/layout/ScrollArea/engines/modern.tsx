/**
 * @fileoverview ScrollArea Modern Engine - Rottay Design System
 * Tailwind/DaisyUI scrollable container with custom scrollbar styling.
 * Uses Tailwind overflow utilities for axis control and DaisyUI's oklch
 * color tokens for scrollbar theming that adapts to theme changes.
 *
 * @example
 * ```tsx
 * <ScrollArea engine="modern" maxHeight={300} orientation="both">
 *   <WideAndTallContent />
 * </ScrollArea>
 * ```
 *
 * @module ModernScrollArea
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { ScrollAreaProps } from '../ScrollArea.types';
import { SCROLL_AREA_DEFAULTS } from '../ScrollArea.types';

/**
 * Modern ScrollArea component using Tailwind overflow classes and DaisyUI tokens.
 *
 * Overflow control is expressed via Tailwind classes (overflow-x-auto, etc.)
 * while scrollbar appearance uses the shared ScrollArea skin with DaisyUI oklch color
 * variables (--b2, --bc) for automatic dark/light theme adaptation.
 *
 * @param props - ScrollArea props (maxHeight, maxWidth, orientation, scrollbarSize, hideScrollbar, etc.)
 * @returns A scrollable div stamped with the closed scrollbar-state contract.
 */
export default function ModernScrollArea(props: ScrollAreaProps): React.ReactElement {
  const {
    children,
    maxHeight,
    maxWidth,
    orientation = SCROLL_AREA_DEFAULTS.orientation,
    scrollbarSize = SCROLL_AREA_DEFAULTS.scrollbarSize,
    hideScrollbar = SCROLL_AREA_DEFAULTS.hideScrollbar,
    className = '',
    style,
    'data-testid': dataTestId,
  } = props;

  // Use Tailwind overflow utilities instead of inline styles for better
  // integration with utility-first class composition
  const overflowClasses = (() => {
    switch (orientation) {
      case 'horizontal':
        return 'overflow-x-auto overflow-y-hidden';
      case 'both':
        return 'overflow-auto';
      default:
        return 'overflow-x-hidden overflow-y-auto';
    }
  })();

  // Only maxHeight/maxWidth need inline styles; overflow is class-based
  const containerStyle: React.CSSProperties = {
    maxHeight,
    maxWidth,
    ...style,
  };

  return (
    <div
      className={`${overflowClasses} rottay-scroll-area-modern ${className}`}
      style={containerStyle}
      data-scrollbar-size={scrollbarSize}
      data-hide-scrollbar={hideScrollbar ? 'true' : 'false'}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

ModernScrollArea.displayName = 'ModernScrollArea';
