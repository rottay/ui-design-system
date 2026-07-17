/**
 * @fileoverview Drawer Types - Rottay Design System
 * @description Type definitions for the Drawer component and its compound components.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Drawer component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `DrawerPlacement`: Edge of the screen where the drawer appears
 * - `DrawerSize`: Predefined width/height presets
 * - `DrawerProps`: Main component props interface
 *
 * **Multi-Tenant Support:**
 * Props extend `BaseComponentProps` and `EngineAwareProps` to ensure
 * compatibility with tenant theming and engine switching.
 *
 * @example Type Usage
 * ```tsx
 * import type { DrawerProps, DrawerPlacement, DrawerSize } from '@rottay/design-system';
 *
 * // Custom drawer wrapper with typed props
 * interface CustomDrawerProps extends DrawerProps {
 *   customHeader?: React.ReactNode;
 * }
 *
 * // Type-safe placement handling
 * const placement: DrawerPlacement = 'right';
 * const size: DrawerSize = 'lg';
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { DRAWER_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(DRAWER_DEFAULTS.placement); // 'right'
 * console.log(DRAWER_DEFAULTS.size);      // 'md'
 * console.log(DRAWER_DEFAULTS.zIndex);    // 1000
 * ```
 *
 * @see {@link DrawerProps} - Main component props
 * @see {@link DRAWER_DEFAULTS} - Default configuration values
 * @module Drawer/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { EngineAwareProps, BaseComponentProps } from '../../../../../foundation/contracts';
import type { ReactNode } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Placement options for the Drawer component.
 * Determines which edge of the screen the drawer slides in from.
 *
 * @type {string}
 *
 * | Value | Description |
 * |-------|-------------|
 * | `left` | Slides in from the left edge |
 * | `right` | Slides in from the right edge (default) |
 * | `top` | Slides down from the top edge |
 * | `bottom` | Slides up from the bottom edge |
 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/**
 * Size presets for the Drawer component.
 * Maps to predefined width (for left/right) or height (for top/bottom).
 *
 * @type {string}
 *
 * | Value | Width/Height | Use Case |
 * |-------|-------------|----------|
 * | `sm` | 256px | Simple forms, quick actions |
 * | `md` | 378px | Standard forms (default) |
 * | `lg` | 520px | Complex forms, detail views |
 * | `xl` | 736px | Multi-section content |
 * | `full` | 100% | Full-screen overlays |
 */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props for the Drawer component.
 *
 * @interface DrawerProps
 * @extends {BaseComponentProps} - Standard props (className, style, id, etc.)
 * @extends {EngineAwareProps} - Engine selection support
 *
 * @example Complete Usage
 * ```tsx
 * <Drawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onOpenChange={setIsOpen}
 *   placement="right"
 *   size="lg"
 *   title="Edit Profile"
 *   closable
 *   closeOnOverlayClick
 *   closeOnEscape
 *   mask
 *   maskOpacity={0.5}
 *   zIndex={1100}
 *   footer={<Button onClick={save}>Save</Button>}
 * >
 *   <ProfileForm />
 * </Drawer>
 * ```
 */
export interface DrawerProps extends BaseComponentProps, EngineAwareProps {
  // ---------------------------------------------------------------------------
  // Visibility Control
  // ---------------------------------------------------------------------------

  /**
   * Whether the drawer is currently visible.
   * Use with `onClose` for controlled mode.
   * @default false
   */
  open?: boolean;

  /**
   * Initial open state for uncontrolled mode.
   * Prefer controlled mode (`open` + `onClose`) for most cases.
   * @default false
   */
  defaultOpen?: boolean;

  // ---------------------------------------------------------------------------
  // Layout & Sizing
  // ---------------------------------------------------------------------------

  /**
   * Which edge of the screen the drawer appears from.
   * @default 'right'
   */
  placement?: DrawerPlacement;

  /**
   * Predefined size preset.
   * Use `width` or `height` props for custom dimensions.
   * @default 'md'
   */
  size?: DrawerSize;

  /**
   * Custom width for left/right placement.
   * Overrides the `size` preset when specified.
   * @example 400
   * @example '50vw'
   * @example 'calc(100% - 200px)'
   */
  width?: number | string;

  /**
   * Custom height for top/bottom placement.
   * Overrides the `size` preset when specified.
   * @example 300
   * @example '50vh'
   * @example 'auto'
   */
  height?: number | string;

  /**
   * Z-index for the drawer and overlay layers.
   * Drawer content is rendered at `zIndex + 1`.
   * @default 1000
   */
  zIndex?: number;

  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------

  /**
   * Title displayed in the drawer header.
   * Can be a string or custom React elements.
   * @example "Edit Profile"
   * @example <><Icon name="edit" /> Edit Profile</>
   */
  title?: ReactNode;

  /**
   * Main drawer content.
   * For structured layouts, use compound components instead:
   * `<Drawer.Header>`, `<Drawer.Body>`, `<Drawer.Footer>`
   */
  children?: ReactNode;

  /**
   * Footer content, typically action buttons.
   * Hidden when `hideFooter` is true.
   */
  footer?: ReactNode;

  /**
   * Whether to hide the footer section.
   * @default false
   */
  hideFooter?: boolean;

  // ---------------------------------------------------------------------------
  // Behavior
  // ---------------------------------------------------------------------------

  /**
   * Callback fired when the drawer should close.
   * Triggered by: close button, overlay click (if enabled), Escape key (if enabled).
   */
  onClose?: () => void;

  /**
   * Callback fired when open state changes.
   * Provides the new state, useful for uncontrolled mode.
   * @param open - New open state
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether to show the close button (X) in the header.
   * @default true
   */
  closable?: boolean;

  /**
   * Whether clicking the overlay/mask closes the drawer.
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Whether pressing Escape key closes the drawer.
   * @default true
   */
  closeOnEscape?: boolean;

  // ---------------------------------------------------------------------------
  // Overlay/Mask
  // ---------------------------------------------------------------------------

  /**
   * Whether to show a semi-transparent overlay behind the drawer.
   * @default true
   */
  mask?: boolean;

  /**
   * Opacity of the overlay mask (0-1).
   * Only applies when `mask` is true.
   * @default 0.45
   */
  maskOpacity?: number;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Drawer component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { DRAWER_DEFAULTS } from '@rottay/design-system';
 *
 * const MyDrawer = (props: DrawerProps) => {
 *   const placement = props.placement ?? DRAWER_DEFAULTS.placement;
 *   const size = props.size ?? DRAWER_DEFAULTS.size;
 *   // ...
 * };
 * ```
 */
export const DRAWER_DEFAULTS: Partial<DrawerProps> = {
  /** Default placement is right edge */
  placement: 'right',

  /** Default size is medium (378px) */
  size: 'md',

  /** Close button visible by default */
  closable: true,

  /** Clicking overlay closes drawer by default */
  closeOnOverlayClick: true,

  /** Escape key closes drawer by default */
  closeOnEscape: true,

  /** Base z-index for drawer layer */
  zIndex: 1000,

  /** Overlay is visible by default */
  mask: true,

  /** Default overlay opacity */
  maskOpacity: 0.45,
};
