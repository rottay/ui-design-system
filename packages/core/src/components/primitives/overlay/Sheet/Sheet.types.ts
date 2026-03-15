/**
 * @fileoverview Sheet Types - Rottay Design System
 * @description Type definitions for the Sheet component.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @module Sheet/Types
 * @category Overlay
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

/** Side from which the sheet slides in */
export type SheetSide = 'bottom' | 'left' | 'right';

/**
 * Props for the Sheet component.
 * A bottom/side sheet for mobile-first layouts.
 */
export interface SheetProps extends EngineAwareProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Side from which the sheet slides in */
  side?: SheetSide;
  /** Sheet content */
  children: ReactNode;
  /** Title displayed in the sheet header */
  title?: ReactNode;
  /** Optional snap points for bottom sheet (percentage heights, e.g. [0.25, 0.5, 1]) */
  snapPoints?: number[];
  /** Whether to show the drag handle (bottom sheet only) */
  showHandle?: boolean;
  /** Whether to show overlay backdrop */
  showOverlay?: boolean;
  /** Whether pressing Escape closes the sheet */
  closeOnEscape?: boolean;
  /** Whether clicking the overlay closes the sheet */
  closeOnOverlayClick?: boolean;
  /** Additional class for the sheet panel */
  panelClassName?: string;
  /** Additional styles for the sheet panel */
  panelStyle?: CSSProperties;
}

/**
 * Default values for Sheet component props.
 */
export const SHEET_DEFAULTS = {
  side: 'bottom' as SheetSide,
  showHandle: true,
  showOverlay: true,
  closeOnEscape: true,
  closeOnOverlayClick: true,
};
