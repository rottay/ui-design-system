/**
 * @fileoverview ScrollArea Classic Engine - Rottay Design System
 * Ant Design-compatible scrollable container with custom scrollbar styling.
 * Uses the shared ScrollArea skin for ::-webkit-scrollbar rules and the
 * standard `scrollbar-width` / `scrollbar-color` for Firefox.
 *
 * @example
 * ```tsx
 * <ScrollArea engine="classic" maxHeight={400} scrollbarSize="thin">
 *   <LongContent />
 * </ScrollArea>
 * ```
 *
 * @module ClassicScrollArea
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import type { ScrollAreaProps } from '../../contracts';
import { SCROLL_AREA_DEFAULTS } from '../../contracts';

/**
 * Classic ScrollArea component with Ant Design-compatible scrollbar styling.
 *
 * Stamps a stable engine class plus closed size/visibility state attributes.
 * When `hideScrollbar` is true, the thumb is transparent at rest and fades in
 * on hover for a cleaner visual appearance.
 *
 * @param props - ScrollArea props (maxHeight, maxWidth, orientation, scrollbarSize, hideScrollbar, etc.)
 * @returns A scrollable div stamped with the closed scrollbar-state contract.
 */
export default function ClassicScrollArea(props: ScrollAreaProps): React.ReactElement {
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

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    maxHeight,
    maxWidth,
    ...getOverflow(),
    ...style,
  };

  return (
    <div
      className={`rottay-scroll-area-classic ${className}`}
      style={containerStyle}
      data-scrollbar-size={scrollbarSize}
      data-hide-scrollbar={hideScrollbar ? 'true' : 'false'}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

ClassicScrollArea.displayName = 'ClassicScrollArea';
