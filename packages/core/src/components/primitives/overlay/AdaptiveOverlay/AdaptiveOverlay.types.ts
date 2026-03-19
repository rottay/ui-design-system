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

import type { ReactNode } from 'react';
import type { BaseComponentProps } from '../../../../contracts';

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
export interface AdaptiveOverlayProps extends BaseComponentProps {
  /** Whether the overlay is visible */
  open: boolean;

  /** Close handler */
  onClose: () => void;

  /** Title displayed in overlay header */
  title?: string;

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
}

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
