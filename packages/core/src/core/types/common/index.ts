import type { CSSProperties, ReactNode } from 'react';

/**
 * Tamaños estándar del sistema Rottay.
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Alias for Size type (Ant Design compatible)
 */
export type SizeType = 'small' | 'middle' | 'large' | 'default';

/**
 * Status types for form controls
 */
export type StatusType = '' | 'error' | 'warning';

/**
 * Variantes semánticas del sistema.
 */
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient';

/**
 * Formas disponibles para componentes.
 */
export type Shape = 'circle' | 'square' | 'rounded';

/**
 * Estados de interacción.
 */
export type InteractionState = 'idle' | 'hover' | 'active' | 'focus' | 'disabled';

/**
 * Direcciones para layouts.
 */
export type Direction = 'horizontal' | 'vertical';

/**
 * Alineaciones.
 */
export type Alignment = 'start' | 'center' | 'end';

/**
 * Props base que todos los componentes del Design System heredan.
 */
export interface BaseComponentProps {
  /** Clase CSS adicional */
  className?: string;
  /** Estilos inline adicionales */
  style?: CSSProperties;
  /** ID del elemento */
  id?: string;
  /** Data attributes para testing */
  'data-testid'?: string;
  /** Accessible label for non-textual or landmark-style containers */
  'aria-label'?: string;
  /** Accessible description relationship for richer semantics */
  'aria-describedby'?: string;
}

/**
 * Props para componentes que soportan estados de loading.
 */
export interface LoadableProps {
  /** Si el componente está en estado de carga */
  loading?: boolean;
  /** Texto alternativo durante carga */
  loadingText?: string;
}

/**
 * Props para componentes que soportan estados disabled.
 */
export interface DisableableProps {
  /** Si el componente está deshabilitado */
  disabled?: boolean;
}

/**
 * Props para componentes con children.
 */
export interface WithChildren {
  children?: ReactNode;
}

/**
 * Props para componentes clickeables.
 */
export interface ClickableProps {
  /** Si el componente es clickeable */
  clickable?: boolean;
  /** Callback cuando se hace click */
  onClick?: () => void;
}

/**
 * Props para componentes con estados de error.
 */
export interface ErrorableProps {
  /** Si el componente tiene un error */
  error?: boolean;
  /** Mensaje de error */
  errorMessage?: string;
}

/**
 * Props para componentes con label.
 */
export interface LabeledProps {
  /** Etiqueta del componente */
  label?: string;
  /** Texto de ayuda */
  helperText?: string;
  /** Si el campo es requerido */
  required?: boolean;
}

/**
 * Props para componentes con placeholder.
 */
export interface PlaceholderProps {
  /** Texto placeholder */
  placeholder?: string;
}

/**
 * Props para componentes con valor controlado.
 */
export interface ControlledProps<T = string> {
  /** Valor actual */
  value?: T;
  /** Valor por defecto (no controlado) */
  defaultValue?: T;
  /** Callback cuando cambia el valor */
  onChange?: (value: T) => void;
}

/**
 * Props para componentes que pueden ser borrados.
 */
export interface ClearableProps {
  /** Si el componente puede ser borrado */
  clearable?: boolean;
  /** Callback cuando se borra */
  onClear?: () => void;
}

/**
 * Props para componentes con icono.
 */
export interface IconProps {
  /** Icono a mostrar */
  icon?: ReactNode;
  /** Posición del icono */
  iconPosition?: 'start' | 'end';
}

/**
 * Props para componentes con bordes.
 */
export interface BorderedProps {
  /** Si mostrar borde */
  bordered?: boolean;
}

/**
 * Props para componentes con sombra.
 */
export interface ShadowedProps {
  /** Si mostrar sombra */
  shadowed?: boolean;
}

/**
 * Posiciones absolutas para elementos overlay.
 */
export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'left-center'
  | 'right-center'
  | 'center';

/**
 * Densidad de espaciado.
 */
export type Density = 'compact' | 'normal' | 'comfortable';

/**
 * Color token del sistema.
 */
export type ColorToken =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
