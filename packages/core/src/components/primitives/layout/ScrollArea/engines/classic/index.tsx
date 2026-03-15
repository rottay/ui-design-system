/**
 * @fileoverview ScrollArea Classic Engine - Rottay Design System
 * @description Ant Design compatible scrollable container with styled scrollbar.
 *
 * @module ClassicScrollArea
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { useId } from 'react';
import type { ScrollAreaProps } from '../../types';
import { SCROLL_AREA_DEFAULTS, SCROLLBAR_SIZES } from '../../types';

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

  const generatedId = useId();
  const scrollId = `scroll-classic-${generatedId.replace(/:/g, '')}`;
  const barWidth = SCROLLBAR_SIZES[scrollbarSize];

  const getOverflow = (): React.CSSProperties => {
    switch (orientation) {
      case 'horizontal': return { overflowX: 'auto', overflowY: 'hidden' };
      case 'both': return { overflow: 'auto' };
      default: return { overflowX: 'hidden', overflowY: 'auto' };
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    maxHeight,
    maxWidth,
    ...getOverflow(),
    ...style,
  };

  const scrollbarCSS = `
    .${scrollId}::-webkit-scrollbar {
      width: ${barWidth}px;
      height: ${barWidth}px;
    }
    .${scrollId}::-webkit-scrollbar-track {
      background: var(--ds-color-neutral-100, #f5f5f5);
      border-radius: ${barWidth / 2}px;
    }
    .${scrollId}::-webkit-scrollbar-thumb {
      background: var(--ds-color-neutral-400, #bfbfbf);
      border-radius: ${barWidth / 2}px;
      transition: background 0.2s ease;
    }
    .${scrollId}::-webkit-scrollbar-thumb:hover {
      background: var(--ds-color-neutral-500, #8c8c8c);
    }
    ${hideScrollbar ? `
    .${scrollId}::-webkit-scrollbar-thumb {
      background: transparent;
    }
    .${scrollId}:hover::-webkit-scrollbar-thumb {
      background: var(--ds-color-neutral-400, #bfbfbf);
    }
    ` : ''}
    .${scrollId} {
      scrollbar-width: ${scrollbarSize === 'thin' ? 'thin' : 'auto'};
      scrollbar-color: var(--ds-color-neutral-400, #bfbfbf) var(--ds-color-neutral-100, #f5f5f5);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarCSS }} />
      <div
        className={`rottay-scroll-area-classic ${scrollId} ${className}`}
        style={containerStyle}
        data-testid={dataTestId}
      >
        {children}
      </div>
    </>
  );
}

ClassicScrollArea.displayName = 'ClassicScrollArea';
