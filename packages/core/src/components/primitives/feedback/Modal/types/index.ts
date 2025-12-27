/**
 * Modal - Type Definitions
 * Extends central types with additional properties for this implementation
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

// Re-export central types for compound components
export type {
  ModalPlacement,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalButtonConfig,
  ModalConfirmProps,
} from '../../../../../types/primitives/feedback/Modal';

// Use Size from central types
import type { Size } from '../../../../../types/common';

/**
 * Modal size variants.
 */
export type ModalSize = Size | '4xl' | '5xl' | 'full';

/**
 * Props for the Modal CloseButton component.
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
 * Props for the Modal component (feedback version).
 * This version includes legacy props for backward compatibility.
 */
export interface ModalProps extends BaseComponentProps, EngineAwareProps {
  /** Whether modal is open */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Modal size */
  size?: ModalSize;
  /** Modal title */
  title?: ReactNode;
  /** Close callback */
  onClose?: () => void;
  /** Open change callback */
  onOpenChange?: (open: boolean) => void;
  /** Whether to show close button */
  closable?: boolean;
  /** Close on overlay click (legacy, use closeOnBackdropClick) */
  closeOnOverlayClick?: boolean;
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Whether modal is centered */
  centered?: boolean;
  /** Custom footer */
  footer?: ReactNode;
  /** Hide footer */
  hideFooter?: boolean;
  /** Children content */
  children?: ReactNode;
  /** Z-index */
  zIndex?: number;
  /** Overlay opacity */
  overlayOpacity?: number;
  /** OK button text */
  okText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** OK button callback */
  onOk?: () => void;
  /** Cancel button callback */
  onCancel?: () => void;
  /** OK button loading state */
  confirmLoading?: boolean;
  /** Description text */
  description?: ReactNode;
  /** Custom header content */
  header?: ReactNode;
  /** Whether to show the backdrop */
  showBackdrop?: boolean;
  /** Whether the backdrop has blur effect */
  blurBackdrop?: boolean;
  /** Modal position on screen */
  placement?: 'center' | 'top' | 'bottom';
  /** Whether the modal takes up the full viewport */
  fullScreen?: boolean;
  /** Callback when the modal opens */
  onOpen?: () => void;
  /** Whether to prevent body scroll when open */
  preventScroll?: boolean;
  /** Modal border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the modal has shadow */
  shadow?: boolean;
  /** Modal content padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to show divider between header and body */
  divider?: boolean;
  /** Whether to disable animations */
  disableAnimation?: boolean;
}

/**
 * Default values for Modal component props.
 */
export const MODAL_DEFAULTS: Partial<ModalProps> = {
  size: 'md',
  closable: true,
  closeOnOverlayClick: true,
  closeOnBackdropClick: true,
  closeOnEscape: true,
  centered: true,
  showBackdrop: true,
  blurBackdrop: false,
  preventScroll: true,
  radius: 'lg',
  shadow: true,
  padding: 'lg',
  divider: false,
  zIndex: 1000,
  overlayOpacity: 0.45,
  disableAnimation: false,
};

/**
 * Padding mapping to CSS values.
 */
export const PADDING_MAP: Record<string, string> = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px',
};
