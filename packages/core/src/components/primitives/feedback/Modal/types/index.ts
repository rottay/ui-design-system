/**
 * Modal - Core Interface
 */

import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';
import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

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
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
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
}

export const MODAL_DEFAULTS: Partial<ModalProps> = {
  size: 'md',
  closable: true,
  closeOnOverlayClick: true,
  closeOnEscape: true,
  centered: true,
  zIndex: 1000,
  overlayOpacity: 0.45,
};
