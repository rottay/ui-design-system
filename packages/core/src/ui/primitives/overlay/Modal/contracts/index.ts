/**
 * @fileoverview Modal component types.
 * Type definitions for the Modal component including size, placement,
 * and compound component props for header, body, and footer sections.
 */

import type { ReactNode, MouseEvent } from 'react';
import type { BaseComponentProps, ModalSize, WithChildren } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';

export type { ModalSize };

/**
 * Modal placement options.
 * Determines where the modal appears on the screen.
 */
export type ModalPlacement = 'center' | 'top' | 'bottom';

/**
 * Props for the Modal component.
 * A flexible dialog overlay for displaying content that requires user attention.
 */
export interface ModalProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Whether the modal is open.
   */
  open: boolean;

  /**
   * Callback when the modal should close.
   */
  onClose: () => void;

  /**
   * Modal size.
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Modal title.
   */
  title?: ReactNode;

  /**
   * Modal description.
   */
  description?: ReactNode;

  /**
   * Custom header content.
   */
  header?: ReactNode;

  /**
   * Custom footer content.
   */
  footer?: ReactNode;

  /**
   * Whether clicking the backdrop closes the modal.
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing ESC closes the modal.
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to show the close button (X).
   * @default true
   */
  closable?: boolean;

  /**
   * Whether to show the backdrop.
   * @default true
   */
  showBackdrop?: boolean;

  /**
   * Whether the backdrop has blur effect.
   * @default false
   */
  blurBackdrop?: boolean;

  /**
   * Modal position on screen.
   * @default 'center'
   */
  placement?: ModalPlacement;

  /**
   * Whether the modal takes up the full viewport.
   */
  fullScreen?: boolean;

  /**
   * When true, automatically renders the modal as fullscreen on mobile
   * viewports (< 640px): 100vw width, 100dvh height, zero border-radius,
   * no max-width constraint, and fixed positioning at top-left.
   *
   * This provides a native app-like experience on small screens while
   * keeping the standard centered dialog on tablet/desktop.
   *
   * @default true
   */
  adaptiveFullscreen?: boolean;

  /**
   * Callback when the modal opens (after animation completes).
   */
  onOpen?: () => void;

  /**
   * Callback when open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether to prevent body scroll when open.
   * @default true
   */
  preventScroll?: boolean;

  /**
   * Modal border radius.
   * @default 'lg'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Whether the modal has shadow.
   * @default true
   */
  shadow?: boolean;

  /**
   * Modal content padding.
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Whether to show divider between header and body.
   * @default false
   */
  divider?: boolean;

  /**
   * Modal z-index.
   * @default 1000
   */
  zIndex?: number;

  /**
   * Whether to disable animations.
   * @default false
   */
  disableAnimation?: boolean;
}

/**
 * Props for the Modal.Header component.
 * Contains the modal title and optional close button.
 */
export interface ModalHeaderProps extends BaseComponentProps, WithChildren {
  /**
   * Whether to show divider below the header.
   * @default false
   */
  divider?: boolean;

  /**
   * Whether to show the close button.
   * @default true
   */
  closable?: boolean;

  /**
   * Callback when close is clicked.
   */
  onClose?: () => void;
}

/**
 * Props for the Modal.Body component.
 * Contains the main modal content.
 */
export interface ModalBodyProps extends BaseComponentProps, WithChildren {
  /**
   * Body padding.
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Props for the Modal.Footer component.
 * Contains action buttons and controls.
 */
export interface ModalFooterProps extends BaseComponentProps, WithChildren {
  /**
   * Whether to show divider above the footer.
   * @default false
   */
  divider?: boolean;

  /**
   * Footer content alignment.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end' | 'space-between';

  /**
   * Footer padding.
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Button configuration for modal actions.
 * Used to define confirm/cancel button behavior.
 */
export interface ModalButtonConfig {
  /** Button text */
  text: ReactNode;
  /** Click callback */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Whether the button is loading */
  loading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button variant */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link';
}

/**
 * Props for the Modal.Confirm component.
 * A specialized modal for confirmation dialogs.
 */
export interface ModalConfirmProps extends Omit<ModalProps, 'footer'> {
  /**
   * Confirmation type (affects icon and styling).
   * @default 'default'
   */
  type?: 'default' | 'info' | 'success' | 'warning' | 'error';

  /**
   * Confirm button text.
   * @default 'Confirm'
   */
  confirmText?: ReactNode;

  /**
   * Cancel button text.
   * @default 'Cancel'
   */
  cancelText?: ReactNode;

  /**
   * Callback when confirmed.
   */
  onConfirm?: () => void | Promise<void>;

  /**
   * Callback when cancelled.
   */
  onCancel?: () => void;

