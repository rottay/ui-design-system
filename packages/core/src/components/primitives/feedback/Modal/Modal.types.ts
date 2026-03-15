/**
 * @fileoverview Modal Types - Rottay Design System
 * @description Type definitions for the Modal component and its compound components.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Modal component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `ModalSize`: Width presets from xs to full
 * - `ModalProps`: Main component props interface
 * - `ModalCloseButtonProps`: Close button props
 * - Compound component props (Header, Body, Footer)
 *
 * **Multi-Tenant Support:**
 * Props extend `BaseComponentProps` and `EngineAwareProps` to ensure
 * compatibility with tenant theming and engine switching.
 *
 * @example Type Usage
 * ```tsx
 * import type { ModalProps, ModalSize } from '@rottay/design-system';
 *
 * // Custom modal wrapper with typed props
 * interface CustomModalProps extends ModalProps {
 *   customHeader?: React.ReactNode;
 * }
 *
 * // Type-safe size handling
 * const size: ModalSize = 'lg';
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { MODAL_DEFAULTS, PADDING_MAP } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(MODAL_DEFAULTS.size);     // 'md'
 * console.log(MODAL_DEFAULTS.centered); // true
 * console.log(PADDING_MAP.lg);          // '24px'
 * ```
 *
 * @see {@link ModalProps} - Main component props
 * @see {@link MODAL_DEFAULTS} - Default configuration values
 * @see {@link PADDING_MAP} - Padding size mappings
 * @module Modal/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps } from '../../../../types/common';
import type { EngineAwareProps } from '../../../../types/engine';

// ============================================================================
// Re-exports from Central Types
// ============================================================================

/**
 * Re-export compound component types from central type definitions.
 * These types are shared across the design system.
 */
export type {
  ModalPlacement,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalButtonConfig,
  ModalConfirmProps,
} from '../../../../core/types/primitives/feedback/Modal';

// Use Size from central types
import type { Size } from '../../../../types/common';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Size variants for the Modal component.
 * Extends the base Size type with additional large sizes.
 *
 * @type {string}
 *
 * | Value | Width | Use Case |
 * |-------|-------|----------|
 * | `xs` | 320px | Tooltips, confirmations |
 * | `sm` | 416px | Simple forms |
 * | `md` | 520px | Standard dialogs (default) |
 * | `lg` | 720px | Complex forms |
 * | `xl` | 900px | Multi-section content |
 * | `2xl` | 960px | Wide layouts |
 * | `3xl` | 1120px | Dashboard panels |
 * | `4xl` | 1280px | Full-width content |
 * | `5xl` | 1440px | Near full-screen |
 * | `full` | 100% | Full viewport width |
 */
export type ModalSize = Size | '4xl' | '5xl' | 'full';

// ============================================================================
// Close Button Props
// ============================================================================

/**
 * Props for the Modal CloseButton compound component.
 *
 * @interface ModalCloseButtonProps
 *
 * @example
 * ```tsx
 * <Modal.CloseButton
 *   onClose={handleClose}
 *   size="md"
 *   aria-label="Dismiss dialog"
 * />
 * ```
 */
export interface ModalCloseButtonProps {
  /**
   * Callback fired when the close button is clicked.
   */
  onClose?: () => void;

  /**
   * Additional CSS class names.
   */
  className?: string;

  /**
   * Inline styles for the button.
   */
  style?: React.CSSProperties;

  /**
   * Size of the close button.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Accessible label for screen readers.
   * @default 'Close modal'
   */
  'aria-label'?: string;
}

// ============================================================================
// Main Props Interface
// ============================================================================

/**
 * Props for the Modal component.
 *
 * @interface ModalProps
 * @extends {BaseComponentProps} - Standard props (className, style, id, etc.)
 * @extends {EngineAwareProps} - Engine selection support
 *
 * @remarks
 * This interface supports both simple usage (with `title` and `children`)
 * and compound component patterns (with `Modal.Header`, `Modal.Body`, etc.).
 *
 * @example Simple Usage
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmation"
 *   size="sm"
 * >
 *   Are you sure you want to proceed?
 * </Modal>
 * ```
 *
 * @example Confirmation Dialog
 * ```tsx
 * <Modal
 *   open={open}
 *   title="Delete Item"
 *   okText="Delete"
 *   cancelText="Cancel"
 *   onOk={handleDelete}
 *   onCancel={handleClose}
 *   confirmLoading={isDeleting}
 * >
 *   This action cannot be undone.
 * </Modal>
 * ```
 */
export interface ModalProps extends BaseComponentProps, EngineAwareProps {
  // ---------------------------------------------------------------------------
  // Visibility Control
  // ---------------------------------------------------------------------------

  /**
   * Whether the modal is currently visible.
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
  // Sizing & Layout
  // ---------------------------------------------------------------------------

  /**
   * Predefined width preset for the modal.
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Whether to center the modal vertically.
   * @default true
   */
  centered?: boolean;

