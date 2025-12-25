/**
 * Toast - Core Interface
 */

import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';
import type { ReactNode } from 'react';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastProps extends BaseComponentProps, EngineAwareProps {
  variant?: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
  position?: ToastPosition;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxVisible?: number;
  defaultDuration?: number;
}

export interface UseToastReturn {
  toast: (props: Omit<ToastProps, 'onClose'>) => string;
  success: (message: string, options?: Partial<ToastProps>) => string;
  error: (message: string, options?: Partial<ToastProps>) => string;
  warning: (message: string, options?: Partial<ToastProps>) => string;
  info: (message: string, options?: Partial<ToastProps>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const TOAST_DEFAULTS: Partial<ToastProps> = {
  variant: 'default',
  duration: 3000,
  closable: true,
  position: 'top-right',
};
