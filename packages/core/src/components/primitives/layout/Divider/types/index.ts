/**
 * Divider - Core Interface
 * A visual separator that can be horizontal or vertical, with optional text content.
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, CSSProperties } from 'react';

/**
 * Orientation of the divider line.
 * - 'horizontal': Creates a horizontal line across the container width
 * - 'vertical': Creates a vertical line across the container height
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Visual style of the divider line.
 * - 'solid': Continuous line
 * - 'dashed': Series of short dashes
 * - 'dotted': Series of dots
 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

/**
 * Position of the text content within the divider.
 * Only applies when children are provided.
 * - 'left': Text aligned to the left
 * - 'center': Text centered (default)
 * - 'right': Text aligned to the right
 */
export type DividerTextPosition = 'left' | 'center' | 'right';

/**
 * Thickness preset for the divider line.
 * - 'thin': 1px line
 * - 'medium': 2px line (default)
 * - 'thick': 3px line
 */
export type DividerThicknessPreset = 'thin' | 'medium' | 'thick';

/**
 * Thickness of the divider line - can be a preset or custom pixel value.
 */
export type DividerThickness = DividerThicknessPreset | number;

/**
 * Spacing/margin preset around the divider.
 * - 'none': No margin
 * - 'xs': Extra small margin (0.25rem)
 * - 'sm': Small margin (0.5rem)
 * - 'md': Medium margin (1rem) - default
 * - 'lg': Large margin (1.5rem)
 * - 'xl': Extra large margin (2rem)
 */
export type DividerSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the Divider component.
 */
export interface DividerProps extends EngineAwareProps {
  /**
   * Orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;

  /**
   * Alias for orientation prop.
   * @default 'horizontal'
   */
  type?: DividerOrientation;

  /**
   * Visual style variant of the divider line.
   * @default 'solid'
   */
  variant?: DividerVariant;

  /**
   * Shorthand for variant="dashed".
   * @default false
   */
  dashed?: boolean;

  /**
   * Optional text or content to display in the center of the divider.
   * Only works with horizontal orientation.
   */
  children?: ReactNode;

  /**
   * Position of the text content.
   * Only applies when children are provided.
   * @default 'center'
   */
  textPosition?: DividerTextPosition;

  /**
   * Alias for textPosition prop (for backwards compatibility with some libraries).
   * @deprecated Use textPosition instead
   */
  orientationMargin?: DividerTextPosition;

  /**
   * Display text without styling (plain text).
   * When true, text won't have extra font styling.
   * @default false
   */
  plain?: boolean;

  /**
   * Color of the divider line.
   * Can be any valid CSS color value.
   */
  color?: string;

  /**
   * Thickness of the divider line.
   * Can be a preset ('thin', 'medium', 'thick') or a custom pixel value.
   * @default 'thin'
   */
  thickness?: DividerThickness;

  /**
   * Spacing (margin) around the divider.
   * @default 'md'
   */
  spacing?: DividerSpacing;

  /**
   * Alias for spacing prop (legacy support).
   * @deprecated Use spacing instead
   */
  margin?: DividerSpacing;

  /**
   * Additional CSS class name(s) for the component.
   */
  className?: string;

  /**
   * Inline CSS styles for the component.
   */
  style?: CSSProperties;

  /**
   * Test ID for testing purposes.
   */
  'data-testid'?: string;
}

/**
 * Default values for the Divider component.
 */
export const DIVIDER_DEFAULTS: Partial<DividerProps> = {
  orientation: 'horizontal',
  variant: 'solid',
  textPosition: 'center',
  plain: false,
  thickness: 'thin',
  spacing: 'md',
  dashed: false,
};

/**
 * Mapping of spacing presets to CSS values.
 */
export const SPACING_MAP: Record<DividerSpacing, string> = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

/**
 * Mapping of thickness presets to CSS values.
 */
export const THICKNESS_MAP: Record<DividerThicknessPreset, string> = {
  thin: '1px',
  medium: '2px',
  thick: '3px',
};

/**
 * Get CSS value for thickness.
 * @param thickness - Thickness value (preset or number)
 * @returns CSS value string
 */
export function getThicknessValue(thickness: DividerThickness | undefined): string {
  if (thickness === undefined) return THICKNESS_MAP.thin;
  if (typeof thickness === 'number') return `${thickness}px`;
  return THICKNESS_MAP[thickness] || THICKNESS_MAP.thin;
}

/**
 * Default colors for different themes/engines.
 */
export const DEFAULT_COLORS = {
  titan: '#d9d9d9',
  hermes: 'oklch(var(--bc) / 0.2)',
  apollo: '#e0e0e0',
};
