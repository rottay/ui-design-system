import type { ReactNode, MouseEvent } from 'react';
import type { BaseComponentProps, Size, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Tamaños específicos de Modal.
 */
export type ModalSize = Size | '4xl' | '5xl' | 'full';

/**
 * Posición del Modal.
 */
export type ModalPlacement = 'center' | 'top' | 'bottom';

/**
 * Props del componente Modal.
 */
export interface ModalProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Si el modal está abierto.
   */
  open: boolean;

  /**
   * Callback cuando el modal debe cerrarse.
   */
  onClose: () => void;

  /**
   * Tamaño del modal.
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Título del modal.
   */
  title?: ReactNode;

  /**
   * Descripción del modal.
   */
  description?: ReactNode;

  /**
   * Contenido del header del modal.
   */
  header?: ReactNode;

  /**
   * Contenido del footer del modal.
   */
  footer?: ReactNode;

  /**
   * Si el modal puede ser cerrado clickeando el backdrop.
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Si el modal puede ser cerrado presionando ESC.
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Si mostrar el botón de cerrar (X).
   * @default true
   */
  closable?: boolean;

  /**
   * Si mostrar el backdrop.
   * @default true
   */
  showBackdrop?: boolean;

  /**
   * Si el backdrop está blur.
   * @default false
   */
  blurBackdrop?: boolean;

  /**
   * Posición del modal.
   * @default 'center'
   */
  placement?: ModalPlacement;

  /**
   * Si el modal ocupa todo el viewport.
   */
  fullScreen?: boolean;

  /**
   * Callback cuando el modal se abre (animación completa).
   */
  onOpen?: () => void;

  /**
   * Callback cuando el modal se cierra (animación completa).
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Si prevenir el scroll del body cuando está abierto.
   * @default true
   */
  preventScroll?: boolean;

  /**
   * Radio del borde del modal.
   * @default 'lg'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Si el modal tiene sombra.
   * @default true
   */
  shadow?: boolean;

  /**
   * Padding del contenido del modal.
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Si mostrar divisor entre header y body.
   * @default false
   */
  divider?: boolean;

  /**
   * Z-index del modal.
   * @default 1000
   */
  zIndex?: number;

  /**
   * Si deshabilitar animaciones.
   * @default false
   */
  disableAnimation?: boolean;
}

/**
 * Props del componente Modal.Header.
 */
export interface ModalHeaderProps extends BaseComponentProps, WithChildren {
  /**
   * Si mostrar divisor debajo del header.
   * @default false
   */
  divider?: boolean;

  /**
   * Si mostrar el botón de cerrar.
   * @default true
   */
  closable?: boolean;

  /**
   * Callback cuando se hace click en cerrar.
   */
  onClose?: () => void;
}

/**
 * Props del componente Modal.Body.
 */
export interface ModalBodyProps extends BaseComponentProps, WithChildren {
  /**
   * Padding del body.
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Props del componente Modal.Footer.
 */
export interface ModalFooterProps extends BaseComponentProps, WithChildren {
  /**
   * Si mostrar divisor encima del footer.
   * @default false
   */
  divider?: boolean;

  /**
   * Alineación del contenido del footer.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end' | 'space-between';

  /**
   * Padding del footer.
   * @default 'lg'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Configuración de botones del Modal.
 */
export interface ModalButtonConfig {
  /** Texto del botón */
  text: ReactNode;
  /** Callback onClick */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Si el botón está en loading */
  loading?: boolean;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  /** Variante del botón */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link';
}

/**
 * Props del componente Modal.Confirm (modal de confirmación).
 */
export interface ModalConfirmProps extends Omit<ModalProps, 'footer'> {
  /**
   * Tipo de confirmación.
   * @default 'default'
   */
  type?: 'default' | 'info' | 'success' | 'warning' | 'error';

  /**
   * Texto del botón de confirmar.
   * @default 'Confirmar'
   */
  confirmText?: ReactNode;

  /**
   * Texto del botón de cancelar.
   * @default 'Cancelar'
   */
  cancelText?: ReactNode;

  /**
   * Callback cuando se confirma.
   */
  onConfirm?: () => void | Promise<void>;

  /**
   * Callback cuando se cancela.
   */
  onCancel?: () => void;

  /**
   * Si el botón de confirmar está en loading.
   */
  confirmLoading?: boolean;

  /**
   * Si mostrar el icono según el tipo.
   * @default true
   */
  showIcon?: boolean;

  /**
   * Icono personalizado.
   */
  icon?: ReactNode;
}
