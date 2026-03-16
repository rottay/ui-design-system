/**
 * @fileoverview ScrollArea Rustic Engine - Rottay Design System
 * Pure CSS scrollable container with no external dependencies. Uses inline
 * styles for overflow control and Firefox scrollbar properties, plus an
 * injected `<style>` block for WebKit ::-webkit-scrollbar customization.
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

import React, { useId } from 'react';
import type { ScrollAreaProps } from '../ScrollArea.types';
import { SCROLL_AREA_DEFAULTS, SCROLLBAR_SIZES } from '../ScrollArea.types';

/**
 * Rustic ScrollArea component using pure CSS for scrollbar styling.
 *
 * Combines inline styles (overflow, scrollbar-width, scrollbar-color) with an
 * injected `<style>` block for ::-webkit-scrollbar rules. The scrollbar-corner
 * rule prevents a mismatched background when both axes scroll simultaneously.
 * Font family is set via the design system token to ensure consistent rendering
 * even in embedded contexts without a parent stylesheet.
 *
 * @param props - ScrollArea props (maxHeight, maxWidth, orientation, scrollbarSize, hideScrollbar, etc.)
 * @returns A React element containing a scoped `<style>` block and a scrollable div.
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

  // SSR-safe unique ID; colons from useId are stripped for CSS class validity
  const generatedId = useId();
  const scrollId = `scroll-rustic-${generatedId.replace(/:/g, '')}`;
  const barWidth = SCROLLBAR_SIZES[scrollbarSize];

  // Determine overflow axes based on the scroll orientation
  const getOverflow = (): React.CSSProperties => {
    switch (orientation) {
      case 'horizontal': return { overflowX: 'auto', overflowY: 'hidden' };
      case 'both': return { overflow: 'auto' };
      default: return { overflowX: 'hidden', overflowY: 'auto' };
    }
  };

  // Inline styles cover Firefox (scrollbar-width, scrollbar-color) and the
  // base font family token; WebKit requires the injected <style> block below
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

  // WebKit scrollbar CSS with design system color tokens and hardcoded fallbacks.
  // The corner rule prevents a white square when both scrollbars are visible.
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
