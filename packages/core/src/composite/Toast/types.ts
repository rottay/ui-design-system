import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
  closable?: boolean;
  icon?: ReactNode;
  position?: ToastPosition;
}

export interface Toast extends Required<Omit<ToastOptions, 'action' | 'icon'>> {
  action?: ToastAction;
  icon?: ReactNode;
  createdAt: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  success: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  error: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  warning: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  info: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  loading: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
