import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';

/**
 * Props base para todos los iconos del sistema Rottay.
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  /**
   * Tamaño del icono. Puede ser un valor predefinido o un número en pixels.
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

  /**
   * Color del icono. Usa 'currentColor' para heredar del padre.
   * @default 'currentColor'
   */
  color?: string;

  /**
   * Título para accesibilidad. Si se proporciona, el icono será visible para screen readers.
   */
  title?: string;

  /**
   * Si el icono es puramente decorativo (no necesita ser anunciado por screen readers).
   * @default true
   */
  decorative?: boolean;
}

/**
 * Tipo para un componente de icono del sistema.
 */
export type IconComponent = ForwardRefExoticComponent<
  IconProps & RefAttributes<SVGSVGElement>
>;

/**
 * Mapeo de tamaños a pixels.
 */
export const ICON_SIZE_MAP: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};
