/**
 * @fileoverview Shared type definitions for the icon subsystem.
 *
 * Defines `SvgIconProps` (the base props interface for all icons), the
 * `IconComponent` type alias, and the `ICON_SIZE_MAP` lookup table that
 * maps named size tokens to their CSS variable references.
 */

import type React from 'react';
import type {
  ForwardRefExoticComponent,
  RefAttributes,
  SVGProps,
} from 'react';
import { ICON_SIZE_TOKENS, type IconSizeToken } from '..';

/** Stable size contract retained by the one-minor named-icon compatibility API. */
export type IconSize = IconSizeToken | number;

/**
 * Supplier-independent props for DS-wrapped named icons.
 *
 * The compatibility surface accepts native SVG attributes plus arbitrary CSS
 * sizes, matching its historical runtime behaviour without exposing the type
 * declarations of the underlying renderer.
 */
export interface DSIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref' | 'size'> {
  size?: IconSize | string;
  /** Preserve the historical named-icon option while its aliases migrate. */
  absoluteStrokeWidth?: boolean;
  /** Accessible title rendered as an SVG `<title>` element. */
  title?: string;
}

/** Structural component contract for the one-minor named-icon compatibility API. */
export type DSIconComponent = ForwardRefExoticComponent<
  Omit<DSIconProps, 'ref'> & RefAttributes<SVGSVGElement>
>;

/** Structural input accepted by `createIcon`, including function/class SVG renderers. */
export type DSIconSourceComponent = React.ComponentType<DSIconProps>;

/**
 * Base props for every icon in the DS. Extends native SVG element props with
 * DS-specific `size`, `color`, `title`, and `decorative` options.
 *
 * Named `SvgIconProps` to avoid collision with the broader `IconProps` in
 * component prop types.
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
 * Type for an icon component in the system.
 *
 * Widened to accept DS-wrapped icons and compatible SVG renderers. Any
 * component that takes size, color, strokeWidth, className, style, title, and
 * aria-hidden satisfies this contract.
 */
export type IconComponent = React.ComponentType<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}>;


/**
 * Maps named size tokens to their CSS variable strings.
 * Actual pixel values are defined in `foundation/tokens/css/presentation/components/icon.css`.
 */
export const ICON_SIZE_MAP: Record<string, string> = {
  xs: ICON_SIZE_TOKENS.xs,
  sm: ICON_SIZE_TOKENS.sm,
  md: ICON_SIZE_TOKENS.md,
  lg: ICON_SIZE_TOKENS.lg,
  xl: ICON_SIZE_TOKENS.xl,
  '2xl': ICON_SIZE_TOKENS['2xl'],
};

/** Product-level semantic role, independent of any icon supplier. */
export type IconRole =
  | 'control'
  | 'navigation'
  | 'feature'
  | 'status'
  | 'illustration';

export type IconState = 'idle' | 'active' | 'busy' | 'success' | 'error';

export type IconTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type IconMirroring = boolean | 'auto';
export type SemanticIconSize = IconSizeToken | number;

export interface IconProvenance {
  readonly corpusVersion: number;
  readonly supplier: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly license: string;
  readonly rendering: 'local-ssr';
}
