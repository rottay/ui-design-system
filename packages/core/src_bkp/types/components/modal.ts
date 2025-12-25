import React from 'react';

/**
 * Base props for Modal components
 * These props are supported by ALL engines (titan/AntD, hermes/DaisyUI, apollo/HTML+Tailwind)
 */
export interface ModalBaseProps {
  /** Whether the modal is visible */
  open?: boolean;

  /** Callback when modal is closed */
  onClose?: () => void;

  /** Modal title */
  title?: React.ReactNode;

  /** Modal content */
  children?: React.ReactNode;

  /** Modal footer content */
  footer?: React.ReactNode;

  /** Additional CSS class name */
  className?: string;
}

/**
 * Extended props for Modal components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface ModalProps extends ModalBaseProps {
  /** Size variant */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';

  /** Whether to show close button */
  closable?: boolean;

  /** Whether clicking mask (backdrop) closes the modal */
  maskClosable?: boolean;

  /** Whether the modal is vertically centered */
  centered?: boolean;

  /** Whether to destroy child components on close (engine-specific) */
  destroyOnClose?: boolean;

  /** Whether the modal has a backdrop/mask */
  mask?: boolean;

  /** Z-index of the modal */
  zIndex?: number;

  /** Width of the modal (CSS value or number in px) */
  width?: string | number;

  /** Custom styles for modal body */
  bodyStyle?: React.CSSProperties;

  /** Custom styles for modal mask */
  maskStyle?: React.CSSProperties;

  /** Callback when modal is opened */
  onOpen?: () => void;

  /** Callback when OK button is clicked */
  onOk?: () => void | Promise<void>;

  /** Callback when Cancel button is clicked */
  onCancel?: () => void;

  /** Text for OK button */
  okText?: React.ReactNode;

  /** Text for Cancel button */
  cancelText?: React.ReactNode;

  /** Whether OK button is loading */
  confirmLoading?: boolean;

  /** Whether to close modal when OK button is clicked */
  closeOnOk?: boolean;

  /** Whether the modal can be dragged (engine-specific) */
  draggable?: boolean;

  /** Whether to show modal header */
  showHeader?: boolean;

  /** Additional CSS class for modal body */
  bodyClassName?: string;

  /** Additional CSS class for modal footer */
  footerClassName?: string;

  /** Callback after modal is completely closed (for cleanup) */
  afterClose?: () => void;
}

/**
 * Props for confirmation modals (Modal.confirm pattern)
 */
export interface ModalConfirmProps extends Omit<ModalProps, 'children'> {
  /** Confirmation message content */
  content?: React.ReactNode;

  /** Icon to display */
  icon?: React.ReactNode;

  /** Type of confirmation modal */
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';

  /** Whether the modal is a danger action */
  danger?: boolean;
}
