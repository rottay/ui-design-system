import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';
import { iconSize, type IconSize } from '@/theme/tokens/ts/components/icon';

/**
 * Props base para todos los iconos del sistema Rottay.
 * Renamed to SvgIconProps to avoid conflict with IconProps from common types.
 */
export interface SvgIconProps extends SVGProps<SVGSVGElement> {
  /**
   * Tamaño del icono. Puede ser un valor predefinido o un número en pixels.
   * @default 'md'
   */
  size?: IconSize | number;

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
  SvgIconProps & RefAttributes<SVGSVGElement>
>;


/**
 * Mapeo de tamaños a CSS variables.
 * Los valores reales están definidos en tokens/css/components/icon.css
 */
export const ICON_SIZE_MAP: Record<string, string> = {
  xs: iconSize.xs,
  sm: iconSize.sm,
  md: iconSize.md,
  lg: iconSize.lg,
  xl: iconSize.xl,
  '2xl': iconSize['2xl'],
};
