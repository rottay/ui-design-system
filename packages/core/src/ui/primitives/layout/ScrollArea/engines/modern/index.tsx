/**
 * @fileoverview ScrollArea Modern Engine - Rottay Design System
 * Token-driven scrollable container with a skin-owned custom scrollbar.
 *
 * @remarks
 * Paint AND the overflow contract live in the modern engine skin
 * (`runtime/engines/modern/skin/scroll-area.css`), keyed on this engine's
 * class pair + `data-part='root'` + `data-orientation`. The engine itself
 * only stamps anatomy and keeps the measured `maxHeight`/`maxWidth` inline
 * (runtime values, not paint). No Tailwind utilities and no DaisyUI tokens
 * remain in this engine.
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
import type { ScrollAreaProps } from '../../contracts';
import { SCROLL_AREA_DEFAULTS } from '../../contracts';

/**
 * Modern ScrollArea component.
 *
 * Scrollbar appearance (size, track, thumb, hover-reveal, Firefox
 * `scrollbar-width`/`scrollbar-color`) and the overflow axes are owned by the
 * modern skin, keyed on `data-scrollbar-size`, `data-hide-scrollbar` and
 * `data-orientation`. `rottay-scroll-area-modern` is retained one release for
 * the legacy shared skin (`presentation/components/skin/scroll-area.css`);
 * the canonical `rottay-scroll-area rottay-scroll-area--modern` pair is what
 * the engine skin anchors on.
 *
 * Landmark law (axe landmark-unique; K3-C remediation): a scroll container
 * is NOT a landmark by default. The root is promoted to a named
 * `role="region"` ONLY when the consumer supplies a meaningful, unique
 * accessible name via `aria-label` or `aria-labelledby`; the old blanket
 * "Scrollable content" default made every instance an indistinguishable
 * landmark. Keyboard focus (`tabIndex=0`) is unconditional: axe
 * scrollable-region-focusable requires keyboard reachability, not a
 * region role.
 *
 * @param props - ScrollArea props (maxHeight, maxWidth, orientation, scrollbarSize, hideScrollbar, aria-label, etc.)
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
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  } = props;

  // maxHeight/maxWidth are runtime-measured values and stay inline; every
  // other channel (overflow axes, scrollbar paint) is skin-owned.
  const containerStyle: React.CSSProperties = {
    maxHeight,
    maxWidth,
    ...style,
  };

  // A blank/whitespace-only name is not meaningful: the root stays a plain
  // (non-landmark) scrollable div and the naming attribute is dropped.
  const hasRegionName = Boolean(ariaLabel?.trim()) || Boolean(ariaLabelledBy?.trim());
  const landmarkProps = hasRegionName
    ? {
        role: 'region' as const,
        ...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {}),
        ...(ariaLabelledBy !== undefined ? { 'aria-labelledby': ariaLabelledBy } : {}),
      }
    : {};

  return (
    <div
      className={`rottay-scroll-area rottay-scroll-area--modern rottay-scroll-area-modern ${className}`.trim()}
      style={containerStyle}
      data-part="root"
      data-orientation={orientation}
      data-scrollbar-size={scrollbarSize}
      data-hide-scrollbar={hideScrollbar ? 'true' : 'false'}
      data-testid={dataTestId}
      tabIndex={0}
      {...landmarkProps}
    >
      {children}
    </div>
  );
}

ModernScrollArea.displayName = 'ModernScrollArea';
