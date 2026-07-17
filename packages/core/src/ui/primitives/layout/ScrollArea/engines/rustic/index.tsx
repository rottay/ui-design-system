/**
 * @fileoverview ScrollArea Rustic Engine - Rottay Design System
 * Pure CSS scrollable container with no external dependencies. Uses inline
 * styles for overflow control and Firefox scrollbar properties, plus the
 * shared ScrollArea skin for WebKit ::-webkit-scrollbar customization.
 *
 * @example
 * ```tsx
 * <ScrollArea engine="rustic" maxHeight={500} hideScrollbar>
 *   <LongContent />
 * </ScrollArea>
 * ```
 *
 * @module RusticScrollArea
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { ScrollAreaProps } from '../../contracts';
import { SCROLL_AREA_DEFAULTS } from '../../contracts';

/**
 * Rustic ScrollArea component using pure CSS for scrollbar styling.
 *
 * Combines inline styles (overflow, scrollbar-width, scrollbar-color) with the
 * shared skin's ::-webkit-scrollbar rules. The scrollbar-corner
 * rule prevents a mismatched background when both axes scroll simultaneously.
 * Font family is set via the design system token to ensure consistent rendering
 * even in embedded contexts without a parent stylesheet.
 *
 * @param props - ScrollArea props (maxHeight, maxWidth, orientation, scrollbarSize, hideScrollbar, etc.)
 * @returns A scrollable div stamped with the closed scrollbar-state contract.
 */
export default function RusticScrollArea(props: ScrollAreaProps): React.ReactElement {
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

  // Determine overflow axes based on the scroll orientation
  const getOverflow = (): React.CSSProperties => {
    switch (orientation) {
      case 'horizontal':
        return { overflowX: 'auto', overflowY: 'hidden' };
      case 'both':
        return { overflow: 'auto' };
      default:
        return { overflowX: 'hidden', overflowY: 'auto' };
    }
  };

  // Inline styles cover Firefox (scrollbar-width, scrollbar-color) and the
  // base font family token; WebKit paint lives in the shared ScrollArea skin
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    maxHeight,
    maxWidth,
    fontFamily: 'var(--ds-font-family-base)',
    ...getOverflow(),
    scrollbarWidth: scrollbarSize === 'thin' ? 'thin' : 'auto',
    scrollbarColor: 'var(--ds-color-neutral-400, #bfbfbf) var(--ds-color-neutral-100, #f5f5f5)',
    ...style,
  };

  return (
    <div
      className={`rottay-scroll-area-rustic ${className}`}
      style={containerStyle}
      data-scrollbar-size={scrollbarSize}
      data-hide-scrollbar={hideScrollbar ? 'true' : 'false'}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

RusticScrollArea.displayName = 'RusticScrollArea';
