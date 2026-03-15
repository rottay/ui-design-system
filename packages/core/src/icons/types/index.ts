import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';
import { ICON_SIZE_TOKENS, type IconSizeToken } from '../tokens';

/**
 * Props base para todos los iconos del sistema Rottay.
 * Renamed to SvgIconProps to avoid conflict with IconProps from common types.
 */
export interface SvgIconProps extends SVGProps<SVGSVGElement> {
  /**
   * Tamaño del icono. Puede ser un valor predefinido o un número en pixels.
   * @default 'md'
   */
  size?: IconSizeToken | number;

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
  xs: ICON_SIZE_TOKENS.xs,
  sm: ICON_SIZE_TOKENS.sm,
  md: ICON_SIZE_TOKENS.md,
  lg: ICON_SIZE_TOKENS.lg,
  xl: ICON_SIZE_TOKENS.xl,
  '2xl': ICON_SIZE_TOKENS['2xl'],
};
