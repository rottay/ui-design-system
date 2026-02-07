import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type ToastManagerPreset = 'stacked' | 'minimal';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type?: ToastType;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

export interface ToastManagerProps extends EngineAwareProps {
  preset?: ToastManagerPreset;
  toasts: Toast[];
  position?: ToastPosition;
  onDismiss?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const TOAST_MANAGER_DEFAULTS: Partial<ToastManagerProps> = {
  preset: 'stacked',
  position: 'top-right',
};
