import React from 'react';

/**
 * Base props for Drawer components
 * These props are supported by ALL engines (titan/AntD, hermes/DaisyUI, apollo/HTML+Tailwind)
 */
export interface DrawerBaseProps {
  /** Whether the drawer is visible */
  open?: boolean;

  /** Callback when drawer is closed */
  onClose?: () => void;

  /** Drawer title */
  title?: React.ReactNode;

  /** Drawer content */
  children?: React.ReactNode;

  /** Additional CSS class name */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;

  /** Element ID */
  id?: string;
}

/**
 * Extended props for Drawer components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface DrawerProps extends DrawerBaseProps {
  /** Placement of the drawer */
  placement?: 'left' | 'right' | 'top' | 'bottom';

  /** Width of the drawer (when placement is left/right) */
  width?: string | number;

  /** Height of the drawer (when placement is top/bottom) */
  height?: string | number;

  /** Whether to show close button */
  closable?: boolean;

  /** Custom close icon */
  closeIcon?: React.ReactNode;

  /** Whether clicking mask (backdrop) closes the drawer */
  maskClosable?: boolean;

  /** Whether the drawer has a backdrop/mask */
  mask?: boolean;

  /** Custom styles for mask */
  maskStyle?: React.CSSProperties;

  /** Whether pressing ESC key closes the drawer */
  keyboard?: boolean;

  /** Whether to destroy child components on close (engine-specific) */
  destroyOnClose?: boolean;

  /** Extra actions area at top-right corner */
  extra?: React.ReactNode;

  /** Footer content */
  footer?: React.ReactNode;

  /** Custom styles for drawer body */
  bodyStyle?: React.CSSProperties;

  /** Custom styles for drawer header */
  headerStyle?: React.CSSProperties;

  /** Custom styles for drawer footer */
  footerStyle?: React.CSSProperties;

  /** Z-index of the drawer */
  zIndex?: number;

  /** Callback after drawer is completely closed (for cleanup) */
  afterOpenChange?: (open: boolean) => void;

  /** Callback when OK button is clicked (for form drawers) */
  onOk?: () => void | Promise<void>;

  /** Callback when Cancel button is clicked (for form drawers) */
  onCancel?: () => void;

  /** Text for OK button */
  okText?: React.ReactNode;

  /** Text for Cancel button */
  cancelText?: React.ReactNode;

  /** Whether OK button is loading */
  confirmLoading?: boolean;

  /** Whether to show default footer with OK/Cancel buttons */
  showFooter?: boolean;
}
