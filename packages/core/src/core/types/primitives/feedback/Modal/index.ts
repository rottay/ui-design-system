import type { ReactNode, MouseEvent } from 'react';
import type { BaseComponentProps, Size, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Modal size variants.
 * Extends base sizes with additional large variants and full width option.
 */
export type ModalSize = Size | '4xl' | '5xl' | 'full';

/**
 * Modal placement options.
 * Determines where the modal appears on the screen.
 */
export type ModalPlacement = 'center' | 'top' | 'bottom';

/**
 * Props for the Modal component.
 * A flexible dialog overlay for displaying content that requires user attention.
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm Action">
 *   <Modal.Body>Are you sure you want to proceed?</Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *     <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
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
 *
 * @example
 * ```tsx
 * <Modal.Confirm
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Delete Item"
 *   type="warning"
 *   onConfirm={handleDelete}
 * >
 *   Are you sure you want to delete this item?
 * </Modal.Confirm>
 * ```
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
