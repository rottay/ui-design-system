import type { ReactNode } from 'react';
import type { BaseComponentProps, Variant } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Variantes de Toast.
 */
export type ToastVariant = Variant | 'info';

/**
 * Posición del Toast.
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Props del componente Toast.
 */
export interface ToastProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Variante de color del toast.
   * @default 'default'
   */
  variant?: ToastVariant;

  /**
   * Título del toast.
   */
  title?: ReactNode;

  /**
   * Descripción/mensaje del toast.
   */
  description?: ReactNode;

  /**
   * Icono del toast.
   */
  icon?: ReactNode;

  /**
   * Si el toast puede ser cerrado.
   * @default true
   */
  closable?: boolean;

  /**
   * Callback cuando se cierra el toast.
   */
  onClose?: () => void;

  /**
   * Duración en ms antes de auto-cerrar.
   * 0 = no auto-cierra.
   * @default 5000
   */
  duration?: number;

  /**
   * Si el toast está visible.
   * @default true
   */
  visible?: boolean;

  /**
   * Acción del toast (botón, link, etc).
   */
  action?: ToastAction;

  /**
   * Si mostrar barra de progreso de duración.
   * @default false
   */
  showProgress?: boolean;

  /**
   * Si pausar el auto-cierre al hacer hover.
   * @default true
   */
  pauseOnHover?: boolean;

  /**
   * Radio del borde del toast.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Si el toast tiene sombra.
   * @default true
   */
  shadow?: boolean;

  /**
   * Contenido personalizado del toast.
   */
  children?: ReactNode;
}

/**
 * Acción del Toast.
 */
export interface ToastAction {
  /** Texto de la acción */
  label: ReactNode;
  /** Callback onClick */
  onClick: () => void;
  /** Si la acción cierra el toast */
  closeOnClick?: boolean;
}

/**
 * Configuración del ToastProvider.
 */
export interface ToastProviderConfig {
  /**
   * Posición por defecto de los toasts.
   * @default 'top-right'
   */
  position?: ToastPosition;

  /**
   * Duración por defecto de los toasts.
   * @default 5000
   */
  duration?: number;

  /**
   * Máximo de toasts simultáneos.
   * @default 5
   */
  max?: number;

  /**
   * Gap entre toasts.
   * @default 8
   */
  gap?: number;

  /**
   * Si pausar al hacer hover.
   * @default true
   */
  pauseOnHover?: boolean;

  /**
   * Si los toasts nuevos aparecen arriba.
   * @default false
   */
  reverseOrder?: boolean;
}

/**
 * Opciones para crear un toast con el hook useToast.
 */
export interface ToastOptions extends Omit<ToastProps, 'visible' | 'onClose'> {
  /**
   * ID único del toast.
   */
  id?: string;

  /**
   * Posición del toast (override del provider).
   */
  position?: ToastPosition;
}

/**
 * Funciones del hook useToast.
 */
export interface ToastMethods {
  /** Muestra un toast */
  show: (options: ToastOptions) => string;
  /** Muestra un toast de éxito */
  success: (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>) => string;
  /** Muestra un toast de error */
  error: (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>) => string;
  /** Muestra un toast de warning */
  warning: (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>) => string;
  /** Muestra un toast de info */
  info: (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>) => string;
  /** Cierra un toast por ID */
  dismiss: (id: string) => void;
  /** Cierra todos los toasts */
  dismissAll: () => void;
  /** Actualiza un toast existente */
  update: (id: string, options: Partial<ToastOptions>) => void;
}

/**
 * Estado interno del Toast.
 */
export interface ToastState {
  /** ID único del toast */
  id: string;
  /** Si el toast está visible */
  visible: boolean;
  /** Timestamp de creación */
  createdAt: number;
  /** Si está pausado (hover) */
  paused: boolean;
  /** Opciones del toast */
  options: ToastOptions;
}
