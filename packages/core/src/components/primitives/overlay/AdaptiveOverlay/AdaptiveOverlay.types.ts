/**
 * @fileoverview AdaptiveOverlay Types - Rottay Design System
 * @description Type definitions for the AdaptiveOverlay component.
 * Renders different overlay containers based on the device class:
 * desktop -> Modal, tablet -> Drawer (side), phone -> Sheet (bottom).
 *
 * @module AdaptiveOverlay/Types
 * @category Overlay
 * @package @rottay/design-system
 */

import type { CSSProperties, ReactNode } from 'react';
import type { BaseComponentProps, EngineAwareProps } from '../../../../contracts';

/**
 * Overlay rendering mode.
 * - `modal`: Centered dialog with backdrop (desktop default)
 * - `drawer`: Right-side slide-in panel (tablet default)
 * - `sheet`: Bottom slide-up panel with drag handle (phone default)
 * - `auto`: Automatically selects based on device class
 */
export type AdaptiveOverlayMode = 'modal' | 'drawer' | 'sheet' | 'auto';

/**
 * Props for the AdaptiveOverlay component.
 * A responsive overlay that adapts its presentation to the current device class.
 */
interface AdaptiveOverlayBaseProps extends BaseComponentProps, EngineAwareProps {
  /** Whether the overlay is visible */
  open: boolean;

  /** Title displayed in overlay header */
  title?: ReactNode;

  /** Overlay content */
  children: ReactNode;

  /**
   * Override: force a specific mode regardless of device.
   * @default 'auto'
   */
  mode?: AdaptiveOverlayMode;

  /**
   * Width for modal/drawer modes (desktop/tablet).
   * Accepts a number (px) or CSS string value.
   * @default 520
   */
  width?: number | string;

  /** Footer content (actions) */
  footer?: ReactNode;

  /**
   * Surface styling hook. It targets Sheet's dialog surface directly; Modal
   * and Drawer delegate to their engine-specific top-level class contract.
   */
  surfaceClassName?: string;

  /** Styles paired with `surfaceClassName`, with the same per-engine mapping. */
  surfaceStyle?: CSSProperties;

  /**
   * Content/body hook. It targets Sheet's scrolling body and Modal's body
   * compound; Drawer applies it to a content wrapper inside its native body.
   */
  bodyClassName?: string;

  /** Styles paired with `bodyClassName`, with the same per-mode mapping. */
  bodyStyle?: CSSProperties;

  /**
   * Footer hook. It targets Sheet's non-scrolling footer directly and wraps
   * footer content for Modal/Drawer without changing their native anatomy.
   */
  footerClassName?: string;

  /** Additional styles for the footer hook. */
  footerStyle?: CSSProperties;
}

/** Legacy and controlled close APIs. At least one callback is required. */
type AdaptiveOverlayCloseHandlers =
  | {
      onClose: () => void;
      onOpenChange?: (open: boolean) => void;
    }
  | {
      onClose?: () => void;
      onOpenChange: (open: boolean) => void;
    };

export type AdaptiveOverlayProps = AdaptiveOverlayBaseProps & AdaptiveOverlayCloseHandlers;

/**
 * The resolved mode after device detection.
 * Always one of the concrete modes (never 'auto').
 */
export type ResolvedOverlayMode = Exclude<AdaptiveOverlayMode, 'auto'>;

/**
 * Default values for AdaptiveOverlay component props.
 */
export const ADAPTIVE_OVERLAY_DEFAULTS = {
  mode: 'auto' as const,
  width: 520,
};
