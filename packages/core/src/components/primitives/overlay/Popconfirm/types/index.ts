/**
 * Popconfirm Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type PopconfirmPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

export type PopconfirmOkType = 'primary' | 'danger' | 'default';

export interface PopconfirmProps {
  /** Title of the confirmation */
  title: ReactNode;
  /** Description text */
  description?: ReactNode;
  /** Callback when confirmed */
  onConfirm?: () => void | Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Text for confirm button */
  okText?: string;
  /** Text for cancel button */
  cancelText?: string;
  /** Type of confirm button */
  okType?: PopconfirmOkType;
  /** Custom icon */
  icon?: ReactNode;
  /** Whether visible (controlled) */
  open?: boolean;
  /** Callback when visibility changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether disabled */
  disabled?: boolean;
  /** Trigger element */
  children: ReactNode;
  /** Placement */
  placement?: PopconfirmPlacement;
  /** Show arrow */
  showArrow?: boolean;
  /** Loading state for confirm button */
  okButtonLoading?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Overlay class name */
  overlayClassName?: string;
  /** Overlay styles */
  overlayStyle?: CSSProperties;
}

export const POPCONFIRM_DEFAULTS: Partial<PopconfirmProps> = {
  okText: 'Yes',
  cancelText: 'No',
  okType: 'primary',
  placement: 'top',
  showArrow: true,
  disabled: false,
  okButtonLoading: false,
};
