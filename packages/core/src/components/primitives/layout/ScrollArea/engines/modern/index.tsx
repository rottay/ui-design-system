/**
 * @fileoverview ScrollArea Modern Engine - Rottay Design System
 * @description Tailwind CSS implementation with styled scrollbar utilities.
 *
 * @module ModernScrollArea
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { useId } from 'react';
import type { ScrollAreaProps } from '../../types';
import { SCROLL_AREA_DEFAULTS, SCROLLBAR_SIZES } from '../../types';

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

  const generatedId = useId();
  const scrollId = `scroll-modern-${generatedId.replace(/:/g, '')}`;
  const barWidth = SCROLLBAR_SIZES[scrollbarSize];

  const overflowClasses = (() => {
    switch (orientation) {
      case 'horizontal': return 'overflow-x-auto overflow-y-hidden';
      case 'both': return 'overflow-auto';
      default: return 'overflow-x-hidden overflow-y-auto';
    }
  })();

  const containerStyle: React.CSSProperties = {
    maxHeight,
    maxWidth,
    ...style,
  };

  const scrollbarCSS = `
    .${scrollId}::-webkit-scrollbar {
      width: ${barWidth}px;
      height: ${barWidth}px;
    }
    .${scrollId}::-webkit-scrollbar-track {
      background: oklch(var(--b2, 0.93 0.01 240));
      border-radius: ${barWidth / 2}px;
    }
    .${scrollId}::-webkit-scrollbar-thumb {
      background: oklch(var(--bc, 0.27 0.01 240) / 0.3);
      border-radius: ${barWidth / 2}px;
    }
    .${scrollId}::-webkit-scrollbar-thumb:hover {
      background: oklch(var(--bc, 0.27 0.01 240) / 0.5);
    }
    ${hideScrollbar ? `
    .${scrollId}::-webkit-scrollbar-thumb {
      background: transparent;
    }
    .${scrollId}:hover::-webkit-scrollbar-thumb {
      background: oklch(var(--bc, 0.27 0.01 240) / 0.3);
    }
    ` : ''}
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarCSS }} />
      <div
        className={`${overflowClasses} ${scrollId} ${className}`}
        style={containerStyle}
        data-testid={dataTestId}
      >
        {children}
      </div>
    </>
  );
}

ModernScrollArea.displayName = 'ModernScrollArea';