  /**
   * Whether the confirm button is loading.
   */
  confirmLoading?: boolean;

  /**
   * Whether to show the type icon.
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom icon.
   */
  icon?: ReactNode;
}

/**
 * Props for the Modal CloseButton component.
 * Used to render a custom close button within the modal.
 */
export interface ModalCloseButtonProps {
  /** Callback when close is triggered */
  onClose?: () => void;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Size of the close button */
  size?: 'sm' | 'md' | 'lg';
  /** Aria label for accessibility */
  'aria-label'?: string;
}

/**
 * Default values for Modal component props.
 * These are applied when no explicit value is provided.
 */
export const MODAL_DEFAULTS = {
  /** Default modal size */
  size: 'md' as const,
  /** Default modal placement */
  placement: 'center' as const,
  /** Whether close button is shown by default */
  closable: true,
  /** Whether clicking backdrop closes modal by default */
  closeOnBackdropClick: true,
  /** Whether ESC key closes modal by default */
  closeOnEscape: true,
  /** Whether backdrop is shown by default */
  showBackdrop: true,
  /** Whether backdrop is blurred by default */
  blurBackdrop: false,
  /** Whether to prevent body scroll by default */
  preventScroll: true,
  /** Default border radius */
  radius: 'lg' as const,
  /** Whether shadow is shown by default */
  shadow: true,
  /** Default padding size */
  padding: 'lg' as const,
  /** Whether dividers are shown by default */
  divider: false,
  /** Default z-index value */
  zIndex: 1000,
  /** Whether animations are disabled by default */
  disableAnimation: false,
  /** Whether adaptive fullscreen on mobile is enabled by default */
  adaptiveFullscreen: true,
};

/**
 * Size mapping to CSS width values.
 * Uses CSS custom properties for consistent theming.
 */
export const SIZE_MAP: Record<string, string> = {
  /** Extra small: 320px */
  xs: 'var(--ds-modal-xs-width)',
  /** Small: 400px */
  sm: 'var(--ds-modal-sm-width)',
  /** Medium: 500px - default */
  md: 'var(--ds-modal-md-width)',
  /** Large: 640px */
  lg: 'var(--ds-modal-lg-width)',
  /** Extra large: 800px */
  xl: 'var(--ds-modal-xl-width)',
  /** 2X large: 960px */
  '2xl': 'var(--ds-modal-2xl-width)',
  /** 3X large: 1120px */
  '3xl': 'var(--ds-modal-3xl-width)',
  /** 4X large: 1280px */
  '4xl': 'var(--ds-modal-4xl-width)',
  /** 5X large: 1440px */
  '5xl': 'var(--ds-modal-5xl-width)',
  /** Full width: 100% */
  full: 'var(--ds-modal-full-width)',
};

/**
 * Maximum height mapping for each size variant.
 * Uses CSS custom properties for consistent theming.
 */
export const MAX_HEIGHT_MAP: Record<string, string> = {
  xs: 'var(--ds-modal-xs-max-height)',
  sm: 'var(--ds-modal-sm-max-height)',
  md: 'var(--ds-modal-md-max-height)',
  lg: 'var(--ds-modal-lg-max-height)',
  xl: 'var(--ds-modal-xl-max-height)',
  '2xl': 'var(--ds-modal-2xl-max-height)',
  '3xl': 'var(--ds-modal-3xl-max-height)',
  '4xl': 'var(--ds-modal-4xl-max-height)',
  '5xl': 'var(--ds-modal-5xl-max-height)',
  full: 'var(--ds-modal-full-max-height)',
};

/**
 * Padding mapping to CSS values.
 * Uses CSS custom properties for consistent theming.
 */
export const PADDING_MAP: Record<string, string> = {
  /** No padding */
  none: 'var(--ds-modal-padding-none)',
  /** Small padding: 12px */
  sm: 'var(--ds-modal-padding-sm)',
  /** Medium padding: 16px */
  md: 'var(--ds-modal-padding-md)',
  /** Large padding: 24px */
  lg: 'var(--ds-modal-padding-lg)',
};

/**
 * Border radius mapping to CSS values.
 * Uses CSS custom properties for consistent theming.
 */
export const RADIUS_MAP: Record<string, string> = {
  /** No border radius */
  none: 'var(--ds-modal-radius-none)',
  /** Small radius: 4px */
  sm: 'var(--ds-modal-radius-sm)',
  /** Medium radius: 8px */
  md: 'var(--ds-modal-radius-md)',
  /** Large radius: 12px */
  lg: 'var(--ds-modal-radius-lg)',
  /** Extra large radius: 16px */
  xl: 'var(--ds-modal-radius-xl)',
};
