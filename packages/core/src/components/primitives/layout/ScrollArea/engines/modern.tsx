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

import React, { useId } from 'react';
import type { ScrollAreaProps } from '../ScrollArea.types';
import { SCROLL_AREA_DEFAULTS, SCROLLBAR_SIZES } from '../ScrollArea.types';

/**
 * Modern ScrollArea component using Tailwind overflow classes and DaisyUI tokens.
 *
 * Overflow control is expressed via Tailwind classes (overflow-x-auto, etc.)
 * while scrollbar appearance uses injected CSS with DaisyUI oklch color
 * variables (--b2, --bc) for automatic dark/light theme adaptation.
 *
 * @param props - ScrollArea props (maxHeight, maxWidth, orientation, scrollbarSize, hideScrollbar, etc.)
 * @returns A React element containing a scoped `<style>` block and a scrollable div.
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

  // SSR-safe unique ID for scoping scrollbar CSS to this instance
  const generatedId = useId();
  const scrollId = `scroll-modern-${generatedId.replace(/:/g, '')}`;
  const barWidth = SCROLLBAR_SIZES[scrollbarSize];

  // Use Tailwind overflow utilities instead of inline styles for better
  // integration with utility-first class composition
  const overflowClasses = (() => {
    switch (orientation) {
      case 'horizontal': return 'overflow-x-auto overflow-y-hidden';
      case 'both': return 'overflow-auto';
      default: return 'overflow-x-hidden overflow-y-auto';
    }
  })();

  // Only maxHeight/maxWidth need inline styles; overflow is class-based
  const containerStyle: React.CSSProperties = {
    maxHeight,
    maxWidth,
    ...style,
  };

  // Uses DaisyUI oklch color tokens so scrollbar colors automatically adapt
  // when the DaisyUI theme changes (light/dark/custom)
  const scrollbarCSS = `
    .${scrollId}::-webkit-scrollbar {
      width: ${barWidth}px;
      height: ${barWidth}px;
    }
    .${scrollId}::-webkit-scrollbar-track {
      background: var(--color-base-200, oklch(0.93 0.01 240));
      border-radius: ${barWidth / 2}px;
    }
    .${scrollId}::-webkit-scrollbar-thumb {
      background: oklch(var(--color-base-content, 0.27 0.01 240) / 0.3);
      border-radius: ${barWidth / 2}px;
    }
    .${scrollId}::-webkit-scrollbar-thumb:hover {
      background: oklch(var(--color-base-content, 0.27 0.01 240) / 0.5);
    }
    ${hideScrollbar ? `
    .${scrollId}::-webkit-scrollbar-thumb {
      background: transparent;
    }
    .${scrollId}:hover::-webkit-scrollbar-thumb {
      background: oklch(var(--color-base-content, 0.27 0.01 240) / 0.3);
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
