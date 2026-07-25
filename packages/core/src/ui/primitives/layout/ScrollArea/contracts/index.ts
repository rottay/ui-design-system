/**
 * @fileoverview ScrollArea Types - Rottay Design System
 * @description Type definitions for the ScrollArea component.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * ScrollArea component. These types are shared across all engine implementations.
 *
 * @module ScrollAreaTypes
 * @category Layout
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../../foundation/contracts';
import type { ReactNode, CSSProperties } from 'react';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export type ScrollAreaScrollbarSize = 'thin' | 'normal' | 'wide';

export interface ScrollAreaProps extends EngineAwareProps {
  /** Children content */
  children?: ReactNode;
  /** Maximum height of the scroll area */
  maxHeight?: string | number;
  /** Maximum width of the scroll area */
  maxWidth?: string | number;
  /** Scroll direction */
  orientation?: ScrollAreaOrientation;
  /** Scrollbar thickness */
  scrollbarSize?: ScrollAreaScrollbarSize;
  /** Whether to hide the scrollbar until hover */
  hideScrollbar?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Data test id */
  'data-testid'?: string;
  /**
   * Accessible name for the scroll region. When supplied (or
   * `aria-labelledby`), the engine promotes the root to a named
   * `role="region"` landmark. Omit it for ordinary scroll containers: an
   * unnamed scroll area is NOT a landmark, so multiple instances on one
   * page cannot collide (axe landmark-unique; K3-C remediation). The name
   * MUST be meaningful and unique within the page when supplied.
   */
  'aria-label'?: string;
  /**
   * ID of the element that names the scroll region. Same landmark
   * promotion rule as `aria-label`; takes precedence in the accessible
   * name computation when both are supplied.
   */
  'aria-labelledby'?: string;
}

export const SCROLLBAR_SIZES: Record<ScrollAreaScrollbarSize, number> = {
  thin: 4,
  normal: 8,
  wide: 12,
};

export const SCROLL_AREA_DEFAULTS = {
  orientation: 'vertical' as ScrollAreaOrientation,
  scrollbarSize: 'normal' as ScrollAreaScrollbarSize,
  hideScrollbar: false,
};
