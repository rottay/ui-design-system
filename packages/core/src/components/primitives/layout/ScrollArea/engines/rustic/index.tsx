/**
 * @fileoverview ScrollArea Rustic Engine - Rottay Design System
 * @description Pure CSS implementation with ::-webkit-scrollbar styling.
 *
 * @module RusticScrollArea
 * @category Layout
 * @package @rottay/design-system
 */

'use client';

import React, { useId } from 'react';
import type { ScrollAreaProps } from '../../types';
import { SCROLL_AREA_DEFAULTS, SCROLLBAR_SIZES } from '../../types';

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

  const generatedId = useId();
  const scrollId = `scroll-rustic-${generatedId.replace(/:/g, '')}`;
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
    fontFamily: 'var(--ds-font-family-base)',
    ...getOverflow(),
    scrollbarWidth: scrollbarSize === 'thin' ? 'thin' : 'auto',
    scrollbarColor: 'var(--ds-color-neutral-400, #bfbfbf) var(--ds-color-neutral-100, #f5f5f5)',
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
      border: 1px solid var(--ds-color-neutral-100, #f5f5f5);
    }
    .${scrollId}::-webkit-scrollbar-thumb:hover {
      background: var(--ds-color-neutral-500, #8c8c8c);
    }
    .${scrollId}::-webkit-scrollbar-corner {
      background: var(--ds-color-neutral-100, #f5f5f5);
    }
    ${hideScrollbar ? `
    .${scrollId}::-webkit-scrollbar-thumb {
      background: transparent;
      border-color: transparent;
    }
    .${scrollId}:hover::-webkit-scrollbar-thumb {
      background: var(--ds-color-neutral-400, #bfbfbf);
      border-color: var(--ds-color-neutral-100, #f5f5f5);
    }
    ` : ''}
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarCSS }} />
      <div
        className={`rottay-scroll-area-rustic ${scrollId} ${className}`}
        style={containerStyle}
        data-testid={dataTestId}
      >
        {children}
      </div>
    </>
  );
}

RusticScrollArea.displayName = 'RusticScrollArea';