  /**
   * Position of the modal on screen.
   * @default 'center'
   */
  placement?: 'center' | 'top' | 'bottom';

  /**
   * Whether the modal takes full viewport.
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Z-index for the modal and overlay.
   * @default 1000
   */
  zIndex?: number;

  /**
   * Border radius preset.
   * @default 'lg'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Whether to show shadow.
   * @default true
   */
  shadow?: boolean;

  /**
   * Content padding preset.
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------

  /**
   * Title displayed in the modal header.
   * Ignored when using `Modal.Header` compound component.
   */
  title?: ReactNode;

  /**
   * Description text below the title.
   */
  description?: ReactNode;

  /**
   * Custom header content.
   * Overrides title and description.
   */
  header?: ReactNode;

  /**
   * Main modal content.
   * Can be plain children or compound components.
   */
  children?: ReactNode;

  /**
   * Footer content, typically action buttons.
   * Ignored when using `Modal.Footer` compound component.
   */
  footer?: ReactNode;

  /**
   * Whether to hide the footer section.
   * @default false
   */
  hideFooter?: boolean;

  /**
   * Whether to show divider between sections.
   * @default false
   */
  divider?: boolean;

  // ---------------------------------------------------------------------------
  // Behavior
  // ---------------------------------------------------------------------------

  /**
   * Callback fired when the modal should close.
   * Triggered by: close button, backdrop click, Escape key.
   */
  onClose?: () => void;

  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Callback fired when the modal opens.
   */
  onOpen?: () => void;

  /**
   * Whether to show the close button (X).
   * @default true
   */
  closable?: boolean;

  /**
   * Whether clicking the overlay closes the modal.
   * @deprecated Use `closeOnBackdropClick` instead.
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Whether clicking the backdrop closes the modal.
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing Escape key closes the modal.
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to prevent body scroll when modal is open.
   * @default true
   */
  preventScroll?: boolean;

  /**
   * Whether to disable open/close animations.
   * @default false
   */
  disableAnimation?: boolean;

  // ---------------------------------------------------------------------------
  // Backdrop/Overlay
  // ---------------------------------------------------------------------------

  /**
   * Whether to show the backdrop overlay.
   * @default true
   */
  showBackdrop?: boolean;

  /**
   * Opacity of the backdrop (0-1).
   * @default 0.45
   */
  overlayOpacity?: number;

  /**
   * Whether the backdrop has blur effect.
   * @default false
   */
  blurBackdrop?: boolean;

  // ---------------------------------------------------------------------------
  // Confirmation Dialog Props
  // ---------------------------------------------------------------------------

  /**
   * Text for the primary action button.
   * @default 'OK'
   */
  okText?: string;

  /**
   * Text for the cancel button.
   * @default 'Cancel'
   */
  cancelText?: string;

  /**
   * Callback for the primary action button.
   */
  onOk?: () => void;

  /**
   * Callback for the cancel button.
   */
  onCancel?: () => void;

  /**
   * Loading state for the primary action button.
   * @default false
   */
  confirmLoading?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Modal component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { MODAL_DEFAULTS } from '@rottay/design-system';
 *
 * const MyModal = (props: ModalProps) => {
 *   const size = props.size ?? MODAL_DEFAULTS.size;
 *   const centered = props.centered ?? MODAL_DEFAULTS.centered;
 *   // ...
 * };
 * ```
 */
export const MODAL_DEFAULTS: Partial<ModalProps> = {
  /** Default width preset */
  size: 'md',

  /** Close button visible by default */
  closable: true,

  /** Clicking overlay closes modal by default */
  closeOnOverlayClick: true,

  /** Clicking backdrop closes modal by default */
  closeOnBackdropClick: true,

  /** Escape key closes modal by default */
  closeOnEscape: true,

  /** Vertically centered by default */
  centered: true,

  /** Backdrop visible by default */
  showBackdrop: true,

  /** No blur by default */
  blurBackdrop: false,

  /** Prevent body scroll by default */
  preventScroll: true,

  /** Large border radius by default */
  radius: 'lg',

  /** Shadow enabled by default */
  shadow: true,

  /** Large padding by default */
  padding: 'lg',

  /** No dividers by default */
  divider: false,

  /** Base z-index for modal layer */
  zIndex: 1000,

  /** Default overlay opacity */
  overlayOpacity: 0.45,

  /** Animations enabled by default */
  disableAnimation: false,
};

// ============================================================================
// Constants
// ============================================================================

/**
 * Padding size mappings for Modal content areas.
 * Used by compound components and engines.
 *
 * @constant
 *
 * @example
 * ```tsx
 * import { PADDING_MAP } from '@rottay/design-system';
 *
 * const padding = PADDING_MAP[props.padding || 'lg'];
 * // '24px'
 * ```
 */
export const PADDING_MAP: Record<string, string> = {
  /** No padding */
  none: '0',
  /** Small padding (12px) */
  sm: '12px',
  /** Medium padding (16px) */
  md: '16px',
  /** Large padding (24px) - default */
  lg: '24px',
};
