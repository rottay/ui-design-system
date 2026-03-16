/**
 * @fileoverview ScrollArea Classic Engine - Rottay Design System
 * Ant Design-compatible scrollable container with custom scrollbar styling.
 * Injects a scoped `<style>` block for ::-webkit-scrollbar rules and uses
 * the standard `scrollbar-width` / `scrollbar-color` for Firefox.
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

import React, { useId } from 'react';
import type { ScrollAreaProps } from '../ScrollArea.types';
import { SCROLL_AREA_DEFAULTS, SCROLLBAR_SIZES } from '../ScrollArea.types';

/**
 * Classic ScrollArea component with Ant Design-compatible scrollbar styling.
 *
 * Generates a unique CSS class per instance to scope ::-webkit-scrollbar rules.
 * When `hideScrollbar` is true, the thumb is transparent at rest and fades in
 * on hover for a cleaner visual appearance.
 *
 * @param props - ScrollArea props (maxHeight, maxWidth, orientation, scrollbarSize, hideScrollbar, etc.)
 * @returns A React element containing a scoped `<style>` block and a scrollable div.
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

  // SSR-safe unique ID for scoping scrollbar CSS to this specific instance
  const generatedId = useId();
  const scrollId = `scroll-classic-${generatedId.replace(/:/g, '')}`;
  const barWidth = SCROLLBAR_SIZES[scrollbarSize];

  // Determine overflow axes based on the scroll orientation
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

  // Scoped CSS: WebKit scrollbar rules use the instance-unique class selector.
  // Firefox support is provided via standard scrollbar-width/scrollbar-color.
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
