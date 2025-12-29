import type { ReactNode } from 'react';
import type { BaseComponentProps, Variant, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Variantes de Alert.
 */
export type AlertVariant = Variant | 'info';

/**
 * Tipos de Alert.
 */
export type AlertType = 'default' | 'filled' | 'outlined' | 'soft';

/**
 * Props del componente Alert.
 */
export interface AlertProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Variante de color del alert.
   * @default 'info'
   */
  variant?: AlertVariant;

  /**
   * Tipo de estilo del alert.
   * @default 'default'
   */
  type?: AlertType;

  /**
   * Título del alert.
   */
  title?: ReactNode;

  /**
   * Descripción/mensaje del alert.
   */
  description?: ReactNode;

  /**
   * Icono del alert.
   */
  icon?: ReactNode;

  /**
   * Si mostrar el icono por defecto según la variante.
   * @default true
   */
  showIcon?: boolean;

  /**
   * Si el alert puede ser cerrado.
   * @default false
   */
  closable?: boolean;

  /**
   * Callback cuando se cierra el alert.
   */
  onClose?: () => void;

  /**
   * Texto del botón de cerrar.
   */
  closeText?: ReactNode;

  /**
   * Acciones del alert (botones, links, etc).
   */
  actions?: ReactNode;

  /**
   * Si el alert tiene borde.
   * @default true
   */
  bordered?: boolean;

  /**
   * Radio del borde del alert.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Si el alert tiene sombra.
   * @default false
   */
  shadow?: boolean;

  /**
   * Banner mode (full width, sin border radius).
   * @default false
   */
  banner?: boolean;
}

/**
 * Props del componente Alert.Title.
 */
export interface AlertTitleProps extends BaseComponentProps, WithChildren {
  /**
   * Peso de la fuente del título.
   * @default 'semibold'
   */
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

/**
 * Props del componente Alert.Description.
 */
export interface AlertDescriptionProps extends BaseComponentProps, WithChildren {
  /**
   * Tamaño de la fuente de la descripción.
   * @default 'sm'
   */
  fontSize?: 'xs' | 'sm' | 'md';
}

/**
 * Configuración de iconos por variante.
 */
export interface AlertIconConfig {
  /** Variante */
  variant: AlertVariant;
  /** Icono por defecto */
  icon: ReactNode;
}
