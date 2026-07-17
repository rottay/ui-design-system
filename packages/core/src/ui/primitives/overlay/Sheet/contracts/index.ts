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
import type { EngineAwareProps } from '../../../../../foundation/contracts';

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
  /** Footer actions. Rendered outside the scrollable body. */
  footer?: ReactNode;
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
  /** Additional class for the fixed root wrapper. */
  rootClassName?: string;
  /** Additional styles for the fixed root wrapper. */
  rootStyle?: CSSProperties;
  /** Additional class for the dialog surface. Takes precedence over the legacy panel alias. */
  surfaceClassName?: string;
  /** Additional styles for the dialog surface. Takes precedence over the legacy panel alias. */
  surfaceStyle?: CSSProperties;
  /** Additional class for the scrollable body. */
  bodyClassName?: string;
  /** Additional styles for the scrollable body. */
  bodyStyle?: CSSProperties;
  /** Additional class for the non-scrolling footer. */
  footerClassName?: string;
  /** Additional styles for the non-scrolling footer. */
  footerStyle?: CSSProperties;
  /** ID applied to the dialog surface. */
  id?: string;
  /** Test hook applied to the dialog surface. */
  'data-testid'?: string;
  /** Accessible name for the dialog surface. */
  'aria-label'?: string;
  /** Accessible description relationship for the dialog surface. */
  'aria-describedby'?: string;
  /** Whether focus moves into the sheet when it opens. */
  autoFocus?: boolean;
  /**
   * Whether focus returns to the previously focused element when it closes.
   * Modern and rustic honor this toggle. Classic delegates to Ant Drawer's
   * native focus restoration, which is always enabled.
   */
  restoreFocus?: boolean;
  /** Initial focus target within the sheet (all engines). */
  initialFocus?: string | HTMLElement | null;
  /** Focus target after the sheet closes (all engines when restoration is enabled). */
  finalFocus?: string | HTMLElement | null;
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
  autoFocus: true,
  restoreFocus: true,
};
